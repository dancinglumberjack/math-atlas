const $=id=>document.getElementById(id);
const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colors=['#21634f','#b3764b','#849281','#507da2'];
const tickFmt=n=>Math.abs(n)>0&&Math.abs(n)<.001?Number(n.toPrecision(2)).toExponential():fmt(Number(n.toPrecision(3)));
let VW=600,VH=310,current=null,params={},model=null,revealed=1,mode='understand',filter='all',visualView='isometric',exploded=false,wrongAttempts=0;
let progress={},lastLesson='',storageOK=true,saveTimer=0,pendingProblem=null;
let savedPlace=null,resumeSaved=true;
try{savedPlace=JSON.parse(localStorage.getItem('math-atlas-place-v1')||'null');}catch{}
try{progress=JSON.parse(localStorage.getItem('math-atlas-progress-v1')||'{}');if(!progress||Array.isArray(progress)||typeof progress!=='object')progress={};lastLesson=localStorage.getItem('math-atlas-last-v1')||'';}catch{storageOK=false;progress={};}
const text=(x,y,s,cls='',anchor='middle')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${escapeText(s)}</text>`;
const line=(x1,y1,x2,y2,color='#a8b6a0',width=1,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''}/>`;
const circle=(x,y,r,fill='#21634f',stroke='none',sw=1)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const box=(x,y,w,h,fill='#dce8d2',stroke='#9eb392',r=0)=>`<rect x="${x}" y="${y}" width="${Math.max(0,w)}" height="${Math.max(0,h)}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const poly=(points,fill='#dce8d2',stroke='#21634f',sw=2)=>`<polygon points="${points.map(p=>p.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
function wrapSvg(body,description){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="${escapeText(description)}"><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#b3764b"/></marker></defs>${body}</svg>`;}
function plot(d){
 let [xmin,xmax]=d.domain,[ymin,ymax]=d.bounds;const left=51,right=VW-24,top=24,bottom=VH-40;
 let x0=left,x1=right,y0=top,y1=bottom;
 if(d.equal){const scale=Math.min((right-left)/(xmax-xmin),(bottom-top)/(ymax-ymin));const w=scale*(xmax-xmin),h=scale*(ymax-ymin);x0=(VW-w)/2;x1=x0+w;y0=(VH-30-h)/2;y1=y0+h;}
 const X=x=>x0+(x-xmin)/(xmax-xmin)*(x1-x0),Y=y=>y1-(y-ymin)/(ymax-ymin)*(y1-y0);
 let out=`<defs><clipPath id="plot-clip">${box(x0,y0,x1-x0,y1-y0,'white','none')}</clipPath></defs>`;
 const nt=VW<400?4:6;
 for(let i=0;i<=nt;i++){
  const x=xmin+(xmax-xmin)*i/nt,y=ymin+(ymax-ymin)*i/nt;
  out+=line(X(x),y0,X(x),y1,'#e3e8dc')+line(x0,Y(y),x1,Y(y),'#e3e8dc');
  out+=text(X(x),y1+19,tickFmt(x))+text(x0-8,Y(y)+4,tickFmt(y),'','end');
 }
 const zx=X(Math.max(xmin,Math.min(xmax,0))),zy=Y(Math.max(ymin,Math.min(ymax,0)));
 out+=line(x0,zy,x1,zy,'#8c9e82',1.3)+line(zx,y0,zx,y1,'#8c9e82',1.3);
 out+=text(x1-2,y1+35,d.xLabel||'x','','end')+text(x0-8,y0-8,d.yLabel||'y','','end');
 out+='<g clip-path="url(#plot-clip)">';
 if(d.rectangles){const {n,b}=d.rectangles,dx=b/n;for(let i=0;i<n;i++)out+=box(X(i*dx),Y((i+1)*dx),X((i+1)*dx)-X(i*dx),Y(0)-Y((i+1)*dx),'#e5d1af','#c29b65');}
 if(d.asymptote!==undefined)out+=line(X(d.asymptote),y0,X(d.asymptote),y1,'#b3764b',1.5,'5 5');
 (d.functions||[]).forEach((fn,index)=>{
  let path='',pen=false,lastY=null,lastX=null;
  const count=360;
  for(let i=0;i<=count;i++){
   const x=xmin+(xmax-xmin)*i/count,y=fn(x),cross=(d.breaks||[]).some(b=>lastX!==null&&lastX<b&&x>=b);
   if(!Number.isFinite(y)||y<ymin-(ymax-ymin)*2||y>ymax+(ymax-ymin)*2||cross){pen=false;lastY=null;lastX=x;continue;}
   if(lastY!==null&&Math.abs(Y(y)-lastY)>VH*.8)pen=false;
   path+=(pen?'L':'M')+X(x).toFixed(2)+' '+Y(y).toFixed(2);pen=true;lastY=Y(y);lastX=x;
  }
  out+=`<path d="${path}" fill="none" stroke="${colors[index%colors.length]}" stroke-width="${index===0?2.8:2}"${index===2?' stroke-dasharray="5 4"':''}/>`;
 });
 if(d.vertical!==undefined)out+=line(X(d.vertical),y0,X(d.vertical),y1,'#b3764b',2,'4 4');
 if(d.vector)out+=`<path d="M${X(0)} ${Y(0)}L${X(d.vector[0])} ${Y(d.vector[1])}" fill="none" stroke="#b3764b" stroke-width="3" marker-end="url(#arrow)"/>`;
 (d.points||[]).forEach(([x,y],i)=>{
  if(d.residuals)out+=line(X(x),Y(y),X(x),Y(d.functions[0](x)),'#b3764b',2);
  else out+=line(X(x),zy,X(x),Y(y),'#b8c5b0',1,'3 4')+line(zx,Y(y),X(x),Y(y),'#b8c5b0',1,'3 4');
  out+=circle(X(x),Y(y),5,i?'#b3764b':'#21634f','#fdfdf8',1.5);
 });
 if(d.hole)out+=circle(X(d.hole[0]),Y(d.hole[1]),6,'#fdfdf8','#21634f',2);
 out+='</g>';
 if(d.points?.some(([x,y])=>x<xmin||x>xmax||y<ymin||y>ymax))out+=text(VW/2,14,'Some marked values lie beyond this window.');
 return out;
}
function bars(d){
 const min=Math.min(0,...d.values),max=Math.max(1,...d.values),L=50,R=VW-28,T=35,B=VH-55,Y=v=>B-(v-min)/(max-min)*(B-T),step=(R-L)/d.values.length,w=Math.min(70,step*.65);
 let out=line(L,Y(0),R,Y(0),'#899e80',1.5);
 d.values.forEach((v,i)=>{const x=L+step*(i+.5);out+=box(x-w/2,Math.min(Y(0),Y(v)),w,Math.abs(Y(v)-Y(0)),i===1?'#e6d2af':'#b7d0b1',i===1?'#b3764b':'#21634f',3)+text(x,Y(v)+(v<0?18:-9),fmt(v),'label')+text(x,B+24,d.labels[i]);});
 return out;
}
function numberline(d){
 const low=Math.min(-2,d.a,d.end)-2,high=Math.max(2,d.a,d.end)+2,L=35,R=VW-35,Y=185,X=x=>L+(x-low)/(high-low)*(R-L);let out=line(L,Y,R,Y,'#829579',1.5);
 const step=Math.max(1,Math.ceil((high-low)/(VW<400?7:13)));
 for(let n=Math.ceil(low/step)*step;n<=high;n+=step)out+=line(X(n),Y-5,X(n),Y+5)+text(X(n),Y+24,n);
 out+=line(X(d.a),Y-20,X(d.end),Y-20,'#b3764b',4)+circle(X(d.a),Y,6,'#21634f')+circle(X(d.end),Y,6,'#b3764b');
 out+=text(X(d.a),Y-42,'start: '+fmt(d.a),'label')+text(X(d.end),Y+53,'end: '+fmt(d.end),'label');
 out+=text(VW/2,66,d.mode==='distance'?`distance = ${Math.abs(d.b)}`:`move ${Math.abs(d.b)} ${d.b<0?'left':'right'}`,'big-label');
 return out;
}
function fractionBars(d){
 const wholeCount=Math.max(1,...d.rows.map(r=>Math.ceil(r.n/r.d))),left=38,right=VW-28,wholeW=(right-left)/wholeCount;
 let out='';d.rows.forEach((r,i)=>{const y=55+i*78;out+=text(left,y-10,r.label,'label','start');for(let j=0;j<wholeCount*r.d;j++)out+=box(left+j*wholeW/r.d,y,wholeW/r.d,30,j<r.n?'#b8d1ae':'#f4f6ee','#a9ba9e');for(let k=0;k<=wholeCount;k++)out+=line(left+k*wholeW,y-2,left+k*wholeW,y+33,'#5c7c50',1.4);});return out;
}
function fractionGrid(d){
 const cell=Math.min((VW-65)/d.cols,205/d.rows,29),w=cell*d.cols,h=cell*d.rows,x=(VW-w)/2,y=(VH-h)/2;let out='';
 for(let r=0;r<d.rows;r++)for(let c=0;c<d.cols;c++){
  const overlap=d.count!==undefined?r*d.cols+c<d.count:c<d.a&&r<d.b;
  const strip=d.count===undefined&&(c<d.a||r<d.b);
  out+=box(x+c*cell,y+r*cell,cell,cell,overlap?'#81ad81':strip?'#d8e6ce':'#f7f8f0','#b6c7aa');
 }
 return out+text(VW/2,VH-18,`${d.cols*d.rows} equal cells in one whole`,'label');
}
function shape(d){
 let out='';const cx=VW/2,cy=VH/2,s=Math.min((VW-110)/20,(VH-85)/16,22);
 if(['rectangle','triangle','trapezoid','areaSplit','binomialArea'].includes(d.kind)){}
 if(d.kind==='rectangle'||d.kind==='triangle'){
  const scale=Math.min((VW-95)/d.a,(VH-90)/d.b,37),w=d.a*scale,h=d.b*scale,x=(VW-w)/2,y=(VH-h)/2;
  if(d.kind==='rectangle'){
   out+=box(x,y,w,h,'#dfebd5','#21634f');
   for(let i=1;i<Math.ceil(d.a);i++)if(i<d.a)out+=line(x+i*scale,y,x+i*scale,y+h,'#b9cdae');
   for(let j=1;j<Math.ceil(d.b);j++)if(j<d.b)out+=line(x,y+j*scale,x+w,y+j*scale,'#b9cdae');
  }else{out+=box(x,y,w,h,'#eef1e7','#a8b99d')+poly([[x,y+h],[x+w,y+h],[x,y]],'#c9dfbc');}
  out+=text(cx,y+h+25,`base ${fmt(d.a)}`,'label')+text(12,cy,fmt(d.b),'label','start');
 }else if(d.kind==='trapezoid'){
  const sc=Math.min((VW-90)/Math.max(d.a,d.b),(VH-90)/d.c,35),bw=d.a*sc,tw=d.b*sc,h=d.c*sc;
  out+=poly([[cx-bw/2,cy+h/2],[cx+bw/2,cy+h/2],[cx+tw/2,cy-h/2],[cx-tw/2,cy-h/2]])+line(cx,cy-h/2,cx,cy+h/2,'#b3764b',2,'4 4');
  out+=text(cx,cy+h/2+24,`base ${d.a}`,'label')+text(cx,cy-h/2-13,`base ${d.b}`,'label')+text(cx+9,cy+5,`h=${d.c}`,'label','start');
 }else if(d.kind==='circle'||d.kind==='arc'){
  const rr=Math.min(VW*.31,VH*.34),angle=d.kind==='arc'?d.b:0;
  out+=circle(cx,cy,rr,'#e6efdd','#21634f',2)+line(cx,cy,cx+rr,cy,'#b3764b',2)+circle(cx,cy,3);
  out+=text(cx+rr*.45,cy-10,`r=${d.a}`,'label');
  if(d.kind==='arc'){
   const x=cx+rr*Math.cos(rad(angle)),y=cy-rr*Math.sin(rad(angle));
   out+=line(cx,cy,x,y,'#b3764b',2)+`<path d="M${cx+rr} ${cy}A${rr} ${rr} 0 ${angle>180?1:0} 0 ${x} ${y}" fill="none" stroke="#b3764b" stroke-width="6"/>`+text(cx,cy+30,`${angle}°`,'label');
  }
 }else if(d.kind==='pythagorean'||d.kind==='rightTrig'){
  const scale=Math.min((VW-100)/d.a,(VH-115)/d.b,40),x=(VW-d.a*scale)/2,y=VH-78,w=d.a*scale,h=d.b*scale;
  out+=poly([[x,y],[x+w,y],[x+w,y-h]])+box(x+w-10,y-10,10,10,'none','#21634f');
  out+=text(x+w/2,y+24,fmt(d.a),'label')+text(x+w+12,y-h/2,fmt(d.b),'label','start')+text(x+w/2-10,y-h/2-12,fmt(d.c),'label');
  if(d.kind==='rightTrig')out+=text(x+30,y-10,`${d.angle}°`,'label');
  else{const total=d.c*d.c,xx=34,yy=VH-28,ww=VW-68;out+=box(xx,yy,ww*d.a*d.a/total,10,'#a3c399','none')+box(xx+ww*d.a*d.a/total,yy,ww*d.b*d.b/total,10,'#e0c39b','none')+text(cx,yy-9,'a² + b² = c²');}
 }else if(d.kind==='angleTriangle'){
  const A=rad(d.a),B=rad(d.b),base=1,Cx=1/(1+Math.tan(A)/Math.tan(B)),Cy=Cx*Math.tan(A),sc=Math.min((VW-95)/base,(VH-95)/Cy),x=(VW-sc)/2,y=(VH+Cy*sc)/2;
  out+=poly([[x,y],[x+sc,y],[x+Cx*sc,y-Cy*sc]])+text(x+20,y+22,`${d.a}°`,'label')+text(x+sc-20,y+22,`${d.b}°`,'label')+text(x+Cx*sc,y-Cy*sc-13,`${d.c}°`,'label');
 }else if(d.kind==='angles'){
  const rr=Math.min(90,VW*.3),x=cx,y=cy+30,x2=x+rr*Math.cos(rad(d.a)),y2=y-rr*Math.sin(rad(d.a));
  out+=line(30,y,VW-30,y,'#21634f',2)+line(x,y,x2,y2,'#b3764b',3)+circle(x,y,4)+text(cx,60,`${d.a}° + ${180-d.a}° = 180°`,'big-label');
 }else if(d.kind==='polygon'){
  const r=Math.min(105,VW*.34),pts=range(d.n,i=>[cx+r*Math.cos(2*Math.PI*i/d.n-Math.PI/2),cy+r*Math.sin(2*Math.PI*i/d.n-Math.PI/2)]);
  out+=poly(pts);for(let i=2;i<d.n-1;i++)out+=line(...pts[0],...pts[i],'#b3764b',1.3,'4 4');
  out+=text(cx,VH-18,`${d.n-2} triangles`,'label');
 }else if(d.kind==='similarSquares'){
  const sc=Math.min((VW-90)/(d.a+d.a*d.b),(VH-70)/(d.a*Math.max(1,d.b)),35),w=d.a*sc,w2=w*d.b,gap=32,x=(VW-w-w2-gap)/2;
  out+=box(x,cy-w/2,w,w,'#dce7d2','#8da681')+box(x+w+gap,cy-w2/2,w2,w2,'#b9d3ae','#21634f')+text(x+w/2,cy+w/2+24,`side ${fmt(d.a)}`,'label')+text(x+w+gap+w2/2,cy+w2/2+24,`side ${fmt(d.a*d.b)}`,'label');
 }else if(d.kind==='prism'){
  const sc=Math.min((VW-100)/(d.a+d.b*.65),(VH-95)/(d.c+d.b*.35),32),x=cx-d.a*sc/2-d.b*sc*.3,y=cy+d.c*sc/2,dx=d.b*sc*.6,dy=-d.b*sc*.35,w=d.a*sc,h=d.c*sc;
  out+=poly([[x,y-h],[x+w,y-h],[x+w+dx,y-h+dy],[x+dx,y-h+dy]],'#eaf1df','#819e75')+poly([[x+w,y],[x+w+dx,y+dy],[x+w+dx,y-h+dy],[x+w,y-h]],'#a9c59c','#819e75')+box(x,y-h,w,h,'#cddfc0','#819e75');
  for(let i=1;i<d.c;i++)out+=line(x,y-i*sc,x+w,y-i*sc,'#a8c097');
  out+=text(x+w/2,y+22,`length ${d.a}`,'label')+text(x+w+dx+10,cy,`h ${d.c}`,'label','start')+text(x+w+dx/2,y+dy/2+20,`w ${d.b}`,'label');
 }else if(d.kind==='net'){
  const sc=Math.min((VW-60)/(2*d.a+2*d.b),(VH-55)/(d.c+2*d.b),28),x=(VW-(2*d.a+2*d.b)*sc)/2,y=(VH-(d.c+2*d.b)*sc)/2+d.b*sc;
  let pos=x;[d.a,d.b,d.a,d.b].forEach((w,i)=>{out+=box(pos,y,w*sc,d.c*sc,i%2?'#e5d2b1':'#d4e5c7','#8da57f');out+=text(pos+w*sc/2,y+d.c*sc/2+4,`${w}×${d.c}`);pos+=w*sc;});
  out+=box(x,y-d.b*sc,d.a*sc,d.b*sc,'#b4cfa7','#8da57f')+box(x,y+d.c*sc,d.a*sc,d.b*sc,'#b4cfa7','#8da57f')+text(x+d.a*sc/2,y-d.b*sc/2,`${d.a}×${d.b}`)+text(x+d.a*sc/2,y+d.c*sc+d.b*sc/2,`${d.a}×${d.b}`);
 }else if(['cylinder','cone','sphere'].includes(d.kind)){
  const radius=Math.min((VW-100)/2,80,d.a*17),h=d.kind==='sphere'?radius*2:Math.min(190,d.b*19),x=cx,y=cy+h/2,ry=radius*.28;
  if(d.kind==='sphere')out+=circle(cx,cy,radius,'#dbe8d1','#21634f',2)+`<ellipse cx="${cx}" cy="${cy}" rx="${radius}" ry="${ry}" fill="none" stroke="#90ac81"/>`+line(cx,cy,cx+radius,cy,'#b3764b',2);
  else if(d.kind==='cylinder')out+=`<path d="M${x-radius} ${y-h}V${y}A${radius} ${ry} 0 0 0 ${x+radius} ${y}V${y-h}" fill="#cddfbe" stroke="#21634f" stroke-width="2"/><ellipse cx="${x}" cy="${y-h}" rx="${radius}" ry="${ry}" fill="#e8f0de" stroke="#21634f" stroke-width="2"/>`+line(x,y-h,x+radius,y-h,'#b3764b',2);
  else out+=`<path d="M${x} ${y-h}L${x-radius} ${y}A${radius} ${ry} 0 0 0 ${x+radius} ${y}Z" fill="#d1e2c3" stroke="#21634f" stroke-width="2"/>`+line(x,y-h,x,y,'#b3764b',1.5,'4 4')+line(x,y,x+radius,y,'#b3764b',2);
  out+=text(cx,VH-12,`radius ${d.a}${d.kind==='sphere'?'':` · height ${d.b}`}`,'label');
 }else if(d.kind==='cosineTriangle'){
  const pts=[[0,0],[d.a,0],[d.b*Math.cos(rad(d.c)),d.b*Math.sin(rad(d.c))]],minX=Math.min(...pts.map(p=>p[0])),maxX=Math.max(...pts.map(p=>p[0])),maxY=pts[2][1],sc=Math.min((VW-90)/(maxX-minX),(VH-90)/maxY),X=x=>(VW-(maxX-minX)*sc)/2+(x-minX)*sc,Y=y=>(VH+maxY*sc)/2-y*sc;
  out+=poly(pts.map(([x,y])=>[X(x),Y(y)]))+text((X(0)+X(d.a))/2,Y(0)+24,`a=${d.a}`,'label')+text((X(0)+X(pts[2][0]))/2-15,(Y(0)+Y(pts[2][1]))/2,`b=${d.b}`,'label')+text(X(0)+25,Y(0)-12,`${d.c}°`,'label');
 }
 return out;
}
function drawDiagram(d){
 let out='';
 if(d.type==='graph')out=plot(d);
 else if(d.type==='numberline')out=numberline(d);
 else if(d.type==='fractions')out=fractionBars(d);
 else if(d.type==='fractionGrid')out=fractionGrid(d);
 else if(d.type==='bars'||d.type==='growth')out=bars(d);
 else if(d.type==='shape')out=shape(d);
 else if(d.type==='factors'){
  [d.fa,d.fb].forEach((arr,row)=>{out+=text(30,60+row*95,`factors of ${row?d.b:d.a}`,'label','start');const cw=Math.min(42,(VW-65)/arr.length);arr.forEach((v,i)=>{const shared=d.fa.includes(v)&&d.fb.includes(v);out+=box(30+i*cw,78+row*95,cw-5,31,shared?'#c1dab5':'#eef1e7',shared?'#21634f':'#c3ceba',4)+text(30+i*cw+(cw-5)/2,99+row*95,v,'label');});});
 }else if(d.type==='portion'){
  const x=30,w=VW-60,y=100;out+=box(x,y,w,60,'#e9eedf','#a4b99a',4)+box(x,y,w*d.part/d.total,60,'#a8ca9c','none',4)+text(x,y-18,'whole = '+fmt(d.total),'label','start')+text(VW/2,y+95,`${fmt(d.part/d.total*100)}% selected`,'label');
 }else if(d.type==='doubleline'){
  const L=40,R=VW-40;[0,1].forEach(row=>{const y=95+row*100;out+=line(L,y,R,y);for(let i=0;i<=4;i++)out+=line(L+(R-L)*i/4,y-5,L+(R-L)*i/4,y+5)+text(L+(R-L)*i/4,y+25,fmt((row?d.bottom:d.top)*i/4));out+=text(L,y-23,row?d.bottomLabel:d.topLabel,'label','start');});
 }else if(d.type==='areaSplit'){
  const sc=Math.min((VW-75)/(d.b+d.c),(VH-95)/d.a,32),w=(d.b+d.c)*sc,h=d.a*sc,x=(VW-w)/2,y=(VH-h)/2;
  out+=box(x,y,d.b*sc,h,'#c7ddba','#82a375')+box(x+d.b*sc,y,d.c*sc,h,'#e6d1ad','#b98b51')+text(x+d.b*sc/2,y+h/2+4,`ab=${d.a*d.b}`,'label')+text(x+d.b*sc+d.c*sc/2,y+h/2+4,`ac=${d.a*d.c}`,'label')+text(x+d.b*sc/2,y+h+25,`b=${d.b}`,'label')+text(x+d.b*sc+d.c*sc/2,y+h+25,`c=${d.c}`,'label')+text(10,VH/2,`a=${d.a}`,'label','start');
 }else if(d.type==='binomialArea'){
  const sc=Math.min((VW-70)/(d.x+d.a),(VH-65)/(d.x+d.b),32),w=(d.x+d.a)*sc,h=(d.x+d.b)*sc,x=(VW-w)/2,y=(VH-h)/2;
  [[0,0,d.x,d.x,'#b7d3a8',`x²`],[d.x,0,d.a,d.x,'#d4e3c6',`${d.a}x`],[0,d.x,d.x,d.b,'#e6d3b0',`${d.b}x`],[d.x,d.x,d.a,d.b,'#c7b184',`${d.a*d.b}`]].forEach(([dx,dy,ww,hh,color,label])=>{out+=box(x+dx*sc,y+dy*sc,ww*sc,hh*sc,color,'#869f78')+text(x+(dx+ww/2)*sc,y+(dy+hh/2)*sc+4,label,'label');});
  out+=text(VW/2,y+h+24,`width x + ${d.a} · height x + ${d.b}`,'label');
 }else if(d.type==='inequality'){
  const dd={a:d.boundary,b:0,end:d.boundary};out=numberline(dd);const lo=Math.min(-2,d.boundary)-2,hi=Math.max(2,d.boundary)+2,X=x=>35+(x-lo)/(hi-lo)*(VW-70),y=185;
  out+=`<path d="M${X(d.boundary)} ${y}H${VW-35}" fill="none" stroke="#b3764b" stroke-width="4" marker-end="url(#arrow)"/>`+circle(X(d.boundary),y,7,'#fdfdf8','#b3764b',2.5);
  out=out.replace(/<text[^>]*>start:[\s\S]*?<\/text>/,'').replace(/<text[^>]*>end:[\s\S]*?<\/text>/,'').replace('move 0 right','solution set');
 }else if(d.type==='equationBalance'){
  const values=[d.a*d.x,d.b,d.c],max=Math.max(1,...values.map(Math.abs)),L=30,R=VW-30,scale=(R-L)/Math.max(1,Math.abs(d.c),Math.abs(d.a*d.x)+Math.abs(d.b)),zero=VW/2;
  out+=text(VW/2,43,`${d.a}x + (${d.b}) = ${d.c}`,'big-label');
  out+=bars({values,labels:[`${d.a}x`,`constant ${d.b}`,'right side']});
 }else if(d.type==='powerscale'){
  out+=numberline({a:0,b:d.n,end:d.n});out+=text(VW/2,95,`factor ${fmt(d.a)} × 10^${d.n}`,'label');
 }else if(d.type==='unitCircle'){
  const rr=Math.min(VW*.31,VH*.32),x=VW/2,y=VH/2,px=x+rr*Math.cos(rad(d.angle)),py=y-rr*Math.sin(rad(d.angle));
  out+=line(x-rr-20,y,x+rr+20,y)+line(x,y-rr-20,x,y+rr+20)+circle(x,y,rr,'#f2f6eb','#8fac7f',1.5);
  out+=line(x,y,px,py,'#21634f',2.5)+line(x,y,px,y,'#b3764b',3)+line(px,y,px,py,'#507da2',3)+circle(px,py,6,'#21634f','#fdfdf8',2);
  if(d.angle>0&&d.angle<360){out+=`<path d="M${x+rr} ${y}A${rr} ${rr} 0 ${d.angle>180?1:0} 0 ${px} ${py}" fill="none" stroke="#b3764b" stroke-width="4"/>`;}
  out+=text(x+rr+24,y+5,'1')+text(x,y-rr-24,'1')+text(VW/2,VH-14,`${d.angle}° · (${fmt(Math.cos(rad(d.angle)))}, ${fmt(Math.sin(rad(d.angle)))})`,'label');
 }else if(d.type==='transform'){
  const domain=[-6,6],bounds=[-6,6],sc=Math.min((VW-100)/12,(VH-55)/12),X=x=>VW/2+x*sc,Y=y=>VH/2-y*sc,pts=[[1,2],[3,1],[1,0]],trans=pts.map(([x,y])=>{if(d.kind==='translate')return[x+d.a,y+d.b];for(let i=0;i<d.a;i++)[x,y]=[-y,x];return[x,y];});
  out=plot({functions:[],domain,bounds,equal:true});
  // Use the plot's exact centered coordinates for the same square bounds.
  const size=Math.min(VW-75,VH-64),left=(VW-size)/2,top=(VH-30-size)/2,XX=x=>left+(x+6)/12*size,YY=y=>top+(6-y)/12*size;
  out+=poly(pts.map(([x,y])=>[XX(x),YY(y)]),'#e6e9df','#8fa183',1.5)+poly(trans.map(([x,y])=>[XX(x),YY(y)]),'#b9d4aa80','#21634f',2.5)+text(XX(trans[0][0])+10,YY(trans[0][1])-8,'A′','label');
 }else if(d.type==='dotplot'){
  const low=Math.min(0,...d.values)-1,high=Math.max(10,...d.values)+1,L=35,R=VW-35,Y=190,X=x=>L+(x-low)/(high-low)*(R-L),seen={};
  out+=line(L,Y,R,Y);for(let i=0;i<=5;i++){const n=low+(high-low)*i/5;out+=text(X(n),Y+22,fmt(n))+line(X(n),Y-5,X(n),Y+5);}
  [...d.values].sort((a,b)=>a-b).forEach(v=>{seen[v]=(seen[v]||0)+1;out+=circle(X(v),Y-15*seen[v],5,'#21634f');});
  if(d.mean!==undefined)out+=line(X(d.mean),Y+40,X(d.mean),Y-90,'#21634f',1.5,'4 4')+text(X(d.mean),Y+60,'mean');
  if(d.median!==undefined)out+=line(X(d.median),Y+25,X(d.median),Y-75,'#b3764b',1.5,'2 3')+text(X(d.median),Y-93,'median');
 }else if(d.type==='boxplot'){
  const L=40,R=VW-40,X=x=>L+(x)/(d.max+1)*(R-L),y=150;out+=line(X(d.min),y,X(d.max),y)+box(X(d.q1),y-32,X(d.q3)-X(d.q1),64,'#d4e5c7','#21634f')+line(X(d.med),y-32,X(d.med),y+32,'#21634f',3);
  [d.min,d.q1,d.med,d.q3,d.max].forEach((v,i)=>{out+=line(X(v),y-10,X(v),y+10,'#21634f',1.5)+text(X(v),y+(i%2?65:92),fmt(v));});out+=text(VW/2,62,'min · Q₁ · median · Q₃ · max','label');
 }else if(d.type==='tokens'){
  const total=d.a+d.b,cols=6,r=Math.min(17,(VW-55)/(cols*2.6)),x0=(VW-cols*r*2.6)/2+r,y0=110;
  range(total,i=>{const x=x0+(i%cols)*r*2.6,y=y0+Math.floor(i/cols)*r*2.8;out+=circle(x,y,r,i<d.a?'#b5d1a7':'#e6c8a1',i<d.a?'#567e49':'#ab7646',1.5)+text(x,y+4,i<d.a?'G':'O','label');});
  out+=text(VW/2,VH-30,`${d.a} green + ${d.b} orange`,'label');
 }else if(d.type==='twoWay'){
  const x=22,y=70,cw=(VW-44)/3,rh=53;out+=box(x,y+rh,cw*3,rh,'#dfebd5','none');
  [['','Music','No music'],['Athlete',d.a,d.b],['Non-athlete',d.c,d.d]].forEach((row,i)=>row.forEach((v,j)=>{out+=box(x+j*cw,y+i*rh,cw,rh,'none','#c0ceb4')+text(x+(j+.5)*cw,y+(i+.55)*rh+4,v,j?'label':'');}));
 }else if(d.type==='combination'){
  const gap=Math.min(40,(VW-50)/d.n),x=(VW-gap*d.n)/2;range(d.n,i=>{out+=circle(x+gap*(i+.5),110,Math.min(14,gap*.35),i<d.r?'#bad2ab':'#edf1e5','#8aa57b')+text(x+gap*(i+.5),114,String.fromCharCode(65+i),'label');});
  out+=text(VW/2,190,`Choose ${d.r} of ${d.n}. Order does not matter.`,'label')+text(VW/2,230,`${d.count} distinct groups`,'big-label');
 }else if(d.type==='sequence'){
  const min=Math.min(0,...d.values),max=Math.max(1,...d.values),dd={functions:[],domain:[0,d.values.length+1],bounds:[min-1,max+1],points:d.values.map((y,i)=>[i+1,y])};out=plot(dd);
 }
 return wrapSvg(out,`${current?.title||'Math model'}. ${model?.caption||''}`);
}

function courseOf(id){return COURSES.find(c=>c.id===id);}
function persist(){try{localStorage.setItem('math-atlas-progress-v1',JSON.stringify(progress));localStorage.setItem('math-atlas-last-v1',lastLesson);}catch{storageOK=false;}}
function savePlace(){if(!current)return;const place={id:current.id,params:{...params},revealed,mode,visualView,exploded};savedPlace=place;try{localStorage.setItem('math-atlas-place-v1',JSON.stringify(place));}catch{}}
function miniArt(course,index){
 const common='fill="none" stroke="#92aa82" stroke-width="1"',green='#21634f',orange='#b3764b';
 let body='';
 if(course==='foundations'){
  body='<path d="M20 55H260" stroke="#afc09f"/>';
  for(let i=0;i<7;i++)body+=`<path d="M${30+i*35} 51v8" stroke="#9ab18a"/>`;
  body+=`<path d="M65 37H205" stroke="${green}" stroke-width="3"/><circle cx="65" cy="55" r="6" fill="${green}"/><circle cx="205" cy="55" r="6" fill="${orange}"/>`;
 }else if(course==='ratios'){
  range(10,i=>{body+=`<rect x="${25+i*24}" y="24" width="20" height="42" fill="${i<6?'#abc89a':'#e0e9d5'}" stroke="#8fa87c"/>`;});
 }else if(course==='geometry'){
  body='<path d="M58 67L205 67L205 19Z" fill="#d5e5c7" stroke="#638852" stroke-width="1.8"/><path d="M191 67V53H205" fill="none" stroke="#638852"/><path d="M218 69L245 37L265 69Z" fill="none" stroke="#c9ad80"/>';
 }else if(course==='stats'){
  range(7,i=>{const hh=[21,38,54,65,45,29,15][i];body+=`<rect x="${40+i*29}" y="${79-hh}" width="22" height="${hh}" fill="${i===3?'#82aa72':'#c1d5af'}"/>`;});
 }else if(course==='trig'){
  body='<circle cx="82" cy="45" r="31" fill="none" stroke="#9ab389"/><path d="M82 45L104 23L104 45Z" fill="#c5d9b5" stroke="#21634f"/><path d="M144 45Q164 3 184 45T224 45T264 45" fill="none" stroke="#21634f" stroke-width="2"/>';
 }else{
  body='<path d="M25 69H260M75 80V5" stroke="#b2c1a4"/><path d="M40 30Q135 110 225 17" fill="none" stroke="#21634f" stroke-width="2.5"/><circle cx="135" cy="70" r="5" fill="#b3764b"/>';
 }
 return `<svg viewBox="0 0 290 90" aria-hidden="true">${body}</svg>`;
}
function renderFilters(){
 $('course-filters').innerHTML=[{id:'all',name:'All topics'},...COURSES].map(c=>`<button type="button" data-course="${c.id}" aria-pressed="${filter===c.id}">${escapeText(c.name)}</button>`).join('');
 $('course-filters').querySelectorAll('button').forEach(b=>b.onclick=()=>{filter=b.dataset.course;renderFilters();renderCatalog();});
}
function renderCatalog(){
 const query=$('search').value.trim().toLowerCase(),hide=$('hide-completed').checked;
 const items=LESSONS.filter(l=>(filter==='all'||filter===l.course)&&(!hide||!progress[l.id])&&(!query||[l.title,l.goal,l.prereq,courseOf(l.course).name].join(' ').toLowerCase().includes(query)));
 $('result-count').textContent=`${items.length} interactive lesson${items.length===1?'':'s'}${filter==='all'?'':' · '+courseOf(filter).name}`;
 $('lesson-grid').innerHTML=items.map((l,i)=>`<article class="lesson-card"><div class="card-art">${miniArt(l.course,i)}${progress[l.id]?'<span class="card-practiced">✓ Practiced</span>':''}</div><div class="card-body"><p class="eyebrow">${escapeText(courseOf(l.course).name)} / ${escapeText(courseOf(l.course).level)}</p><h3>${escapeText(l.title)}</h3><p>${escapeText(l.goal)}</p><a href="#lesson/${l.id}" aria-label="Explore ${escapeText(l.title)}">Explore this idea</a></div></article>`).join('');
 $('empty-state').hidden=items.length!==0;
 const completed=LESSONS.filter(l=>progress[l.id]).length;
 $('library-stats').innerHTML=`<div><strong>${LESSONS.length}</strong><span>interactive lessons</span></div><div><strong>${COURSES.length}</strong><span>topic collections</span></div><div><strong>${completed}</strong><span>lessons practiced</span></div>`;
 $('resume-learning').hidden=!LESSONS.some(l=>l.id===lastLesson);
}
function setMode(next){
 mode=next;
 ['understand','practice'].forEach(m=>{const active=m===mode;$('mode-'+m).setAttribute('aria-selected',String(active));$('mode-'+m).tabIndex=active?0:-1;$(m+'-panel').hidden=!active;});
 document.querySelector('.result-strip').hidden=mode==='practice';
 // Keep practice visual-assisted, while concealing the final equation and worked steps.
 updateVisualCaption();savePlace();
}
function resetAnswer(){
 wrongAttempts=0;
 $('answer-input').value='';$('answer-feedback').textContent='';$('answer-feedback').classList.remove('correct');$('practice-hint').hidden=true;$('show-hint').setAttribute('aria-expanded','false');$('show-hint').textContent='Give me a hint';
}
function renderSteps(){
 const oneStep=window.MathReading?.getSettings().oneStep;
 $('worked-steps').style.counterReset='steps '+(oneStep?revealed-1:0);
 $('worked-steps').innerHTML=(oneStep?model.steps.slice(revealed-1,revealed):model.steps.slice(0,revealed)).map(s=>`<li>${escapeText(s)}</li>`).join('');
 $('step-count').textContent=`${revealed} / ${model.steps.length}`;$('reveal-step').disabled=revealed>=model.steps.length;$('reveal-step').textContent=revealed>=model.steps.length?'All steps shown':'Show the next step';$('reveal-all').hidden=revealed>=model.steps.length;
 $('step-back').hidden=!oneStep||revealed<=1;window.MathReading?.stopSpeech();window.MathReading?.updateContext();savePlace();
}
function renderModel(reset=true){
 if(!current)return;
 model=current.model(params);
 if(!Number.isFinite(model.answer))throw Error('Non-finite answer in '+current.id);
 if(['coordinate-plane','reflections','inverse-functions','complex-numbers','vector-components'].includes(current.id))model.diagram.equal=true;
 $('result-equation').textContent=model.equation;$('lesson-why').textContent=current.why;$('learning-note').textContent=model.note||'Move one control at a time and compare what changes with what stays the same.';
 $('practice-question').textContent=model.question;$('practice-hint').textContent=model.hint;
 $('practice-guidance').textContent=Math.abs(model.answer)>0&&Math.abs(model.answer)<.01?'For a small value, use at least 4 significant figures. Decimal, fraction, and e notation are accepted.':'Use the visual to reason it out. Round decimal answers to the nearest hundredth; fractions are also accepted.';
 $('sliders').querySelectorAll('output').forEach(o=>o.textContent=fmt(params[o.dataset.key]));
 if(reset){revealed=1;resetAnswer();}renderSteps();renderVisual();setMode(mode);
}
function renderVisual(){
 if(!current||$('lesson-view').hidden)return;
 VW=Math.max(240,Math.round($('visual-stage').getBoundingClientRect().width));VH=Math.max(240,Math.round($('visual-stage').getBoundingClientRect().height)-10);
 const spatial=window.MathAtlasIsometric?.supports(current.id);
 $('visual-options').hidden=!spatial;
 $('view-flat').setAttribute('aria-pressed',String(visualView==='flat'));$('view-isometric').setAttribute('aria-pressed',String(visualView==='isometric'));
 const info=spatial?window.MathAtlasIsometric.info(current.id):null;
 $('separate-layers-label').hidden=!spatial||visualView!=='isometric'||!info?.supportsExplode;
 $('separate-layers').checked=exploded;
 $('visual-stage').classList.toggle('iso',Boolean(spatial&&visualView==='isometric'));$('visual-stage').dataset.theme='light';
 $('visual-stage').innerHTML=spatial&&visualView==='isometric'?window.MathAtlasIsometric.draw({lessonId:current.id,params,width:VW,height:VH,exploded}):drawDiagram(model.diagram);
 updateVisualCaption();if($('visual-dialog').open)fillExpandedVisual();
}
function updateVisualCaption(){
 if(!model)return;const spatial=window.MathAtlasIsometric?.supports(current.id)&&visualView==='isometric';
 const info=spatial?window.MathAtlasIsometric.info(current.id):null;
 $('visual-caption').textContent=mode==='practice'?'Use the model and its controls to reason through the practice check.':spatial?[info?.caption,info?.hint].filter(Boolean).join(' '):model.caption;
}
function fillExpandedVisual(){
 $('expanded-title').textContent=current.title;$('expanded-visual').classList.toggle('iso',$('visual-stage').classList.contains('iso'));$('expanded-visual').dataset.theme='light';
 $('expanded-visual').innerHTML=$('visual-stage').innerHTML.replace(/id="([^"]+)"/g,'id="expanded-$1"').replace(/url\(#([^)]+)\)/g,'url(#expanded-$1)');$('expanded-caption').textContent=$('visual-caption').textContent;
}
function openLesson(id){
 const lesson=LESSONS.find(l=>l.id===id);if(!lesson){location.hash='library';return;}
 current=lesson;params=Object.fromEntries(lesson.inputs.map(i=>[i.key,i.value]));mode='understand';revealed=1;visualView='isometric';exploded=false;
 if(resumeSaved&&savedPlace?.id===id){
  lesson.inputs.forEach(i=>{const v=Number(savedPlace.params?.[i.key]);if(Number.isFinite(v)&&v>=i.min&&v<=i.max)params[i.key]=Number((i.min+Math.round((v-i.min)/i.step)*i.step).toFixed(6));});
  revealed=Math.max(1,Math.min(3,Number(savedPlace.revealed)||1));mode=savedPlace.mode==='practice'?'practice':'understand';visualView=savedPlace.visualView==='flat'?'flat':'isometric';exploded=Boolean(savedPlace.exploded);
 }resumeSaved=false;
 if(pendingProblem&&id==='linear-equations'){params={...pendingProblem};pendingProblem=null;}
 $('library-view').hidden=true;$('lesson-view').hidden=false;
 $('lesson-course').textContent=courseOf(lesson.course).name+' / '+courseOf(lesson.course).level;
 $('lesson-title').textContent=lesson.title;$('lesson-goal').textContent=lesson.goal;$('prerequisite-text').textContent=lesson.prereq;
 renderLearningBridge(lesson);
 const practiced=Boolean(progress[lesson.id]);$('lesson-status').textContent=practiced?'✓ Practiced':'Ready to explore';$('lesson-status').classList.toggle('practiced',practiced);
 $('sliders').innerHTML=lesson.inputs.map(i=>`<label class="control" for="control-${i.key}"><span>${escapeText(i.label)}<output data-key="${i.key}" for="control-${i.key}">${fmt(i.value)}</output></span><input id="control-${i.key}" type="range" min="${i.min}" max="${i.max}" value="${i.value}" step="${i.step}"></label>`).join('');
 lesson.inputs.forEach(i=>{$('control-'+i.key).value=params[i.key];$('control-'+i.key).addEventListener('input',e=>{params[i.key]=Number(e.target.value);resetAnswer();renderModel(false);});});
 const index=LESSONS.indexOf(lesson);$('previous-lesson').disabled=index===0;$('next-lesson').disabled=index===LESSONS.length-1;
 lastLesson=id;persist();resetAnswer();renderModel(false);document.title=lesson.title+' · Math Atlas';window.scrollTo(0,0);
}
function renderLearningBridge(lesson){
 const mapping={'fraction-addition':['fraction-equivalence'],'fraction-multiplication':['fraction-equivalence'],'fraction-division':['fraction-multiplication'],'linear-equations':['integer-subtraction','distributive-property'],'inequalities':['integer-subtraction','linear-equations'],'slope':['coordinate-plane','unit-rates'],'slope-intercept':['slope'],'systems':['slope-intercept'],'quadratic-vertex':['powers','function-input-output'],'factor-quadratics':['distributive-property'],'quadratic-formula':['radicals','factor-quadratics'],'pythagorean':['powers','radicals'],'right-triangle-trig':['pythagorean','unit-rates'],'unit-circle':['coordinate-plane','right-triangle-trig'],'derivatives':['slope','limits'],'integrals':['triangle-area'],'conditional-probability':['theoretical-probability'],'scale-drawings':['unit-rates','proportions'],'volume-cylinder':['circle-measurement','rectangular-prism'],'volume-cone':['volume-cylinder'],'volume-sphere':['circle-measurement'],'surface-area':['rectangle-area','rectangular-prism']};
 $('prerequisite-links').innerHTML=(mapping[lesson.id]||[]).map(id=>{const l=LESSONS.find(l=>l.id===id);return l?`<a href="#lesson/${id}">${escapeText(l.title)} →</a>`:'';}).join('');
 const terms=[['variable','A symbol such as x that represents a value.'],['coefficient','A number multiplying a variable, such as 3 in 3x.'],['numerator','The top of a fraction: how many of the equal parts are counted.'],['denominator','The bottom of a fraction: how many equal parts make one whole.'],['slope','Vertical change divided by horizontal change.'],['radius','Distance from the center of a circle or sphere to its boundary.'],['perpendicular','Meeting at a right angle of 90 degrees.'],['volume','The amount of three-dimensional space inside a solid, in cubic units.'],['area','The size of a region, measured in square units.'],['probability','A number from 0 to 1 describing how likely an event is under a model.'],['function','A rule assigning exactly one output to each allowed input.'],['exponent','A number indicating a power, such as 2 in x².'],['ratio','A comparison between two quantities by division.']];
 const words=[lesson.title,lesson.goal,lesson.why,lesson.prereq,...lesson.inputs.map(i=>i.label)].join(' ').toLowerCase();
 const matches=terms.filter(([term])=>words.includes(term)).slice(0,5);if(!matches.length)matches.push(terms[0]);
 $('math-glossary').innerHTML=matches.map(([term,definition])=>`<dt>${escapeText(term)}</dt><dd>${escapeText(definition)}</dd>`).join('');
}
function route(){
 const hash=location.hash.slice(1);if(hash.startsWith('lesson/')){openLesson(hash.slice(7));return;}
 $('library-view').hidden=false;$('lesson-view').hidden=true;document.title='Math Atlas · Make the idea click';renderCatalog();
 window.MathReading?.updateContext();
}
function nextLesson(offset=1){if(!current)return;const i=LESSONS.indexOf(current);if(LESSONS[i+offset])location.hash='lesson/'+LESSONS[i+offset].id;else location.hash='library';}
function parseAnswer(value){
 const raw=value.trim().replace(/−/g,'-'),numeric=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
 if(raw.includes('/')){const parts=raw.split('/');if(parts.length!==2||!parts.every(s=>numeric.test(s.trim())))return null;const [a,b]=parts.map(Number);return b!==0&&Number.isFinite(a/b)?a/b:null;}
 return numeric.test(raw)&&Number.isFinite(Number(raw))?Number(raw):null;
}
function answerCorrect(value,expected,tolerance){return Math.abs(value-expected)<=tolerance+Number.EPSILON*Math.abs(expected);}
function checkAnswer(e){
 e.preventDefault();const value=parseAnswer($('answer-input').value),feedback=$('answer-feedback');
 feedback.classList.remove('correct');
 if(value===null){feedback.textContent='Enter a number, a fraction such as 3/4, or e notation such as 3e-5.';return;}
 if(answerCorrect(value,model.answer,model.tolerance)){
  feedback.textContent='That’s right. '+model.steps[model.steps.length-1];feedback.classList.add('correct');
  progress[current.id]={practiced:true};persist();$('lesson-status').textContent='✓ Practiced';$('lesson-status').classList.add('practiced');
 }else{wrongAttempts++;feedback.textContent=wrongAttempts>=2?'Let’s break it down. '+model.steps[1]+' Use this step, then try again or reveal the reasoning.':'Not quite yet. '+model.hint+' Try again, or reveal the reasoning.';}
}
$('answer-form').addEventListener('submit',checkAnswer);
$('reveal-step').onclick=()=>{revealed=Math.min(model.steps.length,revealed+1);renderSteps();};
$('step-back').onclick=()=>{revealed=Math.max(1,revealed-1);renderSteps();};
$('reveal-all').onclick=()=>{if(window.MathReading?.getSettings().oneStep)window.MathReading.set({oneStep:false},true);revealed=model.steps.length;renderSteps();};
$('show-practice-solution').onclick=()=>{setMode('understand');revealed=window.MathReading?.getSettings().oneStep?1:model.steps.length;renderSteps();$('mode-understand').focus();};
$('show-hint').onclick=()=>{const show=$('practice-hint').hidden;$('practice-hint').hidden=!show;$('show-hint').setAttribute('aria-expanded',String(show));$('show-hint').textContent=show?'Hide hint':'Give me a hint';};
$('new-problem').onclick=()=>{current.inputs.forEach(i=>{const count=Math.round((i.max-i.min)/i.step),n=Math.floor(Math.random()*(count+1));params[i.key]=Number((i.min+n*i.step).toFixed(6));$('control-'+i.key).value=params[i.key];});renderModel();$('answer-input').focus();};
$('reset-controls').onclick=()=>{current.inputs.forEach(i=>{params[i.key]=i.value;$('control-'+i.key).value=i.value;});renderModel();};
$('view-flat').onclick=()=>{visualView='flat';renderVisual();savePlace();};$('view-isometric').onclick=()=>{visualView='isometric';renderVisual();savePlace();};
$('separate-layers').onchange=e=>{exploded=e.target.checked;renderVisual();savePlace();};
$('visual-expand').onclick=()=>{fillExpandedVisual();$('visual-dialog').showModal();};$('visual-close').onclick=()=>$('visual-dialog').close();
$('practice-calculator-open').onclick=()=>window.MathCalculator.open();$('lesson-reading-open').onclick=()=>$('reading-dialog').showModal();
$('mode-understand').onclick=()=>setMode('understand');$('mode-practice').onclick=()=>setMode('practice');
['understand','practice'].forEach(m=>$('mode-'+m).onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'understand':e.key==='End'?'practice':m==='understand'?'practice':'understand';setMode(next);$('mode-'+next).focus();}});
$('next-lesson').onclick=()=>nextLesson();$('next-bottom').onclick=()=>nextLesson();$('previous-lesson').onclick=()=>nextLesson(-1);
$('search').addEventListener('input',renderCatalog);$('hide-completed').onchange=renderCatalog;
function parseSchoolEquation(raw){
 const match=raw.replace(/\s+/g,'').replace(/−/g,'-').match(/^(\d*)x(?:([+-])(\d+))?=([+-]?\d+)$/i);
 if(!match)return {error:'Try an equation in the form 3x + 4 = 16 or 2x − 3 = 9. Other problem forms are not supported by this entry yet.'};
 const a=match[1]===''?1:Number(match[1]),b=(match[2]==='-'?-1:1)*Number(match[3]||0),c=Number(match[4]);
 if(![a,b,c].every(Number.isSafeInteger)||a<1||a>6||b< -6||b>6||c< -20||c>30)return {error:'This helper supports whole-number a from 1–6, b from −6–6, and c from −20–30. Use the lesson controls to explore a different example.'};
 return {a,b,c};
}
$('problem-form').addEventListener('submit',e=>{e.preventDefault();const p=parseSchoolEquation($('problem-input').value);if(p.error){$('problem-feedback').textContent=p.error;return;}$('problem-feedback').textContent='';pendingProblem=p;location.hash='lesson/linear-equations';});
$('clear-filters').onclick=()=>{filter='all';$('search').value='';$('hide-completed').checked=false;renderFilters();renderCatalog();};
$('start-learning').onclick=()=>{filter='foundations';renderFilters();renderCatalog();document.querySelector('.catalog').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches||window.MathReading?.getSettings().reduceMotion?'instant':'smooth'});};
$('resume-learning').onclick=()=>{if(lastLesson){resumeSaved=true;location.hash='lesson/'+lastLesson;}};
function openCoverage(){
 $('coverage-list').innerHTML=COURSES.map(c=>`<div class="coverage-row"><div><strong>${escapeText(c.name)}</strong><br><span class="subtle">${escapeText(c.description)}</span></div><span>${LESSONS.filter(l=>l.course===c.id).length} lessons</span></div>`).join('');
 $('storage-status').textContent=storageOK?'Practice progress is stored only in this browser.':'Browser storage is unavailable. Lessons work, but progress will not persist.';
 $('coverage-dialog').showModal();
}
$('coverage-open').onclick=openCoverage;$('coverage-inline').onclick=openCoverage;$('coverage-close').onclick=()=>$('coverage-dialog').close();
$('clear-progress').onclick=()=>{progress={};persist();renderCatalog();if(current){$('lesson-status').textContent='Ready to explore';$('lesson-status').classList.remove('practiced');}$('storage-status').textContent='Practice progress cleared from this browser.';};
addEventListener('hashchange',route);let resizeId=0;new ResizeObserver(()=>{cancelAnimationFrame(resizeId);resizeId=requestAnimationFrame(renderVisual);}).observe($('visual-stage'));
document.addEventListener('atlasreadingchange',()=>{if(current&&!$('lesson-view').hidden){renderSteps();renderVisual();}});
// Read-only models exposed to support verification of all lessons and edge cases.
window.MathAtlas={lessons:LESSONS,courses:COURSES,defaults:l=>Object.fromEntries(l.inputs.map(i=>[i.key,i.value])),parseAnswer,parseSchoolEquation,answerCorrect,getState:()=>({id:current?.id,params:{...params},answer:model?.answer,mode,revealed,visualView,exploded}),testDiagram:(id,p)=>{const l=LESSONS.find(l=>l.id===id),m=l.model(p);return m;}};
renderFilters();route();
