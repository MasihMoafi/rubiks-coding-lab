import { CubeState, FaceName, CubeColor, CubeMove } from './types';

// Standard colors for Rubik's cube faces
export const COLOR_MAP: Record<CubeColor, string> = {
  white: '#E1E7EC',  // U (Up) - Muted silver star white
  yellow: '#CA9200', // D (Down) - Rich dark yellow-gold and distinct from orange
  green: '#0D7A31',  // F (Front) - Saturated pine/emerald green
  blue: '#0E4B99',   // B (Back) - Cobalt sapphire blue
  orange: '#D94E03', // L (Left) - Intense, deep safety orange (very burnt)
  red: '#990F0F',    // R (Right) - Deep crimson wine red
};

export const FACE_COLORS: Record<FaceName, CubeColor> = {
  U: 'white',
  D: 'yellow',
  F: 'green',
  B: 'blue',
  L: 'orange',
  R: 'red',
};

// Generates a fully solved Rubik's cube representation
export function getSolvedState(): CubeState {
  return {
    U: Array(3).fill(null).map(() => Array(3).fill('white')),
    D: Array(3).fill(null).map(() => Array(3).fill('yellow')),
    F: Array(3).fill(null).map(() => Array(3).fill('green')),
    B: Array(3).fill(null).map(() => Array(3).fill('blue')),
    L: Array(3).fill(null).map(() => Array(3).fill('orange')),
    R: Array(3).fill(null).map(() => Array(3).fill('red')),
  };
}

// Deep clones the cube state to avoid side-effects
export function cloneState(state: CubeState): CubeState {
  return {
    U: state.U.map(row => [...row]),
    D: state.D.map(row => [...row]),
    F: state.F.map(row => [...row]),
    B: state.B.map(row => [...row]),
    L: state.L.map(row => [...row]),
    R: state.R.map(row => [...row]),
  };
}

// Rotates a 3x3 matrix (face matrix) 90 degrees clockwise
export function rotateFaceMatrixClockwise(matrix: CubeColor[][]): CubeColor[][] {
  const n = matrix.length;
  // Initialize rotated matrix
  const rotated = Array(n).fill(null).map(() => Array(n).fill('white'));
  
  // Transpose and reverse rows (standard JS matrix rotation)
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      rotated[c][n - 1 - r] = matrix[r][c];
    }
  }
  return rotated as CubeColor[][];
}

// Executes a single turn (clockwise) on any face and returns the new state
export function executeMoveClockwise(state: CubeState, face: FaceName): CubeState {
  const next = cloneState(state);
  
  // 1. Rotate the face matrix itself
  next[face] = rotateFaceMatrixClockwise(state[face]);
  
  // 2. Rotate adjacent edge facelets depending on which face was turned
  switch (face) {
    case 'U': {
      // Adjacent: F -> L -> B -> R (row 0)
      const temp = [...state.F[0]];
      next.F[0] = [...state.R[0]];
      next.R[0] = [...state.B[0]];
      next.B[0] = [...state.L[0]];
      next.L[0] = temp;
      break;
    }
    
    case 'D': {
      // Adjacent: F -> R -> B -> L (row 2)
      const temp = [...state.F[2]];
      next.F[2] = [...state.L[2]];
      next.L[2] = [...state.B[2]];
      next.B[2] = [...state.R[2]];
      next.R[2] = temp;
      break;
    }
    
    case 'F': {
      // Adjacent: U (row 2) -> R (col 0) -> D (row 0) -> L (col 2)
      const tempRowU = [state.U[2][0], state.U[2][1], state.U[2][2]];
      
      // U[2][i] gets L[2-i][2]
      next.U[2][0] = state.L[2][2];
      next.U[2][1] = state.L[1][2];
      next.U[2][2] = state.L[0][2];
      
      // L[i][2] gets D[0][2-i]
      next.L[0][2] = state.D[0][0];
      next.L[1][2] = state.D[0][1];
      next.L[2][2] = state.D[0][2];
      
      // D[0][i] gets R[2-i][0]
      next.D[0][0] = state.R[2][0];
      next.D[0][1] = state.R[1][0];
      next.D[0][2] = state.R[0][0];
      
      // R[i][0] gets tempRowU[i]
      next.R[0][0] = tempRowU[0];
      next.R[1][0] = tempRowU[1];
      next.R[2][0] = tempRowU[2];
      break;
    }
    
    case 'B': {
      // Adjacent: U (row 0) -> L (col 0) -> D (row 2) -> R (col 2)
      const tempRowU = [state.U[0][0], state.U[0][1], state.U[0][2]];
      
      // U[0][i] gets R[i][2]
      next.U[0][0] = state.R[0][2];
      next.U[0][1] = state.R[1][2];
      next.U[0][2] = state.R[2][2];
      
      // R[i][2] gets D[2][i]
      next.R[0][2] = state.D[2][0];
      next.R[1][2] = state.D[2][1];
      next.R[2][2] = state.D[2][2];
      
      // D[2][i] gets L[2-i][0]
      next.D[2][0] = state.L[2][0];
      next.D[2][1] = state.L[1][0];
      next.D[2][2] = state.L[0][0];
      
      // L[i][0] gets tempRowU[2-i]
      next.L[0][0] = tempRowU[2];
      next.L[1][0] = tempRowU[1];
      next.L[2][0] = tempRowU[0];
      break;
    }
    
    case 'L': {
      // Adjacent: U (col 0) -> F (col 0) -> D (col 0) -> B (col 2)
      const tempColU = [state.U[0][0], state.U[1][0], state.U[2][0]];
      
      // U[i][0] gets B[2-i][2]
      next.U[0][0] = state.B[2][2];
      next.U[1][0] = state.B[1][2];
      next.U[2][0] = state.B[0][2];
      
      // B[i][2] gets D[2-i][0]
      next.B[0][2] = state.D[2][0];
      next.B[1][2] = state.D[1][0];
      next.B[2][2] = state.D[0][0];
      
      // D[i][0] gets F[i][0]
      next.D[0][0] = state.F[0][0];
      next.D[1][0] = state.F[1][0];
      next.D[2][0] = state.F[2][0];
      
      // F[i][0] gets tempColU[i]
      next.F[0][0] = tempColU[0];
      next.F[1][0] = tempColU[1];
      next.F[2][0] = tempColU[2];
      break;
    }
    
    case 'R': {
      // Adjacent: U (col 2) -> B (col 0) -> D (col 2) -> F (col 2)
      const tempColU = [state.U[0][2], state.U[1][2], state.U[2][2]];
      
      // U[i][2] gets F[i][2]
      next.U[0][2] = state.F[0][2];
      next.U[1][2] = state.F[1][2];
      next.U[2][2] = state.F[2][2];
      
      // F[i][2] gets D[i][2]
      next.F[0][2] = state.D[0][2];
      next.F[1][2] = state.D[1][2];
      next.F[2][2] = state.D[2][2];
      
      // D[i][2] gets B[2-i][0]
      next.D[0][2] = state.B[2][0];
      next.D[1][2] = state.B[1][0];
      next.D[2][2] = state.B[0][0];
      
      // B[i][0] gets tempColU[2-i]
      next.B[0][0] = tempColU[2];
      next.B[1][0] = tempColU[1];
      next.B[2][0] = tempColU[0];
      break;
    }
  }
  
  return next;
}

