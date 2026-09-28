import React, { Suspense, forwardRef, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Detailed, useGLTF, useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { makeMaterials, labelTexture, pageTexture } from './materials.js';

export const stations = {
  desk: { label: 'Bàn biên tập', position: [.65, 1.65, 1.55], target: [0, .8, -1.55] },
  shelf: { label: 'Kệ tư liệu', position: [-.9, 1.65, .85], target: [-1.91, 1.05, -1.6] },
  press: { label: 'Bàn in', position: [.7, 1.6, .85], target: [1.7, .65, -.65] },
};

const ambientIds = new Set(['window', 'lamp', 'chair', 'ink', 'clock', 'calendar']);
const InteractionContext = React.createContext(null);
const base = import.meta.env.BASE_URL;
const assetUrl = asset => `${base}assets/models/${asset}/${asset === 'proofing-press' ? 'proofing-press.glb' : asset + '_1k.gltf'}`;

function boxGeometry(size, tiles) {
  const geometry = new THREE.BoxGeometry(...size);
  if (tiles) {
    const uv = geometry.attributes.uv;
    const scale = tiles === 'tile' ? 2 / 3 : tiles === 'wall' ? 2.2 : 1.5;
    const faces = [[size[2], size[1]], [size[2], size[1]], [size[0], size[2]], [size[0], size[2]], [size[0], size[1]], [size[0], size[1]]];
    for (let i = 0; i < uv.count; i++) {
      const [width, height] = faces[Math.floor(i / 4)];
      uv.setXY(i, uv.getX(i) * width / scale, uv.getY(i) * height / scale);
    }
  }
  return geometry;
}

const Box = forwardRef(function Box({ size, position = [0, 0, 0], material, tiles, rotation, ...props }, ref) {
  const geometry = useMemo(() => boxGeometry(size, tiles), [...size, tiles]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh ref={ref} geometry={geometry} material={material} position={position} rotation={rotation} castShadow receiveShadow {...props} />;
});

function Target({ id, register, children, ...props }) {
  const group = useRef();
  const interactions = useContext(InteractionContext);
  useLayoutEffect(() => register(id, group.current), [id, register]);
  return <group ref={group} userData={{ interaction: id }}
    onPointerOver={event => { event.stopPropagation(); interactions?.hover(id, group.current); }}
    onPointerOut={event => { event.stopPropagation(); interactions?.hover(null, null); }}
    onClick={event => { event.stopPropagation(); interactions?.pick(id, group.current); }}
    {...props}>{children}</group>;
}

class AssetBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('Không tải được mô hình hoặc ảnh trong phòng:', error); }
  render() { return this.state.failed ? null : this.props.children; }
}
function Asset({ children }) {
  return <AssetBoundary><Suspense fallback={null}>{children}</Suspense></AssetBoundary>;
}

function releaseModel(root) {
  root.traverse(object => {
    object.geometry?.dispose();
    for (const material of object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : []) {
      for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
      material.dispose();
    }
  });
}

function Model({ asset, size, position, rotation, preserve = false, modelRef }) {
  const { scene: source } = useGLTF(assetUrl(asset));
  const fit = useMemo(() => {
    const object = source.clone(true);
    object.traverse(mesh => {
      if (!mesh.isMesh) return;
      mesh.geometry = mesh.geometry.clone();
      const cloneMaterial = material => {
        const copy = material.clone();
        for (const [key, value] of Object.entries(copy)) if (value?.isTexture) copy[key] = value.clone();
        if (copy.name === 'vintage_oil_lamp_glass') {
          copy.map?.dispose();
          copy.alphaMap?.dispose();
          copy.map = copy.alphaMap = null;
          copy.color.set('#efe9dc');
          copy.transparent = true;
          copy.opacity = .22;
          copy.metalness = 0;
          copy.roughness = .2;
          copy.depthWrite = false;
          copy.side = THREE.DoubleSide;
        }
        if (asset === 'wooden_table_02') {
          copy.roughness = 1;
          copy.roughnessMap?.dispose();
          copy.roughnessMap = null;
          copy.metalness = 0;
        }
        for (const texture of Object.values(copy)) if (texture?.isTexture) texture.anisotropy = 4;
        return copy;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(cloneMaterial) : cloneMaterial(mesh.material);
      mesh.castShadow = mesh.receiveShadow = true;
    });
    const bounds = new THREE.Box3().setFromObject(object);
    const extent = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const parent = new THREE.Group();
    parent.scale.set(size[0] / extent.x, size[1] / extent.y, size[2] / extent.z);
    if (preserve) parent.scale.setScalar(size[0] / extent.x);
    object.position.sub(new THREE.Vector3(center.x, bounds.min.y, center.z));
    parent.add(object);
    return parent;
  }, [source, asset, ...size, preserve]);
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    invalidate();
    return () => releaseModel(fit);
  }, [fit, invalidate]);
  return <group ref={modelRef} position={position} rotation={rotation}><primitive object={fit} dispose={null} /></group>;
}

