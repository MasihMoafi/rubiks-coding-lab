const FACES = ['U', 'D', 'F', 'B', 'L', 'R'] as const;

interface MovePadProps {
  disabled?: boolean;
  onMove: (move: string) => void;
}

export default function MovePad({ disabled = false, onMove }: MovePadProps) {
  return (
    <section
      aria-label="Cube moves"
      className="absolute inset-x-3 bottom-3 z-40 flex justify-center md:bottom-5"
    >
      <div className="grid grid-cols-6 gap-1.5 rounded-2xl border border-slate-800 bg-slate-950/90 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl md:gap-2 md:p-2.5">
        {FACES.map((face) => (
          <div key={face} className="grid gap-1">
            <button
              type="button"
              onClick={() => onMove(face)}
              disabled={disabled}
              className="h-9 w-10 rounded-lg border border-slate-700 bg-slate-900 font-mono text-xs font-bold text-slate-100 transition hover:border-indigo-400/60 hover:bg-indigo-400 hover:text-slate-950 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 md:h-10 md:w-11"
              aria-label={`${face} clockwise`}
              title={`${face} clockwise`}
            >
              {face}
            </button>
            <button
              type="button"
              onClick={() => onMove(`${face}'`)}
              disabled={disabled}
              className="h-7 w-10 rounded-lg border border-slate-800 bg-slate-950 font-mono text-[11px] font-bold text-slate-400 transition hover:border-indigo-400/40 hover:text-indigo-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 md:w-11"
              aria-label={`${face} counter-clockwise`}
              title={`${face} counter-clockwise`}
            >
              {face}′
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
