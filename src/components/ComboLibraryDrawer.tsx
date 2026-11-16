import {
  BookOpen,
  Check,
  Copy,
  Download,
  ImageDown,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Share2,
  Trash2,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  BUILDER_BUTTON_PALETTE,
  COMBO_LIBRARY,
  type ComboDefinition,
  SUGGESTED_GAMES,
} from '../data/comboLibrary';
import type {AppLanguage, Translations} from '../data/i18n';
import {type ConsoleLayout, PS2_BUTTON_BY_ID, type Ps2ButtonId} from '../data/ps2Mapping';
import type {ComboEntry} from '../hooks/useGamepad';
import {exportCombosToPng} from '../utils/exportComboPng';
import {Ps2Symbol} from './Ps2Symbol';

type LibraryTab = 'all' | 'preset' | 'custom';
const ALL_GAMES_FILTER = '__ALL__';
const SHARE_PREFIX = 'PAD2PS1:';

interface ComboLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTrainingId: string | null;
  layout: ConsoleLayout;
  customCombos: ComboDefinition[];
  controllerName: string | null;
  isControllerConnected: boolean;
  latestPressEvent: ComboEntry | null;
  lang: AppLanguage;
  t: Translations;
  onAddCustomCombo: (combo: Omit<ComboDefinition, 'id' | 'isCustom'>) => void;
  onImportCustomCombos: (combos: ComboDefinition[]) => void;
  onImportAndTrainCombo: (combo: ComboDefinition) => void;
  onDeleteCustomCombo: (id: string) => void;
  onStartTraining: (combo: ComboDefinition) => void;
}

function isValidPs2ButtonId(value: unknown): value is Ps2ButtonId {
  return typeof value === 'string' && value in PS2_BUTTON_BY_ID;
}

function encodeShareCombo(combo: ComboDefinition): string {
  const payload = {
    g: combo.game,
    t: combo.title,
    s: combo.subtitle,
    q: combo.sequence,
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return SHARE_PREFIX + btoa(binary);
}

function decodeShareCode(raw: string, fallbackSubtitle: string): ComboDefinition | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith(SHARE_PREFIX)) {
    return null;
  }
  try {
    const b64 = trimmed.slice(SHARE_PREFIX.length).trim();
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as {
      g?: unknown;
      t?: unknown;
      s?: unknown;
      q?: unknown;
    };
    if (
      typeof parsed.g !== 'string' ||
      !parsed.g.trim() ||
      typeof parsed.t !== 'string' ||
      !parsed.t.trim() ||
      !Array.isArray(parsed.q)
    ) {
      return null;
    }
    const sequence = parsed.q.filter(isValidPs2ButtonId);
    if (sequence.length === 0) {
      return null;
    }
    return {
      id: `shared-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      game: parsed.g.trim(),
      title: parsed.t.trim(),
      subtitle:
        typeof parsed.s === 'string' && parsed.s.trim()
          ? parsed.s.trim()
          : fallbackSubtitle,
      sequence,
      isCustom: true,
    };
  } catch {
    return null;
  }
}

function sanitizeImportedCombos(rawData: unknown, fallbackSubtitle: string): ComboDefinition[] {
  const arr = Array.isArray(rawData)
    ? rawData
    : rawData && typeof rawData === 'object' && Array.isArray((rawData as {combos?: unknown}).combos)
      ? (rawData as {combos: unknown[]}).combos
      : null;

  if (!arr) {
    return [];
  }

  const sanitized: ComboDefinition[] = [];
  for (const item of arr) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const rec = item as Record<string, unknown>;
    if (typeof rec.game !== 'string' || !rec.game.trim()) {
      continue;
    }
    if (typeof rec.title !== 'string' || !rec.title.trim()) {
      continue;
    }
    if (!Array.isArray(rec.sequence)) {
      continue;
    }
    const seq = rec.sequence.filter(isValidPs2ButtonId);
    if (seq.length === 0) {
      continue;
    }
    sanitized.push({
      id:
        typeof rec.id === 'string' && rec.id.trim()
          ? rec.id.trim()
          : `import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      game: rec.game.trim(),
      title: rec.title.trim(),
      subtitle:
        typeof rec.subtitle === 'string' && rec.subtitle.trim()
          ? rec.subtitle.trim()
          : fallbackSubtitle,
      sequence: seq,
      isCustom: true,
    });
  }
  return sanitized;
}

