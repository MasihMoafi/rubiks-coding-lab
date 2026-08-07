import { executeMovesString, getSolvedState, isSolved } from './cubeEngine';
import { CubeState } from './types';

export type ProgramKind = 'sequence' | 'repeat';

export interface ParsedProgram {
  kind: ProgramKind;
  bodyMoves: string[];
  repetitions: number;
  moves: string[];
  normalized: string;
}

export type ParseProgramResult =
  | { ok: true; program: ParsedProgram }
  | { ok: false; error: string };

export interface InteractiveLesson {
  id: string;
  concept: string;
  title: string;
  prompt: string;
  example: string;
  initialMoves: string[];
  targetMoves?: string[];
  success: string;
  hint: string;
  validate: (program: ParsedProgram, result: CubeState) => boolean;
}

const VALID_MOVE = /^[UDFBLRMES](?:2|')?$/;
const MAX_REPEAT = 12;
const MAX_EXPANDED_MOVES = 120;
const FACE_ORDER = ['U', 'D', 'F', 'B', 'L', 'R'] as const;

function normalizeApostrophes(source: string): string {
  return source.replace(/[’′`]/g, "'");
}

function parseMoveList(source: string): ParseProgramResult {
  const tokens = normalizeApostrophes(source)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token.toUpperCase());

  if (tokens.length === 0) {
    return { ok: false, error: 'Enter a move.' };
  }

  const invalid = tokens.find((token) => !VALID_MOVE.test(token));
  if (invalid) {
    return { ok: false, error: `${invalid} is not a cube move.` };
  }

  return {
    ok: true,
    program: {
      kind: 'sequence',
      bodyMoves: tokens,
      repetitions: 1,
      moves: tokens,
      normalized: tokens.join(' '),
    },
  };
}

export function parseProgram(source: string): ParseProgramResult {
  const normalizedSource = normalizeApostrophes(source).trim();
  const repeatMatch = normalizedSource.match(
    /^repeat\s*(?:\(\s*(\d+)\s*\)|(\d+))\s*\{\s*([^{}]+)\s*\}$/i,
  );

  if (!repeatMatch) {
    return parseMoveList(normalizedSource);
  }

  const repetitions = Number(repeatMatch[1] ?? repeatMatch[2]);
  if (!Number.isInteger(repetitions) || repetitions < 1) {
    return { ok: false, error: 'Repeat must be at least 1.' };
  }
  if (repetitions > MAX_REPEAT) {
    return { ok: false, error: `Keep repeat at ${MAX_REPEAT} or less.` };
  }

  const bodyResult = parseMoveList(repeatMatch[3]);
  if (!bodyResult.ok) return bodyResult;

  const bodyMoves = bodyResult.program.moves;
  const expandedLength = bodyMoves.length * repetitions;
  if (expandedLength > MAX_EXPANDED_MOVES) {
    return { ok: false, error: 'That program is too long.' };
  }

  const moves = Array.from({ length: repetitions }, () => bodyMoves).flat();
  return {
    ok: true,
    program: {
      kind: 'repeat',
      bodyMoves,
      repetitions,
      moves,
      normalized: `repeat(${repetitions}) { ${bodyMoves.join(' ')} }`,
    },
  };
}

export function cubeStatesEqual(a: CubeState, b: CubeState): boolean {
  return FACE_ORDER.every((face) =>
    a[face].every((row, rowIndex) =>
      row.every((color, colIndex) => color === b[face][rowIndex][colIndex]),
    ),
  );
}

function isExact(program: ParsedProgram, moves: string[]): boolean {
  return (
    program.moves.length === moves.length &&
    program.moves.every((move, index) => move === moves[index])
  );
}

const RIGHT_HAND = ['R', 'U', "R'", "U'"];
const RIGHT_HAND_INVERSE = ['U', 'R', "U'", "R'"];
const DOUBLE_RIGHT_STATE = executeMovesString(getSolvedState(), 'R2');
const RIGHT_UP_STATE = executeMovesString(getSolvedState(), 'R U');

export const INTERACTIVE_LESSONS: InteractiveLesson[] = [
  {
    id: 'move',
    concept: 'COMMAND',
    title: 'Turn one face',
    prompt: 'Use one instruction to turn the right face clockwise.',
    example: 'R',
    initialMoves: [],
    success: 'One command changed the cube state.',
    hint: 'Cube moves use the first letter of a face.',
    validate: (program) => isExact(program, ['R']),
  },
  {
    id: 'inverse',
    concept: 'INVERSE',
    title: 'Undo a turn',
    prompt: 'The cube starts one right turn away from solved. Reverse that turn.',
    example: "R'",
    initialMoves: ['R'],
    success: 'The inverse restored the previous state.',
    hint: 'An apostrophe means the inverse of a move.',
    validate: (program, result) => isExact(program, ["R'"]) && isSolved(result),
  },
  {
    id: 'double',
    concept: 'STATE',
    title: 'Use a half-turn',
    prompt: 'The right face is already turned halfway. Undo it with one instruction.',
    example: 'R2',
    initialMoves: ['R2'],
    success: 'A half-turn is its own inverse.',
    hint: 'The suffix 2 means perform that face turn twice.',
    validate: (program, result) => isExact(program, ['R2']) && isSolved(result),
  },
  {
    id: 'order',
    concept: 'ORDER',
    title: 'Order the instructions',
    prompt: 'The cube is two moves from solved. Restore it with right, then up.',
    example: 'R U',
    initialMoves: ["U'", "R'"],
    success: 'The same commands in the right order restored the cube.',
    hint: 'Programs run left to right. U means turn the upper face clockwise.',
    validate: (program, result) => isExact(program, ['R', 'U']) && isSolved(result),
  },
  {
    id: 'equivalence',
    concept: 'EQUIVALENCE',
    title: 'Write the same state another way',
    prompt: 'Reach the same state as R2, but use exactly two face-turn instructions.',
    example: 'R R',
    initialMoves: [],
    success: 'Different programs can produce the same state.',
    hint: 'Two quarter-turns on the same face equal one half-turn.',
    validate: (program, result) =>
      program.kind === 'sequence' &&
      program.moves.length === 2 &&
      cubeStatesEqual(result, DOUBLE_RIGHT_STATE),
  },
  {
    id: 'sequence',
    concept: 'ALGORITHM',
    title: 'Build the right-hand algorithm',
    prompt: 'Restore the cube with the four-step right-hand pattern.',
    example: "R U R' U'",
    initialMoves: RIGHT_HAND_INVERSE,
    success: 'The right-hand algorithm restored the cube.',
    hint: 'Alternate right and up, then reverse those same two faces.',
    validate: (program, result) => isExact(program, RIGHT_HAND) && isSolved(result),
  },
  {
    id: 'target',
    concept: 'TARGET',
    title: 'Match a state, not an answer',
    prompt: 'Reach the target shown below. Any program that produces the same cube state passes.',
    example: 'R U',
    initialMoves: [],
    targetMoves: ['R', 'U'],
    success: 'Your program matched the target state.',
    hint: 'Two moves are enough. Think right, then up.',
    validate: (_program, result) => cubeStatesEqual(result, RIGHT_UP_STATE),
  },
  {
    id: 'search',
    concept: 'SEARCH',
    title: 'Find your own way home',
    prompt: 'This cube starts scrambled. Reach the solved target with any valid program.',
    example: "U' R'",
    initialMoves: ['R', 'U'],
    targetMoves: [],
    success: 'Solved. The checker cared only about the resulting state.',
    hint: 'Undo the most recent move first.',
    validate: (_program, result) => isSolved(result),
  },
  {
    id: 'loop',
    concept: 'LOOP',
    title: 'Find the cycle',
    prompt: 'Use a loop to repeat the right-hand algorithm until the cube returns home.',
    example: "repeat(6) { R U R' U' }",
    initialMoves: [],
    success: 'The loop ran 24 moves and returned to the start.',
    hint: 'The right-hand algorithm returns to its start after six repetitions.',
    validate: (program, result) =>
      program.kind === 'repeat' &&
      program.repetitions === 6 &&
      program.bodyMoves.length === RIGHT_HAND.length &&
      program.bodyMoves.every((move, index) => move === RIGHT_HAND[index]) &&
      isSolved(result),
  },
];
