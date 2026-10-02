import './styles/fonts.css';
import './styles/game.css';
import './styles/panels.css';
import './styles/interface.css';
import './styles/opening.css';
import './styles/readers.css';
import { icons } from './ui/icons.js';
import { bootMarkup, setBootReader, startBoot } from './ui/boot.js';
import { introMarkup, setIntroReader } from './ui/intro.js';
import { editorial } from './content/editorial.js';
import { createGraphicsSettings } from './ui/graphics-settings.js';
import { graphicsKey } from './scene/graphics.js';
import { mountNewspaper } from './game/newspaper.js';
import { createPressKnowledge } from './ui/press-knowledge.js';
import { pressKnowledge } from './content/press-knowledge.js';
import { createSideStories } from './ui/side-stories.js';
import { sideStories } from './content/side-stories.js';
import { createSound } from './ui/sound.js';
import { createMotion } from './ui/motion.js';
import { chapters, objects, evidenceLabels, sources, epilogue } from './content/chapters.js';
import {
  loadState,
  saveState,
  collectEvidence,
  checkAnswer,
  finishChapter,
  advanceChapter,
  freshState,
} from './game/state.js';
import { stations } from './scene/stations.js';
import { roomProps } from './content/room-props.js';

const fontsReady = Promise.all([
  document.fonts.load('700 32px "Noto Serif"', 'Những tiếng nói đời thường'),
  document.fonts.load('400 16px "Be Vietnam Pro"', 'Đối chiếu sổ tay'),
  document.fonts.load('400 24px "Patrick Hand"', 'Tôi nhờ Út ghi hộ lời của chị Tư'),
  document.fonts.load('400 22px "Mali"', 'Lời là của tôi'),
]).catch(() => {});
const root = document.querySelector('#app');
root.innerHTML = `
  <main class="game-shell">
    ${bootMarkup()}
    <div id="viewport" aria-label="Phòng biên tập 3D"></div>
    <header class="masthead"><div><span class="eyebrow">MỘT TRÒ CHƠI LỊCH SỬ ĐẢNG</span><h1>GIỮ TIẾNG NÓI<span class="edition">1938 / 1939</span></h1></div><button id="sound-button" class="light-button" aria-label="Bật tắt âm thanh" aria-pressed="true">Âm thanh</button><button id="notebook-button" class="light-button" aria-label="Sổ tay đối chiếu"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 4.5h15.5a1.5 1.5 0 0 1 1.5 1.5v20a1.5 1.5 0 0 1-1.5 1.5H8a2 2 0 0 1-2-2v-19a2 2 0 0 1 2-2z"/><path d="M10 4.5v23"/><path d="M19 4.5v8l-2-1.6-2 1.6v-8"/><path d="M13.5 17h7M13.5 21h5"/></svg><span id="clue-count" class="badge">0</span></button></header>
    <aside class="mission"><span id="chapter-number" class="eyebrow"></span><h2 id="chapter-title"></h2><button id="mission-toggle" aria-expanded="false" aria-controls="chapter-hint">Gợi ý</button><p id="chapter-intro"></p><p id="chapter-hint" class="mission-hint" hidden></p><button id="edit-button">Biên tập bản tin</button><p id="progress" class="small"></p></aside>
    <div id="hover-label" class="hover-label" aria-hidden="true"></div>
    <div id="station-caption" aria-hidden="true"><span>PHÒNG BIÊN TẬP</span><b></b></div>
    <div id="clue-toast" role="status" hidden></div>
    <div class="thought" role="status" aria-live="polite"><span class="eyebrow">SUY NGHĨ</span><p id="thought-text">Có một bản tin còn thiếu. Mình sẽ tìm tư liệu trước khi đưa nó lên trang báo.</p></div>
    <footer class="navigation"><nav id="station-buttons" aria-label="Vị trí trong phòng"></nav><button id="objects-button" class="light-button" aria-label="Xem danh sách đồ vật" title="Xem đồ vật"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="13.5" cy="13.5" r="8"/><path d="m19.5 19.5 7 7"/></svg></button><span class="controls-note">Rê chuột để nhìn quanh · Bấm đồ vật để xem · Esc để đóng</span></footer>
    <dialog id="panel" aria-labelledby="panel-title"><div class="dialog-head"><span class="eyebrow" id="panel-kicker"></span><button id="close-panel" aria-label="Quay lại phòng"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M18 7 8 16l10 9M9 16h17"/></svg></button></div><h2 id="panel-title"></h2><div id="panel-body"></div></dialog>
    ${introMarkup()}
  </main>`;
const boot = startBoot(document.getElementById('boot'));

let state;
try {
  state = loadState(localStorage);
} catch {
  state = freshState();
}
let station = 'desk',
  engine,
  returnFocus;
