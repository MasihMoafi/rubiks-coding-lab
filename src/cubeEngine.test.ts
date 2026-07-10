import { describe, it, expect } from 'vitest';
import { cloneState, getSolvedState } from './cubeEngine';

describe('cubeEngine', () => {
  describe('cloneState', () => {
    it('should create an object with identical values', () => {
      const originalState = getSolvedState();
      const clonedState = cloneState(originalState);
      expect(clonedState).toEqual(originalState);
    });

    it('should create a completely new object reference', () => {
      const originalState = getSolvedState();
      const clonedState = cloneState(originalState);
      expect(clonedState).not.toBe(originalState);
    });

    it('should perform a deep copy so mutations do not affect the original', () => {
      const originalState = getSolvedState();
      const clonedState = cloneState(originalState);

      clonedState.U[0][0] = 'red';
      clonedState.F[1][1] = 'yellow';
      clonedState.B[2][2] = 'white';

      expect(originalState.U[0][0]).toBe('white');
      expect(originalState.F[1][1]).toBe('green');
      expect(originalState.B[2][2]).toBe('blue');

      expect(clonedState.U[0][0]).toBe('red');
      expect(clonedState.F[1][1]).toBe('yellow');
      expect(clonedState.B[2][2]).toBe('white');
    });

    it('should create separate arrays for all inner rows to ensure full deep copy', () => {
      const originalState = getSolvedState();
      const clonedState = cloneState(originalState);

      expect(clonedState.U).not.toBe(originalState.U);
      expect(clonedState.D).not.toBe(originalState.D);
      expect(clonedState.F).not.toBe(originalState.F);
      expect(clonedState.B).not.toBe(originalState.B);
      expect(clonedState.L).not.toBe(originalState.L);
      expect(clonedState.R).not.toBe(originalState.R);

      for (let i = 0; i < 3; i++) {
        expect(clonedState.U[i]).not.toBe(originalState.U[i]);
        expect(clonedState.D[i]).not.toBe(originalState.D[i]);
        expect(clonedState.F[i]).not.toBe(originalState.F[i]);
        expect(clonedState.B[i]).not.toBe(originalState.B[i]);
        expect(clonedState.L[i]).not.toBe(originalState.L[i]);
        expect(clonedState.R[i]).not.toBe(originalState.R[i]);
      }
    });

    it('should clone a non-solved modified state correctly', () => {
      const originalState = getSolvedState();
      originalState.U[0][0] = 'blue';
      originalState.F[1][1] = 'yellow';

      const clonedState = cloneState(originalState);

      expect(clonedState).toEqual(originalState);
      expect(clonedState.U[0][0]).toBe('blue');
      expect(clonedState.F[1][1]).toBe('yellow');
    });
  });
});
