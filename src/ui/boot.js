import { gsap } from 'gsap';
import { getAssetProgress } from '../scene/loading.js';
import { chapters } from '../content/chapters.js';

// A player gesture starts the opening and sound while asset loading continues.
// Failed WebGL or assets expose a retry action instead of trapping a black screen.
export const credits = {
  team: 'NHÓM 10',
  members: [
    ['25110055', 'Nguyễn Võ Quang Quý'],
    ['25110042', 'Đào Nghiệm Minh'],
    ['23116037', 'Lê Minh Triết'],
    ['23116034', 'Nguyễn Thị Hồng Thắm'],
    ['23116003', 'Trần Nguyễn Trọng Bảo'],
  ],
};

// The opening is one sheet of newsprint: the masthead stays, the body turns from the
// front page to the credits and ends on the reader letter that starts the game.
export function bootMarkup() {
  return `<section id="boot" class="boot" aria-live="polite">
    <div class="boot-sheet">
      <header class="boot-masthead">
        <h1 class="boot-title">GIỮ TIẾNG NÓI</h1>
        <p class="boot-motto">Một trang báo có thể đưa lời của ai đi xa?</p>
        <div class="boot-issue"><span>Sài Gòn, 1938</span><span>Trò chơi Lịch sử Đảng</span><span>${credits.team}</span></div>
      </header>
      <div class="boot-body">
        <div class="boot-lobby">
          <div class="boot-contents"><p class="boot-kicker">Ba bản tin trong số này</p><ol>${chapters.map((chapter) => `<li><span>${chapter.number}</span><b>${chapter.title}</b></li>`).join('')}</ol></div>
          <div class="boot-lead"><h2>Vào vai người biên tập một tờ báo cách mạng</h2><p>Tìm tư liệu trong tòa soạn, chọn từng lời cho bản tin và đối chiếu nguồn trước khi đưa in.</p><p class="boot-fiction">Nhân vật và lời thư trong trò chơi là hư cấu. Sự kiện lịch sử có dẫn nguồn để đối chiếu.</p></div>
        </div>
        <div class="boot-stage">
          <div class="boot-card" data-card="team"><p class="boot-kicker">${credits.team}</p><p class="boot-small">trân trọng giới thiệu</p></div>
          <div class="boot-card" data-card="members"><p class="boot-kicker">Thực hiện</p><ul>${credits.members.map(([id, name]) => `<li><b>${name}</b><span>${id}</span></li>`).join('')}</ul></div>
          <div class="boot-card" data-card="prelude"><p class="boot-kicker">Một lá thư tới tòa soạn</p><p class="boot-quote"></p><p class="boot-small"></p></div>
        </div>
      </div>
      <div class="boot-foot">
        <div class="boot-progress"><div class="boot-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Tiến độ tải"><i></i></div><p class="boot-status">Đang dựng căn phòng biên tập…</p></div>
        <div class="boot-actions"></div>
        <div class="boot-controls"><button id="boot-sound" type="button" aria-pressed="true">Âm thanh: bật</button><button type="button" data-open-graphics aria-haspopup="dialog">Đồ họa</button><button id="boot-skip" type="button" hidden>Bỏ qua mở đầu</button></div>
      </div>
    </div>
  </section>`;
}

// The letter on the last card follows the chapter the player is in.
export function setBootReader(element, key, reader) {
  if (!element) return;
  const quote = element.querySelector('.boot-quote');
  quote.dataset.reader = key;
  quote.innerHTML = reader.question
    .split(' ')
    .map((word, index) => `<span style="--i:${index}">${word}</span>`)
    .join(' ');
  element.querySelector('[data-card="prelude"] .boot-small').textContent =
    `${reader.signature} · Nhân vật hư cấu`;
}

