import { getSolvedState, executeMovesString, isSolved } from './src/cubeEngine.js';

let state = getSolvedState();
state = executeMovesString(state, "M M M M");
console.log("M x4 is solved:", isSolved(state));

state = executeMovesString(state, "M M");
console.log("M x2 is solved:", isSolved(state));

state = getSolvedState();
state = executeMovesString(state, "E E E E");
console.log("E x4 is solved:", isSolved(state));

state = getSolvedState();
state = executeMovesString(state, "S S S S");
console.log("S x4 is solved:", isSolved(state));

state = getSolvedState();
state = executeMovesString(state, "M2 E2 S2");
console.log("Checkerboard valid:", state.U[0][0] === state.U[1][1] ? false : true);
// Just check if it's not solved visually by looking at some pieces.
