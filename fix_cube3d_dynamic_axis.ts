import fs from 'fs';

let content = fs.readFileSync('src/components/Cube3D.tsx', 'utf8');

// 1. Remove getSector, getPhysicalDirectionU, getPhysicalDirectionD
content = content.replace(/const getSector = \([\s\S]*?return 'left';\n};\n/g, '');

// 2. Add getFaceLocalAxes inside or outside the component? Outside is fine, but it needs DOM elements.
// So we can define it inside Cube3D or outside. Since it uses `document.getElementById`, we can just put it inside or outside. Outside is cleaner.

const getFaceLocalAxes = `
const getFaceLocalAxes = (face: FaceName) => {
  const el00 = document.getElementById(\`sticker-\${face}-0-0\`);
  const el01 = document.getElementById(\`sticker-\${face}-0-1\`);
  const el10 = document.getElementById(\`sticker-\${face}-1-0\`);

  if (el00 && el01 && el10) {
    const r00 = el00.getBoundingClientRect();
    const r01 = el01.getBoundingClientRect();
    const r10 = el10.getBoundingClientRect();

    return {
      xVec: { x: r01.left - r00.left, y: r01.top - r00.top },
      yVec: { x: r10.left - r00.left, y: r10.top - r00.top }
    };
  }
  return { xVec: { x: 1, y: 0 }, yVec: { x: 0, y: 1 } }; // fallback
};
`;

content = content.replace(/import \{ CubeState, FaceName \} from '\.\.\/types';/, `import { CubeState, FaceName } from '../types';\n\n${getFaceLocalAxes.trim()}\n`);

// 3. Update executeSelectedMove
const executeSelectedMoveOld = `
  const executeSelectedMove = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!activeLine) return;

    const isHorizontal = direction === 'left' || direction === 'right';
    const currentType = isHorizontal ? 'row' : 'col';

    // Adapt rotation-aware directions for U and D faces
    let targetFace = activeLine.face;
    let targetDir = direction;
    if (targetFace === 'U') {
      const sector = getSector(rotY);
      targetDir = getPhysicalDirectionU(sector, direction);
    } else if (targetFace === 'D') {
      const sector = getSector(rotY);
      targetDir = getPhysicalDirectionD(sector, direction);
    }

    // Auto update type if it changes, calculate and trigger rotation moves
    const moveStr = calculateMove(targetFace, activeLine.index, targetDir);
    if (moveStr) {
      handleTurn(moveStr);
    }

    setActiveLine({
      face: activeLine.face,
      type: currentType,
      index: activeLine.index
    });
  };
`;

const executeSelectedMoveNew = `
  const executeSelectedMove = (screenDirection: 'left' | 'right' | 'up' | 'down') => {
    if (!activeLine) return;

    // Map screen intent to a vector
    let dx = 0, dy = 0;
    if (screenDirection === 'left') dx = -1;
    if (screenDirection === 'right') dx = 1;
    if (screenDirection === 'up') dy = -1;
    if (screenDirection === 'down') dy = 1;

    const { xVec, yVec } = getFaceLocalAxes(activeLine.face);

    // Normalize axes to prevent stretching issues
    const lenX = Math.hypot(xVec.x, xVec.y) || 1;
    const lenY = Math.hypot(yVec.x, yVec.y) || 1;
    const nx = { x: xVec.x / lenX, y: xVec.y / lenX };
    const ny = { x: yVec.x / lenY, y: yVec.y / lenY };

    // Project input vector onto local face axes
    const projX = dx * nx.x + dy * nx.y;
    const projY = dx * ny.x + dy * ny.y;

    const isLocalHorizontal = Math.abs(projX) > Math.abs(projY);
    const targetType = isLocalHorizontal ? 'row' : 'col';

    // DO NOT allow invalid moves: e.g. turning a row vertically.
    // If the projected intent does not match the active line type, ignore it!
    if (targetType !== activeLine.type) {
      return;
    }

    const targetDir = isLocalHorizontal
      ? (projX > 0 ? 'right' : 'left')
      : (projY > 0 ? 'down' : 'up');

    const moveStr = calculateMove(activeLine.face, activeLine.index, targetDir);
    if (moveStr) {
      handleTurn(moveStr);
    }
  };
`;

// wait, replacing just this block exactly might fail due to whitespace variations. Let's use a regex.
content = content.replace(/const executeSelectedMove = \([\s\S]*?index: activeLine\.index\n    \}\);\n  \};/, executeSelectedMoveNew.trim());


