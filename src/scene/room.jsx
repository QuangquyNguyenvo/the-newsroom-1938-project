import React, {
  Suspense,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { Detailed } from '@react-three/drei/core/Detailed.js';
import { useGLTF } from '@react-three/drei/core/Gltf.js';
import { useTexture } from '@react-three/drei/core/Texture.js';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { makeMaterials, labelTexture, propTexture, photoPrintTexture } from './materials.js';
import { objects as documents } from '../content/chapters.js';
import { Atmosphere, ContactShade } from './atmosphere.jsx';
import { BevelBox, BoundBook, PaperSurface, PaperClip, InkBottle, Pencil } from './props.jsx';
import { StoryProps } from './story-props.jsx';
import { ShelfDressing } from './shelf-dressing.jsx';
import { KnowledgeProps } from './knowledge-props.jsx';
import { roomProps } from '../content/room-props.js';
import { detail, lowDetailModels } from './detail.js';

const ambientIds = new Set(roomProps.map((prop) => prop.id));
const InteractionContext = React.createContext(null);
const base = import.meta.env.BASE_URL;
RectAreaLightUniformsLib.init();
const assetUrl = (asset) =>
  `${base}assets/models/${asset}/${asset === 'proofing-press' ? 'proofing-press.glb' : asset + (detail.low && lowDetailModels.has(asset) ? '_lod.gltf' : '_1k.gltf')}`;

function boxGeometry(size, tiles) {
  const geometry = new THREE.BoxGeometry(...size);
  if (tiles) {
    const uv = geometry.attributes.uv;
    const scale = tiles === 'tile' ? 2 / 3 : tiles === 'wall' ? 2.2 : 1.5;
    const faces = [
      [size[2], size[1]],
      [size[2], size[1]],
      [size[0], size[2]],
      [size[0], size[2]],
      [size[0], size[1]],
      [size[0], size[1]],
    ];
    for (let i = 0; i < uv.count; i++) {
      const [width, height] = faces[Math.floor(i / 4)];
      uv.setXY(i, (uv.getX(i) * width) / scale, (uv.getY(i) * height) / scale);
    }
  }
  return geometry;
}

const Box = forwardRef(function Box(
  { size, position = [0, 0, 0], material, tiles, rotation, ...props },
  ref,
) {
  const geometry = useMemo(() => boxGeometry(size, tiles), [...size, tiles]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      ref={ref}
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
      {...props}
    />
  );
});

function Target({ id, register, children, ...props }) {
  const group = useRef();
  const interactions = useContext(InteractionContext);
  useLayoutEffect(() => register(id, group.current), [id, register]);
  return (
    <group
      ref={group}
      userData={{ interaction: id }}
      onPointerOver={(event) => {
        event.stopPropagation();
        interactions?.hover(id, group.current, event);
      }}
      onPointerMove={(event) => {
        event.stopPropagation();
        interactions?.hover(id, group.current, event);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        interactions?.hover(null, null);
      }}
      onClick={(event) => {
        event.stopPropagation();
        interactions?.pick(id, group.current);
      }}
      {...props}
    >
      {children}
    </group>
  );
}

class AssetBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error('Không tải được mô hình hoặc ảnh trong phòng:', error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function Asset({ children }) {
  return (
    <AssetBoundary>
      <Suspense fallback={null}>{children}</Suspense>
    </AssetBoundary>
  );
}

function Model({ asset, size, position, rotation, preserve = false, modelRef }) {
  const { scene: source } = useGLTF(assetUrl(asset));
  const fit = useMemo(() => {
    const object = source.clone(true);
    const materials = new Map(),
      textures = new Map();
    object.traverse((mesh) => {
      if (!mesh.isMesh) return;
      const cloneMaterial = (material) => {
        if (materials.has(material)) return materials.get(material);
        const copy = material.clone();
        materials.set(material, copy);
        for (const [key, value] of Object.entries(copy))
          if (value?.isTexture) {
            if (!textures.has(value)) textures.set(value, value.clone());
            copy[key] = textures.get(value);
          }
        if (copy.name === 'vintage_oil_lamp_glass') {
          copy.map = copy.alphaMap = null;
          copy.color.set('#efe9dc');
          copy.transparent = true;
          copy.opacity = 0.22;
          copy.metalness = 0;
          copy.roughness = 0.2;
          copy.depthWrite = false;
          copy.side = THREE.DoubleSide;
        }
        if (asset === 'wooden_table_02') {
          copy.color.multiplyScalar(0.68);
          copy.roughness = 0.88;
          copy.metalness = 0;
        }
        for (const texture of Object.values(copy)) if (texture?.isTexture) texture.anisotropy = 8;
        return copy;
      };
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(cloneMaterial)
        : cloneMaterial(mesh.material);
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
    return { object: parent, materials, textures };
  }, [source, asset, ...size, preserve]);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
    return () => {
      fit.materials.forEach((material) => material.dispose());
      fit.textures.forEach((texture) => texture.dispose());
    };
  }, [fit, invalidate]);
  return (
    <group ref={modelRef} position={position} rotation={rotation}>
      <primitive object={fit.object} dispose={null} />
    </group>
  );
}

function ModelAt({ id, register, ...props }) {
  return (
    <Target id={id} register={register}>
      <Asset>
        <Model {...props} />
      </Asset>
    </Target>
  );
}

function Label({ title, subtitle, size, position }) {
  const texture = useMemo(() => labelTexture(title, subtitle), [title, subtitle]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position}>
      <planeGeometry args={size} />
      <meshStandardMaterial map={texture} roughness={1} />
    </mesh>
  );
}

function LeadSorts({ material }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < 36; i++)
      ref.current.setMatrixAt(
        i,
        matrix.makeTranslation(-0.2 + (i % 9) * 0.048, 0.02, -0.06 + Math.floor(i / 9) * 0.046),
      );
    ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, material, 36]} castShadow receiveShadow>
      <boxGeometry args={[0.032, 0.023, 0.025]} />
    </instancedMesh>
  );
}

