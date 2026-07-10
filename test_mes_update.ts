import { getSolvedState, executeMoveClockwise, isSolved } from './src/cubeEngine.js';

function getSector(y: number): number {
  const norm = ((y % 360) + 360) % 360;
  if (norm >= 315 || norm < 45) return 0;
  if (norm >= 45 && norm < 135) return 1;
  if (norm >= 135 && norm < 225) return 2;
  return 3;
}

// In Cube3D.tsx:
// U face rotates the sector mappings.
// The user mentions:
// "the middle rows don't work as they should; when I press down they aren't the ones that go down"
// Looking at `calculateMove` in Cube3D.tsx:

// F: left -> U, U'D, D' (idx = 0, 1, 2)
// This means idx=0 -> U, idx=1 -> U'D ( wait, U' D implies rotating both outer slices, what about E? ). Actually wait!
// "U' D" rotates top counterclockwise and bottom clockwise. This effectively rotates the E slice? No, E is the middle slice! "E" move rotates the middle. Wait, the engine doesn't have M, E, S moves currently! It just uses "U' D" as a hack to rotate both outer layers to simulate a middle turn relative to the camera? If you rotate U' and D, the middle stays fixed. That's NOT a middle turn! To rotate the middle slice, you'd need E (or just rotate the whole cube and U,D ... but the camera is fixed).
// Ah! In `calculateMove`:
/*
    if (face === 'F') {
      if (direction === 'left') {
        if (idx === 0) return "U";
        if (idx === 1) return "U' D";
        return "D'";
      }
*/
// Actually, `U' D` turns the top and bottom. But wait, if you are looking at Front and you swipe the middle row left... the middle row should go left. If you do `U' D`, the top goes right, bottom goes left. The middle doesn't move! The user expects the middle row to rotate left, which is an E' move (or similar, depending on definition). But more importantly, if the engine doesn't support M, E, S, we should implement them!
// M, E, S can be supported in `executeMove`.

// Let's implement M, E, S in `executeMove`!
