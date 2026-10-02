import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { detail } from './detail.js';

// Small illustrative props. Dimensions stay in room units, with real edge silhouettes.
export function BevelBox({ size, radius = 0.004, material, ...props }) {
  // A bevelled box is 300 triangles, a plain one 12; hundreds of books and slats add up.
  const geometry = useMemo(
    () =>
      detail.low ? new THREE.BoxGeometry(...size) : new RoundedBoxGeometry(...size, 2, radius),
    [...size, radius],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={material} castShadow receiveShadow {...props} />;
}

export function BoundBook({ size, m, dark = false, ...props }) {
  const [w, h, d] = size,
    cover = Math.min(0.009, w * 0.08),
    cloth = dark ? m.charcoalCloth : m.red;
  return (
    <group {...props}>
      <BevelBox
        size={[w - cover * 2, h - 0.025, d - 0.025]}
        radius={0.003}
        position={[0, 0, -0.006]}
        material={m.pageEdges}
      />
      {[-1, 1].map((side) => (
        <BevelBox
          key={side}
          size={[cover, h, d]}
          radius={0.0025}
          position={[(side * (w - cover)) / 2, 0, 0]}
          material={cloth}
        />
      ))}
      <BevelBox
        size={[w, h, 0.045]}
        radius={0.015}
        position={[0, 0, d / 2 - 0.018]}
        material={cloth}
      />
      {[-0.34, 0.34].map((y) => (
        <BevelBox
          key={y}
          size={[w * 0.92, 0.005, 0.004]}
          radius={0.0015}
          position={[0, h * y, d / 2 + 0.006]}
          material={m.gold}
        />
      ))}
      <BevelBox
        size={[w * 0.66, h * 0.16, 0.002]}
        radius={0.001}
        position={[0, h * 0.14, d / 2 + 0.006]}
        material={m.folder}
      />
    </group>
  );
}

export function PaperSurface({ size, texture, material, photo = false }) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(size[0], size[1], 12, 16),
      p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / (size[0] / 2),
        v = p.getY(i) / (size[1] / 2);
      p.setZ(i, 0.001 + Math.pow(Math.abs(u), 8) * 0.002 + Math.pow(Math.max(0, v), 10) * 0.003);
    }
    g.computeVertexNormals();
    return g;
  }, [...size]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geometry} material={material} position={[0, 0, -0.0006]} />
      <mesh geometry={geometry}>
        <meshStandardMaterial
          map={texture}
          roughness={photo ? 0.65 : 0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function PaperClip() {
  const geometry = useMemo(() => {
    const points = [
      [-0.006, 0.015],
      [-0.006, -0.014],
      [0, -0.022],
      [0.007, -0.014],
      [0.007, 0.015],
      [0, 0.022],
      [-0.011, 0.015],
      [-0.011, -0.017],
      [-0.003, -0.027],
      [0.012, -0.018],
      [0.012, 0.006],
    ];
    const curve = new THREE.CatmullRomCurve3(
      points.map(([x, y]) => new THREE.Vector3(x, y, 0)),
      false,
      'centripetal',
    );
    return new THREE.TubeGeometry(curve, 80, 0.0012, 8, false);
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      geometry={geometry}
      position={[-0.08, 0.008, -0.13]}
      rotation={[-Math.PI / 2, 0, 0]}
      castShadow
    >
      <meshStandardMaterial color="#b9b5a9" metalness={0.75} roughness={0.32} />
    </mesh>
  );
}

export function InkBottle({ capRef }) {
  const profile = useMemo(
    () =>
      [
        [0, 0],
        [0.04, 0],
        [0.052, 0.007],
        [0.055, 0.018],
        [0.055, 0.066],
        [0.052, 0.08],
        [0.038, 0.092],
        [0.028, 0.097],
        [0.028, 0.116],
        [0.032, 0.117],
        [0.032, 0.124],
        [0.022, 0.124],
        [0.022, 0.099],
        [0, 0.099],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  );
  return (
    <group>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[profile, 48]} />
        <meshPhysicalMaterial
          color="#1c322b"
          roughness={0.24}
          clearcoat={0.4}
          clearcoatRoughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.049, 0]} rotation={[0, Math.PI, 0]}>
        <cylinderGeometry args={[0.0556, 0.0556, 0.035, 48, 1, true, 0, Math.PI * 1.1]} />
        <meshStandardMaterial color="#d4c6a7" roughness={0.96} side={THREE.DoubleSide} />
      </mesh>
      <group ref={capRef} position={[0, 0.131, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.034, 0.036, 0.023, 48]} />
          <meshStandardMaterial color="#302b22" metalness={0.45} roughness={0.5} />
        </mesh>
        {[-0.007, 0.005].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.0345, 0.0015, 8, 48]} />
            <meshStandardMaterial color="#817762" metalness={0.55} roughness={0.48} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function Pencil({ material, ...props }) {
  return (
    <group {...props}>
      <mesh material={material} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.22, 6]} />
      </mesh>
      <mesh position={[0, -0.12, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.004, 0.02, 12]} />
        <meshStandardMaterial color="#c9ab76" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.132, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.0014, 0.005, 12]} />
        <meshStandardMaterial color="#252725" roughness={0.72} />
      </mesh>
    </group>
  );
}
