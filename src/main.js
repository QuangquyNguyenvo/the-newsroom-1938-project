import './fonts.css';
import { mountNewspaper } from './game/newspaper.js';
import './styles.css';
import './editor.css';
import './archival-ui.css';
import './responsive.css';
import './period-redesign.css';
import { createSound } from './ui/sound.js';
import { createMotion } from './ui/motion.js';
import { chapters, objects, evidenceLabels, sources } from './content/chapters.js';
import { loadState, saveState, collectEvidence, checkAnswer, finishChapter, advanceChapter, freshState } from './game/state.js';
import { createEngine } from './scene/engine.js';
import { stations } from './scene/room.jsx';
import { roomProps } from './content/room-props.js';

await Promise.all([document.fonts.load('700 32px "Noto Serif"', 'Những tiếng nói đời thường'), document.fonts.load('400 16px "Be Vietnam Pro"', 'Đối chiếu sổ tay')]);
const root = document.querySelector('#app');
root.innerHTML = `
  <main class="game-shell">
    <div id="viewport" aria-label="Phòng biên tập 3D"></div>
    <header class="masthead"><div><span class="eyebrow">MỘT TRÒ CHƠI LỊCH SỬ ĐẢNG</span><h1>GIỮ TIẾNG NÓI<span class="edition">1938 / 1939</span></h1></div><button id="sound-button" class="light-button" aria-label="Bật tắt âm thanh" aria-pressed="true">Âm thanh</button><button id="notebook-button" class="light-button" aria-label="Sổ tay đối chiếu"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 6h10v21H5zM15 6h12v21H15M9 11h3M9 16h3M19 11h4M19 16h4"/></svg><span id="clue-count">0</span></button></header>
    <aside class="mission"><span id="chapter-number" class="eyebrow"></span><h2 id="chapter-title"></h2><button id="mission-toggle" aria-expanded="false" aria-controls="chapter-intro">Chi tiết</button><p id="chapter-intro"></p><button id="edit-button">Biên tập bản tin</button><p id="progress" class="small"></p></aside>
    <div id="hover-label" class="hover-label" aria-hidden="true"></div>
    <div class="thought" role="status" aria-live="polite"><span class="eyebrow">SUY NGHĨ</span><p id="thought-text">Có một bản tin còn thiếu. Mình sẽ tìm tư liệu trước khi đưa nó lên trang báo.</p></div>
    <footer class="navigation"><nav id="station-buttons" aria-label="Vị trí trong phòng"></nav><button id="objects-button" class="light-button">Khám phá đồ vật</button><span class="controls-note">Kéo để nhìn quanh · Bấm đồ vật để xem · Esc để đóng</span></footer>
    <dialog id="panel" aria-labelledby="panel-title"><div class="dialog-head"><span class="eyebrow" id="panel-kicker"></span><button id="close-panel" aria-label="Quay lại phòng"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M18 7 8 16l10 9M9 16h17"/></svg></button></div><h2 id="panel-title"></h2><div id="panel-body"></div></dialog>
    <dialog id="intro" aria-labelledby="intro-title"><span class="eyebrow">MÔ PHỎNG LỊCH SỬ</span><h2 id="intro-title">Một trang báo.<br>Nhiều tiếng nói.</h2><p>Khám phá phòng biên tập, xem cả hai mặt tài liệu và đối chiếu manh mối để hoàn thành ba bản tin.</p><p class="small">Đây là trò chơi mô phỏng phục vụ học tập. Căn phòng, đồ vật, lời dẫn và câu đố được thiết kế lại; không phải bản phục dựng nguyên trạng tòa soạn năm 1938. Tiêu đề trong game không phải tiêu đề báo gốc. Ảnh ngoài cửa sổ là Sài Gòn năm 1930, dùng gợi bối cảnh. Các sự kiện lịch sử có liên kết nguồn để đối chiếu.</p><button id="start-button">Bước vào phòng</button></dialog>
  </main>`;

