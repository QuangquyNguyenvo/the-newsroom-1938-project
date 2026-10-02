export const graphicsKey = 'game-lsd:graphics-v1';
const graphicsRevision = 3;
export const graphicsManualKey = 'game-lsd:graphics-manual';
export const presetOrder = ['low', 'balanced', 'high', 'cinematic'];
export const graphicsPresets = {
  low: {
    label: 'Nhẹ',
    note: 'Ưu tiên máy yếu, giảm độ nét và hiệu ứng.',
    resolution: 0.75,
    shadows: 1024,
    ao: 'off',
    bloom: false,
    dof: false,
    film: 0.35,
    exposure: 1,
    atmosphere: false,
    dpr: 1,
  },
  balanced: {
    label: 'Cân bằng',
    note: 'Giữ ánh sáng và vật liệu, giảm chi phí dựng cảnh.',
    resolution: 1,
    shadows: 2048,
    ao: 'off',
    bloom: true,
    dof: false,
    film: 0.55,
    exposure: 1,
    atmosphere: true,
    dpr: 1.25,
  },
  high: {
    label: 'Cao',
    note: 'Bóng tiếp xúc, hình sắc nét và quầng sáng mềm.',
    resolution: 1,
    shadows: 2048,
    ao: 'medium',
    bloom: true,
    dof: false,
    film: 0.75,
    exposure: 1,
    atmosphere: true,
    dpr: 1.65,
  },
  cinematic: {
    label: 'Điện ảnh',
    note: 'Khung hình sắc nét, bóng chi tiết và vật thể đầy đủ. Tốn tài nguyên nhất.',
    resolution: 1.25,
    shadows: 4096,
    ao: 'high',
    bloom: true,
    dof: false,
    film: 0.85,
    exposure: 1,
    atmosphere: true,
    dpr: 2,
  },
};
// The WebGL renderer name tells a CPU fallback and an integrated chip from a real GPU.
// The result is only the starting preset; players can still pick any level.
export function tierForRenderer(name) {
  const renderer = String(name || '').toLowerCase();
  if (!renderer) return 'unknown';
  if (/swiftshader|llvmpipe|softpipe|software|basic render/.test(renderer)) return 'software';
  if (
    /nvidia|geforce|rtx|gtx|quadro|radeon (rx|pro)|radeon\(tm\) rx|\barc\b|apple m\d/.test(renderer)
  )
    return 'discrete';
  return 'integrated';
}
export function presetForTier(tier, compact = false) {
  const preset = { software: 'low', integrated: 'balanced', discrete: 'high' }[tier] || 'balanced';
  return compact && preset === 'high' ? 'balanced' : preset;
}
export function presetGraphics(id) {
  const valid = Object.hasOwn(graphicsPresets, id);
  const { label, note, ...values } = valid ? graphicsPresets[id] : graphicsPresets.high;
  return { preset: valid ? id : 'high', revision: graphicsRevision, ...values };
}
// Settings are independent of puzzle progress. Corrupt or obsolete values are bounded.
export function normalizeGraphics(input, fallback = 'balanced') {
  const source = input && typeof input === 'object' ? input : {};
  const preset = Object.hasOwn(graphicsPresets, source.preset)
    ? source.preset
    : source.preset === 'custom'
      ? 'custom'
      : fallback;
  const defaults = presetGraphics(preset === 'custom' ? fallback : preset);
  const values = { ...defaults, preset };
  for (const [key, allowed] of Object.entries({
    resolution: [0.75, 1, 1.25],
    shadows: [0, 1024, 2048, 4096],
    ao: ['off', 'medium', 'high'],
    dpr: [1, 1.25, 1.65, 2],
  }))
    if (allowed.includes(source[key])) values[key] = source[key];
  for (const key of ['bloom', 'dof', 'atmosphere'])
    if (typeof source[key] === 'boolean') values[key] = source[key];
  for (const [key, min, max] of [
    ['film', 0, 1],
    ['exposure', 0.8, 1.25],
  ])
    if (typeof source[key] === 'number' && Number.isFinite(source[key]))
      values[key] = Math.min(max, Math.max(min, source[key]));
  return values;
}
export function loadGraphics(storage, compact = false, tier = 'unknown') {
  const fallback = presetForTier(tier, compact);
  try {
    const saved = JSON.parse(storage.getItem(graphicsKey));
    // Presets saved before the GPU-based default were the heaviest one for everybody.
    // They restart from the detected level unless the player picked a level on purpose.
    if (
      saved &&
      saved.preset !== 'custom' &&
      saved.revision !== graphicsRevision &&
      storage.getItem(graphicsManualKey) !== '1'
    )
      return presetGraphics(fallback);
    return normalizeGraphics(saved, fallback);
  } catch {
    return presetGraphics(fallback);
  }
}
export function saveGraphics(storage, settings) {
  try {
    storage.setItem(graphicsKey, JSON.stringify(normalizeGraphics(settings)));
    return true;
  } catch {
    return false;
  }
}
