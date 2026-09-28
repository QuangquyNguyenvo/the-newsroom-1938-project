import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { chapters, objects, evidenceLabels, sources } from '../src/content/chapters.js';
const evidence=new Set(objects.flatMap(o=>o.pages.map(p=>p.evidence).filter(Boolean)));
assert.equal(new Set(objects.map(o=>o.id)).size,objects.length,'Duplicate object IDs');
for(const c of chapters){
  assert(sources[c.source],`Missing source for ${c.id}`);
  assert(c.requiredEvidence.includes(c.proof),`Proof outside requirements: ${c.id}`);
  for(const id of c.requiredEvidence)assert(evidence.has(id)&&evidenceLabels[id],`Missing evidence: ${id}`);
  for(const slot of c.slots)assert(slot.choices.includes(slot.answer),`Unreachable answer: ${c.id}`);
  for(const asset of [c.video,c.poster].filter(Boolean)){
    assert(asset.startsWith('/assets/'),'Media must live under public/assets');
    assert(existsSync(`public${asset}`),`Missing media file ${asset}`);
  }
}
assert(existsSync('public/assets/textures/archival-paper.png'),'Missing paper texture');
console.log(`Content PASS: ${chapters.length} chapters, ${objects.length} objects. Videos pending: ${chapters.filter(c=>!c.video).length}.`);
