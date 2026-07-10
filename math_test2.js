function getFaceAxes(face, rotX, rotY) {
  const rx = rotX * Math.PI / 180;
  const ry = rotY * Math.PI / 180;

  const cosX = Math.cos(rx), sinX = Math.sin(rx);
  const cosY = Math.cos(ry), sinY = Math.sin(ry);

  let vx = { x: 1, y: 0, z: 0 };
  let vy = { x: 0, y: 1, z: 0 };

  switch (face) {
    case 'U': vy = { x: 0, y: 0, z: -1 }; break; // rotateX(90deg) -> Y points back
    case 'D': vy = { x: 0, y: 0, z: 1 }; break; // rotateX(-90deg) -> Y points front
    case 'F': break;
    case 'B': vx = { x: -1, y: 0, z: 0 }; break;
    case 'L': vx = { x: 0, y: 0, z: 1 }; break;
    case 'R': vx = { x: 0, y: 0, z: -1 }; break;
  }

  const applyRyRx = (v) => {
    let x1 = v.x * cosY + v.z * sinY;
    let y1 = v.y;
    let z1 = -v.x * sinY + v.z * cosY;
    let x2 = x1;
    let y2 = y1 * cosX - z1 * sinX;
    return { x: x2, y: y2 };
  };

  return { xVec: applyRyRx(vx), yVec: applyRyRx(vy) };
}
console.log(getFaceAxes('U', -22, 38));
console.log(getFaceAxes('F', -22, 38));
