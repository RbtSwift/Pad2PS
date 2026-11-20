import {
  Activity,
  ArrowLeftRight,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  BookOpen,
  Cpu,
  Download,
  Gamepad2,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  RotateCcw,
  Settings2,
  Home,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {ComboHistoryBar} from './components/ComboHistoryBar';
import {ComboLibraryDrawer} from './components/ComboLibraryDrawer';
import {ContactPage} from './components/ContactPage';
import {ControllerNameEditor} from './components/ControllerNameEditor';
import {DiagnosticsModal} from './components/DiagnosticsModal';
import {DualShock2SVG} from './components/DualShock2SVG';
import {EmulatorsModal} from './components/EmulatorsModal';
import {ErrorBoundary} from './components/ErrorBoundary';
import {InstallAppModal} from './components/InstallAppModal';
import {LastPressedCard} from './components/LastPressedCard';
import {OfflineIndicator} from './components/OfflineIndicator';
import {Pad2PSIcon, Pad2PSLogo} from './components/Pad2PSLogo';
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
import {TermsPage} from './components/TermsPage';
import {UpdateModal} from './components/UpdateModal';
import {checkForAppUpdate, type UpdateCheckResult} from './utils/updateChecker';
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
import {useIsInstalledApp} from './hooks/useIsInstalledApp';
import {
  type BatteryDeviceInfo,
  fetchControllerBatteries,
  isElectronDesktop,
  isAndroidCapacitor,
  setNativePiPAlwaysOnTop,
} from './utils/nativeBridge';

const SOUND_STORAGE_KEY = 'ps2-pad-guide:sound-enabled';
const CUSTOM_NAMES_STORAGE_KEY = 'ps2-pad-guide:custom-names';
const DEADZONE_STORAGE_KEY = 'ps2-pad-guide:deadzone';
const THEME_STORAGE_KEY = 'ps2-pad-guide:theme';
const LAYOUT_STORAGE_KEY = 'ps2-pad-guide:console-layout';
const CUSTOM_COMBOS_STORAGE_KEY = 'ps2-pad-guide:custom-combos';
const LANG_STORAGE_KEY = 'pad2ps:lang';
const REMAP_STORAGE_KEY = 'pad2ps:button-remap';
const TERMS_ROUTE = '/termos-de-uso';
const CONTACT_ROUTE = '/contato-e-suporte';

function isTermsRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return normalized === TERMS_ROUTE;
}

function isContactRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return normalized === CONTACT_ROUTE;
}

function getCurrentPathname(): string {
  if (typeof window === 'undefined') {
    return '/';
  }
  return window.location.pathname || '/';
}

function buildRouteHref(targetPath: string): string {
  if (typeof window === 'undefined') {
    return targetPath;
  }
  const search = window.location.search || '';
  return `${targetPath}${search}`;
}