// Executes any move (clockwise or inverted)
export function executeMove(state: CubeState, move: CubeMove | string): CubeState {
  let face: FaceName;
  let inverted = false;
  
  if (typeof move === 'string') {
    const clean = move.trim();
    face = clean[0] as FaceName;
    inverted = clean.endsWith("'");
  } else {
    face = move.face;
    inverted = move.inverted;
  }
  
  if (inverted) {
    // In Group Theory (and our convenient coder logic)
    // rotating three times clockwise is identical to rotating once counter-clockwise!
    let s = executeMoveClockwise(state, face);
    s = executeMoveClockwise(s, face);
    return executeMoveClockwise(s, face);
  }
  
  return executeMoveClockwise(state, face);
}

// Executes a full series of moves (e.g. "R U R' U'")
export function executeMovesString(state: CubeState, movesStr: string): CubeState {
  let current = cloneState(state);
  const parts = movesStr.split(/\s+/).filter(Boolean);
  for (const part of parts) {
    current = executeMove(current, part);
  }
  return current;
}

// Scrambles a cube starting from a state and returns moves used plus the state
export interface ScrambleResult {
  state: CubeState;
  moves: string[];
}

export function generateScramble(state: CubeState, movesCount = 15): ScrambleResult {
  const faces: FaceName[] = ['U', 'D', 'F', 'B', 'L', 'R'];
  const modifiers = ['', "'"];
  const moves: string[] = [];
  let current = cloneState(state);
  
  let lastFace: FaceName | null = null;
  
  for (let i = 0; i < movesCount; i++) {
    let face: FaceName;
    do {
      face = faces[Math.floor(Math.random() * faces.length)];
    } while (face === lastFace); // Avoid redundant dual-turns of the same face
    
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    const moveStr = `${face}${modifier}`;
    
    current = executeMove(current, moveStr);
    moves.push(moveStr);
    lastFace = face;
  }
  
  return {
    state: current,
    moves,
  };
}

// Checks if the cube state is solved
export function isSolved(state: CubeState): boolean {
  for (const face of Object.keys(state) as FaceName[]) {
    const targetColor = state[face][1][1]; // The center piece determines the face color!
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (state[face][r][c] !== targetColor) {
          return false;
        }
      }
    }
  }
  return true;
}

// Creates a neat, beautiful checkerboard state
export function getCheckerboardState(): CubeState {
  const solved = getSolvedState();
  return executeMovesString(solved, "M_fake U2 D2 R2 L2 F2 B2"); // Will do U2 D2 R2 L2 F2 B2 manually
}

export function getPerfectCheckerboard(): CubeState {
  const solved = getSolvedState();
  const patternMoves = "U2 D2 R2 L2 F2 B2";
  return executeMovesString(solved, patternMoves);
}

// Help map for standard move names
export const MOVES_INFO: Record<string, string> = {
  'U': 'Up Face (White) Clockwise',
  "U'": 'Up Face (White) Counter-Clockwise',
  'D': 'Down Face (Yellow) Clockwise',
  "D'": 'Down Face (Yellow) Counter-Clockwise',
  'F': 'Front Face (Green) Clockwise',
  "F'": 'Front Face (Green) Counter-Clockwise',
  'B': 'Back Face (Blue) Clockwise',
  "B'": 'Back Face (Blue) Counter-Clockwise',
  'L': 'Left Face (Orange) Clockwise',
  "L'": 'Left Face (Orange) Counter-Clockwise',
  'R': 'Right Face (Red) Clockwise',
  "R'": 'Right Face (Red) Counter-Clockwise',
};
