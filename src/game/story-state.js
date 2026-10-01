import { sideStories } from '../content/side-stories.js';
import { roomProps } from '../content/room-props.js';
export const storyKey = 'game-lsd:side-stories-v1';
const keys = new Set(
  sideStories.flatMap((story) => story.scenes.map((_, i) => `${story.id}:${i}`)),
);
const visitIds = new Set([...sideStories, ...roomProps].map((item) => item.id));
export const freshStoryState = () => ({ seen: [], choices: {}, visits: {} });
export function normalizeStoryState(value) {
  const state = freshStoryState();
  if (!value || typeof value !== 'object') return state;
  state.seen = [
    ...new Set((Array.isArray(value.seen) ? value.seen : []).filter((key) => keys.has(key))),
  ];
  for (const [key, choice] of Object.entries(value.choices || {}))
    if (keys.has(key) && [0, 1].includes(choice) && state.seen.includes(key))
      state.choices[key] = choice;
  for (const [id, count] of Object.entries(value.visits || {}))
    if (visitIds.has(id) && Number.isInteger(count) && count > 0)
      state.visits[id] = Math.min(count, 100000);
  return state;
}
export function loadStoryState(storage) {
  try {
    return normalizeStoryState(JSON.parse(storage.getItem(storyKey)));
  } catch {
    return freshStoryState();
  }
}
export function saveStoryState(storage, state) {
  try {
    storage.setItem(storyKey, JSON.stringify(normalizeStoryState(state)));
    return true;
  } catch {
    return false;
  }
}
export const availableStoryStage = (game) => Math.min(2, Math.max(0, game.completed.length));
