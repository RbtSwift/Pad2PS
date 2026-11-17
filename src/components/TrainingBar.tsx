import {CheckCircle2, RotateCcw, Target, X} from 'lucide-react';
import type {ComboDefinition} from '../data/comboLibrary';
import type {Translations} from '../data/i18n';
import type {ConsoleLayout} from '../data/ps2Mapping';
import {Ps2Symbol} from './Ps2Symbol';

interface TrainingBarProps {
  combo: ComboDefinition;
  currentStep: number;
  errorFlash: boolean;
  layout: ConsoleLayout;
  t: Translations;
  onRestart: () => void;
  onStop: () => void;
}

export function TrainingBar({
  combo,
  currentStep,
  errorFlash,
  layout,
  t,
  onRestart,
  onStop,
}: TrainingBarProps) {
  const isCompleted = currentStep >= combo.sequence.length;

  return (
    <section
      aria-label={t.combosTrainBtn}
      className="w-full shrink-0 bg-[#121216] rounded-xl px-4 py-3 flex flex-col gap-2.5 neon-glow-accent"
      style={{
        border: isCompleted
          ? '1px solid rgba(52, 211, 153, 0.7)'
          : '1px solid rgba(var(--accent-rgb), 0.5)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <Target
              className="w-4 h-4 shrink-0"
              style={{color: 'var(--accent-color)'}}
            />
          )}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
            <span
              className="text-xs font-mono font-semibold"
              style={{color: isCompleted ? '#34D399' : 'var(--accent-color)'}}
            >
              {combo.game}
            </span>
            <span className="text-xs text-zinc-500" aria-hidden="true">
              ·
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#FAFAFA] truncate">
              {combo.title}
            </span>
            <span className="font-mono text-[11px] text-[#A1A1AA] tabular-nums">
              {isCompleted
                ? t.trainingComplete
                : t.trainingStepOf(currentStep + 1, combo.sequence.length)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium text-[#FAFAFA] hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
            style={{borderColor: 'rgba(var(--accent-rgb), 0.28)'}}
          >
            <RotateCcw className="w-3 h-3" style={{color: 'var(--accent-color)'}} />
            <span>{isCompleted ? t.trainingAgain : t.trainingRestart}</span>
          </button>
          <button
            type="button"
            onClick={onStop}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-700 text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-zinc-500 transition-colors cursor-pointer whitespace-nowrap"
          >
            <X className="w-3 h-3" />
            <span>{t.trainingStop}</span>
          </button>
        </div>
      </div>

      {/* Step-by-step sequence strip */}
      <ol className="flex flex-wrap items-center gap-1.5">
        {combo.sequence.map((btnId, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep && !isCompleted;
          const isError = isCurrent && errorFlash;

          return (
            <li
              key={`${combo.id}-step-${idx}`}
              className={`h-9 min-w-[38px] px-2 rounded-lg border flex items-center justify-center transition-all duration-150 ${
                isDone
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.35)]'
                  : isError
                    ? 'bg-red-500/25 border-red-500 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-error-flash'
                    : isCurrent
                      ? 'text-white neon-glow-accent scale-105'
                      : 'bg-[#09090B]/70 border-zinc-800 text-[#A1A1AA]'
              }`}
              style={
                isCurrent && !isError
                  ? {
                      backgroundColor: 'rgba(var(--accent-rgb), 0.25)',
                      borderColor: 'var(--accent-color)',
                    }
                  : undefined
              }
            >
              <Ps2Symbol id={btnId} className="w-4 h-4" layout={layout} />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
