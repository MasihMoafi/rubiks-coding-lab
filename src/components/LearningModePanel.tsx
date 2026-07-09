import React from 'react';
import { BookOpen, X, ChevronRight } from 'lucide-react';

interface LearningModePanelProps {
  onClose: () => void;
}

export default function LearningModePanel({ onClose }: LearningModePanelProps) {
  return (
    <div className="absolute top-0 right-0 w-80 md:w-96 bottom-0 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col pt-2 pb-4 overflow-hidden transform transition-all">
      <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-800 shrink-0 mt-2">
        <div className="flex items-center gap-2 text-indigo-400">
          <BookOpen className="w-5 h-5" />
          <h2 className="font-sans font-bold text-sm tracking-wide uppercase">Learning Mode</h2>
        </div>
        <button 
          onClick={onClose}
          aria-label="Close learning mode"
          className="p-1 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm text-slate-300">
        
        <section className="space-y-2">
          <h3 className="text-white font-bold tracking-wide">The Basics</h3>
          <p className="text-slate-400 leading-relaxed text-xs">
            A Rubik's cube has 6 faces. The center pieces NEVER move relative to each other. The White center is always opposite the Yellow center, Blue is opposite Green, and Red is opposite Orange.
          </p>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 mt-2 text-xs text-slate-400">
            <span className="block text-indigo-400 mb-1 font-bold">Orientation Strategy:</span>
            Keep the White face pointing Up (Top) and the Green face pointing toward you (Front) to maintain a standard perspective while solving.
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-white font-bold tracking-wide">Notation</h3>
          <p className="text-slate-400 leading-relaxed text-xs">
            Moves are represented by letters corresponding to the faces:
          </p>
          <ul className="grid grid-cols-2 gap-2 text-xs mt-2">
            <li className="flex items-center gap-1.5"><span className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-white font-mono font-bold">U</span> Up</li>
            <li className="flex items-center gap-1.5"><span className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-white font-mono font-bold">D</span> Down</li>
            <li className="flex items-center gap-1.5"><span className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-white font-mono font-bold">L</span> Left</li>
            <li className="flex items-center gap-1.5"><span className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-white font-mono font-bold">R</span> Right</li>
            <li className="flex items-center gap-1.5"><span className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-white font-mono font-bold">F</span> Front</li>
            <li className="flex items-center gap-1.5"><span className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 text-white font-mono font-bold">B</span> Back</li>
          </ul>
          <p className="text-slate-500 leading-relaxed text-[10px] italic mt-2">
            A plain letter (e.g., R) means a clockwise rotation. An apostrophe (e.g., R') means counter-clockwise.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-white font-bold tracking-wide">The First Step: The Cross</h3>
          <p className="text-slate-400 leading-relaxed text-xs">
            Start by finding the White center piece. Your goal is to form a white cross, ensuring that the other colors on the edge pieces match their respective center colors.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-white font-bold tracking-wide">Core Algorithm</h3>
          <p className="text-slate-400 leading-relaxed text-xs">
            The Right-Hand Algorithm is a fundamental 4-move sequence used in many steps:
          </p>
          <div className="font-mono text-center bg-slate-950 border border-slate-800 rounded py-2 text-emerald-400 tracking-widest text-sm font-bold">
            R U R' U'
          </div>
        </section>
        
      </div>
    </div>
  );
}
