---
name: Rubik Lab
type: interactive Rubik and programming learning app
---

# Rubik Lab

**Learn algorithms by watching every instruction change a real cube state.**

Rubik Lab is a minimal React/Vite learning environment where Rubik notation is also a tiny programming language. The app teaches a face move, its inverse, the right-hand algorithm, and repetition through short challenges with immediate visual feedback.

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

1. `R` — change state with one instruction.
2. `R'` — reverse the move with its inverse.
3. `R U R' U'` — restore a prepared cube using the right-hand algorithm.
4. `repeat(6) { R U R' U' }` — expose the algorithm's cycle with a loop.

Programs animate one move at a time. Failed attempts restart from the lesson's defined state, so every retry is deterministic.

## Free play

Free play uses the same notation learned in the lessons. Direct controls expose clockwise and counter-clockwise forms of `U`, `D`, `F`, `B`, `L`, and `R`, with scramble, undo, reset, and solved-state detection.

## Command language

A program can be a move sequence:

```text
R U R' U'
```

or a bounded repeat block:

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

- cube cloning, solved-state detection, moves, and inverses;
- command parsing, normalization, repetition, and invalid input;
- every lesson example against its defined initial cube state;
- production TypeScript and Vite builds;
- a Playwright desktop run completing all lessons, including wrong-answer recovery;
- mobile viewport containment and first-lesson completion;
- free-play move, undo, scramble, and reset controls;
- screenshots and a machine-readable QA report uploaded by GitHub Actions.

## Stack

React 19, TypeScript, Vite, Tailwind CSS, Vitest, Playwright, and pnpm.

## Scope

The current curriculum is deliberately small and complete rather than broad and passive. Chess and additional algorithm visualizers remain future modules; they are not presented as shipped features.
