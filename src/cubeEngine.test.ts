import { describe, it, expect } from 'vitest';
import { cloneState, getSolvedState } from './cubeEngine';

describe('cubeEngine', () => {
  describe('cloneState', () => {
    it('should create an object with identical values', () => {
      const originalState = getSolvedState();
      const clonedState = cloneState(originalState);

      // Should equal by value (structure and contents)
      expect(clonedState).toEqual(originalState);
    });

    it('should create a completely new object reference', () => {
      const originalState = getSolvedState();
      const clonedState = cloneState(originalState);

      // Should not be the same reference
      expect(clonedState).not.toBe(originalState);
    });

    it('should perform a deep copy so mutations do not affect the original', () => {
      const originalState = getSolvedState();
      const clonedState = cloneState(originalState);

      // Mutate the cloned state deeply
      clonedState.U[0][0] = 'red';
      clonedState.F[1][1] = 'yellow';
      clonedState.B[2][2] = 'white';

      // Verify original state remains untouched
      expect(originalState.U[0][0]).toBe('white');
      expect(originalState.F[1][1]).toBe('green');
      expect(originalState.B[2][2]).toBe('blue');

      // Verify cloned state was indeed mutated
      expect(clonedState.U[0][0]).toBe('red');
      expect(clonedState.F[1][1]).toBe('yellow');
      expect(clonedState.B[2][2]).toBe('white');
    });

    it('should create separate arrays for each row to ensure full deep copy', () => {
      const originalState = getSolvedState();
      const clonedState = cloneState(originalState);

      // Verify each row reference is different
      expect(clonedState.U[0]).not.toBe(originalState.U[0]);
      expect(clonedState.U[1]).not.toBe(originalState.U[1]);
      expect(clonedState.U[2]).not.toBe(originalState.U[2]);

      // Verify the face matrix reference is different
      expect(clonedState.U).not.toBe(originalState.U);
      expect(clonedState.D).not.toBe(originalState.D);
      expect(clonedState.F).not.toBe(originalState.F);
      expect(clonedState.B).not.toBe(originalState.B);
      expect(clonedState.L).not.toBe(originalState.L);
      expect(clonedState.R).not.toBe(originalState.R);
    });
  });
});
