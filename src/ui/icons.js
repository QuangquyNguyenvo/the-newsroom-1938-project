// Line icons drawn on the same 32px grid as the masthead buttons.
const glyph = (path) =>
  `<svg class="glyph" viewBox="0 0 32 32" aria-hidden="true"><path d="${path}"/></svg>`;

export const icons = {
  arrowRight: glyph('M5 16h21M18 8l8 8-8 8'),
  arrowOut: glyph('M10 22 22 10M12 10h10v10'),
  chevronLeft: glyph('M20 6 10 16l10 10'),
  chevronRight: glyph('M12 6l10 10-10 10'),
  retry: glyph('M7 17a9 9 0 1 0 3-8M6 6v6h6'),
  close: glyph('M8 8l16 16M24 8 8 24'),
};