const panel = document.querySelector('#panel');
const el = (id) => document.getElementById(id);
const readerOf = { voices: 'tu', publication: 'ba', pressure: 'nam' };
// The opening quotes the reader whose letter is on the desk now, not always the first one.
function applyOpening() {
  const chapter = chapters[state.chapter];
  setBootReader(el('boot'), readerOf[chapter.id], chapter.letter);
  setIntroReader(
    el('intro'),
    readerOf[chapter.id],
    chapter.letter,
    state.completed.includes(chapter.id),
  );
}
applyOpening();
el('edit-button').insertAdjacentHTML(
  'beforebegin',
  '<div id="mission-trail" aria-label="Tiến độ công việc"></div><div id="mission-clues" aria-label="Tư liệu cần tìm"></div>',
);
el('chapter-intro').insertAdjacentHTML('beforebegin', '<p id="mission-goal"></p>');
el('edit-button').insertAdjacentHTML('beforebegin', '<p id="mission-next" role="status"></p>');
el('chapter-intro').insertAdjacentHTML(
  'afterend',
  '<button id="reader-button" class="reader-link" aria-haspopup="dialog">Chuyện người gửi thư</button>',
);
el('sound-button').insertAdjacentHTML(
  'beforebegin',
  '<button id="effects-button" class="light-button" aria-label="Hiệu ứng không khí" aria-pressed="true" title="Bật tắt bụi nắng và chuyển động không khí"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3v4m0 18v4M3 16h4m18 0h4M7 7l3 3m12 12 3 3M7 25l3-3m12-12 3-3"/><circle cx="16" cy="16" r="6"/></svg></button>',
);
let effectsEnabled = true;
try {
  effectsEnabled = localStorage.getItem('game-lsd:effects') !== 'off';
} catch {}
el('effects-button').setAttribute('aria-pressed', String(effectsEnabled));
const graphicsUI = createGraphicsSettings(
  root,
  () => engine,
  (value) => {
    effectsEnabled = value;
    engine?.setEffects(value);
    el('effects-button').setAttribute('aria-pressed', String(value));
    try {
      localStorage.setItem('game-lsd:effects', value ? 'on' : 'off');
    } catch {}
  },
);
try {
  if (localStorage.getItem(graphicsKey) === null && !effectsEnabled)
    graphicsUI.setAtmosphere(false);
} catch {}
effectsEnabled = graphicsUI.settings.atmosphere;
root.addEventListener('graphicsnotice', (event) => think(event.detail));
// Without GPU acceleration every preset stutters, so say so before the player starts.
if (graphicsUI.tier === 'software' && el('boot')) {
  el('boot')
    .querySelector('.boot-progress')
    .insertAdjacentHTML(
      'afterend',
      '<p class="boot-warning">Trình duyệt chưa bật tăng tốc đồ họa nên game sẽ giật. <button type="button" id="boot-gpu-help">Xem cách bật</button></p>',
    );
  el('boot-gpu-help').addEventListener('click', () => graphicsUI.open(true));
}
el('effects-button').setAttribute('aria-pressed', String(effectsEnabled));
el('effects-button').addEventListener('click', () => {
  effectsEnabled = !effectsEnabled;
  graphicsUI.setAtmosphere(effectsEnabled);
  engine?.setGraphics(graphicsUI.settings);
  engine?.setEffects(effectsEnabled);
  el('effects-button').setAttribute('aria-pressed', String(effectsEnabled));
  try {
    localStorage.setItem('game-lsd:effects', effectsEnabled ? 'on' : 'off');
  } catch {}
});
const draftsKey = 'game-lsd:editor-drafts';
let drafts = {};
try {
  const saved = JSON.parse(localStorage.getItem(draftsKey));
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) drafts = saved;
} catch {}
function saveDraft(id, draft) {
  drafts[id] = draft;
  try {
    localStorage.setItem(draftsKey, JSON.stringify(drafts));
  } catch {}
}
const motion = createMotion(root);
const sound = createSound(root);
const syncSound = () => {
  el('sound-button').setAttribute('aria-pressed', String(!sound.muted));
  el('sound-button').innerHTML =
    `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 12h5l7-6v20l-7-6H5z"/>${sound.muted ? '<path d="m22 12 7 8m0-8-7 8"/>' : '<path d="M22 11q7 5 0 10M25 6q13 10 0 20"/>'}</svg>`;
  for (const id of ['boot-sound', 'intro-sound'])
    if (el(id)) {
      el(id).textContent = sound.muted ? 'Âm thanh: tắt' : 'Âm thanh: bật';
      el(id).setAttribute('aria-pressed', String(!sound.muted));
    }
};
syncSound();
root.addEventListener('soundchange', syncSound);
el('sound-button').addEventListener('click', () => {
  sound.toggle();
  syncSound();
});
el('intro-sound').addEventListener('click', () => sound.toggle());
root.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (
    !button ||
    ['sound-button', 'close-panel', 'print-button', 'start-button'].includes(button.id) ||
    button.hasAttribute('data-page')
  )
    return;
  sound.play(
    button.dataset.page ? 'page' : button.dataset.word || button.dataset.slot ? 'place' : 'click',
  );
});
let popupFrame = 0,
  lastChapter,
  missionHintIndex = 0;
let toastTimer,
  captionTimer,
  pendingClueToast = false;
