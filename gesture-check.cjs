const {chromium}=require('playwright');
const assert=require('node:assert/strict');const path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file:///'+path.resolve('index.html').replaceAll('\\','/'));await page.evaluate(()=>{state.mode='remote';state.scan=true;go('overlay')});await page.waitForTimeout(100);const cdp=await page.context().newCDPSession(page);
const drag=async(selector,dx,dy,touch=false)=>{await page.locator(selector).scrollIntoViewIfNeeded();const b=await page.locator(selector).boundingBox();const x=b.x+b.width/2,y=b.y+b.height/2;if(touch){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx,y:y+dy}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}else{await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+dy,{steps:8});await page.mouse.up()}};
for(const i of [0,1,2]){await page.evaluate(i=>{selectSite(i);render()},i);const images=await page.locator('.compare-scene img').evaluateAll(async images=>Promise.all(images.map(async el=>{await el.decode();const b=el.getBoundingClientRect();return [el.src,el.naturalWidth,el.naturalHeight,b.x,b.y,b.width,b.height]})));assert.equal(images.length,2);assert.notEqual(images[0][0],images[1][0]);assert.deepEqual(images[0].slice(1),images[1].slice(1),'Photo and study align')}
await page.evaluate(()=>{selectSite(1);state.scan=true;render()});
for(const touch of [false,true]){await page.locator('#compare').fill('50');await drag('#divider',70,0,touch);const value=Number(await page.locator('#compare').inputValue());assert(value>65,`${touch?'Touch':'Mouse'} divider drag must change comparison, got ${value}`);assert.equal(await page.locator('#divider').evaluate(e=>e.style.left),value+'%');assert.equal(await page.locator('#then').evaluate(e=>e.style.clipPath),`inset(0px ${100-value}% 0px 0px)`);assert.equal(await page.locator('dialog').isVisible(),false)}
await page.locator('#compare').focus();await page.keyboard.press('ArrowLeft');assert(Number(await page.locator('#compare').inputValue())<100);await page.locator('[data-action="facade-info"]').click();assert(await page.locator('dialog').isVisible());await page.locator('#close-dialog').click();
await page.evaluate(()=>{go('artifact');state.viewer=true;render()});await page.waitForTimeout(100);
assert.equal(await page.locator('.controls button').count(),2,'Only zoom movement buttons');
assert.equal(await page.locator('#model canvas:visible').count(),1,'Objects renders a volumetric building');
const frame=selector=>page.locator(`${selector} canvas`).evaluate(c=>c.toDataURL());
const anchors=async()=>page.locator('#model').evaluate(model=>[...model.querySelectorAll('.hotspot')].map(button=>{const mark=button.getBoundingClientRect();return [mark.x+mark.width/2,mark.y+mark.height/2]}));
await page.locator('#model').scrollIntoViewIfNeeded();const initialAnchors=await anchors();assert.equal(initialAnchors.length,2,'Both hotspots share the model transform');
for(const touch of [false,true]){const before=await frame('#model');await drag('#model',45,-35,touch);assert.notEqual(await frame('#model'),before,`${touch?'Touch':'Mouse'} object drag redraws the mesh`);assert.equal(await page.locator('dialog').isVisible(),false)}
const turnedAnchors=await anchors();assert(turnedAnchors.every(([x,y],i)=>Math.hypot(x-initialAnchors[i][0],y-initialAnchors[i][1])>3),'Both markers move when the model turns');
const scene=page.locator('.artifact-scene');await scene.focus();const angle=await page.evaluate(()=>state.angle);await page.keyboard.press('ArrowLeft');assert((await page.evaluate(()=>state.angle))<angle);await page.keyboard.press('ArrowUp');assert((await page.evaluate(()=>state.pitch))>0);await drag('[data-action="blade"]',40,20);assert.equal(await page.locator('dialog').isVisible(),false,'Dragging hotspot must not open detail');await page.locator('[data-action="blade"]').click();assert(await page.locator('dialog').isVisible());await page.locator('#close-dialog').click();
await scene.dispatchEvent('pointercancel',{pointerId:1});const transform=await frame('#model');await page.mouse.move(10,10);assert.equal(await frame('#model'),transform);const zoom=page.locator('[data-action="zoom"]');await zoom.scrollIntoViewIfNeeded();const beforeZoom=await anchors();await zoom.click();assert((await page.evaluate(()=>state.zoom))>1);const afterZoom=await anchors();assert(afterZoom.every(([x,y],i)=>Math.hypot(x-beforeZoom[i][0],y-beforeZoom[i][1])>1),'Both markers move with zoom');await page.evaluate(()=>{state.tourModel=true;go('tour')});
assert.equal(await page.locator('#panorama canvas:visible').count(),1,'Tour uses a 3D viewpoint');
for(const touch of [false,true]){const before=await frame('#panorama');await drag('#panorama',-80,24,touch);assert.notEqual(await frame('#panorama'),before);}
await page.locator('#tour-scene').focus();const startYaw=await page.evaluate(()=>state.pan), beforeTurn=await frame('#panorama');
for(let i=0;i<18;i++)await page.keyboard.press('ArrowRight');
assert.equal(await page.evaluate(()=>state.pan),startYaw+360);assert.equal(await frame('#panorama'),beforeTurn,'360° returns to original view');
await page.locator('[data-action="change-room"]').click();assert.notEqual(await frame('#panorama'),beforeTurn);
const views=[];
for(const i of [0,1,2]){
 await page.evaluate(i=>{selectSite(i);go('artifact');state.viewer=true;render()},i);
 const front=await frame('#model');
 await page.evaluate(()=>{state.angle=180;setModel()});
 const rear=await frame('#model');assert.notEqual(rear,front);assert.equal(await page.locator('#model .hotspot:visible').count(),0);assert.equal(await page.locator('[data-key]:visible').count(),2);
 await page.evaluate(()=>{state.tourModel=true;go('tour')});views.push(await frame('#panorama'));
}
assert.equal(new Set(views).size,3,'Each site has a distinct scene');
await page.evaluate(()=>{window.GTBuildings=undefined;render()});assert.equal(await page.locator('#panorama > svg:visible').count(),1);
await page.evaluate(()=>{go('artifact');state.viewer=true;render()});assert.equal(await page.locator('#model > svg:visible').count(),1);
assert.deepEqual(errors,[]);console.log('PASS: real mouse/touch divider + yaw/pitch drags; synchronized range/clip; keyboard; hotspots; cancel; zoom; 360°; both viewpoints; three sites; 2D fallback');}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
