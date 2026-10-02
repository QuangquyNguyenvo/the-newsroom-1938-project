import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BoxGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
} from 'three';
import { CachedAOPass } from '../src/scene/cached-ao.js';

function fixture() {
  const scene = new Scene();
  const camera = new PerspectiveCamera(58, 2, 0.1, 40);
  const geometry = new BoxGeometry();
  const material = new MeshBasicMaterial();
  const mesh = new Mesh(geometry, material);
  scene.add(mesh);
  const pass = new CachedAOPass(scene, camera, 32, 16);
  const calls = [];
  pass._renderOverride = () => calls.push('normals');
  pass._renderPass = (_, shader, target) => calls.push({ shader, target });
  const write = { texture: {} };
  const read = { texture: {} };
  function render() {
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    calls.length = 0;
    pass.render({}, write, read);
    return calls.slice();
  }
  return {
    scene,
    camera,
    geometry,
    material,
    mesh,
    pass,
    calls,
    write,
    read,
    render,
    dispose() {
      pass.dispose();
      geometry.dispose();
      material.dispose();
    },
  };
}

test('stationary AO reuses denoised occlusion but composites this frame’s fresh color', () => {
  const f = fixture();
  try {
    assert.equal(f.render().length, 5);
    assert.equal(f.pass.reused, false);
    f.read.texture = { frame: 2 };
    const cached = f.render();
    assert.equal(f.pass.reused, true);
    assert.deepEqual(
      cached.map((c) => c.shader),
      [f.pass.copyMaterial, f.pass.blendMaterial],
    );
    assert.equal(f.pass.copyMaterial.uniforms.tDiffuse.value, f.read.texture);
    assert.equal(f.pass.blendMaterial.uniforms.tDiffuse.value, f.pass.pdRenderTarget.texture);
    assert(cached.every((c) => c.target === f.write));
    f.pass.renderToScreen = true;
    assert(f.render().every((c) => c.target === null));
  } finally {
    f.dispose();
  }
});

test('camera, projection, object transforms, visibility and loaded meshes refresh AO', () => {
  const f = fixture();
  try {
    f.render();
    for (const mutate of [
      () => (f.camera.position.x += 0.01),
      () => {
        f.camera.aspect = 1;
        f.camera.updateProjectionMatrix();
      },
      () => (f.mesh.rotation.y += 0.1),
      () => (f.mesh.visible = false),
      () => (f.mesh.visible = true),
      () => f.scene.add(new Mesh(f.geometry, f.material)),
      () => f.scene.remove(f.mesh),
    ]) {
      mutate();
      assert.equal(f.render().length, 5);
      assert.equal(f.pass.reused, false);
      assert.equal(f.render().length, 2);
    }
  } finally {
    f.dispose();
  }
});

test('buffer edits, instances, size and quality changes invalidate AO; deformed meshes bypass cache', () => {
  const f = fixture();
  try {
    f.render();
    f.geometry.attributes.position.needsUpdate = true;
    assert.equal(f.render().length, 5);
    const instances = new InstancedMesh(f.geometry, f.material, 2);
    f.scene.add(instances);
    assert.equal(f.render().length, 5);
    assert.equal(f.render().length, 2);
    instances.setMatrixAt(0, new Matrix4().makeTranslation(1, 0, 0));
    instances.instanceMatrix.needsUpdate = true;
    assert.equal(f.render().length, 5);
    f.pass.setSize(64, 32);
    assert.equal(f.render().length, 5);
    f.pass.updateGtaoMaterial({ radius: 0.3 });
    assert.equal(f.render().length, 5);
    f.pass.updatePdMaterial({ radius: 3 });
    assert.equal(f.render().length, 5);
    f.mesh.morphTargetInfluences = [0.5];
    assert.equal(f.render().length, 5);
    assert.equal(f.render().length, 5);
    f.mesh.morphTargetInfluences = [];
    f.render();
    assert.equal(f.render().length, 2);
    f.pass.cacheEnabled = false;
    assert.equal(f.render().length, 5);
  } finally {
    f.dispose();
  }
});
