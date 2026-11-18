import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Gauge,
  RotateCcw,
  SlidersHorizontal,
  Vibrate,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Translations } from '../data/i18n';
import type {
  HardwareInspectorInfo,
  RumbleOptions,
  StickState,
} from '../hooks/useGamepad';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  deadzone: number;
  leftStick: StickState;
  rightStick: StickState;
  rawLeftStick: StickState;
  rawRightStick: StickState;
  l2Value?: number;
  r2Value?: number;
  pollingRateHz?: number;
  bouncingCount?: number;
  lastBouncingButton?: number | null;
  onResetBouncing?: () => void;
  hardwareInfo?: HardwareInspectorInfo;
  onTriggerRumble?: (options?: RumbleOptions) => Promise<'ok' | 'unsupported' | 'disconnected'>;
  t: Translations;
}

const DRIFT_THRESHOLD = 0.08;
const SECTORS = 12;

interface StickRadarProps {
  label: string;
  raw: StickState;
  filtered: StickState;
  deadzone: number;
  resetSignal: number;
  t: Translations;
}

function StickRadar({
  label,
  raw,
  filtered,
  deadzone,
  resetSignal,
  t,
}: StickRadarProps) {
  const sectorPeaksRef = useRef<number[]>(Array(SECTORS).fill(0));
  const [circularityErrorPct, setCircularityErrorPct] = useState<number | null>(null);

  useEffect(() => {
    sectorPeaksRef.current = Array(SECTORS).fill(0);
    setCircularityErrorPct(null);
  }, [resetSignal]);

  const rawMag = Math.min(1.42, Math.hypot(raw.x, raw.y));
  const filteredMag = Math.min(1, Math.hypot(filtered.x, filtered.y));
  const tiltPct = Math.round(Math.min(1, rawMag) * 100);
  const possibleDrift = rawMag > DRIFT_THRESHOLD && rawMag < 0.35;

  useEffect(() => {
    if (rawMag < 0.55) return;
    let angle = Math.atan2(raw.y, raw.x);
    if (angle < 0) angle += Math.PI * 2;
    const idx = Math.min(SECTORS - 1, Math.floor((angle / (Math.PI * 2)) * SECTORS));
    if (rawMag > sectorPeaksRef.current[idx]) {
      sectorPeaksRef.current[idx] = rawMag;
      const sampled = sectorPeaksRef.current.filter((v) => v > 0.55);
      if (sampled.length >= 4) {
        const avgErr =
          sampled.reduce((acc, v) => acc + Math.abs(v - 1.0), 0) / sampled.length;
        setCircularityErrorPct(Number((avgErr * 100).toFixed(1)));
      }
    }
  }, [raw.x, raw.y, rawMag]);

  const radius = 60;
  const center = 76;
  const rawPx = center + Math.max(-1, Math.min(1, raw.x)) * radius;
  const rawPy = center + Math.max(-1, Math.min(1, raw.y)) * radius;
  const filteredPx = center + Math.max(-1, Math.min(1, filtered.x)) * radius;
  const filteredPy = center + Math.max(-1, Math.min(1, filtered.y)) * radius;
  const deadzoneRadius = deadzone * radius;

  // Desenha polígono polar da circularidade amostrada
  const sectorPoints = sectorPeaksRef.current
    .map((peak, i) => {
      if (peak <= 0.1) return null;
      const a = ((i + 0.5) / SECTORS) * Math.PI * 2;
      const r = Math.min(1.15, peak) * radius;
      return `${(center + Math.cos(a) * r).toFixed(1)},${(center + Math.sin(a) * r).toFixed(1)}`;
    })
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="bg-[#09090B]/85 border rounded-xl p-3.5 flex flex-col items-center gap-2.5"
      style={{ borderColor: 'rgba(var(--accent-rgb), 0.22)' }}
    >
      <div className="w-full flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-[#FAFAFA]">{label}</h3>
        <span
          className="font-mono text-xs font-bold tabular-nums"
          style={{ color: 'var(--accent-color)' }}
        >
          {t.diagTilt}: {tiltPct}%
        </span>
      </div>

      {/* Radar Polar de Precisão */}
      <svg viewBox="0 0 152 152" className="w-36 h-36 select-none">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="#121216"
          stroke="rgba(var(--accent-rgb), 0.35)"
          strokeWidth="1.5"
        />
        <circle
          cx={center}
          cy={center}
          r={radius * 0.5}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeDasharray="3 3"
        />
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

        {sectorPoints.split(' ').length >= 3 && (
          <polygon
            points={sectorPoints}
            fill="rgba(34, 197, 94, 0.14)"
            stroke="#22C55E"
            strokeWidth="1.2"
          />
        )}

        <circle
          cx={center}
          cy={center}
          r={deadzoneRadius}
          fill="rgba(var(--accent-rgb), 0.08)"
          stroke="var(--accent-color)"
          strokeOpacity="0.55"
          strokeDasharray="2 2"
        />

        <line
          x1={center}
          y1={center}
          x2={rawPx}
          y2={rawPy}
          stroke="rgba(var(--accent-rgb), 0.5)"
          strokeWidth="1.4"
        />

        <circle
          cx={rawPx}
          cy={rawPy}
          r="3.8"
          fill="#A1A1AA"
          opacity={rawMag > 0.01 ? 0.75 : 0.35}
        />

        <circle
          cx={filteredPx}
          cy={filteredPy}
          r="5.5"
          fill="var(--accent-color)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          style={{
            filter:
              filteredMag > 0 ? 'drop-shadow(0 0 6px var(--accent-color))' : undefined,
          }}
        />
      </svg>

      {/* X / Y + Erro de Circularidade */}
      <div className="w-full grid grid-cols-3 gap-1.5 text-[11px] font-mono tabular-nums">
        <div className="px-2 py-1 rounded-lg bg-[#121216] border border-zinc-800 flex items-center justify-between">
          <span className="text-[#A1A1AA]">X</span>
          <span className="text-[#FAFAFA] font-semibold">
            {raw.x >= 0 ? `+${raw.x.toFixed(2)}` : raw.x.toFixed(2)}
          </span>
        </div>
        <div className="px-2 py-1 rounded-lg bg-[#121216] border border-zinc-800 flex items-center justify-between">
          <span className="text-[#A1A1AA]">Y</span>
          <span className="text-[#FAFAFA] font-semibold">
            {raw.y >= 0 ? `+${raw.y.toFixed(2)}` : raw.y.toFixed(2)}
          </span>
        </div>
        <div className="px-2 py-1 rounded-lg bg-[#121216] border border-zinc-800 flex items-center justify-between">
          <span className="text-[#A1A1AA]">Err</span>
          <span className="text-emerald-400 font-semibold">
            {circularityErrorPct !== null ? `${circularityErrorPct}%` : '--'}
          </span>
        </div>
      </div>

      {/* Indicador de Drift */}
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
  l2Value = 0,
  r2Value = 0,
  pollingRateHz = 0,
  bouncingCount = 0,
  lastBouncingButton = null,
  onResetBouncing,
  hardwareInfo,
  onTriggerRumble,
  t,
}: DiagnosticsModalProps) {
  const [activeTab, setActiveTab] = useState<'sticks' | 'rumble' | 'triggers' | 'raw'>('sticks');
  const [resetSignal, setResetSignal] = useState<number>(0);
  const [rumbleStatus, setRumbleStatus] = useState<string | null>(null);
  const [continuousPulse, setContinuousPulse] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setContinuousPulse(false);
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

  useEffect(() => {
    if (!isOpen || !continuousPulse || !onTriggerRumble) return;
    let active = true;
    const runPulse = () => {
      if (!active) return;
      onTriggerRumble({ strongMagnitude: 0.7, weakMagnitude: 0.7, duration: 280 }).catch(() => {});
    };
    runPulse();
    const id = window.setInterval(runPulse, 480);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [isOpen, continuousPulse, onTriggerRumble]);

  if (!isOpen) {
    return null;
  }

  const runRumbleTest = async (label: string, opts: RumbleOptions) => {
    if (!onTriggerRumble) return;
    const res = await onTriggerRumble(opts);
    if (res === 'ok') {
      setRumbleStatus(`Pulso "${label}" enviado com sucesso!`);
    } else if (res === 'disconnected') {
      setRumbleStatus('Nenhum controle conectado no momento.');
    } else {
      setRumbleStatus('Este navegador/controle não suporta vibrationActuator.');
    }
  };

  const latencyMs = pollingRateHz > 0 ? (1000 / pollingRateHz).toFixed(2) : '--';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diag-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#121216] rounded-2xl p-5 shadow-[0_24px_60px_rgba(0,0,0,0.85)] neon-glow-accent flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
        style={{ border: '1px solid rgba(var(--accent-rgb), 0.38)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-3 pb-3 border-b"
          style={{ borderColor: 'rgba(var(--accent-rgb), 0.16)' }}
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
            style={{ borderColor: 'rgba(var(--accent-rgb), 0.24)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navegação de Abas da Suíte Avançada */}
        <div className="flex flex-wrap gap-1.5 bg-[#09090B] p-1 rounded-xl border border-zinc-800">
          {[
            { id: 'sticks' as const, label: 'Drift & Circularidade', icon: Activity },
            { id: 'rumble' as const, label: 'Vibração (Rumble)', icon: Vibrate },
            { id: 'triggers' as const, label: 'Gatilhos, Hz & Bouncing', icon: Gauge },
            { id: 'raw' as const, label: 'Inspetor Raw', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                style={{
                  backgroundColor: active ? 'rgba(var(--accent-rgb), 0.2)' : 'transparent',
                  color: active ? '#FFFFFF' : '#A1A1AA',
                  border: active
                    ? '1px solid rgba(var(--accent-rgb), 0.5)'
                    : '1px solid transparent',
                }}
              >
                <Icon className="w-3.5 h-3.5" style={active ? { color: 'var(--accent-color)' } : undefined} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Aba 1: Drift & Circularidade */}
        {activeTab === 'sticks' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>Gire ambos os analógicos em 360° completos para medir o erro de circularidade.</span>
              <button
                type="button"
                onClick={() => setResetSignal((n) => n + 1)}
                className="px-2.5 py-1 rounded-lg bg-[#1A1A22] border border-zinc-700 text-[#FAFAFA] hover:border-zinc-500 flex items-center gap-1 cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                Resetar
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <StickRadar
                label={t.diagLeftStick}
                raw={rawLeftStick}
                filtered={leftStick}
                deadzone={deadzone}
                resetSignal={resetSignal}
                t={t}
              />
              <StickRadar
                label={t.diagRightStick}
                raw={rawRightStick}
                filtered={rightStick}
                deadzone={deadzone}
                resetSignal={resetSignal}
                t={t}
              />
            </div>
          </div>
        )}

        {/* Aba 2: Teste de Vibração (Rumble) */}
        {activeTab === 'rumble' && (
          <div className="bg-[#09090B]/85 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[#FAFAFA]">Teste de Motores de Vibração</h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Valide os atuadores esquerdo (grave/forte) e direito (agudo/fraco) via Gamepad API.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => runRumbleTest('Motor Forte (Esq.)', { strongMagnitude: 1, weakMagnitude: 0, duration: 500 })}
                className="px-3.5 py-2.5 rounded-xl bg-[#16161F] border border-zinc-700 hover:border-[var(--accent-color)] text-xs font-semibold text-[#FAFAFA] cursor-pointer transition-colors"
              >
                Motor Forte (Esquerdo 100%)
              </button>
              <button
                type="button"
                onClick={() => runRumbleTest('Motor Fraco (Dir.)', { strongMagnitude: 0, weakMagnitude: 1, duration: 500 })}
                className="px-3.5 py-2.5 rounded-xl bg-[#16161F] border border-zinc-700 hover:border-[var(--accent-color)] text-xs font-semibold text-[#FAFAFA] cursor-pointer transition-colors"
              >
                Motor Fraco (Direito 100%)
              </button>
              <button
                type="button"
                onClick={() => runRumbleTest('Dual Rumble Completo', { strongMagnitude: 1, weakMagnitude: 1, duration: 700 })}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#FFFFFF] cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'rgba(var(--accent-rgb), 0.22)',
                  border: '1px solid rgba(var(--accent-rgb), 0.6)',
                }}
              >
                Testar Ambos Simultaneamente
              </button>
              <button
                type="button"
                onClick={() => setContinuousPulse((p) => !p)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                style={{
                  backgroundColor: continuousPulse ? '#EF4444' : '#16161F',
                  color: '#FFFFFF',
                  border: continuousPulse ? '1px solid #FCA5A5' : '1px solid rgb(63, 63, 70)',
                }}
              >
                {continuousPulse ? 'Parar Pulso Contínuo' : 'Iniciar Pulso Contínuo'}
              </button>
            </div>

            {rumbleStatus && (
              <p className="text-xs text-[#A1A1AA] bg-[#121216] border border-zinc-800 rounded-lg px-3 py-2">
                {rumbleStatus}
              </p>
            )}
          </div>
        )}

        {/* Aba 3: Gatilhos, Polling Rate & Bouncing */}
        {activeTab === 'triggers' && (
          <div className="flex flex-col gap-3">
            <div className="bg-[#09090B]/85 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-[#FAFAFA]">Linearidade dos Gatilhos (0% – 100%)</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'L2 / LT (Esquerdo)', val: l2Value },
                  { label: 'R2 / RT (Direito)', val: r2Value },
                ].map((tr) => {
                  const pct = Math.round(Math.max(0, Math.min(1, tr.val)) * 100);
                  return (
                    <div key={tr.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-[#A1A1AA]">{tr.label}</span>
                        <span className="text-[#FAFAFA] font-bold">{pct}%</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[#181820] overflow-hidden border border-zinc-800">
                        <div
                          className="h-full transition-all duration-75"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: 'var(--accent-color)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#09090B]/85 border border-zinc-800 rounded-xl p-4">
                <p className="text-xs text-[#A1A1AA]">Taxa de Atualização (Polling Rate)</p>
                <p className="text-2xl font-mono font-extrabold text-[#FAFAFA] mt-1">
                  {pollingRateHz > 0 ? `${pollingRateHz} Hz` : '-- Hz'}
                </p>
                <p className="text-xs text-[#A1A1AA] mt-1 font-mono">
                  Latência estimada: <span className="text-emerald-400">{latencyMs} ms</span>
                </p>
              </div>

              <div className="bg-[#09090B]/85 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#A1A1AA]">Detecção de Bouncing (&lt; 65ms)</p>
                    {onResetBouncing && (
                      <button
                        type="button"
                        onClick={onResetBouncing}
                        className="text-[11px] text-[#A1A1AA] hover:text-white cursor-pointer"
                      >
                        Zerar
                      </button>
                    )}
                  </div>
                  <p
                    className={`text-2xl font-mono font-extrabold mt-1 ${
                      bouncingCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {bouncingCount} {bouncingCount === 1 ? 'alerta' : 'alertas'}
                  </p>
                </div>
                <p className="text-[11px] text-[#A1A1AA] mt-1">
                  {bouncingCount > 0
                    ? `Último clique duplo involuntário: B${lastBouncingButton ?? '?'}`
                    : 'Nenhum clique duplo involuntário detectado.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Aba 4: Inspetor Raw de Hardware */}
        {activeTab === 'raw' && (
          <div className="bg-[#09090B]/85 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <p className="text-[#A1A1AA]">Dispositivo:</p>
                <p className="font-mono text-[#FAFAFA] font-semibold break-all">
                  {hardwareInfo?.id || 'Nenhum gamepad ativo detectado'}
                </p>
              </div>
              <div className="flex gap-2 font-mono">
                <span className="px-2 py-1 rounded bg-[#16161F] border border-zinc-800 text-[#FAFAFA]">
                  VID:PID {hardwareInfo?.vidPid || '--:--'}
                </span>
                <span className="px-2 py-1 rounded bg-[#16161F] border border-zinc-800 text-[#FAFAFA]">
                  Idx: {hardwareInfo?.index ?? '--'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-[#A1A1AA] mb-1.5">Botões Brutos (B0..B17)</p>
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 font-mono text-[11px]">
                {Array.from({ length: 18 }).map((_, i) => {
                  const pressed = hardwareInfo?.rawButtons?.[i] ?? false;
                  return (
                    <div
                      key={i}
                      className="py-1.5 rounded text-center border font-bold transition-colors"
                      style={{
                        backgroundColor: pressed ? 'var(--accent-color)' : '#14141B',
                        color: pressed ? '#FFFFFF' : '#71717A',
                        borderColor: pressed ? '#FFFFFF' : '#27272A',
                      }}
                    >
                      B{i}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs text-[#A1A1AA] mb-1.5">Eixos Brutos (Axes)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                {(hardwareInfo?.rawAxes?.length ? hardwareInfo.rawAxes : [0, 0, 0, 0]).map(
                  (val, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 rounded bg-[#14141B] border border-zinc-800 flex justify-between"
                    >
                      <span className="text-[#A1A1AA]">Axis {idx}</span>
                      <span className="text-[#FAFAFA] font-semibold">
                        {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t text-xs"
          style={{ borderColor: 'rgba(var(--accent-rgb), 0.14)' }}
        >
          <div className="text-[#A1A1AA] flex items-center gap-2">
            <span>{t.deadzoneLabel}:</span>
            <span className="font-mono font-bold text-[#FAFAFA]">
              {Math.round(deadzone * 100)}%
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            style={{
              backgroundColor: 'rgba(var(--accent-rgb), 0.14)',
              border: '1px solid rgba(var(--accent-rgb), 0.45)',
              color: 'var(--accent-color)',
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {t.diagOpenSettings}
          </button>
        </div>
      </div>
    </div>
  );
}
