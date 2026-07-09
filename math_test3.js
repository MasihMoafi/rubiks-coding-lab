// Wait, the DOM approach `getBoundingClientRect` is infinitely simpler and automatically handles CSS 3D perspectives, zoom, translations, everything.
// I think replacing Math with `getBoundingClientRect` is significantly less error-prone.
// The only catch is we need to select stickers that actually exist. But since all 9 stickers per face always exist (in `Cube3D` they are hardcoded `renderFaceStickers`), `el00`, `el01` and `el10` are guaranteed to be there.
