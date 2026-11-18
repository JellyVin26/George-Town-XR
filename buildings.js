/* Photo-referenced hand-built geometry; dimensions, hidden elevations and surroundings are illustrative. */
window.GTBuildings=(()=>{
 const models=[
  {wall:'#436c9d',trim:'#e2ded0',shutter:'#153650',roof:'#a65c44',w:10,h:4.5,d:5.6,bays:5},
  {wall:'#ece2c8',trim:'#be883e',shutter:'#7e352b',roof:'#a54832',w:8.5,h:3.65,d:5.8,bays:3},
  {wall:'#78a98d',trim:'#eee9c9',shutter:'#225b4f',roof:'#8f543c',w:9,h:5.3,d:6.5,bays:5}
 ];
 const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 function mesh(site,tour){
  const {wall,trim,shutter,roof,w,h,d,bays}=models[site], faces=[],front=-d/2;
  function face(v,color){
   const n=cross(sub(v[1],v[0]),sub(v[2],v[0])),mag=Math.hypot(...n);
   const light=.83+.16*Math.abs(dot(n,[-.4,.8,-.45])/mag)-(n[1]===0?.08*Math.abs(n[0]/mag):0);
   const rgb=color.slice(1).match(/../g).map(hex=>Math.round(parseInt(hex,16)*light));
   faces.push({v,rgb});
  }
  function box(x,y,z,a,b,c,color){
   const X=x+a,Y=y+b,Z=z+c;
   const p=[[x,y,z],[X,y,z],[X,Y,z],[x,Y,z],[x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z]];
   for(const f of [[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2],[3,2,6,7],[4,5,1,0]])face(f.map(i=>p[i]),color);
  }
  function gable(width,depth,y,rise,color,overhang=.28){
   const x=width/2+overhang,z=depth/2, ridge=y+rise;
   face([[-x,y,-z],[x,y,-z],[x,ridge,0],[-x,ridge,0]],color);
   face([[x,y,z],[-x,y,z],[-x,ridge,0],[x,ridge,0]],color);
   face([[-x,y,z],[-x,y,-z],[-x,ridge,0]],color);
   face([[x,y,-z],[x,y,z],[x,ridge,0]],color);
   for(let i=1;i<6;i++){
    const t=i/6, yy=y+rise*t+.014, zz=z*(1-t), edge=x-.06;
    for(const sign of [-1,1])face([[-edge,yy,sign*zz],[edge,yy,sign*zz],[edge,yy+.04*rise/z,sign*(zz-.04)],[-edge,yy+.04*rise/z,sign*(zz-.04)]],'#753c30');
   }
  }
  // Segmented eaves and contrasting fascia read clearly from the ground-level tour.
  function eave(width,z,y,depth,rise,color,curved=false){
   const segments=curved?12:1;
   const edge=(i,t)=>{const u=2*i/segments-1;return [width*u/2,y+rise*t+(curved?.44*Math.pow(Math.abs(u),5)*(1-.72*t):0),z+depth*t];};
   for(let i=0;i<segments;i++){
    for(let j=0;j<5;j++)face([edge(i,j/5),edge(i+1,j/5),edge(i+1,(j+1)/5),edge(i,(j+1)/5)],j%2?color:'#97513b');
    const a=edge(i,0),b=edge(i+1,0);face([a,b,[b[0],b[1]-.12,b[2]],[a[0],a[1]-.12,a[2]]],trim);
   }
  }
  box(-w/2-.32,-.12,front-.36,w+.64,.46,d+.72,'#b9aa91');
  box(-w/2,.34,front,w,h-.34,d,wall);
  box(-w/2-.13,h-.18,front-.13,w+.26,.21,d+.26,trim);
  const center=2.05;
  function window(x,y,z,width,height,dir){
   const base=dir<0?z-.095:z;
   box(x-width/2-.12,y-.11,base,width+.24,height+.22,.095,trim);
   box(x-width/2,y,dir<0?base-.035:base+.095,width,height,.035,shutter);
   for(let i=1;i<=3;i++)box(x-width/2+i*width/4-.018,y,dir<0?base-.045:base+.13,.036,height,.012,trim);
  }
  for(let i=0;i<bays;i++){
   const x=(i-(bays-1)/2)*w/(bays+.4);
   if(site!==1){window(x,h-1.7,front,1.15,1.2,-1);if(i!==(bays-1)/2)window(x,.95,front,.92,1.12,-1);}
   if(i!==1||bays>3)window(x,.92,d/2,.9,1.15,1);
  }
  if(site!==1)box(-w/2-.08,site===2?2.25:center,front-.12,w+.16,site===2?.16:.14,d+.24,trim);
  window(0,.34,front,1.28,site===1?2.48:1.67,-1);
  if(site===1){
   // Raised portico, deep eaves and a stepped ridge, not a measured reconstruction.
   for(const x of [-3.4,-1.9,1.9,3.4]){
    box(x-.24,.3,front-1.45,.48,.23,.48,'#a99a82');
    box(x-.16,.53,front-1.37,.32,2.64,.32,shutter);
    box(x-.26,3.15,front-1.47,.52,.25,.52,trim);
   }
   box(-4.4,3.26,front-1.58,8.8,.32,1.8,trim);
   for(let i=0;i<5;i++)box(-1.35,.1*i-.12,front-2.42+i*.18,2.7,.12,.94-i*.06,'#a99a82');
   for(const x of [-3.45,-1.95,1.95,3.45]){
    box(x-.28,3.04,front-1.59,.56,.10,.52,trim);
    box(x-.35,3.15,front-1.65,.7,.10,.64,'#704230');
   }
   for(let i=-9;i<=9;i++)box(i*.43-.038,3.39,front-1.61,.076,.16,.11,'#78513b');
   eave(9.3,front-2.05,3.61,2.36,.92,roof,true);
   gable(w+.2,d+.65,h,1.52,roof);
   box(-w/2-.35,h+1.47,-.14,w+.7,.19,.28,trim);
   for(const side of [-1,1])for(let i=0;i<5;i++){
    const x=side*(w/2-.52+i*.2);
    box(x-.12,h+1.55+i*i*.019,-.15,.24,.18,.30,i%2?'#758367':trim);
   }
   for(let i=-8;i<=8;i++)box(i*.39-.064,h+1.65,-.11,.128,i%2?.09:.16,.22,i%2?roof:trim);
  }else{
   gable(w,d+.55,h,site===0?1.23:.84,roof);
   for(const x of [-w/2+.12,w/2-.35])box(x,.34,front-.15,.23,h-.45,.15,trim);
   if(site===2){
    box(-2.1,2.25,front-.76,4.2,.16,.76,trim);
    box(-2.1,2.87,front-.76,4.2,.08,.1,trim);
    for(let i=-9;i<=9;i++)box(i*.22-.025,2.41,front-.76,.05,.46,.08,trim);
    for(const x of [-2.04,-.72,.72,2.04]){
     box(x-.055,.34,front-.75,.11,1.91,.11,shutter);
     box(x-.11,.34,front-.81,.22,.18,.23,trim);
     box(x-.055,2.41,front-.75,.11,1.25,.11,shutter);
     face([[x-.23,3.60,front-.76],[x+.23,3.60,front-.76],[x,3.32,front-.76]],trim);
    }
    eave(4.68,front-1.01,3.67,1.06,.23,roof);
    for(let i=-8;i<=8;i++)box(i*.24-.035,3.50,front-1.01,.07,.14,.05,trim);
   }else{
    eave(3.1,front-1.14,2.39,1.2,.35,roof,true);
    box(-1.48,2.33,front-1.06,2.96,.12,.16,'#234a69');
    for(const x of [-1.35,1.35]){
     box(x-.06,.34,front-.98,.12,2.05,.12,'#24455f');
     box(x-.12,.34,front-1.04,.24,.18,.24,trim);
     box(x*.62-.045,.76,front-.191,.09,1.17,.04,'#a6854d');
    }
    for(const x of [-3.5,3.5]){
     box(x-1.1,.15,front+1.05,2.2,2.1,4.1,wall);
     box(x-1.22,2.24,front+.94,2.44,.17,4.32,roof);
    }
   }
  }
  if(tour){
   box(-60,-.21,-60,120,.05,120,'#ddd5bf');
   box(-6,-.16,-12,12,.02,15,'#bfb29c');
   for(let i=0;i<13;i++){
    box(-6,-.14,-12+i*1.1,12,.006,.025,'#a79b86');
    for(let j=0;j<5;j++)box(-5.7+j*2.3+(i%2)*.9,-.14,-12+i*1.1,.025,.006,1.1,'#a79b86');
   }
   for(const z of [-13,6]){
    box(-14,0,z,28,.85,.34,'#ad9b81');
    box(-14,.85,z-.045,28,.12,.43,'#cabc9e');
   }
   for(const x of [-10,10])for(const z of [-9,-2,4]){
    box(x-.13,0,z-.13,.26,2,.26,'#80684d');
    box(x-.85,1.6,z-.66,1.7,1.55,1.32,'#668267');
    box(x-.6,3,z-.5,1.2,.55,1,'#8b9b68');
   }
  }else box(-w/2-1,-.35,front-.95,w+2,.23,d+1.9,'#d8c8aa');
  return {faces,anchors:[[site===1?-1.9:-1.65,site===1?3.18:h-1.11,front-(site===1?1.49:.15)],[site===1?1.9:1.65,site===1?1.1:1.3,front-(site===1?1.45:.15)]],front};
 }
 const scenes=models.map((_,i)=>[mesh(i,false),mesh(i,true)]);
 // ponytail: software depth buffer keeps the small models offline and GPU-independent. Move to WebGL for larger meshes.
 const near=.16;
 function clip(poly){
  const visible=[];
  for(let i=0;i<poly.length;i++){
   const a=poly[i],b=poly[(i+1)%poly.length],inA=a[2]>=near,inB=b[2]>=near;
   if(inA)visible.push(a);
   if(inA!==inB){const t=(near-a[2])/(b[2]-a[2]);visible.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,near]);}
  }
  return visible;
 }
 const buffers=new WeakMap();
 function triangle({width:w,height:h,data},depth,a,b,c,[r,g,blue]){
  const [ax,ay,az]=a,[bx,by,bz]=b,[cx,cy,cz]=c;
  const ux=bx-ax,uy=by-ay,vx=cx-ax,vy=cy-ay,area=ux*vy-uy*vx;
  if(Math.abs(area)<1e-7)return;
  const minX=Math.max(0,Math.ceil(Math.min(ax,bx,cx)-.5)),maxX=Math.min(w-1,Math.floor(Math.max(ax,bx,cx)-.5));
  const minY=Math.max(0,Math.ceil(Math.min(ay,by,cy)-.5)),maxY=Math.min(h-1,Math.floor(Math.max(ay,by,cy)-.5));
  for(let y=minY;y<=maxY;y++){
   const dy=y+.5-ay;
   for(let x=minX;x<=maxX;x++){
    const dx=x+.5-ax;
    const u=(dx*vy-dy*vx)/area,v=(ux*dy-uy*dx)/area;
    if(u< -1e-9||v< -1e-9||u+v>1+1e-9)continue;
    // Reciprocal depth is affine in screen space; nearest surface wins per pixel.
    const z=az+u*(bz-az)+v*(cz-az),i=y*w+x;
    if(z<=depth[i])continue;
    depth[i]=z;const j=i*4;data[j]=r;data[j+1]=g;data[j+2]=blue;data[j+3]=255;
   }
  }
 }
 function draw(canvas,site,{tour=false,yaw=0,pitch=0,zoom=1,room=0,marker=null}={}){
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  const {clientWidth:w,clientHeight:h}=canvas;if(!w||!h)return [];
  const ratio=marker?1:Math.min(2,window.devicePixelRatio||1),W=Math.round(w*ratio),H=Math.round(h*ratio);
  if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}
  const {faces,anchors,front}=scenes[site][Number(tour)];
  const a=yaw*Math.PI/180,p=pitch*Math.PI/180,c=Math.cos(a),s=Math.sin(a),sy=Math.sin(p),cp=Math.cos(p);
  const right=[c,0,-s],up=[-s*sy,cp,-c*sy],forward=[s*cp,sy,c*cp];
  const eye=tour?(room?[-6.6,1.7,front-6.6]:[.4,1.7,front-9.3]):sub([0,2.55,0],forward.map(v=>v*17));
  const f=tour?Math.min(h*.77,w*.78):Math.min(w,h*1.52)*1.05*zoom;
  const camera=marker?.camera || (v=>{const delta=sub(v,eye);return [dot(delta,right),dot(delta,up),dot(delta,forward)];});
  const project=marker?.project || (v=>[w/2+v[0]*f/v[2],h/2-v[1]*f/v[2]]);
  const frame=buffers.get(canvas);
  let image,depth;
  if(frame?.image.width===W&&frame.image.height===H){({image,depth}=frame);image.data.fill(0);depth.fill(0);}
  else{image=ctx.createImageData(W,H);depth=new Float32Array(W*H);buffers.set(canvas,{image,depth});}
  for(const {v,rgb} of faces){
   const poly=clip(v.map(camera)).map(v=>[...project(v).map(p=>p*ratio),1/v[2]]);
   for(let i=1;i+1<poly.length;i++)triangle(image,depth,poly[0],poly[i],poly[i+1],rgb);
  }
  ctx.putImageData(image,0,0);
  return anchors.map(v=>{const pos=camera(v),[x,y]=project(pos);return {x,y,visible:pos[2]>near&&Math.cos(a)>0&&x>=22&&y>=22&&x<=w-22&&y<=h-22};});
 }
 return {draw};
})();
