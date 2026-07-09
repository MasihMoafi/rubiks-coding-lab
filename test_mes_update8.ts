// Wait, if I use `getBoundingClientRect` on the DOM elements, what if they aren't rendered or I need a fallback?
// The DOM elements are always rendered (`sticker-${face}-0-0`).
// But calculating it based on matrix math might be cleaner and perfectly accurate without reading the DOM (which could have a 1-frame lag during animation).
// Let's derive the matrix.
