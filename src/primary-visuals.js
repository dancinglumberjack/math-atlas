(function(){
 'use strict';
 const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
 const count=(v,max=120)=>Math.max(0,Math.min(max,Math.round(num(v))));
 function supports(v){return v?.type==='primary'||v?.type==='blocks'&&v.start!==undefined;}
 function render(v,guess,proposal,helpers){
  const {svg,esc}=helpers;let body='',caption='',readout='',box='0 0 560 340';
  const text=(x,y,value,size=17,anchor='middle')=>`<text x="${x}" y="${y}" font-family="system-ui,sans-serif" font-size="${size}" text-anchor="${anchor}" fill="#355f49">${esc(value)}</text>`;
  const dot=(x,y,key,fill='#93b96d',r=14)=>`<g data-object="${esc(key)}"><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="#54784a" stroke-width="1.4"/><path d="M${x-r*.35} ${y-r*.3}q${r*.35}-${r*.25} ${r*.7} 0" fill="none" stroke="#dcebc9" stroke-width="2"/></g>`;
  if(v.type==='blocks'){
   const start=count(v.start,20),removed=Math.min(start,count(v.remove,20));body+=text(280,32,'Some leave. The others stay.');
   for(let i=0;i<start;i++){const x=74+i%8*58,y=87+Math.floor(i/8)*65,taken=i>=start-removed;body+=`<g data-math-object="${taken?'removed':'remaining'}" data-object="takeaway-${i}"><rect x="${x}" y="${y}" width="39" height="39" rx="7" fill="${taken?'#e8ddc5':'#b6cf91'}" stroke="#7f9b69" stroke-width="1.5"/>${taken?`<path d="M${x+6} ${y+6}l27 27m-27 0l27-27" stroke="#a26b52" stroke-width="3"/>`:''}</g>`;}
   readout='Count the uncrossed objects.';caption=`Start with ${start} objects. Cross out ${removed} objects that leave. The uncrossed objects stay. Taking away does not add new objects.`;
  }else if(v.kind==='ten-frame'){
   const capacity=v.capacity===20?20:10,n=count(v.count,capacity),cell=48,x=160,y=capacity===20?42:91;
   body+=text(280,27,capacity===20?'Two frames. Ten spaces in each.':'A frame with ten spaces.');
   for(let i=0;i<capacity;i++){const frame=Math.floor(i/10),j=i%10,xx=x+j%5*cell,yy=y+Math.floor(j/5)*cell+frame*115;body+=`<rect data-frame-space="${i}" x="${xx}" y="${yy}" width="${cell}" height="${cell}" rx="3" fill="#fafbf2" stroke="#88a574" stroke-width="1.5"/>`;if((v.pairBy===2?frame*10+(j%5)*2+Math.floor(j/5):i)<n)body+=`<g data-frame-counter="${i}" ${v.pairBy===2?`data-pair-member="${frame*5+j%5}"`:''}>${dot(xx+cell/2,yy+cell/2,'frame-'+i,frame?'#98bed2':'#a3c77c',16)}</g>`;}
   if(v.pairBy===2)for(let frame=0;frame<capacity/10;frame++)for(let col=0;col<5;col++)if(frame*10+col*2<n)body+=`<rect data-buddy-outline="${frame*5+col}" x="${x+col*cell+3}" y="${y+frame*115+3}" width="42" height="90" rx="16" fill="none" stroke="#a77b4c" stroke-width="2" stroke-dasharray="5 4"/>`;
   if(v.showCounts)body+=text(280,295,n+' objects');
   readout='Build a group. Notice the empty spaces.';caption=`Each full frame holds ten objects in two rows of five. There are ${n} objects and ${capacity-n} empty spaces. Filling a space adds exactly one object.${v.pairBy===2?' Brown outlines group buddies in pairs of two. Notice any counter without a buddy.':''}`;
  }else if(v.kind==='comparison'){
   const quantities=[count(v.left,1000),count(v.right,1000)],labels=v.labels||['Left group','Right group'],bundled=quantities.some(n=>n>20);
   quantities.forEach((n,k)=>{const x=42+k*260,side=k?'right':'left';body+=`<g data-comparison-group="${side}" data-compare-value="${n}"><rect x="${x}" y="59" width="218" height="218" rx="16" fill="${k?'#edf3f4':'#f0f5e7'}" stroke="#b6cba4"/>`+text(x+109,39,labels[k]||'',17);
    if(bundled){const units=[['hundred',100,Math.floor(n/100)],['ten',10,Math.floor(n/10)%10],['one',1,n%10]];units.forEach(([name,value,amount],place)=>{const xx=x+12+place*67;body+=text(xx+25,85,['Hundreds','Tens','Ones'][place],11);for(let i=0;i<amount;i++){const px=xx+(i%2)*24,py=100+Math.floor(i/2)*26;let unit='';if(value===100){unit=`<rect x="${px}" y="${py}" width="20" height="20" fill="#a9c8d9" stroke="#63889c"/>`;for(let j=1;j<10;j++)unit+=`<path d="M${px+j*2} ${py}v20M${px} ${py+j*2}h20" stroke="#789db1" stroke-width=".35"/>`;}else if(value===10){unit=`<rect x="${px}" y="${py}" width="2" height="20" fill="#a8c886" stroke="#65884c" stroke-width=".5"/>`;for(let j=1;j<10;j++)unit+=`<path d="M${px} ${py+j*2}h2" stroke="#65884c" stroke-width=".4"/>`;}else unit=`<rect x="${px}" y="${py}" width="2" height="2" fill="#b68b4b"/>`;body+=`<g data-compare-side="${side}" data-compare-unit="${name}" data-unit-value="${value}">${unit}</g>`;}body+=text(xx+25,247,amount,15);});body+=text(x+109,302,n,22);}
    else{for(let i=0;i<n;i++)body+=`<g data-compare-side="${side}">${dot(x+30+i%5*39,91+Math.floor(i/5)*38,'compare-'+k+'-'+i,k?'#99bfd2':'#a5c77c',11)}</g>`;if(v.showCounts)body+=text(x+109,302,n);}
    body+='</g>';
   });
   readout=bundled?'Compare the largest place first.':'Match one object with one object.';caption=`The left group has ${quantities[0]} and the right has ${quantities[1]}. `+(bundled?'A hundred plate has 100 unit squares. A rod has 10. A tiny square is one. Compare hundreds, then tens, then ones.':'Give each object one partner. Objects without partners show which group has more.');
  }else if(v.kind==='length'){
   const values=(v.lengths||[]).slice(0,3).map(x=>count(x,20)),labels=v.labels||values.map((_,i)=>'Ribbon '+(i+1)),max=Math.max(1,...values),vertical=v.orientation==='vertical',unit=v.unit||'cubes',unitStep=Math.max(1,num(v.unitStep,1));
   body+=text(280,26,vertical?'Line up the bottoms.':'Start at the same place.');
   if(vertical){const cell=Math.min(29,186/max);body+=`<path d="M55 262H510" stroke="#a47e52" stroke-width="2"/>`;values.forEach((n,k)=>{const x=100+k*165;for(let i=0;i<n;i+=unitStep)body+=`<rect data-length-unit="${k}" data-length-unit-size="${unitStep}" x="${x}" y="${262-(i+unitStep)*cell}" width="40" height="${unitStep*cell}" fill="${k%2?'#9dc2d5':'#b1ce91'}" stroke="#648658"/>`;body+=text(x+20,294,labels[k],15);});}
   else{const cell=Math.min(36,350/max),slot=210/Math.max(1,values.length);body+=`<path d="M133 49V276" stroke="#a47e52" stroke-width="2"/>`;values.forEach((n,k)=>{const y=62+k*slot;body+=text(121,y+22,labels[k],14,'end');for(let i=0;i<n;i+=unitStep)body+=`<rect data-length-unit="${k}" data-length-unit-size="${unitStep}" x="${133+i*cell}" y="${y}" width="${unitStep*cell}" height="34" fill="${k%2?'#9dc2d5':'#b1ce91'}" stroke="#648658"/>`;});}
   body+=text(280,329,'Each block covers '+unitStep+' '+unit,14);readout='Use equal units with no gaps or overlaps.';caption=`The ${vertical?'bottoms':'left ends'} line up. Each block covers ${unitStep} ${unit}; blocks touch without gaps or overlaps. Compare the endpoints or count equal blocks. Moving an object does not change its length.`;
  }else if(v.kind==='shapes'){
   const shapes=(v.shapes||['square']).slice(0,12),compose=v.compose||(v.layout==='join-triangles'?'square':null);
   function shape(name,x,y,index,scale=1){let s='',fill=index%2?'#a5c8d9':'#b4ce91',stroke='#5c8058';const attr=`fill="${fill}" stroke="${stroke}" stroke-width="2"`;
    if(name==='circle')s=`<circle r="43" ${attr}/>`;
    else if(name==='sphere')s=`<circle r="44" ${attr}/><ellipse rx="44" ry="13" fill="none" stroke="#6e947d"/><path d="M-15-37Q-42-11-31 15" fill="none" stroke="#e2edcf" stroke-width="5"/>`;
    else if(name==='cylinder')s=`<path d="M-38-34V34A38 12 0 0 0 38 34V-34" ${attr}/><ellipse cy="-34" rx="38" ry="12" ${attr}/><path d="M-38 34A38 12 0 0 0 38 34" fill="none" stroke="${stroke}" stroke-width="2"/>`;
    else if(name==='cone')s=`<path d="M0-48L43 36A43 12 0 0 1-43 36Z" ${attr}/><path d="M-43 36A43 12 0 0 0 43 36" fill="none" stroke="${stroke}" stroke-width="2"/>`;
    else if(name==='cube')s=`<polygon points="0,-48 42,-25 0,-2 -42,-25" fill="#d9e6bf" stroke="${stroke}" stroke-width="2"/><polygon points="-42,-25 0,-2 0,48 -42,25" fill="#b0cb8f" stroke="${stroke}" stroke-width="2"/><polygon points="0,-2 42,-25 42,25 0,48" fill="#87ad71" stroke="${stroke}" stroke-width="2"/>`;
    else if(name==='rectangle')s=`<rect x="-52" y="-31" width="104" height="62" ${attr}/>`;
    else if(name==='triangle')s=`<polygon points="0,-47 47,36 -47,36" ${attr}/>`;
    else if(name==='pentagon'||name==='hexagon'){const n=name==='pentagon'?5:6;s=`<polygon points="${Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;return Math.cos(a)*47+','+Math.sin(a)*47;}).join(' ')}" ${attr}/>`;}
    else s=`<rect x="-37" y="-37" width="74" height="74" ${attr}/>`;
    return `<g data-primary-shape="${esc(name)}" data-shape-index="${index}" transform="translate(${x} ${y})${v.rotate?' rotate('+((index+1)*25)+')':''} scale(${scale})">${v.highlightIndex===index?'<circle r="65" fill="none" stroke="#a77548" stroke-dasharray="6 5" stroke-width="2"/>':''}${s}</g>`;
   }
   if(compose==='square'){body+=`<g data-composed-shape="square"><polygon data-primary-shape="triangle" points="195,80 365,80 365,250" fill="#b4ce91" stroke="#5c8058" stroke-width="2"/><polygon data-primary-shape="triangle" points="195,80 365,250 195,250" fill="#a5c8d9" stroke="#5c8058" stroke-width="2"/></g>`;}
   else if(compose==='rectangle'){body+=`<g data-composed-shape="rectangle"><rect data-primary-shape="square" x="140" y="100" width="140" height="140" fill="#b4ce91" stroke="#5c8058" stroke-width="2"/><rect data-primary-shape="square" x="280" y="100" width="140" height="140" fill="#a5c8d9" stroke="#5c8058" stroke-width="2"/></g>`;}
   else shapes.forEach((name,i)=>{const above=v.layout==='above',grid=shapes.length>4,rows=Math.ceil(shapes.length/5),cols=Math.min(5,shapes.length),scale=grid?.72:1,x=above?280:grid?40+(i%cols+.5)*480/cols:40+(i+.5)*480/shapes.length,y=above?83+i*154:grid?48+(Math.floor(i/cols)+.5)*260/rows:159;body+=shape(name,x,y,i,scale);if(v.labels?.[i])body+=text(x,y+75*scale,v.labels[i],15);});
   readout=compose?'Small shapes can build a bigger shape.':'Look at sides, corners, and surfaces.';caption=compose==='square'?'Two equal right triangles meet along one diagonal. Together they fill a square without gaps or overlaps.':compose==='rectangle'?'Two equal squares meet along a full side. Together they form one rectangle.':'A shape keeps its name when it turns or changes color. Flat shapes have outlines. Solid shapes take up space. Compare their defining features.';
  }else if(v.kind==='partition'){
   const parts=Math.max(1,count(v.parts,8)),selected=count(v.selected,parts),rows=v.layout==='rows'?parts:v.layout==='grid'&&parts===4?2:1,cols=parts/rows,w=360/cols,h=132/rows;
   body+=text(280,44,'Keep one whole the same size.');for(let i=0;i<parts;i++)body+=`<rect data-equal-part="${i}" data-part-selected="${i<selected}" x="${100+i%cols*w}" y="${94+Math.floor(i/cols)*h}" width="${w}" height="${h}" fill="${i<selected?'#a4c57c':'#fafbef'}" stroke="#678a54" stroke-width="2"/>`;
   body+=text(280,284,parts+' equal parts',19);readout='Equal parts cover the whole.';caption=`One rectangle is split into ${parts} equal-area parts. ${selected} parts are shaded. Each part has the same area even if its shape or direction differs.`;
  }else if(v.kind==='number-chart'){
   const start=Math.round(num(v.start,1)),end=Math.max(start,Math.min(start+119,Math.round(num(v.end,100)))),n=end-start+1,rows=Math.ceil(n/10),cell=Math.min(44,410/rows),width=Math.min(n,10)*cell,x0=280-width/2,y0=48,height=Math.max(340,rows*cell+98);box=`0 0 560 ${height}`;
   body+=text(280,27,v.title||'A path of numbers');for(let i=0;i<n;i++){const value=start+i,selected=(v.highlight||[]).includes(value),x=x0+i%10*cell,y=y0+Math.floor(i/10)*cell;body+=`<rect data-chart-cell="${value}" x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${selected?'#bdd59b':'#fafbf2'}" stroke="#a3b68b"/>`+text(x+cell/2,y+cell*.67,(v.hidden||[]).includes(value)?'?':value,Math.min(19,cell*.48));}
   readout='Read across. Continue on the next row.';caption=`The chart counts from ${start} to ${end}, one number in each space. Each new space across is one more. With ten columns, moving down one full row is ten more.`;
  }else if(v.kind==='money'){
   const coins=(v.coins||[]).slice(0,12).map(x=>count(x,100)),bills=(v.bills||[]).slice(0,9).map(x=>count(x,100)),split=Number.isInteger(v.groupBreak)&&v.groupBreak>0&&v.groupBreak<coins.length?v.groupBreak:null;
   body+=text(280,30,split?'Compare these two coin groups.':bills.length&&!coins.length?'Dollar bills in the pretend shop.':'Read the value of each coin.');
   if(split){body+=`<rect x="32" y="74" width="238" height="206" rx="14" fill="#f0f5e8" stroke="#bacda9"/><rect x="290" y="74" width="238" height="206" rx="14" fill="#edf3f4" stroke="#b6cad2"/>`+text(150,59,'Left group',16)+text(410,59,'Right group',16);}
   const cols=Math.min(6,Math.max(1,coins.length));coins.forEach((value,i)=>{const side=split&&i>=split?'right':'left',local=split&&i>=split?i-split:i,groupCount=split?(i<split?split:coins.length-split):coins.length,groupCols=Math.min(3,groupCount),x=split?(side==='left'?32:290)+(local%groupCols+.5)*238/groupCols:80+i%cols*80,y=split?121+Math.floor(local/groupCols)*88:106+Math.floor(i/cols)*105;body+=`<g ${split?`data-money-group="${side}"`:''} data-coin-value="${value}" data-object="coin-${i}"><circle cx="${x}" cy="${y}" r="31" fill="${value===1?'#dbb18d':'#dce2d6'}" stroke="#7f8e77" stroke-width="2"/><circle cx="${x}" cy="${y}" r="25" fill="none" stroke="#a1ad96"/>${text(x,y+7,value+'¢',20)}</g>`;});
   const firstBillY=coins.length?80+Math.ceil(coins.length/6)*105:90;for(let i=0;i<bills.length;i++){const x=80+i%3*144,y=firstBillY+Math.floor(i/3)*76;body+=`<g data-bill-value="${bills[i]}" data-object="bill-${i}"><rect x="${x}" y="${y}" width="112" height="55" rx="5" fill="#c5d8b0" stroke="#62815b" stroke-width="2"/><rect x="${x+6}" y="${y+6}" width="100" height="43" rx="3" fill="none" stroke="#93ae80"/>${text(x+56,y+35,'$'+bills[i],25)}</g>`;}
   if(bills.length)box=`0 0 560 ${Math.max(340,firstBillY+Math.ceil(bills.length/3)*76+25)}`;
   readout=split?'Compare values, not the number of coins.':bills.length?'Bills show dollars. Coins show cents.':'Coin count and coin value are different.';
   caption=split?'The labeled left and right groups are separate collections. Add the cent values within each group, then compare those two amounts. Different numbers of coins can have equal value.':bills.length&&!coins.length?'Each bill is labeled in US dollars. Count its dollar value and keep dollars as the unit. One dollar equals 100 cents.':'These are labeled models of US coins. Add their values in cents. A bill labeled $1 has a value of one dollar, equal to 100 cents. The size of the drawing is not a measure of value.';
  }else throw new RangeError('Unknown primary visual: '+v.kind);
  return {markup:svg(body,caption,box),readout,caption};
 }
 window.AtlasPrimaryVisuals=Object.freeze({supports,render});
})();
