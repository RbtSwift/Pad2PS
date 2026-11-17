import {
  Check,
  Copy,
  Cpu,
  Download,
  FileCode2,
  FolderOpen,
  Gamepad2,
  Lightbulb,
  Sliders,
  Waves,
  Wrench,
  X,
} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import type {AppLanguage, Translations} from '../data/i18n';
import {CONSOLE_META} from '../data/ps2Mapping';
import {
  type ConfigEmulatorId,
  type DuckStationDriver,
  generateEmulatorConfig,
  getEmulatorQuickGuides,
  type GuideEmulatorId,
} from '../utils/emulatorConfigGenerator';

interface EmulatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  remapMap: Record<number, number>;
  controllerName: string | null;
  deadzone: number;
  lang: AppLanguage;
  t: Translations;
}

type ModalSectionTab = 'generator' | 'guide';

const CONFIG_EMULATOR_OPTIONS: {
  id: ConfigEmulatorId;
  label: string;
  consoleTag: string;
}[] = [
  {id: 'duckstation', label: 'DuckStation', consoleTag: 'PS1'},
  {id: 'pcsx2', label: 'PCSX2', consoleTag: 'PS2'},
  {id: 'ppsspp', label: 'PPSSPP', consoleTag: 'PSP'},
];

function renderIniSyntaxLine(line: string, index: number) {
  const trimmed = line.trim();
  if (trimmed.startsWith(';') || trimmed.startsWith('#')) {
    return (
      <div key={index} className="text-zinc-500 italic select-text">
        {line}
      </div>
    );
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return (
      <div
        key={index}
        className="font-bold mt-1 first:mt-0 select-text"
        style={{color: 'var(--accent-color)'}}
      >
        {line}
      </div>
    );
  }
  const eqIndex = line.indexOf('=');
  if (eqIndex > 0) {
    const keyPart = line.slice(0, eqIndex).trimEnd();
    const valPart = line.slice(eqIndex + 1).trimStart();
    return (
      <div key={index} className="select-text">
        <span className="text-sky-300">{keyPart}</span>
        <span className="text-zinc-500"> = </span>
        <span className="text-emerald-300">{valPart}</span>
      </div>
    );
  }
  return (
    <div key={index} className="text-zinc-300 select-text">
      {line}
    </div>
  );
}

