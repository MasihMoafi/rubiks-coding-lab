import { describe, it, expect } from 'vitest';
import {
  isSolved,
  getSolvedState,
  executeMove,
  getPerfectCheckerboard
} from './cubeEngine';

describe('isSolved', () => {
  it('should return true for a freshly generated solved state', () => {
    const solvedState = getSolvedState();
    expect(isSolved(solvedState)).toBe(true);
  });

  it('should return false after a single move', () => {
    const solvedState = getSolvedState();
    const rotatedState = executeMove(solvedState, 'U');
    expect(isSolved(rotatedState)).toBe(false);
  });

  it('should return false for a perfect checkerboard state', () => {
    const checkerboardState = getPerfectCheckerboard();
    expect(isSolved(checkerboardState)).toBe(false);
  });

  it('should return false if a single facelet does not match its center', () => {
    const state = getSolvedState();
    // Assuming U face center is white (which it is via getSolvedState), change one facelet
    state.U[0][0] = 'red';
    expect(isSolved(state)).toBe(false);
  });

  it('should return true if a move is made and then reversed', () => {
    const solvedState = getSolvedState();
    const rotatedState = executeMove(solvedState, 'R');
    const reversedState = executeMove(rotatedState, "R'");
    expect(isSolved(reversedState)).toBe(true);
  });
});