function ModelAt({ id, register, ...props }) {
  return <Target id={id} register={register}>
    <Asset><Model {...props} /></Asset>
  </Target>;
}

function Label({ title, subtitle, size, position }) {
  const texture = useMemo(() => labelTexture(title, subtitle), [title, subtitle]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={position}>
    <planeGeometry args={size} />
    <meshStandardMaterial map={texture} roughness={1} />
  </mesh>;
}

function Outside() {
  const texture = useTexture(`${base}assets/references/saigon-1930.jpg`);
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    // Crop the postcard mount; only the photographed street is visible.
    texture.repeat.set(.47, .8);
    texture.offset.set(.28, .1);
    texture.needsUpdate = true;
  }, [texture]);
  return <mesh position={[0, 2.6, -5.2]}>
    <planeGeometry args={[2.7, 3.45]} />
    <meshBasicMaterial map={texture} color="#eee6d3" toneMapped={false} />
  </mesh>;
}

function Shutter({ side, material, register, hingeRef }) {
  return <Target id="window" register={register} position={[side * .84, 2.6, -2.88]}>
    <group ref={hingeRef} rotation={[0, side * 1.42, 0]}>
      <group position={[-side * .36, 0, 0]}>
        {[-.36, .36].map(edge => <Box key={edge} size={[.065, 2.08, .075]} position={[edge, 0, 0]} material={material} tiles="wood" />)}
        {[-1.005, 0, 1.005].map(edge => <Box key={edge} size={[.73, .065, .075]} position={[0, edge, 0]} material={material} tiles="wood" />)}
        {Array.from({ length: 15 }, (_, index) => <Box key={index} size={[.64, .092, .04]} position={[0, -.91 + index * .13, 0]} rotation={[-.45, 0, 0]} material={material} tiles="wood" />)}
        <mesh position={[side * .24, -.03, .058]} material={material} castShadow>
          <sphereGeometry args={[.022, 8, 6]} />
        </mesh>
      </group>
    </group>
  </Target>;
}

function Window({ m, register, shutterRefs }) {
  return <>
    <Target id="window" register={register}>
      {[-.91, .91].map(x => <Box key={x} size={[.14, 2.37, .22]} position={[x, 2.6, -3.1]} material={m.wood} tiles="wood" />)}
      {[1.43, 3.77].map(y => <Box key={y} size={[1.92, .14, .22]} position={[0, y, -3.1]} material={m.wood} tiles="wood" />)}
      <Box size={[1.98, .1, .38]} position={[0, 1.39, -2.99]} material={m.wood} tiles="wood" />
    </Target>
    <Asset><Outside /></Asset>
    {[-3.23, -3.04].map(z => <React.Fragment key={z}>
      {[-.83, .83].map(x => <Box key={x} size={[.045, 2.25, .045]} position={[x, 2.6, z]} material={m.wood} tiles="wood" />)}
    </React.Fragment>)}
    {[-1, 1].map((side, index) => <Shutter key={side} side={side} material={m.wood} register={register} hingeRef={node => { shutterRefs.current[index] = node; }} />)}
  </>;
}

