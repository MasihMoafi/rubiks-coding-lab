import { getSolvedState, executeMoveClockwise, isSolved } from './src/cubeEngine.js';

function executeSlice(state: any, face: string) {
  const next = JSON.parse(JSON.stringify(state));
  switch(face) {
    case 'M': {
      // Follows L. Top to Front, Front to Down, Down to Back, Back to Top.
      // U -> F -> D -> B -> U
      // The middle column is col 1 for U, F, D, B.
      // But wait! Back face is often inverted?
      // For B, col 1 is still the middle, but top-to-bottom might be reversed.
      // Let's trace it.
      // L clockwise: U[row][0] goes to F[row][0].
      // For M, we want U[row][1] to go to F[row][1].

      const tempColU = [state.U[0][1], state.U[1][1], state.U[2][1]];

      // U[i][1] gets B[2-i][1]
      next.U[0][1] = state.B[2][1];
      next.U[1][1] = state.B[1][1];
      next.U[2][1] = state.B[0][1];

      // B[i][1] gets D[2-i][1]
      next.B[0][1] = state.D[2][1];
      next.B[1][1] = state.D[1][1];
      next.B[2][1] = state.D[0][1];

      // D[i][1] gets F[i][1]
      next.D[0][1] = state.F[0][1];
      next.D[1][1] = state.F[1][1];
      next.D[2][1] = state.F[2][1];

      // F[i][1] gets tempColU[i]
      next.F[0][1] = tempColU[0];
      next.F[1][1] = tempColU[1];
      next.F[2][1] = tempColU[2];
      break;
    }
    case 'E': {
      // Follows D. F goes RIGHT, R goes BACK, B goes LEFT, L goes FRONT.
      // F -> R -> B -> L -> F
      // Middle row is row 1.
      const tempRowF = [...state.F[1]];

      next.F[1] = [...state.L[1]];
      next.L[1] = [...state.B[1]];
      next.B[1] = [...state.R[1]];
      next.R[1] = tempRowF;
      break;
    }
    case 'S': {
      // Follows F. U goes RIGHT, R goes DOWN, D goes LEFT, L goes UP.
      // U row 1 -> R col 1 -> D row 1 -> L col 1 -> U row 1
      const tempRowU = [state.U[1][0], state.U[1][1], state.U[1][2]];

      // U[1][i] gets L[2-i][1]
      next.U[1][0] = state.L[2][1];
      next.U[1][1] = state.L[1][1];
      next.U[1][2] = state.L[0][1];

      // L[i][1] gets D[1][2-i]
      next.L[0][1] = state.D[1][2];
      next.L[1][1] = state.D[1][1];
      next.L[2][1] = state.D[1][0];

      // D[1][i] gets R[2-i][1]
      next.D[1][0] = state.R[2][1];
      next.D[1][1] = state.R[1][1];
      next.D[1][2] = state.R[0][1];

      // R[i][1] gets tempRowU[i]
      next.R[0][1] = tempRowU[0];
      next.R[1][1] = tempRowU[1];
      next.R[2][1] = tempRowU[2];
      break;
    }
  }
  return next;
}
console.log("Done");
