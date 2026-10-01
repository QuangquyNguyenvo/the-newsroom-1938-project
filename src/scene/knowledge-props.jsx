import React, { useEffect, useMemo } from 'react';
import { BevelBox, BoundBook } from './props.jsx';
import { labelTexture } from './materials.js';
import { pressKnowledge } from '../content/press-knowledge.js';

// Optional historical context, staged as small authored room objects. These are
// interpretive prompts for the reader and are not presented as archival evidence.
export const knowledgePositions = {
  'press-origins': { station: 'desk', position: [0.34, 1.08, -1.48] },
  'newsroom-work': { station: 'desk', position: [0.1, 1.08, -2.78] },
  'democratic-front': { station: 'desk', position: [1.48, 1.08, -2.15] },
  // Middle shelf surface is y=1.45. The slim legal folder is rotated, so its
  // short original width supplies the vertical clearance above the plank.
  'legal-press': { station: 'shelf', position: [-2.36, 1.5, -2.12] },
  // Keep the rolled first issue in the open gap between the notebook and folder.
  'first-issue': { station: 'shelf', position: [-2.56, 1.5, -2.12] },
  // Lower shelf gap, between the crate and the tied paper bundle.
  'reading-public': { station: 'shelf', position: [-2.25, 1.16, -2.0] },
  // Bottom shelf surface is y=.763 and remains clear of the twine spool.
  'self-criticism': { station: 'shelf', position: [-2.73, 0.763, -2.18] },
  censorship: { station: 'press', position: [2.08, 0.9, -1.62] },
};

function KnowledgeLabel({ id, size = [0.12, 0.05], position = [0, 0, 0], rotation }) {
  const title = useMemo(
    () => pressKnowledge.find((item) => item.id === id)?.title || 'Hồ sơ mở rộng',
    [id],
  );
  const texture = useMemo(() => labelTexture(title, 'HỒ SƠ HỌC TẬP'), [title]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position} rotation={rotation} renderOrder={2}>
      <planeGeometry args={size} />
      <meshStandardMaterial map={texture} roughness={1} />
    </mesh>
  );
}

function IndexCard({ m, width = 0.16, height = 0.22, accent = 'red', knowledgeId, ...props }) {
  const accentMaterial = accent === 'gold' ? m.gold : accent === 'dark' ? m.charcoalCloth : m.red;
  return (
    <group {...props}>
      <BevelBox
        size={[width, height, 0.014]}
        radius={0.003}
        position={[0, height / 2, 0]}
        material={m.paper}
      />
      <BevelBox
        size={[width * 0.72, 0.009, 0.02]}
        radius={0.001}
        position={[0, height * 0.77, 0.009]}
        material={accentMaterial}
      />
      {[0.43, 0.3, 0.17].map((y, index) => (
        <BevelBox
          key={index}
          size={[width * (0.76 - index * 0.08), 0.003, 0.002]}
          radius={0.0005}
          position={[0, height * y, 0.009]}
          material={m.folder}
        />
      ))}
      <BevelBox
        size={[0.026, 0.008, 0.026]}
        radius={0.002}
        position={[width * 0.3, height * 0.12, 0.01]}
        material={m.gold}
      />
      {knowledgeId && (
        <KnowledgeLabel
          id={knowledgeId}
          size={[width * 0.78, height * 0.34]}
          position={[0, height * 0.53, 0.016]}
        />
      )}
    </group>
  );
}

function Dossier({
  m,
  width = 0.25,
  depth = 0.19,
  pages = 4,
  accent = 'red',
  knowledgeId,
  ...props
}) {
  const accentMaterial = accent === 'gold' ? m.gold : m.red;
  return (
    <group {...props}>
      {Array.from({ length: pages }, (_, index) => (
        <BevelBox
          key={index}
          size={[width, 0.012, depth]}
          radius={0.0015}
          position={[(index % 2) * 0.005, 0.008 + index * 0.013, 0]}
          material={index === pages - 1 ? m.paper : m.pageEdges}
        />
      ))}
      <BevelBox
        size={[0.012, 0.065, depth + 0.008]}
        radius={0.001}
        position={[-width * 0.22, 0.046, 0]}
        material={accentMaterial}
      />
      <BevelBox
        size={[width * 0.8, 0.006, 0.008]}
        radius={0.001}
        position={[0, 0.067, depth * 0.18]}
        material={m.folder}
      />
      <BevelBox
        size={[0.035, 0.004, 0.024]}
        radius={0.001}
        position={[width * 0.28, 0.071, depth * 0.25]}
        material={m.gold}
      />
      {knowledgeId && (
        <KnowledgeLabel
          id={knowledgeId}
          size={[width * 0.78, 0.05]}
          position={[0, 0.09, depth / 2 + 0.009]}
        />
      )}
    </group>
  );
}

function Scroll({ m, scale = 1, ...props }) {
  return (
    <group scale={scale} {...props}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={m.paper} castShadow receiveShadow>
        <cylinderGeometry args={[0.048, 0.048, 0.22, 24]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.104]} material={m.pageEdges}>
        <circleGeometry args={[0.039, 24]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.104]} material={m.pageEdges}>
        <circleGeometry args={[0.039, 24]} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0.004, 0]} material={m.folder} castShadow>
        <torusGeometry args={[0.052, 0.004, 7, 28]} />
      </mesh>
    </group>
  );
}

