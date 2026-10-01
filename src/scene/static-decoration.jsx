import React, { useLayoutEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { buildStaticBatches } from './static-batches.js';

export function StaticDecoration({ children }) {
  const source = useRef();
  const [batches, setBatches] = useState([]);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  useLayoutEffect(() => {
    const next = buildStaticBatches(source.current);
    setBatches(next);
    gl.shadowMap.needsUpdate = true;
    invalidate();
    return () => next.forEach((batch) => batch.geometry.dispose());
  }, [children, gl, invalidate]);
  return (
    <>
      <group ref={source} visible={!batches.length}>
        {children}
      </group>
      {batches.map((batch, index) => (
        <mesh key={index} {...batch} dispose={null} raycast={() => null} />
      ))}
    </>
  );
}