let state;
try { state = loadState(localStorage); } catch { state = freshState(); }
let station = 'desk', engine, returnFocus;
const panel = document.querySelector('#panel');
const el = id => document.getElementById(id);
const motion = createMotion(root);
const sound=createSound(root);
const syncSound=()=>{el('sound-button').setAttribute('aria-pressed',String(!sound.muted));el('sound-button').innerHTML=`<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 12h5l7-6v20l-7-6H5z"/>${sound.muted?'<path d="m22 12 7 8m0-8-7 8"/>':'<path d="M22 11q7 5 0 10M25 6q13 10 0 20"/>'}</svg>`;};syncSound();
el('sound-button').addEventListener('click',()=>{sound.toggle();syncSound();});
root.addEventListener('click',event=>{const button=event.target.closest('button');if(!button||['sound-button','close-panel','print-button','start-button'].includes(button.id)||button.hasAttribute('data-page'))return;sound.play(button.dataset.page?'page':button.dataset.word||button.dataset.slot?'place':'click');});
el('mission-toggle').addEventListener('click',()=>{const expanded=el('mission-toggle').getAttribute('aria-expanded')!=='true';el('mission-toggle').setAttribute('aria-expanded',String(expanded));root.querySelector('.mission').classList.toggle('expanded',expanded);});
let popupFrame=0, lastChapter;
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
function remember() {
  try { if (!saveState(localStorage, state)) think('Tiến độ được giữ trong phiên này. Trình duyệt hiện không cho lưu lâu dài.'); }
  catch { think('Tiến độ được giữ trong phiên này.'); }
  refreshHUD();
}
let thoughtTimer,thoughtTypeTimer;
function think(text){
  clearTimeout(thoughtTimer);clearTimeout(thoughtTypeTimer);const thought=root.querySelector('.thought');thought.hidden=!text;thought.setAttribute('aria-busy','false');if(!text)return;
  const glyphs=Array.from(text);let index=0;el('thought-text').textContent='';thought.setAttribute('aria-busy','true');
  function write(){index++;el('thought-text').textContent=glyphs.slice(0,index).join('');if(glyphs[index-1].trim())sound.tick('type');if(index<glyphs.length)thoughtTypeTimer=setTimeout(write,28);else{thought.setAttribute('aria-busy','false');thoughtTimer=setTimeout(()=>{thought.hidden=true;},4000);}}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){el('thought-text').textContent=text;thought.setAttribute('aria-busy','false');thoughtTimer=setTimeout(()=>{thought.hidden=true;},5500);}else write();
}
function activateProp(id){
  const prop=roomProps.find(item=>item.id===id);if(!prop)return false;
  const active=engine?.interact(id);sound.play(prop.sound);think(prop.thought[active?0:1]||prop.thought[0]);return true;
}
function sourceLink(key) {
  const source=sources[key];
  return source ? `<details class="source"><summary>Nguồn tư liệu</summary><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)}</a></details>` : '';
}
function openPanel(title, kicker, html) {
  cancelAnimationFrame(popupFrame);
  panel.querySelector(':scope > .panel-actions')?.remove();
  panel.classList.remove('editor-panel');
  delete panel.dataset.item;delete panel.dataset.kind;
  engine?.setPaused(true);
  if (!panel.open) returnFocus=document.activeElement;
  el('panel-title').textContent=title; el('panel-kicker').textContent=kicker; el('panel-body').innerHTML=html;
  if (!panel.open) panel.showModal();
  el('close-panel').focus();
  panel.scrollTop=0;
  popupFrame=requestAnimationFrame(()=>{if(panel.open)motion.revealDialog(panel);});
}
function closePanel() { sound.play(panel.dataset.item==='drawer'?'drawerClose':panel.dataset.item?'paper':'close');cancelAnimationFrame(popupFrame); motion.closeDialog(panel); }
el('close-panel').addEventListener('click', closePanel);
panel.addEventListener('cancel',event=>{event.preventDefault();closePanel();});
panel.addEventListener('close', () => { panel.querySelector('video')?.pause(); engine?.returnFromInspection(); engine?.setPaused(false); returnFocus?.focus(); });
panel.addEventListener('click', event => { if (event.target===panel) { const r=panel.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) closePanel(); } });

