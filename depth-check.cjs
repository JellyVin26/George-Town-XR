const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
  await page.goto(pathToFileURL(require('node:path').resolve('index.html')).href+'#artifact');
  const counts=await page.evaluate(()=>{
   selectSite(2);state.viewer=true;render();
   const canvas=document.querySelector('#model canvas');
   return Array.from({length:25},(_,i)=>i*5-82).map(angle=>{
    state.angle=angle;state.pitch=9;setModel();
    const yaw=(angle+22)*Math.PI/180,pitch=-8*Math.PI/180;
    const c=Math.cos(yaw),s=Math.sin(yaw),p=Math.cos(pitch),q=Math.sin(pitch);
    const w=canvas.width,h=canvas.height,f=Math.min(w,h*1.52)*1.05;
    // Sample the dark panels between pale mullions in all five upper windows.
    const data=canvas.getContext('2d').getImageData(0,0,w,h).data;
    return [-2,-1,0,1,2].flatMap(bay=>[-.44,-.14,.14,.44].map(offset=>{
     const x=bay*9/5.4+offset,y=4.2-2.55,z=-3.38,d=17+x*s*p+y*q+z*c*p;
     const X=Math.round(w/2+(x*c-z*s)*f/d),Y=Math.round(h/2-(-x*s*q+y*p-z*c*q)*f/d);
     const i=4*(Y*w+X);return Array.from(data.slice(i,i+3));
    }));
   });
  });
  const failures=counts.map((samples,i)=>({yaw:i*5-60,bad:samples.filter(([r,g,b])=>r>=65||g>=115||b>=100).length})).filter(x=>x.bad);assert.deepEqual(failures,[],'Upper window panels must stay visible');
  console.log('PASS: All five Pinang upper windows stay visible across 25 poses.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
