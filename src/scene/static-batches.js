import { Matrix4 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// For opaque, stationary decoration only. Interactive or animated objects stay separate.
export function buildStaticBatches(root) {
  root.updateWorldMatrix(true, true);
  const inverse = new Matrix4().copy(root.matrixWorld).invert();
  const groups = new Map();
  root.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const material = mesh.material;
    if (
      Array.isArray(material) ||
      material.transparent ||
      mesh.isSkinnedMesh ||
      mesh.isInstancedMesh
    ) {
      throw new Error('Static batches require opaque single-material meshes.');
    }
    const key = `${material.uuid}:${mesh.castShadow}:${mesh.receiveShadow}`;
    if (!groups.has(key))
      groups.set(key, {
        material,
        castShadow: mesh.castShadow,
        receiveShadow: mesh.receiveShadow,
        parts: [],
      });
    const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
    geometry.applyMatrix4(new Matrix4().multiplyMatrices(inverse, mesh.matrixWorld));
    groups.get(key).parts.push(geometry);
  });
  const batches = [];
  for (const { parts, ...props } of groups.values()) {
    const geometry = mergeGeometries(parts);
    parts.forEach((part) => part.dispose());
    if (!geometry) {
      batches.forEach((batch) => batch.geometry.dispose());
      throw new Error('Static batch geometry attributes must match.');
    }
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    batches.push({ ...props, geometry });
  }
  return batches;
}
