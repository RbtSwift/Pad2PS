import type {AppLanguage, Translations} from '../data/i18n';
import {
  CONSOLE_META,
  type ConsoleLayout,
  getConsoleButtonDisplayName,
  getConsoleButtonShort,
  getXInputDisplayLabel,
  PS2_BUTTON_MAP,
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
  remapMap?: Record<number, number>;
  lang: AppLanguage;
  t: Translations;
}

export function LastPressedCard({
  layout,
  activeButtons,
  lastPressed,
  l2Value,
  r2Value,
  leftStick,
  rightStick,
  remapMap = {},
  lang,
  t,
}: LastPressedCardProps) {
  const isSimultaneous = activeButtons.length > 1;
  const displayMapping = activeButtons.length === 1 ? activeButtons[0] : lastPressed;
  const showTriggers = layout !== 'psp';
  const showLeftStick = layout !== 'ps1';
  const showRightStick = layout === 'ps2' || layout === 'ps3';

  const getPhysicalSourceMapping = (psMapping: Ps2ButtonMapping): Ps2ButtonMapping => {
    for (const [physStr, targetIdx] of Object.entries(remapMap)) {
      if (targetIdx === psMapping.index) {
        const physIdx = Number(physStr);
        if (PS2_BUTTON_MAP[physIdx]) {
          return PS2_BUTTON_MAP[physIdx];
        }
      }
    }
    return psMapping;
  };

  return (
    <section
      aria-label={t.lastPressedTitle}
      className="w-full shrink-0 accent-panel rounded-xl p-2 sm:p-3.5 xl:p-4 flex flex-col justify-between gap-1.5 sm:gap-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[11px] sm:text-xs font-medium text-[#A1A1AA]">
          {isSimultaneous ? t.simultaneousTitle : t.lastPressedTitle}
        </h2>
        {displayMapping && !isSimultaneous && (
          <span
            className="font-mono text-[11px] tabular-nums"
            style={{color: 'var(--accent-color)'}}
          >
            {t.indexLabel} {displayMapping.index}
          </span>
        )}
        {isSimultaneous && (
          <span
            className="font-mono text-[11px] tabular-nums font-semibold"
            style={{color: 'var(--accent-color)'}}
          >
            {activeButtons.length} {t.activeCount}
          </span>
        )}
      </div>

      {isSimultaneous ? (
        <div className="flex flex-col items-center justify-center py-0.5 text-center gap-1 sm:gap-2 min-h-0 sm:min-h-[84px]">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {activeButtons.map((btn, idx) => (
              <div key={btn.id} className="flex items-center gap-1.5">
                <div
                  className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center neon-glow-accent"
                  style={{
                    backgroundColor: 'rgba(var(--accent-rgb), 0.16)',
                    border: '1px solid rgba(var(--accent-rgb), 0.65)',
                    color: 'var(--accent-color)',
                  }}
                >
                  <Ps2Symbol id={btn.id} className="w-4 h-4 sm:w-6 sm:h-6" layout={layout} />
                </div>
                {idx < activeButtons.length - 1 && (
                  <span className="font-mono text-sm font-bold text-[#A1A1AA]">+</span>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-0.5">
            <p className="font-display text-sm sm:text-base font-bold text-[#FAFAFA] tracking-tight">
              {activeButtons.map((b) => getConsoleButtonShort(b, layout)).join(' + ')}
            </p>
            <p className="text-[11px] sm:text-xs text-[#A1A1AA]">
              {t.onController}:{' '}
              <span className="font-mono font-medium" style={{color: 'var(--accent-color)'}}>
                {activeButtons.map((b) => getPhysicalSourceMapping(b).xinputShort).join(' + ')}
              </span>
            </p>
          </div>
        </div>
      ) : displayMapping ? (
        <div className="flex items-center gap-2.5 sm:gap-4 py-0.5 min-h-0 sm:min-h-[84px]">
          <div
            className={`w-10 h-10 sm:w-16 sm:h-16 xl:w-[72px] xl:h-[72px] shrink-0 rounded-xl flex items-center justify-center transition-all duration-100 ${
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
            <Ps2Symbol id={displayMapping.id} className="w-6 h-6 sm:w-9 sm:h-9 xl:w-10 xl:h-10" layout={layout} />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-[10px] sm:text-[11px] font-mono text-[#A1A1AA] hidden sm:block">
              {CONSOLE_META[layout].shortLabel}
            </p>
            <p className="font-display text-[clamp(0.95rem,1.6vw,1.5rem)] font-bold text-[#FAFAFA] leading-tight truncate">
              {getConsoleButtonDisplayName(displayMapping, layout, lang)}
            </p>
            <p className="text-[11px] sm:text-sm text-[#A1A1AA] leading-snug truncate">
              {t.equivalence}:{' '}
              <span className="font-medium" style={{color: 'var(--accent-color)'}}>
                {getXInputDisplayLabel(getPhysicalSourceMapping(displayMapping), lang)}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex sm:flex-col items-center justify-center sm:text-center py-0.5 sm:py-2 min-h-0 sm:min-h-[84px] gap-2.5 sm:gap-1">
          <div
            className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'rgba(var(--accent-rgb), 0.08)',
              border: '1px solid rgba(var(--accent-rgb), 0.25)',
              color: 'var(--accent-color)',
            }}
          >
            <Ps2Symbol id="triangle" className="w-4 h-4 sm:w-6 sm:h-6" layout={layout} />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-[#FAFAFA] truncate">{t.noCommandTitle}</p>
            <p className="text-[11px] text-[#A1A1AA] hidden sm:block">{t.noCommandSubtitle}</p>
          </div>
        </div>
      )}

      {/* Compact Live Telemetry Strip */}
      {(showTriggers || showLeftStick || showRightStick) && (
        <div className="pt-1.5 sm:pt-2 border-t accent-border-subtle grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-1 text-[10px] sm:text-[11px] font-mono tabular-nums">
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
              <span>{layout === 'psp' ? t.analogLabel : t.axisL}</span>
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
              <span>{t.axisR}</span>
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
