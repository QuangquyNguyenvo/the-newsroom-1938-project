import { gsap } from 'gsap';
import { getAssetProgress } from '../scene/loading.js';

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

export function bootMarkup() {
  return `<section id="boot" class="boot" aria-live="polite">
    <div class="boot-reel" aria-hidden="true"><img src="/assets/references/dan-chung.jpg" alt=""><div class="boot-light"></div><div class="boot-ink">DÂN CHÚNG<br>1938 · 1939</div></div>
    <div class="boot-grain" aria-hidden="true"></div>
    <div class="boot-lobby"><div class="boot-lobby-meta"><span class="boot-kicker">SÀI GÒN · 1938</span><span>HỒ SƠ BIÊN TẬP · 01</span></div><h1 class="boot-title">GIỮ<br><em>TIẾNG NÓI</em></h1><p>Một trang báo có thể đưa lời của ai đi xa?</p><span class="boot-fiction">Trò chơi lịch sử Đảng · Câu chuyện mô phỏng</span><span class="boot-lobby-rule" aria-hidden="true"></span></div>
    <div class="boot-stage">
      <div class="boot-card" data-card="prelude"><span class="boot-kicker">MỘT LÁ THƯ TỚI TÒA SOẠN</span><p class="boot-quote">${'Báo các anh có nói chuyện của người như tôi không?'
        .split(' ')
        .map((word) => `<span>${word}</span>`)
        .join(' ')}</p><p class="boot-small">Út ghi hộ lời chị Tư · Nhân vật hư cấu</p></div>
      <div class="boot-card" data-card="team"><span class="boot-kicker">${credits.team}</span><p class="boot-small">trân trọng giới thiệu</p></div>
      <div class="boot-card" data-card="members"><span class="boot-kicker">THỰC HIỆN</span><ul>${credits.members.map(([id, name]) => `<li><b>${name}</b><span>${id}</span></li>`).join('')}</ul></div>
      <div class="boot-card" data-card="title"><p class="boot-place">Sài Gòn, 1938</p><h1 class="boot-title">GIỮ TIẾNG NÓI</h1><span class="boot-rule"></span><p class="boot-small">Một trò chơi về báo chí cách mạng của Đảng, 1936 đến 1939</p></div>
    </div>
    <div class="boot-foot">
      <div class="boot-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Tiến độ tải"><i></i></div>
      <p class="boot-status">Đang dựng căn phòng biên tập…</p>
      <div class="boot-actions"></div>
      <div class="boot-controls"><button id="boot-sound" type="button" aria-pressed="true">Âm thanh: bật</button><button type="button" data-open-graphics aria-haspopup="dialog">Đồ họa</button><button id="boot-skip" type="button" hidden>Bỏ qua mở đầu</button></div>
    </div>
  </section>`;
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
  gsap.set(cards, { autoAlpha: 0 });
  if (!reduced) {
    timeline
      .addLabel('letter', 0)
      .to(
        element.querySelector('.boot-reel'),
        { scale: 1.1, xPercent: -3, duration: 13, ease: 'none' },
        0,
      )
      .fromTo(
        element.querySelector('.boot-light'),
        { xPercent: -130 },
        { xPercent: 160, duration: 13, ease: 'none' },
        0,
      )
      .fromTo(cards[0], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 'letter')
      .fromTo(
        cards[0].querySelectorAll('.boot-quote span'),
        { opacity: 0, y: 5 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 },
        0.5,
      )
      .call(() => sound?.play('paper', { volume: 0.24 }), [], 0.1)
      .call(() => sound?.tick('type'), [], 0.7)
      .call(() => sound?.tick('type'), [], 1.1)
      .call(() => sound?.tick('type'), [], 1.5)
      .to(cards[0], { autoAlpha: 0, y: -10, duration: 0.5 }, 3.7)
      .addLabel('team', 4.2)
      .fromTo(cards[1], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 'team')
      .to(cards[1], { autoAlpha: 0, duration: 0.4 }, 5.7)
      .fromTo(cards[2], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 6.2)
      .from(
        cards[2].querySelectorAll('li'),
        { opacity: 0, x: -12, duration: 0.5, stagger: 0.17 },
        6.3,
      )
      .to(cards[2], { autoAlpha: 0, duration: 0.5 }, 9.6)
      .addLabel('title', 10.2)
      .fromTo(cards[3], { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 'title')
      .from(
        cards[3].querySelector('.boot-title'),
        { scale: 1.12, duration: 1.4, ease: 'power3.out' },
        'title',
      )
      .from(cards[3].querySelector('.boot-rule'), { scaleX: 0, duration: 0.8 }, 10.7)
      .call(() => sound?.play('press', { volume: 0.12 }), [], 10.2)
      .call(() => sound?.play('record', { volume: 0.12 }), [], 11.4);
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
    async ready(engine, error, audio) {
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
      await choose('Một câu chuyện đang chờ bạn.', [['Bắt đầu câu chuyện', 'start', true]], () => {
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
