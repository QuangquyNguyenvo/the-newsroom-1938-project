// Geometry detail is fixed when the room is built. The lighter presets get plain boxes
// instead of bevelled ones and simplified twins of the heavy scanned props; a change of
// preset that crosses this line applies on the next page load.
export const detail = { low: false };
export const lowDetailModels = new Set([
  'mantel_clock_01',
  'wicker_basket_01',
  'wooden_bookshelf_worn',
  'vintage_oil_lamp',
  'jug_01',
  'wooden_crate_01',
]);
