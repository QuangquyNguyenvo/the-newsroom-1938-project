import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Atmospheric illustration only. One point cloud, no external assets or postprocessing pass.
export function Atmosphere({ enabled, shaftRef, lampLightRef }) {
  const flame = useRef(),
    halo = useRef();
  const time = useRef(0);
  const resources = useMemo(() => {
    let seed = 1938;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const positions = new Float32Array(120 * 3),
      phases = new Float32Array(120);
    for (let i = 0; i < 120; i++) {
      const depth = random() * 2.5;
      positions.set(
        [
          (random() - 0.5) * 1.9 + depth * 0.16,
          2.6 - depth * 0.65 + (random() - 0.5) * 0.9,
          -3.05 + depth,
        ],
        i * 3,
      );
      phases[i] = random() * Math.PI * 2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
    const dust = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { time: { value: 0 }, strength: { value: 0.5 } },
      vertexShader: `attribute float phase; uniform float time; varying float gleam;
        void main() { vec3 p = position;
          p.x += sin(time * .22 + phase) * .12; p.y += sin(time * .17 + phase * 2.) * .07;
          vec4 view = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * view;
          gl_PointSize = clamp(8. / -view.z, 1., 3.5);
          gleam = .6 + .4 * sin(time * .4 + phase);
        }`,
      fragmentShader: `uniform float strength; varying float gleam;
        void main() { float edge = 1. - smoothstep(.08, .5, length(gl_PointCoord - .5));
          gl_FragColor = vec4(vec3(1., .81, .48), edge * gleam * strength); }`,
    });
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d'),
      gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, '#fff5d8');
    gradient.addColorStop(0.18, '#ffdf98bb');
    gradient.addColorStop(0.5, '#ffa02a33');
    gradient.addColorStop(1, '#ff871000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const glow = new THREE.CanvasTexture(canvas);
    glow.colorSpace = THREE.SRGBColorSpace;
    return { geometry, dust, glow };
  }, []);
  useEffect(
    () => () => {
      resources.geometry.dispose();
      resources.dust.dispose();
      resources.glow.dispose();
    },
    [resources],
  );
  useFrame((_, delta) => {
    if (enabled.current) time.current += Math.min(delta, 0.1);
    const t = time.current;
    resources.dust.uniforms.time.value = t;
    resources.dust.uniforms.strength.value = enabled.current
      ? (shaftRef.current?.uniforms.strength.value ?? 0.2) * 1.8
      : 0;
    const lit = (lampLightRef.current?.intensity ?? 0.9) / 0.9;
    if (flame.current) {
      flame.current.scale.set(
        0.022 * (1 + Math.sin(t * 9) * 0.09),
        0.065 * (1 + Math.sin(t * 7.3) * 0.12),
        1,
      );
      flame.current.material.opacity = Math.min(1, lit);
    }
    if (halo.current)
      halo.current.material.opacity = 0.36 * Math.min(1, lit) * (1 + Math.sin(t * 5.7) * 0.05);
  });
  return (
    <group>
      <points geometry={resources.geometry} material={resources.dust} raycast={() => null} />
      <sprite
        ref={flame}
        position={[-1.25, 1.365, -2.65]}
        scale={[0.022, 0.065, 1]}
        raycast={() => null}
      >
        <spriteMaterial
          map={resources.glow}
          color="#fff4cc"
          transparent
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite
        ref={halo}
        position={[-1.25, 1.365, -2.65]}
        scale={[0.3, 0.3, 1]}
        raycast={() => null}
      >
        <spriteMaterial
          map={resources.glow}
          color="#ffad47"
          transparent
          opacity={0.36}
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

// Soft contact at the feet of furniture supplements the directional shadow map.
export function ContactShade({ position, size, opacity = 0.24 }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
      <planeGeometry args={size} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={{ opacity: { value: opacity } }}
        vertexShader="varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }"
        fragmentShader="uniform float opacity; varying vec2 vUv; void main(){vec2 d=abs(vUv-.5)*2.; float a=(1.-smoothstep(.2,1.,d.x))*(1.-smoothstep(.2,1.,d.y)); gl_FragColor=vec4(.08,.055,.03,a*opacity);}"
      />
    </mesh>
  );
}
