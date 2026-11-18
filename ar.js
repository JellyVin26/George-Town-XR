/* Marker pose from the live camera. Frames stay in memory. */
(() => {
  // Decompose the square's homography into a camera-space pose.
  function pose([a,b,c,d],cx,cy,f) {
    const x=b.x-c.x,y=b.y-c.y,u=d.x-c.x,v=d.y-c.y;
    const sx=a.x-b.x+c.x-d.x,sy=a.y-b.y+c.y-d.y,det=x*v-u*y;
    if (Math.abs(det)<1) return null;
    const g=(sx*v-u*sy)/det,h=(x*sy-sx*y)/det;
    const inverse=(x,y,z)=>[(x-cx*z)/f,(y-cy*z)/f,z];
    const colX=inverse((1+g)*b.x-a.x,(1+g)*b.y-a.y,g);
    const colZ=inverse(a.x-(1+h)*d.x,a.y-(1+h)*d.y,-h);
    const colT=inverse(a.x,a.y,1);
    const lenX=Math.hypot(...colX),lenZ=Math.hypot(...colZ);
    const dot=colX.reduce((sum,v,i)=>sum+v*colZ[i],0)/lenX;
    const X=colX.map(v=>v/lenX), z=colZ.map((v,i)=>v-dot*X[i]);
    const len=Math.hypot(...z);
    if (!Number.isFinite(len)||Math.min(lenX,lenZ,len)<1e-5) return null;
    const Z=z.map(v=>v/len);
    const Y=[X[1]*Z[2]-X[2]*Z[1],X[2]*Z[0]-X[0]*Z[2],X[0]*Z[1]-X[1]*Z[0]];
    const T=colT.map((v,i)=>(v+.5*(colX[i]-colZ[i]))*2/(lenX+lenZ));
    // ponytail: approximate intrinsics from video size; use calibrated values if available.
    return {
      camera:([x,y,z])=>T.map((v,i)=>v+(x*X[i]+(y+.35)*Y[i]+z*Z[i])*.075),
      project:([x,y,z])=>[cx+f*x/z,cy+f*y/z]
    };
  }
  function start(video, overlay, id, status) {
    const detector=new AR.Detector({maxHammingDistance:1});
    const canvas=document.createElement('canvas');
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if (!ctx) throw new Error('Canvas unavailable');
    let raf,lastScan=-Infinity,lastFrame=-1,seen=false,previous=null,lastVideoFrame=-Infinity;
    function frame(now) {
      raf=requestAnimationFrame(frame);
      if (now-lastScan<75 || video.readyState<2) return;
      lastScan=now;
      if (lastFrame===video.currentTime) {
        if (now-lastVideoFrame>400 && !overlay.hidden) {
          overlay.hidden=true; previous=null; status('lost');
        }
        return;
      }
      lastFrame=video.currentTime;lastVideoFrame=now;
      const w=video.videoWidth,h=video.videoHeight;
      const scale=Math.min(1,640/Math.max(w,h));
      const cw=Math.round(w*scale),ch=Math.round(h*scale);
      if (!cw||!ch) return;
      if (canvas.width!==cw || canvas.height!==ch) {canvas.width=cw;canvas.height=ch;previous=null;}
      let matches;
      try {
        ctx.drawImage(video,0,0,cw,ch);
        matches=detector.detect(ctx.getImageData(0,0,cw,ch));
      } catch {
        cancelAnimationFrame(raf);overlay.hidden=true;status('unavailable');return;
      }
      const marker=matches.find(m=>m.id===id);
      if (marker) {
        const width=video.clientWidth,height=video.clientHeight;
        const fit=Math.min(width/w,height/h);
        const ox=(width-w*fit)/2,oy=(height-h*fit)/2;
        const points=marker.corners.map(({x,y})=>({x:ox+x*w*fit/cw,y:oy+y*h*fit/ch}));
        if (previous && Math.hypot(points[0].x-previous[0].x,points[0].y-previous[0].y)<32) {
          points.forEach((p,i)=>{p.x=p.x*.78+previous[i].x*.22;p.y=p.y*.78+previous[i].y*.22;});
        }
        const cameraPose=pose(points,width/2,height/2,Math.max(w,h)*fit*.85);
        if (cameraPose) {
          overlay.hidden=false;
          try {
            if (!GTBuildings.draw(overlay,id,{marker:cameraPose})) throw new Error('Model unavailable');
          } catch {
            cancelAnimationFrame(raf);overlay.hidden=true;status('unavailable');return;
          }
          previous=points;seen=true;status('tracked');return;
        }
      }
      previous=null;overlay.hidden=true;
      status(matches.some(m=>m.id>=0&&m.id<3&&m.id!==id)?'wrong':seen?'lost':'search');
    }
    raf=requestAnimationFrame(frame);
    return ()=>{cancelAnimationFrame(raf);overlay.hidden=true;};
  }
  window.GTAR={start};
})();
