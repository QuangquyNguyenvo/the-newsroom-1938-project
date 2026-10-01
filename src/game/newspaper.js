import { evidenceLabels, sources, objects } from '../content/chapters.js';
import { editorial } from '../content/editorial.js';
import { editorialReview } from '../content/editorial-review.js';

const html = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const kickers = ['DÂN SINH · DÂN CHỦ', 'TIẾNG NÓI CỦA ĐẢNG', 'TÒA SOẠN BỊ KHÁM XÉT'];

// Educational broadsheet in the typographic manner of late-1930s Saigon papers. Never a facsimile.
export function newspaperMarkup(chapter) {
  const index = Number(chapter.number) - 1,
    copy = editorial[chapter.id];
  return `<section class="newspaper broadsheet" aria-label="Trang báo đang biên tập">
    <header class="paper-top">
      <div class="paper-ear"><b>BẢN TIN HỌC TẬP</b><span>Số ${chapter.number}</span></div>
      <div class="paper-title"><div class="paper-name">DÂN-CHÚNG</div><div class="paper-motto">Phục dựng giáo dục · Sài Gòn 1938–1939</div></div>
      <figure class="paper-ear paper-archive"><img src="/assets/references/dan-chung.jpg" alt="Ảnh tham khảo các số báo Dân Chúng"><figcaption>Ảnh sưu tập báo</figcaption></figure>
    </header>
    <div class="paper-issue"><span>Mặt trận Dân chủ Đông Dương</span><span>✦</span><span>Dân sinh · Dân chủ · Hòa bình</span></div>
    <div class="paper-kicker">${kickers[index]}</div>
    <h3 class="paper-headline">${html(copy.headline)}</h3>
    <p class="paper-lead">${html(copy.lead)}</p>
    <p class="paper-reader-line">Tình huống của ${html(chapter.letter.name)} · Nhân vật hư cấu</p>
    <div class="paper-column-nav" role="group" aria-label="Cột đang biên tập">${chapter.slots.map((_, i) => `<button type="button" data-column="${i}" aria-pressed="false">Cột ${i + 1}</button>`).join('')}</div>
    <div class="paper-columns">
      ${chapter.slots
        .map((slot, i) => {
          const column = copy.columns[i];
          return `<article class="paper-column"><h4>${html(column.heading)}</h4><p class="column-scene" data-column-copy="${i}">${html(column.scene)}</p><div class="column-sentence"><span class="sentence-prefix">${html(column.before)}</span><button type="button" class="word-slot" id="slot-${i}" data-slot="${i}" aria-pressed="false" aria-label="Chọn cột: ${html(slot.label)}"><span class="slot-number">BIÊN TẬP CỘT ${i + 1}</span><span class="slot-text">··········</span><span class="slot-result" aria-live="polite"></span></button><span class="sentence-tail">${html(column.after)}</span></div><button type="button" class="clear-slot" data-clear="${i}" aria-label="Gỡ chữ cột ${i + 1}" hidden>Sửa chữ</button></article>`;
        })
        .join('')}
    </div><div class="paper-bottom"><span>Bài viết phục dựng học tập, không phải bài báo gốc</span><button type="button" id="context-button">Đọc câu chuyện & nguồn ↗</button></div>
  </section>`;
}

