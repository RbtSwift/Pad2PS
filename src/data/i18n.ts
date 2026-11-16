export type AppLanguage = 'pt' | 'en';

export interface Translations {
  appSubtitle: string;
  waitingControl: string;
  waitingButton: string;
  connectedControl: string;
  waitingBannerPrefix: string;
  waitingBannerHighlight: string;
  waitingBannerSuffix: string;
  orClickSvg: string;
  pipButton: string;
  pipActive: string;
  diagnosticsButton: string;
  remapButton: string;
  remapActive: string;
  combosButton: string;
  compactButton: string;
  expandButton: string;
  settingsButton: string;
  soundOn: string;
  soundOff: string;
  rumbleButton: string;
  rumbleVibrating: string;
  rumbleUnsupported: string;
  rumbleDisconnected: string;
  close: string;
  clickToTest: string;
  deadzoneLabel: string;
  chromaLabel: string;
  chromaDark: string;
  chromaGreen: string;
  chromaMagenta: string;
  lastPressedTitle: string;
  simultaneousTitle: string;
  indexLabel: string;
  activeCount: string;
  equivalence: string;
  onController: string;
  noCommandTitle: string;
  noCommandSubtitle: string;
  analogLabel: string;
  axisL: string;
  axisR: string;
  quickRefTitle: string;
  quickRefSubtitle: string;
  comboHistoryTitle: string;
  last10Buttons: string;
  comboHistoryEmpty: string;
  downloadTxt: string;
  clear: string;
  // Session stats
  statsClicks: string;
  statsSpeed: string;
  statsPeak: string;
  statsPolling: string;
  statsReset: string;
  // Remap mode
  remapBannerStep1: string;
  remapBannerStep2: string;
  remapJapanesePreset: string;
  remapReset: string;
  remapDone: string;
  // Diagnostics modal
  diagTitle: string;
  diagSubtitle: string;
  diagLeftStick: string;
  diagRightStick: string;
  diagTilt: string;
  diagDriftWarning: string;
  diagHealthy: string;
  diagDeadzoneHint: string;
  diagOpenSettings: string;
  // Settings modal
  settingsTitle: string;
  settingsSubtitle: string;
  settingsDeadzoneDesc: string;
  settingsMonitor: string;
  settingsLimit: string;
  settingsDriftFiltered: string;
  settingsAutoSaved: string;
  settingsRestoreDefault: string;
  settingsSaveTxt: string;
  settingsLoadTxt: string;
  // Combo library & backup
  combosTitle: string;
  combosSubtitle: string;
  combosNewBtn: string;
  combosCloseCreator: string;
  combosTabAll: string;
  combosTabPreset: string;
  combosTabCustom: string;
  combosAllGames: string;
  combosEmptyCustom: string;
  combosEmptyDefault: string;
  combosTrainBtn: string;
  combosTrainingNow: string;
  combosDownloadPng: string;
  combosDownloadGamePng: string;
  combosGeneratingPng: string;
  combosMyCodeTag: string;
  combosBackupExport: string;
  combosBackupImport: string;
  combosShareCopy: string;
  combosShareCopied: string;
  combosPastePlaceholder: string;
  combosPasteImport: string;
  combosPasteInvalid: string;
  combosBackupSuccess: string;
  combosBackupError: string;
  // Training bar
  trainingComplete: string;
  trainingStepOf: (step: number, total: number) => string;
  trainingAgain: string;
  trainingRestart: string;
  trainingStop: string;
  // PNG export strings
  pngGuideCategory: string;
  pngControllerPrefix: string;
  pngFooter: string;
  // Logo menu
  logoMenuFull: string;
  logoMenuFullSub: string;
  logoMenuIcon: string;
  logoMenuIconSub: string;
  // Footer & Legal
  footerNotice: string;
  footerTermsButton: string;
  legalCloseButton: string;
  // PWA Install & Offline
  installApp: string;
  installAppTitle: string;
  installIosTitle: string;
  installIosStep1: string;
  installIosStep2: string;
  offlineBadge: string;
}

