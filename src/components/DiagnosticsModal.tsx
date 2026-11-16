import {Activity, AlertTriangle, CheckCircle2, SlidersHorizontal, X} from 'lucide-react';
import {useEffect} from 'react';
import type {Translations} from '../data/i18n';
import type {StickState} from '../hooks/useGamepad';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  deadzone: number;
  leftStick: StickState;
  rightStick: StickState;
  rawLeftStick: StickState;
  rawRightStick: StickState;
  t: Translations;
}

const DRIFT_THRESHOLD = 0.08;

interface StickRadarProps {
  label: string;
  raw: StickState;
  filtered: StickState;
  deadzone: number;
  t: Translations;
}

function StickRadar({label, raw, filtered, deadzone, t}: StickRadarProps) {
  const rawMag = Math.min(1, Math.hypot(raw.x, raw.y));
  const filteredMag = Math.min(1, Math.hypot(filtered.x, filtered.y));
  const tiltPct = Math.round(rawMag * 100);
  // Show drift warning if raw stick is sitting in the slight off-center drift zone (> 0.08 and < 0.35)
  const possibleDrift = rawMag > DRIFT_THRESHOLD && rawMag < 0.35;

  const radius = 64;
  const center = 80;
  const rawPx = center + Math.max(-1, Math.min(1, raw.x)) * radius;
  const rawPy = center + Math.max(-1, Math.min(1, raw.y)) * radius;
  const filteredPx = center + Math.max(-1, Math.min(1, filtered.x)) * radius;
  const filteredPy = center + Math.max(-1, Math.min(1, filtered.y)) * radius;
  const deadzoneRadius = deadzone * radius;

  return (
    <div
      className="bg-[#09090B]/85 border rounded-xl p-4 flex flex-col items-center gap-3"
      style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
    >
      <div className="w-full flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-[#FAFAFA]">{label}</h3>
        <span
          className="font-mono text-xs font-bold tabular-nums"
          style={{color: 'var(--accent-color)'}}
        >
          {t.diagTilt}: {tiltPct}%
        </span>
      </div>

      {/* Circular Precision Radar */}
      <svg viewBox="0 0 160 160" className="w-40 h-40 select-none">
        {/* Outer Boundary */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#121216"
          stroke="rgba(var(--accent-rgb), 0.35)"
          strokeWidth="1.5"
        />
        {/* 50% Guide Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius * 0.5}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeDasharray="3 3"
        />
        {/* Crosshairs */}
        <line
          x1={center - radius}
          y1={center}
          x2={center + radius}
          y2={center}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        <line
          x1={center}
          y1={center - radius}
          x2={center}
          y2={center + radius}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
        {/* Deadzone Ring */}
        <circle
          cx={center}
          cy={center}
          r={deadzoneRadius}
          fill="rgba(var(--accent-rgb), 0.08)"
          stroke="var(--accent-color)"
          strokeOpacity="0.55"
          strokeDasharray="2 2"
        />

        {/* Vector Line from center to raw position */}
        <line
          x1={center}
          y1={center}
          x2={rawPx}
          y2={rawPy}
          stroke="rgba(var(--accent-rgb), 0.5)"
          strokeWidth="1.4"
        />

        {/* Raw Hardware Dot */}
        <circle
          cx={rawPx}
          cy={rawPy}
          r="4"
          fill="#A1A1AA"
          opacity={rawMag > 0.01 ? 0.75 : 0.35}
        />

        {/* Filtered Neon Output Dot */}
        <circle
          cx={filteredPx}
          cy={filteredPy}
          r="6"
          fill="var(--accent-color)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          style={{
            filter:
              filteredMag > 0 ? 'drop-shadow(0 0 6px var(--accent-color))' : undefined,
          }}
        />
      </svg>

      {/* Numeric X / Y Readout */}
      <div className="w-full grid grid-cols-2 gap-2 text-xs font-mono tabular-nums">
        <div className="px-2.5 py-1.5 rounded-lg bg-[#121216] border border-zinc-800 flex items-center justify-between">
          <span className="text-[#A1A1AA]">X</span>
          <span className="text-[#FAFAFA] font-semibold">
            {raw.x >= 0 ? `+${raw.x.toFixed(2)}` : raw.x.toFixed(2)}
          </span>
        </div>
        <div className="px-2.5 py-1.5 rounded-lg bg-[#121216] border border-zinc-800 flex items-center justify-between">
          <span className="text-[#A1A1AA]">Y</span>
          <span className="text-[#FAFAFA] font-semibold">
            {raw.y >= 0 ? `+${raw.y.toFixed(2)}` : raw.y.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Drift Indicator */}
      <div
        className={`w-full px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 ${
          possibleDrift
            ? 'bg-amber-500/15 border border-amber-500/45 text-amber-300'
            : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-300'
        }`}
      >
        {possibleDrift ? (
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
        )}
        <span className="leading-snug">
          {possibleDrift ? t.diagDriftWarning : t.diagHealthy}
        </span>
      </div>
    </div>
  );
}

export function DiagnosticsModal({
  isOpen,
  onClose,
  onOpenSettings,
  deadzone,
  leftStick,
  rightStick,
  rawLeftStick,
  rawRightStick,
  t,
}: DiagnosticsModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diag-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#121216] rounded-2xl p-5 shadow-[0_24px_60px_rgba(0,0,0,0.85)] neon-glow-accent flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
        style={{border: '1px solid rgba(var(--accent-rgb), 0.38)'}}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-start justify-between gap-3 pb-3 border-b"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.16)'}}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                border: '1px solid rgba(var(--accent-rgb), 0.38)',
                color: 'var(--accent-color)',
              }}
            >
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 id="diag-modal-title" className="font-display text-base font-bold text-[#FAFAFA]">
                {t.diagTitle}
              </h2>
              <p className="text-xs text-[#A1A1AA]">{t.diagSubtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="w-8 h-8 rounded-lg border text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center justify-center transition-colors cursor-pointer"
            style={{borderColor: 'rgba(var(--accent-rgb), 0.24)'}}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StickRadar
            label={t.diagLeftStick}
            raw={rawLeftStick}
            filtered={leftStick}
            deadzone={deadzone}
            t={t}
          />
          <StickRadar
            label={t.diagRightStick}
            raw={rawRightStick}
            filtered={rightStick}
            deadzone={deadzone}
            t={t}
          />
        </div>

        <div
          className="pt-2 border-t flex flex-wrap items-center justify-between gap-3"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.16)'}}
        >
          <p className="text-xs text-[#A1A1AA] font-mono tabular-nums">
            {t.diagDeadzoneHint}{' '}
            <strong style={{color: 'var(--accent-color)'}}>{deadzone.toFixed(2)}</strong>
          </p>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium text-[#FAFAFA] hover:text-white transition-colors cursor-pointer"
            style={{
              backgroundColor: 'rgba(var(--accent-rgb), 0.18)',
              borderColor: 'var(--accent-color)',
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
            <span>{t.diagOpenSettings}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
