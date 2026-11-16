import {Gamepad2, SlidersHorizontal, Volume2, VolumeX} from 'lucide-react';
import {useEffect, useState} from 'react';
import {ComboHistoryBar} from './components/ComboHistoryBar';
import {ControllerNameEditor} from './components/ControllerNameEditor';
import {DualShock2SVG} from './components/DualShock2SVG';
import {LastPressedCard} from './components/LastPressedCard';
import {QuickReferencePanel} from './components/QuickReferencePanel';
import {
  clampDeadzone,
  DEFAULT_DEADZONE,
  SettingsPanel,
} from './components/SettingsPanel';
import {useGamepad} from './hooks/useGamepad';

const SOUND_STORAGE_KEY = 'ps2-pad-guide:sound-enabled';
const CUSTOM_NAMES_STORAGE_KEY = 'ps2-pad-guide:custom-names';
const DEADZONE_STORAGE_KEY = 'ps2-pad-guide:deadzone';

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

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(loadSoundPreference);
  const [customNames, setCustomNames] = useState<Record<string, string>>(loadCustomNames);
  const [deadzone, setDeadzone] = useState<number>(loadDeadzonePreference);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, String(soundEnabled));
    } catch {
      // Ignore storage quota errors
    }
  }, [soundEnabled]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CUSTOM_NAMES_STORAGE_KEY, JSON.stringify(customNames));
    } catch {
      // Ignore storage quota errors
    }
  }, [customNames]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DEADZONE_STORAGE_KEY, deadzone.toFixed(2));
    } catch {
      // Ignore storage quota errors
    }
  }, [deadzone]);

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
    comboHistory,
    pressSimulated,
    releaseSimulated,
    clearHistory,
  } = useGamepad(soundEnabled, deadzone);

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

  return (
    <div className="cyber-grid-bg min-h-screen lg:h-screen lg:overflow-hidden flex flex-col text-[#FAFAFA]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex-1 flex flex-col gap-3 min-h-0">
        {/* Minimalist Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-pink-500/15 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-pink-500/15 border border-pink-500/35 flex items-center justify-center text-[#FF2E93] shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#FAFAFA] leading-tight truncate">
                PS2 Pad Guide
              </h1>
              <p className="text-xs text-[#A1A1AA] truncate">
                Tradutor Visual X-Input para PlayStation 2
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 max-w-full">
            {/* Live Connection Status + Inline Custom Name Editor */}
            <div className="flex items-center gap-2 text-xs min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  showActivatedStatus
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : 'bg-[#FF2E93] animate-pulse shadow-[0_0_8px_rgba(255,46,147,0.8)]'
                }`}
                aria-hidden="true"
              />
              {showActivatedStatus ? (
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-medium text-emerald-400 whitespace-nowrap">
                    Controle Conectado
                  </span>
                  {deviceName && (
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
                <span className="font-medium text-pink-300 whitespace-nowrap">
                  {isConnected ? 'Aguardando botão...' : 'Aguardando controle'}
                </span>
              )}
            </div>

            {/* Settings Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Abrir ajustes finos do controle"
              title="Ajustar zona morta dos analógicos"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-pink-500/20 bg-[#121216] text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-pink-500/45 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF2E93]" />
              <span className="hidden sm:inline">Ajustes</span>
            </button>

            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? 'Desativar som de clique' : 'Ativar som de clique'}
              title={soundEnabled ? 'Efeitos sonoros PS2 ativados' : 'Som mutado'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                soundEnabled
                  ? 'bg-[#FF2E93]/20 border-[#FF2E93] text-pink-100 neon-glow-pink'
                  : 'bg-[#121216] border-pink-500/20 text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-pink-500/40'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#FF2E93]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{soundEnabled ? 'Som PS2' : 'Sem som'}</span>
            </button>
          </div>
        </header>

        {/* Waiting for Controller / Activation Banner */}
        {!showActivatedStatus && (
          <div
            role="status"
            className="shrink-0 bg-[#121216] border border-pink-500/35 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 neon-glow-pink animate-pulse"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Gamepad2 className="w-4 h-4 text-[#FF2E93] shrink-0" />
              <p className="text-xs sm:text-sm text-[#FAFAFA] leading-snug">
                Conecte seu controle (modo PC / X-Input) e{' '}
                <span className="text-[#FF2E93] font-semibold">aperte qualquer botão</span> para
                ativar a detecção
              </p>
            </div>
            <span className="hidden md:inline font-mono text-[11px] text-[#A1A1AA] shrink-0 whitespace-nowrap">
              Ou clique no controle SVG
            </span>
          </div>
        )}

        {/* Connected Device Info + Inline Editor on Narrow Viewports */}
        {showActivatedStatus && deviceName && (
          <div className="md:hidden shrink-0 px-1 flex items-center justify-between gap-2 text-[11px] text-[#A1A1AA]">
            <ControllerNameEditor
              rawDeviceName={deviceName}
              customName={activeCustomName}
              onSaveCustomName={handleSaveCustomName}
              onResetCustomName={handleResetCustomName}
            />
          </div>
        )}

        {/* Main Workspace Grid */}
        <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Centerpiece: Interactive DualShock 2 SVG */}
          <section
            aria-label="Controle PlayStation 2 Interativo"
            className="lg:col-span-8 bg-[#121216]/90 border border-pink-500/20 rounded-xl p-3 sm:p-5 flex flex-col items-center justify-center relative min-h-[280px] min-w-0"
          >
            <div className="w-full max-w-[660px] flex items-center justify-center">
              <DualShock2SVG
                pressedButtons={pressedButtons}
                l2Value={l2Value}
                r2Value={r2Value}
                leftStick={leftStick}
                rightStick={rightStick}
                onButtonDown={(idx) => pressSimulated(idx)}
                onButtonUp={(idx) => releaseSimulated(idx)}
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-[#A1A1AA]">
              <span>Clique em qualquer botão no desenho para testar</span>
              <span aria-hidden="true" className="hidden sm:inline">
                ·
              </span>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="font-mono tabular-nums hover:text-[#FF2E93] transition-colors cursor-pointer underline decoration-pink-500/35 underline-offset-4"
              >
                Zona morta: {deadzone.toFixed(2)}
              </button>
            </div>
          </section>

          {/* Side Column: Last Pressed Highlight + Quick Reference Table */}
          <aside className="lg:col-span-4 flex flex-col gap-3 min-h-0">
            <LastPressedCard
              activeButtons={activeButtons}
              lastPressed={lastPressed}
              l2Value={l2Value}
              r2Value={r2Value}
              leftStick={leftStick}
              rightStick={rightStick}
            />

            <QuickReferencePanel
              pressedButtons={pressedButtons}
              onTestButtonDown={(idx) => pressSimulated(idx)}
              onTestButtonUp={(idx) => releaseSimulated(idx)}
            />
          </aside>
        </main>

        {/* Bottom Bar: 10-Input Combo / Code Sequence History */}
        <footer className="shrink-0">
          <ComboHistoryBar
            history={comboHistory}
            controllerName={effectiveControllerName}
            deadzone={deadzone}
            onClear={clearHistory}
          />
        </footer>
      </div>

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
