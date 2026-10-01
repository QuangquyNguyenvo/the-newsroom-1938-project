import test from 'node:test';
import assert from 'node:assert/strict';
import {
  graphicsKey,
  loadGraphics,
  normalizeGraphics,
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
  assert.equal(value.resolution, 1.25);
  assert.equal(value.shadows, 4096);
  assert.equal(value.ao, 'high');
  assert.equal(value.exposure, 1);
  assert.equal(value.film, 0);
  assert.equal(value.bloom, true);
  assert.equal(value.dpr, 2);
  assert.equal(normalizeGraphics({ preset: '__proto__' }).preset, 'cinematic');
});
test('old cinematic preset becomes sharp while explicit custom depth of field survives', () => {
  const old = { ...presetGraphics('cinematic'), resolution: 1, dof: true };
  delete old.revision;
  const storage = { getItem: () => JSON.stringify(old) };
  assert.deepEqual(loadGraphics(storage), presetGraphics('cinematic'));
  old.preset = 'custom';
  assert.equal(loadGraphics(storage).dof, true);
  assert.equal(loadGraphics(storage).resolution, 1);
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
  assert.equal(loadGraphics(blocked).preset, 'cinematic');
  assert.equal(loadGraphics(blocked, true).preset, 'balanced');
  assert.equal(saveGraphics(blocked, presetGraphics('low')), false);
  assert.equal(loadGraphics({ getItem: () => '{' }).preset, 'cinematic');
});