// Illustrative late-1930s Saigon street seen from an upper floor. Painted
// procedurally: generic shophouses, not a documented view from the real office.
function paint(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function drawSky(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#9fb7c2');
  sky.addColorStop(0.55, '#d8d6c4');
  sky.addColorStop(1, '#f1e2bf');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const random = seeded(7);
  for (let i = 0; i < 26; i++) {
    const x = random() * w,
      y = h * (0.12 + random() * 0.38),
      r = 40 + random() * 110;
    const cloud = ctx.createRadialGradient(x, y, 0, x, y, r);
    cloud.addColorStop(0, '#fbf5e8b0');
    cloud.addColorStop(1, '#fbf5e800');
    ctx.fillStyle = cloud;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.8, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

const facadeColors = ['#dcb86f', '#e6dcc2', '#c9b48c', '#d9c49a', '#b9c2b4', '#e2c98f'];
const shopSigns = ['TẠP HÓA', 'HIỆU MAY', 'NHÀ IN', 'THUỐC BẮC', 'CAFÉ', 'SÁCH BÁO', 'BUÔN GẠO'];

function drawStreetRow(ctx, w, h) {
  const random = seeded(19),
    unit = w / 7;
  ctx.fillStyle = '#b8b2a0';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 7; i++) {
    const x = i * unit,
      color = facadeColors[i % facadeColors.length],
      top = h * (0.08 + (i % 3) * 0.035);
    ctx.fillStyle = color;
    ctx.fillRect(x, top, unit, h - top);
    // Terracotta roof lip and cornice.
    ctx.fillStyle = '#8f4b32';
    ctx.fillRect(x - 4, top - 18, unit + 8, 22);
    ctx.fillStyle = '#f2ead6';
    ctx.fillRect(x, top + 4, unit, 12);
    ctx.fillStyle = '#0000002a';
    ctx.fillRect(x, top + 16, unit, 10);
    if (i % 2 === 0) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + unit * 0.25, top - 16);
      ctx.lineTo(x + unit * 0.5, top - 62);
      ctx.lineTo(x + unit * 0.75, top - 16);
      ctx.fill();
      ctx.strokeStyle = '#f2ead6';
      ctx.lineWidth = 5;
      ctx.stroke();
    }
    // Upper floor: two tall windows with green louvred shutters.
    const upper = h * 0.22;
    for (const offset of [0.2, 0.6]) {
      const wx = x + unit * offset,
        ww = unit * 0.2,
        wh = h * 0.22;
      ctx.fillStyle = '#2b2620';
      ctx.fillRect(wx, upper, ww, wh);
      const open = random() > 0.45;
      ctx.fillStyle = i % 3 ? '#4f6b55' : '#3f5e6a';
      if (open) {
        ctx.fillRect(wx - ww * 0.45, upper, ww * 0.42, wh);
        ctx.fillRect(wx + ww * 1.03, upper, ww * 0.42, wh);
      } else ctx.fillRect(wx, upper, ww, wh);
      ctx.strokeStyle = '#00000040';
      ctx.lineWidth = 2;
      for (let y = upper + 8; y < upper + wh; y += 9) {
        ctx.beginPath();
        if (open) {
          ctx.moveTo(wx - ww * 0.45, y);
          ctx.lineTo(wx - ww * 0.03, y);
          ctx.moveTo(wx + ww * 1.03, y);
          ctx.lineTo(wx + ww * 1.45, y);
        } else {
          ctx.moveTo(wx, y);
          ctx.lineTo(wx + ww, y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = '#f0e6cf';
      ctx.fillRect(wx - 6, upper - 12, ww + 12, 10);
    }
    // Balcony slab and wrought iron.
    const balcony = upper + h * 0.22;
    ctx.fillStyle = '#efe5cc';
    ctx.fillRect(x + 6, balcony, unit - 12, 12);
    ctx.fillStyle = '#00000038';
    ctx.fillRect(x + 6, balcony + 12, unit - 12, 14);
    ctx.strokeStyle = '#2d2a26';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 8, balcony - 46);
    ctx.lineTo(x + unit - 8, balcony - 46);
    ctx.stroke();
    for (let bx = x + 12; bx < x + unit - 8; bx += 11) {
      ctx.beginPath();
      ctx.moveTo(bx, balcony - 46);
      ctx.lineTo(bx, balcony);
      ctx.stroke();
    }
    // Ground floor shop: sign board, striped awning, dark opening.
    const shop = h * 0.62;
    ctx.fillStyle = '#efe4c9';
    ctx.fillRect(x + unit * 0.06, shop - 42, unit * 0.88, 34);
    ctx.fillStyle = '#6b2623';
    ctx.font = `700 ${Math.round(unit * 0.075)}px "Noto Serif", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(shopSigns[i % shopSigns.length], x + unit / 2, shop - 25);
    const opening = ctx.createLinearGradient(0, shop, 0, h);
    opening.addColorStop(0, '#15110d');
    opening.addColorStop(1, '#3a2e22');
    ctx.fillStyle = opening;
    ctx.fillRect(x + unit * 0.1, shop + 22, unit * 0.8, h - shop - 22);
    for (let s = 0; s < 8; s++) {
      ctx.fillStyle = s % 2 ? '#e8dcc0' : i % 2 ? '#9a3c2b' : '#4f6b55';
      ctx.fillRect(x + unit * (0.06 + s * 0.11), shop, unit * 0.11, 26);
    }
    ctx.fillStyle = '#00000045';
    ctx.fillRect(x + unit * 0.06, shop + 26, unit * 0.88, 16);
    ctx.fillStyle = '#f3ead4';
    ctx.fillRect(x, top, 10, h - top);
    ctx.fillStyle = '#00000022';
    ctx.fillRect(x + 10, top, 6, h - top);
  }
  // Pedestrians in conical hats and a rickshaw at the kerb.
  for (let p = 0; p < 11; p++) {
    const px = random() * w,
      py = h * 0.97,
      s = 18 + random() * 6;
    ctx.fillStyle = '#2c241d';
    ctx.fillRect(px - s * 0.18, py - s * 2.2, s * 0.36, s * 1.6);
    ctx.fillStyle = p % 3 ? '#d9cfae' : '#2c241d';
    ctx.fillRect(px - s * 0.22, py - s * 2.2, s * 0.44, s * 0.9);
    ctx.fillStyle = '#2c241d';
    ctx.beginPath();
    ctx.moveTo(px - s * 0.55, py - s * 2.25);
    ctx.lineTo(px, py - s * 2.75);
    ctx.lineTo(px + s * 0.55, py - s * 2.25);
    ctx.fill();
    ctx.fillRect(px - s * 0.15, py - s * 0.7, s * 0.1, s * 0.7);
    ctx.fillRect(px + s * 0.05, py - s * 0.7, s * 0.1, s * 0.7);
  }
  const rx = w * 0.63,
    ry = h * 0.99;
  ctx.strokeStyle = '#1f1a15';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(rx, ry - 30, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#1f1a15';
  ctx.beginPath();
  ctx.moveTo(rx - 34, ry - 60);
  ctx.quadraticCurveTo(rx - 20, ry - 110, rx + 24, ry - 96);
  ctx.lineTo(rx + 20, ry - 50);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(rx + 20, ry - 45);
  ctx.lineTo(rx + 120, ry - 30);
  ctx.stroke();
  const shade = ctx.createLinearGradient(0, 0, w, 0);
  shade.addColorStop(0, '#fff3d020');
  shade.addColorStop(1, '#2a1c0c30');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);
}

function drawRoad(ctx, w, h) {
  ctx.fillStyle = '#a79b82';
  ctx.fillRect(0, 0, w, h);
  const random = seeded(3);
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = random() > 0.5 ? '#0000000f' : '#ffffff12';
    ctx.fillRect(random() * w, random() * h, 2 + random() * 5, 2 + random() * 3);
  }
  ctx.fillStyle = '#d2c7ad';
  ctx.fillRect(0, 0, w, h * 0.12);
  ctx.fillRect(0, h * 0.88, w, h * 0.12);
  ctx.fillStyle = '#6e6454';
  ctx.fillRect(0, h * 0.12, w, 5);
  ctx.fillRect(0, h * 0.88 - 5, w, 5);
  ctx.strokeStyle = '#5a554c';
  ctx.lineWidth = 3;
  for (const y of [0.44, 0.5]) {
    ctx.beginPath();
    ctx.moveTo(0, h * y);
    ctx.lineTo(w, h * y);
    ctx.stroke();
  }
}

function drawFoliage(ctx, w, h) {
  const random = seeded(41);
  for (let i = 0; i < 900; i++) {
    const a = random() * Math.PI * 2,
      r = Math.sqrt(random()) * 0.46;
    const x = w / 2 + Math.cos(a) * r * w,
      y = h / 2 + Math.sin(a) * r * h * 0.72;
    ctx.fillStyle = `hsla(${88 + random() * 22}, 34%, ${14 + random() * 26}%, ${0.55 + random() * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(x, y, 5 + random() * 9, 2.5 + random() * 3, random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

const ironMaterial = new THREE.MeshStandardMaterial({
  color: '#23201c',
  roughness: 0.6,
  metalness: 0.5,
});
const balconyStone = new THREE.MeshStandardMaterial({ color: '#d9cfb8', roughness: 0.95 });

function Outside({ shaftRef }) {
  const textures = useMemo(
    () => ({
      sky: paint(1024, 512, drawSky),
      row: paint(2048, 1024, drawStreetRow),
      road: paint(1024, 512, drawRoad),
      leaves: paint(512, 512, drawFoliage),
    }),
    [],
  );
  useEffect(
    () => () => Object.values(textures).forEach((texture) => texture.dispose()),
    [textures],
  );
  const clumps = useMemo(() => {
    const random = seeded(5);
    return Array.from({ length: 6 }, (_, i) => ({
      position: [-2.6 + random() * 2.6, 4.6 + random() * 1.4, -5.4 - random() * 1.4],
      scale: 1.7 + random() * 1.3,
      rotation: random() * 0.6 - 0.3,
      key: i,
    }));
  }, []);
  const basic = { toneMapped: false, fog: false };
  return (
    <group>
      <mesh position={[0, 5, -24]}>
        <planeGeometry args={[60, 26]} />
        <meshBasicMaterial map={textures.sky} {...basic} />
      </mesh>
      <mesh position={[0, 1.6, -17]}>
        <planeGeometry args={[30, 12]} />
        <meshBasicMaterial map={textures.row} color="#f1e7cf" {...basic} />
      </mesh>
      <mesh position={[0, -3.8, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 14]} />
        <meshBasicMaterial map={textures.road} color="#e9dcc0" {...basic} />
      </mesh>
      <mesh position={[-1.9, 0, -6.2]}>
        <cylinderGeometry args={[0.13, 0.2, 8.4, 8]} />
        <meshBasicMaterial color="#3d3228" {...basic} />
      </mesh>
      {clumps.map((clump) => (
        <mesh
          key={clump.key}
          position={clump.position}
          rotation={[0, 0, clump.rotation]}
          scale={clump.scale}
        >
          <planeGeometry args={[1.6, 1.2]} />
          <meshBasicMaterial
            map={textures.leaves}
            transparent
            alphaTest={0.2}
            depthWrite={false}
            color="#e7e3c4"
            {...basic}
          />
        </mesh>
      ))}
      {[4.35, 4.65].map((y) => (
        <mesh key={y} position={[0, y, -7.5]} rotation={[0, 0, Math.PI / 2 + 0.015]}>
          <cylinderGeometry args={[0.006, 0.006, 20, 4]} />
          <meshBasicMaterial color="#2a241e" {...basic} />
        </mesh>
      ))}
      <mesh position={[2.4, 0.8, -7.6]}>
        <cylinderGeometry args={[0.05, 0.07, 9.2, 6]} />
        <meshBasicMaterial color="#39322a" {...basic} />
      </mesh>
      {/* Narrow balcony ledge and wrought-iron rail directly outside the window. */}
      <Box size={[2.4, 0.09, 0.55]} position={[0, 1.33, -3.5]} material={balconyStone} />
      <Box size={[2.3, 0.04, 0.04]} position={[0, 2.18, -3.74]} material={ironMaterial} />
      {Array.from({ length: 21 }, (_, i) => (
        <Box
          key={i}
          size={[0.018, 0.8, 0.018]}
          position={[-1.12 + i * 0.112, 1.78, -3.74]}
          material={ironMaterial}
        />
      ))}
      <LightShaft shaftRef={shaftRef} />
    </group>
  );
}

const SUN_DIRECTION = new THREE.Vector3(0.25, -1.52, 1.1).normalize();
const SUN_POSITION = new THREE.Vector3(0, 2.6, -3.1).addScaledVector(SUN_DIRECTION, -5).toArray();
const SHAFT_ROTATION = new THREE.Euler().setFromQuaternion(
  new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), SUN_DIRECTION),
);

// Fake volumetric sunbeam from the window toward the desk; opacity follows shutters.
function LightShaft({ shaftRef }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { strength: { value: 0.075 }, color: { value: new THREE.Color('#ffe5ba') } },
        vertexShader:
          'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader:
          'uniform float strength; uniform vec3 color; varying vec2 vUv; void main(){ float edge = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x); float fall = pow(1.0 - vUv.y, 1.2) * smoothstep(0.0, 0.08, vUv.y); gl_FragColor = vec4(color * strength * edge * fall, 1.0); }',
      }),
    [],
  );
  useEffect(() => {
    shaftRef.current = material;
    return () => material.dispose();
  }, [material, shaftRef]);
  return (
    <group position={[0, 2.6, -3.1]} rotation={SHAFT_ROTATION}>
      {[-1, 0, 1].map((offset) => (
        <mesh
          key={offset}
          material={material}
          position={[offset * 0.09, 0, 1.0]}
          rotation={[Math.PI / 2, 0, offset * 0.5]}
          raycast={() => null}
        >
          <planeGeometry args={[1.6, 2.0]} />
        </mesh>
      ))}
    </group>
  );
}

function Shutter({ side, material, hardware, register, hingeRef }) {
  return (
    <Target id="window" register={register} position={[side * 0.84, 2.6, -2.88]}>
      <group ref={hingeRef} rotation={[0, -side * 1.42, 0]}>
        <group position={[-side * 0.425, 0, 0]}>
          {[-0.39, 0.39].map((edge) => (
            <BevelBox
              key={edge}
              size={[0.065, 2.08, 0.075]}
              radius={0.005}
              position={[edge, 0, 0]}
              material={material}
            />
          ))}
          {[-1.005, 0, 1.005].map((edge) => (
            <BevelBox
              key={edge}
              size={[0.85, 0.065, 0.075]}
              radius={0.005}
              position={[0, edge, 0]}
              material={material}
            />
          ))}
          {Array.from({ length: 15 }, (_, index) => (
            <BevelBox
              key={index}
              size={[0.76, 0.092, 0.04]}
              radius={0.003}
              position={[0, -0.91 + index * 0.13, 0]}
              rotation={[-0.45, 0, 0]}
              material={material}
            />
          ))}
          {[-0.76, 0, 0.76].map((y) => (
            <group key={y} position={[side * 0.395, y, 0.044]}>
              <BevelBox size={[0.033, 0.12, 0.008]} radius={0.002} material={hardware} />
              <mesh position={[side * 0.019, 0, 0]} material={hardware} castShadow>
                <cylinderGeometry args={[0.01, 0.01, 0.14, 16]} />
              </mesh>
              {[-0.038, 0.038].map((offset) => (
                <mesh
                  key={offset}
                  position={[0, offset, 0.005]}
                  scale={[1, 1, 0.35]}
                  material={hardware}
                >
                  <sphereGeometry args={[0.004, 12, 8]} />
                </mesh>
              ))}
            </group>
          ))}
          <mesh position={[side * 0.24, -0.03, 0.058]} material={material} castShadow>
            <sphereGeometry args={[0.022, 8, 6]} />
          </mesh>
        </group>
      </group>
    </Target>
  );
}

function Window({ m, register, shutterRefs, shaftRef }) {
  return (
    <>
      <Target id="window" register={register}>
        {[-0.91, 0.91].map((x) => (
          <Box
            key={x}
            size={[0.14, 2.37, 0.22]}
            position={[x, 2.6, -3.1]}
            material={m.wood}
            tiles="wood"
          />
        ))}
        {[1.43, 3.77].map((y) => (
          <Box
            key={y}
            size={[1.92, 0.14, 0.22]}
            position={[0, y, -3.1]}
            material={m.wood}
            tiles="wood"
          />
        ))}
        <BevelBox
          size={[1.98, 0.1, 0.38]}
          radius={0.009}
          position={[0, 1.39, -2.99]}
          material={m.wood}
        />
      </Target>
      <Outside shaftRef={shaftRef} />
      {[-3.23, -3.04].map((z) => (
        <React.Fragment key={z}>
          {[-0.83, 0.83].map((x) => (
            <Box
              key={x}
              size={[0.045, 2.25, 0.045]}
              position={[x, 2.6, z]}
              material={m.wood}
              tiles="wood"
            />
          ))}
        </React.Fragment>
      ))}
      {[-1, 1].map((side, index) => (
        <Shutter
          key={side}
          side={side}
          material={m.wood}
          hardware={m.dark}
          register={register}
          hingeRef={(node) => {
            shutterRefs.current[index] = node;
          }}
        />
      ))}
    </>
  );
}

// Single hinged wooden leaf, as in modest Saigon shophouse interiors.
function EntryDoor({ m, doorRefs }) {
  return (
    <>
      {[-1, 1].map((side) => (
        <Box
          key={side}
          size={[0.5, 3.2, 0.15]}
          position={[side * 0.92, 1.6, 3.35]}
          material={m.wall}
          tiles="wall"
        />
      ))}
      <Box size={[0.13, 3.2, 0.2]} position={[-0.7, 1.6, 3.27]} material={m.wood} tiles="wood" />
      <Box size={[0.13, 3.2, 0.2]} position={[0.7, 1.6, 3.27]} material={m.wood} tiles="wood" />
      <Box size={[1.53, 0.15, 0.2]} position={[0, 3.25, 3.27]} material={m.wood} tiles="wood" />
      <group
        ref={(node) => {
          doorRefs.current[0] = node;
        }}
        position={[-0.63, 1.59, 3.19]}
        rotation={[0, 1.42, 0]}
      >
        <group position={[0.63, 0, 0]}>
          <Box size={[1.26, 3.1, 0.085]} material={m.wood} tiles="wood" />
          {[-0.56, 0.56].map((x) => (
            <Box
              key={x}
              size={[0.09, 2.96, 0.12]}
              position={[x, 0, -0.035]}
              material={m.wood}
              tiles="wood"
            />
          ))}
          {[-1.38, -0.1, 1.38].map((y) => (
            <Box
              key={y}
              size={[1.18, 0.09, 0.12]}
              position={[0, y, -0.035]}
              material={m.wood}
              tiles="wood"
            />
          ))}
          {[-0.74, 0.64].map((y) => (
            <Box
              key={y}
              size={[0.9, 0.5, 0.03]}
              position={[0, y, -0.1]}
              material={m.wood}
              tiles="wood"
            />
          ))}
          {[-1, 1].map((face) => (
            <group key={face} position={[0.5, -0.08, face * 0.06]}>
              <Box size={[0.07, 0.26, 0.012]} material={m.gold} />
              <Box size={[0.03, 0.03, 0.05]} position={[0, 0.06, face * 0.025]} material={m.gold} />
              <Box
                size={[0.14, 0.026, 0.026]}
                position={[-0.055, 0.06, face * 0.05]}
                material={m.gold}
              />
              <mesh position={[0, -0.07, face * 0.007]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.008, 0.008, 0.004, 10]} />
                <meshStandardMaterial color="#1a140e" />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </>
  );
}

function SideVent({ m }) {
  return (
    <>
      <mesh position={[-4.34, 3.3, -1.9]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.52, 0.7]} />
        <meshBasicMaterial color="#d9ddca" side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      {[2.91, 3.69].map((y) => (
        <Box
          key={y}
          size={[0.21, 0.075, 1.72]}
          position={[-3.98, y, -1.9]}
          material={m.wood}
          tiles="wood"
        />
      ))}
      {[-2.75, -1.05].map((z) => (
        <Box
          key={z}
          size={[0.21, 0.78, 0.075]}
          position={[-3.98, 3.3, z]}
          material={m.wood}
          tiles="wood"
        />
      ))}
      {Array.from({ length: 6 }, (_, index) => (
        <Box
          key={index}
          size={[0.16, 0.055, 1.6]}
          position={[-3.9, 2.97 + index * 0.13, -1.9]}
          rotation={[0, 0, -0.22]}
          material={m.wood}
          tiles="wood"
        />
      ))}
    </>
  );
}

function PhotoFace({ size, m }) {
  const source = useTexture(`${base}assets/references/dan-chung.jpg`);
  const { invalidate } = useThree();
  const texture = useMemo(() => photoPrintTexture(source.image), [source]);
  useEffect(() => {
    invalidate();
    return () => texture.dispose();
  }, [texture, invalidate]);
  return <PaperSurface size={size} texture={texture} material={m.paper} photo />;
}

function Document({
  id,
  size,
  position,
  title,
  subtitle,
  angle = 0,
  m,
  register,
  clipped = false,
}) {
  const { invalidate } = useThree();
  const texture = useMemo(() => {
    if (id === 'photo') return null;
    const pages = documents.find((item) => item.id === id)?.pages || [];
    return propTexture(
      id === 'board' || id === 'proof' ? id : 'manuscript',
      pages[0] || { title, text: subtitle },
    );
  }, [id, title, subtitle]);
  useEffect(() => {
    document.fonts?.ready.then(() => invalidate());
    return () => texture?.dispose();
  }, [texture, invalidate]);
  return (
    <Target id={id} register={register} position={position} rotation={[0, angle, 0]}>
      {id === 'photo' ? (
        <Asset>
          <PhotoFace size={size} m={m} />
        </Asset>
      ) : (
        <PaperSurface size={size} texture={texture} material={m.paper} />
      )}
      {clipped && <PaperClip />}
    </Target>
  );
}

function Notebook({ m, register, addLod, distance }) {
  const ref = useRef();
  const distances = useMemo(() => [0, distance], [distance]);
  useLayoutEffect(() => addLod(ref.current), [addLod]);
  return (
    <Target id="notebook" register={register}>
      <Detailed
        ref={ref}
        position={[-2.85, 1.45 + (0.57 * 0.7) / 2, -2.16]}
        scale={0.7}
        distances={distances}
      >
        <BoundBook size={[0.18, 0.57, 0.43]} m={m} />
        <group>
          <Box size={[0.18, 0.57, 0.43]} material={m.red} />
        </group>
      </Detailed>
    </Target>
  );
}

function Archive({ m, register }) {
  return (
    <Target id="archive" register={register} position={[-2.3, 0.92, -2.1]}>
      {Array.from({ length: 7 }, (_, index) => (
        <group
          key={index}
          position={[(index % 2) * 0.009, -0.15 + index * 0.043, 0]}
          rotation={[0, ((index % 3) - 1) * 0.015, 0]}
        >
          <BevelBox size={[0.51, 0.032, 0.42]} radius={0.002} material={m.pageEdges} />
          {[-0.018, 0.018].map((y) => (
            <BevelBox
              key={y}
              size={[0.535, 0.003, 0.445]}
              radius={0.001}
              position={[0, y, 0]}
              material={m.folder}
            />
          ))}
          <BevelBox
            size={[0.1, 0.003, 0.035]}
            radius={0.001}
            position={[-0.15 + (index % 3) * 0.12, 0.018, 0.236]}
            material={m.folder}
          />
        </group>
      ))}
      <Box size={[0.07, 0.32, 0.445]} material={m.red} />
    </Target>
  );
}

function Ink({ m, register, capRef }) {
  return (
    <Target id="ink" register={register} position={[0.7, 1.08, -2.55]}>
      <InkBottle capRef={capRef} />
    </Target>
  );
}

function makeCalendarTexture(month) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 840;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#d7c9a6';
  ctx.fillRect(0, 0, 600, 840);
  ctx.fillStyle = '#63271f';
  ctx.textAlign = 'center';
  ctx.font = '700 46px "Noto Serif"';
  ctx.fillText(month === 6 ? 'JUILLET' : 'AOÛT', 300, 100);
  ctx.font = '400 28px "Noto Serif"';
  ctx.fillText('1938', 300, 145);
  ctx.font = '400 20px "Noto Serif"';
  ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach((day, index) =>
    ctx.fillText(day, 68 + index * 77, 220),
  );
  const start = (new Date(Date.UTC(1938, month, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(1938, month + 1, 0)).getUTCDate();
  ctx.fillStyle = '#403827';
  ctx.font = '400 28px "Noto Serif"';
  for (let day = 1; day <= days; day++) {
    const cell = start + day - 1;
    ctx.fillText(String(day), 68 + (cell % 7) * 77, 290 + Math.floor(cell / 7) * 76);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Calendar({ m, register, materialRef, mapRef }) {
  const maps = useMemo(() => [makeCalendarTexture(6), makeCalendarTexture(7)], []);
  useLayoutEffect(() => {
    mapRef.current = maps;
    return () => {
      mapRef.current = null;
    };
  }, [maps, mapRef]);
  useEffect(() => () => maps.forEach((texture) => texture.dispose()), [maps]);
  return (
    <>
      <Target id="calendar" register={register}>
        <mesh position={[1.35, 2.75, -3.105]}>
          <planeGeometry args={[0.4, 0.56]} />
          <meshStandardMaterial ref={materialRef} map={maps[0]} roughness={1} />
        </mesh>
      </Target>
      <Box
        size={[0.42, 0.035, 0.035]}
        position={[1.35, 3.045, -3.07]}
        material={m.wood}
        tiles="wood"
      />
    </>
  );
}

export function Room({ onReady, onObjectPick, onObjectHover, notebookDistance = 3.45 }) {
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);
  const m = useMemo(() => makeMaterials(() => invalidate()), [invalidate]);
  const targets = useRef(new Map());
  const lods = useRef([]);
  const shutterRefs = useRef([]),
    shaftRef = useRef();
  const doorRefs = useRef([]);
  const chairRef = useRef(),
    capRef = useRef();
  const storyLidRef = useRef();
  const shelfLidRef = useRef();
  const skyLightRef = useRef(),
    fillLightsRef = useRef(),
    lampLightRef = useRef(),
    calendarMaterialRef = useRef(),
    calendarMaps = useRef();
  const sunRef = useRef(),
    windowBounceRef = useRef();
  const propState = useRef({});
  const effectsEnabled = useRef(true);
  const tweens = useRef(new Set());
  const reduced = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)'), []);
  const register = useCallback((id, object) => {
    if (!object) return () => {};
    object.userData.interaction = id;
    const entries = targets.current.get(id) || [];
    entries.push(object);
    targets.current.set(id, entries);
    return () =>
      targets.current.set(
        id,
        (targets.current.get(id) || []).filter((item) => item !== object),
      );
  }, []);
  const addLod = useCallback((lod) => {
    if (lod) lods.current.push(lod);
    return () => {
      lods.current = lods.current.filter((item) => item !== lod);
    };
  }, []);
  const animate = useCallback(
    (object, values) => {
      if (!object) return;
      if (reduced.matches) {
        gsap.set(object, values);
        gl.shadowMap.needsUpdate = true;
        invalidate();
        return;
      }
      const tween = gsap.to(object, {
        ...values,
        duration: 0.55,
        ease: 'power2.inOut',
        onUpdate: () => {
          gl.shadowMap.needsUpdate = true;
          invalidate();
        },
        onComplete: () => tweens.current.delete(tween),
      });
      tweens.current.add(tween);
    },
    [gl, invalidate, reduced],
  );
  const api = useMemo(
    () => ({
      targets: targets.current,
      lods: lods.current,
      interactions: ambientIds,
      setEffects(value) {
        effectsEnabled.current = value;
        invalidate();
      },
      prepareInspection(id) {
        if (id === 'coinbox' && storyLidRef.current)
          animate(storyLidRef.current.rotation, { x: -1.2 });
      },
      setGraphics(settings) {
        const lights = [
          [sunRef.current, settings.shadows],
          [lampLightRef.current, settings.shadows >= 2048 ? 512 : 0],
        ];
        for (const [light, size] of lights) {
          if (!light) continue;
          light.castShadow = size > 0;
          if (!size || light.shadow.mapSize.x !== size) {
            light.shadow.map?.dispose();
            light.shadow.map = null;
            light.shadow.mapPass?.dispose();
            light.shadow.mapPass = null;
            if (size) light.shadow.mapSize.set(size, size);
          }
        }
        // Simple lighting: sky fill and a soft sun stand in for the area light, the
        // fill lamps and the shadow-masked sun, which are what a CPU cannot afford.
        // Reduced lighting keeps the materials, the sun and its shadow and the lamp, and
        // lets a brighter sky stand in for the area light and the four fill lamps.
        const simple = settings.lighting === 'simple',
          reduced = settings.lighting === 'reduced';
        if (windowBounceRef.current) windowBounceRef.current.visible = !simple && !reduced;
        if (fillLightsRef.current) fillLightsRef.current.visible = !simple && !reduced;
        if (lampLightRef.current) lampLightRef.current.visible = !simple;
        if (skyLightRef.current)
          skyLightRef.current.intensity = simple ? 1.25 : reduced ? 0.55 : 0.16;
        if (sunRef.current) sunRef.current.intensity = simple && !settings.shadows ? 1.1 : 6.5;
        gl.shadowMap.needsUpdate = true;
        invalidate();
      },
      setEntryDoor(open) {
        const door = doorRefs.current[0];
        const angle = 1.42 * open;
        if (!door || door.rotation.y === angle) return;
        door.rotation.y = angle;
        gl.shadowMap.needsUpdate = true;
        invalidate();
      },
      interact(id) {
        propState.current[id] = !propState.current[id];
        const active = propState.current[id];
        if (id === 'window') {
          shutterRefs.current.forEach((hinge, index) =>
            animate(hinge?.rotation, { y: active ? 0 : index === 0 ? 1.42 : -1.42 }),
          );
          if (shaftRef.current)
            animate(shaftRef.current.uniforms.strength, { value: active ? 0 : 0.075 });
        }
        if (id === 'lamp') animate(lampLightRef.current, { intensity: active ? 0 : 0.9 });
        if (id === 'chair') animate(chairRef.current?.position, { z: active ? -0.55 : -0.85 });
        if (id === 'ink')
          animate(capRef.current?.position, { x: active ? 0.12 : 0, y: active ? 0.012 : 0.131 });
        if (id === 'calendar' && calendarMaterialRef.current && calendarMaps.current) {
          calendarMaterialRef.current.map = calendarMaps.current[active ? 1 : 0];
          calendarMaterialRef.current.needsUpdate = true;
          invalidate();
        }
        if (id === 'shelf-box') animate(shelfLidRef.current?.rotation, { x: active ? -0.58 : 0 });
        return active;
      },
    }),
    [animate, invalidate],
  );
  useLayoutEffect(() => {
    onReady(api);
    return () => onReady(null);
  }, [onReady, api]);
  useEffect(
    () => () => {
      tweens.current.forEach((tween) => tween.kill());
      m.dispose();
      for (const material of Object.values(m)) if (material?.isMaterial) material.dispose();
    },
    [m],
  );
  const sunTarget = useMemo(() => {
    const object = new THREE.Object3D();
    object.position.set(0.25, 1.08, -2.0);
    return object;
  }, []);
  const interactionHandlers = useMemo(
    () => ({ pick: onObjectPick, hover: onObjectHover }),
    [onObjectPick, onObjectHover],
  );
  return (
    <InteractionContext.Provider value={interactionHandlers}>
      <group scale={0.75}>
        <Box size={[8, 0.12, 8]} position={[0, -0.07, 0]} material={m.tile} tiles="tile" />
        <ContactShade position={[0, -0.003, -2.1]} size={[3.7, 1.9]} opacity={0.4} />
        <ContactShade position={[-2.65, -0.002, -2.2]} size={[1.85, 0.9]} opacity={0.5} />
        <ContactShade position={[2.75, -0.002, -1.28]} size={[1.5, 1.2]} opacity={0.48} />
        <ContactShade position={[-2.1, -0.002, -0.8]} size={[1.1, 0.85]} opacity={0.4} />
        <ContactShade position={[-0.7, -0.002, -0.85]} size={[0.9, 0.9]} opacity={0.25} />
        <Box
          size={[3.09, 4.5, 0.15]}
          position={[-2.455, 2.2, -3.2]}
          material={m.wall}
          tiles="wall"
        />
        <Box
          size={[3.09, 4.5, 0.15]}
          position={[2.455, 2.2, -3.2]}
          material={m.wall}
          tiles="wall"
        />
        <Box size={[1.82, 1.45, 0.15]} position={[0, 0.725, -3.2]} material={m.wall} tiles="wall" />
        <Box size={[1.82, 0.76, 0.15]} position={[0, 4.12, -3.2]} material={m.wall} tiles="wall" />
        <Box size={[0.15, 4.5, 1]} position={[-4, 2.2, -3.2]} material={m.wall} tiles="wall" />
        <Box size={[0.15, 4.5, 4.4]} position={[-4, 2.2, 1.1]} material={m.wall} tiles="wall" />
        <Box size={[0.15, 2.97, 1.6]} position={[-4, 1.435, -1.9]} material={m.wall} tiles="wall" />
        <Box size={[0.15, 0.77, 1.6]} position={[-4, 4.065, -1.9]} material={m.wall} tiles="wall" />
        <SideVent m={m} />
        <Box size={[0.15, 4.5, 7]} position={[4, 2.2, -0.2]} material={m.wall} tiles="wall" />
        <Box
          size={[2.86, 4.5, 0.15]}
          position={[-2.57, 2.2, 3.35]}
          material={m.wall}
          tiles="wall"
        />
        <Box size={[2.86, 4.5, 0.15]} position={[2.57, 2.2, 3.35]} material={m.wall} tiles="wall" />
        <Box size={[2.28, 1.15, 0.15]} position={[0, 3.925, 3.35]} material={m.wall} tiles="wall" />
        <EntryDoor m={m} doorRefs={doorRefs} />
        <Box size={[8, 0.12, 7]} position={[0, 4.48, -0.2]} material={m.ceiling} />
        {[-2.7, 0, 2.7].map((x) => (
          <Box
            key={x}
            size={[0.12, 0.15, 7]}
            position={[x, 4.34, -0.2]}
            material={m.wood}
            tiles="wood"
          />
        ))}
        <Box size={[8, 0.2, 0.08]} position={[0, 0.1, -3.1]} material={m.wood} tiles="wood" />
        <Label
          title="DÂN CHÚNG"
          subtitle="SÀI GÒN"
          size={[0.95, 0.59]}
          position={[2.6, 3.12, -3.1]}
        />
        <Window m={m} register={register} shutterRefs={shutterRefs} shaftRef={shaftRef} />
        <Box
          size={[0.72, 0.065, 0.28]}
          position={[2.6, 2.25, -2.94]}
          material={m.wood}
          tiles="wood"
        />
        <ModelAt
          id="clock"
          register={register}
          asset="mantel_clock_01"
          size={[0.5, 0.32, 0.18]}
          position={[2.6, 2.285, -2.89]}
          preserve
        />
        <Label
          title="DÂN CHÚNG"
          subtitle="22 JUILLET 1938"
          size={[0.55, 0.344]}
          position={[-1.65, 2.8, -3.1]}
        />
        <Asset>
          <Model asset="wooden_table_02" size={[3.4, 1.08, 1.6]} position={[0, 0, -2.1]} />
        </Asset>
        {/* Unwritten stock, tied with twine. Decorative, never a historical document. */}
        <group position={[1.05, 1.08, -2.22]} rotation={[0, -0.14, 0]}>
          {Array.from({ length: 5 }, (_, i) => (
            <Box
              key={i}
              size={[0.27, 0.012, 0.37]}
              position={[(i % 2) * 0.008, 0.008 + i * 0.012, 0]}
              material={m.paper}
            />
          ))}
          <Box size={[0.008, 0.066, 0.38]} position={[0, 0.032, 0]} material={m.gold} />
          <Box size={[0.28, 0.006, 0.008]} position={[0, 0.066, 0]} material={m.gold} />
        </group>
        {/* Compact composing tray, suggesting the work behind the newspaper puzzle. */}
        <group position={[0.92, 1.09, -1.89]}>
          <Box size={[0.48, 0.016, 0.2]} material={m.wood} tiles="wood" />
          {Array.from({ length: 4 }, (_, row) => (
            <Box
              key={row}
              size={[0.48, 0.035, 0.008]}
              position={[0, 0.015, -0.09 + row * 0.06]}
              material={m.wood}
              tiles="wood"
            />
          ))}
          <LeadSorts material={m.dark} />
        </group>
        <ModelAt
          id="chair"
          register={register}
          asset="painted_wooden_chair_01"
          size={[0.6, 1.25, 0.6]}
          position={[-0.7, 0, -0.85]}
          rotation={[0, Math.PI, 0]}
          modelRef={chairRef}
        />
        <Document
          id="letter"
          size={[0.235, 0.333]}
          position={[-1.05, 1.085, -1.65]}
          title="BẢN THẢO"
          subtitle="DÂN SINH · DÂN CHỦ"
          angle={0.12}
          m={m}
          register={register}
          clipped
        />
        <Document
          id="photo"
          size={[0.31, 0.42]}
          position={[-0.65, 1.085, -2.4]}
          title="ẢNH SƯU TẬP"
          subtitle="THAM KHẢO THỊ GIÁC"
          angle={-0.15}
          m={m}
          register={register}
        />
        <ModelAt
          id="drawer"
          register={register}
          asset="painted_wooden_cabinet"
          size={[0.8, 0.91, 0.55]}
          position={[-2.1, 0, -0.8]}
        />
        <Asset>
          <Model asset="wicker_basket_01" size={[0.43, 0.36, 0.43]} position={[-2.9, 0, -0.12]} />
        </Asset>
        <Document
          id="board"
          size={[0.46, 0.63]}
          position={[-0.2, 1.085, -1.85]}
          title="DÂN CHÚNG"
          subtitle="SÀI GÒN · DÂN SINH · DÂN CHỦ"
          m={m}
          register={register}
        />
        <ModelAt
          id="lamp"
          register={register}
          asset="vintage_oil_lamp"
          size={[0.24, 0.5, 0.24]}
          position={[-1.25, 1.08, -2.65]}
        />
        <Asset>
          <Model asset="jug_01" size={[0.19, 0.26, 0.19]} position={[1.33, 1.08, -2.65]} />
        </Asset>
        <pointLight
          ref={lampLightRef}
          color="#ffb35c"
          intensity={0.9}
          distance={2.2}
          decay={1.3}
          position={[-1.25, 1.34, -2.65]}
          castShadow
          shadow-mapSize={[512, 512]}
          shadow-bias={-0.0005}
          shadow-normalBias={0.012}
          shadow-camera-near={0.04}
          shadow-camera-far={3}
          shadow-radius={3}
        />
        <Asset>
          <Model
            asset="wooden_bookshelf_worn"
            size={[1.5, 2.35, 0.6]}
            position={[-2.65, 0, -2.2]}
          />
        </Asset>
        <Asset>
          <Model asset="wooden_crate_01" size={[0.5, 0.3, 0.36]} position={[-2.64, 1.16, -2.13]} />
        </Asset>
        <Notebook m={m} register={register} addLod={addLod} distance={notebookDistance} />
        <Archive m={m} register={register} />
        <ShelfDressing m={m} Target={Target} register={register} lidRef={shelfLidRef} />
        <ModelAt
          id="proof"
          register={register}
          asset="proofing-press"
          size={[1.3, 0.9, 0.9]}
          position={[2.75, 0, -1.28]}
          preserve
        />
        <Document
          id="proof"
          size={[0.235, 0.333]}
          position={[1.08, 1.085, -1.58]}
          title="BẢN IN THỬ"
          subtitle="ĐỐI CHIẾU TRƯỚC KHI IN"
          angle={-0.08}
          m={m}
          register={register}
        />
        <Ink m={m} register={register} capRef={capRef} />
        {Array.from({ length: 3 }, (_, index) => (
          <Pencil
            key={index}
            position={[0.38, 1.091, -2.5 + index * 0.025]}
            rotation={[0, 0.1 * index, Math.PI / 2]}
            material={m.wood}
          />
        ))}
        <Calendar
          m={m}
          register={register}
          materialRef={calendarMaterialRef}
          mapRef={calendarMaps}
        />
        <StoryProps m={m} register={register} Target={Target} lidRef={storyLidRef} />
        <KnowledgeProps m={m} register={register} Target={Target} />
        <Atmosphere enabled={effectsEnabled} shaftRef={shaftRef} lampLightRef={lampLightRef} />
        <hemisphereLight ref={skyLightRef} args={['#c4d5e1', '#302015', 0.16]} />
        <rectAreaLight
          ref={windowBounceRef}
          color="#ffe3b7"
          intensity={0.65}
          width={1.55}
          height={1.8}
          position={[0, 2.6, -3.02]}
          rotation={[0, Math.PI, 0]}
        />
        <primitive object={sunTarget} />
        <directionalLight
          ref={sunRef}
          color="#ffe0b1"
          intensity={6.5}
          position={SUN_POSITION}
          target={sunTarget}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-3.5}
          shadow-camera-right={3.5}
          shadow-camera-top={3.5}
          shadow-camera-bottom={-3.5}
          shadow-camera-near={1}
          shadow-camera-far={14}
          shadow-bias={-0.0003}
          shadow-normalBias={0.012}
          shadow-radius={3}
          shadow-blurSamples={16}
        />
        <group ref={fillLightsRef}>
          <pointLight
            color="#f3c98f"
            intensity={0.3}
            distance={3.6}
            decay={1.6}
            position={[0.3, 0.35, -1.2]}
          />
          <pointLight
            color="#9fb2bf"
            intensity={0.16}
            distance={4.5}
            decay={1.5}
            position={[0, 2.8, 1.8]}
          />
          <pointLight
            color="#ffe1b0"
            intensity={0.32}
            distance={3.4}
            decay={1.4}
            position={[0, 2.6, -2.7]}
          />
          <pointLight color="#e5e8ce" intensity={0.22} distance={3} position={[-3.7, 3.3, -1.9]} />
        </group>
      </group>
    </InteractionContext.Provider>
  );
}
