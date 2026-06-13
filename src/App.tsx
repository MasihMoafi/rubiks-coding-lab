import React, { useState, useEffect } from 'react';
import { CubeState } from './types';
import { 
  getSolvedState, 
  executeMove, 
  generateScramble, 
  isSolved 
} from './cubeEngine';
import Cube3D from './components/Cube3D';
import ConfettiOverlay from './components/ConfettiOverlay';
import { RotateCcw, Shuffle, Undo2 } from 'lucide-react';

export default function App() {
  const [cube, setCube] = useState<CubeState>(getSolvedState());
  const [cubeStatesHistory, setCubeStatesHistory] = useState<CubeState[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [prevSolved, setPrevSolved] = useState<boolean>(true);
  const [triggerConfetti, setTriggerConfetti] = useState<boolean>(false);

  const cubeIsSolved = isSolved(cube);

  // Detect when the cube is transitioned from unsolved to solved
  useEffect(() => {
    if (cubeIsSolved && !prevSolved) {
      setTriggerConfetti(true);
      const timer = setTimeout(() => {
        setTriggerConfetti(false);
      }, 6200);
      return () => clearTimeout(timer);
    }
    setPrevSolved(cubeIsSolved);
  }, [cubeIsSolved, prevSolved]);

  // Handle a single turn movement
  const handleMove = (moveStr: string) => {
    // Append actual previous state into history stack before applying next move
    setCubeStatesHistory(prev => [...prev, cube]);
    setCube(prev => {
      const next = executeMove(prev, moveStr);
      return next;
    });
    setHistory(prev => [moveStr, ...prev].slice(0, 16));
  };

  // Undo standard action
  const handleUndo = () => {
    if (cubeStatesHistory.length === 0) return;
    const previous = cubeStatesHistory[cubeStatesHistory.length - 1];
    setCube(previous);
    setCubeStatesHistory(prev => prev.slice(0, prev.length - 1));
    setHistory(prev => prev.slice(1));
  };

  // Resets the state of the cube to resolved initial state
  const handleReset = () => {
    setCube(getSolvedState());
    setCubeStatesHistory([]);
    setHistory([]);
  };

  // Scrambles the cube
  const handleScramble = () => {
    const scramble = generateScramble(cube, 10);
    setCubeStatesHistory(prev => [...prev, cube]);
    setCube(scramble.state);
    setHistory(prev => [...scramble.moves, ...prev].slice(0, 16));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased overflow-hidden select-none">
      
      {/* Absolute Minimal Control Row */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-3 flex items-center justify-end shadow-sm shrink-0">
        
        {/* Global actions with newly introduced Undo command */}
        <div className="flex gap-2.5">
          <button
            type="button"
            id="global-scramble"
            onClick={handleScramble}
            className="px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-mono text-sm font-bold rounded-lg border border-amber-500/10 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" /> Scramble
          </button>
          
          <button
            type="button"
            id="global-undo"
            disabled={cubeStatesHistory.length === 0}
            onClick={handleUndo}
            className={`px-5 py-2.5 font-mono text-sm font-bold rounded-lg border transition-all active:scale-95 cursor-pointer flex items-center gap-2 ${
              cubeStatesHistory.length > 0 
                ? 'bg-amber-500/10 hover:bg-amber-500 border-amber-500/15 text-amber-300 hover:text-slate-950' 
                : 'bg-slate-950 border-slate-900 text-slate-700 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-4 h-4" /> Undo
          </button>

          <button
            type="button"
            id="global-reset"
            onClick={handleReset}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-855 text-slate-400 hover:text-white font-mono text-sm font-bold rounded-lg border border-slate-800 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>

      </header>

      {/* Main Sandbox Panel maximizing user viewport space */}
      <main className="flex-1 relative w-full overflow-hidden">
        
        {/* Beautiful win fanfare confetti */}
        {triggerConfetti && <ConfettiOverlay />}

        {/* Render 3D Model with tactile keyboard-attached gestures */}
        <Cube3D 
          cubeState={cube} 
          onMove={handleMove}
        />

        {/* Dynamic status pill displayed subtly on top of the background */}
        {cubeIsSolved && (
          <div className="absolute bottom-6 right-6 z-40 bg-emerald-600/10 backdrop-blur-md border border-emerald-500/30 px-6 py-3 rounded-full flex items-center gap-3 shadow-lg animate-pulse">
            <span className="text-2xl">🏆</span>
            <span className="text-base font-bold text-emerald-400 uppercase tracking-widest font-mono">
              SOLVED
            </span>
          </div>
        )}

      </main>

    </div>
  );
}