const PT_TRANSLATIONS: Translations = {
  appSubtitle: 'Tradutor Visual X-Input para PlayStation',
  waitingControl: 'Aguardando controle',
  waitingButton: 'Aguardando botão...',
  connectedControl: 'Controle Conectado',
  waitingBannerPrefix: 'Conecte seu controle (modo PC / X-Input) e',
  waitingBannerHighlight: 'aperte qualquer botão',
  waitingBannerSuffix: 'para ativar a detecção',
  orClickSvg: 'Ou clique no controle SVG',
  pipButton: 'Janela Flutuante (PiP)',
  pipActive: 'PiP Ativo',
  diagnosticsButton: 'Diagnóstico & Analógicos',
  remapButton: 'Remapear Botões',
  remapActive: 'Remapeando',
  combosButton: 'Códigos & Combos',
  compactButton: 'Modo Compacto',
  expandButton: 'Expandir',
  settingsButton: 'Ajustes',
  soundOn: 'Som PS2',
  soundOff: 'Sem som',
  rumbleButton: 'Testar Vibração',
  rumbleVibrating: 'Vibrando...',
  rumbleUnsupported: 'Vibração não suportada por este controle ou navegador.',
  rumbleDisconnected: 'Nenhum controle conectado para testar vibração.',
  close: 'Fechar',
  clickToTest: 'Clique em qualquer botão no desenho para testar',
  deadzoneLabel: 'Zona morta',
  chromaLabel: 'Fundo OBS',
  chromaDark: 'Escuro',
  chromaGreen: 'Chroma Verde',
  chromaMagenta: 'Chroma Magenta',
  lastPressedTitle: 'Último Botão Pressionado',
  simultaneousTitle: 'Combinação Simultânea',
  indexLabel: 'Índice',
  activeCount: 'ativos',
  equivalence: 'Equivalência',
  onController: 'No GameSir / Xbox',
  noCommandTitle: 'Nenhum comando registrado',
  noCommandSubtitle: 'Aperte um botão no controle ou clique no SVG ao lado',
  analogLabel: 'Analógico',
  axisL: 'Eixo L',
  axisR: 'Eixo R',
  quickRefTitle: 'Tabela Rápida de Referência',
  quickRefSubtitle: 'X-Input (GameSir / Xbox)',
  comboHistoryTitle: 'Sequência de Comandos',
  last10Buttons: 'Últimos 10 botões',
  comboHistoryEmpty: 'Os últimos botões pressionados aparecerão aqui em ordem cronológica...',
  downloadTxt: 'Baixar .txt',
  clear: 'Limpar',
  statsClicks: 'Cliques',
  statsSpeed: 'Velocidade',
  statsPeak: 'Pico',
  statsPolling: 'Polling',
  statsReset: 'Zerar estatísticas',
  remapBannerStep1: 'Modo Remapeamento: clique em um botão no controle SVG abaixo para escolher o destino.',
  remapBannerStep2: 'Agora aperte o botão físico no controle para vincular a',
  remapJapanesePreset: 'Inverter X / O (Padrão Japonês)',
  remapReset: 'Restaurar Padrão',
  remapDone: 'Concluir',
  diagTitle: 'Diagnóstico & Analógicos',
  diagSubtitle: 'Radares de precisão, porcentagem de inclinação e detecção de drift',
  diagLeftStick: 'Stick Esquerdo (L3)',
  diagRightStick: 'Stick Direito (R3)',
  diagTilt: 'Inclinação',
  diagDriftWarning: 'Possível drift detectado (> 0.08) — considere aumentar a Deadzone.',
  diagHealthy: 'Centralização estável dentro da tolerância.',
  diagDeadzoneHint: 'Deadzone atual configurada para',
  diagOpenSettings: 'Calibrar Deadzone',
  settingsTitle: 'Ajustes Finos',
  settingsSubtitle: 'Calibração dos sticks analógicos e preferências',
  settingsDeadzoneDesc: 'Define o limite mínimo de inclinação antes de registrar movimento nos analógicos L e R, evitando tremores ou drift.',
  settingsMonitor: 'Monitor em Tempo Real (Bruto vs. Filtrado)',
  settingsLimit: 'Limite',
  settingsDriftFiltered: 'Drift filtrado',
  settingsAutoSaved: 'Salvo automaticamente no navegador',
  settingsRestoreDefault: 'Restaurar padrão (0.10)',
  settingsSaveTxt: 'Salvar ajuste .txt',
  settingsLoadTxt: 'Carregar .txt',
  combosTitle: 'Códigos & Combos',
  combosSubtitle: 'Crie, compartilhe, treine ou baixe cartões em PNG',
  combosNewBtn: '+ Novo Código / Combo',
  combosCloseCreator: 'Fechar Criador',
  combosTabAll: 'Todos',
  combosTabPreset: 'Clássicos',
  combosTabCustom: 'Meus Códigos',
  combosAllGames: 'Todos',
  combosEmptyCustom: 'Nenhum código personalizado salvo ainda',
  combosEmptyDefault: 'Nenhum combo encontrado',
  combosTrainBtn: 'Treinar Sequência',
  combosTrainingNow: 'Treinando Agora',
  combosDownloadPng: 'Baixar PNG',
  combosDownloadGamePng: 'Baixar Lista do Jogo (.png)',
  combosGeneratingPng: 'Gerando...',
  combosMyCodeTag: 'Meu Código',
  combosBackupExport: 'Exportar Backup (.json)',
  combosBackupImport: 'Importar Backup (.json)',
  combosShareCopy: 'Copiar Código',
  combosShareCopied: 'Copiado!',
  combosPastePlaceholder: 'Colar código de amigo (PAD2PS1:...)',
  combosPasteImport: 'Importar & Treinar',
  combosPasteInvalid: 'Código de compartilhamento inválido.',
  combosBackupSuccess: 'Backup importado com sucesso!',
  combosBackupError: 'Arquivo JSON inválido para backup do Pad2PS.',
  trainingComplete: 'Sequência completa!',
  trainingStepOf: (step, total) => `Passo ${step} de ${total}`,
  trainingAgain: 'Treinar Novamente',
  trainingRestart: 'Reiniciar',
  trainingStop: 'Encerrar Treino',
  pngGuideCategory: 'GUIA DE COMBOS & CÓDIGOS',
  pngControllerPrefix: 'Controle',
  pngFooter: 'Gerado com Pad2PS • pad2ps.vercel.app',
  logoMenuFull: 'Logo completa (.png)',
  logoMenuFullSub: 'Ícone + texto Pad2PS',
  logoMenuIcon: 'Apenas logo controle (.png)',
  logoMenuIconSub: 'Ícone quadrado 1:1 (512px)',
  footerNotice:
    'Pad2PS — Ferramenta independente feita por fãs. Sem vínculo com Sony Interactive Entertainment ou Microsoft.',
  footerTermsButton: 'Termos de Uso & Privacidade',
  legalCloseButton: 'Entendi / Fechar',
  installApp: 'Instalar App',
  installAppTitle: 'Instalar Pad2PS no dispositivo',
  installIosTitle: 'Instalar no iPhone / iPad',
  installIosStep1: '1. Toque no botão Compartilhar na barra do Safari.',
  installIosStep2: '2. Role para baixo e toque em Adicionar à Tela de Início.',
  offlineBadge: 'Modo Offline — Executando pelo cache local',
};

