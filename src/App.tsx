import {
  BookOpen,
  Gamepad2,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {ComboHistoryBar} from './components/ComboHistoryBar';
import {ComboLibraryDrawer} from './components/ComboLibraryDrawer';
import {ControllerNameEditor} from './components/ControllerNameEditor';
import {DualShock2SVG} from './components/DualShock2SVG';
import {LastPressedCard} from './components/LastPressedCard';
import {Pad2PSLogo} from './components/Pad2PSLogo';
import {QuickReferencePanel} from './components/QuickReferencePanel';
import {
  clampDeadzone,
  DEFAULT_DEADZONE,
  SettingsPanel,
} from './components/SettingsPanel';
import {TrainingBar} from './components/TrainingBar';
import type {ComboDefinition} from './data/comboLibrary';
import {CONSOLE_META, type ConsoleLayout} from './data/ps2Mapping';
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

const LAYOUT_OPTIONS: ConsoleLayout[] = ['ps1', 'ps2', 'ps3', 'psp'];

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

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(loadSoundPreference);
  const [customNames, setCustomNames] = useState<Record<string, string>>(loadCustomNames);
  const [deadzone, setDeadzone] = useState<number>(loadDeadzonePreference);
  const [themeId, setThemeId] = useState<string>(loadThemeId);
  const [consoleLayout, setConsoleLayout] = useState<ConsoleLayout>(loadConsoleLayout);
  const [customCombos, setCustomCombos] = useState<ComboDefinition[]>(loadCustomCombos);
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isComboDrawerOpen, setIsComboDrawerOpen] = useState<boolean>(false);

  // Interactive Combo Training state
  const [activeTraining, setActiveTraining] = useState<ComboDefinition | null>(null);
  const [trainingStep, setTrainingStep] = useState<number>(0);
  const [trainingErrorFlash, setTrainingErrorFlash] = useState<boolean>(false);
  const lastHandledPressUidRef = useRef<number>(0);

  // Rumble test feedback state
  const [isVibrating, setIsVibrating] = useState<boolean>(false);
  const [rumbleNotice, setRumbleNotice] = useState<string | null>(null);

  useEffect(() => {
    const theme = getThemeById(themeId);
    applyNeonThemeToDocument(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme.id);
    } catch {
      // Ignore storage errors
    }
  }, [themeId]);

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
    comboHistory,
    pressSimulated,
    releaseSimulated,
    clearHistory,
    triggerRumble,
  } = useGamepad(soundEnabled, deadzone);

  // Validate combo training steps on every discrete button press
  useEffect(() => {
    if (!latestPressEvent) {
      return;
    }
    if (latestPressEvent.uid === lastHandledPressUidRef.current) {
      return;
    }
    lastHandledPressUidRef.current = latestPressEvent.uid;

    if (!activeTraining) {
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
  }, [latestPressEvent, activeTraining, trainingStep]);

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

  const handleDeleteCustomCombo = (id: string) => {
    setCustomCombos((prev) => prev.filter((c) => c.id !== id));
    if (activeTraining?.id === id) {
      setActiveTraining(null);
      setTrainingStep(0);
      setTrainingErrorFlash(false);
    }
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
      setRumbleNotice('Vibração não suportada por este controle ou navegador.');
    } else if (result === 'disconnected') {
      setRumbleNotice('Nenhum controle conectado para testar vibração.');
    }
  };

  return (
    <div className="cyber-grid-bg min-h-screen lg:h-screen lg:overflow-hidden flex flex-col text-[#FAFAFA]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex-1 flex flex-col gap-3 min-h-0">
        {/* Header (Standard vs Minimal Floating in Compact Mode) */}
        <header
          className={`flex flex-wrap items-center justify-between gap-3 pb-2 border-b accent-border-subtle shrink-0 ${
            isCompact ? 'bg-[#121216]/85 backdrop-blur-md px-3.5 py-2 rounded-xl border' : ''
          }`}
        >
          <Pad2PSLogo compact={isCompact} />

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 max-w-full">
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
                    Controle Conectado
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
                  {isConnected ? 'Aguardando botão...' : 'Aguardando controle'}
                </span>
              )}
            </div>

            {/* Neon Theme Swatches */}
            <div
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#121216] border accent-border-subtle"
              role="group"
              aria-label="Selecionar cor do tema neon"
            >
              {NEON_THEMES.map((theme) => {
                const selected = theme.id === themeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setThemeId(theme.id)}
                    title={theme.name}
                    aria-label={`Tema ${theme.name}`}
                    aria-pressed={selected}
                    className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                      selected ? 'scale-125 ring-2 ring-white/90 ring-offset-1 ring-offset-[#121216]' : 'opacity-70 hover:opacity-100 hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: theme.hex,
                      boxShadow: selected ? `0 0 8px ${theme.hex}` : undefined,
                    }}
                  />
                );
              })}
            </div>

            {/* Rumble Test Button (visible when controller connected) */}
            {isConnected && (
              <button
                type="button"
                onClick={handleRumbleTest}
                disabled={isVibrating}
                title="Testar motores de vibração do controle (400ms)"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isVibrating ? 'animate-pulse text-white neon-glow-accent' : 'bg-[#121216] text-[#FAFAFA] hover:bg-white/5'
                }`}
                style={{
                  borderColor: isVibrating
                    ? 'var(--accent-color)'
                    : 'rgba(var(--accent-rgb), 0.28)',
                  backgroundColor: isVibrating ? 'rgba(var(--accent-rgb), 0.22)' : undefined,
                }}
              >
                <Waves className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
                <span className="hidden xl:inline">
                  {isVibrating ? 'Vibrando...' : 'Testar Vibração'}
                </span>
              </button>
            )}

            {/* Combo Library Button */}
            {!isCompact && (
              <button
                type="button"
                onClick={() => setIsComboDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-[#121216] text-xs font-medium text-[#FAFAFA] hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.28)'}}
              >
                <BookOpen className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
                <span className="hidden md:inline">Códigos & Combos</span>
              </button>
            )}

            {/* Compact Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsCompact((prev) => !prev)}
              aria-pressed={isCompact}
              title={isCompact ? 'Sair do Modo Ultra Compacto' : 'Ativar Modo Ultra Compacto'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isCompact ? 'text-white neon-glow-accent' : 'bg-[#121216] text-[#A1A1AA] hover:text-[#FAFAFA]'
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
              <span className="hidden lg:inline">
                {isCompact ? 'Expandir' : 'Modo Compacto'}
              </span>
            </button>

            {/* Settings Trigger Button */}
            {!isCompact && (
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Abrir ajustes finos do controle"
                title="Ajustar zona morta dos analógicos"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-[#121216] text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
                <span className="hidden xl:inline">Ajustes</span>
              </button>
            )}

            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? 'Desativar som de clique' : 'Ativar som de clique'}
              title={soundEnabled ? 'Efeitos sonoros PS2 ativados' : 'Som mutado'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                soundEnabled ? 'text-white neon-glow-accent' : 'bg-[#121216] text-[#A1A1AA] hover:text-[#FAFAFA]'
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
              <span className="hidden xl:inline">{soundEnabled ? 'Som PS2' : 'Sem som'}</span>
            </button>
          </div>
        </header>

        {/* Discrete Rumble Unsupported Notice */}
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
              Fechar
            </button>
          </div>
        )}

        {/* Waiting for Controller Banner (hidden in compact mode) */}
        {!isCompact && !showActivatedStatus && (
          <div
            role="status"
            className="shrink-0 bg-[#121216] rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 neon-glow-accent animate-pulse"
            style={{border: '1px solid rgba(var(--accent-rgb), 0.4)'}}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Gamepad2 className="w-4 h-4 shrink-0" style={{color: 'var(--accent-color)'}} />
              <p className="text-xs sm:text-sm text-[#FAFAFA] leading-snug">
                Conecte seu controle (modo PC / X-Input) e{' '}
                <span className="font-semibold" style={{color: 'var(--accent-color)'}}>
                  aperte qualquer botão
                </span>{' '}
                para ativar a detecção
              </p>
            </div>
            <span className="hidden md:inline font-mono text-[11px] text-[#A1A1AA] shrink-0 whitespace-nowrap">
              Ou clique no controle SVG
            </span>
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
        {!isCompact && activeTraining && (
          <TrainingBar
            combo={activeTraining}
            currentStep={trainingStep}
            errorFlash={trainingErrorFlash}
            layout={consoleLayout}
            onRestart={() => handleStartTraining(activeTraining)}
            onStop={() => {
              setActiveTraining(null);
              setTrainingStep(0);
              setTrainingErrorFlash(false);
            }}
          />
        )}

        {/* Main Workspace Grid */}
        <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Centerpiece: Interactive Controller SVG (expands to full width in Compact Mode) */}
          <section
            aria-label="Controle PlayStation Interativo"
            className={`${
              isCompact ? 'lg:col-span-12' : 'lg:col-span-8'
            } accent-panel rounded-xl p-3 sm:p-5 flex flex-col items-center justify-between relative min-h-[280px] min-w-0`}
          >
            {/* Console Layout Segmented Tabs (PS1, PS2, PS3, PSP) */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div
                role="tablist"
                aria-label="Selecionar modelo de console PlayStation"
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

              <span className="text-[11px] font-mono text-[#A1A1AA] hidden sm:inline">
                {CONSOLE_META[consoleLayout].hardwareName}
              </span>
            </div>

            <div
              className={`w-full flex-1 flex items-center justify-center min-h-0 py-1 ${
                isCompact ? 'max-w-[960px]' : 'max-w-[660px]'
              }`}
            >
              <DualShock2SVG
                layout={consoleLayout}
                pressedButtons={pressedButtons}
                l2Value={l2Value}
                r2Value={r2Value}
                leftStick={leftStick}
                rightStick={rightStick}
                isCompact={isCompact}
                onButtonDown={(idx) => pressSimulated(idx)}
                onButtonUp={(idx) => releaseSimulated(idx)}
              />
            </div>

            {!isCompact && (
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-[#A1A1AA] shrink-0">
                <span>Clique em qualquer botão no desenho para testar</span>
                <span aria-hidden="true" className="hidden sm:inline">
                  ·
                </span>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="font-mono tabular-nums hover:text-white transition-colors cursor-pointer underline underline-offset-4"
                  style={{textDecorationColor: 'rgba(var(--accent-rgb), 0.45)'}}
                >
                  Zona morta: {deadzone.toFixed(2)}
                </button>
              </div>
            )}
          </section>

          {/* Side Column (hidden in Ultra Compact Mode) */}
          {!isCompact && (
            <aside className="lg:col-span-4 flex flex-col gap-3 min-h-0">
              <LastPressedCard
                layout={consoleLayout}
                activeButtons={activeButtons}
                lastPressed={lastPressed}
                l2Value={l2Value}
                r2Value={r2Value}
                leftStick={leftStick}
                rightStick={rightStick}
              />

              <QuickReferencePanel
                layout={consoleLayout}
                pressedButtons={pressedButtons}
                onTestButtonDown={(idx) => pressSimulated(idx)}
                onTestButtonUp={(idx) => releaseSimulated(idx)}
              />
            </aside>
          )}
        </main>

        {/* Bottom Bar (hidden in Ultra Compact Mode) */}
        {!isCompact && (
          <footer className="shrink-0">
            <ComboHistoryBar
              history={comboHistory}
              controllerName={effectiveControllerName}
              deadzone={deadzone}
              layout={consoleLayout}
              onClear={clearHistory}
            />
          </footer>
        )}
      </div>

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
        onAddCustomCombo={handleAddCustomCombo}
        onDeleteCustomCombo={handleDeleteCustomCombo}
        onStartTraining={handleStartTraining}
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
      />
    </div>
  );
}
