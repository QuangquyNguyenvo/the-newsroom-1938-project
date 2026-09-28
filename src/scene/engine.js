import React from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Room, stations } from './room.jsx';

function FrameDriver({ tick }) {
  useFrame((state, delta) => tick(state, delta));
  return null;
}
// R3F owns the scene hierarchy, renderer, camera, resize, and frame scheduler.
// The controller keeps the existing game-facing camera inspection contract.
export function createEngine(container, onPick, onHover) {
  return new Promise((resolve, reject) => {
    let settled=false;
    const reactRoot=createRoot(container,{onUncaughtError(error){fail(error);}});
    const readyTimeout=setTimeout(()=>fail(new Error('Cảnh 3D không khởi tạo kịp.')),15000);
    function fail(error){if(settled)return;settled=true;clearTimeout(readyTimeout);reactRoot.unmount();reject(error);}
    let scene,camera,renderer,canvas,room,invalidateFrame;
    const outline=new THREE.BoxHelper(undefined,'#e8c569');
    outline.visible=false;outline.material.depthTest=false;outline.renderOrder=10;outline.raycast=()=>{};
    const canvasProps={
      frameloop:'demand',shadows:'percentage',dpr:[1,1.5],
      camera:{fov:58,near:.1,far:40,position:stations.desk.position},
      gl:{antialias:true,powerPreference:'high-performance'},
      onCreated:ready,onPointerMissed:()=>setHover(null,null),style:{width:'100%',height:'100%'}
    };
    function renderCanvas(){
      reactRoot.render(React.createElement(Canvas,canvasProps,
        React.createElement('color',{attach:'background',args:['#3e3028']}),
        React.createElement('fog',{attach:'fog',args:['#3e3028',8,18]}),
        React.createElement(FrameDriver,{tick}),
        React.createElement(Room,{onReady:roomReady,onObjectPick,onObjectHover}),
        React.createElement('primitive',{object:outline,dispose:null})
      ));
    }
    const position=new THREE.Vector3(),target=new THREE.Vector3(),look=new THREE.Vector3();
    const reduce=matchMedia('(prefers-reduced-motion: reduce)');
    let cursorYaw=0,cursorPitch=0,parallaxYaw=0,parallaxPitch=0,last=performance.now();
    let paused=false,disposed=false,hover=null,animation=null,inspection=null,entry=null,frames=0;
    function invalidate(shadows=false) {
      if(shadows&&renderer)renderer.shadowMap.needsUpdate=true;
      if(!disposed&&!paused&&!document.hidden)invalidateFrame?.();
    }
    function setHover(id,mesh) {
      if(hover===mesh)return;
      hover=mesh;outline.visible=!!mesh;
      if(mesh)outline.setFromObject(mesh);
      onHover(id);invalidate();
    }
    function goTo(id,immediate=false) {
      inspection=null;animation=null;
      const view=stations[id];position.fromArray(view.position);target.fromArray(view.target);
      if(immediate||reduce.matches){camera.position.copy(position);look.copy(target);camera.lookAt(look);}
      setHover(null,null);invalidate();
    }
    function finishEntrance() {
      entry=null;
      room?.setEntryDoor(1);
      goTo('desk',true);
    }
    function beginEntrance(seconds) {
      if(!room||!camera)return;
      room.setEntryDoor(0);
      if(reduce.matches){finishEntrance();return;}
      paused=false;stateRef.setFrameloop('demand');
      animation=inspection=null;
      camera.position.set(0,1.6,3.18);
      look.set(0,1.52,-1.5);camera.lookAt(look);
      entry={start:performance.now(),duration:Math.max(2.4,seconds)*1000};
      setHover(null,null);invalidate(true);
    }
    function onObjectPick(id,mesh){activate({id,mesh});}
    function onObjectHover(id,mesh){setHover(id,mesh);}
    function activate(found) {
      if(room.interactions.has(found.id)){setHover(null,null);onPick(found.id);return;}
      if(animation||inspection)return;
      const bounds=new THREE.Box3().setFromObject(found.mesh),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
      inspection={position:position.clone(),target:target.clone()};
      const direction=camera.position.clone().sub(center).normalize();
      const distance=Math.max(.45,Math.max(size.x,size.y,size.z)/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)))*Math.max(1,1/camera.aspect)*1.3);
      const destination=center.clone().addScaledVector(direction,distance);destination.y=Math.max(destination.y,center.y+.22);
      outline.visible=false;onHover(null);
      if(reduce.matches){position.copy(destination);target.copy(center);camera.position.copy(position);look.copy(target);camera.lookAt(look);onPick(found.id);return;}
      animation={id:found.id,start:performance.now(),from:camera.position.clone(),fromTarget:look.clone(),to:destination,toTarget:center};invalidate();
    }
    function returnFromInspection() {
      if(!inspection)return;
      const saved=inspection;inspection=null;animation=null;
      position.copy(saved.position);target.copy(saved.target);
      if(reduce.matches){camera.position.copy(position);look.copy(target);camera.lookAt(look);}
      invalidate();
    }
    function focusObject(id){const mesh=room.targets.get(id)?.[0];if(mesh)activate({id,mesh});}
    const handleMove=e=>{
      if(e.pointerType==='mouse'&&!reduce.matches){
        const rect=canvas.getBoundingClientRect();
        cursorYaw=-THREE.MathUtils.clamp(((e.clientX-rect.left)/rect.width)*2-1,-1,1)*.095;
        cursorPitch=-THREE.MathUtils.clamp(((e.clientY-rect.top)/rect.height)*2-1,-1,1)*.07;
        invalidate();
      }
    };
    const handleLeave=()=>{setHover(null,null);cursorYaw=cursorPitch=0;invalidate();};
    const handlers=[['pointermove',handleMove],['pointerleave',handleLeave]];
    function tick({gl},delta) {
      if(disposed||paused||document.hidden)return;
      const now=performance.now(),dt=Math.min(delta||((now-last)/1000),.05);last=now;
      camera.position.lerp(position,1-Math.exp(-dt*8));look.lerp(target,1-Math.exp(-dt*8));
      const parallaxEase=1-Math.exp(-dt*6);
      parallaxYaw+=(cursorYaw-parallaxYaw)*parallaxEase;parallaxPitch+=(cursorPitch-parallaxPitch)*parallaxEase;
      camera.lookAt(look);camera.rotateY(parallaxYaw);camera.rotateX(parallaxPitch);
      let completed=null;
      if(entry){
        const progress=Math.min((now-entry.start)/entry.duration,1);
        const opened=THREE.MathUtils.smoothstep(progress,0,.48);
        room.setEntryDoor(opened);
        const travel=THREE.MathUtils.smoothstep(progress,.18,1);
        camera.position.set(
          THREE.MathUtils.lerp(0,stations.desk.position[0],travel),
          THREE.MathUtils.lerp(1.6,stations.desk.position[1],travel),
          THREE.MathUtils.lerp(3.18,stations.desk.position[2],travel)
        );
        look.set(0,THREE.MathUtils.lerp(1.52,stations.desk.target[1],travel),THREE.MathUtils.lerp(-1.5,stations.desk.target[2],travel));
        camera.lookAt(look);
        if(progress===1){entry=null;position.fromArray(stations.desk.position);target.fromArray(stations.desk.target);}
      }else if(animation){
        const progress=Math.min((now-animation.start)/850,1),ease=progress*progress*(3-2*progress);
        camera.position.lerpVectors(animation.from,animation.to,ease);
        look.lerpVectors(animation.fromTarget,animation.toTarget,ease);camera.lookAt(look);
        if(progress===1){position.copy(animation.to);target.copy(animation.toTarget);completed=animation.id;animation=null;}
      }
      scene.updateMatrixWorld();
      for(const lod of room.lods){const previous=lod.getCurrentLevel();lod.update(camera);if(previous!==lod.getCurrentLevel())renderer.shadowMap.needsUpdate=true;}
      frames++;
      container.dataset.renderFrames=String(frames);
      container.dataset.drawCalls=String(gl.info.render.calls);
      container.dataset.triangles=String(gl.info.render.triangles);
      container.dataset.lodLevels=room.lods.map(l=>l.getCurrentLevel()).join(',');
      const moving=!!entry||!!animation||camera.position.distanceToSquared(position)>.000001||look.distanceToSquared(target)>.000001||Math.abs(parallaxYaw-cursorYaw)>.0001||Math.abs(parallaxPitch-cursorPitch)>.0001;
      container.dataset.renderMode=moving?'animating':'idle';
      if(moving)invalidate();
      if(completed)onPick(completed);
    }
    const visibility=()=>invalidate();
    function roomReady(api){room=api;finishSetup();}
    function finishSetup(){
      if(settled||!scene||!room)return;
      try{
        handlers.forEach(([name,handler])=>canvas.addEventListener(name,handler));
        document.addEventListener('visibilitychange',visibility);
        goTo('desk',true);
        settled=true;clearTimeout(readyTimeout);
        resolve({goTo,focusObject,returnFromInspection,beginEntrance,finishEntrance,interact:id=>room.interact(id),canvas,
          setPaused(value){paused=value;container.dataset.renderMode=value?'paused':'idle';stateRef.setFrameloop(value?'never':'demand');if(!value)invalidate();},
          dispose(){disposed=true;document.removeEventListener('visibilitychange',visibility);handlers.forEach(([name,handler])=>canvas.removeEventListener(name,handler));outline.geometry.dispose();outline.material.dispose();reactRoot.unmount();}
        });
      }catch(error){fail(error);}
    }
    let stateRef;
    function ready(state) {
      try {
        stateRef=state;
        scene=state.scene;camera=state.camera;renderer=state.gl;canvas=renderer.domElement;invalidateFrame=state.invalidate;
        renderer.toneMappingExposure=.94;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
        finishSetup();
      }catch(error){fail(error);}
    }
    try{
      renderCanvas();
    }catch(error){fail(error);}
  });
}
