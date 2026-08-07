import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight,
  Check,
  Lightbulb,
  Play,
  RotateCcw,
  X,
} from 'lucide-react';
import { executeMovesString, getSolvedState } from '../cubeEngine';
import { INTERACTIVE_LESSONS, parseProgram } from '../learning';

interface LearningModePanelProps {
  isRunning: boolean;
  onClose: () => void;
  onRunProgram: (
    moves: string[],
    onStep?: (index: number, move: string) => void,
  ) => Promise<void>;
  onSetCube: (moves: string[]) => void;
}

type FeedbackTone = 'quiet' | 'error' | 'success';

export default function LearningModePanel({
  isRunning,
  onClose,
  onRunProgram,
  onSetCube,
}: LearningModePanelProps) {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [source, setSource] = useState('');
  const [passed, setPassed] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [executionStep, setExecutionStep] = useState<{
    index: number;
    total: number;
    move: string;
  } | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: FeedbackTone;
    text: string;
  }>({ tone: 'quiet', text: INTERACTIVE_LESSONS[0].hint });
  const inputRef = useRef<HTMLInputElement>(null);

  const lesson = INTERACTIVE_LESSONS[lessonIndex];
  const isLastLesson = lessonIndex === INTERACTIVE_LESSONS.length - 1;

  useEffect(() => {
    setSource('');
    setPassed(false);
    setAnswerRevealed(false);
    setExecutionStep(null);
    setFeedback({ tone: 'quiet', text: lesson.hint });
    onSetCube(lesson.initialMoves);

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(focusTimer);
  }, [lesson, onSetCube]);

  const resetLesson = () => {
    onSetCube(lesson.initialMoves);
    setSource('');
    setPassed(false);
    setAnswerRevealed(false);
    setExecutionStep(null);
    setFeedback({ tone: 'quiet', text: lesson.hint });
    inputRef.current?.focus();
  };

  const runProgram = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isRunning) return;

    const parsed = parseProgram(source);
    if ('error' in parsed) {
      setPassed(false);
      setFeedback({ tone: 'error', text: parsed.error });
      return;
    }

    // Every attempt starts from the lesson's defined state. A wrong answer must
    // not quietly change the starting conditions for the next attempt.
    const lessonStartCube = executeMovesString(
      getSolvedState(),
      lesson.initialMoves.join(' '),
    );
    const resultCube = executeMovesString(
      lessonStartCube,
      parsed.program.moves.join(' '),
    );

    onSetCube(lesson.initialMoves);
    setPassed(false);
    setExecutionStep(null);
    setFeedback({
      tone: 'quiet',
      text: `Running ${parsed.program.moves.length} move${
        parsed.program.moves.length === 1 ? '' : 's'
      }…`,
    });

    await onRunProgram(parsed.program.moves, (index, move) => {
      setExecutionStep({
        index,
        total: parsed.program.moves.length,
        move,
      });
    });

    setExecutionStep(null);

    if (lesson.validate(parsed.program, resultCube)) {
      setPassed(true);
      setFeedback({ tone: 'success', text: lesson.success });
      return;
    }

    setFeedback({
      tone: 'error',
      text: 'Not yet. Re-read the goal or reveal the answer.',
    });
  };

  const advance = () => {
    if (isLastLesson) {
      onClose();
      return;
    }
    setLessonIndex((current) => current + 1);
  };

  const feedbackClass =
    feedback.tone === 'success'
      ? 'text-emerald-300'
      : feedback.tone === 'error'
        ? 'text-rose-300'
        : 'text-slate-400';

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 z-50 flex justify-center md:inset-x-6 md:bottom-6">
      <section
        role="dialog"
        aria-label="Interactive cube lesson"
        className="pointer-events-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        <div className="flex h-10 items-center gap-3 border-b border-slate-800 px-4">
          <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-indigo-300">
            {String(lessonIndex + 1).padStart(2, '0')} /{' '}
            {String(INTERACTIVE_LESSONS.length).padStart(2, '0')}
          </span>
          <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-slate-500">
            {lesson.concept}
          </span>
          <div className="ml-auto flex items-center gap-1.5" aria-hidden="true">
            {INTERACTIVE_LESSONS.map((item, index) => (
              <span
                key={item.id}
                className={`h-1.5 rounded-full transition-all ${
                  index === lessonIndex
                    ? 'w-5 bg-indigo-400'
                    : index < lessonIndex
                      ? 'w-1.5 bg-emerald-500'
                      : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isRunning}
            className="ml-2 rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Close lessons"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 md:p-5">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-white md:text-lg">
                {lesson.title}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-400 md:text-sm">
                {lesson.prompt}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAnswerRevealed((revealed) => !revealed)}
              disabled={isRunning}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-expanded={answerRevealed}
            >
              <Lightbulb className="h-3.5 w-3.5" />
              {answerRevealed ? 'Hide' : 'Answer'}
            </button>
          </div>

          {answerRevealed && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-indigo-400/20 bg-indigo-400/5 px-3 py-2">
              <span className="text-[11px] text-slate-500">Type it yourself</span>
              <code className="font-mono text-xs text-indigo-200">
                {lesson.example}
              </code>
            </div>
          )}

          <form onSubmit={runProgram} className="mt-4">
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-black/35 p-1.5 focus-within:border-indigo-400/70 focus-within:ring-2 focus-within:ring-indigo-500/10">
              <span className="pl-2 font-mono text-sm text-indigo-400" aria-hidden="true">
                ›
              </span>
              <input
                ref={inputRef}
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setPassed(false);
                }}
                onKeyDown={(event) => event.stopPropagation()}
                disabled={isRunning}
                spellCheck={false}
                autoCapitalize="characters"
                autoComplete="off"
                aria-label="Cube program"
                placeholder="Type a cube command"
                className="min-w-0 flex-1 bg-transparent px-1 py-2 font-mono text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isRunning || source.trim().length === 0}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-indigo-400 px-3 text-xs font-bold text-slate-950 transition hover:bg-indigo-300 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {isRunning ? 'Running' : 'Run'}
              </button>
            </div>
          </form>

          {executionStep && (
            <div
              className="mt-3 flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2"
              aria-label="Execution trace"
              aria-live="polite"
            >
              <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-slate-500">
                STEP {executionStep.index + 1}/{executionStep.total}
              </span>
              <div className="h-px flex-1 bg-slate-800" />
              <code className="min-w-8 text-center font-mono text-sm font-bold text-indigo-200">
                {executionStep.move}
              </code>
            </div>
          )}

          <div className="mt-3 flex min-h-8 items-center gap-3">
            <p className={`flex-1 text-xs ${feedbackClass}`} aria-live="polite">
              {passed && <Check className="mr-1.5 inline h-3.5 w-3.5" />}
              {feedback.text}
            </p>

            {passed ? (
              <button
                type="button"
                onClick={advance}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-300 active:scale-95"
              >
                {isLastLesson ? 'Free play' : 'Next'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={resetLesson}
                disabled={isRunning}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Reset this lesson"
                title="Reset this lesson"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
