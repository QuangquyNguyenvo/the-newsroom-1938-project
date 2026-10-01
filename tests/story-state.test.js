import test from 'node:test';
import assert from 'node:assert/strict';
import {
  freshStoryState,
  normalizeStoryState,
  loadStoryState,
  saveStoryState,
  availableStoryStage,
  storyKey,
} from '../src/game/story-state.js';
test('optional story memory rejects unknown scenes and choices without a viewed scene', () => {
  const value = normalizeStoryState({
    seen: ['cloth:0', 'cloth:0', 'cloth:9', 'bad:0'],
    choices: { 'cloth:0': 1, 'cloth:1': 0, 'bad:0': 1 },
    visits: { cloth: 2, window: Infinity, coinbox: -1, bad: 3 },
  });
  assert.deepEqual(value, { seen: ['cloth:0'], choices: { 'cloth:0': 1 }, visits: { cloth: 2 } });
  assert.equal(availableStoryStage({ completed: [] }), 0);
  assert.equal(availableStoryStage({ completed: ['voices'] }), 1);
  assert.equal(availableStoryStage({ completed: ['voices', 'publication', 'pressure'] }), 2);
});
test('story choices survive reload independently of puzzle evidence and tolerate blocked storage', () => {
  const map = new Map([['game-lsd:v1', 'existing puzzle progress']]);
  const storage = { getItem: (k) => map.get(k), setItem: (k, v) => map.set(k, v) };
  const state = {
    seen: ['cloth:0', 'questionbook:1'],
    choices: { 'cloth:0': 0, 'questionbook:1': 1 },
    visits: { cloth: 1, lamp: 3 },
  };
  assert(saveStoryState(storage, state));
  assert.deepEqual(loadStoryState(storage), state);
  assert.equal(map.get('game-lsd:v1'), 'existing puzzle progress');
  assert(map.has(storyKey));
  assert.deepEqual(loadStoryState({ getItem: () => '{' }), freshStoryState());
  assert.equal(
    saveStoryState(
      {
        setItem() {
          throw Error('blocked');
        },
      },
      state,
    ),
    false,
  );
});
