import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { BevelBox, BoundBook } from './props.jsx';

function Cloth({ m }) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.24, 0.18, 18, 14),
      p = g.attributes.position;
    for (let i = 0; i < p.count; i++)
      p.setZ(i, 0.0025 + Math.sin(p.getX(i) * 62) * 0.0025 + Math.pow(p.getY(i) / 0.09, 4) * 0.004);
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <group rotation={[-Math.PI / 2, 0, -0.2]}>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial color="#b1a286" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <BevelBox
        size={[0.08, 0.14, 0.0015]}
        radius={0.0006}
        position={[0.018, 0, 0.007]}
        material={m.red}
      />
      {Array.from({ length: 8 }, (_, i) => (
        <BevelBox
          key={i}
          size={[0.014, 0.0015, 0.001]}
          radius={0.0003}
          position={[0.017, -0.057 + i * 0.016, 0.0082]}
          rotation={[0, 0, 0.25]}
          material={m.paper}
        />
      ))}
    </group>
  );
}
function Strap({ m }) {
  const geometry = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.07, 0.005, -0.035),
          new THREE.Vector3(-0.035, 0.025, 0.018),
          new THREE.Vector3(0.015, 0.008, 0.04),
          new THREE.Vector3(0.075, 0.006, -0.015),
        ]),
        36,
        0.009,
        8,
        false,
      ),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color="#5b4b36" roughness={0.96} />
      </mesh>
      <mesh position={[-0.065, 0.015, 0.025]} material={m.paper} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.028, 20]} />
      </mesh>
      <mesh position={[-0.065, 0.015, 0.025]} rotation={[Math.PI / 2, 0, 0]} material={m.wood}>
        <torusGeometry args={[0.016, 0.002, 6, 24]} />
      </mesh>
    </group>
  );
}
function CoinBox({ m, lidRef }) {
  return (
    <group>
      <BevelBox size={[0.24, 0.018, 0.18]} position={[0, 0.009, 0]} material={m.wood} />
      {[-1, 1].map((side) => (
        <React.Fragment key={side}>
          <BevelBox
            size={[0.012, 0.085, 0.18]}
            position={[side * 0.114, 0.05, 0]}
            material={m.wood}
          />
          <BevelBox
            size={[0.24, 0.085, 0.012]}
            position={[0, 0.05, side * 0.084]}
            material={m.wood}
          />
        </React.Fragment>
      ))}
      <group ref={lidRef} position={[0, 0.095, -0.09]} rotation={[-0.15, 0, 0]}>
        <BevelBox size={[0.25, 0.014, 0.19]} position={[0, 0, 0.09]} material={m.wood} />
        <BevelBox
          size={[0.055, 0.004, 0.027]}
          radius={0.001}
          position={[0, 0.01, 0.085]}
          material={m.gold}
        />
      </group>
      {[
        [-0.045, 0.028, 0.025],
        [0.02, 0.032, -0.025],
        [0.042, 0.034, 0.031],
      ].map((p, i) => (
        <mesh key={i} position={p} material={m.gold} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.003, 32]} />
        </mesh>
      ))}
    </group>
  );
}
export function StoryProps({ m, register, Target, lidRef }) {
  return (
    <>
      <Target id="cloth" register={register} position={[0.45, 1.088, -1.5]}>
        <Cloth m={m} />
      </Target>
      <Target
        id="copybook"
        register={register}
        position={[-1.27, 1.111, -2.12]}
        rotation={[0, 0.1, Math.PI / 2]}
      >
        <BoundBook size={[0.045, 0.3, 0.23]} m={m} dark />
      </Target>
      <Target
        id="rent-slip"
        register={register}
        position={[-2.4, 1.48, -2.1]}
        rotation={[0, -0.08, Math.PI / 2]}
      >
        <BoundBook size={[0.04, 0.25, 0.19]} m={m} />
      </Target>
      <Target id="sandal" register={register} position={[-3.04, 0.765, -2.05]}>
        <Strap m={m} />
      </Target>
      <Target id="coinbox" register={register} position={[1.46, 1.081, -1.58]}>
        <CoinBox m={m} lidRef={lidRef} />
      </Target>
      <Target
        id="questionbook"
        register={register}
        position={[1.46, 1.107, -2.12]}
        rotation={[0, -0.15, Math.PI / 2]}
      >
        <BoundBook size={[0.05, 0.3, 0.22]} m={m} />
      </Target>
    </>
  );
}
