import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import type { CubeState } from '../types';

interface SolveGuidePanelProps {
  cubeState: CubeState;
  onClose: () => void;
}

const STEPS = [
  {
    concept: 'ORIENT',
    title: 'Fix an orientation',
    prompt: 'Keep white on top and green at the front. The centers are your compass.',
  },
  {
    concept: 'MOVE',
    title: 'Select a slice',
    prompt: 'Click a sticker to select its row. Click it again to switch to its column, then turn it with the arrows or a drag.',
  },
  {
    concept: 'CROSS',
    title: 'Build the white cross',
    prompt: 'Put four white edge pieces around the white center. Their side colors must also line up with the side centers.',
  },
  {
    concept: 'ALGORITHM',
    title: 'Use a repeatable building block',
    prompt: "R U R' U' is the right-hand algorithm. Watch what it moves, then use that pattern while solving.",
  },
] as const;

function hasAlignedWhiteCross(cube: CubeState): boolean {
  const whiteEdges = [
    cube.U[0][1],
    cube.U[1][0],
    cube.U[1][2],
    cube.U[2][1],
  ].every((color) => color === 'white');

  if (!whiteEdges) return false;

  return (
    cube.F[0][1] === cube.F[1][1] &&
    cube.R[0][1] === cube.R[1][1] &&
    cube.B[0][1] === cube.B[1][1] &&
    cube.L[0][1] === cube.L[1][1]
  );
}

export default function SolveGuidePanel({ cubeState, onClose }: SolveGuidePanelProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const crossSolved = hasAlignedWhiteCross(cubeState);

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-40 md:inset-y-4 md:left-auto md:right-4 md:w-80">
      <section
        role="dialog"
        aria-label="Rubik solve guide"
        className="pointer-events-auto max-h-[46vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl md:max-h-none"
      >
        <div className="flex h-10 items-center gap-3 border-b border-slate-800 px-4">
          <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-teal-300">
            {String(stepIndex + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
          </span>
          <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-slate-500">
            {step.concept}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close solve guide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <h2 className="text-base font-semibold text-white">{step.title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">{step.prompt}</p>

          {step.concept === 'ORIENT' && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono text-[9px] font-bold tracking-wide text-slate-300">
              <span className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-2">WHITE ↔ YELLOW</span>
              <span className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-2">GREEN ↔ BLUE</span>
              <span className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-2">RED ↔ ORANGE</span>
            </div>
          )}

          {step.concept === 'MOVE' && (
            <div className="mt-4 rounded-lg border border-teal-400/15 bg-teal-400/5 px-3 py-2 text-[11px] leading-5 text-slate-400">
              Selected stickers glow teal. WASD / arrow keys turn the selected row or column too.
            </div>
          )}

          {step.concept === 'CROSS' && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-[10px] font-bold tracking-[0.12em] ${
                crossSolved
                  ? 'border-emerald-400/25 bg-emerald-400/5 text-emerald-300'
                  : 'border-slate-800 bg-slate-900 text-slate-500'
              }`}
              aria-live="polite"
            >
              {crossSolved && <Check className="h-3.5 w-3.5" />}
              {crossSolved ? 'WHITE CROSS ALIGNED' : 'BUILD THE CROSS ON THE CUBE'}
            </div>
          )}

          {step.concept === 'ALGORITHM' && (
            <div className="mt-4 rounded-xl border border-indigo-400/20 bg-indigo-400/5 px-3 py-3 text-center">
              <code className="font-mono text-sm font-bold tracking-[0.12em] text-indigo-200">
                R U R' U'
              </code>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.max(0, current - 1))}
              disabled={stepIndex === 0}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>

            <button
              type="button"
              onClick={() => {
                if (stepIndex === STEPS.length - 1) {
                  onClose();
                  return;
                }
                setStepIndex((current) => current + 1);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-teal-400 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-teal-300 active:scale-95"
            >
              {stepIndex === STEPS.length - 1 ? 'Done' : 'Next'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
