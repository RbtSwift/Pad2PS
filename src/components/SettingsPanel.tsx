import {ArrowLeftRight, Copy, Download, ExternalLink, Github, Mail, RefreshCw, RotateCcw, ShieldCheck, SlidersHorizontal, Upload, X} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import type {AppLanguage, Translations} from '../data/i18n';
import type {StickState} from '../hooks/useGamepad';
import {openExternalUrl} from '../hooks/useIsInstalledApp';
import {checkForAppUpdate, type UpdateCheckResult} from '../utils/updateChecker';

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
  lang: AppLanguage;
  t: Translations;
  onOpenRemap?: () => void;
  onOpenUpdateModal?: (info: UpdateCheckResult) => void;
}

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
  lang,
  t,
  onOpenRemap,
  onOpenUpdateModal,
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const presets =
    lang === 'en'
      ? [
          {value: 0.05, label: '0.05 · Precise'},
          {value: 0.1, label: '0.10 · Default'},
          {value: 0.15, label: '0.15 · Smooth'},
          {value: 0.25, label: '0.25 · Anti-Drift'},
        ]
      : [
          {value: 0.05, label: '0.05 · Preciso'},
          {value: 0.1, label: '0.10 · Padrão'},
          {value: 0.15, label: '0.15 · Suave'},
          {value: 0.25, label: '0.25 · Anti-Drift'},
        ];

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
    const formattedDateTime = now.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });

    const content = (
      lang === 'en'
        ? [
            '==================================================',
            'Pad2PS - Controller Fine-Tuning Profile',
            '==================================================',
            `Controller: ${controllerName || 'Default / Disconnected'}`,
            `Date/Time: ${formattedDateTime}`,
            '',
            `deadzone=${deadzone.toFixed(2)}`,
            `sound_enabled=${soundEnabled}`,
            '',
            'Notes:',
            `- Deadzone set to ${(deadzone * 100).toFixed(0)}% (range: 0.05 to 0.25).`,
            '- You can re-import this .txt file inside Settings.',
            '',
          ]
        : [
            '==================================================',
            'Pad2PS - Ajustes Finos do Controle',
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
          ]
    ).join('\n');

    const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pad2ps-config-${yyyy}-${mm}-${dd}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setImportMessage(
      lang === 'en' ? 'Settings saved to .txt file' : 'Preferência salva em arquivo .txt'
    );
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
        setImportMessage(
          lang === 'en'
            ? 'No deadzone configuration found in file.'
            : 'Nenhuma configuração de deadzone encontrada no arquivo.'
        );
        return;
      }
      const parsed = Number.parseFloat(match[1].replace(',', '.'));
      if (Number.isNaN(parsed)) {
        setImportMessage(
          lang === 'en'
            ? 'Invalid deadzone value in file.'
            : 'Valor de deadzone inválido no arquivo.'
        );
        return;
      }
      const next = clampDeadzone(parsed);
      onDeadzoneChange(next);
      setImportMessage(
        lang === 'en'
          ? `Deadzone ${next.toFixed(2)} loaded from .txt`
          : `Deadzone ${next.toFixed(2)} carregada do .txt`
      );
    } catch {
      setImportMessage(
        lang === 'en'
          ? 'Could not read the selected file.'
          : 'Não foi possível ler o arquivo selecionado.'
      );
    }
  };

  const copySupportEmail = async () => {
    try {
      await navigator.clipboard.writeText('contato@pad2ps.com.br');
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  const openOfficialLink = (url: string) => {
    void openExternalUrl(url, true);
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
        className="w-full max-w-md bg-[#121216] rounded-2xl p-5 shadow-[0_24px_60px_rgba(0,0,0,0.85)] neon-glow-accent flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
        style={{border: '1px solid rgba(var(--accent-rgb), 0.38)'}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="font-display text-base font-bold text-[#FAFAFA]">
                {t.settingsTitle}
              </h2>
              <p className="text-xs text-[#A1A1AA]">{t.settingsSubtitle}</p>
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

        {/* Deadzone Slider Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="deadzone-slider" className="text-sm font-semibold text-[#FAFAFA]">
              {t.deadzoneLabel} (Deadzone)
            </label>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-sm font-bold tabular-nums"
                style={{color: 'var(--accent-color)'}}
              >
                {deadzone.toFixed(2)}
              </span>
              <span className="font-mono text-xs text-[#A1A1AA] tabular-nums">
                ({Math.round(deadzone * 100)}%)
              </span>
            </div>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">{t.settingsDeadzoneDesc}</p>

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
                background: `linear-gradient(to right, var(--accent-color) 0%, var(--accent-color) ${sliderProgressPct}%, #27272A ${sliderProgressPct}%, #27272A 100%)`,
                accentColor: 'var(--accent-color)',
              }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
            />
            <div className="mt-1.5 flex items-center justify-between font-mono text-[11px] text-[#A1A1AA] tabular-nums">
              <span>{lang === 'en' ? '0.05 (Sensitive)' : '0.05 (Sensível)'}</span>
              <span>0.15</span>
              <span>{lang === 'en' ? '0.25 (Max)' : '0.25 (Máxima)'}</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
            {presets.map((preset) => {
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
                    active ? 'text-white neon-glow-accent' : 'bg-[#09090B]/70 text-[#A1A1AA] hover:text-[#FAFAFA]'
                  }`}
                  style={
                    active
                      ? {
                          backgroundColor: 'rgba(var(--accent-rgb), 0.24)',
                          borderColor: 'var(--accent-color)',
                        }
                      : {borderColor: 'rgba(var(--accent-rgb), 0.16)'}
                  }
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Drift Calibration Monitor */}
        <div
          className="bg-[#09090B]/80 border rounded-xl p-3 space-y-2"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.18)'}}
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-[#FAFAFA]">{t.settingsMonitor}</span>
            <span className="font-mono text-[#A1A1AA] tabular-nums">
              {t.settingsLimit}: {deadzone.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono tabular-nums">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[#A1A1AA]">
                <span>Stick L</span>
                <span
                  className={leftSuppressed ? 'text-emerald-400' : ''}
                  style={!leftSuppressed ? {color: 'var(--accent-color)'} : undefined}
                >
                  {leftSuppressed ? t.settingsDriftFiltered : `${leftStick.x.toFixed(2)}, ${leftStick.y.toFixed(2)}`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-900 relative overflow-hidden">
                <div
                  className="h-full transition-[width] duration-75"
                  style={{
                    width: `${Math.round(rawLeftMag * 100)}%`,
                    backgroundColor: 'rgba(var(--accent-rgb), 0.45)',
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5"
                  style={{
                    left: `${Math.round(deadzone * 100)}%`,
                    backgroundColor: 'var(--accent-color)',
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[#A1A1AA]">
                <span>Stick R</span>
                <span
                  className={rightSuppressed ? 'text-emerald-400' : ''}
                  style={!rightSuppressed ? {color: 'var(--accent-color)'} : undefined}
                >
                  {rightSuppressed ? t.settingsDriftFiltered : `${rightStick.x.toFixed(2)}, ${rightStick.y.toFixed(2)}`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-900 relative overflow-hidden">
                <div
                  className="h-full transition-[width] duration-75"
                  style={{
                    width: `${Math.round(rawRightMag * 100)}%`,
                    backgroundColor: 'rgba(var(--accent-rgb), 0.45)',
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5"
                  style={{
                    left: `${Math.round(deadzone * 100)}%`,
                    backgroundColor: 'var(--accent-color)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Remap Shortcut */}
        {onOpenRemap && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRemap();
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border bg-[#09090B]/80 text-xs font-medium text-[#FAFAFA] hover:bg-white/5 transition-colors cursor-pointer"
            style={{borderColor: 'rgba(var(--accent-rgb), 0.28)'}}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
            <span>{t.remapButton}</span>
          </button>
        )}

        {/* Persistence Actions */}
        <div
          className="pt-2 border-t flex flex-col gap-2.5"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.16)'}}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-emerald-400/90">{t.settingsAutoSaved}</span>

            {Math.abs(deadzone - DEFAULT_DEADZONE) >= 0.001 && (
              <button
                type="button"
                onClick={() => {
                  setImportMessage(null);
                  onDeadzoneChange(DEFAULT_DEADZONE);
                }}
                className="inline-flex items-center gap-1 text-[11px] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t.settingsRestoreDefault}</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportSettingsTxt}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#09090B]/90 border text-[#FAFAFA] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              style={{borderColor: 'rgba(var(--accent-rgb), 0.38)'}}
            >
              <Download className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
              <span>{t.settingsSaveTxt}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border text-[#FAFAFA] hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
              style={{borderColor: 'rgba(var(--accent-rgb), 0.25)'}}
            >
              <Upload className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
              <span>{t.settingsLoadTxt}</span>
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
            <p className="text-[11px] text-center" style={{color: 'var(--accent-color)'}}>
              {importMessage}
            </p>
          )}
        </div>

        {/* Verificação de Atualizações */}
        <div
          className="pt-2 border-t flex flex-col gap-2.5"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.16)'}}
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#FAFAFA]">
                {lang === 'en' ? 'About & Legal' : 'Sobre & Legal'}
              </p>
              <p className="mt-0.5 text-[11px] text-[#A1A1AA]">
                Pad2PS - {lang === 'en' ? 'Controller Guide' : 'Guia de Controle'} · v1.0.6
              </p>
            </div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px]"
              style={{
                color: 'var(--accent-color)',
                backgroundColor: 'rgba(var(--accent-rgb), 0.12)',
                border: '1px solid rgba(var(--accent-rgb), 0.22)',
              }}
            >
              <ShieldCheck className="w-3 h-3" />
              {lang === 'en' ? '100% local' : '100% local'}
            </span>
          </div>

          <p className="text-[11px] leading-relaxed text-[#A1A1AA]">
            {lang === 'en'
              ? 'No telemetry or data collection. All control and calibration data stays on this device.'
              : 'Sem telemetria ou coleta de dados. Todos os dados de controles e calibração permanecem neste dispositivo.'}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => openOfficialLink('https://www.pad2ps.com.br')}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg border bg-[#09090B]/90 text-[11px] text-[#FAFAFA] hover:bg-white/5 cursor-pointer"
              style={{borderColor: 'rgba(var(--accent-rgb), 0.28)'}}
            >
              <ExternalLink className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
              {lang === 'en' ? 'Official website' : 'Site oficial'}
            </button>
            <button
              type="button"
              onClick={() => openOfficialLink('https://www.pad2ps.com.br/termos-de-uso')}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg border bg-[#09090B]/90 text-[11px] text-[#FAFAFA] hover:bg-white/5 cursor-pointer"
              style={{borderColor: 'rgba(var(--accent-rgb), 0.28)'}}
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
              {lang === 'en' ? 'Terms & Privacy' : 'Termos & Privacidade'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="mailto:contato@pad2ps.com.br"
              onClick={(event) => {
                event.preventDefault();
                openOfficialLink('mailto:contato@pad2ps.com.br');
              }}
              className="inline-flex flex-1 min-w-[175px] items-center gap-1.5 px-2.5 py-2 rounded-lg border text-[11px] text-[#FAFAFA] hover:bg-white/5"
              style={{borderColor: 'rgba(var(--accent-rgb), 0.28)'}}
            >
              <Mail className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
              contato@pad2ps.com.br
            </a>
            <button
              type="button"
              onClick={() => void copySupportEmail()}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg border bg-[#09090B]/90 text-[11px] text-[#FAFAFA] hover:bg-white/5 cursor-pointer"
              style={{borderColor: 'rgba(var(--accent-rgb), 0.28)'}}
            >
              <Copy className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
              {copyStatus === 'copied'
                ? (lang === 'en' ? 'Copied' : 'Copiado')
                : copyStatus === 'failed'
                  ? (lang === 'en' ? 'Copy failed' : 'Falha ao copiar')
                  : (lang === 'en' ? 'Copy' : 'Copiar')}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t pt-2 text-[11px]" style={{borderColor: 'rgba(var(--accent-rgb), 0.12)'}}>
            <button type="button" onClick={() => openOfficialLink('https://github.com/RbtSwift/Pad2PS')} className="inline-flex items-center gap-1.5 text-[#A1A1AA] hover:text-white cursor-pointer">
              <Github className="w-3.5 h-3.5" /> GitHub
            </button>
            <button type="button" onClick={() => openOfficialLink('https://github.com/RbtSwift/Pad2PS/issues')} className="text-[#A1A1AA] hover:text-white cursor-pointer">
              {lang === 'en' ? 'GitHub Issues' : 'GitHub Issues'}
            </button>
            <button type="button" onClick={() => openOfficialLink('https://discord.gg/TWfKNvGkcj')} className="text-[#A1A1AA] hover:text-white cursor-pointer">
              Discord
            </button>
          </div>
        </div>

        <div
          className="pt-2 border-t flex flex-col gap-2"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.16)'}}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#A1A1AA]">
              {lang === 'en' ? 'App Version:' : 'Versão do App:'} <strong className="text-white">v1.0.6</strong>
            </span>
            <button
              type="button"
              disabled={isCheckingUpdate}
              onClick={async () => {
                setIsCheckingUpdate(true);
                setUpdateMessage(null);
                try {
                  const res = await checkForAppUpdate('RbtSwift/Pad2PS', '1.0.6');
                  if (res.hasUpdate && onOpenUpdateModal) {
                    onOpenUpdateModal(res);
                  } else if (res.error) {
                    setUpdateMessage(
                      lang === 'en'
                        ? 'Could not check updates. Check your connection.'
                        : 'Não foi possível verificar atualizações. Sem conexão.'
                    );
                  } else {
                    setUpdateMessage(
                      lang === 'en'
                        ? 'Pad2PS is up to date (v1.0.6)!'
                        : 'Você já está usando a versão mais recente (v1.0.6)!'
                    );
                  }
                } catch {
                  setUpdateMessage(
                    lang === 'en'
                      ? 'Error checking updates.'
                      : 'Erro ao verificar atualizações.'
                  );
                } finally {
                  setIsCheckingUpdate(false);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-[#09090B]/90 text-[#FAFAFA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
              style={{borderColor: 'rgba(var(--accent-rgb), 0.35)'}}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} style={{color: 'var(--accent-color)'}} />
              <span>{isCheckingUpdate ? (lang === 'en' ? 'Checking...' : 'Verificando...') : (lang === 'en' ? 'Check for Updates' : 'Verificar Atualizações')}</span>
            </button>
          </div>

          {updateMessage && (
            <p className="text-[11px] text-center text-emerald-400">
              {updateMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
