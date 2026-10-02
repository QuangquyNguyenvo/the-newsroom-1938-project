import { icons } from './icons.js';
import {
  graphicsManualKey,
  graphicsPresets,
  presetForTier,
  presetGraphics,
  presetOrder,
  tierForRenderer,
  normalizeGraphics,
  loadGraphics,
  saveGraphics,
} from '../scene/graphics.js';

export function createGraphicsSettings(root, getEngine, onAtmosphere) {
  let storage;
  try {
    storage = localStorage;
  } catch {}
  // Ask the browser which GPU draws WebGL before choosing how heavy the room starts.
  let renderer = '';
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    const info = gl?.getExtension('WEBGL_debug_renderer_info');
    renderer = String(gl?.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {}
  const tier = tierForRenderer(renderer),
    compact = matchMedia('(max-width:700px)').matches;
  let manual = false;
  try {
    manual = storage?.getItem(graphicsManualKey) === '1';
  } catch {}
  const chosen = () => {
    manual = true;
    try {
      storage?.setItem(graphicsManualKey, '1');
    } catch {}
  };
  let startedLight,
    settings = loadGraphics(storage, compact, tier),
    returnFocus,
    announcement;
  // Model detail is chosen when the room is built, so remember which side we started on.
  startedLight = settings.lighting !== 'full';
  const icon =
    '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 9h22M5 16h22M5 23h22"/><circle cx="12" cy="9" r="3"/><circle cx="22" cy="16" r="3"/><circle cx="10" cy="23" r="3"/></svg>';
  root
    .querySelector('#sound-button')
    .insertAdjacentHTML(
      'beforebegin',
      `<button id="graphics-button" class="light-button" aria-label="Cài đặt đồ hoạ" title="Cài đặt đồ hoạ" aria-haspopup="dialog">${icon}</button>`,
    );
  root.querySelector('.game-shell').insertAdjacentHTML(
    'beforeend',
    `<dialog id="graphics-settings" aria-labelledby="graphics-title">
    <div class="graphics-sheet"><header><div><span class="eyebrow">ÁNH SÁNG & HÌNH ẢNH</span><h2 id="graphics-title">Đồ hoạ</h2></div><button type="button" id="graphics-close" aria-label="Đóng cài đặt đồ hoạ">${icons.close}</button></header>
    <div class="graphics-content"><p class="graphics-deck">Chọn cách căn phòng hiện lên. Thay đổi ngay để xem ánh sáng phía sau.</p>
    <div class="graphics-presets" role="group" aria-label="Chế độ đồ hoạ">${Object.entries(
      graphicsPresets,
    )
      .map(
        ([id, preset]) =>
          `<button type="button" data-preset="${id}" aria-pressed="false"><b>${preset.label}</b><span>${preset.note}</span></button>`,
      )
      .join('')}</div>
    <p id="graphics-summary"></p>
    <details class="graphics-help"><summary>Game bị giật, lag?</summary><div>
      <p class="graphics-gpu"></p>
      <ol>
        <li><b>Hạ mức đồ họa</b> xuống “Cân bằng” hoặc “Nhẹ” ở trên. Game cũng tự hạ khi thấy máy dựng hình chậm.</li>
        <li><b>Bật tăng tốc phần cứng của trình duyệt.</b> Chrome, Edge, Cốc Cốc: Cài đặt → Hệ thống → bật “Sử dụng chế độ tăng tốc đồ họa khi có thể” → Khởi chạy lại. Firefox: Cài đặt → Chung → Hiệu suất → bật “Dùng tăng tốc phần cứng khi có thể”.</li>
        <li><b>Laptop có hai card đồ họa:</b> Windows → Cài đặt → Hệ thống → Màn hình → Đồ họa → chọn trình duyệt → “Hiệu suất cao”, rồi mở lại trình duyệt.</li>
        <li>Cắm sạc, tắt chế độ tiết kiệm pin và đóng bớt các thẻ khác.</li>
      </ol>
    </div></details>
    <details class="graphics-advanced"><summary>Tuỳ chỉnh từng hiệu ứng</summary><div>
      <label class="graphics-select"><span>Độ nét khung hình<small>Tăng độ nét sẽ dựng nhiều điểm ảnh hơn.</small></span><select data-graphics="resolution"><option value="0.75">75%</option><option value="1">100%</option><option value="1.25">125%</option></select></label>
      <label class="graphics-select"><span>Bóng đổ<small>Bóng của cửa chớp, bàn và đồ vật.</small></span><select data-graphics="shadows"><option value="0">Tắt</option><option value="1024">Vừa</option><option value="2048">Cao</option><option value="4096">Rất cao</option></select></label>
      <label class="graphics-select"><span>Ánh sáng và vật liệu<small>“Bớt đèn phụ” hợp với máy không có card rời. “Đơn giản” bỏ bóng bẩy và hậu kỳ, đứng yên góc nhìn; nhẹ nhất cho máy chạy bằng CPU.</small></span><select data-graphics="lighting"><option value="full">Đầy đủ</option><option value="reduced">Bớt đèn phụ</option><option value="simple">Đơn giản</option></select></label>
      <label class="graphics-select"><span>Bóng tiếp xúc<small>Thêm chiều sâu ở góc phòng và kẽ đồ vật.</small></span><select data-graphics="ao"><option value="off">Tắt</option><option value="medium">Vừa</option><option value="high">Cao</option></select></label>
      <label class="graphics-toggle"><span>Quầng sáng<small>Làm mềm vùng nắng và ánh đèn.</small></span><input type="checkbox" data-graphics="bloom"></label>
      <label class="graphics-toggle"><span>Độ sâu trường ảnh<small>Tuỳ chọn làm mềm nhẹ hậu cảnh. Tắt để nhìn rõ toàn phòng.</small></span><input type="checkbox" data-graphics="dof"></label>
      <label class="graphics-toggle"><span>Bụi trong nắng<small>Chuyển động nhẹ trong căn phòng.</small></span><input type="checkbox" data-graphics="atmosphere"></label>
      <label class="graphics-range"><span>Sắc màu điện ảnh<output data-output="film"></output></span><input type="range" min="0" max="100" step="5" data-graphics="film"></label>
      <label class="graphics-range"><span>Độ sáng<output data-output="exposure"></output></span><input type="range" min="80" max="125" step="5" data-graphics="exposure"></label>
    </div></details></div>
    <footer><p id="graphics-status" role="status" aria-atomic="true">Cài đặt tự lưu cho lần chơi sau.</p><div><button type="button" id="graphics-reset" class="secondary">Mặc định</button><button type="button" id="graphics-return">Trở lại phòng</button></div></footer></div>
  </dialog>`,
  );
  const dialog = root.querySelector('#graphics-settings'),
    button = root.querySelector('#graphics-button');
  function sync() {
    dialog
      .querySelectorAll('[data-preset]')
      .forEach((el) =>
        el.setAttribute('aria-pressed', String(el.dataset.preset === settings.preset)),
      );
    dialog.querySelectorAll('[data-graphics]').forEach((el) => {
      const value = settings[el.dataset.graphics];
      if (el.type === 'checkbox') el.checked = value;
      else el.value = String(el.type === 'range' ? Math.round(value * 100) : value);
    });
    for (const key of ['film', 'exposure'])
      dialog.querySelector(`[data-output="${key}"]`).value = `${Math.round(settings[key] * 100)}%`;
    root.dataset.graphics = settings.preset;
    root.dataset.lighting = settings.lighting;
    dialog.querySelector('#graphics-summary').textContent =
      settings.preset === 'custom'
        ? 'Tuỳ chỉnh của bạn'
        : `${graphicsPresets[settings.preset].label} · ${graphicsPresets[settings.preset].note}`;
  }
  function apply(next) {
    settings = normalizeGraphics(next);
    getEngine()?.setGraphics(settings);
    onAtmosphere(settings.atmosphere);
    sync();
    const saved = saveGraphics(storage, settings);
    clearTimeout(announcement);
    announcement = setTimeout(() => {
      dialog.querySelector('#graphics-status').textContent =
        (saved ? 'Đã áp dụng và lưu cài đặt.' : 'Đã áp dụng cho lần chơi này.') +
        ((settings.lighting !== 'full') !== startedLight
          ? ' Độ chi tiết mô hình sẽ đổi sau khi tải lại trang.'
          : '');
    }, 250);
  }
  dialog.querySelectorAll('[data-preset]').forEach((el) =>
    el.addEventListener('click', () => {
      chosen();
      apply(presetGraphics(el.dataset.preset));
    }),
  );
  dialog.querySelector('.graphics-gpu').textContent =
    tier === 'software'
      ? `Trình duyệt đang dựng hình bằng CPU (${renderer}). Đây là nguyên nhân chính gây giật: hãy làm bước 2.`
      : `Card đồ họa trình duyệt đang dùng: ${renderer || 'không đọc được'}.`;
  // A struggling GPU steps the preset down by itself, unless the player chose a level.
  const slowFrames = () => {
    const index = presetOrder.indexOf(settings.preset);
    if (manual || index < 1) return;
    apply(presetGraphics(presetOrder[index - 1]));
    root.dispatchEvent(
      new CustomEvent('graphicsnotice', {
        detail: `Máy đang dựng hình chậm nên đồ họa đã hạ xuống mức “${graphicsPresets[settings.preset].label}”. Muốn đổi lại, mở cài đặt đồ họa.`,
      }),
    );
  };
  root.querySelector('#viewport')?.addEventListener('slowframes', slowFrames);
  dialog.querySelectorAll('[data-graphics]').forEach((el) =>
    el.addEventListener(el.type === 'range' ? 'input' : 'change', () => {
      const key = el.dataset.graphics,
        value =
          el.type === 'checkbox'
            ? el.checked
            : el.type === 'range'
              ? Number(el.value) / 100
              : key === 'ao' || key === 'lighting'
                ? el.value
                : Number(el.value);
      chosen();
      apply({ ...settings, preset: 'custom', [key]: value });
    }),
  );
  const close = () => dialog.close();
  const open = (help = false) => {
    returnFocus = document.activeElement;
    sync();
    if (help === true) dialog.querySelector('.graphics-help').open = true;
    dialog.showModal();
    dialog.querySelector('#graphics-close').focus();
  };
  button.addEventListener('click', () => open());
  root
    .querySelectorAll('[data-open-graphics]')
    .forEach((el) => el.addEventListener('click', () => open()));
  dialog.querySelector('#graphics-close').addEventListener('click', close);
  dialog.querySelector('#graphics-return').addEventListener('click', close);
  dialog.addEventListener('close', () => returnFocus?.focus());
  dialog
    .querySelector('#graphics-reset')
    .addEventListener('click', () => apply(presetGraphics(presetForTier(tier, compact))));
  sync();
  return {
    get settings() {
      return settings;
    },
    tier,
    open,
    setAtmosphere(value) {
      settings = { ...settings, preset: 'custom', atmosphere: value };
      saveGraphics(storage, settings);
      sync();
    },
    dispose() {
      clearTimeout(announcement);
      dialog.remove();
      button.remove();
    },
  };
}
