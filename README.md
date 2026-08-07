---
name: Rubik Lab
type: interactive Rubik and programming learning app
---

# Rubik Lab

**Learn algorithms by watching every instruction change a real cube state.**

Rubik Lab is a minimal React/Vite learning environment where Rubik notation is also a tiny programming language. The curriculum moves from exact commands into state-based problem solving: inverses, equivalence, instruction order, algorithms, visual targets, search, and loops.

## Run it

```bash
git clone https://github.com/MasihMoafi/rubiks-coding-lab.git
cd rubiks-coding-lab
pnpm install
pnpm dev
```

The local app runs on port `3000`.

## Learning flow

Each lesson has one visible cube, one command field, and one goal:

1. `R` — execute one command and watch state change.
2. `R'` — undo a command with its inverse.
3. `R2` — use half-turn notation and see that the operation is self-inverse.
4. `R U` — learn that instruction order changes the result.
5. `R R` — produce the same state as `R2` with a different program.
6. `R U R' U'` — restore a prepared cube with the right-hand algorithm.
7. **Target state** — match a compact visual cube target; any equivalent program passes.
8. **Search** — solve a prepared state with any valid program, not a prescribed answer.
9. `repeat(6) { R U R' U' }` — compress repeated work into a loop and expose the algorithm's cycle.

Programs animate one instruction at a time and expose the currently executing step. Failed attempts restart from the lesson's defined state without automatically revealing the answer. Later challenges are judged by resulting cube state rather than exact source text.

## Free play

Free play uses the same notation learned in the lessons. Direct controls expose clockwise and counter-clockwise forms of `U`, `D`, `F`, `B`, `L`, and `R`, with scramble, undo, reset, and solved-state detection.

## Command language

A program can be a move sequence:

```text
R U R' U'
```

Moves support clockwise, inverse, and half-turn notation such as `R`, `R'`, and `R2`.

Programs can also use a bounded repeat block:

```text
repeat(6) { R U R' U' }
```

The parser normalizes common apostrophe characters, rejects unknown moves, and caps expanded programs.

## Verification

```bash
pnpm test
pnpm lint
pnpm build
```

The automated checks cover:

- cube cloning, solved-state detection, moves, inverses, and half-turns;
- command parsing, normalization, repetition, half-turn notation, and invalid input;
- every lesson example against its defined initial cube state;
- alternative programs that reach the same target state;
- production TypeScript and Vite builds;
- a Playwright desktop run completing all nine lessons, including visual targets, alternate valid solutions, wrong-answer recovery, and explicit answer reveal;
- mobile viewport containment and first-lesson completion;
- free-play move, undo, scramble, and reset controls;
- screenshots and a machine-readable QA report uploaded by GitHub Actions.

## Stack

React 19, TypeScript, Vite, Tailwind CSS, Vitest, Playwright, and pnpm.

## Scope

The current curriculum is intentionally compact and interactive rather than broad and passive. Chess and additional algorithm visualizers remain future modules; they are not presented as shipped features.