// 4. Update handleTouchMoveSticker
const handleTouchMoveOld = `
      if ((isHorizontal && selectionMatchesRow) || (!isHorizontal && selectionMatchesCol)) {
        isStickerDragging.current = false; // complete gesture
        const dir = isHorizontal ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        executeSelectedMove(dir);
        e.preventDefault();
        return;
      }
`;
// wait, executeSelectedMove expects a screen direction now!
// But if it's touch, dx, dy are from the screen. So we should just map dx, dy to local, check if it matches selection, and call calculateMove directly, or maybe just we don't need to call executeSelectedMove because executeSelectedMove takes a discrete string.
// Let's rewrite handleTouchMoveSticker entirely.

const handleTouchMoveReplace = `
  const handleTouchMoveSticker = (e: React.TouchEvent) => {
    if (!isStickerDragging.current) return;
    const touch = e.touches[0];

    const dx = touch.clientX - stickerDragStart.current.x;
    const dy = touch.clientY - stickerDragStart.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 25 && activeLine) {
      const { face, r, c } = stickerDragStart.current;

      const { xVec, yVec } = getFaceLocalAxes(face);
      const lenX = Math.hypot(xVec.x, xVec.y) || 1;
      const lenY = Math.hypot(yVec.x, yVec.y) || 1;
      const nx = { x: xVec.x / lenX, y: xVec.y / lenX };
      const ny = { x: yVec.x / lenY, y: yVec.y / lenY };

      const projX = dx * nx.x + dy * nx.y;
      const projY = dx * ny.x + dy * ny.y;

      const isLocalHorizontal = Math.abs(projX) > Math.abs(projY);
      const targetType = isLocalHorizontal ? 'row' : 'col';

      // Verify touch matches the active selection perfectly before turning
      const selectionMatchesRow = activeLine.face === face && activeLine.type === 'row' && activeLine.index === r;
      const selectionMatchesCol = activeLine.face === face && activeLine.type === 'col' && activeLine.index === c;

      if ((isLocalHorizontal && selectionMatchesRow) || (!isLocalHorizontal && selectionMatchesCol)) {
        isStickerDragging.current = false;

        const targetDir = isLocalHorizontal
          ? (projX > 0 ? 'right' : 'left')
          : (projY > 0 ? 'down' : 'up');

        const moveStr = calculateMove(activeLine.face, activeLine.index, targetDir);
        if (moveStr) {
          handleTurn(moveStr);
        }
        e.preventDefault();
        return;
      }
    }

    handleStickerMove(touch.clientX, touch.clientY);
  };
`;

content = content.replace(/const handleTouchMoveSticker = \([\s\S]*?handleStickerMove\(touch\.clientX, touch\.clientY\);\n  \};/, handleTouchMoveReplace.trim());

// 5. Update handleStickerMove to use projX, projY for setting the initial activeLine orientation
const handleStickerMoveReplace = `
  const handleStickerMove = (clientX: number, clientY: number) => {
    if (!isStickerDragging.current) return;

    const dx = clientX - stickerDragStart.current.x;
    const dy = clientY - stickerDragStart.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Once dragging exceeds a small threshold, configure/change selected line orientation
    if (dist > 10) {
      stickerHasMovedThisTouch.current = true;
      const { face, r, c } = stickerDragStart.current;

      const { xVec, yVec } = getFaceLocalAxes(face);
      const lenX = Math.hypot(xVec.x, xVec.y) || 1;
      const lenY = Math.hypot(yVec.x, yVec.y) || 1;
      const nx = { x: xVec.x / lenX, y: xVec.y / lenX };
      const ny = { x: yVec.x / lenY, y: yVec.y / lenY };

      const projX = dx * nx.x + dy * nx.y;
      const projY = dx * ny.x + dy * ny.y;

      const isLocalHorizontal = Math.abs(projX) > Math.abs(projY);

      setActiveLine({
        face,
        type: isLocalHorizontal ? 'row' : 'col',
        index: isLocalHorizontal ? r : c
      });
    }
  };
`;
content = content.replace(/const handleStickerMove = \([\s\S]*?\}\);\n    \}\n  \};/, handleStickerMoveReplace.trim());

fs.writeFileSync('src/components/Cube3D.tsx', content);
console.log("Updated dynamic axis logic in Cube3D.tsx");