export function startBoot(element) {
  const bar = element.querySelector('.boot-bar'),
    fill = bar.querySelector('i'),
    status = element.querySelector('.boot-status'),
    actions = element.querySelector('.boot-actions');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [...element.querySelectorAll('.boot-card')];
  let sound,
    disposed = false,
    started = false,
    resolveCredits;
  const creditsDone = new Promise((resolve) => {
    resolveCredits = resolve;
  });
  const timeline = gsap.timeline({
    paused: true,
    defaults: { ease: 'power2.out' },
    onComplete: () => resolveCredits(),
  });
  const [team, members, letter] = cards;
  gsap.set(cards, { autoAlpha: 0 });
  if (!reduced) {
    timeline
      .fromTo(team, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.2)
      .to(team, { autoAlpha: 0, duration: 0.4 }, 2)
      .fromTo(members, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 2.5)
      .from(members.querySelectorAll('li'), { opacity: 0, y: 8, duration: 0.5, stagger: 0.17 }, 2.6)
      .call(() => sound?.play('press', { volume: 0.12 }), [], 2.5)
      .to(members, { autoAlpha: 0, duration: 0.5 }, 6.4)
      .addLabel('letter', 7)
      .fromTo(letter, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 'letter')
      .call(() => letter.classList.add('revealed'), [], 7.5)
      .call(() => sound?.play('paper', { volume: 0.24 }), [], 7.1)
      .call(() => sound?.tick('type'), [], 7.7)
      .call(() => sound?.tick('type'), [], 8.1)
      .call(() => sound?.tick('type'), [], 8.5)
      .call(() => sound?.play('record', { volume: 0.12 }), [], 9.2)
      .to({}, { duration: 0.6 }, 9.4);
  }
  const skip = () => {
    if (!started) return;
    timeline.progress(1, true).pause();
    gsap.set(cards, { autoAlpha: 0 });
    gsap.set(cards.at(-1), { autoAlpha: 1 });
    resolveCredits();
  };
  element.querySelector('#boot-skip').addEventListener('click', skip);
  const skipKey = (event) => {
    if (
      event.key === 'Escape' &&
      started &&
      element.isConnected &&
      !document.querySelector('#graphics-settings[open]')
    ) {
      event.preventDefault();
      skip();
    }
  };
  document.addEventListener('keydown', skipKey);

  let progress = 0,
    poll;
  const setProgress = (value) => {
    progress = Math.max(progress, value);
    fill.style.transform = `scaleX(${progress / 100})`;
    bar.setAttribute('aria-valuenow', String(Math.round(progress)));
  };
  function waitForAssets() {
    return new Promise((resolve) => {
      const began = performance.now();
      let idleSince = 0;
      poll = setInterval(() => {
        const { active, loaded, total, errors } = getAssetProgress();
        if (total) setProgress((loaded / total) * 100);
        status.textContent = total
          ? `Đang dựng căn phòng… ${Math.round(progress)}%`
          : 'Đang dựng căn phòng biên tập…';
        if (!active && loaded >= total) {
          idleSince ||= performance.now();
          if (performance.now() - idleSince > 400) {
            clearInterval(poll);
            resolve({ errors: errors.length, timedOut: false });
          }
        } else idleSince = 0;
        if (performance.now() - began > 60000) {
          clearInterval(poll);
          resolve({ errors: errors.length, timedOut: true });
        }
      }, 120);
    });
  }
  function choose(message, buttons, onChoose = () => {}) {
    status.textContent = message;
    actions.innerHTML = '';
    return new Promise((resolve) => {
      for (const [label, value, primary] of buttons) {
        const button = document.createElement('button');
        button.textContent = label;
        if (!primary) button.className = 'secondary';
        button.addEventListener(
          'click',
          () => {
            onChoose(value);
            resolve(value);
          },
          { once: true },
        );
        actions.append(button);
      }
      actions.querySelector('button')?.focus();
    });
  }
  async function leave() {
    clearInterval(poll);
    timeline.kill();
    document.removeEventListener('keydown', skipKey);
    if (!reduced) await gsap.to(element, { autoAlpha: 0, duration: 0.6, ease: 'power1.in' });
    element.remove();
  }
  return {
    // engine is null when WebGL failed. Resolves once the player moves on.
    // A returning player chooses between the saved newspaper and a fresh one.
    async ready(engine, error, audio, { hasProgress = false, onNewGame } = {}) {
      sound = audio;
      const soundButton = element.querySelector('#boot-sound');
      const soundLabel = () => {
        soundButton.textContent = sound?.muted ? 'Âm thanh: tắt' : 'Âm thanh: bật';
        soundButton.setAttribute('aria-pressed', String(!sound?.muted));
      };
      soundLabel();
      soundButton.addEventListener('click', () => {
        sound?.toggle();
        soundLabel();
      });
      if (error) {
        setProgress(100);
        bar.classList.add('failed');
        // The game needs the 3D room: the only way forward is a reload.
        await choose(
          'Chưa mở được căn phòng 3D. Tải lại trang để thử lần nữa. Nếu vẫn lỗi, hãy bật tăng tốc phần cứng trong trình duyệt.',
          [['Tải lại trang', 'retry', true]],
        );
        location.reload();
        return new Promise(() => {});
      }
      const assets = waitForAssets();
      const opening = hasProgress
        ? [
            'Trang báo của bạn còn dang dở.',
            [
              ['Tiếp tục', 'continue', true],
              ['Chơi mới (xóa tiến độ cũ)', 'new'],
            ],
          ]
        : ['Một câu chuyện đang chờ bạn.', [['Bắt đầu câu chuyện', 'start', true]]];
      await choose(...opening, (value) => {
        if (value === 'new') onNewGame?.();
        started = true;
        element.classList.add('started');
        element.querySelector('.boot-lobby').hidden = true;
        actions.innerHTML = '';
        element.querySelector('#boot-skip').hidden = false;
        element.querySelector('#boot-skip').focus();
        sound?.startIntro();
        if (reduced) {
          gsap.set(cards.at(-1), { autoAlpha: 1 });
          resolveCredits();
        } else timeline.play();
      });
      const result = await assets;
      setProgress(100);
      await creditsDone;
      if (disposed) return;
      element.querySelector('#boot-skip').hidden = true;
      if (result.errors || result.timedOut) {
        await choose(
          result.timedOut
            ? 'Mạng chậm, căn phòng chưa tải xong.'
            : 'Một vài đồ vật trong phòng chưa tải được.',
          [['Tải lại trang', 'retry', true]],
        );
        location.reload();
        return new Promise(() => {});
      } else
        await choose('Một lá thư. Một bản tin còn thiếu.', [['Nhận lá thư', 'go', true]], () =>
          sound?.play('paper', { volume: 0.2 }),
        );
      engine?.refresh();
      return leave();
    },
    dispose() {
      disposed = true;
      clearInterval(poll);
      timeline.kill();
      resolveCredits();
      document.removeEventListener('keydown', skipKey);
    },
  };
}