const LAYOUT_OPTIONS: ConsoleLayout[] = ['ps1', 'ps2', 'ps3', 'psp', 'xbox', 'switch'];

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
    if (
      saved === 'ps1' ||
      saved === 'ps2' ||
      saved === 'ps3' ||
      saved === 'psp' ||
      saved === 'xbox' ||
      saved === 'switch'
    ) {
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
    return parsed
      .filter(
        (item): item is ComboDefinition =>
          Boolean(item) &&
          typeof item.id === 'string' &&
          typeof item.game === 'string' &&
          typeof item.title === 'string' &&
          Array.isArray(item.sequence)
      )
      .map((item) => ({
        ...item,
        console:
          item.console === 'ps1' ||
          item.console === 'ps2' ||
          item.console === 'ps3' ||
          item.console === 'psp'
            ? item.console
            : 'ps2',
      }));
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

interface PiPSyncPayload {
  type?: 'state' | 'ping' | 'chroma' | 'pip-closed';
  layout?: ConsoleLayout;
  pressedButtons?: boolean[];
  l2Value?: number;
  r2Value?: number;
  leftStick?: {x: number; y: number};
  rightStick?: {x: number; y: number};
  chromaMode?: ChromaMode;
  accentHex?: string;
  accentRgb?: string;
}

function StandalonePiPView() {
  const [lang] = useState<AppLanguage>(loadLanguage);
  const [themeId] = useState<string>(loadThemeId);
  const [layout, setLayout] = useState<ConsoleLayout>(loadConsoleLayout);
  const [pressedButtons, setPressedButtons] = useState<boolean[]>(() => Array(17).fill(false));
  const [l2Value, setL2Value] = useState<number>(0);
  const [r2Value, setR2Value] = useState<number>(0);
  const [leftStick, setLeftStick] = useState<{x: number; y: number}>({x: 0, y: 0});
  const [rightStick, setRightStick] = useState<{x: number; y: number}>({x: 0, y: 0});
  const [chromaMode, setChromaMode] = useState<ChromaMode>('dark');
  const [hasSynced, setHasSynced] = useState<boolean>(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const t = getTranslations(lang);

  useEffect(() => {
    const theme = getThemeById(themeId);
    applyNeonThemeToDocument(theme);
  }, [themeId]);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') {
      return;
    }
    try {
      const ch = new BroadcastChannel('pad2ps-pip-sync');
      channelRef.current = ch;
      ch.onmessage = (event: MessageEvent<PiPSyncPayload>) => {
        const data = event.data;
        if (!data) return;
        if (data.layout) {
          setLayout(data.layout);
          if (Array.isArray(data.pressedButtons)) setPressedButtons(data.pressedButtons);
          if (typeof data.l2Value === 'number') setL2Value(data.l2Value);
          if (typeof data.r2Value === 'number') setR2Value(data.r2Value);
          if (data.leftStick) setLeftStick(data.leftStick);
          if (data.rightStick) setRightStick(data.rightStick);
          if (data.chromaMode) setChromaMode(data.chromaMode);
          setHasSynced(true);
        }
        if (data.accentHex) {
          document.documentElement.style.setProperty('--accent-color', data.accentHex);
        }
        if (data.accentRgb) {
          document.documentElement.style.setProperty('--accent-rgb', data.accentRgb);
        }
      };
      ch.postMessage({type: 'ping'});
      return () => {
        channelRef.current = null;
        ch.close();
      };
    } catch {
      return undefined;
    }
  }, []);

  const handleChromaSelect = (mode: ChromaMode) => {
    setChromaMode(mode);
    try {
      if (channelRef.current) {
        channelRef.current.postMessage({type: 'chroma', chromaMode: mode});
      } else if (typeof BroadcastChannel !== 'undefined') {
        const c = new BroadcastChannel('pad2ps-pip-sync');
        c.postMessage({type: 'chroma', chromaMode: mode});
        c.close();
      }
    } catch {
      // Ignore BroadcastChannel errors
    }
  };

  const handleClosePiP = async () => {
    try {
      if (channelRef.current) {
        channelRef.current.postMessage({type: 'pip-closed'});
      } else if (typeof BroadcastChannel !== 'undefined') {
        const c = new BroadcastChannel('pad2ps-pip-sync');
        c.postMessage({type: 'pip-closed'});
        c.close();
      }
    } catch {
      // Ignore BroadcastChannel errors
    }
    if (isElectronDesktop()) {
      await setNativePiPAlwaysOnTop(false);
    }
    window.close();
  };

  const bg = CHROMA_BG_MAP[chromaMode];

  return (
    <div
      className="w-screen h-screen flex flex-col overflow-hidden select-none text-[#FAFAFA]"
      style={{backgroundColor: bg}}
    >
      {/* Minimal Discrete Floating Bar */}
      <div
        className="px-2.5 py-1.5 flex items-center justify-between gap-2 bg-black/80 backdrop-blur-xs border-b border-white/10 shrink-0"
        style={{WebkitAppRegion: 'drag'} as React.CSSProperties}
      >
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#FAFAFA] shrink-0">
          <Pad2PSIcon cropToController className="w-6 h-4" />
          <span>
            Pad<span style={{color: 'var(--accent-color)'}}>2</span>PS
          </span>
        </div>

        {/* OBS Chroma Key Selector */}
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label={t.chromaLabel}
          style={{WebkitAppRegion: 'no-drag'} as React.CSSProperties}
        >
          <button
            type="button"
            onClick={() => handleChromaSelect('dark')}
            title={t.chromaDark}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
              chromaMode === 'dark'
                ? 'border-white text-white bg-zinc-800'
                : 'border-zinc-700 text-zinc-300 bg-zinc-900/80'
            }`}
          >
            {t.chromaDark}
          </button>
          <button
            type="button"
            onClick={() => handleChromaSelect('green')}
            title={t.chromaGreen}
            aria-label={t.chromaGreen}
            className={`w-5 h-5 rounded border cursor-pointer ${
              chromaMode === 'green' ? 'ring-2 ring-white' : 'border-white/30'
            }`}
            style={{backgroundColor: '#00FF00'}}
          />
          <button
            type="button"
            onClick={() => handleChromaSelect('magenta')}
            title={t.chromaMagenta}
            aria-label={t.chromaMagenta}
            className={`w-5 h-5 rounded border cursor-pointer ${
              chromaMode === 'magenta' ? 'ring-2 ring-white' : 'border-white/30'
            }`}
            style={{backgroundColor: '#FF00FF'}}
          />
        </div>

        <button
          type="button"
          onClick={() => void handleClosePiP()}
          title={t.close}
          aria-label={t.close}
          style={{WebkitAppRegion: 'no-drag'} as React.CSSProperties}
          className="w-5 h-5 rounded flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 text-xs cursor-pointer shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Live Controller SVG */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-2 relative">
        <DualShock2SVG
          layout={layout}
          pressedButtons={pressedButtons}
          l2Value={l2Value}
          r2Value={r2Value}
          leftStick={leftStick}
          rightStick={rightStick}
          isCompact={true}
          onButtonDown={() => {}}
          onButtonUp={() => {}}
        />
        {!hasSynced && (
          <p className="mt-1 text-[10px] text-zinc-400 font-mono">
            {t.waitingControl}...
          </p>
        )}
      </div>
    </div>
  );
}

function MainApp() {
  const [lang, setLang] = useState<AppLanguage>(loadLanguage);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(loadSoundPreference);
  const [customNames, setCustomNames] = useState<Record<string, string>>(loadCustomNames);
  const [deadzone, setDeadzone] = useState<number>(loadDeadzonePreference);
  const [themeId, setThemeId] = useState<string>(loadThemeId);
  const [consoleLayout, setConsoleLayout] = useState<ConsoleLayout>(loadConsoleLayout);
  const [autoControllerLayout, setAutoControllerLayout] = useState<boolean>(() => {
    try { return window.localStorage.getItem('pad2ps:auto-controller-layout') !== 'false'; } catch { return true; }
  });
  const [customCombos, setCustomCombos] = useState<ComboDefinition[]>(loadCustomCombos);
  const [remapMap, setRemapMap] = useState<Record<number, number>>(loadRemapMap);

  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [chromaMode, setChromaMode] = useState<ChromaMode>('dark');
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [nativePiPActive, setNativePiPActive] = useState<boolean>(false);
  const [batteryDevices, setBatteryDevices] = useState<BatteryDeviceInfo[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [isComboDrawerOpen, setIsComboDrawerOpen] = useState<boolean>(false);
  const [isEmulatorsOpen, setIsEmulatorsOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>(getCurrentPathname);

  useEffect(() => {
    let isMounted = true;
    checkForAppUpdate('RbtSwift/Pad2PS', '1.0.5')
      .then((res) => {
        if (isMounted && res.hasUpdate) {
          setUpdateInfo(res);
          setIsUpdateModalOpen(true);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

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
  const isApp = useIsInstalledApp();
  const isAndroidMobile = isAndroidCapacitor();
  const isPipActive = !isAndroidMobile && Boolean((pipWindow && !pipWindow.closed) || nativePiPActive);
  const [androidPanel, setAndroidPanel] = useState<'home' | 'reference' | 'metrics'>('home');
  const [androidWide, setAndroidWide] = useState(false);
  const [androidSettingsOpen, setAndroidSettingsOpen] = useState(false);

  useEffect(() => {
    if (!isAndroidMobile) return;
    const update = () => setAndroidWide(window.innerWidth > window.innerHeight || window.innerWidth >= 760);
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [isAndroidMobile]);
  const isTermsPage = isTermsRoute(currentPath);
  const isContactPage = isContactRoute(currentPath);
  const isInfoPage = isTermsPage || isContactPage;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handlePopState = () => {
      setCurrentPath(getCurrentPathname());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const canonicalPath = currentPath.replace(/\/+$/, '') || '/';
    const canonicalUrl = new URL(
      canonicalPath,
      'https://www.pad2ps.com.br'
    ).toString();
    const canonicalLink =
      document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const openGraphUrl = document.querySelector<HTMLMetaElement>(
      'meta[property="og:url"]'
    );
    if (canonicalLink) canonicalLink.href = canonicalUrl;
    if (openGraphUrl) openGraphUrl.content = canonicalUrl;

    if (isTermsPage) {
      document.title =
        lang === 'en'
          ? 'Terms of Use and Privacy Policy — Pad2PS Ecosystem'
          : 'Termos de Uso e Política de Privacidade — Ecossistema Pad2PS';
    } else if (isContactPage) {
      document.title =
        lang === 'en'
          ? 'Contact & Support — Pad2PS'
          : 'Contato & Suporte — Pad2PS';
    } else {
      document.title =
        lang === 'en'
          ? 'Pad2PS — Visual X-Input to PlayStation Translator'
          : 'Pad2PS — Tradutor Visual X-Input para PlayStation';
    }
  }, [currentPath, isTermsPage, isContactPage, lang]);

  const navigateTo = (targetPath: string) => {
    if (typeof window === 'undefined') {
      return;
    }
    const nextUrl = buildRouteHref(targetPath);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', nextUrl);
    }
    setCurrentPath(targetPath);
  };

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
    controllerIdentity,
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
    hardwareInfo,
    bouncingCount,
    lastBouncingButton,
    resetBouncing,
    pressSimulated,
    releaseSimulated,
    clearHistory,
    resetStats,
    triggerRumble,
  } = useGamepad(soundEnabled, deadzone, remapMap);

  useEffect(() => {
    try { window.localStorage.setItem('pad2ps:auto-controller-layout', String(autoControllerLayout)); } catch { /* storage is optional */ }
    if (autoControllerLayout && controllerIdentity) setConsoleLayout(controllerIdentity.suggestedLayout);
  }, [autoControllerLayout, controllerIdentity]);

  // Sync live controller state to Electron / ?pip=1 floating window via BroadcastChannel
  const pipChannelRef = useRef<BroadcastChannel | null>(null);
  const latestPiPStateRef = useRef<PiPSyncPayload | null>(null);

  {
    const theme = getThemeById(themeId);
    latestPiPStateRef.current = {
      type: 'state',
      layout: consoleLayout,
      pressedButtons,
      l2Value,
      r2Value,
      leftStick,
      rightStick,
      chromaMode,
      accentHex: theme.hex,
      accentRgb: theme.rgb,
    };
  }

  useEffect(() => {
    if (isAndroidMobile) return;
    if (typeof BroadcastChannel === 'undefined') {
      return;
    }
    try {
      const ch = new BroadcastChannel('pad2ps-pip-sync');
      pipChannelRef.current = ch;
      ch.onmessage = (event: MessageEvent<PiPSyncPayload>) => {
        const data = event.data;
        if (!data) return;
        if (data.type === 'ping') {
          setNativePiPActive(true);
          if (latestPiPStateRef.current) {
            ch.postMessage(latestPiPStateRef.current);
          }
        } else if (data.type === 'chroma' && data.chromaMode) {
          setChromaMode(data.chromaMode);
        } else if (data.type === 'pip-closed') {
          setNativePiPActive(false);
        }
      };
      return () => {
        pipChannelRef.current = null;
        ch.close();
      };
    } catch {
      return undefined;
    }
  }, [isAndroidMobile]);

  useEffect(() => {
    if (!nativePiPActive || !pipChannelRef.current || !latestPiPStateRef.current) {
      return;
    }
    try {
      pipChannelRef.current.postMessage(latestPiPStateRef.current);
    } catch {
      // Ignore BroadcastChannel errors
    }
  }, [
    nativePiPActive,
    consoleLayout,
    pressedButtons,
    l2Value,
    r2Value,
    leftStick,
    rightStick,
    chromaMode,
    themeId,
  ]);

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

  useEffect(() => {
    let active = true;
    const pollBattery = () => {
      fetchControllerBatteries()
        .then((list) => {
          if (active) setBatteryDevices(list);
        })
        .catch(() => {});
    };
    pollBattery();
    const id = window.setInterval(pollBattery, 12000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [isConnected]);

  const showActivatedStatus = isConnected && hasActivatedInput;
  const activeCustomName = deviceName ? customNames[deviceName] ?? null : null;
  const effectiveControllerName = deviceName ? activeCustomName || controllerIdentity?.name || deviceName : null;
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
    if (isAndroidMobile) return;
    if (isElectronDesktop()) {
      const next = !nativePiPActive;
      const ok = await setNativePiPAlwaysOnTop(next);
      setNativePiPActive(next ? ok !== false : false);
      if (next && pipChannelRef.current && latestPiPStateRef.current) {
        try {
          pipChannelRef.current.postMessage(latestPiPStateRef.current);
        } catch {
          // Ignore BroadcastChannel errors
        }
      }
      return;
    }

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

  const homeHref = buildRouteHref('/');
  const termsHref = buildRouteHref(TERMS_ROUTE);
  const contactHref = buildRouteHref(CONTACT_ROUTE);

  if (isAndroidMobile && !isInfoPage) {
    const statusText = showActivatedStatus
      ? (lang === 'en' ? 'Connected' : 'Conectado')
      : (lang === 'en' ? 'Waiting for controller' : 'Aguardando controle');
    const battery = batteryDevices[0];
    const layouts = LAYOUT_OPTIONS;
    const chooseLayout = (layout: ConsoleLayout) => {
      setAutoControllerLayout(false);
      setConsoleLayout(layout);
    };

    return (
      <div className="h-dvh w-full overflow-hidden bg-[#09090D] text-[#FAFAFA] flex flex-col" style={{paddingTop: 'env(safe-area-inset-top)'}}>
        <header className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#101015]/95">
          <div className="flex items-center gap-2"><Pad2PSIcon className="w-9 h-9"/><span className="text-xl font-black tracking-tight">Pad<span style={{color:'var(--accent-color)'}}>2</span>PS</span></div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { const idx = layouts.indexOf(consoleLayout); chooseLayout(layouts[(idx + 1) % layouts.length]); }} className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 flex items-center gap-2 text-sm"><ArrowLeftRight className="w-4 h-4"/><span>{CONSOLE_META[consoleLayout].shortLabel}</span></button>
            <button type="button" aria-label={lang === 'en' ? 'Settings' : 'Configurações'} onClick={() => setAndroidSettingsOpen(true)} className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 grid place-items-center"><Settings2 className="w-5 h-5"/></button>
          </div>
        </header>

        <main className={`mx-auto w-full max-w-[1400px] flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 ${androidWide ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3'}`}>
          {androidPanel === 'home' ? <>
            <section className="rounded-3xl border border-white/10 bg-[#121218] p-3 sm:p-4 flex flex-col min-h-[320px] sm:min-h-0" style={{boxShadow:'0 10px 40px rgba(0,0,0,.25)'}}>
              <div className="flex items-center justify-between gap-2 px-1 pb-3">
                <div className="min-w-0"><h1 className="font-bold text-base sm:text-lg truncate">{effectiveControllerName || (lang === 'en' ? 'Game controller' : 'Controle')}</h1><p className={`text-xs ${showActivatedStatus ? 'text-emerald-400' : 'text-zinc-400'}`}>{statusText}</p></div>
                <div className="flex items-center gap-2 text-xs text-zinc-300">{battery && <><BatteryMedium className="w-4 h-4 text-emerald-400"/>{battery.percentage}%</>}</div>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-2 shrink-0" role="tablist" aria-label={lang === 'en' ? 'Controller layout' : 'Layout do controle'}>
                {layouts.map((layout) => <button key={layout} type="button" role="tab" aria-selected={!autoControllerLayout && consoleLayout === layout} onClick={() => chooseLayout(layout)} className={`px-3 py-1.5 rounded-full border whitespace-nowrap text-xs font-semibold ${!autoControllerLayout && consoleLayout === layout ? 'text-white border-[var(--accent-color)] bg-[rgba(var(--accent-rgb),.18)]' : 'border-white/10 text-zinc-400 bg-black/20'}`}>{CONSOLE_META[layout].shortLabel}</button>)}
              </div>
              <div className="flex-1 min-h-[220px] sm:min-h-[280px] flex items-center justify-center overflow-hidden py-2"><DualShock2SVG layout={consoleLayout} pressedButtons={pressedButtons} l2Value={l2Value} r2Value={r2Value} leftStick={leftStick} rightStick={rightStick} isCompact={false} isRemapMode={isRemapMode} remapTargetIndex={remapTargetPsIndex} onSelectRemapTarget={handleSelectRemapTarget} onButtonDown={(idx) => pressSimulated(idx)} onButtonUp={(idx) => releaseSimulated(idx)}/></div>
              {isRemapMode ? <div className="flex items-center justify-between gap-2 rounded-xl bg-[rgba(var(--accent-rgb),.12)] px-3 py-2 text-xs"><span>{lang === 'en' ? 'Tap a controller button to remap it.' : 'Toque em um botão do controle para remapeá-lo.'}</span><button type="button" onClick={() => {setIsRemapMode(false);setRemapTargetPsIndex(null);}} className="font-bold" style={{color:'var(--accent-color)'}}>{lang === 'en' ? 'Done' : 'Concluir'}</button></div> : <p className="text-center text-[11px] text-zinc-500">{lang === 'en' ? 'Touch the diagram to test buttons' : 'Toque no diagrama para testar os botões'}</p>}
            </section>
            <div className="flex flex-col gap-3 min-h-0">
              <section className="rounded-2xl border border-white/10 bg-[#121218] p-3">
                <div className="flex items-center justify-between"><span className="text-xs text-zinc-400">{lang === 'en' ? 'Active mapping' : 'Tradução ativa'}</span><span className="text-sm font-semibold" style={{color:'var(--accent-color)'}}>X-Input → {CONSOLE_META[consoleLayout].hardwareName}</span></div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono"><span className="text-zinc-400">L2 / LT <b className="text-white">{l2Value.toFixed(2)}</b></span><span className="text-right text-zinc-400">R2 / RT <b className="text-white">{r2Value.toFixed(2)}</b></span><span className="text-zinc-400">Eixo L <b className="text-white">{leftStick.x.toFixed(2)}, {leftStick.y.toFixed(2)}</b></span><span className="text-right text-zinc-400">Eixo R <b className="text-white">{rightStick.x.toFixed(2)}, {rightStick.y.toFixed(2)}</b></span></div>
                {lastPressed && <div className="mt-2 pt-2 border-t border-white/10 text-xs text-zinc-300">{lang === 'en' ? 'Last button' : 'Último botão'}: <b style={{color:'var(--accent-color)'}}>{getConsoleButtonDisplayName(lastPressed, consoleLayout, lang)}</b></div>}
              </section>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setAndroidPanel('reference')} className="min-h-28 rounded-2xl border border-white/10 bg-[#121218] p-4 text-left hover:border-[var(--accent-color)]"><BookOpen className="w-6 h-6 mb-3" style={{color:'var(--accent-color)'}}/><b className="block text-sm">{t.quickRefTitle}</b><span className="text-xs text-zinc-400">{lang === 'en' ? 'Button mapping' : 'Mapa de botões'}</span></button>
                <button type="button" onClick={() => setAndroidPanel('metrics')} className="min-h-28 rounded-2xl border border-white/10 bg-[#121218] p-4 text-left hover:border-[var(--accent-color)]"><Activity className="w-6 h-6 mb-3" style={{color:'var(--accent-color)'}}/><b className="block text-sm">{lang === 'en' ? 'History & metrics' : 'Histórico & métricas'}</b><span className="text-xs text-zinc-400">{sessionStats.totalClicks} {t.statsClicks} · {sessionStats.apm} APM</span></button>
              </div>
            </div>
          </> : <section className="rounded-3xl border border-white/10 bg-[#121218] p-3 sm:p-4 min-h-0 overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 pb-3"><button type="button" onClick={() => setAndroidPanel('home')} className="rounded-xl p-2 bg-white/5"><Home className="w-4 h-4"/></button><h1 className="font-bold">{androidPanel === 'reference' ? t.quickRefTitle : (lang === 'en' ? 'History & metrics' : 'Histórico & métricas')}</h1></div>
            <div className="min-h-0 overflow-y-auto flex flex-col gap-3">{androidPanel === 'reference' ? <QuickReferencePanel layout={consoleLayout} pressedButtons={pressedButtons} remapMap={remapMap} t={t} onTestButtonDown={pressSimulated} onTestButtonUp={releaseSimulated}/> : <><LastPressedCard layout={consoleLayout} activeButtons={activeButtons} lastPressed={lastPressed} l2Value={l2Value} r2Value={r2Value} leftStick={leftStick} rightStick={rightStick} remapMap={remapMap} lang={lang} t={t}/><SessionStatsWidget stats={sessionStats} t={t} onReset={resetStats}/><ComboHistoryBar history={comboHistory} controllerName={effectiveControllerName} deadzone={deadzone} layout={consoleLayout} lang={lang} t={t} onClear={clearHistory}/></>}</div>
          </section>}
        </main>

        <nav className="shrink-0 px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] border-t border-white/10 bg-[#101015] flex justify-around">
          <button type="button" onClick={() => setAndroidPanel('home')} className={`flex flex-col items-center gap-1 px-5 py-1 text-xs ${androidPanel === 'home' ? 'text-[var(--accent-color)]' : 'text-zinc-400'}`}><Gamepad2 className="w-5 h-5"/>{lang === 'en' ? 'Control' : 'Controle'}</button>
          <button type="button" onClick={() => setAndroidPanel('reference')} className={`flex flex-col items-center gap-1 px-5 py-1 text-xs ${androidPanel === 'reference' ? 'text-[var(--accent-color)]' : 'text-zinc-400'}`}><BookOpen className="w-5 h-5"/>{lang === 'en' ? 'Reference' : 'Tabela'}</button>
          <button type="button" onClick={() => setAndroidPanel('metrics')} className={`flex flex-col items-center gap-1 px-5 py-1 text-xs ${androidPanel === 'metrics' ? 'text-[var(--accent-color)]' : 'text-zinc-400'}`}><Activity className="w-5 h-5"/>{lang === 'en' ? 'Metrics' : 'Métricas'}</button>
        </nav>

        {androidSettingsOpen && <div className="fixed inset-0 z-[100] bg-black/70 flex items-end sm:items-center justify-center" onClick={(event) => { if (event.target === event.currentTarget) setAndroidSettingsOpen(false); }}><section className="w-full max-w-xl max-h-[88dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#14141B] p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold">{lang === 'en' ? 'Settings' : 'Configurações'}</h2><button type="button" onClick={() => setAndroidSettingsOpen(false)} className="p-2 rounded-xl bg-white/5">×</button></div>
          <h3 className="text-sm font-semibold mb-2">{lang === 'en' ? 'Color theme' : 'Tema de cor'}</h3><div className="flex gap-3 mb-5">{NEON_THEMES.map((theme) => <button key={theme.id} type="button" onClick={() => setThemeId(theme.id)} title={theme.name} aria-label={theme.name} className={`w-9 h-9 rounded-full border-2 ${themeId === theme.id ? 'border-white scale-110' : 'border-white/20'}`} style={{backgroundColor:theme.hex}}/>)}</div>
          <div className="grid grid-cols-2 gap-3 mb-5"><div><h3 className="text-sm font-semibold mb-2">Idioma</h3><div className="flex rounded-xl bg-black/30 p-1"><button onClick={() => setLang('pt')} className={`flex-1 py-2 rounded-lg text-sm ${lang === 'pt' ? 'bg-white/10 text-white' : 'text-zinc-400'}`}>PT</button><button onClick={() => setLang('en')} className={`flex-1 py-2 rounded-lg text-sm ${lang === 'en' ? 'bg-white/10 text-white' : 'text-zinc-400'}`}>EN</button></div></div><div><h3 className="text-sm font-semibold mb-2">{lang === 'en' ? 'Sound' : 'Som'}</h3><button type="button" onClick={() => setSoundEnabled(!soundEnabled)} className="w-full py-2 rounded-xl bg-black/30 flex items-center justify-center gap-2 text-sm">{soundEnabled ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4"/>}{soundEnabled ? (lang === 'en' ? 'On' : 'Ativado') : (lang === 'en' ? 'Off' : 'Desativado')}</button></div></div>
          <label className="block text-sm font-semibold mb-2">{t.deadzoneLabel}: {deadzone.toFixed(2)}</label><input type="range" min="0" max="0.5" step="0.01" value={deadzone} onChange={(event) => setDeadzone(clampDeadzone(Number(event.target.value)))} className="w-full accent-[var(--accent-color)] mb-5"/>
          <button type="button" onClick={() => {setIsRemapMode(true);setRemapTargetPsIndex(null);setAndroidSettingsOpen(false);}} className="w-full text-left py-3 border-t border-white/10 text-sm">{lang === 'en' ? 'Button remapping' : 'Mapeamento de botões'} <span className="float-right text-zinc-400">›</span></button>
          <div className="flex flex-wrap gap-4 pt-3 border-t border-white/10 text-xs"><a href="https://x.com/Pad2PS" target="_blank" rel="noreferrer" className="text-zinc-300">X (@Pad2PS)</a><a href="https://pacoca.net/@Pad2PS" target="_blank" rel="noreferrer" className="text-zinc-300">Paçoca</a><a href="https://discord.gg/TWfKNvGkcj" target="_blank" rel="noreferrer" className="text-zinc-300">Discord</a><a href="https://github.com/RbtSwift/Pad2PS-Launcher" target="_blank" rel="noreferrer" className="text-zinc-300">GitHub</a><a href={`mailto:contato@pad2ps.com.br`} className="text-zinc-300">contato@pad2ps.com.br</a><a href={contactHref} onClick={(e) => {e.preventDefault();setAndroidSettingsOpen(false);navigateTo(CONTACT_ROUTE);}} className="text-zinc-300">{lang === 'en' ? 'Contact & Support' : 'Contato & Suporte'}</a><a href={termsHref} onClick={(e) => {e.preventDefault();setAndroidSettingsOpen(false);navigateTo(TERMS_ROUTE);}} className="text-zinc-300">{t.footerTermsButton}</a></div>
        </section></div>}
      </div>
    );
  }

  if (isContactPage) {
    return (
      <>
        <ContactPage
          lang={lang}
          isApp={isApp}
          homeHref={homeHref}
          onNavigateHome={() => navigateTo('/')}
        />
        <OfflineIndicator t={t} />
      </>
    );
  }

  if (isTermsPage) {
    return (
      <>
        <TermsPage
          lang={lang}
          onChangeLang={setLang}
          themeId={themeId}
          onChangeTheme={setThemeId}
          t={t}
          isApp={isApp}
          homeHref={homeHref}
          onNavigateHome={() => navigateTo('/')}
          onOpenInstall={() => setIsInstallModalOpen(true)}
        />
        <InstallAppModal
          isOpen={!isApp && isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
          isApp={isApp}
          lang={lang}
          t={t}
        />
        <OfflineIndicator t={t} />
      </>
    );
  }

  return (
    <div className="cyber-grid-bg h-dvh max-h-dvh w-full overflow-hidden flex flex-col text-[#FAFAFA]">
      <div className="w-full max-w-[2400px] mx-auto px-2.5 sm:px-5 lg:px-7 xl:px-10 py-1.5 sm:py-3 flex-1 flex flex-col gap-1.5 sm:gap-2.5 lg:gap-3 min-h-0 overflow-hidden">
        {/* Header */}
        <header
          className={`w-full flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 lg:gap-3 pb-1.5 sm:pb-2 border-b accent-border-subtle shrink-0 ${
            isCompact ? 'bg-[#121216]/85 backdrop-blur-md px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border' : ''
          }`}
        >
          <Pad2PSLogo compact={isCompact} isApp={isApp} t={t} />

          {!isApp && <button type="button" onClick={() => setIsInstallModalOpen(true)} title={t.installAppTitle} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-pink-300/60 bg-gradient-to-r from-fuchsia-500/25 to-pink-500/15 px-2.5 py-1.5 text-[11px] font-extrabold text-pink-50 shadow-[0_0_18px_rgba(236,72,153,.16)] transition hover:border-pink-200 hover:from-fuchsia-500/40 hover:to-pink-500/30 sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs"><Download className="h-3.5 w-3.5 text-pink-200 sm:h-4 sm:w-4"/><span>{t.installApp}</span></button>}

          <div className="flex flex-1 flex-wrap items-center justify-end gap-1 sm:gap-2 lg:gap-3 min-w-0 max-w-full">
            {/* Live Connection Status + Inline Custom Name Editor */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs min-w-0">
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
                      {controllerIdentity && (
                        <span className="truncate text-xs text-zinc-400" title={`Identificado como ${controllerIdentity.name} · ${controllerIdentity.family}`}>
                          {controllerIdentity.name}
                        </span>
                      )}
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

            {/* Monitor de Bateria Integrado (Desktop / Android / Web) */}
            {batteryDevices.length > 0 && (() => {
              const bat = batteryDevices[0];
              const isLow = !bat.charging && bat.percentage < 15;
              const BatIcon = bat.charging
                ? BatteryCharging
                : isLow
                  ? BatteryLow
                  : BatteryMedium;
              return (
                <div
                  title={`${bat.name}: ${bat.percentage}%${bat.charging ? ' (Carregando)' : ''}`}
                  className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-mono font-semibold shrink-0 ${
                    isLow
                      ? 'bg-red-500/15 border-red-500/50 text-red-300 animate-pulse'
                      : 'bg-[#121216] accent-border-subtle text-[#FAFAFA]'
                  }`}
                >
                  <BatIcon
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                      bat.charging
                        ? 'text-emerald-400'
                        : isLow
                          ? 'text-red-400'
                          : 'text-[var(--accent-color)]'
                    }`}
                  />
                  <span>{bat.percentage}%</span>
                </div>
              );
            })()}

            {/* Neon Theme Swatches */}
            <div
              className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg bg-[#121216] border accent-border-subtle"
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
                    className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full transition-transform cursor-pointer ${
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
              className="inline-flex items-center p-0.5 rounded-lg bg-[#121216] border accent-border-subtle text-[10px] sm:text-[11px] font-mono"
            >
              {(['pt', 'en'] as const).map((code) => {
                const active = lang === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    aria-pressed={active}
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-semibold uppercase transition-colors cursor-pointer ${
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
              aria-pressed={isPipActive}
              title={t.pipButton}
              className={`inline-flex items-center gap-1.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isPipActive
                  ? 'text-white neon-glow-accent'
                  : 'bg-[#121216] text-[#FAFAFA] hover:bg-white/5'
              }`}
              style={{
                borderColor: isPipActive
                  ? 'var(--accent-color)'
                  : 'rgba(var(--accent-rgb), 0.28)',
                backgroundColor: isPipActive
                  ? 'rgba(var(--accent-rgb), 0.24)'
                  : undefined,
              }}
            >
              <PictureInPicture2
                className="w-3.5 h-3.5"
                style={{color: 'var(--accent-color)'}}
              />
              <span className="hidden 2xl:inline">
                {isPipActive ? t.pipActive : t.pipButton}
              </span>
            </button>

            {/* Diagnostics & Analog Radars Button */}
            {!isCompact && (
              <button
                type="button"
                onClick={() => setIsDiagnosticsOpen(true)}
                title={t.diagnosticsButton}
                className="inline-flex items-center gap-1.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border bg-[#121216] text-xs font-medium text-[#FAFAFA] hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
                className={`inline-flex items-center gap-1.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
                className={`inline-flex items-center gap-1.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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

            {/* Emulators Suite Button */}
            {!isCompact && (
              <button
                type="button"
                onClick={() => setIsEmulatorsOpen(true)}
                title={t.emulatorsButton}
                className="inline-flex items-center gap-1.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border bg-[#121216] text-xs font-medium text-[#FAFAFA] hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.28)'}}
              >
                <Cpu className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
                <span className="hidden md:inline">{t.emulatorsButton}</span>
              </button>
            )}

            {/* Combo Library Button */}
            {!isCompact && (
              <button
                type="button"
                onClick={() => setIsComboDrawerOpen(true)}
                title={t.combosButton}
                className="inline-flex items-center gap-1.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border bg-[#121216] text-xs font-medium text-[#FAFAFA] hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
              className={`inline-flex items-center gap-1.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
                className="inline-flex items-center gap-1.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border bg-[#121216] text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
              className={`inline-flex items-center gap-1.5 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
            className="w-full shrink-0 bg-[#121216] rounded-xl px-2.5 sm:px-4 py-1 sm:py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-3 neon-glow-accent animate-pulse"
            style={{border: '1px solid rgba(var(--accent-rgb), 0.4)'}}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" style={{color: 'var(--accent-color)'}} />
              <p className="text-[11px] sm:text-sm text-[#FAFAFA] leading-snug">
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
            {controllerIdentity && <span className="truncate">{controllerIdentity.name}</span>}
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
            lang={lang}
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
        <main
          className={`flex-1 min-h-0 w-full grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3.5 lg:gap-4 xl:gap-6 items-stretch overflow-hidden ${
            isCompact
              ? 'grid-rows-1'
              : 'grid-rows-[minmax(0,38%)_minmax(0,62%)] sm:grid-rows-[minmax(0,43%)_minmax(0,57%)] lg:grid-rows-1'
          }`}
        >
          {/* Centerpiece: Interactive Controller SVG */}
          <section
            aria-label="PlayStation Controller"
            className={`${
              isCompact ? 'lg:col-span-12' : 'lg:col-span-7 xl:col-span-8'
            } accent-panel rounded-xl p-2.5 sm:p-4 lg:p-5 flex flex-col items-center justify-between gap-1.5 sm:gap-2 relative min-h-0 h-full w-full min-w-0 overflow-hidden transition-colors`}
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
                <button
                  type="button"
                  role="tab"
                  aria-selected={autoControllerLayout}
                  onClick={() => setAutoControllerLayout(true)}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${autoControllerLayout ? 'text-white neon-glow-accent' : 'text-[#A1A1AA] hover:text-[#FAFAFA]'}`}
                  style={autoControllerLayout ? {backgroundColor: 'rgba(var(--accent-rgb), 0.25)', border: '1px solid var(--accent-color)'} : {border: '1px solid transparent'}}
                >
                  Auto
                </button>
                {LAYOUT_OPTIONS.map((option) => {
                  const active = !autoControllerLayout && consoleLayout === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => { setAutoControllerLayout(false); setConsoleLayout(option); }}
                      className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
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

            <div className="w-full flex-1 flex items-center justify-center min-h-0 overflow-hidden py-1 sm:py-2">
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
              <div className="hidden sm:flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-[#A1A1AA] shrink-0">
                <span>{t.clickToTest}</span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="font-mono tabular-nums hover:text-white transition-colors cursor-pointer underline underline-offset-4"
                  style={{textDecorationColor: 'rgba(var(--accent-rgb), 0.45)'}}
                >
                  {t.deadzoneLabel}: {deadzone.toFixed(2)}
                </button>
                <span aria-hidden="true">·</span>
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
            <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-2 sm:gap-2.5 xl:gap-3.5 h-full min-h-0 overflow-hidden">
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
          <footer className="w-full shrink-0 flex flex-col gap-1.5 sm:gap-2">
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
              <SiteFooter
                t={t}
                lang={lang}
                isApp={isApp}
                termsHref={termsHref}
                contactHref={contactHref}
                onNavigateTerms={() => navigateTo(TERMS_ROUTE)}
                onNavigateContact={() => navigateTo(CONTACT_ROUTE)}
                onOpenInstall={() => setIsInstallModalOpen(true)}
              />
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

      {/* Emulators Suite Modal */}
      <EmulatorsModal
        isOpen={isEmulatorsOpen}
        onClose={() => setIsEmulatorsOpen(false)}
        remapMap={remapMap}
        controllerName={effectiveControllerName}
        deadzone={deadzone}
        lang={lang}
        t={t}
      />

      {/* Combo Library Drawer */}
      <ComboLibraryDrawer
        isOpen={isComboDrawerOpen}
        onClose={() => setIsComboDrawerOpen(false)}
        activeTrainingId={activeTraining?.id ?? null}
        layout={consoleLayout}
        remapMap={remapMap}
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
        l2Value={l2Value}
        r2Value={r2Value}
        pollingRateHz={sessionStats.pollingRateHz}
        bouncingCount={bouncingCount}
        lastBouncingButton={lastBouncingButton}
        onResetBouncing={resetBouncing}
        hardwareInfo={hardwareInfo}
        onTriggerRumble={triggerRumble}
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
        onOpenUpdateModal={(info) => {
          setUpdateInfo(info);
          setIsUpdateModalOpen(true);
        }}
      />
      <InstallAppModal
        isOpen={!isApp && isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isApp={isApp}
        lang={lang}
        t={t}
      />
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        updateInfo={updateInfo}
        appName="Pad2PS"
      />
      <OfflineIndicator t={t} />
    </div>
  );
}

export default function App() {
  const isPiPWindow =
    typeof window !== 'undefined' &&
    !isAndroidCapacitor() &&
    new URLSearchParams(window.location.search).get('pip') === '1';

  return (
    <ErrorBoundary>
      {isPiPWindow ? <StandalonePiPView /> : <MainApp />}
    </ErrorBoundary>
  );
}
