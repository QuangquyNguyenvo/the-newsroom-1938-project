import { pressKnowledge } from '../content/press-knowledge.js';
import {
  loadKnowledgeState,
  saveKnowledgeState,
  freshKnowledgeState,
} from '../game/knowledge-state.js';

const stationNames = { desk: 'Bàn biên tập', shelf: 'Kệ tư liệu', press: 'Bàn in' };
export function createPressKnowledge({
  root,
  panel,
  openPanel,
  closePanel,
  travel,
  think,
  sound,
  escape,
}) {
  let storage;
  try {
    storage = localStorage;
  } catch {}
  let memory = loadKnowledgeState(storage),
    filter = 'all';
  const button = document.createElement('button');
  button.id = 'press-knowledge-button';
  button.className = 'reader-link';
  button.setAttribute('aria-haspopup', 'dialog');
  root.querySelector('#side-stories-button').after(button);
  button.addEventListener('click', journal);
  const has = (id) => pressKnowledge.some((item) => item.id === id);
  const solved = (item) => memory.answers[item.id] === item.challenge.answer;
  const sourceMarkup = (source) =>
    `<a class="knowledge-source" href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">Nguồn: ${escape(source.title)} ↗</a>`;
  const stats = () => ({
    opened: Object.values(memory.read).filter((pages) => pages.length).length,
    solved: pressKnowledge.filter(solved).length,
  });
  const label = (id) => {
    const item = pressKnowledge.find((entry) => entry.id === id);
    return solved(item) ? 'Đã đối chiếu' : memory.read[id]?.length ? 'Đang đọc' : 'Hồ sơ mở rộng';
  };
  function sync() {
    const count = stats();
    button.textContent = `Hồ sơ tòa báo · ${count.opened}/${pressKnowledge.length}`;
  }
  function persist() {
    saveKnowledgeState(storage, memory);
    sync();
  }
  function open(id, pageIndex) {
    const item = pressKnowledge.find((entry) => entry.id === id);
    if (!item) return;
    pageIndex ??= memory.read[id]?.at(-1) || 0;
    pageIndex = Math.max(0, Math.min(item.pages.length - 1, pageIndex));
    think('');
    sound.play('paper');
    openPanel(
      item.title,
      item.kicker,
      `<section class="knowledge-reader"><header class="knowledge-intro"><span class="eyebrow">KHÁM PHÁ TỰ CHỌN · KHÔNG CẦN ĐỂ IN BÁO</span><p>${escape(item.intro)}</p></header><div class="knowledge-layout"><nav class="knowledge-tabs" aria-label="Các trang hồ sơ">${item.pages.map((page, index) => `<button type="button" data-knowledge-page="${index}"><span>0${index + 1}</span>${escape(page.title)}</button>`).join('')}<button type="button" data-knowledge-challenge><span>?</span>Bàn đối chiếu</button></nav><article class="knowledge-page" tabindex="-1"></article></div><footer class="knowledge-footer"><button type="button" class="secondary" data-knowledge-pin></button><button type="button" class="secondary" data-knowledge-journal>Danh mục hồ sơ</button><button type="button" data-knowledge-next></button></footer><p class="knowledge-note">Hồ sơ do trò chơi biên soạn từ nguồn được dẫn. Đồ vật trong phòng là thiết kế minh họa, không phải hiện vật gốc của tòa soạn.</p></section>`,
    );
    panel.dataset.kind = 'knowledge';
    panel.dataset.item = id;
    panel
      .querySelector('.knowledge-layout')
      .insertAdjacentHTML(
        'beforebegin',
        `<label class="knowledge-mobile-index">Trang đang đọc<select aria-label="Chọn trang hồ sơ">${item.pages.map((page, index) => `<option value="${index}">${index + 1}. ${escape(page.title)}</option>`).join('')}<option value="challenge">Bàn đối chiếu</option></select></label>`,
      );
    const mobileIndex = panel.querySelector('.knowledge-mobile-index select');
    const article = panel.querySelector('.knowledge-page'),
      pin = panel.querySelector('[data-knowledge-pin]'),
      next = panel.querySelector('[data-knowledge-next]');
    const pinLabel = () => {
      const pinned = memory.pinned.includes(id);
      pin.textContent = pinned ? '✓ Đã ghim, bấm để gỡ' : 'Ghim vào sổ khám phá';
      pin.setAttribute('aria-pressed', String(pinned));
    };
    const selectTab = (challenge) => {
      mobileIndex.value = challenge ? 'challenge' : String(pageIndex);
      panel
        .querySelectorAll('[data-knowledge-page]')
        .forEach((tab) =>
          tab.setAttribute(
            'aria-current',
            !challenge && Number(tab.dataset.knowledgePage) === pageIndex ? 'page' : 'false',
          ),
        );
      panel
        .querySelector('[data-knowledge-challenge]')
        .setAttribute('aria-current', challenge ? 'page' : 'false');
    };
    const focusArticle = () => {
      article.focus({ preventScroll: true });
      article.scrollTop = 0;
    };
    function drawPage(focus = false) {
      const page = item.pages[pageIndex];
      memory.read[id] = [
        ...(memory.read[id] || []).filter((index) => index !== pageIndex),
        pageIndex,
      ];
      persist();
      selectTab(false);
      article.innerHTML = `<span class="knowledge-page-number">TRANG ${pageIndex + 1} / ${item.pages.length}</span><h3>${escape(page.title)}</h3>${page.body
        .split('\n\n')
        .map((text) => `<p>${escape(text)}</p>`)
        .join('')}${[page.source, ...(page.relatedSources || [])].map(sourceMarkup).join('')}`;
      next.textContent =
        pageIndex === item.pages.length - 1 ? 'Thử đối chiếu →' : 'Đọc trang tiếp →';
      next.onclick = () => {
        if (pageIndex < item.pages.length - 1) {
          pageIndex++;
          sound.play('page');
          drawPage(true);
        } else drawChallenge();
      };
      if (focus) focusArticle();
    }
    function drawChallenge() {
      selectTab(true);
      const challenge = item.challenge;
      article.innerHTML = `<span class="knowledge-page-number">BÀN ĐỐI CHIẾU · TỰ CHỌN</span><h3>${escape(challenge.prompt)}</h3><p class="knowledge-task-intro">Dựa vào hồ sơ vừa đọc, chọn cách hiểu có căn cứ. Có thể thử lại hoặc trở về các trang để tìm chi tiết.</p><div class="knowledge-choices">${challenge.choices.map((choice, index) => `<button type="button" data-knowledge-answer="${index}" aria-pressed="false"><span>${String.fromCharCode(65 + index)}</span>${escape(choice)}</button>`).join('')}</div><div class="knowledge-answer" role="status" aria-live="polite"></div>${[challenge.source, ...(challenge.relatedSources || [])].map(sourceMarkup).join('')}`;
      const showAnswer = () => {
        const answer = memory.answers[id];
        panel
          .querySelectorAll('[data-knowledge-answer]')
          .forEach((choice) =>
            choice.setAttribute(
              'aria-pressed',
              String(Number(choice.dataset.knowledgeAnswer) === answer),
            ),
          );
        const response = article.querySelector('.knowledge-answer');
        if (answer === undefined) return;
        const correct = solved(item);
        response.dataset.result = correct ? 'correct' : 'retry';
        response.innerHTML = `<b>${correct ? '✓ Đã đối chiếu' : '↺ Cần đối chiếu lại'}</b><p>${escape(correct ? challenge.explanation : challenge.hint || 'Cách hiểu này chưa khớp hồ sơ. Đọc lại các mốc và phân biệt điều nguồn xác nhận với điều mình suy đoán.')}</p>`;
      };
      article.querySelectorAll('[data-knowledge-answer]').forEach((choice) =>
        choice.addEventListener('click', () => {
          memory.answers[id] = Number(choice.dataset.knowledgeAnswer);
          persist();
          showAnswer();
          sound.play(solved(item) ? 'record' : 'paper');
        }),
      );
      showAnswer();
      next.textContent = 'Trở lại phòng';
      next.onclick = closePanel;
      focusArticle();
    }
    pinLabel();
    pin.addEventListener('click', () => {
      memory.pinned = memory.pinned.includes(id)
        ? memory.pinned.filter((value) => value !== id)
        : [...memory.pinned, id];
      persist();
      pinLabel();
    });
    mobileIndex.addEventListener('change', () => {
      sound.play('page');
      if (mobileIndex.value === 'challenge') drawChallenge();
      else {
        pageIndex = Number(mobileIndex.value);
        drawPage(true);
      }
    });
    panel.querySelector('[data-knowledge-journal]').addEventListener('click', journal);
    panel.querySelectorAll('[data-knowledge-page]').forEach((tab) =>
      tab.addEventListener('click', () => {
        pageIndex = Number(tab.dataset.knowledgePage);
        sound.play('page');
        drawPage(true);
      }),
    );
    panel.querySelector('[data-knowledge-challenge]').addEventListener('click', drawChallenge);
    drawPage();
  }
  function journal() {
    think('');
    const count = stats();
    openPanel(
      'Phía sau một tờ báo',
      'SỔ KHÁM PHÁ · KIẾN THỨC MỞ RỘNG',
      `<section class="knowledge-journal"><p class="knowledge-journal-lead">Một tờ báo đi từ chủ trương đến bài viết, từ bản in đến bạn đọc. Tìm dấu vết trong phòng để hiểu những chặng đường ấy.</p><div class="knowledge-stats"><span><b>${count.opened}/${pressKnowledge.length}</b> hồ sơ đã mở</span><span><b>${count.solved}/${pressKnowledge.length}</b> câu đã đối chiếu</span><span><b>${memory.pinned.length}</b> mục đã ghim</span></div><nav class="knowledge-filters" aria-label="Lọc hồ sơ"><button type="button" data-knowledge-filter="all">Tất cả</button>${Object.entries(
        stationNames,
      )
        .map(([id, name]) => `<button type="button" data-knowledge-filter="${id}">${name}</button>`)
        .join(
          '',
        )}<button type="button" data-knowledge-filter="pinned">Đã ghim</button></nav><div class="knowledge-grid"></div><p class="knowledge-note">Đọc và giải tự chọn. Những mục này không thay đổi đáp án, tư liệu bắt buộc hoặc tiến độ ba bản tin.</p></section>`,
    );
    panel.dataset.kind = 'knowledge';
    function draw() {
      panel
        .querySelectorAll('[data-knowledge-filter]')
        .forEach((tab) =>
          tab.setAttribute('aria-pressed', String(tab.dataset.knowledgeFilter === filter)),
        );
      const items = pressKnowledge.filter(
        (item) =>
          filter === 'all' ||
          item.station === filter ||
          (filter === 'pinned' && memory.pinned.includes(item.id)),
      );
      panel.querySelector('.knowledge-grid').innerHTML = items.length
        ? items
            .map(
              (item) =>
                `<article class="knowledge-card"><span class="eyebrow">${escape(stationNames[item.station])} · ${escape(label(item.id))}</span><h3>${escape(item.title)}</h3><p>${escape(item.intro)}</p><small>${memory.read[item.id]?.length || 0}/${item.pages.length} trang đã xem${memory.pinned.includes(item.id) ? ' · Đã ghim' : ''}</small><div><button type="button" data-open-dossier="${item.id}">${solved(item) ? 'Đọc lại' : memory.read[item.id]?.length ? 'Đọc tiếp' : 'Mở hồ sơ'}</button><button type="button" class="secondary" data-find-dossier="${item.id}">Tìm đồ vật</button></div></article>`,
            )
            .join('')
        : '<p class="knowledge-empty">Chưa ghim hồ sơ nào. Mở một mục rồi chọn “Ghim vào sổ khám phá”.</p>';
      panel
        .querySelectorAll('[data-open-dossier]')
        .forEach((button) =>
          button.addEventListener('click', () => open(button.dataset.openDossier)),
        );
      panel
        .querySelectorAll('[data-find-dossier]')
        .forEach((button) =>
          button.addEventListener('click', () =>
            travel(pressKnowledge.find((item) => item.id === button.dataset.findDossier)),
          ),
        );
    }
    panel.querySelectorAll('[data-knowledge-filter]').forEach((tab) =>
      tab.addEventListener('click', () => {
        filter = tab.dataset.knowledgeFilter;
        draw();
      }),
    );
    draw();
  }
  sync();
  return {
    open,
    journal,
    sync,
    has,
    label,
    stats,
    reset() {
      memory = freshKnowledgeState();
      filter = 'all';
      persist();
    },
  };
}
