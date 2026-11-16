import {
  BookOpen,
  ImageDown,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  BUILDER_BUTTON_PALETTE,
  COMBO_LIBRARY,
  type ComboDefinition,
  SUGGESTED_GAMES,
} from '../data/comboLibrary';
import type {ConsoleLayout, Ps2ButtonId} from '../data/ps2Mapping';
import type {ComboEntry} from '../hooks/useGamepad';
import {exportCombosToPng} from '../utils/exportComboPng';
import {Ps2Symbol} from './Ps2Symbol';

type LibraryTab = 'all' | 'preset' | 'custom';

interface ComboLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTrainingId: string | null;
  layout: ConsoleLayout;
  customCombos: ComboDefinition[];
  controllerName: string | null;
  isControllerConnected: boolean;
  latestPressEvent: ComboEntry | null;
  onAddCustomCombo: (combo: Omit<ComboDefinition, 'id' | 'isCustom'>) => void;
  onDeleteCustomCombo: (id: string) => void;
  onStartTraining: (combo: ComboDefinition) => void;
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
  onAddCustomCombo,
  onDeleteCustomCombo,
  onStartTraining,
}: ComboLibraryDrawerProps) {
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const [selectedGame, setSelectedGame] = useState<string>('Todos');
  const [isCreatorOpen, setIsCreatorOpen] = useState<boolean>(false);
  const [exportingKey, setExportingKey] = useState<string | null>(null);

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
    return ['Todos', ...names];
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
      setSelectedGame('Todos');
    }
  }, [availableGames, selectedGame]);

  const visibleCombos = useMemo(() => {
    if (selectedGame === 'Todos') {
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
      setFormError('Informe o nome do jogo (ex: God of War II ou Bully).');
      return;
    }
    if (!titleTrimmed) {
      setFormError('Informe o nome do código ou golpe.');
      return;
    }
    if (draftSequence.length === 0) {
      setFormError('Adicione pelo menos 1 botão à sequência.');
      return;
    }

    onAddCustomCombo({
      game: gameTrimmed,
      title: titleTrimmed,
      subtitle: subtitleTrimmed || 'Sequência personalizada salva no navegador',
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
    setSelectedGame('Todos');
  };

  const handleExportSinglePng = async (combo: ComboDefinition) => {
    setExportingKey(`single-${combo.id}`);
    try {
      await exportCombosToPng({
        gameTitle: combo.game,
        combos: [combo],
        controllerName,
        layout,
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
        fileNameSuffix: gameName,
      });
    } finally {
      setExportingKey(null);
    }
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
                Códigos & Combos
              </h2>
              <p className="text-xs text-[#A1A1AA] truncate">
                Crie, treine ou baixe cartões visuais em PNG
              </p>
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
              <span>{isCreatorOpen ? 'Fechar Criador' : '+ Novo Código / Combo'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar biblioteca de códigos"
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
            className="px-5 py-4 border-b bg-[#0B0B0F] space-y-3 shrink-0 max-h-[64vh] overflow-y-auto"
            style={{borderColor: 'rgba(var(--accent-rgb), 0.24)'}}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold text-[#FAFAFA]">
                Criar Código ou Combo Personalizado
              </h3>
              <span className="font-mono text-[11px] text-[#A1A1AA]">
                Salvo no navegador
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="combo-game-input"
                  className="block text-[11px] text-[#A1A1AA] mb-1"
                >
                  Nome do Jogo
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
                  placeholder="Ex: God of War II, Bully..."
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
                  Nome do Código ou Golpe
                </label>
                <input
                  id="combo-title-input"
                  type="text"
                  value={draftTitle}
                  onChange={(e) => {
                    setDraftTitle(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="Ex: Combo Aéreo, Munição..."
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
                Efeito ou observação (opcional)
              </label>
              <input
                id="combo-subtitle-input"
                type="text"
                value={draftSubtitle}
                onChange={(e) => setDraftSubtitle(e.target.value)}
                placeholder="Ex: Ataque especial com finalização pesada"
                className="w-full h-8 px-2.5 rounded-lg bg-[#121216] border text-xs text-[#FAFAFA] outline-none focus:border-white"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
              />
            </div>

            {/* Sequence Builder Preview */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-[#FAFAFA]">
                  Sequência em Montagem ({draftSequence.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    title={
                      isControllerConnected
                        ? 'Capturar botões pressionados no controle físico'
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
                      {isRecordingController ? 'Gravando no Controle...' : 'Gravar no Controle'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDraftSequence((prev) => prev.slice(0, -1))}
                    disabled={draftSequence.length === 0}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-700 text-[11px] text-[#A1A1AA] hover:text-[#FAFAFA] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    title="Desfazer último botão"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Desfazer último</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDraftSequence([])}
                    disabled={draftSequence.length === 0}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-700 text-[11px] text-[#A1A1AA] hover:text-[#FAFAFA] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    title="Limpar sequência"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpar sequência</span>
                  </button>
                </div>
              </div>

              <div
                className="min-h-[44px] rounded-lg bg-[#121216] border px-2.5 py-2 flex flex-wrap items-center gap-1.5"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.2)'}}
              >
                {draftSequence.length === 0 ? (
                  <span className="text-[11px] text-zinc-500">
                    Clique nos botões abaixo ou ative &quot;Gravar no Controle&quot;...
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
                  title={`Adicionar ${btn.label}`}
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
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer neon-glow-accent"
                style={{
                  backgroundColor: 'rgba(var(--accent-rgb), 0.28)',
                  border: '1px solid var(--accent-color)',
                }}
              >
                Salvar Código / Combo
              </button>
            </div>
          </form>
        )}

        {/* Section Tabs (Todos / Padrão / Meus Códigos) + Game Filter Pills */}
        <div
          className="px-5 py-3 border-b space-y-2.5 shrink-0"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.14)'}}
        >
          <div className="flex items-center gap-1.5">
            {(
              [
                {id: 'all', label: `Todos (${allCombos.length})`},
                {id: 'preset', label: `Clássicos (${COMBO_LIBRARY.length})`},
                {id: 'custom', label: `Meus Códigos (${customCombos.length})`},
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
                    {game}
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
                {activeTab === 'custom'
                  ? 'Nenhum código personalizado salvo ainda'
                  : 'Nenhum combo encontrado'}
              </p>
              <p className="text-xs text-[#A1A1AA]">
                Clique em &quot;+ Novo Código / Combo&quot; acima para criar sua própria lista.
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
                        · {combos.length} {combos.length === 1 ? 'item' : 'itens'}
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
                        {isExportingGame ? 'Gerando...' : 'Baixar Lista do Jogo (.png)'}
                      </span>
                    </button>
                  </div>

                  {/* Individual Combos in Group */}
                  <div className="space-y-2.5">
                    {combos.map((combo) => {
                      const isTrainingThis = activeTrainingId === combo.id;
                      const isExportingSingle = exportingKey === `single-${combo.id}`;
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
                                    · Meu Código
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#A1A1AA] mt-0.5">{combo.subtitle}</p>
                            </div>

                            {combo.isCustom && (
                              <button
                                type="button"
                                onClick={() => onDeleteCustomCombo(combo.id)}
                                title="Excluir código personalizado"
                                aria-label={`Excluir ${combo.title}`}
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

                          <div className="pt-1 flex flex-wrap items-center justify-end gap-2">
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
                              <span>{isExportingSingle ? 'Gerando...' : 'Baixar PNG'}</span>
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
                              <span>{isTrainingThis ? 'Treinando Agora' : 'Treinar Sequência'}</span>
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