const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
function remember() {
  try {
    if (!saveState(localStorage, state))
      think('Tiến độ được giữ trong phiên này. Trình duyệt hiện không cho lưu lâu dài.');
  } catch {
    think('Tiến độ được giữ trong phiên này.');
  }
  refreshHUD();
}
function recordClue(id) {
  const fresh = !state.evidence.includes(id);
  collectEvidence(state, id);
  remember();
  if (!fresh) return;
  pendingDocumentThought =
    state.chapter === 0
      ? 'Mình đã có căn cứ. Giờ cần viết sao cho chị Tư còn nhận ra lời của mình.'
      : state.chapter === 1
        ? 'Anh Ba muốn biết lời này của ai. Mình phải giữ cả nguồn và ngày, không chỉ phần nghe có vẻ đúng.'
        : 'Năm đang chờ hồi âm. Mình sẽ nói rõ điều biết được, không hứa rằng mọi chuyện đã yên.';
  clearTimeout(toastTimer);
  el('clue-toast').hidden = false;
  el('clue-toast').innerHTML =
    `<span class="eyebrow">ĐÃ GHIM VÀO SỔ TAY</span><b>${escape(evidenceLabels[id])}</b><span>Tư liệu đã sẵn sàng để đối chiếu.</span>`;
  pendingClueToast = panel.open;
  motion.ink(el('clue-toast'));
  if (!pendingClueToast)
    toastTimer = setTimeout(() => {
      el('clue-toast').hidden = true;
    }, 4200);
}
let thoughtTimer, thoughtTypeTimer;
function think(text, speaker = 'SUY NGHĨ') {
  clearTimeout(thoughtTimer);
  clearTimeout(thoughtTypeTimer);
  const thought = root.querySelector('.thought');
  thought.hidden = !text;
  thought.setAttribute('aria-busy', 'false');
  if (!text) return;
  thought.querySelector('.eyebrow').textContent = speaker;
  const glyphs = Array.from(text);
  let index = 0;
  el('thought-text').textContent = '';
  thought.setAttribute('aria-busy', 'true');
  function write() {
    index++;
    el('thought-text').textContent = glyphs.slice(0, index).join('');
    if (glyphs[index - 1].trim()) sound.tick('type');
    if (index < glyphs.length) thoughtTypeTimer = setTimeout(write, 28);
    else {
      thought.setAttribute('aria-busy', 'false');
      thoughtTimer = setTimeout(() => {
        thought.hidden = true;
      }, 4000);
    }
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el('thought-text').textContent = text;
    thought.setAttribute('aria-busy', 'false');
    thoughtTimer = setTimeout(() => {
      thought.hidden = true;
    }, 5500);
  } else write();
}
function activateProp(id) {
  const prop = roomProps.find((item) => item.id === id);
  if (!prop) return false;
  const active = engine?.interact(id);
  sound.play(prop.sound);
  // Ordinary room objects describe the action just taken, never an unrelated reader.
  think(prop.thought[active ? 0 : 1] || prop.thought[0]);
  return true;
}
function sourceLink(key) {
  const source = sources[key];
  return source
    ? `<details class="source"><summary>Nguồn tư liệu</summary><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)}</a></details>`
    : '';
}
function openPanel(title, kicker, html) {
  engine?.cancelPendingInspection();
  cancelAnimationFrame(popupFrame);
  motion.cancelTurns();
  panel.querySelector(':scope > .panel-actions')?.remove();
  panel.classList.remove('editor-panel');
  delete panel.dataset.item;
  delete panel.dataset.kind;
  delete panel.dataset.story;
  delete panel.dataset.reader;
  engine?.setPaused(true);
  if (el('leave-closeup')) el('leave-closeup').hidden = true;
  if (!panel.open) returnFocus = document.activeElement;
  el('panel-title').textContent = title;
  el('panel-kicker').textContent = kicker;
  el('panel-body').innerHTML = html;
  if (!panel.open) panel.showModal();
  el('close-panel').focus();
  panel.scrollTop = 0;
  popupFrame = requestAnimationFrame(() => {
    if (panel.open) motion.revealDialog(panel);
  });
}
function closePanel() {
  sound.play(
    panel.dataset.item === 'drawer' ? 'drawerClose' : panel.dataset.item ? 'paper' : 'close',
  );
  cancelAnimationFrame(popupFrame);
  motion.closeDialog(panel);
}
const sideStoriesUI = createSideStories({
  root,
  panel,
  getGame: () => state,
  openPanel,
  closePanel,
  think,
  sound,
  escape,
  travel: (story) => {
    if (refuse(story.id)) return;
    const visit = () => {
      moveTo(story.station, true);
      if (engine) engine.focusObject(story.id);
      else sideStoriesUI.open(story.id);
    };
    if (panel.open) {
      panel.addEventListener('close', visit, { once: true });
      closePanel();
    } else visit();
  },
});
const knowledgeUI = createPressKnowledge({
  root,
  panel,
  openPanel,
  closePanel,
  think,
  sound,
  escape,
  travel: (item) => {
    if (refuse(item.id)) return;
    const visit = () => {
      moveTo(item.station, true);
      if (engine) engine.focusObject(item.id);
      else knowledgeUI.open(item.id);
    };
    if (panel.open) {
      panel.addEventListener('close', visit, { once: true });
      closePanel();
    } else visit();
  },
});
let pendingDocumentThought;
// The room opens in the order of the letters: evidence for the current news item only,
// then a reader's keepsakes and the related dossiers once that item has been printed.
function lockReason(id) {
  if (state.completed.length === chapters.length) return '';
  const numberOf = (chapterId) => chapters.find((chapter) => chapter.id === chapterId).number;
  const story = sideStories.find((item) => item.id === id);
  if (story) {
    const chapterId = Object.keys(readerOf).find((key) => readerOf[key] === story.reader);
    return state.completed.includes(chapterId)
      ? ''
      : `Chuyện này mở ra sau khi bản tin ${numberOf(chapterId)} được in.`;
  }
  const dossier = pressKnowledge.find((item) => item.id === id);
  if (dossier)
    return state.completed.includes(dossier.unlock)
      ? ''
      : `Hồ sơ này mở ra sau khi bản tin ${numberOf(dossier.unlock)} được in.`;
  const evidence =
    objects
      .find((item) => item.id === id)
      ?.pages.map((page) => page.evidence)
      .filter(Boolean) || [];
  const owner = chapters.findIndex((chapter) =>
    chapter.requiredEvidence.some((item) => evidence.includes(item)),
  );
  if (owner < 0 || owner === state.chapter) return '';
  return owner > state.chapter
    ? `Chưa tới lúc. Tư liệu này dành cho bản tin ${chapters[owner].number}.`
    : `Tư liệu này đã vào bản tin ${chapters[owner].number}. Muốn xem lại, hãy mở sổ tay.`;
}
function refuse(id) {
  const reason = lockReason(id);
  if (!reason) return false;
  if (panel.open) closePanel();
  think(reason);
  return true;
}
el('close-panel').addEventListener('click', closePanel);
panel.addEventListener('cancel', (event) => {
  event.preventDefault();
  const notes = panel.querySelector('#inline-notes:not([hidden])');
  if (notes) notes.querySelector('[data-close-notes]').click();
  else closePanel();
});
panel.addEventListener('close', () => {
  panel.querySelector('video')?.pause();
  engine?.returnFromInspection();
  engine?.setPaused(false);
  returnFocus?.focus();
  const parting = sideStoriesUI.takeParting();
  if (parting) think(parting[1], parting[0]);
  else if (pendingDocumentThought) think(pendingDocumentThought);
  pendingDocumentThought = null;
  if (pendingClueToast) {
    pendingClueToast = false;
    motion.ink(el('clue-toast'));
    toastTimer = setTimeout(() => {
      el('clue-toast').hidden = true;
    }, 4200);
  }
});
// A swipe that starts on the page and ends on the backdrop must not close the reader.
let pressedOnBackdrop = false;
const outsidePanel = (event) => {
  const r = panel.getBoundingClientRect();
  return (
    event.clientX < r.left ||
    event.clientX > r.right ||
    event.clientY < r.top ||
    event.clientY > r.bottom
  );
};
panel.addEventListener('pointerdown', (event) => {
  pressedOnBackdrop = event.target === panel && outsidePanel(event);
});
panel.addEventListener('click', (event) => {
  if (event.target === panel && pressedOnBackdrop) {
    const r = panel.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      closePanel();
  }
});

