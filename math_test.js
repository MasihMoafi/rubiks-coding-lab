function getFaceAxes(face, rotX, rotY) {
  const rx = rotX * Math.PI / 180;
  const ry = rotY * Math.PI / 180;

  const cosX = Math.cos(rx), sinX = Math.sin(rx);
  const cosY = Math.cos(ry), sinY = Math.sin(ry);

  // Base local X (col) and Y (row) axes for the 2D face grid
  // Grid goes from left to right (X) and top to bottom (Y)
  let vx = { x: 1, y: 0, z: 0 };
  let vy = { x: 0, y: 1, z: 0 };

  // Apply face transform (the face orientation itself)
  switch (face) {
    case 'U': // rotateX(90deg)
      vy = { x: 0, y: 0, z: 1 };
      break;
    case 'D': // rotateX(-90deg)
      vy = { x: 0, y: 0, z: -1 };
      break;
    case 'F': // rotateY(0deg)
      // Identity
      break;
    case 'B': // rotateY(180deg)
      vx = { x: -1, y: 0, z: 0 };
      // Y is unchanged
      break;
    case 'L': // rotateY(-90deg)
      vx = { x: 0, y: 0, z: 1 };
      break;
    case 'R': // rotateY(90deg)
      vx = { x: 0, y: 0, z: -1 };
      break;
  }

  // Apply cube transforms: Ry then Rx
  const applyRyRx = (v) => {
    // rotateY
    let x1 = v.x * cosY + v.z * sinY;
    let y1 = v.y;
    let z1 = -v.x * sinY + v.z * cosY;

    // rotateX
    let x2 = x1;
    let y2 = y1 * cosX - z1 * sinX;
    let z2 = y1 * sinX + z1 * cosX;

    return { x: x2, y: y2 }; // We only care about 2D screen projection (x, y)
  };

  return {
    xVec: applyRyRx(vx),
    yVec: applyRyRx(vy)
  };
}

console.log(getFaceAxes('U', 0, 0));
