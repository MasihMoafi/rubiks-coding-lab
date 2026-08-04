import { describe, expect, it } from 'vitest';
import { executeMovesString, getSolvedState } from './cubeEngine';
import { INTERACTIVE_LESSONS, parseProgram } from './learning';

describe('parseProgram', () => {
  it('parses a move sequence', () => {
    const result = parseProgram("R U R' U'");

    expect(result.ok).toBe(true);
    if ('error' in result) return;
    expect(result.program.kind).toBe('sequence');
    expect(result.program.moves).toEqual(['R', 'U', "R'", "U'"]);
  });

  it('normalizes common apostrophes', () => {
    const result = parseProgram('r u r’ u′');

    expect(result.ok).toBe(true);
    if ('error' in result) return;
    expect(result.program.normalized).toBe("R U R' U'");
  });

  it('accepts and expands standard double turns', () => {
    const result = parseProgram('R2 M2');

    expect(result.ok).toBe(true);
    if ('error' in result) return;
    expect(result.program.normalized).toBe('R2 M2');
    expect(result.program.moves).toEqual(['R', 'R', 'M', 'M']);
  });

  it('expands double turns inside repeat blocks', () => {
    const result = parseProgram('repeat(2) { R2 U }');

    expect(result.ok).toBe(true);
    if ('error' in result) return;
    expect(result.program.moves).toEqual(['R', 'R', 'U', 'R', 'R', 'U']);
  });

  it('expands a repeat block', () => {
    const result = parseProgram("repeat(6) { R U R' U' }");

    expect(result.ok).toBe(true);
    if ('error' in result) return;
    expect(result.program.kind).toBe('repeat');
    expect(result.program.repetitions).toBe(6);
    expect(result.program.moves).toHaveLength(24);
    expect(result.program.moves.slice(0, 4)).toEqual(['R', 'U', "R'", "U'"]);
  });

  it('also accepts repeat without parentheses', () => {
    const result = parseProgram('repeat 3 { R U }');

    expect(result.ok).toBe(true);
    if ('error' in result) return;
    expect(result.program.moves).toEqual(['R', 'U', 'R', 'U', 'R', 'U']);
  });

  it('rejects invalid commands', () => {
    const result = parseProgram('turn-right');

    expect(result.ok).toBe(false);
    if (!('error' in result)) return;
    expect(result.error).toContain('not a cube move');
  });

  it('limits expanded programs', () => {
    const result = parseProgram("repeat(12) { R U R' U' R U R' U' R U R' }");

    expect(result.ok).toBe(false);
  });
});

describe('interactive curriculum', () => {
  it.each(INTERACTIVE_LESSONS.map((lesson) => [lesson.id, lesson] as const))(
    '%s example passes from its defined cube state',
    (_id, lesson) => {
      const parsed = parseProgram(lesson.example);
      expect(parsed.ok).toBe(true);
      if ('error' in parsed) return;

      const start = executeMovesString(
        getSolvedState(),
        lesson.initialMoves.join(' '),
      );
      const result = executeMovesString(
        start,
        parsed.program.moves.join(' '),
      );

      expect(lesson.validate(parsed.program, result)).toBe(true);
    },
  );
});