function refreshHUD() {
  sideStoriesUI.sync();
  knowledgeUI.sync();
  const chapter = chapters[state.chapter];
  el('chapter-number').innerHTML =
    `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 5h20v22H6zM10 10h12M10 15h5v7h-5zM19 15h3M19 19h3M19 23h3"/></svg><span>${chapter.number} / 03</span>`;
  el('chapter-title').textContent = chapter.title;
  el('chapter-intro').textContent = chapter.intro;
  el('reader-button').textContent = `Đọc thư và chuyện ${chapter.letter.address}`;
  el('progress').textContent = `${state.completed.length}/3 bản tin đã hoàn thành`;
  el('clue-count').textContent = state.evidence.length;
  const found = chapter.requiredEvidence.filter((id) => state.evidence.includes(id)).length;
  const ready = found === chapter.requiredEvidence.length,
    done = state.completed.includes(chapter.id);
  el('mission-trail').innerHTML = ['Tìm tư liệu', 'Ghép chữ', 'In báo']
    .map(
      (label, index) =>
        `<span class="${(index === 0 && ready) || done ? 'done' : (index === 0 && !ready) || (index === 1 && ready && !done) ? 'current' : ''}"><i>${(index === 0 && ready) || done ? '✓' : index + 1}</i>${label}</span>`,
    )
    .join('');
  el('mission-clues').innerHTML = chapter.requiredEvidence
    .map((id) => {
      const object = objects.find((item) => item.pages.some((page) => page.evidence === id));
      return `<button class="clue-route" data-route="${object.id}"><i aria-hidden="true">${state.evidence.includes(id) ? '✓' : '○'}</i><span>${escape(object.label)}<small>${state.evidence.includes(id) ? 'Đã ghi vào sổ tay' : stations[object.station].label}</small></span></button>`;
    })
    .join('');
  el('mission-clues')
    .querySelectorAll('[data-route]')
    .forEach((button) =>
      button.addEventListener('click', () => {
        const object = objects.find((item) => item.id === button.dataset.route);
        moveTo(object.station);
        think(
          `Tìm ${object.label.toLowerCase()}. Bấm trực tiếp trong phòng hoặc mở danh sách đồ vật.`,
        );
      }),
    );
  // Optional reading only joins the card once the first news item has opened some.
  el('side-stories-button').hidden = el('press-knowledge-button').hidden =
    state.completed.length === 0;
  const missing = chapter.requiredEvidence.find((id) => !state.evidence.includes(id));
  const target = objects.find((item) => item.pages.some((page) => page.evidence === missing));
  el('mission-goal').innerHTML =
    `<b>Mục tiêu</b>Viết bản tin trả lời thư ${escape(chapter.letter.address)}.`;
  el('mission-next').innerHTML = `<b>Việc tiếp theo</b>${escape(
    state.completed.length === chapters.length
      ? 'Trang báo đã xong. Đọc các chuyện và hồ sơ còn lại trong phòng, hoặc xem lại trang báo.'
      : done
        ? 'Bản tin đã in. Bấm nút bên dưới để xem lại và đi tiếp.'
        : target
          ? `Đến ${stations[target.station].label}, mở “${target.label}” rồi ghi tư liệu vào sổ tay.`
          : 'Tư liệu đã đủ. Bấm nút bên dưới để ghép bản tin.',
  )}`;
  el('edit-button').textContent =
    state.completed.length === chapters.length
      ? 'Xem trang báo'
      : ready
        ? 'Tư liệu đã đủ, ghép bản tin'
        : `Biên tập · ${found}/${chapter.requiredEvidence.length} tư liệu`;
  el('edit-button').classList.toggle('ready', ready);
  if (lastChapter !== chapter.id) {
    missionHintIndex = 0;
    el('chapter-hint').hidden = true;
    el('mission-toggle').setAttribute('aria-expanded', 'false');
    el('chapter-hint').textContent = '';
    motion.ink(el('chapter-title'));
    lastChapter = chapter.id;
  }
}
el('mission-toggle').addEventListener('click', () => {
  const guides = chapters[state.chapter].guide;
  el('chapter-hint').textContent = guides[missionHintIndex % guides.length];
  el('chapter-hint').hidden = false;
  el('mission-toggle').setAttribute('aria-expanded', 'true');
  missionHintIndex++;
});
const documentLabels = {
  letter: 'Bản thảo',
  notebook: 'Sổ ghi chép',
  archive: 'Hồ sơ lưu',
  photo: 'Ảnh sưu tập',
  drawer: 'Hồ sơ ngăn kéo',
  proof: 'Bản kiểm tra',
};
function inspect(id, pageIndex = 0) {
  const object = objects.find((item) => item.id === id);
  if (!object) return;
  think('');
  openPanel(
    object.label,
    'TƯ LIỆU',
    `<div class="reader-stage" tabindex="0" aria-label="Tài liệu, dùng phím trái phải hoặc vuốt để lật"><div class="page-bed" aria-hidden="true"></div><article class="document"></article></div><div class="reader-nav"><button data-page="previous" aria-label="Lật về trước">${icons.chevronLeft}</button><span class="reader-count" aria-live="polite"></span><button data-page="next" aria-label="Lật tiếp">${icons.chevronRight}</button></div><div class="reader-record"></div>`,
  );
  panel.dataset.item = id;
  panel.dataset.kind = id === 'notebook' ? 'notebook' : object.kind;
  const stage = panel.querySelector('.reader-stage'),
    article = stage.querySelector('article');
  const nav = panel.querySelector('.reader-nav'),
    annotations = new Map();
  let busy = false,
    start;
  function draw(index = pageIndex, preview = false) {
    const page = object.pages[index];
    if (!annotations.has(index)) annotations.set(index, new Set());
    const selected = annotations.get(index);
    stage.scrollTop = 0;
    const arrived =
      page.reader && chapters.findIndex((item) => item.id === page.reader.chapter) <= state.chapter;
    article.dataset.face = id === 'photo' && index > 0 ? 'back' : 'front';
    article.innerHTML = `<span class="doc-label">${escape(id === 'photo' && index > 0 ? 'Mặt sau tấm ảnh' : documentLabels[id])}<i>${index + 1} / ${object.pages.length}</i></span>${id === 'photo' && index === 0 ? `<img class="reference-photo" src="${import.meta.env.BASE_URL}assets/references/dan-chung.jpg" alt="Ảnh sưu tập các tờ báo Dân Chúng">` : ''}<h3>${escape(page.title)}</h3><p class="doc-text">${escape(page.text)}</p>${sourceLink(page.source)}${page.note ? `<aside class="doc-note"><b>Mình ghi bên lề</b><p>${escape(page.note)}</p>${arrived ? `<p>${escape(page.reader.text)}</p>` : ''}</aside>` : ''}`;
    if (id === 'letter' && page.evidence) {
      const paragraph = article.querySelector('.doc-text');
      paragraph.innerHTML = escape(page.text).replace(
        /cơm áo|hòa bình|dân chủ/gi,
        (word) =>
          `<button class="ink-word" data-term="${word}" aria-pressed="${selected.has(word)}">${word}</button>`,
      );
      paragraph.querySelectorAll('[data-term]').forEach((button) =>
        button.addEventListener('click', () => {
          selected.add(button.dataset.term);
          button.setAttribute('aria-pressed', 'true');
          sound.play('paper');
          if (selected.size === 3) {
            recordClue(page.evidence);
            sound.play('record');
            panel.querySelector('.reader-record').textContent = '✓ Đã khoanh đủ ba yêu cầu';
          } else
            panel.querySelector('.reader-record').textContent =
              `Đã khoanh ${selected.size}/3 yêu cầu. Tìm thêm trong đoạn ghi chú.`;
        }),
      );
    }
    if (preview) return;
    el('panel-kicker').textContent = `TƯ LIỆU · ${pageIndex + 1}/${object.pages.length}`;
    panel.querySelector('.reader-count').textContent =
      object.pages.length > 1 ? `${pageIndex + 1} / ${object.pages.length} · Vuốt để lật` : '';
    nav.hidden = object.pages.length < 2;
    nav.querySelector('[data-page="previous"]').disabled = pageIndex === 0;
    nav.querySelector('[data-page="next"]').disabled = pageIndex === object.pages.length - 1;
    const actions = {
      notebook: 'Đánh dấu ngày xuất bản',
      archive: 'Ghim hồ sơ tổ chức',
      photo: 'Lưu mốc biến cố',
      drawer: 'Lưu ngày ra số cuối',
    };
    panel.querySelector('.reader-record').innerHTML =
      id === 'proof'
        ? '<button id="compare-proof">Đối chiếu bản in</button>'
        : id === 'letter' && page.evidence
          ? `${state.evidence.includes(page.evidence) ? '✓ Đã khoanh ba yêu cầu' : 'Chạm vào ba yêu cầu trong ghi chú để khoanh lại.'}`
          : page.evidence
            ? `<button id="collect-button">${state.evidence.includes(page.evidence) ? '✓ Đã ghi vào sổ tay' : actions[id] || 'Ghi vào sổ tay'}</button>`
            : '';
    el('compare-proof')?.addEventListener('click', editChapter);
    el('collect-button')?.addEventListener('click', () => {
      recordClue(page.evidence);
      sound.play('record');
      el('collect-button').textContent = '✓ Đã ghi vào sổ tay';
      motion.ink(el('collect-button'));
      pendingDocumentThought =
        state.chapter === 0
          ? 'Mình đã có căn cứ. Giờ cần viết sao cho chị Tư còn nhận ra lời của mình.'
          : state.chapter === 1
            ? 'Anh Ba muốn biết lời này của ai. Mình phải giữ cả nguồn và ngày, không chỉ phần nghe có vẻ đúng.'
            : 'Năm đang chờ hồi âm. Mình sẽ nói rõ điều biết được, không hứa rằng mọi chuyện đã yên.';
    });
  }
  function turn(direction) {
    const next = pageIndex + direction;
    if (busy || next < 0 || next >= object.pages.length) return;
    busy = true;
    sound.play('page');
    motion
      .beginTurn(
        article,
        () => draw(next, true),
        () => {
          draw();
          busy = false;
        },
        direction,
      )
      .finish(() => {
        pageIndex = next;
        draw();
        busy = false;
      });
  }
  nav.querySelector('[data-page="previous"]').addEventListener('click', () => turn(-1));
  nav.querySelector('[data-page="next"]').addEventListener('click', () => turn(1));
  // Drag the leaf with the pointer: it follows the finger/mouse, then completes
  // past halfway (or on a quick flick) and falls back otherwise.
  let drag = null;
  stage.addEventListener('pointerdown', (event) => {
    if (busy || event.button > 0 || event.target.closest('a,button,summary')) return;
    start = { x: event.clientX, y: event.clientY, t: performance.now() };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', (event) => {
    if (!start) return;
    const dx = event.clientX - start.x,
      dy = event.clientY - start.y;
    if (!drag) {
      if (Math.abs(dx) < 10 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      const direction = dx < 0 ? 1 : -1,
        next = pageIndex + direction;
      if (next < 0 || next >= object.pages.length) {
        start = null;
        return;
      }
      busy = true;
      stage.classList.add('dragging');
      sound.play('page');
      drag = {
        next,
        direction,
        controller: motion.beginTurn(
          article,
          () => draw(next, true),
          () => {
            draw();
            busy = false;
          },
          direction,
        ),
      };
    }
    drag.controller.set(Math.abs(dx) / (stage.offsetWidth * 0.8));
  });
  const release = (event) => {
    if (!start) return;
    const elapsed = performance.now() - start.t,
      dx = event.clientX - start.x;
    start = null;
    stage.classList.remove('dragging');
    if (!drag) return;
    const { controller, next } = drag;
    drag = null;
    const flick = Math.abs(dx) / Math.max(elapsed, 1) > 0.5;
    if (event.type === 'pointerup' && (controller.progress > 0.45 || flick))
      controller.finish(() => {
        pageIndex = next;
        draw();
        busy = false;
      });
    else
      controller.cancel(() => {
        busy = false;
      });
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('lostpointercapture', release);
  stage.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      turn(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  draw();
  sound.play(
    id === 'drawer'
      ? 'drawer'
      : object.kind === 'photo'
        ? 'photo'
        : object.kind === 'book'
          ? 'book'
          : 'paper',
  );
}
// Each chapter opens with a (fictional, labelled) reader letter: the reason to write.
const lettersKey = 'game-lsd:letters';
function lettersRead() {
  try {
    return JSON.parse(localStorage.getItem(lettersKey)) || [];
  } catch {
    return [];
  }
}
function readerAfterMarkup(chapter, ending = false) {
  return `<section class="reader-followup"><span class="eyebrow">${ending ? 'CHẶNG ĐƯỜNG CÒN TIẾP' : 'SAU KHI NHẬN BẢN TIN'} · CÂU CHUYỆN HƯ CẤU</span><h3>${escape(chapter.letter.name)}</h3><p>${escape(ending ? chapter.letter.ending : chapter.letter.after)}</p>${ending ? sideStoriesUI.endingMarkup({ voices: 'tu', publication: 'ba', pressure: 'nam' }[chapter.id]) : ''}</section>`;
}
function letterMarkup(chapter) {
  const reader = chapter.letter;
  return `<article class="reader-letter" data-reader="${readerOf[chapter.id]}">
    <span class="eyebrow">CÂU CHUYỆN HƯ CẤU · BẠN ĐỌC GỬI TÒA SOẠN</span>
    <header class="reader-person"><span class="reader-initial" aria-hidden="true">${escape(reader.name.split(' ').at(-1))}</span><div><h3>${escape(reader.from)}</h3><p>${escape(reader.motif)}</p></div></header>
    <p class="reader-scene">${escape(reader.scene)}</p>
    <div class="letter-sheet"><p class="letter-delivery">${escape(reader.delivery)}</p>${reader.text
      .split('\n\n')
      .map(
        (text) => `<p class="letter-text">${escape(text).replace(/~~(.+?)~~/g, '<s>$1</s>')}</p>`,
      )
      .join('')}<p class="letter-from">${escape(reader.signature)}</p></div>
    <details class="reader-history"><summary>Chuyện đời ${escape(reader.address)}</summary><ol>${reader.history.map((scene) => `<li><h4>${escape(scene.title)}</h4><p>${escape(scene.text)}</p></li>`).join('')}</ol></details>
    ${sideStoriesUI.characterMarkup({ voices: 'tu', publication: 'ba', pressure: 'nam' }[chapter.id])}
    ${state.completed.includes(chapter.id) ? readerAfterMarkup(chapter) : ''}
    <p class="reader-fiction">Nhân vật, lời thư, hồi âm và diễn biến đời sống do trò chơi sáng tác. Đây không phải thư hay lời kể được lưu trong tư liệu lịch sử.</p>
  </article>`;
}
function showLetter(chapter, then) {
  try {
    localStorage.setItem(lettersKey, JSON.stringify([...new Set([...lettersRead(), chapter.id])]));
  } catch {}
  sound.play('paper');
  openPanel(
    `Chuyện ${chapter.letter.address}`,
    `BẢN TIN ${chapter.number} · MỘT NGƯỜI CHỜ BÁO`,
    `${letterMarkup(chapter)}<button id="letter-button">${state.completed.includes(chapter.id) ? 'Trở về phòng' : 'Nhận lời gửi, tìm tư liệu'}</button>`,
  );
  el('letter-button').addEventListener('click', () => {
    closePanel();
    then?.();
  });
}
el('reader-button').addEventListener('click', () => showLetter(chapters[state.chapter]));
function startChapter() {
  const chapter = chapters[state.chapter];
  if (state.completed.length === chapters.length) {
    think(
      'Trang báo đã hoàn thành. Mọi tư liệu, chuyện và hồ sơ trong phòng đều mở để mình đọc lại.',
    );
    return;
  }
  const previous = chapters[state.chapter - 1];
  const narration =
    chapter.narration +
    (previous && state.completed.includes(previous.id)
      ? ` Chuyện của ${previous.letter.address} và hồ sơ đọc thêm vừa mở trong phòng.`
      : '');
  if (!state.completed.includes(chapter.id) && !lettersRead().includes(chapter.id))
    showLetter(chapter, () => think(narration));
  else think(narration);
}
function showObjects() {
  const groups = [
    ['Tư liệu cho bản tin', objects],
    ['Chuyện người gửi thư', sideStories],
    ['Hồ sơ lịch sử mở rộng', pressKnowledge],
    ['Đồ dùng trong phòng', roomProps],
  ];
  openPanel(
    'Quan sát gần hơn',
    stations[station].label,
    `<p>Bấm một đồ vật để xem gần. Chuyện của người gửi thư và hồ sơ đọc thêm mở ra sau khi bản tin của người ấy được in.</p>${groups
      .map(([title, items]) => {
        const visible = items.filter((object) => object.station === station);
        return visible.length
          ? `<section class="object-group"><h3>${escape(title)}</h3><div class="object-list">${visible.map((object) => `<button data-object="${object.id}"${lockReason(object.id) ? ' disabled' : ''}>${escape(object.label)}${lockReason(object.id) ? `<small>${escape(lockReason(object.id))}</small>` : sideStoriesUI.has(object.id) ? `<small>${sideStoriesUI.label(object.id)}</small>` : knowledgeUI.has(object.id) ? `<small>${escape(object.title)} · ${knowledgeUI.label(object.id)}</small>` : ''}</button>`).join('')}</div></section>`
          : '';
      })
      .join('')}`,
  );
  panel.querySelectorAll('[data-object]').forEach((button) =>
    button.addEventListener('click', () => {
      const id = button.dataset.object;
      if (!engine) {
        if (knowledgeUI.has(id)) knowledgeUI.open(id);
        else if (sideStoriesUI.has(id)) sideStoriesUI.open(id);
        else if (!activateProp(id)) inspect(id);
        return;
      }
      closePanel();
      panel.addEventListener('close', () => engine.focusObject(id), { once: true });
    }),
  );
}
function showNotebook() {
  const entries = objects.flatMap((object) =>
    object.pages
      .filter((page) => page.evidence && state.evidence.includes(page.evidence))
      .map((page) => ({ object, page })),
  );
  const letters = chapters
    .filter((chapter) => lettersRead().includes(chapter.id))
    .map(letterMarkup)
    .join('');
  openPanel(
    'Sổ tay đối chiếu',
    'NHỮNG GÌ BẠN ĐÃ TÌM THẤY',
    '<div class="actions"><button id="notes-side-stories" class="secondary">Những chuyện trong phòng</button><button id="notes-knowledge" class="secondary">Sổ khám phá tòa báo</button></div>' +
      letters +
      (entries.length
        ? entries
            .map(
              ({ object, page }) =>
                `<article class="note"><span class="eyebrow">${escape(object.label)}</span><h3>${escape(evidenceLabels[page.evidence])}</h3><p>${escape(page.text)}</p>${sourceLink(page.source)}</article>`,
            )
            .join('')
        : '<p>Chưa có ghi chép. Mở đồ vật, xem các trang hoặc mặt sau, rồi bấm ghi thông tin vào sổ tay.</p>'),
  );
  el('notes-side-stories').addEventListener('click', sideStoriesUI.journal);
  el('notes-knowledge').addEventListener('click', knowledgeUI.journal);
}
function editChapter() {
  if (state.completed.length === chapters.length) {
    showFinal();
    return;
  }
  const chapter = chapters[state.chapter];
  if (state.completed.includes(chapter.id)) {
    showCompletion();
    return;
  }
  openPanel(chapter.title, 'BÀN BIÊN TẬP', '');
  panel.classList.add('editor-panel');
  mountNewspaper(el('panel-body'), chapter, state, {
    draft: drafts[chapter.id],
    onChange: (draft) => saveDraft(chapter.id, draft),
    hint: () => {
      el('feedback').textContent = chapter.hints[Math.min(state.hint++, chapter.hints.length - 1)];
      motion.ink(el('feedback'));
    },
    compare: () =>
      state.evidence.length
        ? objects
            .flatMap((object) =>
              object.pages
                .filter((page) => state.evidence.includes(page.evidence))
                .map(
                  (page) =>
                    `<article class="note"><h3>${escape(evidenceLabels[page.evidence])}</h3><p>${escape(page.text)}</p>${sourceLink(page.source)}</article>`,
                ),
            )
            .join('')
        : '<p>Chưa có tư liệu. Hãy tìm trong phòng trước.</p>',
    submit: (selections, proof) => {
      const result = checkAnswer(state, selections, proof);
      panel.querySelectorAll('[aria-invalid]').forEach((b) => b.removeAttribute('aria-invalid'));
      if (!result.ok) {
        sound.play('error');
        if (result.reason === 'missing')
          el('feedback').textContent =
            `Cần tìm thêm: ${result.missing.map((id) => evidenceLabels[id]).join('; ')}.`;
        if (result.reason === 'slots') {
          panel.querySelector('[data-view="paper"]').click();
          el(`slot-${result.incorrect[0]}`).click();
          result.incorrect.forEach((i) => el(`slot-${i}`).setAttribute('aria-invalid', 'true'));
          el('feedback').textContent =
            `Xem lại: ${result.incorrect.map((i) => chapter.slots[i].label).join(', ')}. Những phần còn lại đã được giữ.`;
        }
        if (result.reason === 'proof') {
          panel.querySelector('[data-view="proof"]').click();
          el('feedback').textContent = editorial[chapter.id].proofMisread;
          panel.querySelector('.proof-section').setAttribute('aria-invalid', 'true');
          panel.querySelector('[data-proof]:checked')?.focus({ preventScroll: true });
        }
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
          panel
            .querySelector('.newspaper')
            .animate(
              [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(0)' },
              ],
              { duration: 220 },
            );
        return;
      }
      sound.play('press');
      sound.play('success');
      finishChapter(state);
      remember();
      el('print-button').disabled = true;
      panel.querySelector('.newspaper').classList.add('printing');
      el('feedback').textContent = 'Mực đã lên trang. Bản tin được đối chiếu!';
      think('Bản in đã đúng. Giờ xem câu chuyện phía sau trang báo.');
      // Animation cannot trap navigation or progress: closing/reopening remains safe.
      const page = state.chapter;
      setTimeout(
        () => {
          if (panel.open && state.chapter === page && el('print-button')) showCompletion();
        },
        matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 950,
      );
    },
  });
  const actions = el('panel-body').querySelector('.actions');
  actions.classList.add('panel-actions');
  panel.append(actions);
}

function showCompletion() {
  const chapter = chapters[state.chapter];
  openPanel(
    'Bản tin đã hoàn thành',
    `BẢN TIN ${chapter.number}`,
    `<div class="story-frame"><span class="stamp">ĐÃ ĐỐI CHIẾU</span><h3>${escape(chapter.title)}</h3><p>${escape(chapter.summary)}</p><button id="watch-button">Mở câu chuyện</button></div>`,
  );
  el('watch-button').addEventListener('click', () => {
    openPanel(
      chapter.title,
      'CÂU CHUYỆN PHÍA SAU BẢN TIN',
      `${chapter.video ? `<video controls playsinline preload="metadata" ${chapter.poster ? `poster="${escape(chapter.poster)}"` : ''}><source src="${escape(chapter.video)}" type="video/mp4"></video><p id="video-status" role="status"></p>` : ''}<section class="reply"><span class="eyebrow">HỒI ÂM GỬI ${escape(chapter.letter.name.toUpperCase())} · HƯ CẤU</span><p>${escape(chapter.letter.reply)}</p></section>${readerAfterMarkup(chapter)}<section class="impact"><span class="eyebrow">BẢN TIN NÀY ĐÃ GIÚP GÌ</span><p class="impact-lead">${escape(chapter.impact)}</p>${sourceLink(chapter.impactSource)}</section><p>${escape(chapter.summary)}</p>${sourceLink(chapter.source)}<button id="next-button">${state.chapter === chapters.length - 1 ? 'Xuất bản trang báo' : 'Trở về phòng, mở bản tin tiếp theo'}</button>`,
    );
    panel.querySelector('video')?.addEventListener('error', () => {
      el('video-status').textContent =
        'Video chưa tải được. Bạn vẫn có thể đọc phần tổng kết và tiếp tục.';
    });
    el('next-button').addEventListener('click', () => {
      if (advanceChapter(state)) {
        remember();
        panel.addEventListener('close', startChapter, { once: true });
        closePanel();
      } else showFinal();
    });
  });
}
function showFinal() {
  openPanel(
    'Giữ tiếng nói',
    'TRANG BÁO HỌC TẬP ĐÃ HOÀN THÀNH',
    `<div class="final-page"><div class="paper-name">DÂN-CHÚNG</div><div class="paper-issue">HỒ SƠ HỌC TẬP · PHỤC DỰNG TƯƠNG TÁC</div>${chapters.map((chapter) => `<article><span class="eyebrow">${chapter.number}</span><h4>${escape(chapter.title)}</h4><p>${escape(chapter.impact)}</p></article>`).join('')}<section class="epilogue"><span class="eyebrow">SAU TRANG BÁO CUỐI</span><p>${escape(epilogue.text)}</p>${sourceLink(epilogue.source)}</section><blockquote class="final-quote">Nguyễn Ái Quốc nhận xét Dân Chúng là tờ báo đầu tiên ra không xin phép trước, và có lẽ là tờ được đọc nhiều nhất ở Đông Dương.<cite>Diễn ý theo tư liệu của Thành ủy TP. Hồ Chí Minh</cite></blockquote></div>${sourceLink('cityParty')}${sourceLink('museum')}<button id="restart-button" class="secondary">Chơi lại từ đầu</button>`,
  );
  el('restart-button').insertAdjacentHTML(
    'beforebegin',
    '<button id="explore-stories">Trở lại phòng, nghe những chuyện còn lại</button>',
  );
  el('explore-stories').addEventListener('click', closePanel);
  el('restart-button').addEventListener('click', () => {
    resetProgress();
    closePanel();
    moveTo('desk');
    think('Mình bắt đầu một trang báo mới.');
  });
  panel
    .querySelector('.final-page')
    .insertAdjacentHTML(
      'afterend',
      `<section class="reader-endings"><span class="eyebrow">NHỮNG NGƯỜI TỪNG CHỜ BÁO · HƯ CẤU</span>${chapters.map((chapter) => readerAfterMarkup(chapter, true)).join('')}</section>`,
    );
}
function resetProgress() {
  state = freshState();
  drafts = {};
  applyOpening();
  sideStoriesUI.reset();
  knowledgeUI.reset();
  remember();
  try {
    localStorage.removeItem(lettersKey);
    localStorage.removeItem(draftsKey);
  } catch {}
}
function moveTo(id, immediate = false) {
  station = id;
  engine?.goTo(id, immediate);
  if (el('leave-closeup')) el('leave-closeup').hidden = true;
  el('station-buttons')
    .querySelectorAll('button')
    .forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.station === id)),
    );
  clearTimeout(captionTimer);
  el('station-caption').querySelector('b').textContent = stations[id].label;
  el('station-caption').classList.add('visible');
  captionTimer = setTimeout(() => el('station-caption').classList.remove('visible'), 1500);
}
const stationLabels = { desk: 'Biên tập', shelf: 'Tư liệu', press: 'Bản in' };
el('station-buttons').innerHTML = Object.entries(stations)
  .map(
    ([id], i) =>
      `<button data-station="${id}" data-key="${i + 1}" aria-label="${i + 1}. ${stations[id].label}" title="${stations[id].label}" aria-pressed="${id === station}">${stationLabels[id] || stations[id].label}</button>`,
  )
  .join('');
