import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chapters, objects, evidenceLabels, sources } from '../src/content/chapters.js';
import { editorial } from '../src/content/editorial.js';
import { sideStories, readerForStory } from '../src/content/side-stories.js';
import { roomProps } from '../src/content/room-props.js';
import { pressKnowledge } from '../src/content/press-knowledge.js';
import { editorialReview } from '../src/content/editorial-review.js';
const evidence = new Set(objects.flatMap((o) => o.pages.map((p) => p.evidence).filter(Boolean)));
assert.equal(new Set(objects.map((o) => o.id)).size, objects.length, 'Duplicate object IDs');
for (const c of chapters) {
  assert(sources[c.source], `Missing source for ${c.id}`);
  assert(c.requiredEvidence.includes(c.proof), `Proof outside requirements: ${c.id}`);
  for (const id of c.requiredEvidence)
    assert(evidence.has(id) && evidenceLabels[id], `Missing evidence: ${id}`);
  for (const slot of c.slots)
    assert(slot.choices.includes(slot.answer), `Unreachable answer: ${c.id}`);
  const article = editorial[c.id];
  assert(article?.headline && article.lead, `Missing editorial article: ${c.id}`);
  assert(article.proofQuestion && article.proofMisread, `Missing proof explanation: ${c.id}`);
  assert.equal(
    article.columns.length,
    c.slots.length,
    `Editorial columns differ from puzzle: ${c.id}`,
  );
  for (const column of article.columns) {
    for (const field of [
      'heading',
      'question',
      'scene',
      'before',
      'after',
      'article',
      'why',
      'reader',
      'misread',
    ])
      assert(
        typeof column[field] === 'string' && column[field].trim(),
        `Missing editorial ${field}: ${c.id}`,
      );
    assert(sources[column.source], `Missing editorial source: ${c.id}`);
  }
  for (const asset of [c.video, c.poster].filter(Boolean)) {
    assert(asset.startsWith('/assets/'), 'Media must live under public/assets');
    assert(existsSync(`public${asset}`), `Missing media file ${asset}`);
  }
}
assert(existsSync('public/assets/textures/archival-paper.webp'), 'Missing paper texture');
const allIds = [...objects, ...roomProps, ...sideStories, ...pressKnowledge].map((o) => o.id);
assert.equal(new Set(allIds).size, allIds.length, 'Overlapping room/story/evidence IDs');
for (const story of sideStories) {
  assert(
    readerForStory(story) && ['desk', 'shelf', 'press'].includes(story.station),
    'Missing reader/station',
  );
  assert(
    sideStories.some((s) => s.id === story.related),
    'Unreachable related story',
  );
  assert.equal(story.scenes.length, 3, 'Story must evolve across three stages');
  for (const scene of story.scenes) {
    assert(scene.title && scene.scene && scene.reflection, 'Incomplete story scene');
    assert.equal(scene.questions.length, 2, 'Two dialogue followups required');
    assert(
      scene.lines.length >= 2 && scene.lines.every(([speaker, text]) => speaker && text),
      'Incomplete dialogue',
    );
    for (const q of scene.questions) assert(q.label && q.speaker && q.text, 'Incomplete followup');
    assert(!JSON.stringify(scene).includes('—'), 'No em dash in player-facing prose');
  }
}
for (const prop of roomProps) {
  assert(
    prop.thought?.length && prop.thought.every((text) => typeof text === 'string' && text.trim()),
    'Missing local prop response',
  );
  assert(
    prop.thought.every((text) => !/(chị Tư|anh Ba|cậu Năm|(?:^|\s)Út(?:\s|[,.!?]|$))/iu.test(text)),
    'Ordinary props must not trigger unrelated reader stories',
  );
}
for (const item of pressKnowledge) {
  assert(
    item.title && item.label && item.intro && ['desk', 'shelf', 'press'].includes(item.station),
    'Incomplete knowledge dossier',
  );
  assert(item.pages.length >= 3, 'Knowledge dossier needs more than a single fact');
  for (const page of item.pages)
    assert(
      page.title && page.body && page.source?.title && page.source?.url.startsWith('https://'),
      'Missing sourced knowledge page',
    );
  const task = item.challenge;
  assert(
    task.prompt &&
      task.explanation &&
      task.source?.title &&
      task.source?.url.startsWith('https://'),
    'Missing knowledge question source',
  );
  assert(
    task.choices.length >= 3 &&
      Number.isInteger(task.answer) &&
      task.answer >= 0 &&
      task.answer < task.choices.length,
    'Unreachable knowledge answer',
  );
  assert(!JSON.stringify(item).includes('—'), 'No em dash in knowledge prose');
}
for (const chapter of chapters) {
  assert.equal(editorialReview[chapter.id]?.length, 2, 'Two editorial comparison tasks expected');
  for (const task of editorialReview[chapter.id]) {
    assert(
      task.prompt && task.explanation && task.hint && sources[task.source],
      'Incomplete editorial comparison',
    );
    assert(
      Number.isInteger(task.answer) && task.choices[task.answer],
      'Unreachable editorial comparison answer',
    );
  }
}
console.log(
  `Content PASS: ${chapters.length} chapters, ${objects.length} evidence objects, ${sideStories.length} side objects / ${sideStories.length * 3} scenes, ${pressKnowledge.length} optional dossiers / ${pressKnowledge.reduce((sum, item) => sum + item.pages.length, 0)} pages. Videos pending: ${chapters.filter((c) => !c.video).length}.`,
);
