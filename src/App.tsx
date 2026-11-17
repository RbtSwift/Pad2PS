import {
  Activity,
  ArrowLeftRight,
  BookOpen,
  Gamepad2,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  RotateCcw,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {ComboHistoryBar} from './components/ComboHistoryBar';
import {ComboLibraryDrawer} from './components/ComboLibraryDrawer';
import {ControllerNameEditor} from './components/ControllerNameEditor';
import {DiagnosticsModal} from './components/DiagnosticsModal';
import {DualShock2SVG} from './components/DualShock2SVG';
import {LastPressedCard} from './components/LastPressedCard';
import {LegalModal} from './components/LegalModal';
import {OfflineIndicator} from './components/OfflineIndicator';
import {Pad2PSLogo} from './components/Pad2PSLogo';
import {
  CHROMA_BG_MAP,
  type ChromaMode,
  copyStylesAndVarsToWindow,
  PiPControllerPortal,
} from './components/PiPControllerPortal';
import {QuickReferencePanel} from './components/QuickReferencePanel';
import {SessionStatsWidget} from './components/SessionStatsWidget';
import {SiteFooter} from './components/SiteFooter';
import {
  clampDeadzone,
  DEFAULT_DEADZONE,
  SettingsPanel,
} from './components/SettingsPanel';
import {TrainingBar} from './components/TrainingBar';
import type {ComboDefinition} from './data/comboLibrary';
import {
  type AppLanguage,
  detectDefaultLanguage,
  getTranslations,
} from './data/i18n';
import {
  CONSOLE_META,
  type ConsoleLayout,
  getConsoleButtonDisplayName,
  PS2_BUTTON_MAP,
} from './data/ps2Mapping';
import {
  applyNeonThemeToDocument,
  DEFAULT_THEME_ID,
  getThemeById,
  NEON_THEMES,
} from './data/themes';
import {useGamepad} from './hooks/useGamepad';

const SOUND_STORAGE_KEY = 'ps2-pad-guide:sound-enabled';
const CUSTOM_NAMES_STORAGE_KEY = 'ps2-pad-guide:custom-names';
const DEADZONE_STORAGE_KEY = 'ps2-pad-guide:deadzone';
const THEME_STORAGE_KEY = 'ps2-pad-guide:theme';
const LAYOUT_STORAGE_KEY = 'ps2-pad-guide:console-layout';
const CUSTOM_COMBOS_STORAGE_KEY = 'ps2-pad-guide:custom-combos';
const LANG_STORAGE_KEY = 'pad2ps:lang';
const REMAP_STORAGE_KEY = 'pad2ps:button-remap';

const LAYOUT_OPTIONS: ConsoleLayout[] = ['ps1', 'ps2', 'ps3', 'psp'];

interface DocumentPiPApi {
  requestWindow: (options?: {width?: number; height?: number}) => Promise<Window>;
}

function loadSoundPreference(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function loadCustomNames(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(CUSTOM_NAMES_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function loadDeadzonePreference(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_DEADZONE;
  }
  try {
    const raw = window.localStorage.getItem(DEADZONE_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_DEADZONE;
    }
    const parsed = Number.parseFloat(raw);
    return Number.isNaN(parsed) ? DEFAULT_DEADZONE : clampDeadzone(parsed);
  } catch {
    return DEFAULT_DEADZONE;
  }
}

function loadThemeId(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_ID;
  }
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return getThemeById(saved).id;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

function loadConsoleLayout(): ConsoleLayout {
  if (typeof window === 'undefined') {
    return 'ps2';
  }
  try {
    const saved = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (saved === 'ps1' || saved === 'ps2' || saved === 'ps3' || saved === 'psp') {
      return saved;
    }
    return 'ps2';
  } catch {
    return 'ps2';
  }
}

function loadCustomCombos(): ComboDefinition[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(CUSTOM_COMBOS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is ComboDefinition =>
        Boolean(item) &&
        typeof item.id === 'string' &&
        typeof item.game === 'string' &&
        typeof item.title === 'string' &&
        Array.isArray(item.sequence)
    );
  } catch {
    return [];
  }
}

function loadLanguage(): AppLanguage {
  if (typeof window === 'undefined') {
    return 'pt';
  }
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'pt' || saved === 'en') {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return detectDefaultLanguage();
}

function loadRemapMap(): Record<number, number> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(REMAP_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    const clean: Record<number, number> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      const phys = Number(k);
      const target = Number(v);
      if (
        Number.isInteger(phys) &&
        Number.isInteger(target) &&
        phys >= 0 &&
        phys <= 16 &&
        target >= 0 &&
        target <= 16 &&
        phys !== target
      ) {
        clean[phys] = target;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export default function App() {
  const [lang, setLang] = useState<AppLanguage>(loadLanguage);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(loadSoundPreference);
  const [customNames, setCustomNames] = useState<Record<string, string>>(loadCustomNames);
  const [deadzone, setDeadzone] = useState<number>(loadDeadzonePreference);
  const [themeId, setThemeId] = useState<string>(loadThemeId);
  const [consoleLayout, setConsoleLayout] = useState<ConsoleLayout>(loadConsoleLayout);
  const [customCombos, setCustomCombos] = useState<ComboDefinition[]>(loadCustomCombos);
  const [remapMap, setRemapMap] = useState<Record<number, number>>(loadRemapMap);

  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [chromaMode, setChromaMode] = useState<ChromaMode>('dark');
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [isComboDrawerOpen, setIsComboDrawerOpen] = useState<boolean>(false);
  const [isLegalOpen, setIsLegalOpen] = useState<boolean>(false);

  // Remap Mode state
  const [isRemapMode, setIsRemapMode] = useState<boolean>(false);
  const [remapTargetPsIndex, setRemapTargetPsIndex] = useState<number | null>(null);
  const lastHandledRawUidRef = useRef<number>(0);

  // Interactive Combo Training state
  const [activeTraining, setActiveTraining] = useState<ComboDefinition | null>(null);
  const [trainingStep, setTrainingStep] = useState<number>(0);
  const [trainingErrorFlash, setTrainingErrorFlash] = useState<boolean>(false);
  const lastHandledPressUidRef = useRef<number>(0);

  // Rumble test feedback state
  const [isVibrating, setIsVibrating] = useState<boolean>(false);
  const [rumbleNotice, setRumbleNotice] = useState<string | null>(null);

  const t = getTranslations(lang);
  const isPipActive = Boolean(pipWindow && !pipWindow.closed);

  useEffect(() => {
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
  }, [lang]);

  useEffect(() => {
    const theme = getThemeById(themeId);
    applyNeonThemeToDocument(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme.id);
    } catch {
      // Ignore storage errors
    }
    if (pipWindow && !pipWindow.closed) {
      const root = pipWindow.document.documentElement;
      root.style.setProperty('--accent-color', theme.hex);
      root.style.setProperty('--accent-rgb', theme.rgb);
      root.style.setProperty(
        '--accent-glow',
        `0 0 18px rgba(${theme.rgb}, 0.42), 0 0 4px rgba(${theme.rgb}, 0.55)`
      );
    }
  }, [themeId, pipWindow]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, consoleLayout);
    } catch {
      // Ignore storage errors
    }
  }, [consoleLayout]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
    } catch {
      // Ignore storage errors
    }
  }, [soundEnabled]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CUSTOM_NAMES_STORAGE_KEY, JSON.stringify(customNames));
    } catch {
      // Ignore storage errors
    }
  }, [customNames]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DEADZONE_STORAGE_KEY, deadzone.toFixed(2));
    } catch {
      // Ignore storage errors
    }
  }, [deadzone]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CUSTOM_COMBOS_STORAGE_KEY, JSON.stringify(customCombos));
    } catch {
      // Ignore storage errors
    }
  }, [customCombos]);

  useEffect(() => {
    try {
      window.localStorage.setItem(REMAP_STORAGE_KEY, JSON.stringify(remapMap));
    } catch {
      // Ignore storage errors
    }
  }, [remapMap]);

  useEffect(() => {
    return () => {
      if (pipWindow && !pipWindow.closed) {
        pipWindow.close();
      }
    };
  }, [pipWindow]);

  const {
    isConnected,
    hasActivatedInput,
    deviceName,
    pressedButtons,
    l2Value,
    r2Value,
    leftStick,
    rightStick,
    rawLeftStick,
    rawRightStick,
    activeButtons,
    lastPressed,
    latestPressEvent,
    lastRawPhysicalPress,
    comboHistory,
    sessionStats,
    pressSimulated,
    releaseSimulated,
    clearHistory,
    resetStats,
    triggerRumble,
  } = useGamepad(soundEnabled, deadzone, remapMap);

  // Capture physical button press when waiting for remap binding
  useEffect(() => {
    if (!lastRawPhysicalPress) {
      return;
    }
    if (lastRawPhysicalPress.uid === lastHandledRawUidRef.current) {
      return;
    }
    lastHandledRawUidRef.current = lastRawPhysicalPress.uid;

    if (!isRemapMode || remapTargetPsIndex === null) {
      return;
    }

    const physIdx = lastRawPhysicalPress.physicalIndex;
    const targetPs = remapTargetPsIndex;

    setRemapMap((prev) => {
      const next: Record<number, number> = {...prev};
      const prevTargetOfPhys = next[physIdx] ?? physIdx;

      // Maintain 1-to-1 bijection by swapping any existing physical key pointing to targetPs
      let conflictingPhys: number | null = null;
      for (let i = 0; i <= 16; i++) {
        const mapped = next[i] ?? i;
        if (mapped === targetPs && i !== physIdx) {
          conflictingPhys = i;
          break;
        }
      }

      if (conflictingPhys !== null) {
        if (prevTargetOfPhys === conflictingPhys) {
          delete next[conflictingPhys];
        } else {
          next[conflictingPhys] = prevTargetOfPhys;
        }
      }

      if (targetPs === physIdx) {
        delete next[physIdx];
      } else {
        next[physIdx] = targetPs;
      }

      return next;
    });

    setRemapTargetPsIndex(null);
  }, [lastRawPhysicalPress, isRemapMode, remapTargetPsIndex]);

  // Validate combo training steps on every discrete button press
  useEffect(() => {
    if (!latestPressEvent) {
      return;
    }
    if (latestPressEvent.uid === lastHandledPressUidRef.current) {
      return;
    }
    lastHandledPressUidRef.current = latestPressEvent.uid;

    if (isRemapMode || !activeTraining) {
      return;
    }
    if (trainingStep >= activeTraining.sequence.length) {
      return;
    }

    const expectedBtnId = activeTraining.sequence[trainingStep];
    if (latestPressEvent.button.id === expectedBtnId) {
      setTrainingErrorFlash(false);
      setTrainingStep((prev) => prev + 1);
    } else {
      setTrainingErrorFlash(true);
    }
  }, [latestPressEvent, activeTraining, trainingStep, isRemapMode]);

  useEffect(() => {
    if (!trainingErrorFlash) {
      return;
    }
    const timer = window.setTimeout(() => setTrainingErrorFlash(false), 450);
    return () => window.clearTimeout(timer);
  }, [trainingErrorFlash]);

  useEffect(() => {
    if (!rumbleNotice) {
      return;
    }
    const timer = window.setTimeout(() => setRumbleNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [rumbleNotice]);

  const showActivatedStatus = isConnected && hasActivatedInput;
  const activeCustomName = deviceName ? customNames[deviceName] ?? null : null;
  const effectiveControllerName = deviceName ? activeCustomName || deviceName : null;
  const hasActiveRemap = Object.keys(remapMap).length > 0;

  const handleSaveCustomName = (newName: string) => {
    if (!deviceName) {
      return;
    }
    setCustomNames((prev) => ({
      ...prev,
      [deviceName]: newName,
    }));
  };

  const handleResetCustomName = () => {
    if (!deviceName) {
      return;
    }
    setCustomNames((prev) => {
      if (!(deviceName in prev)) {
        return prev;
      }
      const next = {...prev};
      delete next[deviceName];
      return next;
    });
  };

  const handleStartTraining = (combo: ComboDefinition) => {
    setIsRemapMode(false);
    setRemapTargetPsIndex(null);
    setActiveTraining(combo);
    setTrainingStep(0);
    setTrainingErrorFlash(false);
    if (latestPressEvent) {
      lastHandledPressUidRef.current = latestPressEvent.uid;
    }
  };

  const handleAddCustomCombo = (combo: Omit<ComboDefinition, 'id' | 'isCustom'>) => {
    const newCombo: ComboDefinition = {
      ...combo,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      isCustom: true,
    };
    setCustomCombos((prev) => [newCombo, ...prev]);
  };

  const handleImportCustomCombos = (imported: ComboDefinition[]) => {
    setCustomCombos((prev) => {
      const existingSig = new Set(
        prev.map((c) => `${c.game}::${c.title}::${c.sequence.join(',')}`)
      );
      const fresh = imported.filter(
        (c) => !existingSig.has(`${c.game}::${c.title}::${c.sequence.join(',')}`)
      );
      return [...fresh, ...prev];
    });
  };

  const handleImportAndTrainCombo = (combo: ComboDefinition) => {
    setCustomCombos((prev) => {
      const sig = `${combo.game}::${combo.title}::${combo.sequence.join(',')}`;
      const existing = prev.find(
        (c) => `${c.game}::${c.title}::${c.sequence.join(',')}` === sig
      );
      if (existing) {
        return prev;
      }
      return [combo, ...prev];
    });
    handleStartTraining(combo);
  };

  const handleDeleteCustomCombo = (id: string) => {
    setCustomCombos((prev) => prev.filter((c) => c.id !== id));
    if (activeTraining?.id === id) {
      setActiveTraining(null);
      setTrainingStep(0);
      setTrainingErrorFlash(false);
    }
  };

  const handleToggleRemapMode = () => {
    setIsRemapMode((prev) => {
      const next = !prev;
      setRemapTargetPsIndex(null);
      if (lastRawPhysicalPress) {
        lastHandledRawUidRef.current = lastRawPhysicalPress.uid;
      }
      return next;
    });
  };

  const handleSelectRemapTarget = (psIndex: number) => {
    if (lastRawPhysicalPress) {
      lastHandledRawUidRef.current = lastRawPhysicalPress.uid;
    }
    setRemapTargetPsIndex((prev) => (prev === psIndex ? null : psIndex));
  };

  const handleJapanesePreset = () => {
    setRemapMap((prev) => {
      const next = {...prev};
      const current0 = next[0] ?? 0;
      const current1 = next[1] ?? 1;
      if (current0 === 1 && current1 === 0) {
        delete next[0];
        delete next[1];
      } else {
        // Clear any existing bindings targeting 0 or 1 so X/O swap is clean
        for (const [k, v] of Object.entries(next)) {
          if (v === 0 || v === 1) {
            delete next[Number(k)];
          }
        }
        next[0] = 1;
        next[1] = 0;
      }
      return next;
    });
    setRemapTargetPsIndex(null);
  };

  const handleTogglePiP = async () => {
    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }

    const theme = getThemeById(themeId);
    const docPiP = (window as Window & {documentPictureInPicture?: DocumentPiPApi})
      .documentPictureInPicture;

    let openedWin: Window | null = null;
    if (docPiP && typeof docPiP.requestWindow === 'function') {
      try {
        openedWin = await docPiP.requestWindow({width: 420, height: 280});
      } catch {
        openedWin = null;
      }
    }

    if (!openedWin) {
      openedWin = window.open(
        '',
        'pad2ps-pip',
        'width=420,height=280,resizable=yes,menubar=no,toolbar=no,location=no,status=no'
      );
    }

    if (!openedWin) {
      setRumbleNotice(
        lang === 'en'
          ? 'Pop-up / Floating window blocked by browser.'
          : 'Janela flutuante bloqueada pelo navegador.'
      );
      return;
    }

    copyStylesAndVarsToWindow(openedWin, theme.hex, theme.rgb);
    openedWin.addEventListener('pagehide', () => setPipWindow(null));
    openedWin.addEventListener('beforeunload', () => setPipWindow(null));
    setPipWindow(openedWin);
  };

  const handleRumbleTest = async () => {
    if (isVibrating) {
      return;
    }
    setRumbleNotice(null);
    setIsVibrating(true);
    const result = await triggerRumble();
    window.setTimeout(() => {
      setIsVibrating(false);
    }, 400);

    if (result === 'unsupported') {
      setRumbleNotice(t.rumbleUnsupported);
    } else if (result === 'disconnected') {
      setRumbleNotice(t.rumbleDisconnected);
    }
  };

  const remapTargetName =
    remapTargetPsIndex !== null && PS2_BUTTON_MAP[remapTargetPsIndex]
      ? getConsoleButtonDisplayName(PS2_BUTTON_MAP[remapTargetPsIndex], consoleLayout, lang)
      : null;

  return (
    <div className="cyber-grid-bg min-h-screen w-full overflow-x-hidden flex flex-col text-[#FAFAFA]">
      <div className="w-full max-w-[2400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 flex-1 flex flex-col gap-3 lg:gap-4 min-h-0">
        {/* Header */}
        <header
          className={`w-full flex flex-wrap items-center justify-between gap-2 lg:gap-3 pb-2.5 border-b accent-border-subtle shrink-0 ${
            isCompact ? 'bg-[#121216]/85 backdrop-blur-md px-3.5 py-2 rounded-xl border' : ''
          }`}
        >
          <Pad2PSLogo compact={isCompact} t={t} />

          <div className="flex flex-1 flex-wrap items-center justify-end gap-2 lg:gap-3 min-w-0 max-w-full">
            {/* Live Connection Status + Inline Custom Name Editor */}
            <div className="flex items-center gap-2 text-xs min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  showActivatedStatus ? 'bg-emerald-400' : 'animate-pulse'
                }`}
                style={
                  showActivatedStatus
                    ? {boxShadow: '0 0 8px rgba(52, 211, 153, 0.8)'}
                    : {
                        backgroundColor: 'var(--accent-color)',
                        boxShadow: '0 0 8px rgba(var(--accent-rgb), 0.8)',
                      }
                }
                aria-hidden="true"
              />
              {showActivatedStatus ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-medium text-emerald-400 whitespace-nowrap">
                    {t.connectedControl}
                  </span>
                  {!isCompact && deviceName && (
                    <div className="hidden md:flex items-center gap-1 min-w-0">
                      <span className="text-zinc-600" aria-hidden="true">
                        ·
                      </span>
                      <ControllerNameEditor
                        rawDeviceName={deviceName}
                        customName={activeCustomName}
                        onSaveCustomName={handleSaveCustomName}
                        onResetCustomName={handleResetCustomName}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <span
                  className="font-medium whitespace-nowrap"
                  style={{color: 'var(--accent-color)'}}
                >
                  {isConnected ? t.waitingButton : t.waitingControl}
                </span>
              )}
            </div>

            {/* Neon Theme Swatches */}
            <div
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#121216] border accent-border-subtle"
              role="group"
              aria-label="Neon theme"
            >
              {NEON_THEMES.map((theme) => {
                const selected = theme.id === themeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setThemeId(theme.id)}
                    title={theme.name}
                    aria-label={theme.name}
                    aria-pressed={selected}
                    className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                      selected
                        ? 'scale-125 ring-2 ring-white/90 ring-offset-1 ring-offset-[#121216]'
                        : 'opacity-70 hover:opacity-100 hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: theme.hex,
                      boxShadow: selected ? `0 0 8px ${theme.hex}` : undefined,
                    }}
                  />
                );
              })}
            </div>

            {/* PT | EN Language Toggle */}
            <div
              role="group"
              aria-label="Language"
              className="inline-flex items-center p-0.5 rounded-lg bg-[#121216] border accent-border-subtle text-[11px] font-mono"
            >
              {(['pt', 'en'] as const).map((code) => {
                const active = lang === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    aria-pressed={active}
                    className={`px-2 py-1 rounded-md font-semibold uppercase transition-colors cursor-pointer ${
                      active ? 'text-white' : 'text-[#A1A1AA] hover:text-white'
                    }`}
                    style={
                      active
                        ? {
                            backgroundColor: 'rgba(var(--accent-rgb), 0.28)',
                            color: '#FFFFFF',
                          }
                        : undefined
                    }
                  >
                    {code.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Floating Picture-in-Picture (PiP) Button */}
            <button
              type="button"
              onClick={handleTogglePiP}
              aria-pressed={Boolean(pipWindow && !pipWindow.closed)}
              title={t.pipButton}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                pipWindow && !pipWindow.closed
                  ? 'text-white neon-glow-accent'
                  : 'bg-[#121216] text-[#FAFAFA] hover:bg-white/5'
              }`}
              style={{
                borderColor:
                  pipWindow && !pipWindow.closed
                    ? 'var(--accent-color)'
                    : 'rgba(var(--accent-rgb), 0.28)',
                backgroundColor:
                  pipWindow && !pipWindow.closed
                    ? 'rgba(var(--accent-rgb), 0.24)'
                    : undefined,
              }}
            >
              <PictureInPicture2
                className="w-3.5 h-3.5"
                style={{color: 'var(--accent-color)'}}
              />
              <span className="hidden 2xl:inline">
                {pipWindow && !pipWindow.closed ? t.pipActive : t.pipButton}
              </span>
            </button>

            {/* Diagnostics & Analog Radars Button */}
            {!isCompact && (
              <button
                type="button"
                onClick={() => setIsDiagnosticsOpen(true)}
                title={t.diagnosticsButton}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-[#121216] text-xs font-medium text-[#FAFAFA] hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.28)'}}
              >
                <Activity className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
                <span className="hidden 2xl:inline">{t.diagnosticsButton}</span>
              </button>
            )}

            {/* Remap Mode Button */}
            {!isCompact && (
              <button
                type="button"
                onClick={handleToggleRemapMode}
                aria-pressed={isRemapMode}
                title={t.remapButton}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isRemapMode || hasActiveRemap
                    ? 'text-white neon-glow-accent'
                    : 'bg-[#121216] text-[#FAFAFA] hover:bg-white/5'
                }`}
                style={{
                  borderColor:
                    isRemapMode || hasActiveRemap
                      ? 'var(--accent-color)'
                      : 'rgba(var(--accent-rgb), 0.28)',
                  backgroundColor: isRemapMode
                    ? 'rgba(var(--accent-rgb), 0.26)'
                    : hasActiveRemap
                      ? 'rgba(var(--accent-rgb), 0.14)'
                      : undefined,
                }}
              >
                <ArrowLeftRight
                  className="w-3.5 h-3.5"
                  style={{color: 'var(--accent-color)'}}
                />
                <span className="hidden xl:inline">
                  {isRemapMode ? t.remapActive : t.remapButton}
                </span>
              </button>
            )}

            {/* Rumble Test Button (visible when controller connected) */}
            {isConnected && (
              <button
                type="button"
                onClick={handleRumbleTest}
                disabled={isVibrating}
                title={t.rumbleButton}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isVibrating
                    ? 'animate-pulse text-white neon-glow-accent'
                    : 'bg-[#121216] text-[#FAFAFA] hover:bg-white/5'
                }`}
                style={{
                  borderColor: isVibrating
                    ? 'var(--accent-color)'
                    : 'rgba(var(--accent-rgb), 0.28)',
                  backgroundColor: isVibrating ? 'rgba(var(--accent-rgb), 0.22)' : undefined,
                }}
              >
                <Waves className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
                <span className="hidden 2xl:inline">
                  {isVibrating ? t.rumbleVibrating : t.rumbleButton}
                </span>
              </button>
            )}

            {/* Combo Library Button */}
            {!isCompact && (
              <button
                type="button"
                onClick={() => setIsComboDrawerOpen(true)}
                title={t.combosButton}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-[#121216] text-xs font-medium text-[#FAFAFA] hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.28)'}}
              >
                <BookOpen className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
                <span className="hidden md:inline">{t.combosButton}</span>
              </button>
            )}

            {/* Compact Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsCompact((prev) => !prev)}
              aria-pressed={isCompact}
              title={isCompact ? t.expandButton : t.compactButton}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isCompact
                  ? 'text-white neon-glow-accent'
                  : 'bg-[#121216] text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
              style={{
                borderColor: isCompact
                  ? 'var(--accent-color)'
                  : 'rgba(var(--accent-rgb), 0.22)',
                backgroundColor: isCompact ? 'rgba(var(--accent-rgb), 0.22)' : undefined,
              }}
            >
              {isCompact ? (
                <Maximize2 className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
              ) : (
                <Minimize2 className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
              )}
              <span className="hidden 2xl:inline">
                {isCompact ? t.expandButton : t.compactButton}
              </span>
            </button>

            {/* Settings Trigger Button */}
            {!isCompact && (
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                aria-label={t.settingsButton}
                title={t.settingsButton}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-[#121216] text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
              >
                <SlidersHorizontal
                  className="w-3.5 h-3.5"
                  style={{color: 'var(--accent-color)'}}
                />
                <span className="hidden 2xl:inline">{t.settingsButton}</span>
              </button>
            )}

            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? t.soundOn : t.soundOff}
              title={soundEnabled ? t.soundOn : t.soundOff}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                soundEnabled
                  ? 'text-white neon-glow-accent'
                  : 'bg-[#121216] text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
              style={{
                borderColor: soundEnabled
                  ? 'var(--accent-color)'
                  : 'rgba(var(--accent-rgb), 0.22)',
                backgroundColor: soundEnabled ? 'rgba(var(--accent-rgb), 0.22)' : undefined,
              }}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
              <span className="hidden 2xl:inline">{soundEnabled ? t.soundOn : t.soundOff}</span>
            </button>
          </div>
        </header>

        {/* Discrete Notice (Rumble / PiP Fallback) */}
        {rumbleNotice && (
          <div
            role="status"
            className="shrink-0 bg-[#121216] border rounded-lg px-3.5 py-1.5 text-xs text-[#A1A1AA] flex items-center justify-between gap-2"
            style={{borderColor: 'rgba(var(--accent-rgb), 0.3)'}}
          >
            <span>{rumbleNotice}</span>
            <button
              type="button"
              onClick={() => setRumbleNotice(null)}
              className="text-xs hover:text-white cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        )}

        {/* Waiting for Controller Banner */}
        {!isCompact && !showActivatedStatus && !isRemapMode && (
          <div
            role="status"
            className="w-full shrink-0 bg-[#121216] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 neon-glow-accent animate-pulse"
            style={{border: '1px solid rgba(var(--accent-rgb), 0.4)'}}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Gamepad2 className="w-4 h-4 shrink-0" style={{color: 'var(--accent-color)'}} />
              <p className="text-xs sm:text-sm text-[#FAFAFA] leading-snug">
                {t.waitingBannerPrefix}{' '}
                <span className="font-semibold" style={{color: 'var(--accent-color)'}}>
                  {t.waitingBannerHighlight}
                </span>{' '}
                {t.waitingBannerSuffix}
              </p>
            </div>
            <span className="hidden md:inline font-mono text-[11px] text-[#A1A1AA] shrink-0 whitespace-nowrap">
              {t.orClickSvg}
            </span>
          </div>
        )}

        {/* Interactive Remap Mode Banner */}
        {!isCompact && isRemapMode && (
          <div
            role="region"
            aria-label={t.remapButton}
            className="w-full shrink-0 bg-[#121216] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 neon-glow-accent"
            style={{border: '1px solid var(--accent-color)'}}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ArrowLeftRight
                className="w-4 h-4 shrink-0"
                style={{color: 'var(--accent-color)'}}
              />
              <p className="text-xs sm:text-sm text-[#FAFAFA] leading-snug">
                {remapTargetName ? (
                  <>
                    {t.remapBannerStep2}{' '}
                    <strong style={{color: 'var(--accent-color)'}}>{remapTargetName}</strong>
                  </>
                ) : (
                  t.remapBannerStep1
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleJapanesePreset}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-[#09090B]/90 text-xs font-medium text-[#FAFAFA] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                style={{
                  borderColor:
                    remapMap[0] === 1 && remapMap[1] === 0
                      ? 'var(--accent-color)'
                      : 'rgba(var(--accent-rgb), 0.35)',
                }}
              >
                <ArrowLeftRight className="w-3 h-3" style={{color: 'var(--accent-color)'}} />
                <span>{t.remapJapanesePreset}</span>
              </button>

              {hasActiveRemap && (
                <button
                  type="button"
                  onClick={() => {
                    setRemapMap({});
                    setRemapTargetPsIndex(null);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-700 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.remapReset}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsRemapMode(false);
                  setRemapTargetPsIndex(null);
                }}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-white cursor-pointer whitespace-nowrap"
                style={{
                  backgroundColor: 'rgba(var(--accent-rgb), 0.28)',
                  border: '1px solid var(--accent-color)',
                }}
              >
                {t.remapDone}
              </button>
            </div>
          </div>
        )}

        {/* Connected Device Editor on Narrow Viewports */}
        {!isCompact && showActivatedStatus && deviceName && (
          <div className="md:hidden shrink-0 px-1 flex items-center justify-between gap-2 text-[11px] text-[#A1A1AA]">
            <ControllerNameEditor
              rawDeviceName={deviceName}
              customName={activeCustomName}
              onSaveCustomName={handleSaveCustomName}
              onResetCustomName={handleResetCustomName}
            />
          </div>
        )}

        {/* Active Interactive Combo Training Guide Bar */}
        {!isCompact && !isRemapMode && activeTraining && (
          <TrainingBar
            combo={activeTraining}
            currentStep={trainingStep}
            errorFlash={trainingErrorFlash}
            layout={consoleLayout}
            t={t}
            onRestart={() => handleStartTraining(activeTraining)}
            onStop={() => {
              setActiveTraining(null);
              setTrainingStep(0);
              setTrainingErrorFlash(false);
            }}
          />
        )}

        {/* Main Workspace Grid */}
        <main className="flex-1 min-h-0 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-6 items-stretch">
          {/* Centerpiece: Interactive Controller SVG */}
          <section
            aria-label="PlayStation Controller"
            className={`${
              isCompact ? 'lg:col-span-12' : 'lg:col-span-7 xl:col-span-8'
            } accent-panel rounded-xl p-3 sm:p-5 lg:p-6 flex flex-col items-center justify-between relative min-h-[300px] h-full w-full min-w-0 transition-colors`}
            style={
              isCompact && chromaMode !== 'dark'
                ? {backgroundColor: CHROMA_BG_MAP[chromaMode], backgroundImage: 'none'}
                : undefined
            }
          >
            {/* Console Layout Segmented Tabs + OBS Chroma Key in Compact Mode */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div
                role="tablist"
                aria-label="PlayStation Layout"
                className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#09090B]/85 border accent-border-subtle"
              >
                {LAYOUT_OPTIONS.map((option) => {
                  const active = consoleLayout === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setConsoleLayout(option)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        active ? 'text-white neon-glow-accent' : 'text-[#A1A1AA] hover:text-[#FAFAFA]'
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: 'rgba(var(--accent-rgb), 0.25)',
                              border: '1px solid var(--accent-color)',
                            }
                          : {border: '1px solid transparent'}
                      }
                    >
                      {CONSOLE_META[option].shortLabel}
                    </button>
                  );
                })}
              </div>

              {isCompact ? (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#09090B]/90 border accent-border-subtle"
                  role="group"
                  aria-label={t.chromaLabel}
                >
                  <span className="text-[11px] font-mono text-[#A1A1AA]">{t.chromaLabel}:</span>
                  <button
                    type="button"
                    onClick={() => setChromaMode('dark')}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border cursor-pointer ${
                      chromaMode === 'dark'
                        ? 'border-white text-white bg-zinc-800'
                        : 'border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {t.chromaDark}
                  </button>
                  <button
                    type="button"
                    onClick={() => setChromaMode('green')}
                    title={t.chromaGreen}
                    aria-label={t.chromaGreen}
                    className={`w-5 h-5 rounded border cursor-pointer ${
                      chromaMode === 'green' ? 'ring-2 ring-white' : 'border-white/30'
                    }`}
                    style={{backgroundColor: '#00FF00'}}
                  />
                  <button
                    type="button"
                    onClick={() => setChromaMode('magenta')}
                    title={t.chromaMagenta}
                    aria-label={t.chromaMagenta}
                    className={`w-5 h-5 rounded border cursor-pointer ${
                      chromaMode === 'magenta' ? 'ring-2 ring-white' : 'border-white/30'
                    }`}
                    style={{backgroundColor: '#FF00FF'}}
                  />
                </div>
              ) : (
                <span className="text-[11px] font-mono text-[#A1A1AA] hidden sm:inline">
                  {CONSOLE_META[consoleLayout].hardwareName}
                </span>
              )}
            </div>

            <div className="w-full flex-1 flex items-center justify-center min-h-0 py-2">
              <DualShock2SVG
                layout={consoleLayout}
                pressedButtons={pressedButtons}
                l2Value={l2Value}
                r2Value={r2Value}
                leftStick={leftStick}
                rightStick={rightStick}
                isCompact={isCompact}
                isRemapMode={isRemapMode}
                remapTargetIndex={remapTargetPsIndex}
                onSelectRemapTarget={handleSelectRemapTarget}
                onButtonDown={(idx) => pressSimulated(idx)}
                onButtonUp={(idx) => releaseSimulated(idx)}
              />
            </div>

            {!isCompact && (
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-[#A1A1AA] shrink-0">
                <span>{t.clickToTest}</span>
                <span aria-hidden="true" className="hidden sm:inline">
                  ·
                </span>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="font-mono tabular-nums hover:text-white transition-colors cursor-pointer underline underline-offset-4"
                  style={{textDecorationColor: 'rgba(var(--accent-rgb), 0.45)'}}
                >
                  {t.deadzoneLabel}: {deadzone.toFixed(2)}
                </button>
                <span aria-hidden="true" className="hidden sm:inline">
                  ·
                </span>
                <button
                  type="button"
                  onClick={() => setIsDiagnosticsOpen(true)}
                  className="font-mono hover:text-white transition-colors cursor-pointer underline underline-offset-4"
                  style={{textDecorationColor: 'rgba(var(--accent-rgb), 0.45)'}}
                >
                  {t.diagnosticsButton}
                </button>
              </div>
            )}
          </section>

          {/* Side Column (hidden in Ultra Compact Mode) */}
          {!isCompact && (
            <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4 justify-between h-full min-w-0">
              <LastPressedCard
                layout={consoleLayout}
                activeButtons={activeButtons}
                lastPressed={lastPressed}
                l2Value={l2Value}
                r2Value={r2Value}
                leftStick={leftStick}
                rightStick={rightStick}
                remapMap={remapMap}
                lang={lang}
                t={t}
              />

              <SessionStatsWidget stats={sessionStats} t={t} onReset={resetStats} />

              <QuickReferencePanel
                layout={consoleLayout}
                pressedButtons={pressedButtons}
                remapMap={remapMap}
                t={t}
                onTestButtonDown={(idx) => pressSimulated(idx)}
                onTestButtonUp={(idx) => releaseSimulated(idx)}
              />
            </aside>
          )}
        </main>

        {/* Bottom Bar */}
        {!isCompact && (
          <footer className="w-full shrink-0 flex flex-col gap-2.5">
            <ComboHistoryBar
              history={comboHistory}
              controllerName={effectiveControllerName}
              deadzone={deadzone}
              layout={consoleLayout}
              lang={lang}
              t={t}
              onClear={clearHistory}
            />
            {!isPipActive && (
              <SiteFooter t={t} onOpenLegal={() => setIsLegalOpen(true)} />
            )}
          </footer>
        )}
      </div>

      {/* Floating PiP Window Portal */}
      <PiPControllerPortal
        pipWindow={pipWindow}
        chromaMode={chromaMode}
        onChangeChroma={setChromaMode}
        onClose={() => {
          if (pipWindow && !pipWindow.closed) {
            pipWindow.close();
          }
          setPipWindow(null);
        }}
        layout={consoleLayout}
        pressedButtons={pressedButtons}
        l2Value={l2Value}
        r2Value={r2Value}
        leftStick={leftStick}
        rightStick={rightStick}
        onButtonDown={(idx) => pressSimulated(idx)}
        onButtonUp={(idx) => releaseSimulated(idx)}
        t={t}
      />

      {/* Combo Library Drawer */}
      <ComboLibraryDrawer
        isOpen={isComboDrawerOpen}
        onClose={() => setIsComboDrawerOpen(false)}
        activeTrainingId={activeTraining?.id ?? null}
        layout={consoleLayout}
        customCombos={customCombos}
        controllerName={effectiveControllerName}
        isControllerConnected={isConnected}
        latestPressEvent={latestPressEvent}
        lang={lang}
        t={t}
        onAddCustomCombo={handleAddCustomCombo}
        onImportCustomCombos={handleImportCustomCombos}
        onImportAndTrainCombo={handleImportAndTrainCombo}
        onDeleteCustomCombo={handleDeleteCustomCombo}
        onStartTraining={handleStartTraining}
      />

      {/* Analog Diagnostics & Drift Radar Modal */}
      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        deadzone={deadzone}
        leftStick={leftStick}
        rightStick={rightStick}
        rawLeftStick={rawLeftStick}
        rawRightStick={rawRightStick}
        t={t}
      />

      {/* Fine-Tuning Settings Modal */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        deadzone={deadzone}
        onDeadzoneChange={setDeadzone}
        soundEnabled={soundEnabled}
        controllerName={effectiveControllerName}
        leftStick={leftStick}
        rightStick={rightStick}
        rawLeftStick={rawLeftStick}
        rawRightStick={rawRightStick}
        lang={lang}
        t={t}
        onOpenRemap={() => {
          setIsRemapMode(true);
          setRemapTargetPsIndex(null);
        }}
      />
      {/* Legal / Terms of Use, Privacy & Disclaimer Modal */}
      <LegalModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        lang={lang}
        t={t}
      />
      <OfflineIndicator t={t} />
    </div>
  );
}
