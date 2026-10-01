import test from 'node:test';
import assert from 'node:assert/strict';
import { getAssetProgress, trackAssets } from '../src/scene/loading.js';

test('boot progress follows model dependencies and retains failed asset URLs', () => {
  const manager = {};
  trackAssets(manager);
  manager.onStart('table.gltf', 0, 1);
  assert.equal(getAssetProgress().active, true);
  manager.onProgress('table.gltf', 1, 4);
  assert.equal(getAssetProgress().total, 4);
  assert.equal(getAssetProgress().loaded, 1);
  manager.onError('missing.jpg');
  manager.onProgress('table.bin', 4, 4);
  manager.onLoad();
  assert.equal(getAssetProgress().active, false);
  assert.deepEqual(getAssetProgress().errors, ['missing.jpg']);
  trackAssets(manager);
  assert.deepEqual(getAssetProgress(), { active: false, loaded: 0, total: 0, errors: [] });
});
