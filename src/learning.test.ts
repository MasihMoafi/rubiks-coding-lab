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

  it('parses half-turn notation', () => {
    const result = parseProgram('R2 U2');

    expect(result.ok).toBe(true);
    if ('error' in result) return;
    expect(result.program.moves).toEqual(['R2', 'U2']);
    expect(result.program.normalized).toBe('R2 U2');
  });

  it('normalizes common apostrophes', () => {
    const result = parseProgram('r u r’ u′');

    expect(result.ok).toBe(true);
    if ('error' in result) return;
    expect(result.program.normalized).toBe("R U R' U'");
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

  it('accepts half-turns inside repeat blocks', () => {
    const result = parseProgram('repeat(2) { R2 U }');

    expect(result.ok).toBe(true);
    if ('error' in result) return;
    expect(result.program.moves).toEqual(['R2', 'U', 'R2', 'U']);
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
  it('moves from exact commands into state-goal search and optimization', () => {
    expect(INTERACTIVE_LESSONS.map((lesson) => lesson.concept)).toEqual([
      'COMMAND',
      'INVERSE',
      'STATE',
      'ORDER',
      'EQUIVALENCE',
      'ALGORITHM',
      'TARGET',
      'SEARCH',
      'OPTIMIZE',
      'LOOP',
    ]);
  });

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

  it('accepts an equivalent two-turn solution in the equivalence lesson', () => {
    const lesson = INTERACTIVE_LESSONS.find((item) => item.id === 'equivalence');
    expect(lesson).toBeDefined();
    if (!lesson) return;

    const parsed = parseProgram("R' R'");
    expect(parsed.ok).toBe(true);
    if ('error' in parsed) return;

    const result = executeMovesString(getSolvedState(), parsed.program.moves.join(' '));
    expect(lesson.validate(parsed.program, result)).toBe(true);
  });

  it('accepts a non-example program when it reaches the target state', () => {
    const lesson = INTERACTIVE_LESSONS.find((item) => item.id === 'target');
    expect(lesson).toBeDefined();
    if (!lesson) return;

    const parsed = parseProgram("R2 R' U");
    expect(parsed.ok).toBe(true);
    if ('error' in parsed) return;

    const result = executeMovesString(getSolvedState(), parsed.program.moves.join(' '));
    expect(parsed.program.normalized).not.toBe(lesson.example);
    expect(lesson.validate(parsed.program, result)).toBe(true);
  });

  it('accepts a longer valid solution in the search lesson', () => {
    const lesson = INTERACTIVE_LESSONS.find((item) => item.id === 'search');
    expect(lesson).toBeDefined();
    if (!lesson) return;

    const parsed = parseProgram("U' R' U U U U");
    expect(parsed.ok).toBe(true);
    if ('error' in parsed) return;

    const start = executeMovesString(getSolvedState(), lesson.initialMoves.join(' '));
    const result = executeMovesString(start, parsed.program.moves.join(' '));
    expect(parsed.program.normalized).not.toBe(lesson.example);
    expect(lesson.validate(parsed.program, result)).toBe(true);
  });

  it('rejects a correct target state when the move budget is exceeded', () => {
    const lesson = INTERACTIVE_LESSONS.find((item) => item.id === 'optimize');
    expect(lesson).toBeDefined();
    if (!lesson) return;

    expect(lesson.moveBudget).toBe(1);

    const longProgram = parseProgram('R R');
    expect(longProgram.ok).toBe(true);
    if ('error' in longProgram) return;
    const longResult = executeMovesString(
      getSolvedState(),
      longProgram.program.moves.join(' '),
    );
    expect(lesson.validate(longProgram.program, longResult)).toBe(false);

    const compactProgram = parseProgram('R2');
    expect(compactProgram.ok).toBe(true);
    if ('error' in compactProgram) return;
    const compactResult = executeMovesString(
      getSolvedState(),
      compactProgram.program.moves.join(' '),
    );
    expect(lesson.validate(compactProgram.program, compactResult)).toBe(true);
  });
});
