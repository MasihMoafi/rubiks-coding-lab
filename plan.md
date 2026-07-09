# Plan

1. **Add Middle Layer Moves (M, E, S) to Engine**
   - Update `src/cubeEngine.ts` to implement `executeSlice` for 'M', 'E', and 'S' moves, handling rotations and edge movements correctly.
   - Update `executeMove` in `src/cubeEngine.ts` to support these new moves.

2. **Fix `calculateMove` in `Cube3D.tsx` to Use Middle Moves**
   - Replace the `"U' D"` (and similar) hacks with the actual 'M', 'E', 'S' (or their inverted variants) slice moves for middle layer rotations (`index === 1`).
   - This directly solves the issue: "the middle rows don't work as they should; when I press down they aren't the ones that go down".

3. **Make Axis Selection Dynamic based on View Angle**
   - Implement a function `getFaceLocalAxes` in `Cube3D.tsx` using `getBoundingClientRect` on `sticker-${face}-0-0`, `sticker-${face}-0-1` (for X axis), and `sticker-${face}-1-0` (for Y axis).
   - In `handleTouchMoveSticker` and `handleStickerMove`, project the mouse drag `(dx, dy)` onto these dynamic screen-space axes to determine the face-local intent (`projX`, `projY`) instead of comparing raw `dx, dy`.
   - Update `executeSelectedMove` to map screen-space directional button presses (Up, Down, Left, Right) to face-local directions using this same dynamic mapping.
   - This directly solves the issue: "from different angles the selection tool doesn't work; when you've rotated the cube; it doesn't set its axis dynamically and properly".

4. **Fix Selection Filter Issue with Keyboard Controls**
   - When the user presses keyboard arrows or UI buttons, they generate a screen-space intent.
   - Instead of blindly changing the `activeLine.type` (e.g. changing column selection to row selection because they pressed Left), evaluate if the resulting face-local direction is valid for the *current* selection type.
   - If `activeLine.type === 'col'` and the projected local intent is horizontal (left/right on the face), ignore the input (do not turn, and do not change selection to row), matching the behavior of the disabled UI buttons.
   - Only execute the move and keep the selection filter intact if the input matches the valid axis for the selected line.
   - This solves the issue: "when I choose a row vertically and then press the left button - even though it correctly turns it it doesn't fix the blue selection filter."

5. **Pre-commit Steps**
   - Ensure proper testing, verification, review, and reflection are done.

6. **Submit**
   - Push the fix to a feature branch and submit.
