import fs from 'fs';

let content = fs.readFileSync('src/cubeEngine.ts', 'utf8');

const executeSlice = `
// Middle layer moves
export function executeSliceClockwise(state: CubeState, slice: 'M' | 'E' | 'S'): CubeState {
  const next = cloneState(state);
  switch (slice) {
    case 'M': {
      // M follows L (rotates top to front)
      const tempColU = [state.U[0][1], state.U[1][1], state.U[2][1]];

      next.U[0][1] = state.B[2][1];
      next.U[1][1] = state.B[1][1];
      next.U[2][1] = state.B[0][1];

      next.B[0][1] = state.D[2][1];
      next.B[1][1] = state.D[1][1];
      next.B[2][1] = state.D[0][1];

      next.D[0][1] = state.F[0][1];
      next.D[1][1] = state.F[1][1];
      next.D[2][1] = state.F[2][1];

      next.F[0][1] = tempColU[0];
      next.F[1][1] = tempColU[1];
      next.F[2][1] = tempColU[2];
      break;
    }
    case 'E': {
      // E follows D (rotates front to right)
      const tempRowF = [...state.F[1]];

      next.F[1] = [...state.L[1]];
      next.L[1] = [...state.B[1]];
      next.B[1] = [...state.R[1]];
      next.R[1] = tempRowF;
      break;
    }
    case 'S': {
      // S follows F (rotates top to right)
      const tempRowU = [state.U[1][0], state.U[1][1], state.U[1][2]];

      next.U[1][0] = state.L[2][1];
      next.U[1][1] = state.L[1][1];
      next.U[1][2] = state.L[0][1];

      next.L[0][1] = state.D[1][2];
      next.L[1][1] = state.D[1][1];
      next.L[2][1] = state.D[1][0];

      next.D[1][0] = state.R[2][1];
      next.D[1][1] = state.R[1][1];
      next.D[1][2] = state.R[0][1];

      next.R[0][1] = tempRowU[0];
      next.R[1][1] = tempRowU[1];
      next.R[2][1] = tempRowU[2];
      break;
    }
  }
  return next;
}
`;

content = content.replace('// Executes a single turn (clockwise) on any face and returns the new state', executeSlice + '\n// Executes a single turn (clockwise) on any face and returns the new state');

const executeMoveReplace = `
// Executes any move (clockwise or inverted)
export function executeMove(state: CubeState, move: CubeMove | string): CubeState {
  let face: FaceName | 'M' | 'E' | 'S';
  let inverted = false;

  if (typeof move === 'string') {
    const clean = move.trim();
    face = clean[0] as FaceName | 'M' | 'E' | 'S';
    inverted = clean.endsWith("'");
  } else {
    face = move.face as FaceName | 'M' | 'E' | 'S';
    inverted = move.inverted;
  }

  if (face === 'M' || face === 'E' || face === 'S') {
    if (inverted) {
      let s = executeSliceClockwise(state, face);
      s = executeSliceClockwise(s, face);
      return executeSliceClockwise(s, face);
    }
    return executeSliceClockwise(state, face);
  }

  if (inverted) {
    let s = executeMoveClockwise(state, face as FaceName);
    s = executeMoveClockwise(s, face as FaceName);
    return executeMoveClockwise(s, face as FaceName);
  }

  return executeMoveClockwise(state, face as FaceName);
}
`;

content = content.replace(/export function executeMove\([\s\S]*?return executeMoveClockwise\(state, face\);\n\}/, executeMoveReplace.trim());

content = content.replace(/"M_fake U2 D2 R2 L2 F2 B2"/g, '"M2 E2 S2"');
content = content.replace(/"U2 D2 R2 L2 F2 B2"/g, '"M2 E2 S2"');

fs.writeFileSync('src/cubeEngine.ts', content);
console.log("Updated cubeEngine.ts");
