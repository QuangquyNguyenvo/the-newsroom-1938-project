import { evidenceLabels } from '../content/chapters.js';

const html = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const columnCopy = [
  ['Trang báo nối những vấn đề đời sống với hoạt động vận động quần chúng. Nội dung báo chí gắn với chủ trương đấu tranh vì dân sinh, dân chủ.', 'Các bài viết giải thích chủ trương của Đảng và đưa yêu cầu của nhân dân đến bạn đọc.', 'Trong phong trào dân chủ, báo chí là một phương tiện tuyên truyền và vận động đấu tranh công khai.'],
  ['Từ bản nháp đến số báo được xuất bản là hai mốc cần phân biệt khi đọc tư liệu.', 'Sưu tập tại Bảo tàng Lịch sử quốc gia lưu giữ những số báo Dân Chúng của thời kỳ này.', 'Vai trò của một tờ báo được xác định qua cơ quan đứng sau và nội dung mà tờ báo truyền đạt.'],
  ['Một biến cố tại tòa soạn và thời điểm kết thúc xuất bản cần được đối chiếu riêng.', 'Số thứ tự của báo là một dấu vết để theo dõi quá trình xuất bản.', 'Đọc nối tiếp các số báo giúp kiểm tra một kết luận về thời điểm tờ báo ngừng hoạt động.'],
];
const layouts = [
  ['Những điều người dân đang đòi hỏi', 'Yêu cầu đời sống', 'Nguyện vọng', 'Quyền dân chủ'],
  ['Một tiếng nói công khai của Đảng', 'Tên tờ báo', 'Mốc xuất bản đầu tiên', 'Vai trò của tờ báo'],
  ['Bàn biên tập bị bắt. Trang báo còn tiếp tục?', 'Ngày xảy ra vụ bắt giữ', 'Số báo cuối cùng', 'Ngày xuất bản số cuối'],
];

// Educational page, visually inspired by the user's reference. Never a facsimile.
export function newspaperMarkup(chapter) {
  const layout = layouts[Number(chapter.number)-1];
  return `<section class="newspaper" aria-label="Trang báo đang biên tập">
    <div class="paper-meta"><span>HỒ SƠ PHONG TRÀO DÂN CHỦ<br>Dân sinh · Dân chủ</span><span>1938 · 1939</span></div>
    <div class="paper-name">DÂN-CHÚNG</div><div class="paper-motto">Tiếng nói trên trang giấy</div>
    <div class="paper-deck">BÁO CHÍ CÁCH MẠNG VÀ TIẾNG NÓI CỦA NHÂN DÂN</div>
    <div class="paper-issue"><span>BẢN TIN HỌC TẬP ${chapter.number}</span><span>SÀI GÒN</span></div>
    <h3 class="paper-headline">${layout[0]}</h3>
    <div class="paper-columns">
      ${chapter.slots.map((slot,i)=>`<article class="paper-column"><h4>${layout[i+1]}</h4><button type="button" class="word-slot" id="slot-${i}" data-slot="${i}" aria-label="Đặt chữ: ${html(slot.label)}"><span class="slot-number">GHÉP CHỮ VÀO DÒNG NÀY</span><span class="slot-text">··················</span></button><p>${html(i===0?chapter.intro:i===1?chapter.summary:'Đối chiếu ngày ra số đầu, tổ chức đứng sau và ngày ra số cuối. Một mốc đúng cần có bằng chứng hỗ trợ.')}</p><p>${html(columnCopy[Number(chapter.number)-1][i])}</p>${i===1?'<figure class="archive-figure"><img src="/assets/references/dan-chung.jpg" alt="Các số báo Dân Chúng"><figcaption>Các số báo Dân Chúng</figcaption></figure>':''}</article>`).join('')}
    </div><div class="paper-bottom">SÀI GÒN · DÂN SINH · DÂN CHỦ</div>
  </section>`;
}

