// Issue 3: "when I choose a row vertically and then press the left button - even though it correctly turns it it doesn't fix the blue selection filter."
// The blue selection filter is based on `activeLine`.
// If `activeLine` changes its type, the blue selection changes.
// Wait, in `Cube3D.tsx`, `handleKeyDown`:
/*
    const key = e.key.toLowerCase();
    if (key === 'a' || e.key === 'ArrowLeft') {
      executeSelectedMove('left');
*/
// And in `executeSelectedMove`:
/*
  const executeSelectedMove = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!activeLine) return;

    const isHorizontal = direction === 'left' || direction === 'right';
    const currentType = isHorizontal ? 'row' : 'col';
    ...
    setActiveLine({
      face: activeLine.face,
      type: currentType, // HERE IT CHANGES!
      index: activeLine.index
    });
*/
// If the user selects a "row vertically" (a column) and presses Left, it turns the row because it changes `currentType` to `row`.
// BUT maybe they expect the column selection to REMAIN a column selection after turning? If it turned a row, maybe it shouldn't have turned a row, or if it did turn a row, maybe it should revert to a column?
// NO! If you have a column selected, you shouldn't be able to turn it left! The left arrow should just do nothing, or it should rotate the cube?
// If we look at the arrow UI buttons:
/*
          <button
            type="button"
            id="btn-spin-left"
            disabled={!activeLine || activeLine.type !== 'row'}
*/
// They are disabled if type !== 'row'. So Keyboard events shouldn't bypass this!
// If `activeLine.type === 'col'`, pressing Left/Right should do nothing, just like the UI buttons.
// Let's fix that.
