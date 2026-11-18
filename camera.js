/* Load before app.js; mount only in on-site mode; call stop() before route rendering.
   GTCamera.mount(scene, { lang: 'en', onRemote: () => setMode('remote') });
   lang accepts 'en' or 'bm'. mount replaces container contents; use a dedicated host.
   Optional 3D marker tracking; no recording, storage or uploads. */
(() => {
  let current;
  let observer;
  let generation = 0;
  const copy = {
    en: { title: 'On-site camera', note: 'Live camera preview only — no AR tracking. Images are not saved or uploaded.', start: 'Start camera', stop: 'Stop camera', retry: 'Retry camera', remote: 'Use remote mode', ready: 'Camera off. Start when you are ready.', requesting: 'Waiting for camera permission…', live: 'Camera live. Preview only.', stopped: 'Camera stopped.' },
    bm: { title: 'Kamera di lokasi', note: 'Pratonton kamera langsung sahaja — tiada penjejakan AR. Imej tidak disimpan atau dimuat naik.', start: 'Mulakan kamera', stop: 'Hentikan kamera', retry: 'Cuba kamera semula', remote: 'Guna mod jarak jauh', ready: 'Kamera dimatikan. Mulakan apabila bersedia.', requesting: 'Menunggu kebenaran kamera…', live: 'Kamera aktif. Pratonton sahaja.', stopped: 'Kamera dihentikan.' }
  };
  function stop() {
    generation++;
    if (!current) return;
    current.stopAR?.();
    current.stopAR = null;
    current.stream?.getTracks().forEach(track => track.stop());
    current.stream = null;
    current.video.srcObject = null;
    current.status.textContent = current.text.stopped;
    current.start.disabled = false;
    current.end.disabled = true;
  }
  function mount(container, options = {}) {
    stop();
    const text = copy[options.lang] || copy.en;
    const ar = options.ar && window.GTAR && window.GTBuildings ? options.ar : null;
    const arCopy = options.lang === 'bm' ? {
      title:'AR bangunan 3D', note:'Cetak penanda yang sepadan atau paparkan pada skrin lain. Pastikan keempat-empat sudut dan bingkai putih kelihatan. Halakan kamera dari atas secara bersudut untuk melihat model ilustrasi 3D. Imej kamera kekal pada peranti ini.', marker:'Buka penanda', search:'Mencari penanda hentian ini…', tracked:'Penjejakan aktif. Bangunan 3D dipaparkan.', lost:'Penanda hilang. Halakan kamera semula.', wrong:'Ini penanda hentian lain.', unavailable:'Penjejakan tidak tersedia. Pratonton sahaja.'
    } : {
      title:'3D building AR', note:'Print the matching marker or show it on another screen. Keep all four corners and the white border visible. Look down at an angle to see the illustrative 3D model. Camera frames stay on this device.', marker:'Open marker', search:'Looking for this stop’s marker…', tracked:'Tracking active. 3D building visible.', lost:'Marker lost. Point the camera at it again.', wrong:'Marker belongs to a different stop.', unavailable:'Tracking unavailable. Preview only.'
    };
    const root = document.createElement('section');
    root.className = 'gt-camera';
    root.lang = options.lang === 'bm' ? 'ms' : 'en';
    root.innerHTML = `<style>.gt-camera{background:#f7f3e8;color:#243d38;padding:20px;border-radius:16px;font:inherit}.gt-camera video{display:block;background:#20332f;width:100%;max-height:55vh;border-radius:12px;object-fit:cover}.gt-camera button{min-height:44px;padding:10px 18px;margin:8px 8px 0 0;border:1px solid #256258;border-radius:24px;background:#256258;color:#fff;font:inherit;cursor:pointer}.gt-camera button:focus-visible{outline:3px solid #b45f3e;outline-offset:3px}.gt-camera button:disabled{opacity:.55;cursor:default}.gt-camera [role=status]{min-height:1.5em}</style><h3></h3><p></p><video autoplay muted playsinline></video><p role="status" aria-live="polite"></p><button type="button"></button><button type="button" disabled></button><button type="button"></button>`;
    root.querySelector('h3').textContent = text.title;
    root.querySelector('p').textContent = text.note;
    const video = root.querySelector('video');
    video.setAttribute('aria-label', ar ? arCopy.title : text.title);
    let overlay;
    if (ar) {
      root.classList.add('gt-tracked-camera');
      root.querySelector('h3').textContent = arCopy.title;
      const note=root.querySelector('p');note.textContent=arCopy.note;
      const link=document.createElement('a');
      link.className='gt-marker-link';link.href=`assets/markers/stop-${ar.id+1}.svg`;
      link.target='_blank';link.rel='noopener';link.textContent=arCopy.marker;
      link.setAttribute('aria-label',`${arCopy.marker}: ${ar.name}`);note.after(link);
      const stage=document.createElement('div');stage.className='gt-ar-stage';video.before(stage);stage.append(video);
      overlay=document.createElement('canvas');overlay.className='gt-ar-overlay';overlay.hidden=true;overlay.setAttribute('aria-hidden','true');
      stage.append(overlay);
    }
    const status = root.querySelector('[role=status]');
    const [start, end, remote] = root.querySelectorAll('button');
    start.textContent = text.start;
    end.textContent = text.stop;
    remote.textContent = text.remote;
    remote.onclick = () => { stop(); options.onRemote?.(); };
    end.onclick = stop;
    const state = current = { root, video, status, start, end, text, stream: null };
    status.textContent = text.ready;
    start.onclick = async () => {
      const token = ++generation;
      start.disabled = true;
      end.disabled = false;
      status.textContent = text.requesting;
      try {
        if (!window.isSecureContext) throw { name: 'InsecureContext' };
        if (!navigator.mediaDevices?.getUserMedia) throw { name: 'Unsupported' };
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (token !== generation) { stream.getTracks().forEach(track => track.stop()); return; }
        state.stream = stream;
        video.srcObject = stream;
        await video.play();
        if (token !== generation) return;
        status.textContent = ar ? arCopy.search : text.live;
        if (ar) {
          const update=key=>{if(status.textContent!==arCopy[key])status.textContent=arCopy[key];};
          try { state.stopAR=GTAR.start(video,overlay,ar.id,update); }
          catch { update('unavailable'); }
        }
        end.disabled = false;
      } catch (error) {
        if (token !== generation) return;
        stop();
        const errors = {
          NotAllowedError: ['Camera permission denied. Allow camera in browser settings, then retry, or use remote mode.', 'Kebenaran kamera ditolak. Benarkan kamera dalam tetapan pelayar, kemudian cuba semula atau guna mod jarak jauh.'],
          NotFoundError: ['No camera found. Connect a camera or use remote mode.', 'Tiada kamera ditemui. Sambungkan kamera atau guna mod jarak jauh.'],
          NotReadableError: ['Camera is busy or unavailable. Close other camera apps and retry.', 'Kamera sedang digunakan atau tidak tersedia. Tutup aplikasi kamera lain dan cuba semula.'],
          InsecureContext: ['Camera needs HTTPS or localhost. Use remote mode on this connection.', 'Kamera memerlukan HTTPS atau localhost. Guna mod jarak jauh pada sambungan ini.'],
          Unsupported: ['Camera is not supported in this browser. Use remote mode.', 'Kamera tidak disokong oleh pelayar ini. Guna mod jarak jauh.']
        };
        status.textContent = (errors[error.name] || ['Camera could not start. Retry or use remote mode.', 'Kamera tidak dapat dimulakan. Cuba semula atau guna mod jarak jauh.'])[options.lang === 'bm' ? 1 : 0];
        start.textContent = text.retry;
      }
    };
    container.replaceChildren(root);
    observer?.disconnect();
    observer = new MutationObserver(() => {
      if (!root.isConnected) { stop(); observer.disconnect(); }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return root;
  }
  window.addEventListener('pagehide', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.GTCamera = { mount, stop };
})();