el('station-buttons')
  .querySelectorAll('button')
  .forEach((button) => button.addEventListener('click', () => moveTo(button.dataset.station)));
el('notebook-button').addEventListener('click', showNotebook);
el('objects-button').addEventListener('click', showObjects);
el('station-buttons').insertAdjacentHTML(
  'beforebegin',
  `<button id="leave-closeup" class="light-button" hidden>${icons.chevronLeft}Trở ra</button>`,
);
function leaveCloseUp() {
  el('leave-closeup').hidden = true;
  engine?.returnFromInspection();
}
el('leave-closeup').addEventListener('click', leaveCloseUp);
el('edit-button').addEventListener('click', editChapter);
let engineError = null;
try {
  const [{ createEngine }] = await Promise.all([import('./scene/engine.js'), fontsReady]);
  let hoverTooltipSize = { width: 0, height: 0 };
  engine = await createEngine(
    el('viewport'),
    (id) => {
      if (panel.open) return;
      const reason = lockReason(id);
      if (reason) {
        think(reason);
        el('leave-closeup').hidden = false;
        return;
      }
      if (knowledgeUI.has(id)) {
        knowledgeUI.open(id);
        return;
      }
      if (sideStoriesUI.has(id)) {
        sideStoriesUI.open(id);
        return;
      }
      if (activateProp(id)) return;
      id === 'board' ? editChapter() : inspect(id);
    },
    (id, point) => {
      const label = el('hover-label'),
        object = [...objects, ...roomProps, ...sideStories, ...pressKnowledge].find(
          (object) => object.id === id,
        );
      const text = id === 'board' ? 'Biên tập bản tin' : object?.label || '';
      const locked = id ? lockReason(id) : '';
      if (label.dataset.target !== `${id}:${locked}`) {
        label.dataset.target = `${id}:${locked}`;
        label.innerHTML = text
          ? `<i aria-hidden="true"></i><div class="hover-tooltip"><span>${escape(text)}</span><small>${locked ? escape(locked.split('.')[0]) : knowledgeUI.has(id) ? 'Bấm để khám phá hồ sơ' : sideStoriesUI.has(id) ? 'Bấm để mở chuyện phụ' : roomProps.some((prop) => prop.id === id) ? 'Bấm để tương tác' : 'Bấm để xem gần'}</small></div>`
          : '';
        const tooltip = label.querySelector('.hover-tooltip');
        hoverTooltipSize = { width: tooltip?.offsetWidth || 0, height: tooltip?.offsetHeight || 0 };
      }
      label.classList.toggle('visible', !!text);
      if (point) {
        label.style.left = `${point.x}px`;
        label.style.top = `${point.y}px`;
        const { width, height } = hoverTooltipSize;
        const x = point.x + 18 + width > innerWidth - 8 ? point.x - width - 18 : point.x + 18;
        const y = point.y + 20 + height > innerHeight - 8 ? point.y - height - 20 : point.y + 20;
        label.style.setProperty(
          '--tooltip-x',
          `${Math.max(8, Math.min(innerWidth - width - 8, x)) - point.x}px`,
        );
        label.style.setProperty(
          '--tooltip-y',
          `${Math.max(8, Math.min(innerHeight - height - 8, y)) - point.y}px`,
        );
      }
      if (engine) engine.canvas.style.cursor = !id ? 'grab' : locked ? 'default' : 'pointer';
    },
    graphicsUI.settings,
  );
  engine.setGraphics(graphicsUI.settings);
  engine.setEffects(effectsEnabled);
} catch (error) {
  el('viewport').innerHTML =
    '<div class="webgl-fallback"><h2>Trình duyệt chưa mở được cảnh 3D</h2><p>Bạn vẫn có thể đổi vị trí, mở danh sách đồ vật và chơi các bản tin bằng các nút trên màn hình.</p></div>';
  engineError = error;
  console.error('Không khởi tạo được WebGL:', error);
}
const handleKey = (event) => {
  if (
    panel.open ||
    el('intro').open ||
    el('graphics-settings').open ||
    ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)
  )
    return;
  if (event.key === 'Escape' && !el('leave-closeup').hidden) {
    leaveCloseUp();
    return;
  }
  const id = Object.keys(stations)[Number(event.key) - 1];
  if (id) moveTo(id);
};
document.addEventListener('keydown', handleKey);
let entering = false,
  entryDisposed = false;
