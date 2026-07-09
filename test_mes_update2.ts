// The three issues:
// 1. "middle rows don't work as they should; when I press down they aren't the ones that go down"
//   - Currently, they are simulated via "U' D" which just rotates the outer layers, NOT the middle layer. We need to implement M, E, S in the engine, and then update `calculateMove` to return M, E, S instead of things like `U' D`.
// Wait, actually, if I use `E` move, does `Cube3D` render it?
// `Cube3D` renders stickers from `cubeState`. So any move in `cubeState` will just update the stickers. Yes!

// 2. "from different angles the selection tool doesn't work; when you've rotated the cube; it doesn't set its axis dynamically and properly"
//   - In `Cube3D.tsx`, the function `getSector` and `getPhysicalDirectionU`, `getPhysicalDirectionD` are used.
//   - But what about F, B, L, R faces? When we rotate the space using free cam (rotY, rotX), the logical directions of the faces change.
//   - When I rotate rotY by 90 degrees, the F face might be on the right or back. If I swipe left on F face, it might need to adjust. Wait. If the user rotated the cube with the mouse, they rotated the WHOLE CAMERA around the cube. The 3D model is rotated via `rotateX` and `rotateY`.
//   - When they click on F face and drag LEFT, the drag is in 2D client coordinates.
//   - If the cube is rotated by 90deg Y, dragging "LEFT" on screen might actually correspond to dragging "LEFT" on the R face?
//   - Let's look at how dragging direction is calculated:
//     ```
//     const isHorizontal = Math.abs(dx) > Math.abs(dy);
//     const dir = isHorizontal ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
//     ```
//   - If the face is flipped or rotated, the mapping from (dx, dy) to "left/right/up/down" on the face's local coordinates changes!
//   - A better way: transform the dx, dy vector from screen space to the face's local space based on rotX, rotY.

// 3. "when I choose a row vertically and then press the left button - even though it correctly turns it it doesn't fix the blue selection filter."
//   - If I choose a row vertically (type = 'col') and then press the left button. Wait, if it's a col, can you press left?
//   - The arrow buttons have:
//     - Left arrow: `disabled={!activeLine || activeLine.type !== 'row'}`
//   - Wait, if `activeLine.type === 'col'` and you press "left arrow" on KEYBOARD!
//   - In `handleKeyDown`, it just calls `executeSelectedMove('left')`.
//   - If `activeLine.type === 'col'` and direction is 'left', `executeSelectedMove` says:
//     `const isHorizontal = direction === 'left' || direction === 'right';`
//     `const currentType = isHorizontal ? 'row' : 'col';`
//     Then it does `setActiveLine({ face, type: currentType, index })` using the SAME index. But an index for col (0,1,2) doesn't necessarily map to the row you want. It just blindly sets `type` to 'row' and keeps `index`. But maybe it shouldn't allow changing type, or if it does, it should just execute but keep the same activeLine, or switch to row. But if you have col 0 selected, and press left, which row does it turn? It turns row 0.
//     Actually, let's see what happens.
//     Keyboard left: calls `executeSelectedMove('left')`.
//     ```
//     const isHorizontal = direction === 'left' || direction === 'right';
//     const currentType = isHorizontal ? 'row' : 'col';
//     ...
//     setActiveLine({
//       face: activeLine.face,
//       type: currentType,
//       index: activeLine.index
//     });
//     ```
//     This CHANGES the active line to `row` and then keeps `index`. So it "correctly turns it" (turns row 0) but "doesn't fix the blue selection filter". Wait, it updates `activeLine` to `row`, so the blue filter SHOULD update. Why doesn't it?
//     Ah, wait, if you select a column, and press LEFT, it turns the ROW, but the selection filter changes to the row! Wait, the user said "it doesn't fix the blue selection filter". "when I choose a row vertically and then press the left button - even though it correctly turns it it doesn't fix the blue selection filter."
//     Wait, if you choose a row *vertically* (meaning a column) and press LEFT. It turns the row. But they chose a *column*, so maybe they wanted the *column* to turn? But you can't turn a column left. You can only turn a column UP or DOWN.
//     Wait, if `activeLine.type === 'col'` and you press left, it just switches to row and turns the row. Maybe they meant they pressed the button on the UI? But the UI button is disabled. So it must be keyboard.
//     Actually, if they press left, maybe it shouldn't switch to row if it's a col. It should just do nothing, OR it should rotate the column? You can't rotate a column left.
//     Wait! What if you press left, and it turns the cube left?
