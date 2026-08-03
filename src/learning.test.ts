import { describe, expect, it } from 'vitest';
import { parseProgram } from './learning';

describe('parseProgram', () => {
  it('parses a move sequence', () => {
    const result = parseProgram("R U R' U'");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.program.kind).toBe('sequence');
    expect(result.program.moves).toEqual(['R', 'U', "R'", "U'"]);
  });

  it('normalizes common apostrophes', () => {
    const result = parseProgram('r u r’ u′');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.program.normalized).toBe("R U R' U'");
  });

  it('expands a repeat block', () => {
    const result = parseProgram("repeat(6) { R U R' U' }");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.program.kind).toBe('repeat');
    expect(result.program.repetitions).toBe(6);
    expect(result.program.moves).toHaveLength(24);
    expect(result.program.moves.slice(0, 4)).toEqual(['R', 'U', "R'", "U'"]);
  });

  it('also accepts repeat without parentheses', () => {
    const result = parseProgram('repeat 3 { R U }');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.program.moves).toEqual(['R', 'U', 'R', 'U', 'R', 'U']);
  });

  it('rejects invalid commands', () => {
    const result = parseProgram('turn-right');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain('not a cube move');
  });

  it('limits expanded programs', () => {
    const result = parseProgram("repeat(12) { R U R' U' R U R' U' R U R' }");

    expect(result.ok).toBe(false);
  });
});
