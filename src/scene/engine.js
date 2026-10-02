import React from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Room } from './room.jsx';
import { stations } from './stations.js';
import { createCinematic } from './cinematic.js';
import { normalizeGraphics } from './graphics.js';
import { trackAssets } from './loading.js';
import { createBenchmark } from './benchmark.js';

function FrameDriver({ tick, render }) {
  useFrame((state, delta) => tick(state, delta));
  useFrame((state, delta) => render(state, delta), 1);
  return null;
}
// R3F owns the scene hierarchy, renderer, camera, resize, and frame scheduler.
// The controller keeps the existing game-facing camera inspection contract.
export function createEngine(container, onPick, onHover, initialGraphics) {
  trackAssets(THREE.DefaultLoadingManager);
  return new Promise((resolve, reject) => {
    let settled = false;
    const reactRoot = createRoot(container, {
      onUncaughtError(error) {
        fail(error);
      },
    });
    const readyTimeout = setTimeout(() => fail(new Error('Cảnh 3D không khởi tạo kịp.')), 15000);
    function fail(error) {
      if (settled) return;
      settled = true;
      clearTimeout(readyTimeout);
      reactRoot.unmount();
      reject(error);
    }
    let scene, camera, renderer, canvas, room, invalidateFrame, cinematic, benchmark;
    let graphics = normalizeGraphics(initialGraphics);
    let notebookDistance = graphics.dpr >= 1.65 ? 8 : 3.45;
    const benchmarkMode = new URLSearchParams(location.search).get('benchmark');
    const profiling = benchmarkMode === '1' || benchmarkMode === 'ambient';
    const benchmarkSize = new URLSearchParams(location.search)
      .get('size')
      ?.match(/^(\d{3,4})x(\d{3,4})$/);
    const fixedSize =
      profiling && benchmarkSize && benchmarkSize.slice(1).every((n) => +n >= 256 && +n <= 4096);
    const canvasProps = {
      frameloop: 'demand',
      shadows: 'percentage',
      dpr: Math.min(devicePixelRatio || 1, graphics.dpr) * graphics.resolution,
      camera: { fov: 58, near: 0.1, far: 40, position: stations.desk.position },
      gl: { antialias: false, powerPreference: 'high-performance' },
      onCreated: ready,
      onPointerMissed: () => setHover(null, null),
      style: fixedSize
        ? { width: `${benchmarkSize[1]}px`, height: `${benchmarkSize[2]}px` }
        : { width: '100%', height: '100%' },
    };
    function renderCanvas() {
      reactRoot.render(
        React.createElement(
          Canvas,
          canvasProps,
          React.createElement('color', { attach: 'background', args: ['#3e3028'] }),
          React.createElement('fog', { attach: 'fog', args: ['#3a2d24', 9, 22] }),
          React.createElement(FrameDriver, { tick, render: renderFrame }),
          React.createElement(Room, {
            onReady: roomReady,
            onObjectPick,
            onObjectHover,
            notebookDistance,
          }),
        ),
      );
    }
    const position = new THREE.Vector3(),
      target = new THREE.Vector3(),
      look = new THREE.Vector3();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let cursorYaw = 0,
      cursorPitch = 0,
      parallaxYaw = 0,
      parallaxPitch = 0,
      last = performance.now();
    let paused = false,
      disposed = false,
      hover = null,
      animation = null,
      inspection = null,
      entry = null,
      frames = 0;
    let effects = true,
      ambientTimer = 0;
    function invalidate(shadows = false) {
      if (shadows && renderer) renderer.shadowMap.needsUpdate = true;
      if (!disposed && !paused && !document.hidden) invalidateFrame?.();
    }
    function setGraphics(value) {
      benchmark?.reset();
      graphics = normalizeGraphics(value);
      const dpr = Math.min(devicePixelRatio || 1, graphics.dpr) * graphics.resolution;
      const shadows = graphics.shadows > 0 ? 'percentage' : false;
      const distance = graphics.dpr >= 1.65 ? 8 : 3.45;
      const changed =
        canvasProps.dpr !== dpr || canvasProps.shadows !== shadows || notebookDistance !== distance;
      notebookDistance = distance;
      canvasProps.dpr = dpr;
      canvasProps.shadows = shadows;
      stateRef?.setDpr(dpr);
      if (changed) renderCanvas();
      if (renderer) {
        renderer.shadowMap.enabled = graphics.shadows > 0;
        cinematic?.configure(graphics);
      }
      room?.setGraphics(graphics);
      room?.setEffects(effects && graphics.atmosphere && !reduce.matches);
      clearTimeout(ambientTimer);
      container.dataset.graphicsPreset = graphics.preset;
      invalidate(true);
    }
    function renderFrame(state, delta) {
      if (disposed || paused || document.hidden) return;
      const stable = container.dataset.renderMode !== 'animating';
      benchmark?.begin(stable);
      if (cinematic) cinematic.render(state, delta, look);
      else state.gl.render(state.scene, state.camera);
      if (benchmark?.end(stable) && benchmarkMode === '1') invalidate();
    }
    function setHover(id, mesh, event) {
      if (mesh && (paused || animation || entry)) return;
      const changed = hover !== mesh;
      hover = mesh;
      // The HTML marker uses viewport coordinates, just like the native pointer.
      if (mesh && event) onHover(id, { x: event.clientX, y: event.clientY });
      else if (changed) onHover(null);
      if (changed) invalidate();
    }
    function goTo(id, immediate = false) {
      inspection = null;
      animation = null;
      const view = stations[id];
      position.fromArray(view.position);
      target.fromArray(view.target);
      if (immediate || reduce.matches) {
        camera.position.copy(position);
        look.copy(target);
        camera.lookAt(look);
      } else
        animation = {
          id: null,
          start: performance.now(),
          from: camera.position.clone(),
          fromTarget: look.clone(),
          to: position.clone(),
          toTarget: target.clone(),
          duration: 1050,
          travel: true,
        };
      setHover(null, null);
      invalidate();
    }
    function finishEntrance() {
      entry = null;
      room?.setEntryDoor(1);
      goTo('desk', true);
    }
    function beginEntrance(seconds) {
      if (!room || !camera) return;
      room.setEntryDoor(0);
      if (reduce.matches) {
        finishEntrance();
        return;
      }
      paused = false;
      stateRef.setFrameloop('demand');
      animation = inspection = null;
      camera.position.set(0, 1.6, 3.18);
      look.set(0, 1.52, -1.5);
      camera.lookAt(look);
      entry = { start: performance.now(), duration: Math.max(2.4, seconds) * 1000 };
      setHover(null, null);
      invalidate(true);
    }
    function onObjectPick(id, mesh) {
      activate({ id, mesh });
    }
    function onObjectHover(id, mesh, event) {
      setHover(id, mesh, event);
    }
    function activate(found) {
      if (room.interactions.has(found.id)) {
        setHover(null, null);
        onPick(found.id);
        return;
      }
      if (animation || inspection) return;
      room.prepareInspection?.(found.id);
      const bounds = new THREE.Box3().setFromObject(found.mesh),
        center = bounds.getCenter(new THREE.Vector3()),
        size = bounds.getSize(new THREE.Vector3());
      inspection = { position: position.clone(), target: target.clone() };
      const direction = camera.position.clone().sub(center).normalize();
      const distance = Math.max(
        0.45,
        (Math.max(size.x, size.y, size.z) /
          (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))) *
          Math.max(1, 1 / camera.aspect) *
          1.3,
      );
      const destination = center.clone().addScaledVector(direction, distance);
      destination.y = Math.max(destination.y, center.y + 0.22);
      setHover(null, null);
      if (reduce.matches) {
        position.copy(destination);
        target.copy(center);
        camera.position.copy(position);
        look.copy(target);
        camera.lookAt(look);
        onPick(found.id);
        return;
      }
      animation = {
        id: found.id,
        start: performance.now(),
        from: camera.position.clone(),
        fromTarget: look.clone(),
        to: destination,
        toTarget: center,
      };
      invalidate();
    }
    function returnFromInspection() {
      if (!inspection) return;
      const saved = inspection;
      inspection = null;
      animation = null;
      position.copy(saved.position);
      target.copy(saved.target);
      if (reduce.matches) {
        camera.position.copy(position);
        look.copy(target);
        camera.lookAt(look);
      }
      invalidate();
    }
    function focusObject(id) {
      const mesh = room.targets.get(id)?.[0];
      if (mesh) activate({ id, mesh });
    }
    const handleMove = (e) => {
      if (e.pointerType === 'mouse' && !reduce.matches) {
        const rect = canvas.getBoundingClientRect();
        cursorYaw =
          -THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1) * 0.095;
        cursorPitch =
          -THREE.MathUtils.clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1) * 0.07;
        invalidate();
      }
    };
    const handleLeave = () => {
      setHover(null, null);
      cursorYaw = cursorPitch = 0;
      invalidate();
    };
    const handlers = [
      ['pointermove', handleMove],
      ['pointerleave', handleLeave],
    ];
    function tick({ gl }, delta) {
      if (disposed || paused || document.hidden) return;
      const now = performance.now(),
        dt = Math.min(delta || (now - last) / 1000, 0.05);
      last = now;
      camera.position.lerp(position, 1 - Math.exp(-dt * 8));
      look.lerp(target, 1 - Math.exp(-dt * 8));
      const parallaxEase = 1 - Math.exp(-dt * 6);
      parallaxYaw += (cursorYaw - parallaxYaw) * parallaxEase;
      parallaxPitch += (cursorPitch - parallaxPitch) * parallaxEase;
      camera.lookAt(look);
      camera.rotateY(parallaxYaw);
      camera.rotateX(parallaxPitch);
      let completed = null;
      if (entry) {
        const progress = Math.min((now - entry.start) / entry.duration, 1);
        const opened = THREE.MathUtils.smoothstep(progress, 0, 0.48);
        room.setEntryDoor(opened);
        const travel = THREE.MathUtils.smoothstep(progress, 0.18, 1);
        camera.position.set(
          THREE.MathUtils.lerp(0, stations.desk.position[0], travel),
          THREE.MathUtils.lerp(1.6, stations.desk.position[1], travel),
          THREE.MathUtils.lerp(3.18, stations.desk.position[2], travel),
        );
        look.set(
          0,
          THREE.MathUtils.lerp(1.52, stations.desk.target[1], travel),
          THREE.MathUtils.lerp(-1.5, stations.desk.target[2], travel),
        );
        camera.lookAt(look);
        if (progress === 1) {
          entry = null;
          position.fromArray(stations.desk.position);
          target.fromArray(stations.desk.target);
        }
      } else if (animation) {
        const progress = Math.min((now - animation.start) / (animation.duration || 850), 1),
          ease = progress * progress * (3 - 2 * progress);
        camera.position.lerpVectors(animation.from, animation.to, ease);
        if (animation.travel) camera.position.y += Math.sin(progress * Math.PI) * 0.035;
        look.lerpVectors(animation.fromTarget, animation.toTarget, ease);
        camera.lookAt(look);
        if (progress === 1) {
          position.copy(animation.to);
          target.copy(animation.toTarget);
          completed = animation.id;
          animation = null;
        }
      }
      scene.updateMatrixWorld();
      for (const lod of room.lods) {
        const previous = lod.getCurrentLevel();
        lod.update(camera);
        if (previous !== lod.getCurrentLevel()) renderer.shadowMap.needsUpdate = true;
      }
      frames++;
      container.dataset.renderFrames = String(frames);
      container.dataset.lodLevels = room.lods.map((l) => l.getCurrentLevel()).join(',');
      const moving =
        !!entry ||
        !!animation ||
        camera.position.distanceToSquared(position) > 0.000001 ||
        look.distanceToSquared(target) > 0.000001 ||
        Math.abs(parallaxYaw - cursorYaw) > 0.0001 ||
        Math.abs(parallaxPitch - cursorPitch) > 0.0001;
      container.dataset.renderMode = moving
        ? 'animating'
        : effects && graphics.atmosphere && !reduce.matches
          ? 'atmosphere'
          : 'idle';
      if (moving) invalidate();
      clearTimeout(ambientTimer);
      if (!moving && effects && graphics.atmosphere && !reduce.matches)
        ambientTimer = setTimeout(() => invalidate(), 40);
      if (completed) onPick(completed);
    }
    const visibility = () => {
      clearTimeout(ambientTimer);
      last = performance.now();
      invalidate();
    };
    const motionChange = () => {
      room?.setEffects(effects && graphics.atmosphere && !reduce.matches);
      invalidate();
    };
    function roomReady(api) {
      room = api;
      finishSetup();
    }
    function finishSetup() {
      if (settled || !scene || !room) return;
      try {
        handlers.forEach(([name, handler]) => canvas.addEventListener(name, handler));
        document.addEventListener('visibilitychange', visibility);
        reduce.addEventListener('change', motionChange);
        setGraphics(graphics);
        goTo('desk', true);
        settled = true;
        clearTimeout(readyTimeout);
        resolve({
          refresh: () => invalidate(true),
          goTo,
          focusObject,
          returnFromInspection,
          beginEntrance,
          finishEntrance,
          interact: (id) => room.interact(id),
          canvas,
          cancelPendingInspection() {
            if (animation?.id) returnFromInspection();
          },
          setGraphics,
          setEffects(value) {
            effects = value;
            clearTimeout(ambientTimer);
            room.setEffects(value && graphics.atmosphere && !reduce.matches);
            invalidate();
          },
          setPaused(value) {
            benchmark?.reset();
            paused = value;
            clearTimeout(ambientTimer);
            setHover(null, null);
            container.dataset.renderMode = value ? 'paused' : 'idle';
            stateRef.setFrameloop(value ? 'never' : 'demand');
            if (!value) invalidate();
          },
          dispose() {
            disposed = true;
            clearTimeout(ambientTimer);
            reduce.removeEventListener('change', motionChange);
            document.removeEventListener('visibilitychange', visibility);
            handlers.forEach(([name, handler]) => canvas.removeEventListener(name, handler));
            cinematic?.dispose();
            benchmark?.dispose();
            environment?.dispose();
            reactRoot.unmount();
          },
        });
      } catch (error) {
        fail(error);
      }
    }
    let stateRef, environment;
    function ready(state) {
      try {
        stateRef = state;
        scene = state.scene;
        camera = state.camera;
        renderer = state.gl;
        canvas = renderer.domElement;
        invalidateFrame = state.invalidate;
        renderer.toneMapping = THREE.AgXToneMapping;
        renderer.toneMappingExposure = 1.08;
        // Soft interior bounce from a local procedural room, no remote HDR.
        const pmrem = new THREE.PMREMGenerator(renderer),
          bounceRoom = new RoomEnvironment();
        environment = pmrem.fromScene(bounceRoom, 0.04);
        bounceRoom.dispose();
        pmrem.dispose();
        scene.environment = environment.texture;
        scene.environmentIntensity = 0.11;
        renderer.shadowMap.autoUpdate = false;
        renderer.shadowMap.needsUpdate = true;
        cinematic = createCinematic(renderer, scene, camera, graphics, container);
        if (profiling) benchmark = createBenchmark(renderer, container);
        finishSetup();
      } catch (error) {
        fail(error);
      }
    }
    try {
      renderCanvas();
    } catch (error) {
      fail(error);
    }
  });
}
