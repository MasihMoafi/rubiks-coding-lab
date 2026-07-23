---
name: Rubik's Coding Lab
type: interactive React sandbox for exploring cube state, moves, and algorithm logic
---

# Rubik's Coding Lab

**A Rubik's Cube is a compact way to make state transitions and reversible algorithms visible.**

Rubik's Coding Lab is a React/Vite sandbox for manipulating a 3D cube, inspecting move history, scrambling/restoring state, and experimenting with cube algorithms. The core cube-state engine has automated Vitest coverage for cloning, solved-state detection, moves, and inverse moves.

## Quick start

```bash
git clone https://github.com/MasihMoafi/rubiks-coding-lab.git
cd rubiks-coding-lab
npm install
npm run dev
```

Vite starts the local development server on port `3000` according to the current package script.

Run the cube-engine tests:

```bash
npm test
```

Expected result: the app opens an interactive cube UI; the test command runs the checked-in `src/cubeEngine.test.ts` suite.

## The problem

Permutation/state algorithms are easier to reason about when the state change is visible. A Rubik's Cube gives every operation an immediate spatial consequence and every inverse move a concrete correctness check.

This project uses that property as an interactive coding/algorithm sandbox rather than presenting the cube only as a puzzle game.

## How it works

```text
cube state
   ↓
move / inverse move / scramble
   ↓
cube-state engine
   ↓
React UI + motion
   ↓
3D visual state + history
```

Current stack:

- React 19;
- Vite;
- TypeScript;
- Tailwind CSS;
- Motion;
- Lucide icons;
- Vitest for the cube engine.

## Current state

### Implemented

- Interactive cube manipulation UI.
- Cube-state engine with solved-state logic.
- Move execution and inverse moves.
- Move history / undo-oriented state handling.
- Scramble/algorithm interactions represented in the app.
- Vitest coverage for core state cloning and solved-state behavior.

### Implemented but still under acceptance

- The repository has unit coverage for core engine behavior, not comprehensive browser/UI interaction tests.
- Responsive and interaction quality still require manual browser verification.

### Planned

The existing README described possible educational extensions such as coding tutorials, multiplayer learning, and other algorithm visualizers. Those are ideas, not working features, and are not presented as current product capability.

### Intentionally unsupported / not claimed

- No claim of a complete Rubik's Cube teaching curriculum.
- No multiplayer implementation documented as shipped.
- No claim that additional chess/algorithm visualizers exist today.

## What sets this project apart

The useful design choice is coupling an algorithmic state engine to a visual object where mistakes are obvious: a move followed by its inverse should restore the solved state.

That behavior is also directly tested in `src/cubeEngine.test.ts`.

## Evals and test series

Run:

```bash
npm test
npm run lint
npm run build
```

The checked-in Vitest suite verifies, among other cases:

- state cloning produces independent deep copies;
- a fresh cube is solved;
- a single move makes it unsolved;
- a move followed by its inverse returns it to solved state.

What these tests prove: correctness of the covered cube-engine invariants.

What they do not prove: full gesture behavior, visual correctness, accessibility, or mobile interaction quality.

## Future development

Before expanding into a broader learning platform, the useful next step is browser-level verification of the existing interactions and a small set of explicit educational flows around the cube engine.
