// Let's verify this thought.
// If we have an active line selected via UI buttons, the UI buttons send 'up', 'down', 'left', 'right'.
// If they click the "Left" button on the UI panel, it sends 'left' to `executeSelectedMove('left')`.
// In `executeSelectedMove`, 'left' means "move the selected row left".
// If the selected face is U, what does "move the row left" mean? It depends on the camera orientation because the user sees the U face.
// Ah! If the user uses the UI arrow buttons, those are screen-relative?
// If the UI arrows are screen relative, then `getPhysicalDirectionU` was trying to make the UI arrow buttons relative to the screen when U face was active.
// Wait, the UI arrow buttons in the DOM are just Up, Down, Left, Right arrows on the screen.
// If the user selects a row on U face, and clicks the Left arrow button, they expect the row to go to their left.
// But the U face rotates with the camera. So "left" on the screen corresponds to different local directions on the U face depending on the camera!
// If we only use `getPhysicalDirectionU` in `executeSelectedMove`, then the keyboard and UI buttons are screen-relative.
// But what about the mouse drag? Mouse drag should be screen-relative too!
// Wait, if mouse drag is transformed to face-local coordinates (projX, projY), then the logic will know exactly which face-local direction the user dragged. Then it can just apply that face-local direction!
// For UI buttons and keyboard, we would need to map screen-relative "left" to face-local direction based on the current camera rotation.
// Instead of hardcoding `getSector`, we could just compute the on-screen projection of the local axes, and map screen "left" (which is dx=-1, dy=0) to the face-local axis!
// `const dx = -1, dy = 0; const projX = dx*nx.x + dy*nx.y; ...`
// This is perfectly general and works for all faces and all camera angles!
// It sets its axis dynamically and properly!
