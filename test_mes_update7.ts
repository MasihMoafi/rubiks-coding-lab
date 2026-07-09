// Let's summarize the plan:
// 1. **Engine Updates**: Add M, E, S moves to `executeMove` in `src/cubeEngine.ts`.
// 2. **Map Middle Moves**: Update `calculateMove` in `src/components/Cube3D.tsx` so that index === 1 uses the new M, E, S moves correctly instead of "U' D" hacks.
// 3. **Dynamic Axis & Mouse/Touch**: Implement `getFaceLocalAxes` using `getBoundingClientRect` on the stickers (or matrix math, but DOM is much easier and bulletproof) to get the local X and Y vectors for the face on the screen.
//    - When dragging/touching, project `dx, dy` onto these local axes to figure out the local direction (left/right/up/down) relative to the face.
//    - For Keyboard and UI Buttons, map their screen-space intent (e.g. `dx=-1, dy=0` for Left arrow) onto the local axes to figure out which local direction it corresponds to.
// 4. **Fix Selection Filter Issue**: In `handleKeyDown`, do NOT blindly change `activeLine.type`.
//    - If the user presses Left/Right, it should generate a screen-space vector `dx=-1, dy=0` or `dx=1, dy=0`.
//    - We project this onto the face's local axes to get the face-local direction.
//    - If the face-local direction is horizontal (left/right), it requires `activeLine.type === 'row'`. If the active line is `col`, it should DO NOTHING (or maybe we can just ignore invalid button presses). Wait, the user said "even though it correctly turns it it doesn't fix the blue selection filter." This means they pressed Left on a column, it turned a row, but the selection filter stayed as column. But if you have a column selected, Left is invalid! We should just ignore it (like the UI buttons do).
//    - Wait, the user said "even though it correctly turns it". Maybe they want it to turn the column? How do you turn a column LEFT?
//    - If you look at a column on the Front face, and you want to turn it Left, you can't! You can only turn a column Up or Down.
//    - But what if the cube is rotated by 90 degrees? Then the Front face is on the side, and the column on the screen looks horizontal! In that case, pressing "Left" on the keyboard should map to "Up" or "Down" on the column!
//    - YES! If we use the projection method, pressing "Left" (screen vector dx=-1, dy=0) might project mostly onto the face's local Y axis, meaning it translates to a local Up or Down move for the column!
//    - So `executeSelectedMove` shouldn't take a hardcoded 'left', 'right' and assume it's for 'row'. It should take the intent, project it to local, and then see if it matches the current `activeLine.type`. If it does, execute it. The user issue is that when they press Left, it turned the row because it hardcoded `currentType = isHorizontal ? 'row' : 'col'`. Instead, it should check what the projection is, and turn the selected line appropriately.