function refreshHUD() {
  const chapter=chapters[state.chapter];
  el('chapter-number').innerHTML=`<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 5h20v22H6zM10 10h12M10 15h5v7h-5zM19 15h3M19 19h3M19 23h3"/></svg><span>${chapter.number} / 03</span>`;
  el('chapter-title').textContent=chapter.title; el('chapter-intro').textContent=chapter.intro;
  el('progress').textContent=`${state.completed.length}/3 bản tin đã hoàn thành`;
  el('clue-count').textContent=state.evidence.length;
  el('edit-button').textContent=state.completed.length===chapters.length ? 'Xem trang báo' : 'Biên tập bản tin';
  if(lastChapter!==chapter.id){motion.ink(el('chapter-title'));lastChapter=chapter.id;}
}
function inspect(id, pageIndex=0) {
  const object=objects.find(item=>item.id===id); if(!object)return;
  think('');
  openPanel(object.label,'TƯ LIỆU',`<div class="reader-stage" tabindex="0" aria-label="Tài liệu, dùng phím trái phải hoặc vuốt để lật"><div class="page-bed" aria-hidden="true"></div><article class="document"></article></div><div class="reader-nav"><button data-page="previous" aria-label="Lật về trước">‹</button><span class="reader-count" aria-live="polite"></span><button data-page="next" aria-label="Lật tiếp">›</button></div><div class="reader-record"></div>`);
  panel.dataset.item=id;panel.dataset.kind=id==='notebook'?'notebook':object.kind;
  const stage=panel.querySelector('.reader-stage'),article=stage.querySelector('article');
  const nav=panel.querySelector('.reader-nav');let busy=false,start;
  function draw(){
    const page=object.pages[pageIndex];
    const selected=new Set();stage.scrollTop=0;article.innerHTML=`${id==='photo'&&pageIndex===0?`<img class="reference-photo" src="${import.meta.env.BASE_URL}assets/references/dan-chung.jpg" alt="Ảnh sưu tập các tờ báo Dân Chúng">`: ''}<h3>${escape(page.title)}</h3><p>${escape(page.text)}</p>${sourceLink(page.source)}`;
    if(id==='letter'&&page.evidence){const paragraph=article.querySelector('p');paragraph.innerHTML=escape(page.text).replace(/cơm áo|hòa bình|dân chủ/gi,word=>`<button class="ink-word" data-term="${word}" aria-pressed="false">${word}</button>`);paragraph.querySelectorAll('[data-term]').forEach(button=>button.addEventListener('click',()=>{selected.add(button.dataset.term);button.setAttribute('aria-pressed','true');sound.play('paper');if(selected.size===3){collectEvidence(state,page.evidence);remember();panel.querySelector('.reader-record').textContent='✓ Đã khoanh đủ ba yêu cầu';}}));}
    el('panel-kicker').textContent=`TƯ LIỆU · ${pageIndex+1}/${object.pages.length}`;
    panel.querySelector('.reader-count').textContent=object.pages.length>1?`${pageIndex+1} / ${object.pages.length} · Vuốt để lật`:'';
    nav.hidden=object.pages.length<2;
    nav.querySelector('[data-page="previous"]').disabled=pageIndex===0;
    nav.querySelector('[data-page="next"]').disabled=pageIndex===object.pages.length-1;
    const actions={notebook:'Đánh dấu ngày xuất bản',archive:'Ghim hồ sơ tổ chức',photo:'Lưu mốc biến cố',drawer:'Lưu ngày ra số cuối'};
    panel.querySelector('.reader-record').innerHTML=id==='proof'?'<button id="compare-proof">Đối chiếu bản in</button>':id==='letter'&&page.evidence?`${state.evidence.includes(page.evidence)?'✓ Đã khoanh ba yêu cầu':'Chạm vào ba yêu cầu trong ghi chú để khoanh lại.'}`:page.evidence?`<button id="collect-button">${state.evidence.includes(page.evidence)?'✓ Đã ghi vào sổ tay':actions[id]||'Ghi vào sổ tay'}</button>`:'';
    el('compare-proof')?.addEventListener('click',editChapter);
    el('collect-button')?.addEventListener('click',()=>{collectEvidence(state,page.evidence);remember();el('collect-button').textContent='✓ Đã ghi vào sổ tay';motion.ink(el('collect-button'));think('Ghi lại rồi. Lát nữa mình sẽ đối chiếu với bản in.');});
  }
  function turn(direction){
    const next=pageIndex+direction;if(busy||next<0||next>=object.pages.length)return;
    busy=true;sound.play('page');
    motion.turnPage(article,()=>{if(panel.open&&panel.dataset.item===id){pageIndex=next;draw();}},direction,()=>{busy=false;});
  }
  nav.querySelector('[data-page="previous"]').addEventListener('click',()=>turn(-1));
  nav.querySelector('[data-page="next"]').addEventListener('click',()=>turn(1));
  stage.addEventListener('pointerdown',event=>{if(!event.target.closest('a,button'))start={x:event.clientX,y:event.clientY};});
  stage.addEventListener('pointerup',event=>{if(!start)return;const dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)turn(dx<0?1:-1);});
  stage.addEventListener('pointercancel',()=>{start=null;});
  stage.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();turn(event.key==='ArrowRight'?1:-1);}});
  draw();sound.play(id==='drawer'?'drawer':object.kind==='photo'?'photo':object.kind==='book'?'book':'paper');
}
function showObjects() {
  const visible=[...objects,...roomProps].filter(object=>object.station===station);
  openPanel('Quan sát gần hơn',stations[station].label,`<p>Các đồ vật tại vị trí này. Bạn cũng có thể bấm trực tiếp vào chúng trong phòng.</p><div class="object-list">${visible.map(object=>`<button data-object="${object.id}">${escape(object.label)}</button>`).join('')}</div>`);
  panel.querySelectorAll('[data-object]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.object;closePanel();panel.addEventListener('close',()=>engine?.focusObject(id),{once:true});}));
}
function showNotebook() {
  const entries=objects.flatMap(object=>object.pages.filter(page=>page.evidence&&state.evidence.includes(page.evidence)).map(page=>({object,page})));
  openPanel('Sổ tay đối chiếu','NHỮNG GÌ BẠN ĐÃ TÌM THẤY',entries.length ? entries.map(({object,page})=>`<article class="note"><span class="eyebrow">${escape(object.label)}</span><h3>${escape(evidenceLabels[page.evidence])}</h3><p>${escape(page.text)}</p>${sourceLink(page.source)}</article>`).join('') : '<p>Chưa có ghi chép. Mở đồ vật, xem các trang hoặc mặt sau, rồi bấm ghi thông tin vào sổ tay.</p>');
}
function editChapter() {
  if(state.completed.length===chapters.length){showFinal();return;}
  const chapter=chapters[state.chapter];
  if(state.completed.includes(chapter.id)){showCompletion();return;}
  openPanel(chapter.title,'BÀN BIÊN TẬP','');
  panel.classList.add('editor-panel');
  mountNewspaper(el('panel-body'),chapter,state,{
    hint:()=>{el('feedback').textContent=chapter.hints[Math.min(state.hint++,chapter.hints.length-1)];motion.ink(el('feedback'));},
    compare:()=>{
      el('inline-notes').innerHTML=state.evidence.length ? objects.flatMap(object=>object.pages.filter(page=>state.evidence.includes(page.evidence)).map(page=>`<article class="note"><h3>${escape(evidenceLabels[page.evidence])}</h3><p>${escape(page.text)}</p>${sourceLink(page.source)}</article>`)).join('') : '<p>Chưa có tư liệu. Hãy tìm trong phòng trước.</p>';
      motion.ink(el('inline-notes'));
    },
    submit:(selections,proof)=>{
      const result=checkAnswer(state,selections,proof);
      panel.querySelectorAll('[aria-invalid]').forEach(b=>b.removeAttribute('aria-invalid'));
      if(!result.ok){sound.play('error');
        if(result.reason==='missing')el('feedback').textContent=`Cần tìm thêm: ${result.missing.map(id=>evidenceLabels[id]).join('; ')}.`;
        if(result.reason==='slots'){result.incorrect.forEach(i=>el(`slot-${i}`).setAttribute('aria-invalid','true'));el('feedback').textContent=`Xem lại: ${result.incorrect.map(i=>chapter.slots[i].label).join(', ')}. Những phần còn lại đã được giữ.`;}
        if(result.reason==='proof')el('feedback').textContent='Bằng chứng chính chưa hỗ trợ đúng bản tin. Đối chiếu ghi chép một lần nữa.';
        if(!matchMedia('(prefers-reduced-motion: reduce)').matches)panel.querySelector('.newspaper').animate([{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:220});
        return;
      }
      sound.play('press');sound.play('success');finishChapter(state);remember();
      el('print-button').disabled=true;
      panel.querySelector('.newspaper').classList.add('printing');
      el('feedback').textContent='Mực đã lên trang. Bản tin được đối chiếu!';
      think('Bản in đã đúng. Giờ xem câu chuyện phía sau trang báo.');
      // Animation cannot trap navigation or progress: closing/reopening remains safe.
      const page=state.chapter;
      setTimeout(()=>{if(panel.open && state.chapter===page && el('print-button'))showCompletion();},matchMedia('(prefers-reduced-motion: reduce)').matches?0:950);
    }
  });
  const actions=el('panel-body').querySelector('.actions');actions.classList.add('panel-actions');panel.append(actions);
}

function showCompletion() {
  const chapter=chapters[state.chapter];
  openPanel('Bản tin đã hoàn thành',`BẢN TIN ${chapter.number}`,`<div class="story-frame"><figure class="story-image"><img src="/assets/references/dan-chung.jpg" alt="Các số báo Dân Chúng"><figcaption>Hình tham khảo người dùng cung cấp</figcaption></figure><span class="stamp">ĐÃ ĐỐI CHIẾU</span><h3>${escape(chapter.title)}</h3><p>${escape(chapter.summary)}</p><button id="watch-button">Mở câu chuyện</button></div>`);
  el('watch-button').addEventListener('click',()=>{
    openPanel(chapter.title,'CÂU CHUYỆN PHÍA SAU BẢN TIN',`${chapter.video ? `<video controls playsinline preload="metadata" ${chapter.poster?`poster="${escape(chapter.poster)}"`:''}><source src="${escape(chapter.video)}" type="video/mp4"></video><p id="video-status" role="status"></p>` : '<div class="video-placeholder"><span class="eyebrow">CHỜ VIDEO TƯ LIỆU</span><p>Màn mẫu đang dùng phần tổng kết. Video thật sẽ được thêm vào bản tin này.</p></div>'}<p>${escape(chapter.summary)}</p>${sourceLink(chapter.source)}<button id="next-button">${state.chapter===chapters.length-1?'Xuất bản trang báo':'Trở về phòng, mở bản tin tiếp theo'}</button>`);
    panel.querySelector('video')?.addEventListener('error',()=>{el('video-status').textContent='Video chưa tải được. Bạn vẫn có thể đọc phần tổng kết và tiếp tục.';});
    el('next-button').addEventListener('click',()=>{if(advanceChapter(state)){remember();closePanel();think(chapters[state.chapter].intro);}else showFinal();});
  });
}
function showFinal() {
  openPanel('Giữ tiếng nói','TRANG BÁO HỌC TẬP ĐÃ HOÀN THÀNH',`<div class="final-page"><div class="paper-name">DÂN-CHÚNG</div><div class="paper-issue">HỒ SƠ HỌC TẬP · PHỤC DỰNG TƯƠNG TÁC</div>${chapters.map(chapter=>`<article><span class="eyebrow">${chapter.number}</span><h4>${escape(chapter.title)}</h4><p>${escape(chapter.summary)}</p></article>`).join('')}</div>${sourceLink('museum')}<button id="restart-button" class="secondary">Chơi lại từ đầu</button>`);
  el('restart-button').addEventListener('click',()=>{state=freshState();remember();closePanel();moveTo('desk');think('Mình bắt đầu một trang báo mới.');});
}
function moveTo(id) { station=id; engine?.goTo(id); el('station-buttons').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.station===id))); }
el('station-buttons').innerHTML=Object.entries(stations).map(([id,view],i)=>`<button data-station="${id}" aria-pressed="${id===station}"><span>${i+1}</span> ${view.label}</button>`).join('');
el('station-buttons').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>moveTo(button.dataset.station)));
el('notebook-button').addEventListener('click',showNotebook);el('objects-button').addEventListener('click',showObjects);el('edit-button').addEventListener('click',editChapter);
try {
  engine=await createEngine(el('viewport'),id=>{if(activateProp(id))return;id==='board'?editChapter():inspect(id);},id=>{
    el('hover-label').textContent=id==='board'?'Biên tập bản tin':[...objects,...roomProps].find(object=>object.id===id)?.label||'';
    engine.canvas.style.cursor=id?'pointer':'grab';
  });
} catch(error) {
  el('viewport').innerHTML='<div class="webgl-fallback"><h2>Trình duyệt chưa mở được cảnh 3D</h2><p>Bạn vẫn có thể đổi vị trí, mở danh sách đồ vật và chơi các bản tin bằng các nút trên màn hình.</p></div>';
  console.error('Không khởi tạo được WebGL:',error);
}
const handleKey = event=>{
  if(panel.open||el('intro').open||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return;
  const id=Object.keys(stations)[Number(event.key)-1];if(id)moveTo(id);
};
document.addEventListener('keydown',handleKey);
let entering=false,entryDisposed=false;
refreshHUD();think('');el('intro').showModal();engine?.setPaused(true);motion.revealDialog(el('intro'));
async function enterRoom(){
  if(entering)return;entering=true;el('start-button').disabled=true;el('intro').classList.add('entering');
  el('intro').insertAdjacentHTML('beforeend','<p class="entry-caption" role="status">Bước vào phòng biên tập…<small>Esc để bỏ qua</small></p>');
  await sound.play('door',{wait:true,onDuration:duration=>engine?.beginEntrance(duration)});
  if(!entryDisposed){engine?.finishEntrance();motion.closeDialog(el('intro'));}
}
el('start-button').addEventListener('click',enterRoom);
el('intro').addEventListener('cancel',event=>{event.preventDefault();if(entering){sound.stop('door');engine?.finishEntrance();motion.closeDialog(el('intro'));}else enterRoom();});
el('intro').addEventListener('close',()=>{engine?.setPaused(false);motion.start();think(state.completed.length===chapters.length?'Trang báo đã hoàn thành. Mình có thể đọc lại từng bản tin.':chapters[state.chapter].intro);});
if(import.meta.hot)import.meta.hot.dispose(()=>{entryDisposed=true;cancelAnimationFrame(popupFrame);clearTimeout(thoughtTimer);clearTimeout(thoughtTypeTimer);sound.dispose();motion.dispose();engine?.dispose();document.removeEventListener('keydown',handleKey);});
