import test from 'node:test';
import assert from 'node:assert/strict';
import { chapters } from '../src/content/chapters.js';
import { freshState, normalizeState, checkAnswer, finishChapter, advanceChapter, collectEvidence, loadState, saveState } from '../src/game/state.js';

test('a guessed headline cannot unlock a chapter without collected evidence',()=>{
  const state=freshState(); const c=chapters[0];
  assert.equal(checkAnswer(state,c.slots.map(s=>s.answer),c.proof).reason,'missing');
  assert.equal(advanceChapter(state),false);
});
test('correct text with the wrong supporting document fails',()=>{
  const state=freshState();state.chapter=1;state.evidence=[...chapters[1].requiredEvidence,'draft'];
  assert.equal(checkAnswer(state,chapters[1].slots.map(s=>s.answer),'draft').reason,'proof');
});
test('the arrest and last publication dates must not be conflated',()=>{
  const state=freshState();state.chapter=2;state.evidence=chapters[2].requiredEvidence;
  const answer=chapters[2].slots.map(s=>s.answer);answer[2]='7/3/1939';
  assert.deepEqual(checkAnswer(state,answer,'arrest').incorrect,[2]);
});
test('all three chapters can be solved and completion is idempotent',()=>{
  const state=freshState();
  for(const c of chapters){
    c.requiredEvidence.forEach(id=>collectEvidence(state,id));
    assert.equal(checkAnswer(state,c.slots.map(s=>s.answer),c.proof).ok,true);
    finishChapter(state);finishChapter(state);advanceChapter(state);
  }
  assert.equal(state.completed.length,3);assert.equal(advanceChapter(state),false);
});
test('malformed saves cannot create invalid chapter indexes or completion gaps',()=>{
  assert.equal(normalizeState({chapter:999,completed:['pressure'],evidence:[{},'unknown']}).chapter,0);
  assert.deepEqual(normalizeState({completed:['pressure']}).completed,[]);
  assert.deepEqual(loadState({getItem:()=>'{bad'}),freshState());
  assert.equal(saveState({setItem:()=>{throw Error('denied');}},freshState()),false);
});
