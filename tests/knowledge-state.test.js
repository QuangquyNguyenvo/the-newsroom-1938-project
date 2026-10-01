import test from 'node:test';
import assert from 'node:assert/strict';
import {
  freshKnowledgeState,
  normalizeKnowledgeState,
  saveKnowledgeState,
  loadKnowledgeState,
  knowledgeKey,
} from '../src/game/knowledge-state.js';
import { freshState, SAVE_KEY } from '../src/game/state.js';
import { pressKnowledge } from '../src/content/press-knowledge.js';

test('optional knowledge normalizes stale IDs, page bounds and answer indices', () => {
  const item = pressKnowledge[0];
  const state = normalizeKnowledgeState({
    read: { [item.id]: [0, 0, 3, -1, 4, '1'], obsolete: [0] },
    pinned: [item.id, item.id, 'obsolete'],
    answers: { [item.id]: item.challenge.answer, obsolete: 0 },
  });
  assert.deepEqual(state.read, { [item.id]: [0, 3] });
  assert.deepEqual(state.pinned, [item.id]);
  assert.equal(state.answers[item.id], item.challenge.answer);
  assert.deepEqual(normalizeKnowledgeState(null), freshKnowledgeState());
  assert.deepEqual(normalizeKnowledgeState({ answers: { [item.id]: 200 } }).answers, {});
});
test('reading and optional answers survive reload without modifying the main game save', () => {
  const item = pressKnowledge[0],
    main = JSON.stringify(freshState()),
    data = new Map([[SAVE_KEY, main]]);
  const storage = {
    getItem: (key) => data.get(key),
    setItem: (key, value) => data.set(key, value),
  };
  const optional = {
    read: { [item.id]: [0, 1] },
    pinned: [item.id],
    answers: { [item.id]: item.challenge.answer },
  };
  assert.equal(saveKnowledgeState(storage, optional), true);
  assert.deepEqual(loadKnowledgeState(storage), optional);
  assert.equal(storage.getItem(SAVE_KEY), main);
  data.set(knowledgeKey, 'broken');
  assert.deepEqual(loadKnowledgeState(storage), freshKnowledgeState());
  const blocked = {
    getItem() {
      throw Error('blocked');
    },
    setItem() {
      throw Error('blocked');
    },
  };
  assert.equal(saveKnowledgeState(blocked, optional), false);
  assert.deepEqual(loadKnowledgeState(blocked), freshKnowledgeState());
});
