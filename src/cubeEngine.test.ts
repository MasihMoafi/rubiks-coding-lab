import { describe, it, expect } from 'vitest';
import { cloneState, getSolvedState } from './cubeEngine';
import { CubeState } from './types';

describe('cloneState', () => {
  it('should return a new object with the same values', () => {
    const originalState = getSolvedState();
    const clonedState = cloneState(originalState);

    expect(clonedState).toEqual(originalState);
  });

  it('should return a different object reference', () => {
    const originalState = getSolvedState();
    const clonedState = cloneState(originalState);

    expect(clonedState).not.toBe(originalState);
  });

  it('should deep clone the inner arrays to prevent side effects', () => {
    const originalState = getSolvedState();
    const clonedState = cloneState(originalState);

    // Assert that the outer face arrays are different references
    expect(clonedState.U).not.toBe(originalState.U);
    expect(clonedState.D).not.toBe(originalState.D);
    expect(clonedState.F).not.toBe(originalState.F);
    expect(clonedState.B).not.toBe(originalState.B);
    expect(clonedState.L).not.toBe(originalState.L);
    expect(clonedState.R).not.toBe(originalState.R);

    // Assert that the inner rows are different references
    for (let i = 0; i < 3; i++) {
      expect(clonedState.U[i]).not.toBe(originalState.U[i]);
      expect(clonedState.D[i]).not.toBe(originalState.D[i]);
      expect(clonedState.F[i]).not.toBe(originalState.F[i]);
      expect(clonedState.B[i]).not.toBe(originalState.B[i]);
      expect(clonedState.L[i]).not.toBe(originalState.L[i]);
      expect(clonedState.R[i]).not.toBe(originalState.R[i]);
    }

    // Verify that mutating the cloned state doesn't affect the original state
    clonedState.U[0][0] = 'red';
    expect(originalState.U[0][0]).toBe('white');
  });

  it('should clone a non-solved modified state correctly', () => {
    const originalState = getSolvedState();
    // Simulate a move
    originalState.U[0][0] = 'blue';
    originalState.F[1][1] = 'yellow';

    const clonedState = cloneState(originalState);

    expect(clonedState).toEqual(originalState);
    expect(clonedState.U[0][0]).toBe('blue');
    expect(clonedState.F[1][1]).toBe('yellow');
  });
});
