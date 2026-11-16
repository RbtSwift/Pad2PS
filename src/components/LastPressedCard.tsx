import {
  CONSOLE_META,
  type ConsoleLayout,
  getConsoleButtonDisplayName,
  getConsoleButtonShort,
  type Ps2ButtonMapping,
} from '../data/ps2Mapping';
import type {StickState} from '../hooks/useGamepad';
import {Ps2Symbol} from './Ps2Symbol';

interface LastPressedCardProps {
  layout: ConsoleLayout;
  activeButtons: Ps2ButtonMapping[];
  lastPressed: Ps2ButtonMapping | null;
  l2Value: number;
  r2Value: number;
  leftStick: StickState;
  rightStick: StickState;
}

export function LastPressedCard({
  layout,
  activeButtons,
  lastPressed,
  l2Value,
  r2Value,
  leftStick,
  rightStick,
}: LastPressedCardProps) {
  const isSimultaneous = activeButtons.length > 1;
  const displayMapping = activeButtons.length === 1 ? activeButtons[0] : lastPressed;
  const showTriggers = layout !== 'psp';
  const showLeftStick = layout !== 'ps1';
  const showRightStick = layout === 'ps2' || layout === 'ps3';

  return (
    <section
      aria-label="Último Botão Pressionado"
      className="accent-panel rounded-xl p-4 flex flex-col justify-between gap-3"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-medium text-[#A1A1AA]">
          {isSimultaneous ? 'Combinação Simultânea' : 'Último Botão Pressionado'}
        </h2>
        {displayMapping && !isSimultaneous && (
          <span
            className="font-mono text-[11px] tabular-nums"
            style={{color: 'var(--accent-color)'}}
          >
            Índice {displayMapping.index}
          </span>
        )}
        {isSimultaneous && (
          <span
            className="font-mono text-[11px] tabular-nums font-semibold"
            style={{color: 'var(--accent-color)'}}
          >
            {activeButtons.length} ativos
          </span>
        )}
      </div>

      {isSimultaneous ? (
        <div className="flex flex-col items-center justify-center py-2 text-center gap-2.5 min-h-[118px]">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {activeButtons.map((btn, idx) => (
              <div key={btn.id} className="flex items-center gap-1.5">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center neon-glow-accent"
                  style={{
                    backgroundColor: 'rgba(var(--accent-rgb), 0.16)',
                    border: '1px solid rgba(var(--accent-rgb), 0.65)',
                    color: 'var(--accent-color)',
                  }}
                >
                  <Ps2Symbol id={btn.id} className="w-7 h-7" layout={layout} />
                </div>
                {idx < activeButtons.length - 1 && (
                  <span className="font-mono text-sm font-bold text-[#A1A1AA]">+</span>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-0.5">
            <p className="font-display text-lg font-bold text-[#FAFAFA] tracking-tight">
              {activeButtons.map((b) => getConsoleButtonShort(b, layout)).join(' + ')}
            </p>
            <p className="text-xs text-[#A1A1AA]">
              No GameSir / Xbox:{' '}
              <span className="font-mono font-medium" style={{color: 'var(--accent-color)'}}>
                {activeButtons.map((b) => b.xinputShort).join(' + ')}
              </span>
            </p>
          </div>
        </div>
      ) : displayMapping ? (
        <div className="flex items-center gap-4 py-1 min-h-[118px]">
          <div
            className={`w-20 h-20 shrink-0 rounded-xl flex items-center justify-center transition-all duration-100 ${
              activeButtons.length === 1 ? 'text-white neon-glow-accent scale-95' : ''
            }`}
            style={
              activeButtons.length === 1
                ? {backgroundColor: 'var(--accent-color)'}
                : {
                    backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                    border: '1px solid rgba(var(--accent-rgb), 0.35)',
                    color: 'var(--accent-color)',
                  }
            }
          >
            <Ps2Symbol id={displayMapping.id} className="w-11 h-11" layout={layout} />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[11px] font-mono text-[#A1A1AA]">
              {CONSOLE_META[layout].shortLabel}
            </p>
            <p className="font-display text-2xl font-bold text-[#FAFAFA] leading-tight truncate">
              {getConsoleButtonDisplayName(displayMapping, layout)}
            </p>
            <p className="text-sm text-[#A1A1AA] leading-snug">
              Equivalência:{' '}
              <span className="font-medium" style={{color: 'var(--accent-color)'}}>
                {displayMapping.xinputLabel}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-3 min-h-[118px] gap-1.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(var(--accent-rgb), 0.08)',
              border: '1px solid rgba(var(--accent-rgb), 0.25)',
              color: 'var(--accent-color)',
            }}
          >
            <Ps2Symbol id="triangle" className="w-6 h-6" layout={layout} />
          </div>
          <p className="text-sm font-medium text-[#FAFAFA]">Nenhum comando registrado</p>
          <p className="text-xs text-[#A1A1AA]">
            Aperte um botão no controle ou clique no SVG ao lado
          </p>
        </div>
      )}

      {/* Compact Live Telemetry Strip */}
      {(showTriggers || showLeftStick || showRightStick) && (
        <div className="pt-2.5 border-t accent-border-subtle grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-mono tabular-nums">
          {showTriggers && (
            <>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[#A1A1AA]">
                  <span>L2 (LT)</span>
                  <span
                    className="font-semibold"
                    style={l2Value > 0.05 ? {color: 'var(--accent-color)'} : undefined}
                  >
                    {l2Value.toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full transition-[width] duration-75"
                    style={{
                      width: `${Math.round(l2Value * 100)}%`,
                      backgroundColor: 'var(--accent-color)',
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[#A1A1AA]">
                  <span>R2 (RT)</span>
                  <span
                    className="font-semibold"
                    style={r2Value > 0.05 ? {color: 'var(--accent-color)'} : undefined}
                  >
                    {r2Value.toFixed(2)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                  <div
                    className="h-full transition-[width] duration-75"
                    style={{
                      width: `${Math.round(r2Value * 100)}%`,
                      backgroundColor: 'var(--accent-color)',
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {showLeftStick && (
            <div className="flex items-center justify-between text-[#A1A1AA]">
              <span>{layout === 'psp' ? 'Analógico' : 'Eixo L'}</span>
              <span
                style={
                  leftStick.x !== 0 || leftStick.y !== 0
                    ? {color: 'var(--accent-color)'}
                    : {color: '#71717A'}
                }
              >
                {leftStick.x.toFixed(2)}, {leftStick.y.toFixed(2)}
              </span>
            </div>
          )}

          {showRightStick && (
            <div className="flex items-center justify-between text-[#A1A1AA]">
              <span>Eixo R</span>
              <span
                style={
                  rightStick.x !== 0 || rightStick.y !== 0
                    ? {color: 'var(--accent-color)'}
                    : {color: '#71717A'}
                }
              >
                {rightStick.x.toFixed(2)}, {rightStick.y.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
