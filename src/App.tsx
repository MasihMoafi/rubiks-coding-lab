import { useCallback, useEffect, useRef, useState } from 'react';
import type { CubeState } from './types';
import {
  executeMove,
  generateScramble,
  getSolvedState,
  isSolved,
} from './cubeEngine';
import Cube3D from './components/Cube3D';
import ConfettiOverlay from './components/ConfettiOverlay';
import LearningModePanel from './components/LearningModePanel';
import { BookOpen, RotateCcw, Shuffle, Undo2 } from 'lucide-react';

const MOVE_DELAY_MS = 105;

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export default function App() {
  const [cube, setCube] = useState<CubeState>(getSolvedState());
  const [cubeStatesHistory, setCubeStatesHistory] = useState<CubeState[]>([]);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [isLearningMode, setIsLearningMode] = useState(true);
  const [isProgramRunning, setIsProgramRunning] = useState(false);

  const cubeRef = useRef<CubeState>(cube);
  const programTokenRef = useRef(0);
  const programRunningRef = useRef(false);
  const wasSolvedRef = useRef(true);

  const cubeIsSolved = isSolved(cube);

  const updateCube = useCallback((next: CubeState) => {
    cubeRef.current = next;
    setCube(next);
  }, []);

  const cancelProgram = useCallback(() => {
    programTokenRef.current += 1;
    programRunningRef.current = false;
    setIsProgramRunning(false);
  }, []);

  useEffect(() => {
    let timer: number | undefined;

    if (cubeIsSolved && !wasSolvedRef.current) {
      setTriggerConfetti(true);
      timer = window.setTimeout(() => setTriggerConfetti(false), 1800);
    } else if (!cubeIsSolved) {
      setTriggerConfetti(false);
    }

    wasSolvedRef.current = cubeIsSolved;
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [cubeIsSolved]);

  const handleMove = useCallback(
    (move: string) => {
      if (programRunningRef.current) return;

      const current = cubeRef.current;
      setCubeStatesHistory((history) => [...history, current]);
      updateCube(executeMove(current, move));
    },
    [updateCube],
  );

  const handleRunProgram = useCallback(
    async (moves: string[]) => {
      if (moves.length === 0 || programRunningRef.current) return;

      const token = programTokenRef.current + 1;
      programTokenRef.current = token;
      programRunningRef.current = true;
      setIsProgramRunning(true);

      const start = cubeRef.current;
      setCubeStatesHistory((history) => [...history, start]);

      let next = start;
      for (let index = 0; index < moves.length; index += 1) {
        if (programTokenRef.current !== token) return;

        next = executeMove(next, moves[index]);
        updateCube(next);

        if (index < moves.length - 1) {
          await wait(MOVE_DELAY_MS);
        }
      }

      if (programTokenRef.current === token) {
        programRunningRef.current = false;
        setIsProgramRunning(false);
      }
    },
    [updateCube],
  );

  const handleSetCube = useCallback(
    (moves: string[]) => {
      cancelProgram();
      let next = getSolvedState();
      for (const move of moves) next = executeMove(next, move);
      updateCube(next);
      setCubeStatesHistory([]);
    },
    [cancelProgram, updateCube],
  );

  const handleUndo = () => {
    if (cubeStatesHistory.length === 0) return;
    cancelProgram();

    const previous = cubeStatesHistory[cubeStatesHistory.length - 1];
    updateCube(previous);
    setCubeStatesHistory((history) => history.slice(0, -1));
  };

  const handleReset = () => handleSetCube([]);

  const handleScramble = () => {
    cancelProgram();
    const current = cubeRef.current;
    const scramble = generateScramble(current, 10);
    setCubeStatesHistory((history) => [...history, current]);
    updateCube(scramble.state);
  };

  return (
    <div className="flex min-h-screen select-none flex-col overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased">
      <header className="relative z-50 flex h-14 shrink-0 items-center border-b border-slate-900 bg-slate-950/90 px-3 backdrop-blur-md md:px-5">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 grid-cols-2 gap-0.5 rounded-md bg-slate-900 p-1" aria-hidden="true">
            <span className="rounded-sm bg-red-500" />
            <span className="rounded-sm bg-amber-400" />
            <span className="rounded-sm bg-emerald-500" />
            <span className="rounded-sm bg-blue-500" />
          </span>
          <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-slate-300">
            RUBIK LAB
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsLearningMode((open) => !open)}
          className={`ml-auto flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            isLearningMode
              ? 'border-indigo-400/30 bg-indigo-400/10 text-indigo-200 hover:bg-indigo-400/15'
              : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white'
          }`}
          aria-label={isLearningMode ? 'Switch to free play' : 'Open lessons'}
        >
          <BookOpen className="h-3.5 w-3.5" />
          {isLearningMode ? 'Free play' : 'Learn'}
        </button>

        {!isLearningMode && (
          <div className="ml-2 flex gap-1.5">
            <button
              type="button"
              onClick={handleScramble}
              disabled={isProgramRunning}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-amber-500/15 bg-amber-500/10 px-2.5 text-xs font-bold text-amber-300 transition hover:bg-amber-400 hover:text-slate-950 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 md:px-3"
              aria-label="Scramble cube"
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Scramble</span>
            </button>

            <button
              type="button"
              disabled={cubeStatesHistory.length === 0 || isProgramRunning}
              onClick={handleUndo}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 text-xs font-bold text-slate-300 transition hover:border-slate-700 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:text-slate-700 md:px-3"
              aria-label="Undo last action"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isProgramRunning}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 text-xs font-bold text-slate-300 transition hover:border-slate-700 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 md:px-3"
              aria-label="Reset cube"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        )}
      </header>

      <main className="relative w-full flex-1 overflow-hidden">
        {triggerConfetti && <ConfettiOverlay />}

        {isLearningMode && (
          <LearningModePanel
            cubeState={cube}
            isRunning={isProgramRunning}
            onClose={() => setIsLearningMode(false)}
            onRunProgram={handleRunProgram}
            onSetCube={handleSetCube}
          />
        )}

        <div
          className={isProgramRunning ? 'pointer-events-none' : undefined}
          aria-busy={isProgramRunning}
        >
          <Cube3D cubeState={cube} onMove={handleMove} />
        </div>

        {cubeIsSolved && !isLearningMode && (
          <div className="absolute left-1/2 top-3 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-emerald-500/20 bg-slate-950/80 px-3 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[9px] font-bold tracking-[0.16em] text-emerald-300">
              SOLVED
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
