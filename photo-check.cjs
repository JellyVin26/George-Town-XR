const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:320,height:844},offline:true});
 const base=pathToFileURL(path.resolve('index.html')).href;
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const photo=async(selector,filename)=>{
  const image=page.locator(selector);
  assert.equal(await image.count(),1,`${selector}: photo must be immediately available`);
  assert(await image.isVisible());
  assert.equal(await image.evaluate(async el=>{await el.decode();return el.naturalWidth}),1100);
  assert.match(await image.getAttribute('src'),new RegExp('/'+filename+'[.]jpg$'));
 };
 for(const route of ['explore','overlay','artifact','tour']){
  await page.goto(base+'#'+route);
  for(const lang of ['en','bm'])for(let i=0;i<3;i++){
   const file=['blue-mansion','khoo-kongsi','pinang-mansion'][i];
   await page.evaluate(({i,lang})=>{selectSite(i);state.lang=lang;state.mode='remote';render()},{i,lang});
   if(route==='overlay'){
    await photo('.compare-scene > img',file);
    await photo('#then img',file+'-study');
    await page.locator('#compare').fill('100');
    assert.equal(await page.locator('#then').evaluate(e=>e.style.clipPath),'inset(0px 0% 0px 0px)');
   }else{
    await photo('main img.site-photo',file);
    if(route==='artifact'||route==='tour'){
     assert.equal(await page.locator('canvas:visible').count(),0);
     await page.locator('[data-action="photo-next"]').click();
     await photo('main img.site-photo',file+'-tour');
     await page.locator(`[data-action="${route==='artifact'?'viewer':'tour-model'}"]`).click();
     assert.equal(await page.locator('canvas:visible').count(),1);
     await page.locator('[data-action="show-photos"]').click();
     await photo('main img.site-photo',file+'-tour');
    }
   }
   assert.equal(await page.locator('.photo-credit a[href*="commons.wikimedia.org"]').count(),1);
   assert.equal(await page.locator('.photo-credit a[href*="creativecommons.org"]').count(),1);
   assert(await page.locator('main').evaluate(el=>el.scrollWidth<=el.clientWidth));
  }
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: Compare aligned layers, photo-first Objects/Tour, alternate photos, 3D toggles, credits, all sites EN/BM offline at 320px.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
