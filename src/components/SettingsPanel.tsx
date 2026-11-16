import {Download, RotateCcw, SlidersHorizontal, Upload, X} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import type {StickState} from '../hooks/useGamepad';

export const MIN_DEADZONE = 0.05;
export const MAX_DEADZONE = 0.25;
export const DEFAULT_DEADZONE = 0.1;

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  deadzone: number;
  onDeadzoneChange: (value: number) => void;
  soundEnabled: boolean;
  controllerName: string | null;
  leftStick: StickState;
  rightStick: StickState;
  rawLeftStick: StickState;
  rawRightStick: StickState;
}

const PRESETS = [
  {value: 0.05, label: '0.05 · Preciso'},
  {value: 0.1, label: '0.10 · Padrão'},
  {value: 0.15, label: '0.15 · Suave'},
  {value: 0.25, label: '0.25 · Anti-Drift'},
];

export function clampDeadzone(value: number): number {
  const clamped = Math.max(MIN_DEADZONE, Math.min(MAX_DEADZONE, value));
  return Math.round(clamped * 100) / 100;
}

export function SettingsPanel({
  isOpen,
  onClose,
  deadzone,
  onDeadzoneChange,
  soundEnabled,
  controllerName,
  leftStick,
  rightStick,
  rawLeftStick,
  rawRightStick,
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sliderProgressPct =
    ((deadzone - MIN_DEADZONE) / (MAX_DEADZONE - MIN_DEADZONE)) * 100;

  const rawLeftMag = Math.min(1, Math.hypot(rawLeftStick.x, rawLeftStick.y));
  const rawRightMag = Math.min(1, Math.hypot(rawRightStick.x, rawRightStick.y));
  const leftSuppressed = rawLeftMag > 0.005 && leftStick.x === 0 && leftStick.y === 0;
  const rightSuppressed = rawRightMag > 0.005 && rightStick.x === 0 && rightStick.y === 0;

  const handleExportSettingsTxt = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const formattedDateTime = now.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });

    const content = [
      '==================================================',
      'PS2 Pad Guide - Ajustes Finos do Controle',
      '==================================================',
      `Controle: ${controllerName || 'Padrão / Não conectado'}`,
      `Data/Hora: ${formattedDateTime}`,
      '',
      `deadzone=${deadzone.toFixed(2)}`,
      `sound_enabled=${soundEnabled}`,
      '',
      'Notas:',
      `- Zona morta configurada para ${(deadzone * 100).toFixed(0)}% (faixa: 0.05 a 0.25).`,
      '- Você pode importar este arquivo .txt novamente no painel de Ajustes.',
      '',
    ].join('\n');

    const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `config-ps2-pad-${yyyy}-${mm}-${dd}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setImportMessage('Preferência salva em arquivo .txt');
  };

  const handleImportTxt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const match = text.match(/deadzone\s*[:=]\s*([0-9]+(?:[.,][0-9]+)?)/i);
      if (!match) {
        setImportMessage('Nenhuma configuração de deadzone encontrada no arquivo.');
        return;
      }
      const parsed = Number.parseFloat(match[1].replace(',', '.'));
      if (Number.isNaN(parsed)) {
        setImportMessage('Valor de deadzone inválido no arquivo.');
        return;
      }
      const next = clampDeadzone(parsed);
      onDeadzoneChange(next);
      setImportMessage(`Deadzone ${next.toFixed(2)} carregada do .txt`);
    } catch {
      setImportMessage('Não foi possível ler o arquivo selecionado.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#121216] border border-pink-500/35 rounded-2xl p-5 shadow-[0_24px_60px_rgba(0,0,0,0.85)] neon-glow-pink flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-pink-500/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/15 border border-pink-500/35 flex items-center justify-center text-[#FF2E93]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="font-display text-base font-bold text-[#FAFAFA]">
                Ajustes Finos
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Calibração dos sticks analógicos e preferências
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel de ajustes"
            className="w-8 h-8 rounded-lg border border-pink-500/20 text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-pink-500/50 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Deadzone Slider Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="deadzone-slider" className="text-sm font-semibold text-[#FAFAFA]">
              Zona Morta (Deadzone)
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#FF2E93] tabular-nums">
                {deadzone.toFixed(2)}
              </span>
              <span className="font-mono text-xs text-[#A1A1AA] tabular-nums">
                ({Math.round(deadzone * 100)}%)
              </span>
            </div>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Define o limite mínimo de inclinação antes de registrar movimento nos analógicos{' '}
            <span className="font-mono text-[#FAFAFA]">L</span> e{' '}
            <span className="font-mono text-[#FAFAFA]">R</span>, evitando tremores ou drift.
          </p>

          <div className="pt-1">
            <input
              id="deadzone-slider"
              type="range"
              min={MIN_DEADZONE}
              max={MAX_DEADZONE}
              step={0.01}
              value={deadzone}
              onChange={(e) => {
                setImportMessage(null);
                onDeadzoneChange(clampDeadzone(Number.parseFloat(e.target.value)));
              }}
              style={{
                background: `linear-gradient(to right, #FF2E93 0%, #EC4899 ${sliderProgressPct}%, #27272A ${sliderProgressPct}%, #27272A 100%)`,
              }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#FF2E93]"
            />
            <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-[#A1A1AA] tabular-nums">
              <span>0.05 (Sensível)</span>
              <span>0.15</span>
              <span>0.25 (Máxima)</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
            {PRESETS.map((preset) => {
              const active = Math.abs(deadzone - preset.value) < 0.001;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    setImportMessage(null);
                    onDeadzoneChange(preset.value);
                  }}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#FF2E93]/20 border-[#FF2E93] text-white neon-glow-pink'
                      : 'bg-[#09090B]/70 border-pink-500/15 text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-pink-500/40'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Drift Calibration Monitor */}
        <div className="bg-[#09090B]/80 border border-pink-500/15 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-[#FAFAFA]">Monitor em Tempo Real (Bruto vs. Filtrado)</span>
            <span className="font-mono text-[#A1A1AA] tabular-nums">Limite: {deadzone.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono tabular-nums">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[#A1A1AA]">
                <span>Stick L</span>
                <span className={leftSuppressed ? 'text-emerald-400' : 'text-pink-300'}>
                  {leftSuppressed ? 'Drift filtrado' : `${leftStick.x.toFixed(2)}, ${leftStick.y.toFixed(2)}`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-900 relative overflow-hidden">
                <div
                  className="h-full bg-pink-500/40 transition-[width] duration-75"
                  style={{width: `${Math.round(rawLeftMag * 100)}%`}}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#FF2E93]"
                  style={{left: `${Math.round(deadzone * 100)}%`}}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[#A1A1AA]">
                <span>Stick R</span>
                <span className={rightSuppressed ? 'text-emerald-400' : 'text-pink-300'}>
                  {rightSuppressed ? 'Drift filtrado' : `${rightStick.x.toFixed(2)}, ${rightStick.y.toFixed(2)}`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-900 relative overflow-hidden">
                <div
                  className="h-full bg-pink-500/40 transition-[width] duration-75"
                  style={{width: `${Math.round(rawRightMag * 100)}%`}}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#FF2E93]"
                  style={{left: `${Math.round(deadzone * 100)}%`}}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Persistence Actions (localStorage auto + .txt export/import) */}
        <div className="pt-2 border-t border-pink-500/15 flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-emerald-400/90">
              Salvo automaticamente no navegador
            </span>

            {Math.abs(deadzone - DEFAULT_DEADZONE) >= 0.001 && (
              <button
                type="button"
                onClick={() => {
                  setImportMessage(null);
                  onDeadzoneChange(DEFAULT_DEADZONE);
                }}
                className="inline-flex items-center gap-1 text-[11px] text-[#A1A1AA] hover:text-[#FF2E93] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar padrão (0.10)</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportSettingsTxt}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#09090B]/90 border border-pink-500/35 text-pink-200 hover:bg-[#FF2E93]/15 hover:border-[#FF2E93] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-[#FF2E93]" />
              <span>Salvar ajuste .txt</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-pink-500/25 text-[#FAFAFA] hover:bg-pink-500/15 hover:border-pink-500/50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5 text-[#FF2E93]" />
              <span>Carregar .txt</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              onChange={handleImportTxt}
              className="hidden"
            />
          </div>

          {importMessage && (
            <p className="text-[11px] text-pink-300 text-center">{importMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
