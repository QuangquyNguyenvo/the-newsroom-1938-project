import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, BoxGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { buildStaticBatches } from '../src/scene/static-batches.js';

test('batching keeps world bounds and triangle counts under nested room transforms', () => {
  const room = new Group();
  room.scale.setScalar(0.75);
  room.rotation.y = 0.4;
  room.position.set(2, 1, -3);
  const root = new Group();
  root.position.set(0, 2, 1);
  room.add(root);
  const material = new MeshStandardMaterial();
  const original = new BoxGeometry(0.2, 0.3, 0.1);
  for (let i = 0; i < 3; i++) {
    const book = new Mesh(original, material);
    book.position.set(i * 0.3, i * 0.1, 0);
    book.rotation.z = i * 0.2;
    book.castShadow = book.receiveShadow = true;
    root.add(book);
  }
  room.updateMatrixWorld(true);
  const expected = new Box3();
  const point = new Vector3();
  root.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const positions = mesh.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++)
      expected.expandByPoint(
        point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld),
      );
  });
  const batches = buildStaticBatches(root);
  assert.equal(batches.length, 1);
  assert.equal(batches[0].geometry.attributes.position.count, original.index.count * 3);
  const result = new Mesh(batches[0].geometry, material);
  result.matrix.copy(root.matrixWorld);
  result.matrixAutoUpdate = false;
  result.updateMatrixWorld(true);
  const actual = new Box3().setFromObject(result, true);
  assert(expected.min.distanceTo(actual.min) < 1e-6);
  assert(expected.max.distanceTo(actual.max) < 1e-6);
  assert.equal(batches[0].castShadow, true);
  assert.equal(batches[0].receiveShadow, true);
  assert.equal(original.index.count, 36);
  batches.forEach((batch) => batch.geometry.dispose());
  original.dispose();
  material.dispose();
});

test('different materials and shadow policies remain distinct batches', () => {
  const root = new Group();
  const geometry = new BoxGeometry();
  const materials = [new MeshStandardMaterial(), new MeshStandardMaterial()];
  const meshes = [
    new Mesh(geometry, materials[0]),
    new Mesh(geometry, materials[0]),
    new Mesh(geometry, materials[1]),
  ];
  meshes[1].castShadow = true;
  root.add(...meshes);
  const batches = buildStaticBatches(root);
  assert.equal(batches.length, 3);
  assert.equal(new Set(batches.map((batch) => batch.material)).size, 2);
  batches.forEach((batch) => batch.geometry.dispose());
  geometry.dispose();
  materials.forEach((material) => material.dispose());
});
