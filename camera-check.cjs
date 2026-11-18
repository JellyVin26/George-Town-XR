const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
(async () => {
  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', req.url === '/camera.js' ? 'text/javascript' : 'text/html');
    res.end(req.url === '/camera.js' ? (fs.existsSync(path.join(__dirname, 'camera.js')) ? fs.readFileSync(path.join(__dirname, 'camera.js')) : '') : '<main id="camera"></main><script src="/camera.js"></script>');
  }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  try {
    const context = await browser.newContext({ permissions: ['camera'] });
    const page = await context.newPage();
    await page.goto(`http://localhost:${server.address().port}`);
    assert.equal(await page.evaluate(() => typeof window.GTCamera?.mount), 'function', 'camera API exists');
    await page.evaluate(() => { GTCamera.mount(document.querySelector('main')); });
    assert.equal(await page.locator('video').evaluate(v => v.srcObject), null, 'no automatic camera request');
    await page.getByRole('button', { name: 'Start camera', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
    assert.equal(await page.locator('video').evaluate(v => v.srcObject.getAudioTracks().length), 0);
    assert.equal(await page.locator('video').evaluate(v => v.srcObject.getVideoTracks()[0].readyState), 'live');
    await page.evaluate(() => { window.track = document.querySelector('video').srcObject.getTracks()[0]; GTCamera.stop(); });
    assert.equal(await page.evaluate(() => track.readyState), 'ended');
    console.log('PASS explicit start, native fake-device video, no audio, stop');
    for (const [name, message] of [['NotAllowedError', 'Camera permission denied'], ['NotFoundError', 'No camera found'], ['NotReadableError', 'Camera is busy']]) {
      await page.evaluate(name => {
        navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('raw device failure', name); };
        GTCamera.mount(document.querySelector('main'));
      }, name);
      await page.getByRole('button', { name: 'Start camera', exact: true }).click();
      await page.getByRole('button', { name: 'Retry camera', exact: true }).waitFor();
      assert.match(await page.getByRole('status').textContent(), new RegExp(message));
    }
    await page.evaluate(() => { Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true }); GTCamera.mount(document.querySelector('main')); });
    await page.getByRole('button', { name: 'Start camera', exact: true }).click();
    assert.match(await page.getByRole('status').textContent(), /HTTPS or localhost/);
    console.log('PASS permission, missing device, busy, insecure context');
    await page.evaluate(() => { Object.defineProperty(window, 'isSecureContext', { value: true }); });
    await page.evaluate(() => { GTCamera.mount(document.querySelector('main'), {lang:'bm', onRemote: () => { window.remoteSelected = true; }}); });
    assert.equal(await page.locator('.gt-camera').getAttribute('lang'), 'ms');
    await page.getByRole('button', { name: 'Guna mod jarak jauh', exact: true }).click();
    assert.equal(await page.evaluate(() => remoteSelected), true);
    console.log('PASS Malay UI, remote callback');
    for (const event of ['pagehide', 'hidden', 'unmount']) {
      await page.reload();
      await page.evaluate(() => GTCamera.mount(document.querySelector('main')));
      await page.getByRole('button', { name: 'Start camera', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
      await page.evaluate(event => {
        window.track = document.querySelector('video').srcObject.getTracks()[0];
        if (event === 'pagehide') window.dispatchEvent(new Event('pagehide'));
        if (event === 'hidden') { Object.defineProperty(document, 'hidden', {value:true}); document.dispatchEvent(new Event('visibilitychange')); }
        if (event === 'unmount') document.querySelector('main').replaceChildren();
      }, event);
      await page.waitForFunction(() => track.readyState === 'ended');
    }
    console.log('PASS pagehide, hidden, unmount cleanup');
    await page.reload();
    await page.evaluate(() => {
      window.calls = 0;
      navigator.mediaDevices.getUserMedia = constraints => { window.calls++; window.constraints = constraints; return new Promise(resolve => window.resolveCamera = resolve); };
      GTCamera.mount(document.querySelector('main'));
    });
    assert.equal(await page.evaluate(() => calls), 0);
    await page.getByRole('button', { name: 'Start camera', exact: true }).click();
    assert.equal(await page.getByRole('button', {name:'Stop camera', exact:true}).isEnabled(), true, 'Stop cancels pending request');
    await page.getByRole('button', {name:'Stop camera', exact:true}).click();
    await page.evaluate(() => {
      window.stoppedLate = false;
      resolveCamera({getTracks: () => [{stop: () => window.stoppedLate = true}]});
    });
    await page.waitForFunction(() => stoppedLate);
    assert.deepEqual(await page.evaluate(() => constraints), {video:{facingMode:{ideal:'environment'}},audio:false});
    console.log('PASS late permission cleanup, rear-facing preference');
    const denyBrowser = await chromium.launch({channel:'msedge', headless:true, args:['--use-fake-device-for-media-stream']});
    const denied = await denyBrowser.newContext();
    const deniedPage = await denied.newPage();
    await deniedPage.goto(`http://localhost:${server.address().port}`);
    const cdp = await denied.newCDPSession(deniedPage);
    const {targetInfo} = await cdp.send('Target.getTargetInfo');
    await cdp.send('Browser.setPermission', {permission:{name:'camera'}, setting:'denied', origin:`http://localhost:${server.address().port}`, browserContextId:targetInfo.browserContextId});
    await deniedPage.evaluate(() => GTCamera.mount(document.querySelector('main')));
    await deniedPage.getByRole('button', {name:'Start camera', exact:true}).click();
    await deniedPage.getByRole('button', {name:'Retry camera', exact:true}).waitFor();
    assert.match(await deniedPage.getByRole('status').textContent(), /permission denied/);
    await denied.close();
    await denyBrowser.close();
    console.log('PASS native browser-context permission denial');

  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