function PressTray({ m, knowledgeId, ...props }) {
  return (
    <group {...props}>
      <BevelBox size={[0.31, 0.014, 0.2]} radius={0.003} material={m.dark} />
      <BevelBox
        size={[0.31, 0.032, 0.008]}
        radius={0.001}
        position={[0, 0.018, -0.096]}
        material={m.wood}
      />
      <BevelBox
        size={[0.31, 0.032, 0.008]}
        radius={0.001}
        position={[0, 0.018, 0.096]}
        material={m.wood}
      />
      {Array.from({ length: 6 }, (_, index) => (
        <BevelBox
          key={index}
          size={[0.034, 0.024, 0.027]}
          radius={0.003}
          position={[-0.11 + index * 0.044, 0.031, -0.012 + (index % 2) * 0.027]}
          material={index % 3 === 0 ? m.gold : m.charcoalCloth}
        />
      ))}
      <BevelBox
        size={[0.19, 0.004, 0.06]}
        radius={0.001}
        position={[0, 0.042, 0.058]}
        material={m.paper}
      />
      {knowledgeId && (
        <KnowledgeLabel id={knowledgeId} size={[0.2, 0.05]} position={[0, 0.067, 0.105]} />
      )}
    </group>
  );
}

function ShelfFolder({ m, width = 0.12, height = 0.23, accent = 'gold', knowledgeId, ...props }) {
  return (
    <group {...props}>
      <BoundBook size={[width, height, 0.15]} m={m} dark />
      <BevelBox
        size={[width * 0.62, 0.006, 0.004]}
        radius={0.001}
        position={[0, height * 0.24, 0.08]}
        material={accent === 'red' ? m.red : m.gold}
      />
      {knowledgeId && (
        <KnowledgeLabel
          id={knowledgeId}
          size={[width * 0.7, height * 0.32]}
          position={[0, height * 0.05, 0.084]}
        />
      )}
    </group>
  );
}

export function KnowledgeProps({ m, Target, register }) {
  return (
    <>
      <Target
        id="press-origins"
        register={register}
        position={knowledgePositions['press-origins'].position}
        rotation={[0, -0.08, 0]}
      >
        <IndexCard m={m} accent="gold" knowledgeId="press-origins" />
      </Target>

      <Target
        id="newsroom-work"
        register={register}
        position={knowledgePositions['newsroom-work'].position}
        rotation={[0, 0.08, 0]}
      >
        <Dossier m={m} width={0.26} depth={0.2} pages={5} knowledgeId="newsroom-work" />
        <IndexCard
          m={m}
          width={0.12}
          height={0.16}
          accent="dark"
          position={[0.105, 0.055, 0.015]}
          rotation={[0, -0.2, -0.06]}
        />
      </Target>

      <Target
        id="democratic-front"
        register={register}
        position={knowledgePositions['democratic-front'].position}
        rotation={[0, -0.05, 0]}
      >
        <Dossier
          m={m}
          width={0.2}
          depth={0.16}
          pages={3}
          accent="gold"
          knowledgeId="democratic-front"
        />
        <IndexCard
          m={m}
          width={0.105}
          height={0.16}
          position={[-0.11, 0.052, 0.01]}
          rotation={[0, 0.18, 0.08]}
        />
      </Target>

      <Target
        id="legal-press"
        register={register}
        position={knowledgePositions['legal-press'].position}
        rotation={[0, 0.03, Math.PI / 2]}
      >
        <ShelfFolder m={m} width={0.1} height={0.22} accent="red" knowledgeId="legal-press" />
      </Target>

      <Target
        id="first-issue"
        register={register}
        position={knowledgePositions['first-issue'].position}
        rotation={[0, -0.12, 0]}
      >
        <Scroll m={m} scale={0.82} />
        <IndexCard
          m={m}
          width={0.11}
          height={0.13}
          accent="red"
          knowledgeId="first-issue"
          position={[-0.07, 0, 0.02]}
          rotation={[0, -0.1, -0.12]}
        />
      </Target>

      <Target
        id="reading-public"
        register={register}
        position={knowledgePositions['reading-public'].position}
        rotation={[0, 0.05, 0]}
      >
        <Dossier
          m={m}
          width={0.22}
          depth={0.15}
          pages={3}
          accent="gold"
          knowledgeId="reading-public"
        />
        <BevelBox
          size={[0.09, 0.008, 0.015]}
          radius={0.002}
          position={[0, 0.06, 0.09]}
          material={m.red}
        />
      </Target>

      <Target
        id="self-criticism"
        register={register}
        position={knowledgePositions['self-criticism'].position}
        rotation={[0, -0.08, 0]}
      >
        <Dossier
          m={m}
          width={0.24}
          depth={0.18}
          pages={4}
          accent="red"
          knowledgeId="self-criticism"
        />
        <BevelBox
          size={[0.08, 0.006, 0.024]}
          radius={0.001}
          position={[0.07, 0.07, 0.025]}
          material={m.gold}
        />
      </Target>

      <Target
        id="censorship"
        register={register}
        position={knowledgePositions.censorship.position}
        rotation={[0, -0.12, 0]}
      >
        <PressTray m={m} knowledgeId="censorship" />
        <Scroll m={m} scale={0.62} position={[0.19, 0.03, 0.015]} rotation={[0, Math.PI / 2, 0]} />
      </Target>
    </>
  );
}
