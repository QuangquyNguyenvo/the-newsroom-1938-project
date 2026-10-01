import {
  graphicsPresets,
  presetGraphics,
  normalizeGraphics,
  loadGraphics,
  saveGraphics,
} from '../scene/graphics.js';

export function createGraphicsSettings(root, getEngine, onAtmosphere) {
  let storage;
  try {
    storage = localStorage;
  } catch {}
  let settings = loadGraphics(storage, matchMedia('(max-width:700px)').matches),
    returnFocus,
    announcement;
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
    <div class="graphics-sheet"><header><div><span class="eyebrow">ÁNH SÁNG & HÌNH ẢNH</span><h2 id="graphics-title">Đồ hoạ</h2></div><button type="button" id="graphics-close" aria-label="Đóng cài đặt đồ hoạ">×</button></header>
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
    <details class="graphics-advanced"><summary>Tuỳ chỉnh từng hiệu ứng</summary><div>
      <label class="graphics-select"><span>Độ nét khung hình<small>Tăng độ nét sẽ dựng nhiều điểm ảnh hơn.</small></span><select data-graphics="resolution"><option value="0.75">75%</option><option value="1">100%</option><option value="1.25">125%</option></select></label>
      <label class="graphics-select"><span>Bóng đổ<small>Bóng của cửa chớp, bàn và đồ vật.</small></span><select data-graphics="shadows"><option value="0">Tắt</option><option value="1024">Vừa</option><option value="2048">Cao</option><option value="4096">Rất cao</option></select></label>
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
      dialog.querySelector('#graphics-status').textContent = saved
        ? 'Đã áp dụng và lưu cài đặt.'
        : 'Đã áp dụng cho lần chơi này.';
    }, 250);
  }
  dialog
    .querySelectorAll('[data-preset]')
    .forEach((el) => el.addEventListener('click', () => apply(presetGraphics(el.dataset.preset))));
  dialog.querySelectorAll('[data-graphics]').forEach((el) =>
    el.addEventListener(el.type === 'range' ? 'input' : 'change', () => {
      const key = el.dataset.graphics,
        value =
          el.type === 'checkbox'
            ? el.checked
            : el.type === 'range'
              ? Number(el.value) / 100
              : key === 'ao'
                ? el.value
                : Number(el.value);
      apply({ ...settings, preset: 'custom', [key]: value });
    }),
  );
  const close = () => dialog.close();
  const open = () => {
    returnFocus = document.activeElement;
    sync();
    dialog.showModal();
    dialog.querySelector('#graphics-close').focus();
  };
  button.addEventListener('click', open);
  root.querySelectorAll('[data-open-graphics]').forEach((el) => el.addEventListener('click', open));
  dialog.querySelector('#graphics-close').addEventListener('click', close);
  dialog.querySelector('#graphics-return').addEventListener('click', close);
  dialog.addEventListener('close', () => returnFocus?.focus());
  dialog
    .querySelector('#graphics-reset')
    .addEventListener('click', () =>
      apply(presetGraphics(matchMedia('(max-width:700px)').matches ? 'balanced' : 'cinematic')),
    );
  sync();
  return {
    get settings() {
      return settings;
    },
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