export function EmulatorsModal({
  isOpen,
  onClose,
  remapMap,
  controllerName,
  deadzone,
  lang,
  t,
}: EmulatorsModalProps) {
  const [sectionTab, setSectionTab] = useState<ModalSectionTab>('generator');
  const [selectedConfigEmu, setSelectedConfigEmu] =
    useState<ConfigEmulatorId>('duckstation');
  const [duckStationDriver, setDuckStationDriver] =
    useState<DuckStationDriver>('SDL');
  const [selectedGuideEmu, setSelectedGuideEmu] =
    useState<GuideEmulatorId>('duckstation');
  const [copied, setCopied] = useState<boolean>(false);

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

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const generated = useMemo(
    () =>
      generateEmulatorConfig({
        emulator: selectedConfigEmu,
        remapMap,
        controllerName,
        deadzone,
        duckStationDriver,
        lang,
      }),
    [selectedConfigEmu, remapMap, controllerName, deadzone, duckStationDriver, lang]
  );

  const quickGuides = useMemo(() => getEmulatorQuickGuides(lang), [lang]);
  const activeGuide =
    quickGuides.find((g) => g.id === selectedGuideEmu) ?? quickGuides[0];

  if (!isOpen) {
    return null;
  }

  const remapCount = Object.keys(remapMap).length;
  const previewLines = generated.content.split('\n');

  const handleDownloadIni = () => {
    const blob = new Blob([generated.content], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = generated.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(generated.content);
      setCopied(true);
    } catch {
      // Fallback copy via temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = generated.content;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emulators-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] rounded-2xl bg-[#121216] border flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden"
        style={{borderColor: 'rgba(var(--accent-rgb), 0.38)'}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between gap-3 shrink-0"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.16)'}}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'rgba(var(--accent-rgb), 0.16)',
                border: '1px solid rgba(var(--accent-rgb), 0.38)',
                color: 'var(--accent-color)',
              }}
            >
              <Cpu className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="emulators-modal-title"
                className="font-display text-base font-bold text-[#FAFAFA] truncate"
              >
                {t.emulatorsTitle}
              </h2>
              <p className="text-xs text-[#A1A1AA] truncate">{t.emulatorsSubtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="w-8 h-8 rounded-lg border text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            style={{borderColor: 'rgba(var(--accent-rgb), 0.24)'}}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Navigation Switch: Generator vs. Quick Setup Guide */}
        <div
          className="px-5 py-3 border-b bg-[#0B0B0F] flex flex-wrap items-center justify-between gap-2 shrink-0"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.14)'}}
        >
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-[#121216] border accent-border-subtle">
            <button
              type="button"
              onClick={() => setSectionTab('generator')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                sectionTab === 'generator'
                  ? 'text-white neon-glow-accent'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
              style={
                sectionTab === 'generator'
                  ? {
                      backgroundColor: 'rgba(var(--accent-rgb), 0.25)',
                      border: '1px solid var(--accent-color)',
                    }
                  : {border: '1px solid transparent'}
              }
            >
              <FileCode2 className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
              <span>{t.emuTabGenerator}</span>
            </button>

            <button
              type="button"
              onClick={() => setSectionTab('guide')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                sectionTab === 'guide'
                  ? 'text-white neon-glow-accent'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
              style={
                sectionTab === 'guide'
                  ? {
                      backgroundColor: 'rgba(var(--accent-rgb), 0.25)',
                      border: '1px solid var(--accent-color)',
                    }
                  : {border: '1px solid transparent'}
              }
            >
              <Wrench className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
              <span>{t.emuTabGuide}</span>
            </button>
          </div>

          {/* Active Mapping & Controller Summary Pill */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#A1A1AA]">
            <Gamepad2 className="w-3.5 h-3.5 shrink-0" style={{color: 'var(--accent-color)'}} />
            <span className="truncate max-w-[180px] sm:max-w-[240px]">
              {controllerName || (lang === 'en' ? 'Standard X-Input' : 'X-Input Padrão')}
            </span>
            <span className="text-zinc-600">·</span>
            <span
              className={remapCount > 0 ? 'font-semibold text-emerald-400' : 'text-[#A1A1AA]'}
            >
              {remapCount > 0
                ? lang === 'en'
                  ? `${remapCount} remapped`
                  : `${remapCount} remapeado${remapCount > 1 ? 's' : ''}`
                : lang === 'en'
                  ? 'Default map'
                  : 'Padrão'}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {sectionTab === 'generator' ? (
            <>
              {/* Emulator Selector Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {CONFIG_EMULATOR_OPTIONS.map((emu) => {
                    const active = selectedConfigEmu === emu.id;
                    return (
                      <button
                        key={emu.id}
                        type="button"
                        onClick={() => setSelectedConfigEmu(emu.id)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                          active
                            ? 'text-white neon-glow-accent'
                            : 'bg-[#09090B]/80 text-[#A1A1AA] hover:text-[#FAFAFA]'
                        }`}
                        style={{
                          backgroundColor: active
                            ? 'rgba(var(--accent-rgb), 0.22)'
                            : undefined,
                          borderColor: active
                            ? 'var(--accent-color)'
                            : 'rgba(var(--accent-rgb), 0.22)',
                        }}
                      >
                        <span>{emu.label}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                          style={{
                            backgroundColor: 'rgba(var(--accent-rgb), 0.16)',
                            color: 'var(--accent-color)',
                          }}
                        >
                          {emu.consoleTag}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* DuckStation Driver Switch */}
                {selectedConfigEmu === 'duckstation' && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#09090B]/90 border accent-border-subtle text-[11px] font-mono">
                    <span className="text-[#A1A1AA]">Driver:</span>
                    {(['SDL', 'XInput'] as const).map((drv) => {
                      const active = duckStationDriver === drv;
                      return (
                        <button
                          key={drv}
                          type="button"
                          onClick={() => setDuckStationDriver(drv)}
                          className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                            active ? 'text-white' : 'text-[#A1A1AA] hover:text-white'
                          }`}
                          style={
                            active
                              ? {backgroundColor: 'rgba(var(--accent-rgb), 0.28)'}
                              : undefined
                          }
                        >
                          {drv}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Syntax-Highlighted INI Preview Box */}
              <div
                className="rounded-xl bg-[#09090B] border overflow-hidden"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.26)'}}
              >
                <div
                  className="px-3.5 py-2 border-b bg-[#0F0F14] flex flex-wrap items-center justify-between gap-2"
                  style={{borderColor: 'rgba(var(--accent-rgb), 0.14)'}}
                >
                  <div className="flex items-center gap-2">
                    <FileCode2
                      className="w-3.5 h-3.5"
                      style={{color: 'var(--accent-color)'}}
                    />
                    <span className="font-mono text-xs font-semibold text-[#FAFAFA]">
                      {generated.fileName}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      · Deadzone {deadzone.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyContent}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121216] border text-xs font-medium text-[#FAFAFA] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                      style={{
                        borderColor: copied
                          ? '#34D399'
                          : 'rgba(var(--accent-rgb), 0.3)',
                      }}
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy
                          className="w-3.5 h-3.5"
                          style={{color: 'var(--accent-color)'}}
                        />
                      )}
                      <span>{copied ? t.emuCopied : t.emuCopyContent}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadIni}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer whitespace-nowrap neon-glow-accent"
                      style={{
                        backgroundColor: 'rgba(var(--accent-rgb), 0.28)',
                        border: '1px solid var(--accent-color)',
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.emuDownloadIni}</span>
                    </button>
                  </div>
                </div>

                <pre className="p-3.5 text-xs font-mono leading-relaxed overflow-x-auto max-h-[280px] overflow-y-auto">
                  <code>{previewLines.map(renderIniSyntaxLine)}</code>
                </pre>
              </div>

              {/* 2-Line Where-To-Paste Instruction Tip */}
              <div
                className="rounded-xl bg-[#09090B]/85 border px-4 py-3 flex items-start gap-3"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.24)'}}
              >
                <FolderOpen
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{color: 'var(--accent-color)'}}
                />
                <div className="text-xs leading-relaxed text-[#D4D4D8]">
                  <span className="font-semibold text-[#FAFAFA]">
                    {t.emuWhereToPaste}:{' '}
                  </span>
                  <span>{generated.installPathHint}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Quick Setup Guide Emulator Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {quickGuides.map((guide) => {
                  const active = guide.id === activeGuide.id;
                  return (
                    <button
                      key={guide.id}
                      type="button"
                      onClick={() => setSelectedGuideEmu(guide.id)}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        active
                          ? 'text-white neon-glow-accent'
                          : 'bg-[#09090B]/80 text-[#A1A1AA] hover:text-[#FAFAFA]'
                      }`}
                      style={{
                        backgroundColor: active
                          ? 'rgba(var(--accent-rgb), 0.22)'
                          : undefined,
                        borderColor: active
                          ? 'var(--accent-color)'
                          : 'rgba(var(--accent-rgb), 0.22)',
                      }}
                    >
                      <span>{guide.name}</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                        style={{
                          backgroundColor: 'rgba(var(--accent-rgb), 0.16)',
                          color: 'var(--accent-color)',
                        }}
                      >
                        {CONSOLE_META[guide.consoleTag].shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 3 Objective Visual Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Card 1: Recommended Input Driver */}
                <article
                  className="rounded-xl bg-[#09090B]/85 border p-4 flex flex-col gap-2.5"
                  style={{borderColor: 'rgba(var(--accent-rgb), 0.26)'}}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: 'rgba(var(--accent-rgb), 0.14)',
                        border: '1px solid rgba(var(--accent-rgb), 0.35)',
                        color: 'var(--accent-color)',
                      }}
                    >
                      <Sliders className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-[#FAFAFA] leading-snug">
                      {activeGuide.driverTitle}
                    </h3>
                  </div>

                  <span
                    className="inline-flex self-start px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold"
                    style={{
                      backgroundColor: 'rgba(var(--accent-rgb), 0.16)',
                      color: 'var(--accent-color)',
                    }}
                  >
                    {activeGuide.driverBadge}
                  </span>

                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {activeGuide.driverDesc}
                  </p>
                </article>

                {/* Card 2: Vibration / Rumble */}
                <article
                  className="rounded-xl bg-[#09090B]/85 border p-4 flex flex-col gap-2.5"
                  style={{borderColor: 'rgba(var(--accent-rgb), 0.26)'}}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: 'rgba(var(--accent-rgb), 0.14)',
                        border: '1px solid rgba(var(--accent-rgb), 0.35)',
                        color: 'var(--accent-color)',
                      }}
                    >
                      <Waves className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-[#FAFAFA] leading-snug">
                      {activeGuide.rumbleTitle}
                    </h3>
                  </div>

                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {activeGuide.rumbleDesc}
                  </p>
                </article>

                {/* Card 3: Pro Calibration / Pressure Tip */}
                <article
                  className="rounded-xl bg-[#09090B]/85 border p-4 flex flex-col gap-2.5"
                  style={{borderColor: 'rgba(var(--accent-rgb), 0.26)'}}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: 'rgba(var(--accent-rgb), 0.14)',
                        border: '1px solid rgba(var(--accent-rgb), 0.35)',
                        color: 'var(--accent-color)',
                      }}
                    >
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-[#FAFAFA] leading-snug">
                      {activeGuide.proTipTitle}
                    </h3>
                  </div>

                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {activeGuide.proTipDesc}
                  </p>
                </article>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
