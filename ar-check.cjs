const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg'};
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.resolve(__dirname,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(__dirname+path.sep)||!types[path.extname(file)]){res.writeHead(404).end();return;}
  fs.readFile(file,(err,buf)=>{if(err)res.writeHead(404).end();else res.writeHead(200,{'Content-Type':types[path.extname(file)]}).end(buf)});
 }).listen(0,'127.0.0.1');
 let browser;
 try{
  await new Promise((resolve,reject)=>server.once('listening',resolve).once('error',reject));
  browser=await chromium.launch({channel:'msedge'});
  const page=await browser.newPage({viewport:{width:390,height:844}});
  page.setDefaultTimeout(4500);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.calls=0;
   navigator.mediaDevices.getUserMedia=async()=>{
    calls++;
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=480;
    const ctx=canvas.getContext('2d');
    const stream=canvas.captureStream(15);window.cameraTrack=stream.getVideoTracks()[0];
    window.frame=async(id,x=120,angle=0,stretch=1)=>{
     const img=new Image();if(id!==null){img.src=`assets/markers/stop-${id+1}.svg`;await img.decode();}
     ctx.fillStyle='#aaa';ctx.fillRect(0,0,640,480);
     if(id!==null){ctx.save();ctx.translate(x,210);ctx.rotate(angle);ctx.scale(stretch,1);ctx.drawImage(img,-90,-90,180,180);ctx.restore();}
     cameraTrack.requestFrame();
    };
    await frame(null);return stream;
   };
  });
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html#overlay`);
  await page.evaluate(()=>{state.mode='onsite';render()});
  assert.equal(await page.evaluate(()=>calls),0);
  const start=page.getByRole('button',{name:'Start camera',exact:true});
  await start.click();
  const status=page.locator('#camera-preview [role=status]');
  const art=page.locator('.gt-ar-overlay');
  await page.waitForFunction(()=>document.querySelector('video').readyState>=2);
  assert.match(await status.textContent(),/marker/i,'Live camera should search for a real marker');
  await page.evaluate(()=>frame(0));
  await art.waitFor({state:'visible'});
  assert.match(await status.textContent(),/tracking active/i);
  assert.equal(await art.evaluate(el=>el.tagName),'CANVAS','Tracking must render a 3D mesh, not a photo card');
  const pixels=()=>art.evaluate(el=>{
   const {width,height}=el,d=el.getContext('2d').getImageData(0,0,width,height).data;
   const colors=new Set();let count=0,sumX=0,sumY=0;
   for(let i=0;i<d.length;i+=4)if(d[i+3]){colors.add(`${d[i]},${d[i+1]},${d[i+2]}`);count++;sumX+=(i/4)%width;sumY+=Math.floor(i/4/width);}
   return {count,x:sumX/count,y:sumY/count,colors:colors.size,frame:el.toDataURL()};
  });
  const pose=await pixels();
  assert(pose.count>400&&pose.colors>5,'Tracked building must draw shaded geometry');
  assert(pose.x<135&&pose.y<(await art.boundingBox()).height*.44,'Building should sit above the marker center');
  await page.evaluate(()=>frame(0,330,0.6,.65));
  await page.waitForFunction(p=>{const el=document.querySelector('.gt-ar-overlay');return !el.hidden&&el.toDataURL()!==p},pose.frame);
  assert((await pixels()).x>pose.x+45,'Moving the marker should move the mesh');
  await page.evaluate(()=>frame(1));
  await art.waitFor({state:'hidden'});
  assert.match(await status.textContent(),/different stop/i);
  await page.evaluate(()=>frame(0,315,-1.5));
  await art.waitFor({state:'visible'});
  await page.evaluate(()=>frame(null));
  await art.waitFor({state:'hidden'});
  await page.evaluate(()=>frame(0));
  await art.waitFor({state:'visible'});
  await page.getByRole('button',{name:'Stop camera',exact:true}).click();
  await art.waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>cameraTrack.readyState),'ended');
  await page.evaluate(()=>{state.lang='bm';go('artifact');selectSite(2);render()});
  await page.getByRole('button',{name:'Mulakan kamera',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);
  await page.evaluate(()=>frame(2,300,.1));
  await art.waitFor({state:'visible'});
  assert.match(await status.textContent(),/Penjejakan aktif/);
  await page.evaluate(()=>go('tour'));
  assert.equal(await page.evaluate(()=>cameraTrack.readyState),'ended');
  await page.evaluate(()=>{state.mode='remote';go('overlay')});
  assert.equal(await page.locator('#camera-preview').count(),0);
  assert.equal(await page.evaluate(()=>calls),2);
  assert.deepEqual(errors,[]);
  console.log('PASS: live frame detection, translated/rotated/scaled pose, wrong stop, loss/reacquisition, EN/BM, camera cleanup, Remote.');
 }finally{await browser?.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