export function ComboLibraryDrawer({
  isOpen,
  onClose,
  activeTrainingId,
  layout,
  customCombos,
  controllerName,
  isControllerConnected,
  latestPressEvent,
  lang,
  t,
  onAddCustomCombo,
  onImportCustomCombos,
  onImportAndTrainCombo,
  onDeleteCustomCombo,
  onStartTraining,
}: ComboLibraryDrawerProps) {
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const [selectedGame, setSelectedGame] = useState<string>(ALL_GAMES_FILTER);
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);
  const [exportingKey, setExportingKey] = useState<string | null>(null);

  // Share & Backup state
  const [copiedComboId, setCopiedComboId] = useState<string | null>(null);
  const [shareCodeInput, setShareCodeInput] = useState<string>('');
  const [backupNotice, setBackupNotice] = useState<{type: 'ok' | 'err'; text: string} | null>(
    null
  );
  const backupFileRef = useRef<HTMLInputElement>(null);

  // Builder form state
  const [draftGame, setDraftGame] = useState<string>('');
  const [draftTitle, setDraftTitle] = useState<string>('');
  const [draftSubtitle, setDraftSubtitle] = useState<string>('');
  const [draftSequence, setDraftSequence] = useState<Ps2ButtonId[]>([]);
  const [isRecordingController, setIsRecordingController] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const lastRecordedUidRef = useRef<number>(latestPressEvent?.uid ?? 0);

  useEffect(() => {
    if (!isOpen) {
      setIsRecordingController(false);
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
    if (!copiedComboId) {
      return;
    }
    const timer = window.setTimeout(() => setCopiedComboId(null), 1800);
    return () => window.clearTimeout(timer);
  }, [copiedComboId]);

  useEffect(() => {
    if (!backupNotice) {
      return;
    }
    const timer = window.setTimeout(() => setBackupNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [backupNotice]);

  // Capture physical controller inputs when "Gravar no Controle" is active
  useEffect(() => {
    if (!latestPressEvent) {
      return;
    }
    if (latestPressEvent.uid === lastRecordedUidRef.current) {
      return;
    }
    lastRecordedUidRef.current = latestPressEvent.uid;

    if (!isOpen || !isCreatorOpen || !isRecordingController) {
      return;
    }

    setFormError(null);
    setDraftSequence((prev) => [...prev, latestPressEvent.button.id]);
  }, [latestPressEvent, isOpen, isCreatorOpen, isRecordingController]);

  const allCombos = useMemo(() => {
    return [...customCombos, ...COMBO_LIBRARY];
  }, [customCombos]);

  const tabFilteredCombos = useMemo(() => {
    if (activeTab === 'preset') {
      return COMBO_LIBRARY;
    }
    if (activeTab === 'custom') {
      return customCombos;
    }
    return allCombos;
  }, [activeTab, allCombos, customCombos]);

  const availableGames = useMemo(() => {
    const names = Array.from(new Set(tabFilteredCombos.map((c) => c.game)));
    return [ALL_GAMES_FILTER, ...names];
  }, [tabFilteredCombos]);

  const gameSuggestions = useMemo(() => {
    const set = new Set<string>([
      ...SUGGESTED_GAMES,
      ...allCombos.map((c) => c.game),
    ]);
    return Array.from(set);
  }, [allCombos]);

  useEffect(() => {
    if (!availableGames.includes(selectedGame)) {
      setSelectedGame(ALL_GAMES_FILTER);
    }
  }, [availableGames, selectedGame]);

  const visibleCombos = useMemo(() => {
    if (selectedGame === ALL_GAMES_FILTER) {
      return tabFilteredCombos;
    }
    return tabFilteredCombos.filter((c) => c.game === selectedGame);
  }, [tabFilteredCombos, selectedGame]);

  const groupedByGame = useMemo(() => {
    const map = new Map<string, ComboDefinition[]>();
    for (const combo of visibleCombos) {
      const list = map.get(combo.game);
      if (list) {
        list.push(combo);
      } else {
        map.set(combo.game, [combo]);
      }
    }
    return Array.from(map.entries());
  }, [visibleCombos]);

  if (!isOpen) {
    return null;
  }

  const toggleRecording = () => {
    if (latestPressEvent) {
      lastRecordedUidRef.current = latestPressEvent.uid;
    }
    setIsRecordingController((prev) => !prev);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const gameTrimmed = draftGame.trim();
    const titleTrimmed = draftTitle.trim();
    const subtitleTrimmed = draftSubtitle.trim();

    if (!gameTrimmed) {
      setFormError(
        lang === 'en'
          ? 'Enter the game title (e.g. God of War II or Bully).'
          : 'Informe o nome do jogo (ex: God of War II ou Bully).'
      );
      return;
    }
    if (!titleTrimmed) {
      setFormError(
        lang === 'en'
          ? 'Enter the cheat or combo name.'
          : 'Informe o nome do código ou golpe.'
      );
      return;
    }
    if (draftSequence.length === 0) {
      setFormError(
        lang === 'en'
          ? 'Add at least 1 button to the sequence.'
          : 'Adicione pelo menos 1 botão à sequência.'
      );
      return;
    }

    onAddCustomCombo({
      game: gameTrimmed,
      title: titleTrimmed,
      subtitle:
        subtitleTrimmed ||
        (lang === 'en'
          ? 'Custom sequence saved in browser'
          : 'Sequência personalizada salva no navegador'),
      sequence: draftSequence,
    });

    setDraftGame('');
    setDraftTitle('');
    setDraftSubtitle('');
    setDraftSequence([]);
    setIsRecordingController(false);
    setIsCreatorOpen(false);
    setFormError(null);
    setActiveTab('custom');
    setSelectedGame(ALL_GAMES_FILTER);
  };

  const handleExportSinglePng = async (combo: ComboDefinition) => {
    setExportingKey(`single-${combo.id}`);
    try {
      await exportCombosToPng({
        gameTitle: combo.game,
        combos: [combo],
        controllerName,
        layout,
        lang,
        fileNameSuffix: `${combo.game}-${combo.title}`,
      });
    } finally {
      setExportingKey(null);
    }
  };

  const handleExportGamePng = async (gameName: string, combos: ComboDefinition[]) => {
    setExportingKey(`game-${gameName}`);
    try {
      await exportCombosToPng({
        gameTitle: gameName,
        combos,
        controllerName,
        layout,
        lang,
        fileNameSuffix: gameName,
      });
    } finally {
      setExportingKey(null);
    }
  };

  const handleExportJsonBackup = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const payload = {
      app: 'Pad2PS',
      version: 1,
      exportedAt: now.toISOString(),
      combos: customCombos,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pad2ps-backup-${yyyy}-${mm}-${dd}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJsonBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const fallbackSub =
        lang === 'en' ? 'Imported from JSON backup' : 'Importado de backup JSON';
      const combos = sanitizeImportedCombos(parsed, fallbackSub);
      if (combos.length === 0) {
        setBackupNotice({type: 'err', text: t.combosBackupError});
        return;
      }
      onImportCustomCombos(combos);
      setActiveTab('custom');
      setSelectedGame(ALL_GAMES_FILTER);
      setBackupNotice({type: 'ok', text: `${t.combosBackupSuccess} (+${combos.length})`});
    } catch {
      setBackupNotice({type: 'err', text: t.combosBackupError});
    }
  };

  const handleCopyShareCode = async (combo: ComboDefinition) => {
    const code = encodeShareCombo(combo);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedComboId(combo.id);
    } catch {
      // Fallback: populate share input so user can copy manually
      setShareCodeInput(code);
      setCopiedComboId(combo.id);
    }
  };

  const handleImportShareCode = (e: React.FormEvent) => {
    e.preventDefault();
    const fallbackSub =
      lang === 'en' ? 'Shared via Pad2PS code' : 'Compartilhado via código Pad2PS';
    const decoded = decodeShareCode(shareCodeInput, fallbackSub);
    if (!decoded) {
      setBackupNotice({type: 'err', text: t.combosPasteInvalid});
      return;
    }
    setShareCodeInput('');
    setBackupNotice(null);
    onImportAndTrainCombo(decoded);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="combo-drawer-title"
      onClick={onClose}
    >
      <aside
        className="w-full max-w-lg h-full bg-[#121216] border-l flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.85)]"
        style={{borderColor: 'rgba(var(--accent-rgb), 0.35)'}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between gap-3 shrink-0"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.16)'}}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                border: '1px solid rgba(var(--accent-rgb), 0.38)',
                color: 'var(--accent-color)',
              }}
            >
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="combo-drawer-title"
                className="font-display text-base font-bold text-[#FAFAFA] truncate"
              >
                {t.combosTitle}
              </h2>
              <p className="text-xs text-[#A1A1AA] truncate">{t.combosSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsCreatorOpen((prev) => !prev);
                setFormError(null);
                setIsRecordingController(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer whitespace-nowrap neon-glow-accent"
              style={{
                backgroundColor: isCreatorOpen
                  ? '#1F1F27'
                  : 'rgba(var(--accent-rgb), 0.25)',
                border: '1px solid var(--accent-color)',
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreatorOpen ? t.combosCloseCreator : t.combosNewBtn}</span>
            </button>

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
        </div>

        {/* Visual Combo Creator Form */}
        {isCreatorOpen && (
          <form
            onSubmit={handleSaveCustom}
            className="px-5 py-4 border-b bg-[#0B0B0F] space-y-3 shrink-0 max-h-[60vh] overflow-y-auto"
            style={{borderColor: 'rgba(var(--accent-rgb), 0.24)'}}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold text-[#FAFAFA]">
                {lang === 'en' ? 'Create Custom Code or Combo' : 'Criar Código ou Combo Personalizado'}
              </h3>
              <span className="font-mono text-[11px] text-[#A1A1AA]">
                {lang === 'en' ? 'Saved in browser' : 'Salvo no navegador'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="combo-game-input"
                  className="block text-[11px] text-[#A1A1AA] mb-1"
                >
                  {lang === 'en' ? 'Game Title' : 'Nome do Jogo'}
                </label>
                <input
                  id="combo-game-input"
                  type="text"
                  list="pad2ps-game-suggestions"
                  value={draftGame}
                  onChange={(e) => {
                    setDraftGame(e.target.value);
                    setFormError(null);
                  }}
                  placeholder={lang === 'en' ? 'e.g. God of War II, Bully...' : 'Ex: God of War II, Bully...'}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#121216] border text-xs text-[#FAFAFA] outline-none focus:border-white"
                  style={{borderColor: 'rgba(var(--accent-rgb), 0.3)'}}
                />
                <datalist id="pad2ps-game-suggestions">
                  {gameSuggestions.map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </div>

              <div>
                <label
                  htmlFor="combo-title-input"
                  className="block text-[11px] text-[#A1A1AA] mb-1"
                >
                  {lang === 'en' ? 'Code or Move Name' : 'Nome do Código ou Golpe'}
                </label>
                <input
                  id="combo-title-input"
                  type="text"
                  value={draftTitle}
                  onChange={(e) => {
                    setDraftTitle(e.target.value);
                    setFormError(null);
                  }}
                  placeholder={lang === 'en' ? 'e.g. Air Combo, Infinite Ammo...' : 'Ex: Combo Aéreo, Munição...'}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#121216] border text-xs text-[#FAFAFA] outline-none focus:border-white"
                  style={{borderColor: 'rgba(var(--accent-rgb), 0.3)'}}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="combo-subtitle-input"
                className="block text-[11px] text-[#A1A1AA] mb-1"
              >
                {lang === 'en' ? 'Effect or note (optional)' : 'Efeito ou observação (opcional)'}
              </label>
              <input
                id="combo-subtitle-input"
                type="text"
                value={draftSubtitle}
                onChange={(e) => setDraftSubtitle(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'e.g. Heavy finisher aerial attack'
                    : 'Ex: Ataque especial com finalização pesada'
                }
                className="w-full h-8 px-2.5 rounded-lg bg-[#121216] border text-xs text-[#FAFAFA] outline-none focus:border-white"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
              />
            </div>

            {/* Sequence Builder Preview */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-[#FAFAFA]">
                  {lang === 'en'
                    ? `Sequence Draft (${draftSequence.length})`
                    : `Sequência em Montagem (${draftSequence.length})`}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    title={
                      isControllerConnected
                        ? lang === 'en'
                          ? 'Capture inputs from physical controller'
                          : 'Capturar botões pressionados no controle físico'
                        : lang === 'en'
                          ? 'Connect or click controller to record'
                          : 'Conecte ou clique no controle para gravar'
                    }
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isRecordingController
                        ? 'text-white neon-glow-accent animate-pulse'
                        : 'bg-[#121216] text-[#A1A1AA] hover:text-[#FAFAFA]'
                    }`}
                    style={{
                      borderColor: isRecordingController
                        ? 'var(--accent-color)'
                        : 'rgba(var(--accent-rgb), 0.28)',
                      backgroundColor: isRecordingController
                        ? 'rgba(var(--accent-rgb), 0.26)'
                        : undefined,
                    }}
                  >
                    <Radio
                      className="w-3 h-3"
                      style={{color: isRecordingController ? '#FFFFFF' : 'var(--accent-color)'}}
                    />
                    <span>
                      {isRecordingController
                        ? lang === 'en'
                          ? 'Recording...'
                          : 'Gravando no Controle...'
                        : lang === 'en'
                          ? 'Record Controller'
                          : 'Gravar no Controle'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDraftSequence((prev) => prev.slice(0, -1))}
                    disabled={draftSequence.length === 0}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-700 text-[11px] text-[#A1A1AA] hover:text-[#FAFAFA] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>{lang === 'en' ? 'Undo' : 'Desfazer último'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDraftSequence([])}
                    disabled={draftSequence.length === 0}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-700 text-[11px] text-[#A1A1AA] hover:text-[#FAFAFA] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.clear}</span>
                  </button>
                </div>
              </div>

              <div
                className="min-h-[44px] rounded-lg bg-[#121216] border px-2.5 py-2 flex flex-wrap items-center gap-1.5"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.2)'}}
              >
                {draftSequence.length === 0 ? (
                  <span className="text-[11px] text-zinc-500">
                    {lang === 'en'
                      ? 'Click buttons below or toggle "Record Controller"...'
                      : 'Clique nos botões abaixo ou ative "Gravar no Controle"...'}
                  </span>
                ) : (
                  draftSequence.map((btnId, idx) => (
                    <span
                      key={`draft-${idx}`}
                      className="h-7 min-w-[28px] px-1.5 rounded-md bg-[#09090B] border flex items-center justify-center text-white text-[11px]"
                      style={{borderColor: 'rgba(var(--accent-rgb), 0.45)'}}
                    >
                      <Ps2Symbol id={btnId} className="w-3.5 h-3.5" layout={layout} />
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Clickable PS Button Palette */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {BUILDER_BUTTON_PALETTE.map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setDraftSequence((prev) => [...prev, btn.id]);
                  }}
                  title={btn.label}
                  className="h-9 px-1 rounded-lg bg-[#121216] border hover:bg-white/5 flex flex-col items-center justify-center gap-0.5 text-[#FAFAFA] transition-transform active:scale-95 cursor-pointer"
                  style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
                >
                  <span style={{color: 'var(--accent-color)'}}>
                    <Ps2Symbol id={btn.id} className="w-3.5 h-3.5" layout={layout} />
                  </span>
                </button>
              ))}
            </div>

            {formError && <p className="text-xs text-red-400">{formError}</p>}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsCreatorOpen(false);
                  setIsRecordingController(false);
                  setFormError(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-[#A1A1AA] hover:text-[#FAFAFA] cursor-pointer"
              >
                {lang === 'en' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer neon-glow-accent"
                style={{
                  backgroundColor: 'rgba(var(--accent-rgb), 0.28)',
                  border: '1px solid var(--accent-color)',
                }}
              >
                {lang === 'en' ? 'Save Code / Combo' : 'Salvar Código / Combo'}
              </button>
            </div>
          </form>
        )}

        {/* Section Tabs + Backup & Friend Code Share Bar */}
        <div
          className="px-5 py-3 border-b space-y-2.5 shrink-0"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.14)'}}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {(
                [
                  {id: 'all', label: `${t.combosTabAll} (${allCombos.length})`},
                  {id: 'preset', label: `${t.combosTabPreset} (${COMBO_LIBRARY.length})`},
                  {id: 'custom', label: `${t.combosTabCustom} (${customCombos.length})`},
                ] as const
              ).map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      active ? 'text-white neon-glow-accent' : 'bg-[#09090B]/80 text-[#A1A1AA] hover:text-[#FAFAFA]'
                    }`}
                    style={{
                      backgroundColor: active ? 'rgba(var(--accent-rgb), 0.24)' : undefined,
                      border: active
                        ? '1px solid var(--accent-color)'
                        : '1px solid rgba(var(--accent-rgb), 0.16)',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* JSON Backup Export / Import Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleExportJsonBackup}
                disabled={customCombos.length === 0}
                title={t.combosBackupExport}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#09090B]/85 border text-[11px] text-[#FAFAFA] hover:text-white disabled:opacity-40 disabled:pointer-events-none cursor-pointer whitespace-nowrap"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.25)'}}
              >
                <Download className="w-3 h-3" style={{color: 'var(--accent-color)'}} />
                <span>.json</span>
              </button>
              <button
                type="button"
                onClick={() => backupFileRef.current?.click()}
                title={t.combosBackupImport}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#09090B]/85 border text-[11px] text-[#FAFAFA] hover:text-white cursor-pointer whitespace-nowrap"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.25)'}}
              >
                <Upload className="w-3 h-3" style={{color: 'var(--accent-color)'}} />
                <span>{lang === 'en' ? 'Import' : 'Importar'}</span>
              </button>
              <input
                ref={backupFileRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportJsonBackup}
                className="hidden"
              />
            </div>
          </div>

          {/* Paste Friend Share Code Bar */}
          <form onSubmit={handleImportShareCode} className="flex items-center gap-1.5">
            <div className="relative flex-1 min-w-0">
              <Share2
                className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{color: 'var(--accent-color)'}}
              />
              <input
                type="text"
                value={shareCodeInput}
                onChange={(e) => {
                  setShareCodeInput(e.target.value);
                  setBackupNotice(null);
                }}
                placeholder={t.combosPastePlaceholder}
                className="w-full h-8 pl-8 pr-2.5 rounded-lg bg-[#09090B]/90 border text-xs font-mono text-[#FAFAFA] placeholder:text-zinc-500 outline-none focus:border-white"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
              />
            </div>
            <button
              type="submit"
              disabled={!shareCodeInput.trim()}
              className="h-8 px-2.5 rounded-lg text-[11px] font-semibold text-white disabled:opacity-40 disabled:pointer-events-none cursor-pointer whitespace-nowrap shrink-0"
              style={{
                backgroundColor: 'rgba(var(--accent-rgb), 0.24)',
                border: '1px solid var(--accent-color)',
              }}
            >
              {t.combosPasteImport}
            </button>
          </form>

          {backupNotice && (
            <p
              className={`text-[11px] ${
                backupNotice.type === 'err' ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {backupNotice.text}
            </p>
          )}

          {availableGames.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {availableGames.map((game) => {
                const active = selectedGame === game;
                return (
                  <button
                    key={game}
                    type="button"
                    onClick={() => setSelectedGame(game)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      active ? 'text-white' : 'bg-[#09090B]/70 text-[#A1A1AA] hover:text-[#FAFAFA]'
                    }`}
                    style={{
                      backgroundColor: active ? 'rgba(var(--accent-rgb), 0.2)' : undefined,
                      border: active
                        ? '1px solid var(--accent-color)'
                        : '1px solid rgba(var(--accent-rgb), 0.14)',
                    }}
                  >
                    {game === ALL_GAMES_FILTER ? t.combosAllGames : game}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Grouped Combo Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {groupedByGame.length === 0 ? (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center px-6 gap-2">
              <p className="text-sm font-medium text-[#FAFAFA]">
                {activeTab === 'custom' ? t.combosEmptyCustom : t.combosEmptyDefault}
              </p>
              <p className="text-xs text-[#A1A1AA]">
                {lang === 'en'
                  ? 'Click "+ New Code / Combo" above or import a JSON backup / friend code.'
                  : 'Clique em "+ Novo Código / Combo" acima ou importe um backup JSON / código.'}
              </p>
            </div>
          ) : (
            groupedByGame.map(([gameName, combos]) => {
              const isExportingGame = exportingKey === `game-${gameName}`;
              return (
                <div key={gameName} className="space-y-2.5">
                  {/* Game Group Header with Full Cheat Sheet PNG Download */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b"
                    style={{borderColor: 'rgba(var(--accent-rgb), 0.18)'}}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <h3
                        className="font-display text-sm font-bold truncate"
                        style={{color: 'var(--accent-color)'}}
                      >
                        {gameName}
                      </h3>
                      <span className="font-mono text-[11px] text-[#A1A1AA] tabular-nums">
                        · {combos.length}{' '}
                        {combos.length === 1 ? 'item' : lang === 'en' ? 'items' : 'itens'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExportGamePng(gameName, combos)}
                      disabled={isExportingGame}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#09090B]/90 border text-[11px] font-medium text-[#FAFAFA] hover:text-white transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                      style={{borderColor: 'rgba(var(--accent-rgb), 0.36)'}}
                    >
                      <ImageDown className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
                      <span>
                        {isExportingGame ? t.combosGeneratingPng : t.combosDownloadGamePng}
                      </span>
                    </button>
                  </div>

                  {/* Individual Combos in Group */}
                  <div className="space-y-2.5">
                    {combos.map((combo) => {
                      const isTrainingThis = activeTrainingId === combo.id;
                      const isExportingSingle = exportingKey === `single-${combo.id}`;
                      const isCopied = copiedComboId === combo.id;
                      return (
                        <div
                          key={combo.id}
                          className="rounded-xl p-3.5 bg-[#09090B]/80 flex flex-col gap-2.5 transition-colors"
                          style={{
                            border: isTrainingThis
                              ? '1px solid var(--accent-color)'
                              : '1px solid rgba(var(--accent-rgb), 0.18)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-[#FAFAFA] leading-snug">
                                  {combo.title}
                                </h4>
                                {combo.isCustom && (
                                  <span className="font-mono text-[10px] text-[#A1A1AA]">
                                    · {t.combosMyCodeTag}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#A1A1AA] mt-0.5">{combo.subtitle}</p>
                            </div>

                            {combo.isCustom && (
                              <button
                                type="button"
                                onClick={() => onDeleteCustomCombo(combo.id)}
                                title={lang === 'en' ? 'Delete custom code' : 'Excluir código personalizado'}
                                aria-label={combo.title}
                                className="w-7 h-7 rounded-md text-[#A1A1AA] hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Sequence Preview */}
                          <div className="flex flex-wrap items-center gap-1">
                            {combo.sequence.map((btnId, idx) => (
                              <span
                                key={`${combo.id}-${idx}`}
                                className="h-7 min-w-[28px] px-1.5 rounded-md bg-[#121216] border flex items-center justify-center text-[#FAFAFA] text-[11px]"
                                style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
                              >
                                <Ps2Symbol id={btnId} className="w-3.5 h-3.5" layout={layout} />
                              </span>
                            ))}
                          </div>

                          <div className="pt-1 flex flex-wrap items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyShareCode(combo)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#121216] border text-xs font-medium text-[#FAFAFA] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                              style={{
                                borderColor: isCopied
                                  ? '#34D399'
                                  : 'rgba(var(--accent-rgb), 0.24)',
                              }}
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
                              )}
                              <span>{isCopied ? t.combosShareCopied : t.combosShareCopy}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleExportSinglePng(combo)}
                              disabled={isExportingSingle}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#121216] border text-xs font-medium text-[#FAFAFA] hover:text-white transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                              style={{borderColor: 'rgba(var(--accent-rgb), 0.28)'}}
                            >
                              <ImageDown
                                className="w-3.5 h-3.5"
                                style={{color: 'var(--accent-color)'}}
                              />
                              <span>
                                {isExportingSingle ? t.combosGeneratingPng : t.combosDownloadPng}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onStartTraining(combo);
                                onClose();
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all cursor-pointer whitespace-nowrap"
                              style={{
                                backgroundColor: isTrainingThis
                                  ? '#10B981'
                                  : 'rgba(var(--accent-rgb), 0.22)',
                                border: isTrainingThis
                                  ? '1px solid #34D399'
                                  : '1px solid var(--accent-color)',
                              }}
                            >
                              <Play className="w-3 h-3" />
                              <span>{isTrainingThis ? t.combosTrainingNow : t.combosTrainBtn}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