export function mountNewspaper(container, chapter, state, { submit, hint, compare }) {
  const selections = chapter.slots.map(()=>''), choices = [...new Set(chapter.slots.flatMap(s=>s.choices))];
  // Fixed interleaving prevents each answer appearing beside its matching slot.
  const shuffled = choices.filter((_,i)=>i%2).reverse().concat(choices.filter((_,i)=>!(i%2)));
  let selected = '', proof = '';
  container.innerHTML = `<div class="editor-switch"><div class="editor-tabs" role="group" aria-label="Chế độ biên tập"><button type="button" data-view="paper" aria-pressed="true">Trang báo</button><button type="button" data-view="tray" aria-pressed="false">Khay chữ & tư liệu</button></div><p id="held-word" role="status">Chọn chữ trong khay rồi đặt lên báo.</p></div><div class="editor-workspace" data-view="paper">${newspaperMarkup(chapter)}
    <aside class="type-case"><span class="eyebrow">KHAY CHỮ RỜI</span><p class="small">Chọn một mảnh chữ rồi bấm vào chỗ trống trên báo. Có thể kéo thả. Bấm chữ đã đặt để lấy lại.</p>
    <div class="word-tray">${shuffled.map((word,i)=>`<button type="button" draggable="true" class="word-piece" data-word="${i}" aria-pressed="false">${html(word)}</button>`).join('')}</div>
    <span class="eyebrow proof-heading">GHIM TƯ LIỆU CHỨNG MINH</span><div class="evidence-tray">${state.evidence.length?state.evidence.map(id=>`<button type="button" class="evidence-card" data-proof="${id}" aria-pressed="false">${html(evidenceLabels[id])}</button>`).join(''):'<p class="small">Chưa có tư liệu. Tìm ghi chú trong phòng rồi ghi vào sổ tay.</p>'}</div>
    <p id="assembly-count" class="small">0/3 vị trí đã ghép</p></aside></div>
    <p id="feedback" role="status" class="feedback">Trang báo còn thiếu chữ. Bạn sẽ đặt điều gì vào đây?</p>
    <div class="actions"><button id="print-button">Đối chiếu & in báo</button><button id="hint-button" class="secondary">Gợi ý</button><button id="compare-button" class="secondary">Đối chiếu sổ tay</button></div><div id="inline-notes"></div>`;
  const pieces = [...container.querySelectorAll('[data-word]')];
  const slots = [...container.querySelectorAll('[data-slot]')];
  const compact=matchMedia('(max-width: 900px)');
  const switchView = view => {
    container.querySelector('.editor-workspace').dataset.view=view;
    container.querySelectorAll('.editor-tabs button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
    if(compact.matches)container.closest('dialog').scrollTop=0;
  };
  container.querySelectorAll('.editor-tabs button').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
  const sync = () => {
    pieces.forEach(b=>{const word=shuffled[Number(b.dataset.word)]; b.setAttribute('aria-pressed',String(word===selected)); b.disabled=selections.includes(word);});
    container.querySelector('#assembly-count').textContent=`${selections.filter(Boolean).length}/3 vị trí đã ghép`;
    container.querySelector('#held-word').textContent=selected?`Đang cầm: ${selected}`:selections.every(Boolean)?'Chữ đã đủ. Mở khay để ghim tư liệu.':`${selections.filter(Boolean).length}/3 vị trí đã ghép. Chọn chữ trong khay để tiếp tục.`;
  };
  const place = (i, word) => {
    if (!word || selections.includes(word)) return;
    selections[i]=word; selected='';
    slots[i].querySelector('.slot-text').textContent=word;
    slots[i].classList.add('filled'); slots[i].removeAttribute('aria-invalid');
    slots[i].animate([{transform:'translateY(-8px)',opacity:.4},{transform:'translateY(0)',opacity:1}], {duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:260});
    sync();
    container.querySelector('#feedback').textContent=selections.every(Boolean)?'Chữ đã đủ. Ghim bằng chứng rồi đối chiếu bản in.':`Đã đặt “${word}”. Tiếp tục ghép những vị trí còn thiếu.`;
  };
  pieces.forEach(b=>{
    b.addEventListener('click',()=>{selected=shuffled[Number(b.dataset.word)]; sync(); container.querySelector('#feedback').textContent=`Đã chọn “${selected}”. Đặt vào vị trí phù hợp trên báo.`;if(compact.matches){switchView('paper');const destination=slots.find((_,i)=>!selections[i])||slots[0];destination.scrollIntoView({block:'center'});destination.focus({preventScroll:true});}});
    b.addEventListener('dragstart',event=>{event.dataTransfer.setData('text/plain',shuffled[Number(b.dataset.word)]); event.dataTransfer.effectAllowed='move';});
  });
  slots.forEach((b,i)=>{
    b.addEventListener('click',()=>{if(selected)place(i,selected);else if(selections[i]){selections[i]='';b.classList.remove('filled');b.querySelector('.slot-text').textContent='Chỗ chữ còn thiếu';sync();}});
    b.addEventListener('dragover',e=>{e.preventDefault();b.classList.add('drop-target');});
    b.addEventListener('dragleave',()=>b.classList.remove('drop-target'));
    b.addEventListener('drop',e=>{e.preventDefault();b.classList.remove('drop-target');const word=e.dataTransfer.getData('text/plain');if(choices.includes(word))place(i,word);});
  });
  container.querySelectorAll('[data-proof]').forEach(b=>b.addEventListener('click',()=>{
    proof=b.dataset.proof;
    container.querySelectorAll('[data-proof]').forEach(card=>card.setAttribute('aria-pressed',String(card===b)));
  }));
  container.querySelector('#hint-button').addEventListener('click',hint);
  container.querySelector('#compare-button').addEventListener('click',compare);
  container.querySelector('#print-button').addEventListener('click',()=>submit(selections,proof));
}
