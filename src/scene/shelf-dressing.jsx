import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { BevelBox, BoundBook } from './props.jsx';
import { StaticDecoration } from './static-decoration.jsx';

function Twine({ m, scale = 1, ...props }) {
  const end = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.035, 0.014, 0),
          new THREE.Vector3(0.06, 0.009, 0.017),
          new THREE.Vector3(0.077, 0.004, 0.043),
        ]),
        16,
        0.0025,
        6,
        false,
      ),
    [],
  );
  useEffect(() => () => end.dispose(), [end]);
  return (
    <group scale={scale} {...props}>
      <mesh position={[0, 0.028, 0]} material={m.wood} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.062, 16]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          position={[0, 0.006 + i * 0.006, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={m.folder}
          castShadow
        >
          <torusGeometry args={[0.033, 0.0037, 6, 28]} />
        </mesh>
      ))}
      <mesh geometry={end} material={m.folder} castShadow />
    </group>
  );
}
function SupplyBox({ m, lidRef }) {
  return (
    <group>
      <BevelBox size={[0.27, 0.012, 0.23]} position={[0, 0.006, 0]} material={m.wood} />
      {[-1, 1].map((side) => (
        <React.Fragment key={side}>
          <BevelBox
            size={[0.012, 0.11, 0.23]}
            position={[side * 0.129, 0.061, 0]}
            material={m.wood}
          />
          <BevelBox
            size={[0.27, 0.11, 0.012]}
            position={[0, 0.061, side * 0.109]}
            material={m.wood}
          />
        </React.Fragment>
      ))}
      <group ref={lidRef} position={[0, 0.122, -0.115]}>
        <BevelBox size={[0.28, 0.012, 0.24]} position={[0, 0, 0.115]} material={m.wood} />
        <BevelBox size={[0.025, 0.005, 0.015]} position={[0, 0.01, 0.225]} material={m.gold} />
      </group>
      <Twine m={m} scale={0.7} position={[-0.055, 0.015, 0]} />
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[0.055 + i * 0.01, 0.018 + i * 0.004, 0.02]}
          rotation={[-Math.PI / 2, 0, i * 0.3]}
          scale={[1, 1.8, 1]}
          material={m.gold}
        >
          <torusGeometry args={[0.01, 0.0015, 6, 24]} />
        </mesh>
      ))}
    </group>
  );
}

// Generic room dressing, not new archival documents. Keep the central clues clear.
export function ShelfDressing({ m, Target, register, lidRef }) {
  return (
    <>
      <StaticDecoration>
        {/* Eight upright volumes, a separate horizontal stack and wooden bookends. */}
        {Array.from({ length: 8 }, (_, i) => {
          const height = 0.26 + (i % 4) * 0.026,
            width = 0.075 + (i % 3) * 0.007;
          return (
            <BoundBook
              key={i}
              size={[width, height, 0.24 + (i % 2) * 0.018]}
              position={[-3.27 + i * 0.117, 1.89 + height / 2, -2.18]}
              rotation={[0, ((i % 3) - 1) * 0.04, 0]}
              m={m}
              dark={i % 3 !== 0}
            />
          );
        })}
        {Array.from({ length: 3 }, (_, i) => (
          <BoundBook
            key={i}
            size={[0.032, 0.26, 0.23]}
            position={[-2.1 + (i % 2) * 0.008, 1.906 + i * 0.033, -2.16]}
            rotation={[0, 0.03 * i, Math.PI / 2]}
            m={m}
            dark={Boolean(i % 2)}
          />
        ))}
        {[-3.34, -2.39].map((x) => (
          <group key={x} position={[x, 1.89, -2.18]}>
            <BevelBox size={[0.028, 0.21, 0.25]} position={[0, 0.105, 0]} material={m.wood} />
            <BevelBox
              size={[0.095, 0.015, 0.25]}
              position={[x < -3 ? 0.032 : -0.032, 0.008, 0]}
              material={m.wood}
            />
          </group>
        ))}
        {/* Smaller books surround the original notebook, without covering its red spine. */}
        {[-3.25, -3.12].map((x, i) => (
          <BoundBook
            key={x}
            size={[0.078, 0.24 + i * 0.025, 0.21]}
            position={[x, 1.45 + (0.24 + i * 0.025) / 2, -2.17]}
            m={m}
            dark
          />
        ))}
        {[0, 1].map((i) => (
          <BoundBook
            key={i}
            size={[0.035, 0.25, 0.21]}
            position={[-2.11, 1.467 + i * 0.036, -2.14]}
            rotation={[0, i * 0.06, Math.PI / 2]}
            m={m}
            dark={Boolean(i)}
          />
        ))}
      </StaticDecoration>
      <Target id="shelf-box" register={register} position={[-3.17, 1.16, -2.12]}>
        <SupplyBox m={m} lidRef={lidRef} />
      </Target>
      <Target
        id="paper-bundle"
        register={register}
        position={[-2.11, 1.16, -2.1]}
        rotation={[0, -0.045, 0]}
      >
        {Array.from({ length: 7 }, (_, i) => (
          <BevelBox
            key={i}
            size={[0.27, 0.014, 0.3]}
            radius={0.0015}
            position={[(i % 2) * 0.006, 0.008 + i * 0.015, 0]}
            material={m.pageEdges}
          />
        ))}
        <BevelBox size={[0.008, 0.11, 0.308]} position={[0.032, 0.056, 0]} material={m.folder} />
        <BevelBox size={[0.278, 0.006, 0.008]} position={[0, 0.11, 0.015]} material={m.folder} />
      </Target>
      <Target id="twine" register={register} position={[-3.26, 0.763, -2.16]}>
        <Twine m={m} />
      </Target>
    </>
  );
}
