/*
 * Math Atlas measuring bench. Anatomy Figure tier; projected SVG, no runtime 3D.
 * Uses the installed Anatomy MIT toolkit through AnatomyKit / AnatomyLathe.
 * A real measuring bench makes length, face area and repeated volume visible.
 * Parts: 12 foot pieces, deck, 4 deck screws, 2 calibrated ruler strips,
 * 2 rails, 4 end stops, 4 rail screws, 4 clamp blocks, 4 clamp knobs,
 * specimen mat, identity plate, 2 plate rivets, plus the mathematical specimen.
 * All specimen lengths share UNIT; bench hardware is outside its dimensions.
 */
(function () {
  'use strict';
  const UNIT = 18;
  const IDS = new Set(['rectangular-prism', 'surface-area', 'scale-drawings', 'volume-cylinder', 'volume-cone', 'volume-sphere']);
  const esc = value => String(value).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const finite = (value, fallback) => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : fallback;
  const number = value => Number(value.toFixed(3)).toLocaleString('en-US');

  function model(lessonId, params, exploded) {
    const a = finite(params.a, 4), b = finite(params.b, 3), c = finite(params.c, 2);
    if (lessonId === 'scale-drawings') return {kind:'scale',a,b,c:1,L:a*UNIT,W:36,H:27,volume:null,real:a*b,exploded:false};
    if (lessonId === 'rectangular-prism' || lessonId === 'surface-area') {
      return {kind:'prism',a,b,c,L:a*UNIT,W:b*UNIT,H:c*UNIT,volume:a*b*c,area:2*(a*b+a*c+b*c),exploded:lessonId==='rectangular-prism'&&!!exploded};
    }
    const kind=lessonId.replace('volume-',''), R=a*UNIT;
    return {kind,a,b,c,L:2*R,W:2*R,H:kind==='sphere'?2*R:b*UNIT,R,volume:kind==='sphere'?4/3*Math.PI*a**3:Math.PI*a*a*b*(kind==='cone'?1/3:1),exploded:false};
  }

  function info(lessonId) {
    const common={hint:'Adjust the dimensions and compare the solid with the measurements.',supportsExplode:false};
    if(lessonId==='rectangular-prism') return {...common,supportsExplode:true,explodeLabel:'Separate the unit-height layers',caption:'Each layer is one unit high. The small face squares show unit areas; each square extends through a layer to make one unit cube. Gaps in the separated view are illustrative and add no volume.'};
    if(lessonId==='surface-area') return {...common,caption:'The unit grids cover the three visible faces. Each has an equal opposite face: length × width, length × height, and width × height. The flat view shows all six faces as a net.'};
    if(lessonId==='scale-drawings') return {...common,hint:'Change the drawing length or what each centimeter represents.',caption:'The model’s highlighted long edge is measured in drawing centimeters. Each centimeter represents the selected number of real meters. Changing that scale changes the real length represented; the drawing stays the same size. Other model dimensions are illustrative.'};
    if(lessonId==='volume-cylinder') return {...common,caption:'The solid has the selected radius and height on one scale. Equal-height circular sections have equal areas, so volume is circular base area × height. The circular top shows a radius from its center to its rim.'};
    if(lessonId==='volume-cone') return {...common,caption:'The cone uses one scale for radius and height. A cone holds one third as much as a cylinder with the same base and height. The narrowing sections show why the cross-sectional area changes with height.'};
    if(lessonId==='volume-sphere') return {...common,caption:'The sphere’s radius sets all three dimensions on one scale. The ring follows the visible equator; the sphere’s volume is 4πr³/3. The stand and measuring bench are not part of its volume.'};
    return null;
  }

  // Convex projected bounds let a separating world plane establish painter order.
  // This avoids using center-depth alone for a long base or tall specimen.
  function hull(points) {
    const p=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
    const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
    const side=list=>{const out=[];for(const q of list){while(out.length>1&&cross(out[out.length-2],out[out.length-1],q)<=0)out.pop();out.push(q);}return out;};
    const lower=side(p),upper=side(p.slice().reverse());lower.pop();upper.pop();return lower.concat(upper);
  }
  function overlaps(a,b) {
    for(const poly of [a,b]) for(let i=0;i<poly.length;i++) {
      const p=poly[i],q=poly[(i+1)%poly.length],axis=[q[1]-p[1],p[0]-q[0]],length=Math.hypot(...axis);
      if(!length)continue;
      const range=points=>points.map(t=>(t[0]*axis[0]+t[1]*axis[1])/length);
      const aa=range(a),bb=range(b);
      if(Math.min(Math.max(...aa),Math.max(...bb))-Math.max(Math.min(...aa),Math.min(...bb))<.12)return false;
    }
    return true;
  }
  function order(parts,k,P) {
    const edges=parts.map(()=>new Set()), incoming=parts.map(()=>0);
    parts.forEach(p=>{p.key=k.depthOf(p.at,P);p.hull=hull(k.boxCorners({x:p.min[0],y:p.min[1],w:p.max[0]-p.min[0],d:p.max[1]-p.min[1],r:0},p.min[2],p.max[2]).map(q=>k.iso(q,P)));});
    for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++){
      const a=parts[i],b=parts[j];if(!overlaps(a.hull,b.hull))continue;
      const relations=[];
      for(let axis=0;axis<3;axis++){
        if(a.max[axis]<=b.min[axis]+1e-6)relations.push([i,j]);
        else if(b.max[axis]<=a.min[axis]+1e-6)relations.push([j,i]);
      }
      // Opposite relations mean the conservative bounds of curved solids
      // overlap in projection although their actual surfaces do not.
      if(relations.length&&relations.every(e=>e[0]===relations[0][0])){
        const [from,to]=relations[0];if(!edges[from].has(to)){edges[from].add(to);incoming[to]++;}
      }
    }
    const out=[], remaining=new Set(parts.map((_,i)=>i));
    while(remaining.size){
      let available=[...remaining].filter(i=>incoming[i]===0);
      if(!available.length)available=[...remaining];
      available.sort((a,b)=>parts[a].key-parts[b].key);
      const next=available[0];remaining.delete(next);out.push(parts[next]);for(const target of edges[next])incoming[target]--;
    }
    return out;
  }

  function scene({lessonId,params={},width=640,height=350,exploded=false,layer}={}) {
    if(!IDS.has(lessonId))return null;
    const k=window.AnatomyKit,g=window.AnatomyLathe;if(!k)return null;
    const m=model(lessonId,params,exploded), {L,W,H}=m;
    const plate={x:-L/2-33,y:-W/2-31,w:L+66,d:W+62,r:7};
    const z=3.2, gap=m.exploded?UNIT*.26:0, count=Math.max(1,Math.round(m.c));
    const high=z+H+(m.exploded?(count-1)*gap:0);
    width=Math.max(280,finite(width,640));height=Math.max(240,finite(height,350));
    const fit=[...k.boxCorners(plate,-16,0),...k.boxCorners({x:-L/2,y:-W/2,w:L,d:W,r:0},z,high)];
    const P=k.fitProjection(fit,width,height,{pad:Math.min(width*.075,28),azimuth:42,elevation:30});
    const parts=[];
    function put(name,paths,min,max,style={},shape={}) {
      parts.push({name,min,max,at:min.map((v,i)=>(v+max[i])/2),paths,svg:k.solidSvg(paths,style),shape});
    }
    function slab(name,plan,bottom,h,style={},inner=''){
      put(name,k.slabOf(plan,bottom,h,P,plan.r?6:1,style.bevel||0),[plan.x,plan.y,bottom],[plan.x+plan.w,plan.y+plan.d,bottom+h],{...style,inner},{type:'slab',plan,z:bottom,h});
    }
    function cylinder(name,x,y,r,bottom,h,style={},inner=''){
      put(name,k.cylinder(x,y,r,bottom,h,P,r>12?72:24,.3),[x-r,y-r,bottom],[x+r,y+r,bottom+h],{...style,inner},{type:'cylinder',x,y,r,z:bottom,h});
    }
    const line=(d,tone='lo')=>k.lineSvg(d,{tone});
    const dot=(p,size=.5,tone='mid')=>k.dotsSvg([k.iso(p,P)],{size,tone});
    const screw=(name,x,y,bottom,r=1.7)=>cylinder(name,x,y,r,bottom,.75,{tone:'lo'},line(k.lineOnTop([x-r*.7,y],[x+r*.7,y],bottom+.75,P),'mid')+dot([x,y,bottom+.75],.28));

    // The bench is furniture, rather than a stack of abstract diagram boxes.
    for(const [i,[x,y]] of k.corners(plate,13).entries()){
      cylinder(`stand.foot.${i}.rubber`,x,y,4.7,-16,2.2,{tone:'lo'});
      cylinder(`stand.foot.${i}.stem`,x,y,3.3,-13.8,3.8,{tone:'lo'});
      cylinder(`stand.foot.${i}.flange`,x,y,6,-10,1,{tone:'lo'});
    }
    slab('stand.deck',plate,-9,9,{tone:'mid',bevel:1},line(k.planOutline(k.insetPlan(plate,4),0,P),'faint'));
    for(const [i,[x,y]] of k.corners(plate,8).entries())screw(`stand.deck.screw.${i}`,x,y,0);
    const front={x:-L/2,y:W/2+20,w:L,d:4.3,r:0};
    const left={x:-L/2-23,y:-W/2,w:4.3,d:W,r:0};
    const frontTicks=k.topTicks(front.x,front.x+front.w,UNIT/2,2,front.y,.65,[2.2,4.3],P);
    const sideTicks=k.topTicks(left.y,left.y+left.d,UNIT/2,2,left.x,.65,[2.2,4.3],P,'y');
    slab('stand.length-ruler',front,0,.65,{tone:'mid'},line(frontTicks.minor,'lo')+line(frontTicks.major,'hi'));
    slab('stand.width-ruler',left,0,.65,{tone:'mid'},line(sideTicks.minor,'lo')+line(sideTicks.major,'hi'));
    for(const [ri,y] of [-W/2-10,W/2+7].entries()){
      const rail={x:-L/2-16,y,w:L+32,d:3,r:.8};
      slab(`stand.rail.${ri}`,rail,0,2,{tone:'lo',bevel:.35});
      for(const [ei,x]of[-L/2-20,L/2+16].entries()){
        slab(`stand.stop.${ri}.${ei}`,{x,y:y-2,w:4,d:7,r:.6},0,4,{tone:'mid',bevel:.3});
        screw(`stand.rail.screw.${ri}.${ei}`,x+2,y+1.5,4,1.1);
      }
      for(const [ci,x]of[-L/2-6,L/2+6].entries()){
        slab(`stand.clamp.${ri}.${ci}`,{x:x-3,y:y-1.5,w:6,d:6,r:.8},2,3,{tone:'mid',bevel:.3});
        cylinder(`stand.clamp.knob.${ri}.${ci}`,x,y+1.5,2.1,5,2,{tone:'mid'},line(k.knurl(x,y+1.5,2.1,5,7,16,P),'lo'));
      }
    }
    slab('stand.specimen-mat',{x:-L/2-2,y:-W/2-2,w:L+4,d:W+4,r:.8},0,z,{tone:'lo',bevel:.3});
    const plaque={x:-L/2+4,y:-W/2-24,w:Math.min(44,L+12),d:7,r:.7};
    const engraving=[2,3.8,5.5].map((dy,i)=>k.lineSvg(k.lineOnTop([plaque.x+5,plaque.y+dy],[plaque.x+plaque.w-5-i*4,plaque.y+dy],.9,P),{tone:'lo',free:true})).join('');
    slab('stand.identity-plate',plaque,0,.9,{tone:'lo'},engraving);
    screw('stand.identity.rivet.0',plaque.x+2,plaque.y+3.5,.9,.6);
    screw('stand.identity.rivet.1',plaque.x+plaque.w-2,plaque.y+3.5,.9,.6);

    if(m.kind==='prism'){
      const selected=Number.isInteger(Number(layer))?Math.max(0,Math.min(count-1,Number(layer))):count-1;
      for(let i=0;i<count;i++){
        const bottom=z+i*(UNIT+gap),top=bottom+UNIT,plan={x:-L/2,y:-W/2,w:L,d:W,r:0};
        let grid='';
        // Every grid segment ends on a face boundary, so it measures a real unit.
        for(let x=1;x<m.a;x++){
          grid+=line(k.lineOnTop([-L/2+x*UNIT,-W/2],[-L/2+x*UNIT,W/2],top,P),'mid');
          grid+=line(k.segment([-L/2+x*UNIT,W/2,bottom],[-L/2+x*UNIT,W/2,top],P),'mid');
        }
        for(let y=1;y<m.b;y++){
          grid+=line(k.lineOnTop([-L/2,-W/2+y*UNIT],[L/2,-W/2+y*UNIT],top,P),'mid');
          grid+=line(k.segment([L/2,-W/2+y*UNIT,bottom],[L/2,-W/2+y*UNIT,top],P),'mid');
        }
        slab(`specimen.layer.${i}`,plan,bottom,UNIT,{tone:i===selected?'hi':'mid',lit:i===selected},grid);
      }
    } else if(m.kind==='scale') {
      // Only the specified long edge is calibrated. Width/height are decorative.
      const block={x:-L/2,y:-W/2+5,w:L,d:W-10,r:0};
      const marks=[];
      for(let x=0;x<=m.a;x++)marks.push(line(k.segment([-L/2+x*UNIT,W/2-5,z],[-L/2+x*UNIT,W/2-5,z+H],P),'mid'));
      slab('specimen.scale-model',block,z,H,{tone:'hi'},marks.join(''));
      // A long top inlay identifies exactly the edge that the ruler measures.
      slab('specimen.measured-edge',{x:-L/2,y:W/2-7,w:L,d:2,r:0},z+H,.55,{tone:'hi',lit:true});
    } else if(m.kind==='cylinder') {
      const radius=line(k.lineOnTop([0,0],[m.R,0],z+H,P),'hi')+dot([0,0,z+H],1,'hi');
      const circles=[];
      for(let h=1;h<m.b;h++)circles.push(line(k.sideArc(0,0,m.R,z+h*UNIT,P,60),'mid'));
      cylinder('specimen.cylinder',0,0,m.R,z,H,{tone:'hi'},circles.join('')+radius);
    } else if(m.kind==='cone'&&g) {
      const frame=g.frameAlong([0,0,z],[0,0,1]);
      const paths=g.solidOf([[0,m.R],[H,0]],frame,P,{steps:96,smooth:{slope:()=>-m.R/H}});
      let rings='';
      const camera=k.cameraOf(P),theta=P.azimuth*Math.PI/180;
      const visibleHalf=Math.acos(-Math.min(1,(m.R/H)*camera.sinE/camera.cosE));
      for(let h=1;h<m.b;h++){
        const radius=m.R*(1-h/m.b),points=[];
        for(let j=0;j<=72;j++){
          const angle=theta-visibleHalf+2*visibleHalf*j/72;
          points.push(k.iso([radius*Math.cos(angle),radius*Math.sin(angle),z+h*UNIT],P));
        }
        rings+=line(k.pathOf(points,visibleHalf===Math.PI),'mid');
      }
      put('specimen.cone',paths,[-m.R,-m.R,z],[m.R,m.R,z+H],{tone:'hi',inner:rings},{type:'cone',frame,R:m.R,H,z});
    } else if(m.kind==='sphere'&&g) {
      const centre=[0,0,z+m.R];
      const equator=line(k.sideArc(0,0,m.R,z+m.R,P,72),'mid');
      put('specimen.sphere',g.sphereOf(centre,m.R,P,{steps:96}),[-m.R,-m.R,z],[m.R,m.R,z+H],{tone:'hi',inner:equator},{type:'sphere',centre,r:m.R});
    } else return null;
    const sorted=order(parts,k,P);
    const bounds=fit.map(p=>k.iso(p,P));
    return {m,P,parts:sorted,width,height,bounds};
  }

  function draw(options) {
    const s=scene(options);if(!s)return null;
    const {m,width,height,parts}=s, id=options.lessonId;
    const title=id==='scale-drawings'?'Scale model on a measuring bench':id==='surface-area'?'Unit squares on the faces of a box':m.kind==='prism'?'Unit layers on a measuring bench':`${m.kind[0].toUpperCase()+m.kind.slice(1)} on a measuring bench`;
    const desc=m.kind==='scale'?`Drawing length ${number(m.a)} centimeters. Each centimeter represents ${number(m.b)} meters, giving a real length of ${number(m.real)} meters.`:id==='surface-area'?`Length ${m.a}, width ${m.b}, height ${m.c}. Face areas ${m.a*m.b}, ${m.a*m.c}, and ${m.b*m.c} each occur twice. Total surface area ${m.area} square units.`:m.kind==='prism'?`Length ${m.a}, width ${m.b}, height ${m.c}. ${m.c} layers each contain ${m.a*m.b} unit cubes. Volume ${m.volume} cubic units.${m.exploded?' The displayed gaps are illustrative and add no volume.':''}`:`Radius ${m.a}${m.kind==='sphere'?'':`, height ${m.b}`}. Volume ${number(m.volume)} cubic units. All specimen dimensions use the same scale.`;
    return `<svg xmlns="http://www.w3.org/2000/svg" class="iso iso-svg math-iso-svg" data-theme="light" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="iso-${id}-title iso-${id}-desc" data-lesson="${id}" data-parts="${parts.length}" data-volume="${m.volume===null?'':m.volume}" data-length="${m.L}" data-width="${m.W}" data-height="${m.H}" data-unit="${UNIT}" data-separated="${m.exploded}"><title id="iso-${id}-title">${esc(title)}</title><desc id="iso-${id}-desc">${esc(desc)} ${esc(info(id).caption)}</desc>${parts.map(p=>`<g data-math-part="${p.name}">${p.svg}</g>`).join('')}</svg>`;
  }

  window.MathAtlasIsometric={supports:id=>IDS.has(id),draw,info};
  // The inspection hook uses the same scene as the drawing, for geometry checks.
  Object.defineProperty(window.MathAtlasIsometric,'inspect',{value:scene,enumerable:false});
})();