export function mountNewspaper(
  container,
  chapter,
  state,
  { submit, hint, compare, draft, onChange },
) {
  const choices = [...new Set(chapter.slots.flatMap((s) => s.choices))],
    used = new Set();
  const selections = chapter.slots.map((_, i) => {
    const word = draft?.selections?.[i];
    if (!choices.includes(word) || used.has(word)) return '';
    used.add(word);
    return word;
  });
  // Fixed interleaving prevents each answer appearing beside its matching slot.
  const shuffled = choices
    .filter((_, i) => i % 2)
    .reverse()
    .concat(choices.filter((_, i) => !(i % 2)));
  const copy = editorial[chapter.id];
  const reviewTasks = editorialReview[chapter.id],
    reviews = {};
  for (const task of reviewTasks) {
    const value = draft?.reviews?.[task.id];
    if (Number.isInteger(value) && value >= 0 && value < task.choices.length)
      reviews[task.id] = value;
  }
  let activeSlot = Math.max(
      0,
      selections.findIndex((word) => !word),
    ),
    proof = state.evidence.includes(draft?.proof) ? draft.proof : '';
  container.innerHTML = `<div class="editor-switch"><div class="editor-tabs" role="group" aria-label="Bước biên tập"><button type="button" data-view="paper" aria-pressed="true">1. Biên tập <span id="assembly-count"></span></button><button type="button" data-view="proof" aria-pressed="false">2. Kiểm chứng <span id="proof-count"></span></button></div><p id="held-word" role="status"></p></div><div class="editor-workspace" data-view="paper">${newspaperMarkup(chapter)}
    <aside class="type-case"><span class="eyebrow" id="column-heading"></span><p class="small" id="column-question"></p>
    <div class="word-tray">${shuffled.map((word, i) => `<button type="button" draggable="true" class="word-piece ${word.length > 30 ? 'long-piece' : ''}" data-word="${i}">${html(word)}</button>`).join('')}</div><section id="editorial-insight" aria-live="polite"></section><button type="button" id="next-column" hidden></button><button type="button" class="secondary editorial-review-open" id="review-button">Đọc thử bản thảo <span>Đối chiếu mở rộng · tự chọn</span></button></aside>
    <section class="proof-section" aria-labelledby="proof-title"><div class="proof-intro"><h3 id="proof-title">Chọn một tư liệu chứng minh</h3><p id="proof-question">${html(copy.proofQuestion)}</p></div><div class="evidence-tray" role="radiogroup" aria-labelledby="proof-title" aria-describedby="proof-question">${state.evidence.length ? state.evidence.map((id) => `<label class="evidence-card"><input type="radio" name="newspaper-proof" data-proof="${html(id)}" value="${html(id)}"><span>${html(evidenceLabels[id])}</span><b class="proof-check" aria-hidden="true">✓</b></label>`).join('') : '<p class="proof-empty">Chưa có ghi chép. Trở về phòng, mở tư liệu và ghi vào sổ tay.</p>'}</div><div class="proof-status"><p class="proof-pin" aria-live="polite"></p><button type="button" class="clear-proof" hidden>Gỡ lựa chọn</button></div></section>
    <section id="inline-notes" class="editor-notes" aria-label="Đọc tư liệu" hidden></section></div>
    <div class="actions"><p id="feedback" role="status" class="feedback">Đọc câu chuyện trong cột báo, rồi chọn ý để hoàn thành câu.</p><div class="editor-action-buttons"><button id="print-button">Đối chiếu & in báo</button><button id="hint-button" class="secondary">Gợi ý</button><button id="compare-button" class="secondary">Mở sổ tay</button></div></div>`;
  const pieces = [...container.querySelectorAll('[data-word]')];
  const slots = [...container.querySelectorAll('[data-slot]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 740px)');
  const switchView = (view) => {
    container.querySelector('.editor-workspace').dataset.view = view;
    container
      .querySelectorAll('.editor-tabs button')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    if (compact.matches) container.scrollTop = 0;
    sync();
    if (!compact.matches)
      (view === 'proof' ? container.querySelector('[data-proof]') : slots[activeSlot])?.focus({
        preventScroll: true,
      });
  };
  container
    .querySelectorAll('.editor-tabs button')
    .forEach((b) => b.addEventListener('click', () => switchView(b.dataset.view)));
  const sync = () => {
    pieces.forEach((b) => {
      const word = shuffled[Number(b.dataset.word)];
      b.hidden = !chapter.slots[activeSlot].choices.includes(word);
      b.disabled = selections.includes(word);
      b.title = b.disabled
        ? 'Đã đặt trên báo'
        : `Đặt vào cột ${activeSlot + 1}: ${chapter.slots[activeSlot].label}`;
    });
    container.querySelector('#column-heading').textContent =
      `CỘT ${activeSlot + 1} · ${copy.columns[activeSlot].heading}`;
    container.querySelector('#column-question').textContent = copy.columns[activeSlot].question;
    slots.forEach((slot, i) => slot.setAttribute('aria-pressed', String(i === activeSlot)));
    container
      .querySelectorAll('[data-column]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(Number(button.dataset.column) === activeSlot)),
      );
    container.querySelector('#assembly-count').textContent =
      `${selections.filter(Boolean).length}/3`;
    container.querySelector('#proof-count').textContent = proof ? '✓' : '0/1';
    const correctCount = selections.reduce(
      (count, word, index) => count + (word === chapter.slots[index].answer ? 1 : 0),
      0,
    );
    container.querySelector('#held-word').textContent =
      container.querySelector('.editor-workspace').dataset.view === 'proof'
        ? 'Chọn ghi chép làm căn cứ cho bản tin. Bản thảo của bạn vẫn ở bên cạnh.'
        : correctCount === slots.length
          ? 'Ba cột đã thành bài. Đọc lại ý nghĩa, rồi kiểm chứng trước khi in.'
          : `Biên tập cột ${activeSlot + 1}. Chọn lời cho bản tin, không chỉ điền cho đủ ô.`;
    const column = copy.columns[activeSlot],
      word = selections[activeSlot],
      correct = word === chapter.slots[activeSlot].answer,
      source = sources[column.source];
    container.querySelector('#editorial-insight').dataset.status = word
      ? correct
        ? 'correct'
        : 'incorrect'
      : 'unfilled';
    container.querySelector('#editorial-insight').innerHTML = word
      ? `<span class="insight-label">${correct ? 'VÌ SAO DÒNG NÀY CÓ Ý NGHĨA' : 'ĐỌC LẠI Ý CỦA CỘT BÁO'}</span><p>${html(correct ? column.why : column.misread)}</p>${correct ? `<p class="reader-connection"><b>${html(chapter.letter.name)} · Hư cấu</b>${html(column.reader)}</p><a class="insight-source" href="${html(source.url)}" target="_blank" rel="noopener noreferrer">Đối chiếu tư liệu lịch sử ↗</a>` : ''}`
      : `<span class="insight-label">NGƯỜI ĐANG CHỜ BẢN TIN</span><p class="reader-connection"><b>${html(chapter.letter.name)} · Hư cấu</b>${html(column.scene)}</p><p class="insight-instruction">Bấm chữ để hoàn thành câu trên báo. Bấm cột khác để đổi mục đang biên tập.</p>`;
    const nextButton = container.querySelector('#next-column');
    nextButton.hidden = !correct;
    nextButton.textContent =
      correctCount === slots.length ? 'Kiểm chứng bản tin →' : 'Biên tập cột tiếp →';
    container
      .querySelector('.newspaper')
      .style.setProperty('--assembly', `${(correctCount / slots.length) * 100}%`);
    container.querySelector('.proof-pin').textContent = proof
      ? `Đã chọn: ${evidenceLabels[proof]}`
      : 'Chưa chọn tư liệu chứng minh.';
    container.querySelector('.proof-pin').classList.toggle('pinned', !!proof);
    container.querySelector('.clear-proof').hidden = !proof;
    container.querySelectorAll('[data-proof]').forEach((input) => {
      input.checked = input.dataset.proof === proof;
      input.closest('label').classList.toggle('selected', input.checked);
    });
    // Leave the authoritative answer check available for filled but incorrect drafts.
    container.closest('dialog').querySelector('#print-button').disabled =
      !selections.every(Boolean) || !proof;
    const preview = container.querySelector('.proof-preview');
    if (preview) {
      const object = objects.find((item) => item.pages.some((page) => page.evidence === proof)),
        page = object?.pages.find((page) => page.evidence === proof);
      const sourceKey = page?.source || object?.pages.find((page) => page.source)?.source;
      preview.hidden = !page;
      preview.innerHTML = page
        ? `<span class="eyebrow">NỘI DUNG GHI CHÉP ĐANG CHỌN</span><p>${html(page.text)}</p>${sourceKey ? `<a href="${html(sources[sourceKey].url)}" target="_blank" rel="noopener noreferrer">${html(sources[sourceKey].title)} ↗</a>` : ''}`
        : '';
    }
    onChange?.({ selections: [...selections], proof, reviews: { ...reviews } });
  };
  const drawSlot = (i) => {
    const word = selections[i],
      correct = word === chapter.slots[i].answer;
    slots[i].setAttribute(
      'aria-label',
      `Chọn cột ${i + 1}: ${chapter.slots[i].label}, ${word ? `${word}, ${correct ? 'đúng cột' : 'cần thử lại'}` : 'chưa đặt chữ'}`,
    );
    slots[i].querySelector('.slot-text').textContent = word || '··········';
    slots[i].classList.toggle('filled', !!word);
    slots[i].classList.toggle('correct', !!word && correct);
    slots[i].classList.toggle('incorrect', !!word && !correct);
    slots[i].removeAttribute('aria-invalid');
    slots[i].querySelector('.slot-result').textContent = word
      ? correct
        ? '✓ ĐÃ GHÉP Ý'
        : '↺ ĐỌC LẠI'
      : '';
    const paragraph = container.querySelector(`[data-column-copy="${i}"]`);
    paragraph.textContent = correct ? copy.columns[i].article : copy.columns[i].scene;
    paragraph.classList.toggle('published-copy', correct);
    container.querySelector(`[data-clear="${i}"]`).hidden = !word;
  };
  const flyWord = (i, word) => {
    if (reduced.matches) return;
    const source = pieces.find((button) => button.textContent === word),
      from = source?.getBoundingClientRect(),
      to = slots[i].getBoundingClientRect();
    if (!from || !source.checkVisibility() || from.width === 0) return;
    const token = document.createElement('span');
    token.className = 'flying-type';
    token.textContent = word;
    token.setAttribute('aria-hidden', 'true');
    // Kept in the native dialog top layer, with viewport-fixed coordinates.
    Object.assign(token.style, {
      left: `${from.left}px`,
      top: `${from.top}px`,
      width: `${from.width}px`,
    });
    container.closest('dialog').append(token);
    token
      .animate(
        [
          { transform: 'translate(0,0) rotate(-2deg)', opacity: 1 },
          {
            transform: `translate(${to.left - from.left + (to.width - from.width) / 2}px,${to.top - from.top}px) rotate(1deg)`,
            opacity: 0,
          },
        ],
        { duration: 460, easing: 'cubic-bezier(.2,.7,.2,1)' },
      )
      .finished.catch(() => {})
      .finally(() => token.remove());
  };
  const place = (i, word) => {
    if (!word || selections.includes(word)) return;
    flyWord(i, word);
    selections[i] = word;
    const correct = word === chapter.slots[i].answer;
    drawSlot(i);
    slots[i].animate(
      [
        { transform: 'translateY(-8px)', opacity: 0.4 },
        { transform: 'translateY(0)', opacity: 1 },
      ],
      { duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260 },
    );
    activeSlot = i;
    sync();
    const feedback = container.closest('dialog').querySelector('#feedback');
    if (!correct) feedback.textContent = copy.columns[i].misread;
    else
      feedback.textContent = `Cột ${i + 1} đã thành lời. Đọc “Vì sao dòng này có ý nghĩa” rồi chuyển sang mục tiếp theo.`;
  };
  pieces.forEach((b) => {
    b.addEventListener('click', () => place(activeSlot, shuffled[Number(b.dataset.word)]));
    b.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', shuffled[Number(b.dataset.word)]);
      event.dataTransfer.effectAllowed = 'move';
    });
  });
  slots.forEach((b, i) => {
    b.addEventListener('click', () => {
      activeSlot = i;
      sync();
      container.closest('dialog').querySelector('#feedback').textContent =
        `Cột ${i + 1}: ${chapter.slots[i].label}. Chọn chữ trong khay${selections[i] ? ' để thay chữ hiện tại' : ''}.`;
    });
    b.addEventListener('dragover', (e) => {
      e.preventDefault();
      b.classList.add('drop-target');
    });
    b.addEventListener('dragleave', () => b.classList.remove('drop-target'));
    b.addEventListener('drop', (e) => {
      e.preventDefault();
      b.classList.remove('drop-target');
      const word = e.dataTransfer.getData('text/plain');
      if (choices.includes(word)) place(i, word);
    });
  });
  container.querySelectorAll('[data-column]').forEach((button) =>
    button.addEventListener('click', () => {
      activeSlot = Number(button.dataset.column);
      sync();
    }),
  );
  container.querySelectorAll('[data-clear]').forEach((b) =>
    b.addEventListener('click', () => {
      const i = Number(b.dataset.clear);
      selections[i] = '';
      activeSlot = i;
      drawSlot(i);
      sync();
      container.closest('dialog').querySelector('#feedback').textContent =
        'Đã lấy chữ về khay. Đọc lại ý của câu trước khi sửa.';
    }),
  );
  container.querySelector('#next-column').addEventListener('click', () => {
    const next = selections.findIndex((value, index) => value !== chapter.slots[index].answer);
    if (next < 0) switchView('proof');
    else {
      activeSlot = next;
      sync();
      slots[next].focus({ preventScroll: true });
    }
  });
  container.querySelectorAll('[data-proof]').forEach((b) =>
    b.addEventListener('change', () => {
      proof = b.dataset.proof;
      container.querySelector('.proof-section').removeAttribute('aria-invalid');
      sync();
      container.closest('dialog').querySelector('#feedback').textContent =
        `Đã chọn “${evidenceLabels[proof]}”. Đối chiếu nội dung rồi in báo; có thể chọn tư liệu khác để thay.`;
    }),
  );
  container.querySelector('.clear-proof').addEventListener('click', () => {
    proof = '';
    container.querySelector('.proof-section').removeAttribute('aria-invalid');
    sync();
    container.closest('dialog').querySelector('#feedback').textContent =
      'Đã gỡ lựa chọn. Chọn một tư liệu khác để chứng minh bản tin.';
  });
  const notes = container.querySelector('#inline-notes'),
    workspace = container.querySelector('.editor-workspace');
  let notesReturn,
    notesScroll = 0;
  container
    .querySelector('.proof-status')
    .insertAdjacentHTML('beforebegin', '<section class="proof-preview" hidden></section>');
  const closeNotes = () => {
    notes.hidden = true;
    workspace.classList.remove('is-reading');
    workspace.scrollTop = notesScroll;
    notesReturn?.focus({ preventScroll: true });
  };
  const openNotes = (title, content) => {
    notesReturn = document.activeElement;
    notesScroll = workspace.scrollTop;
    workspace.scrollTop = 0;
    workspace.classList.add('is-reading');
    notes.innerHTML = `<header><h3>${html(title)}</h3><button type="button" class="secondary" data-close-notes>Trở lại bản thảo</button></header><div class="editor-notes-body">${content}</div>`;
    notes.hidden = false;
    notes.querySelector('[data-close-notes]').addEventListener('click', closeNotes);
    notes.querySelector('[data-close-notes]').focus({ preventScroll: true });
  };
  container.querySelector('#context-button').addEventListener('click', () => {
    openNotes(
      'Câu chuyện & căn cứ của bản tin',
      `<p>${html(copy.lead)}</p>${copy.columns.map((column) => `<article class="note"><h3>${html(column.heading)}</h3><p>${html(column.article)}</p><p>${html(column.why)}</p><a href="${html(sources[column.source].url)}" target="_blank" rel="noopener noreferrer">${html(sources[column.source].title)}</a></article>`).join('')}<p class="small">Bài viết và cách diễn giải do trò chơi biên soạn. Những liên hệ với người gửi thư là tình huống hư cấu.</p>`,
    );
  });
  container.querySelector('#review-button').addEventListener('click', () => {
    openNotes(
      'Đọc thử trước khi đưa lên trang báo',
      `<p class="review-intro">Hai tình huống biên tập để kiểm tra cách hiểu, ngoài ba cột báo chính. Mỗi lựa chọn có phản hồi và nguồn để đọc lại. Bạn có thể trở về bản thảo bất cứ lúc nào.</p><div class="editorial-review">${reviewTasks.map((task, index) => `<article class="review-task" data-review-task="${task.id}"><span class="eyebrow">ĐỐI CHIẾU ${index + 1} / ${reviewTasks.length} · TỰ CHỌN</span><h4>${html(task.prompt)}</h4><div>${task.choices.map((choice, i) => `<button type="button" class="secondary" data-review-choice="${i}" aria-pressed="false"><b>${String.fromCharCode(65 + i)}</b>${html(choice)}</button>`).join('')}</div><div class="review-feedback" role="status" aria-live="polite"></div><a href="${html(sources[task.source].url)}" target="_blank" rel="noopener noreferrer">${html(sources[task.source].title)} ↗</a></article>`).join('')}</div>`,
    );
    reviewTasks.forEach((task) => {
      const card = notes.querySelector(`[data-review-task="${task.id}"]`);
      const update = () => {
        const value = reviews[task.id],
          correct = value === task.answer;
        card
          .querySelectorAll('[data-review-choice]')
          .forEach((choice) =>
            choice.setAttribute(
              'aria-pressed',
              String(Number(choice.dataset.reviewChoice) === value),
            ),
          );
        const response = card.querySelector('.review-feedback');
        response.dataset.result = correct ? 'correct' : 'retry';
        response.innerHTML =
          value === undefined
            ? ''
            : `<b>${correct ? '✓ Cách hiểu có căn cứ' : '↺ Đọc lại chi tiết'}</b><p>${html(correct ? task.explanation : task.hint)}</p>`;
      };
      card.querySelectorAll('[data-review-choice]').forEach((choice) =>
        choice.addEventListener('click', () => {
          reviews[task.id] = Number(choice.dataset.reviewChoice);
          update();
          sync();
        }),
      );
      update();
    });
  });
  container.querySelector('#hint-button').addEventListener('click', hint);
  container
    .querySelector('#compare-button')
    .addEventListener('click', () => openNotes('Sổ tay đối chiếu', compare()));
  container
    .querySelector('#print-button')
    .addEventListener('click', () => submit(selections, proof));
  selections.forEach((_, i) => drawSlot(i));
  sync();
  if (selections.some(Boolean))
    container.querySelector('#feedback').textContent =
      'Bản thảo đang ghép đã được giữ lại. Tiếp tục từ những chữ bạn đã đặt.';
}
