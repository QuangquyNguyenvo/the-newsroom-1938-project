import test from 'node:test';
import assert from 'node:assert/strict';
import {
  graphicsKey,
  loadGraphics,
  normalizeGraphics,
  presetForTier,
  tierForRenderer,
  presetGraphics,
  saveGraphics,
} from '../src/scene/graphics.js';

test('corrupt settings cannot enable invalid sizes or non-finite exposure', () => {
  const value = normalizeGraphics({
    preset: 'custom',
    resolution: 30,
    shadows: 999999,
    ao: 'unknown',
    exposure: Infinity,
    film: -10,
    bloom: 'false',
    dpr: 100,
  });
  assert.equal(value.resolution, 1);
  assert.equal(value.shadows, 1024);
  assert.equal(value.ao, 'off');
  assert.equal(value.exposure, 1);
  assert.equal(value.film, 0);
  assert.equal(value.bloom, false);
  assert.equal(value.dpr, 1);
  assert.equal(normalizeGraphics({ preset: '__proto__' }).preset, 'balanced');
});
test('presets saved before GPU detection restart from the detected level; custom and chosen ones survive', () => {
  const old = { ...presetGraphics('cinematic'), resolution: 1, dof: true };
  delete old.revision;
  const map = new Map([['game-lsd:graphics-v1', JSON.stringify(old)]]);
  const storage = { getItem: (key) => map.get(key) ?? null };
  assert.deepEqual(loadGraphics(storage, false, 'integrated'), presetGraphics('balanced'));
  assert.deepEqual(loadGraphics(storage, false, 'discrete'), presetGraphics('high'));
  map.set('game-lsd:graphics-manual', '1');
  assert.equal(loadGraphics(storage, false, 'integrated').preset, 'cinematic');
  map.delete('game-lsd:graphics-manual');
  map.set('game-lsd:graphics-v1', JSON.stringify(old));
  old.preset = 'custom';
  map.set('game-lsd:graphics-v1', JSON.stringify(old));
  assert.equal(loadGraphics(storage).dof, true);
  assert.equal(loadGraphics(storage).resolution, 1);
});
test('the starting preset follows the renderer and never begins at the heaviest level', () => {
  assert.equal(
    tierForRenderer('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device), SwiftShader driver)'),
    'software',
  );
  assert.equal(tierForRenderer('Microsoft Basic Render Driver'), 'software');
  assert.equal(
    tierForRenderer('ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11)'),
    'integrated',
  );
  assert.equal(tierForRenderer('ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11)'), 'integrated');
  assert.equal(tierForRenderer('ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 Direct3D11)'), 'discrete');
  assert.equal(tierForRenderer(''), 'unknown');
  assert.equal(presetForTier('software'), 'low');
  assert.equal(presetForTier('integrated'), 'balanced');
  assert.equal(presetForTier('discrete'), 'high');
  assert.equal(presetForTier('discrete', true), 'balanced');
  assert.equal(presetForTier('unknown'), 'balanced');
});
test('settings round trip separately from game progress, including disabled effects', () => {
  const map = new Map([['game-lsd:save', 'progress']]);
  const storage = { getItem: (key) => map.get(key), setItem: (key, value) => map.set(key, value) };
  const settings = {
    ...presetGraphics('high'),
    preset: 'custom',
    shadows: 0,
    ao: 'off',
    bloom: false,
    dof: false,
    film: 0,
    exposure: 1.2,
    atmosphere: false,
  };
  assert.equal(saveGraphics(storage, settings), true);
  assert.deepEqual(loadGraphics(storage), settings);
  assert.equal(map.get('game-lsd:save'), 'progress');
  assert(map.has(graphicsKey));
});
test('unavailable storage and invalid JSON retain usable desktop/mobile defaults', () => {
  const blocked = {
    getItem() {
      throw Error('blocked');
    },
    setItem() {
      throw Error('blocked');
    },
  };
  assert.equal(loadGraphics(blocked).preset, 'balanced');
  assert.equal(loadGraphics(blocked, true).preset, 'balanced');
  assert.equal(saveGraphics(blocked, presetGraphics('low')), false);
  assert.equal(loadGraphics({ getItem: () => '{' }).preset, 'balanced');
});
