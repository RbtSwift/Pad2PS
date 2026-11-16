import type {Ps2ButtonMapping} from '../data/ps2Mapping';
import type {StickState} from '../hooks/useGamepad';
import {Ps2Symbol} from './Ps2Symbol';

interface LastPressedCardProps {
  activeButtons: Ps2ButtonMapping[];
  lastPressed: Ps2ButtonMapping | null;
  l2Value: number;
  r2Value: number;
  leftStick: StickState;
  rightStick: StickState;
}

export function LastPressedCard({
  activeButtons,
  lastPressed,
  l2Value,
  r2Value,
  leftStick,
  rightStick,
}: LastPressedCardProps) {
  const isSimultaneous = activeButtons.length > 1;
  const displayMapping = activeButtons.length === 1 ? activeButtons[0] : lastPressed;

  return (
    <section
      aria-label="Último Botão Pressionado"
      className="bg-[#121216] border border-pink-500/20 rounded-xl p-4 flex flex-col justify-between gap-3"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-medium text-[#A1A1AA]">
          {isSimultaneous ? 'Combinação Simultânea' : 'Último Botão Pressionado'}
        </h2>
        {displayMapping && !isSimultaneous && (
          <span className="font-mono text-[11px] text-pink-400/90 tabular-nums">
            Índice {displayMapping.index}
          </span>
        )}
        {isSimultaneous && (
          <span className="font-mono text-[11px] text-[#FF2E93] tabular-nums">
            {activeButtons.length} ativos
          </span>
        )}
      </div>

      {isSimultaneous ? (
        <div className="flex flex-col items-center justify-center py-2 text-center gap-2.5 min-h-[124px]">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {activeButtons.map((btn, idx) => (
              <div key={btn.id} className="flex items-center gap-1.5">
                <div className="w-12 h-12 rounded-lg bg-pink-500/15 border border-[#FF2E93]/60 text-[#FF2E93] flex items-center justify-center neon-glow-pink">
                  <Ps2Symbol id={btn.id} className="w-7 h-7" />
                </div>
                {idx < activeButtons.length - 1 && (
                  <span className="font-mono text-sm font-bold text-[#A1A1AA]">+</span>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-0.5">
            <p className="font-display text-lg font-bold text-[#FAFAFA] tracking-tight">
              {activeButtons.map((b) => b.ps2Short).join(' + ')}
            </p>
            <p className="text-xs text-[#A1A1AA]">
              No GameSir / Xbox:{' '}
              <span className="font-mono text-pink-300 font-medium">
                {activeButtons.map((b) => b.xinputShort).join(' + ')}
              </span>
            </p>
          </div>
        </div>
      ) : displayMapping ? (
        <div className="flex items-center gap-4 py-1 min-h-[124px]">
          <div
            className={`w-20 h-20 shrink-0 rounded-xl flex items-center justify-center transition-all duration-100 ${
              activeButtons.length === 1
                ? 'bg-[#FF2E93] text-white neon-glow-pink scale-95'
                : 'bg-pink-500/10 border border-pink-500/30 text-[#FF2E93]'
            }`}
          >
            <Ps2Symbol id={displayMapping.id} className="w-11 h-11" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-display text-2xl font-bold text-[#FAFAFA] leading-tight truncate">
              {displayMapping.ps2Name}
            </p>
            <p className="text-sm text-[#A1A1AA] leading-snug">
              Equivalência:{' '}
              <span className="text-pink-300 font-medium">{displayMapping.xinputLabel}</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-3 min-h-[124px] gap-1.5">
          <div className="w-12 h-12 rounded-xl bg-pink-500/5 border border-pink-500/20 flex items-center justify-center text-pink-400/60">
            <Ps2Symbol id="triangle" className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-[#FAFAFA]">Nenhum comando registrado</p>
          <p className="text-xs text-[#A1A1AA]">
            Aperte um botão no controle ou clique no SVG ao lado
          </p>
        </div>
      )}

      {/* Compact Live Telemetry Strip for Analog Triggers & Sticks */}
      <div className="pt-2.5 border-t border-pink-500/15 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-mono tabular-nums">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span>L2 (LT)</span>
            <span className={l2Value > 0.05 ? 'text-[#FF2E93] font-semibold' : ''}>
              {l2Value.toFixed(2)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#EC4899] to-[#FF2E93] transition-[width] duration-75"
              style={{width: `${Math.round(l2Value * 100)}%`}}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span>R2 (RT)</span>
            <span className={r2Value > 0.05 ? 'text-[#FF2E93] font-semibold' : ''}>
              {r2Value.toFixed(2)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#EC4899] to-[#FF2E93] transition-[width] duration-75"
              style={{width: `${Math.round(r2Value * 100)}%`}}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[#A1A1AA]">
          <span>Eixo L</span>
          <span className={leftStick.x !== 0 || leftStick.y !== 0 ? 'text-pink-300' : 'text-zinc-500'}>
            {leftStick.x.toFixed(2)}, {leftStick.y.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#A1A1AA]">
          <span>Eixo R</span>
          <span className={rightStick.x !== 0 || rightStick.y !== 0 ? 'text-pink-300' : 'text-zinc-500'}>
            {rightStick.x.toFixed(2)}, {rightStick.y.toFixed(2)}
          </span>
        </div>
      </div>
    </section>
  );
}