const EN_TRANSLATIONS: Translations = {
  appSubtitle: 'Visual X-Input to PlayStation Translator',
  waitingControl: 'Waiting for controller',
  waitingButton: 'Press any button...',
  connectedControl: 'Controller Connected',
  waitingBannerPrefix: 'Connect your controller (PC / X-Input mode) and',
  waitingBannerHighlight: 'press any button',
  waitingBannerSuffix: 'to activate detection',
  orClickSvg: 'Or click the SVG controller',
  pipButton: 'Floating Window (PiP)',
  pipActive: 'PiP Active',
  diagnosticsButton: 'Diagnostics & Sticks',
  remapButton: 'Remap Buttons',
  remapActive: 'Remapping',
  combosButton: 'Codes & Combos',
  compactButton: 'Compact Mode',
  expandButton: 'Expand',
  settingsButton: 'Settings',
  soundOn: 'PS2 Sound',
  soundOff: 'Muted',
  rumbleButton: 'Test Vibration',
  rumbleVibrating: 'Vibrating...',
  rumbleUnsupported: 'Vibration is not supported by this controller or browser.',
  rumbleDisconnected: 'No controller connected to test vibration.',
  close: 'Close',
  clickToTest: 'Click any button on the diagram to test',
  deadzoneLabel: 'Deadzone',
  chromaLabel: 'OBS Background',
  chromaDark: 'Dark',
  chromaGreen: 'Chroma Green',
  chromaMagenta: 'Chroma Magenta',
  lastPressedTitle: 'Last Button Pressed',
  simultaneousTitle: 'Simultaneous Combo',
  indexLabel: 'Index',
  activeCount: 'active',
  equivalence: 'Equivalent',
  onController: 'On GameSir / Xbox',
  noCommandTitle: 'No input recorded yet',
  noCommandSubtitle: 'Press a controller button or click the SVG diagram',
  analogLabel: 'Analog',
  axisL: 'Left Axis',
  axisR: 'Right Axis',
  quickRefTitle: 'Quick Reference Table',
  quickRefSubtitle: 'X-Input (GameSir / Xbox)',
  comboHistoryTitle: 'Command Sequence',
  last10Buttons: 'Last 10 buttons',
  comboHistoryEmpty: 'The last pressed buttons will appear here in chronological order...',
  downloadTxt: 'Download .txt',
  clear: 'Clear',
  statsClicks: 'Clicks',
  statsSpeed: 'Speed',
  statsPeak: 'Peak',
  statsPolling: 'Polling',
  statsReset: 'Reset stats',
  remapBannerStep1: 'Remap Mode: click a PlayStation button on the SVG below to pick the target.',
  remapBannerStep2: 'Now press the physical button on your controller to bind to',
  remapJapanesePreset: 'Swap X / O (Japanese Layout)',
  remapReset: 'Restore Default',
  remapDone: 'Done',
  diagTitle: 'Diagnostics & Analog Sticks',
  diagSubtitle: 'Precision radars, tilt percentage, and stick drift detection',
  diagLeftStick: 'Left Stick (L3)',
  diagRightStick: 'Right Stick (R3)',
  diagTilt: 'Tilt',
  diagDriftWarning: 'Possible drift detected (> 0.08) — consider increasing Deadzone.',
  diagHealthy: 'Centering stable within tolerance.',
  diagDeadzoneHint: 'Current Deadzone set to',
  diagOpenSettings: 'Calibrate Deadzone',
  settingsTitle: 'Fine-Tuning',
  settingsSubtitle: 'Analog stick calibration and preferences',
  settingsDeadzoneDesc: 'Sets the minimum stick tilt threshold before registering movement on L and R sticks, preventing jitter or drift.',
  settingsMonitor: 'Real-Time Monitor (Raw vs. Filtered)',
  settingsLimit: 'Threshold',
  settingsDriftFiltered: 'Drift filtered',
  settingsAutoSaved: 'Automatically saved in browser',
  settingsRestoreDefault: 'Restore default (0.10)',
  settingsSaveTxt: 'Save profile .txt',
  settingsLoadTxt: 'Load .txt',
  combosTitle: 'Codes & Combos',
  combosSubtitle: 'Create, share, train, or download PNG cheat sheets',
  combosNewBtn: '+ New Code / Combo',
  combosCloseCreator: 'Close Creator',
  combosTabAll: 'All',
  combosTabPreset: 'Classics',
  combosTabCustom: 'My Codes',
  combosAllGames: 'All',
  combosEmptyCustom: 'No custom codes saved yet',
  combosEmptyDefault: 'No combos found',
  combosTrainBtn: 'Train Sequence',
  combosTrainingNow: 'Training Now',
  combosDownloadPng: 'Download PNG',
  combosDownloadGamePng: 'Download Game Sheet (.png)',
  combosGeneratingPng: 'Generating...',
  combosMyCodeTag: 'My Code',
  combosBackupExport: 'Export Backup (.json)',
  combosBackupImport: 'Import Backup (.json)',
  combosShareCopy: 'Copy Share Code',
  combosShareCopied: 'Copied!',
  combosPastePlaceholder: 'Paste friend code (PAD2PS1:...)',
  combosPasteImport: 'Import & Train',
  combosPasteInvalid: 'Invalid share code.',
  combosBackupSuccess: 'Backup imported successfully!',
  combosBackupError: 'Invalid JSON backup file for Pad2PS.',
  trainingComplete: 'Sequence complete!',
  trainingStepOf: (step, total) => `Step ${step} of ${total}`,
  trainingAgain: 'Train Again',
  trainingRestart: 'Restart',
  trainingStop: 'End Training',
  pngGuideCategory: 'COMBOS & CHEAT CODES GUIDE',
  pngControllerPrefix: 'Controller',
  pngFooter: 'Generated with Pad2PS • pad2ps.vercel.app',
  logoMenuFull: 'Full logo (.png)',
  logoMenuFullSub: 'Icon + Pad2PS wordmark',
  logoMenuIcon: 'Controller icon only (.png)',
  logoMenuIconSub: 'Square 1:1 icon (512px)',
  footerNotice:
    'Pad2PS — Independent fan-made utility. Not affiliated with Sony Interactive Entertainment or Microsoft.',
  footerTermsButton: 'Terms of Use & Privacy',
  legalCloseButton: 'Got it / Close',
  installApp: 'Install App',
  installAppTitle: 'Install Pad2PS on your device',
  installIosTitle: 'Install on iPhone / iPad',
  installIosStep1: '1. Tap the Share button in the Safari toolbar.',
  installIosStep2: '2. Scroll down and tap Add to Home Screen.',
  offlineBadge: 'Offline Mode — Running from local cache',
};

export function getTranslations(lang: AppLanguage): Translations {
  return lang === 'en' ? EN_TRANSLATIONS : PT_TRANSLATIONS;
}

export function detectDefaultLanguage(): AppLanguage {
  if (typeof window === 'undefined') {
    return 'pt';
  }
  const navLang = (window.navigator.language || '').toLowerCase();
  return navLang.startsWith('en') ? 'en' : 'pt';
}
