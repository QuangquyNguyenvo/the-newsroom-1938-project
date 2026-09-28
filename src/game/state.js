import { chapters } from '../content/chapters.js';

export const SAVE_KEY = 'game-lsd:v1';
export function freshState() {
  return { chapter: 0, evidence: [], completed: [], hint: 0 };
}
export function normalizeState(value) {
  const base = freshState();
  if (!value || typeof value !== 'object') return base;
  // Only a contiguous completion prefix can unlock later chapters.
  for (const item of chapters) {
    if (!Array.isArray(value.completed) || !value.completed.includes(item.id)) break;
    base.completed.push(item.id);
  }
  base.chapter = Math.min(base.completed.length, chapters.length - 1);
  const allowed = new Set(chapters.flatMap(c => c.requiredEvidence));
  base.evidence = [...new Set((Array.isArray(value.evidence) ? value.evidence : []).filter(id => allowed.has(id)))];
  return base;
}
export function loadState(storage) {
  try { return normalizeState(JSON.parse(storage.getItem(SAVE_KEY))); }
  catch { return freshState(); }
}
export function saveState(storage, state) {
  try { storage.setItem(SAVE_KEY, JSON.stringify(state)); return true; }
  catch { return false; }
}
export function collectEvidence(state, id) {
  if (!state.evidence.includes(id)) state.evidence.push(id);
}
export function checkAnswer(state, selections, proof) {
  const chapter = chapters[state.chapter];
  const missing = chapter.requiredEvidence.filter(id => !state.evidence.includes(id));
  if (missing.length) return { ok: false, reason: 'missing', missing };
  const incorrect = chapter.slots.flatMap((slot, i) => selections[i] === slot.answer ? [] : [i]);
  if (incorrect.length) return { ok: false, reason: 'slots', incorrect };
  if (proof !== chapter.proof) return { ok: false, reason: 'proof' };
  return { ok: true };
}
export function finishChapter(state) {
  const id = chapters[state.chapter].id;
  if (!state.completed.includes(id)) state.completed.push(id);
}
export function advanceChapter(state) {
  if (!state.completed.includes(chapters[state.chapter].id)) return false;
  if (state.chapter < chapters.length - 1) { state.chapter++; state.hint = 0; return true; }
  return false;
}
