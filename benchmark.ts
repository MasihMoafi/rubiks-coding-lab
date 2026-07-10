import { isSolved, getSolvedState, executeMove } from './src/cubeEngine';

const solvedState = getSolvedState();
const unsolvedState = executeMove(getSolvedState(), 'U');

const ITERATIONS = 10_000_000;

console.time('isSolved (Solved)');
for (let i = 0; i < ITERATIONS; i++) {
  isSolved(solvedState);
}
console.timeEnd('isSolved (Solved)');

console.time('isSolved (Unsolved)');
for (let i = 0; i < ITERATIONS; i++) {
  isSolved(unsolvedState);
}
console.timeEnd('isSolved (Unsolved)');