function PhotoFace({ size }) {
  const texture = useTexture(`${base}assets/references/dan-chung.jpg`);
  const material = useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    const value = new THREE.MeshStandardMaterial({ map: texture, roughness: 1, transparent: true });
    value.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
        float surround=min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b));
        diffuseColor.a *= 1.0-smoothstep(0.82,0.96,surround);`);
    };
    return value;
  }, [texture]);
  useEffect(() => () => material.dispose(), [material]);
  return <mesh position={[0, .0045, 0]} rotation={[-Math.PI / 2, 0, 0]} material={material}>
    <planeGeometry args={[size[0] * .96, size[1] * .96]} />
  </mesh>;
}

function Document({ id, size, position, title, subtitle, angle = 0, m, register, clipped = false }) {
  const texture = useMemo(() => id === 'photo' ? null : pageTexture(title, subtitle, id === 'board'), [id, title, subtitle]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return <Target id={id} register={register} position={position} rotation={[0, angle, 0]}>
    <Box size={[size[0], .008, size[1]]} material={m.paper} />
    {id === 'photo'
      ? <Asset><PhotoFace size={size} /></Asset>
      : <mesh position={[0, .0045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[size[0] * .96, size[1] * .96]} />
          <meshStandardMaterial map={texture} roughness={1} />
        </mesh>}
    {clipped && <mesh position={[-.08, .009, -.14]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 2, 1]}>
      <torusGeometry args={[.018, .002, 6, 18]} />
      <meshStandardMaterial color="#aaa18f" metalness={.65} roughness={.6} />
    </mesh>}
  </Target>;
}

function Notebook({ m, register, addLod }) {
  const ref = useRef();
  useLayoutEffect(() => addLod(ref.current), [addLod]);
  return <Target id="notebook" register={register}>
    <Detailed ref={ref} position={[-2.85, 1.45 + .57 * .7 / 2, -2.16]} scale={.7} distances={[0, 3.45]}>
      <group>
        <Box size={[.23, .55, .4]} material={m.paper} />
        {[-.125, .125].map(x => <Box key={x} size={[.018, .57, .43]} position={[x, 0, 0]} material={m.red} />)}
        <Box size={[.26, .57, .035]} position={[0, 0, -.2]} material={m.red} />
        {Array.from({ length: 20 }, (_, index) => <Box key={index} size={[.23, .002, .008]} position={[0, -.24 + index * .025, .203]} material={m.gold} />)}
      </group>
      <group><Box size={[.26, .57, .43]} material={m.red} /></group>
    </Detailed>
  </Target>;
}

function Archive({ m, register }) {
  return <Target id="archive" register={register} position={[-2.3, .92, -2.1]}>
    {Array.from({ length: 7 }, (_, index) => <Box key={index} size={[.52, .038, .43]} position={[0, -.15 + index * .043, 0]} material={m.paper} />)}
    <Box size={[.07, .32, .445]} material={m.red} />
  </Target>;
}

function Ink({ m, register, capRef }) {
  return <Target id="ink" register={register} position={[.7, 1.08, -2.55]}>
    <mesh position={[0, .055, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[.045, .055, .11, 12]} />
      <meshStandardMaterial color="#202b24" roughness={.45} />
    </mesh>
    <Box ref={capRef} size={[.09, .022, .09]} position={[0, .12, 0]} material={m.dark} tiles="dark" />
  </Target>;
}

function makeCalendarTexture(month) {
  const canvas = document.createElement('canvas');
  canvas.width = 600; canvas.height = 840;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#d7c9a6'; ctx.fillRect(0, 0, 600, 840);
  ctx.fillStyle = '#63271f'; ctx.textAlign = 'center'; ctx.font = '700 46px "Noto Serif"';
  ctx.fillText(month === 6 ? 'JUILLET' : 'AOÛT', 300, 100);
  ctx.font = '400 28px "Noto Serif"'; ctx.fillText('1938', 300, 145);
  ctx.font = '400 20px "Noto Serif"';
  ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach((day, index) => ctx.fillText(day, 68 + index * 77, 220));
  const start = (new Date(Date.UTC(1938, month, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(1938, month + 1, 0)).getUTCDate();
  ctx.fillStyle = '#403827'; ctx.font = '400 28px "Noto Serif"';
  for (let day = 1; day <= days; day++) {
    const cell = start + day - 1;
    ctx.fillText(String(day), 68 + cell % 7 * 77, 290 + Math.floor(cell / 7) * 76);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Calendar({ m, register, materialRef, mapRef }) {
  const maps = useMemo(() => [makeCalendarTexture(6), makeCalendarTexture(7)], []);
  useLayoutEffect(() => { mapRef.current = maps; return () => { mapRef.current = null; }; }, [maps, mapRef]);
  useEffect(() => () => maps.forEach(texture => texture.dispose()), [maps]);
  return <>
    <Target id="calendar" register={register}>
      <mesh position={[1.35, 2.75, -3.105]}>
        <planeGeometry args={[.4, .56]} />
        <meshStandardMaterial ref={materialRef} map={maps[0]} roughness={1} />
      </mesh>
    </Target>
    <Box size={[.42, .035, .035]} position={[1.35, 3.045, -3.07]} material={m.wood} tiles="wood" />
  </>;
}

export function Room({ onReady, onObjectPick, onObjectHover }) {
  const invalidate = useThree(state => state.invalidate);
  const gl = useThree(state => state.gl);
  const m = useMemo(() => makeMaterials(() => invalidate()), [invalidate]);
  const targets = useRef(new Map());
  const lods = useRef([]);
  const shutterRefs = useRef([]);
  const chairRef = useRef(), capRef = useRef();
  const lampLightRef = useRef(), calendarMaterialRef = useRef(), calendarMaps = useRef();
  const propState = useRef({});
  const tweens = useRef(new Set());
  const reduced = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)'), []);
  const register = useCallback((id, object) => {
    if (!object) return () => {};
    object.userData.interaction = id;
    const entries = targets.current.get(id) || [];
    entries.push(object); targets.current.set(id, entries);
    return () => targets.current.set(id, (targets.current.get(id) || []).filter(item => item !== object));
  }, []);
  const addLod = useCallback(lod => {
    if (lod) lods.current.push(lod);
    return () => { lods.current = lods.current.filter(item => item !== lod); };
  }, []);
  const animate = useCallback((object, values) => {
    if (!object) return;
    if (reduced.matches) { gsap.set(object, values); gl.shadowMap.needsUpdate = true; invalidate(); return; }
    const tween = gsap.to(object, { ...values, duration: .55, ease: 'power2.inOut',
      onUpdate: () => { gl.shadowMap.needsUpdate = true; invalidate(); },
      onComplete: () => tweens.current.delete(tween) });
    tweens.current.add(tween);
  }, [gl, invalidate, reduced]);
  const api = useMemo(() => ({
    targets: targets.current, lods: lods.current, interactions: ambientIds,
    interact(id) {
      propState.current[id] = !propState.current[id];
      const active = propState.current[id];
      if (id === 'window') shutterRefs.current.forEach((hinge, index) => animate(hinge?.rotation, { y: active ? 0 : index === 0 ? -1.42 : 1.42 }));
      if (id === 'lamp') animate(lampLightRef.current, { intensity: active ? 0 : .7 });
      if (id === 'chair') animate(chairRef.current?.position, { z: active ? -.55 : -.85 });
      if (id === 'ink') animate(capRef.current?.position, { x: active ? .12 : 0, y: active ? .011 : .12 });
      if (id === 'calendar' && calendarMaterialRef.current && calendarMaps.current) {
        calendarMaterialRef.current.map = calendarMaps.current[active ? 1 : 0];
        calendarMaterialRef.current.needsUpdate = true; invalidate();
      }
      return active;
    }
  }), [animate, invalidate]);
  useLayoutEffect(() => { onReady(api); return () => onReady(null); }, [onReady, api]);
  useEffect(() => () => {
    tweens.current.forEach(tween => tween.kill());
    m.dispose();
    for (const material of Object.values(m)) if (material?.isMaterial) material.dispose();
  }, [m]);
  const sunTarget = useMemo(() => { const object = new THREE.Object3D(); object.position.set(.25, .65, -1.15); return object; }, []);
  const interactionHandlers = useMemo(() => ({pick:onObjectPick,hover:onObjectHover}), [onObjectPick, onObjectHover]);
  return <InteractionContext.Provider value={interactionHandlers}><group scale={.75}>
    <Box size={[8, .12, 8]} position={[0, -.07, 0]} material={m.tile} tiles="tile" />
    <Box size={[3.09, 4.5, .15]} position={[-2.455, 2.2, -3.2]} material={m.wall} tiles="wall" />
    <Box size={[3.09, 4.5, .15]} position={[2.455, 2.2, -3.2]} material={m.wall} tiles="wall" />
    <Box size={[1.82, 1.45, .15]} position={[0, .725, -3.2]} material={m.wall} tiles="wall" />
    <Box size={[1.82, .76, .15]} position={[0, 4.12, -3.2]} material={m.wall} tiles="wall" />
    <Box size={[.15, 4.5, 7]} position={[-4, 2.2, -.2]} material={m.wall} tiles="wall" />
    <Box size={[.15, 4.5, 7]} position={[4, 2.2, -.2]} material={m.wall} tiles="wall" />
    <Box size={[8, .12, 7]} position={[0, 4.48, -.2]} material={m.ceiling} />
    {[-2.7, 0, 2.7].map(x => <Box key={x} size={[.12, .15, 7]} position={[x, 4.34, -.2]} material={m.wood} tiles="wood" />)}
    <Box size={[8, .2, .08]} position={[0, .1, -3.1]} material={m.wood} tiles="wood" />
    <Label title="DÂN CHÚNG" subtitle="SÀI GÒN" size={[.95, .59]} position={[2.6, 3.12, -3.1]} />
    <Window m={m} register={register} shutterRefs={shutterRefs} />
    <Box size={[.72, .065, .28]} position={[2.6, 2.25, -2.94]} material={m.wood} tiles="wood" />
    <ModelAt id="clock" register={register} asset="mantel_clock_01" size={[.5, .32, .18]} position={[2.6, 2.285, -2.89]} preserve />
    <Label title="DÂN CHÚNG" subtitle="22 JUILLET 1938" size={[.55, .344]} position={[-1.65, 2.8, -3.1]} />
    <Asset><Model asset="wooden_table_02" size={[3.4, 1.08, 1.6]} position={[0, 0, -2.1]} /></Asset>
    <ModelAt id="chair" register={register} asset="painted_wooden_chair_01" size={[.6, 1.25, .6]} position={[-.7, 0, -.85]} rotation={[0, Math.PI, 0]} modelRef={chairRef} />
    <Document id="letter" size={[.235, .333]} position={[-1.05, 1.085, -1.65]} title="BẢN THẢO" subtitle="DÂN SINH · DÂN CHỦ" angle={.12} m={m} register={register} clipped />
    <Document id="photo" size={[.31, .42]} position={[-.65, 1.085, -2.4]} title="ẢNH SƯU TẬP" subtitle="THAM KHẢO THỊ GIÁC" angle={-.15} m={m} register={register} />
    <ModelAt id="drawer" register={register} asset="painted_wooden_cabinet" size={[.8, .91, .55]} position={[-2.1, 0, -.8]} />
    <Asset><Model asset="wicker_basket_01" size={[.43, .36, .43]} position={[-2.9, 0, -.12]} /></Asset>
    <Document id="board" size={[.46, .63]} position={[-.2, 1.085, -1.85]} title="DÂN CHÚNG" subtitle="SÀI GÒN · DÂN SINH · DÂN CHỦ" m={m} register={register} />
    <ModelAt id="lamp" register={register} asset="vintage_oil_lamp" size={[.24, .5, .24]} position={[-1.25, 1.08, -2.65]} />
    <Asset><Model asset="jug_01" size={[.19, .26, .19]} position={[1.33, 1.08, -2.65]} /></Asset>
    <pointLight ref={lampLightRef} color="#ffc075" intensity={.7} distance={1.8} position={[-1.25, 1.34, -2.65]} />
    <Asset><Model asset="wooden_bookshelf_worn" size={[1.5, 2.35, .6]} position={[-2.65, 0, -2.2]} /></Asset>
    <Asset><Model asset="wooden_crate_01" size={[.5, .3, .36]} position={[-2.64, 1.16, -2.13]} /></Asset>
    <Notebook m={m} register={register} addLod={addLod} />
    <Archive m={m} register={register} />
    {Array.from({ length: 5 }, (_, index) => <Box key={index} size={[.08, .25 + index * .02, .26]} position={[-3.15 + index * .17, 1.89 + (.25 + index * .02) / 2, -2.18]} material={index % 2 ? m.dark : m.red} tiles={index % 2 ? 'dark' : undefined} />)}
    <ModelAt id="proof" register={register} asset="proofing-press" size={[1.45, 1, 1]} position={[2.75, 0, -.6]} preserve />
    <Document id="proof" size={[.235, .333]} position={[1.08, 1.085, -1.58]} title="BẢN IN THỬ" subtitle="ĐỐI CHIẾU TRƯỚC KHI IN" angle={-.08} m={m} register={register} />
    <Ink m={m} register={register} capRef={capRef} />
    {Array.from({ length: 3 }, (_, index) => <mesh key={index} position={[.38, 1.091, -2.5 + index * .025]} rotation={[0, .1 * index, Math.PI / 2]} material={m.wood}>
      <cylinderGeometry args={[.004, .004, .25, 6]} />
    </mesh>)}
    <Calendar m={m} register={register} materialRef={calendarMaterialRef} mapRef={calendarMaps} />
    <hemisphereLight args={['#e7e5df', '#322b24', .9]} />
    <primitive object={sunTarget} />
    <directionalLight color="#ffe4b1" intensity={2.1} position={[-1.8, 4.6, -5.1]} target={sunTarget} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-.001} />
    <pointLight color="#ffe5bd" intensity={.65} distance={3.2} position={[0, 2.8, -2.8]} />
  </group></InteractionContext.Provider>;
}