refreshHUD();
think('');
engine?.setPaused(true);
// Credits and loading run together; a failed or slow load offers retry instead of a black room.
await boot.ready(engine, engineError, sound, {
  hasProgress:
    state.evidence.length > 0 ||
    state.completed.length > 0 ||
    lettersRead().length > 0 ||
    Object.keys(drafts).length > 0,
  onNewGame: resetProgress,
});
el('intro').showModal();
motion.revealIntro(el('intro'));
syncSound();
async function enterRoom() {
  if (entering) return;
  entering = true;
  el('start-button').disabled = true;
  el('intro').classList.add('entering');
  el('intro').insertAdjacentHTML(
    'beforeend',
    '<p class="entry-caption" role="status">Bước vào phòng biên tập…<small>Esc để bỏ qua</small></p>',
  );
  await sound.play('door', {
    wait: true,
    onDuration: (duration) => engine?.beginEntrance(duration),
  });
  if (!entryDisposed) {
    engine?.finishEntrance();
    motion.closeDialog(el('intro'));
  }
}
el('start-button').addEventListener('click', enterRoom);
el('intro').addEventListener('cancel', (event) => {
  event.preventDefault();
  if (entering) {
    sound.stop('door');
    engine?.finishEntrance();
    motion.closeDialog(el('intro'));
  } else enterRoom();
});
el('intro').addEventListener('close', () => {
  sound.stopIntro();
  engine?.setPaused(false);
  sound.startAmbient();
  motion.start();
  startChapter();
});
if (import.meta.hot)
  import.meta.hot.dispose(() => {
    entryDisposed = true;
    boot.dispose();
    graphicsUI.dispose();
    cancelAnimationFrame(popupFrame);
    clearTimeout(thoughtTimer);
    clearTimeout(thoughtTypeTimer);
    clearTimeout(toastTimer);
    clearTimeout(captionTimer);
    sound.dispose();
    motion.dispose();
    engine?.dispose();
    document.removeEventListener('keydown', handleKey);
    root.removeEventListener('soundchange', syncSound);
  });
