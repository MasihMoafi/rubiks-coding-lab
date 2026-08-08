---
name: Rubik Lab
type: interactive Rubik and programming learning app
---

# Rubik Lab

**Learn algorithms by watching every instruction change a real cube state.**

Rubik Lab is a minimal React/Vite learning environment where Rubik notation is also a tiny programming language. The curriculum moves from exact commands into state-based problem solving: inverses, equivalence, instruction order, algorithms, visual targets, search, optimization, loops, and state-aware conditions.

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
9. **Optimize** — hit the target while staying inside a visible move budget; a correct but longer program is rejected with budget-specific feedback.
10. `repeat(6) { R U R' U' }` — compress repeated work into a loop and expose the algorithm's cycle.
11. `if unsolved { U' R' }` — inspect the cube state and execute a repair branch only when its condition is true.

Programs animate one instruction at a time and expose the currently executing step. Conditional programs also expose the branch decision (`TRUE → RUN` or `FALSE → SKIP`). Failed attempts restart from the lesson's defined state without automatically revealing the answer. Later challenges are judged by resulting cube state rather than exact source text, and optimization challenges add an explicit move budget on top of correctness.

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

Or a state-aware conditional block:

```text
if unsolved { U' R' }
```

Conditions currently support `solved` and `unsolved`. The block runs only when the current cube state satisfies the condition.

The parser normalizes common apostrophe characters, rejects unknown moves, and caps expanded programs.

## Verification

```bash
pnpm test
pnpm lint
pnpm build
```

The automated checks cover:

- cube cloning, solved-state detection, moves, inverses, and half-turns;
- command parsing, normalization, repetition, state conditions, half-turn notation, and invalid input;
- conditional true/false execution against actual cube state;
- every lesson example against its defined initial cube state;
- alternative programs that reach the same target state;
- optimization cases where the target is correct but the move budget is exceeded;
- production TypeScript and Vite builds;
- a Playwright desktop run completing the curriculum, including visual targets, alternate valid solutions, budget feedback, wrong-answer recovery, and explicit answer reveal;
- mobile viewport containment and first-lesson completion;
- free-play move, undo, scramble, and reset controls;
- screenshots and a machine-readable QA report uploaded by GitHub Actions.

## Stack

React 19, TypeScript, Vite, Tailwind CSS, Vitest, Playwright, and pnpm.

## Scope

The current curriculum is intentionally compact and interactive rather than broad and passive. Chess and additional algorithm visualizers remain future modules; they are not presented as shipped features.
