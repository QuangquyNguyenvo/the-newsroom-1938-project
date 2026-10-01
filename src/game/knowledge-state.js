import { pressKnowledge } from '../content/press-knowledge.js';

export const knowledgeKey = 'game-lsd:press-knowledge-v1';
const dossiers = new Map(pressKnowledge.map((item) => [item.id, item]));
export const freshKnowledgeState = () => ({ read: {}, pinned: [], answers: {} });
export function normalizeKnowledgeState(value) {
  const state = freshKnowledgeState();
  if (!value || typeof value !== 'object') return state;
  for (const [id, pages] of Object.entries(value.read || {})) {
    const item = dossiers.get(id);
    if (!item || !Array.isArray(pages)) continue;
    state.read[id] = [
      ...new Set(
        pages.filter((index) => Number.isInteger(index) && index >= 0 && index < item.pages.length),
      ),
    ];
  }
  state.pinned = [
    ...new Set((Array.isArray(value.pinned) ? value.pinned : []).filter((id) => dossiers.has(id))),
  ];
  for (const [id, answer] of Object.entries(value.answers || {})) {
    const item = dossiers.get(id);
    if (item && Number.isInteger(answer) && answer >= 0 && answer < item.challenge.choices.length)
      state.answers[id] = answer;
  }
  return state;
}
export function loadKnowledgeState(storage) {
  try {
    return normalizeKnowledgeState(JSON.parse(storage.getItem(knowledgeKey)));
  } catch {
    return freshKnowledgeState();
  }
}
export function saveKnowledgeState(storage, state) {
  try {
    storage.setItem(knowledgeKey, JSON.stringify(normalizeKnowledgeState(state)));
    return true;
  } catch {
    return false;
  }
}
