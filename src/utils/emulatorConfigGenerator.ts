import type {AppLanguage} from '../data/i18n';
import type {ConsoleLayout} from '../data/ps2Mapping';

export type ConfigEmulatorId = 'duckstation' | 'pcsx2' | 'ppsspp';
export type GuideEmulatorId = 'duckstation' | 'pcsx2' | 'rpcs3' | 'ppsspp';
export type DuckStationDriver = 'SDL' | 'XInput';

/**
 * Inverts `remapMap` (physicalXboxIndex -> psButtonIndex) to find which physical
 * Xbox/PC input index triggers the target PlayStation button index.
 */
export function getPhysicalIndexForPsIndex(
  psIndex: number,
  remapMap: Record<number, number>
): number {
  for (let physIdx = 0; physIdx <= 16; physIdx++) {
    const mappedPs = remapMap[physIdx] ?? physIdx;
    if (mappedPs === psIndex) {
      return physIdx;
    }
  }
  return psIndex;
}

const SDL_TOKENS_BY_PHYSICAL_INDEX: Record<number, string> = {
  0: 'SDL-0/FaceSouth',
  1: 'SDL-0/FaceEast',
  2: 'SDL-0/FaceWest',
  3: 'SDL-0/FaceNorth',
  4: 'SDL-0/LeftShoulder',
  5: 'SDL-0/RightShoulder',
  6: 'SDL-0/LeftTrigger',
  7: 'SDL-0/RightTrigger',
  8: 'SDL-0/Back',
  9: 'SDL-0/Start',
  10: 'SDL-0/LeftStick',
  11: 'SDL-0/RightStick',
  12: 'SDL-0/DPadUp',
  13: 'SDL-0/DPadDown',
  14: 'SDL-0/DPadLeft',
  15: 'SDL-0/DPadRight',
  16: 'SDL-0/Guide',
};

const XINPUT_TOKENS_BY_PHYSICAL_INDEX: Record<number, string> = {
  0: 'XInput-0/A',
  1: 'XInput-0/B',
  2: 'XInput-0/X',
  3: 'XInput-0/Y',
  4: 'XInput-0/LeftShoulder',
  5: 'XInput-0/RightShoulder',
  6: 'XInput-0/LeftTrigger',
  7: 'XInput-0/RightTrigger',
  8: 'XInput-0/Back',
  9: 'XInput-0/Start',
  10: 'XInput-0/LeftThumb',
  11: 'XInput-0/RightThumb',
  12: 'XInput-0/DPadUp',
  13: 'XInput-0/DPadDown',
  14: 'XInput-0/DPadLeft',
  15: 'XInput-0/DPadRight',
  16: 'XInput-0/Guide',
};

// Standard Android/Desktop PPSSPP XInput device keycodes (Device ID 10 = XInput Pad)
const PPSSPP_KEYCODES_BY_PHYSICAL_INDEX: Record<number, string> = {
  0: '10-96', // A
  1: '10-97', // B
  2: '10-99', // X
  3: '10-100', // Y
  4: '10-102', // LB
  5: '10-103', // RB
  6: '10-4010', // LT axis
  7: '10-4011', // RT axis
  8: '10-109', // Back / Select
  9: '10-108', // Start / Menu
  10: '10-106', // L3
  11: '10-107', // R3
  12: '10-19', // D-Pad Up
  13: '10-20', // D-Pad Down
  14: '10-21', // D-Pad Left
  15: '10-22', // D-Pad Right
  16: '10-110', // Guide
};

function resolveToken(
  psIndex: number,
  remapMap: Record<number, number>,
  table: Record<number, string>
): string {
  const physIdx = getPhysicalIndexForPsIndex(psIndex, remapMap);
  return table[physIdx] ?? table[psIndex] ?? '';
}

export interface GenerateConfigOptions {
  emulator: ConfigEmulatorId;
  remapMap: Record<number, number>;
  controllerName: string | null;
  deadzone: number;
  duckStationDriver?: DuckStationDriver;
  lang: AppLanguage;
}

export interface GeneratedEmulatorConfig {
  fileName: string;
  content: string;
  installPathHint: string;
}

export function generateEmulatorConfig({
  emulator,
  remapMap,
  controllerName,
  deadzone,
  duckStationDriver = 'SDL',
  lang,
}: GenerateConfigOptions): GeneratedEmulatorConfig {
  const deviceLabel = controllerName || 'X-Input Controller (Xbox / GameSir)';
  const remapCount = Object.keys(remapMap).length;
  const deadzoneStr = deadzone.toFixed(2);
  const nowStr = new Date().toISOString().slice(0, 10);

  if (emulator === 'duckstation') {
    const table =
      duckStationDriver === 'XInput'
        ? XINPUT_TOKENS_BY_PHYSICAL_INDEX
        : SDL_TOKENS_BY_PHYSICAL_INDEX;
    const prefix = duckStationDriver === 'XInput' ? 'XInput-0' : 'SDL-0';

    const lines = [
      `; =========================================================`,
      `; Pad2PS — DuckStation (PS1) Input Profile`,
      `; Controller: ${deviceLabel}`,
      `; Driver: ${duckStationDriver} | Custom Remaps: ${remapCount} | Date: ${nowStr}`,
      `; =========================================================`,
      `[Pad1]`,
      `Type = AnalogController`,
      `Up = ${resolveToken(12, remapMap, table)}`,
      `Right = ${resolveToken(15, remapMap, table)}`,
      `Down = ${resolveToken(13, remapMap, table)}`,
      `Left = ${resolveToken(14, remapMap, table)}`,
      `Triangle = ${resolveToken(3, remapMap, table)}`,
      `Circle = ${resolveToken(1, remapMap, table)}`,
      `Cross = ${resolveToken(0, remapMap, table)}`,
      `Square = ${resolveToken(2, remapMap, table)}`,
      `Select = ${resolveToken(8, remapMap, table)}`,
      `Start = ${resolveToken(9, remapMap, table)}`,
      `L1 = ${resolveToken(4, remapMap, table)}`,
      `R1 = ${resolveToken(5, remapMap, table)}`,
      `L2 = ${resolveToken(6, remapMap, table)}`,
      `R2 = ${resolveToken(7, remapMap, table)}`,
      `L3 = ${resolveToken(10, remapMap, table)}`,
      `R3 = ${resolveToken(11, remapMap, table)}`,
      `Analog = ${resolveToken(16, remapMap, table)}`,
      `LUp = ${prefix}/-LeftY`,
      `LRight = ${prefix}/+LeftX`,
      `LDown = ${prefix}/+LeftY`,
      `LLeft = ${prefix}/-LeftX`,
      `RUp = ${prefix}/-RightY`,
      `RRight = ${prefix}/+RightX`,
      `RDown = ${prefix}/+RightY`,
      `RLeft = ${prefix}/-RightX`,
      `LargeMotor = ${prefix}/LargeMotor`,
      `SmallMotor = ${prefix}/SmallMotor`,
      `AnalogDeadzone = ${deadzoneStr}`,
    ];

    return {
      fileName: 'Pad2PS_DuckStation.ini',
      content: lines.join('\n'),
      installPathHint:
        lang === 'en'
          ? 'Open DuckStation → Settings → Controllers → Controller Port 1 → Load Profile (or paste into Documents/DuckStation/inputprofiles/Pad2PS_DuckStation.ini).'
          : 'No DuckStation, acesse Configurações → Controles → Porta 1 → Carregar Perfil (ou salve em Documentos/DuckStation/inputprofiles/Pad2PS_DuckStation.ini).',
    };
  }

  if (emulator === 'pcsx2') {
    const lines = [
      `# =========================================================`,
      `# Pad2PS — PCSX2 (PS2 Qt) Input Profile`,
      `# Controller: ${deviceLabel}`,
      `# Driver: SDL | Custom Remaps: ${remapCount} | Date: ${nowStr}`,
      `# =========================================================`,
      `[Pad1]`,
      `Type = DualShock2`,
      `Up = ${resolveToken(12, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `Right = ${resolveToken(15, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `Down = ${resolveToken(13, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `Left = ${resolveToken(14, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `Triangle = ${resolveToken(3, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `Circle = ${resolveToken(1, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `Cross = ${resolveToken(0, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `Square = ${resolveToken(2, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `Select = ${resolveToken(8, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `Start = ${resolveToken(9, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `L1 = ${resolveToken(4, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `R1 = ${resolveToken(5, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `L2 = ${resolveToken(6, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `R2 = ${resolveToken(7, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `L3 = ${resolveToken(10, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `R3 = ${resolveToken(11, remapMap, SDL_TOKENS_BY_PHYSICAL_INDEX)}`,
      `LUp = SDL-0/-LeftY`,
      `LRight = SDL-0/+LeftX`,
      `LDown = SDL-0/+LeftY`,
      `LLeft = SDL-0/-LeftX`,
      `RUp = SDL-0/-RightY`,
      `RRight = SDL-0/+RightX`,
      `RDown = SDL-0/+RightY`,
      `RLeft = SDL-0/-RightX`,
      `LargeMotor = SDL-0/LargeMotor`,
      `SmallMotor = SDL-0/SmallMotor`,
      `Deadzone = ${deadzoneStr}`,
    ];

    return {
      fileName: 'Pad2PS_PCSX2.ini',
      content: lines.join('\n'),
      installPathHint:
        lang === 'en'
          ? 'In PCSX2 Qt, open Settings → Controllers → Load Profile (or paste [Pad1] into Documents/PCSX2/inis/Pad2PS_PCSX2.ini).'
          : 'No PCSX2 Qt, acesse Configurações → Controles → Carregar Perfil (ou cole o bloco [Pad1] em Documentos/PCSX2/inis/Pad2PS_PCSX2.ini).',
    };
  }

  // PPSSPP (PSP) — controls.ini
  const lines = [
    `# =========================================================`,
    `# Pad2PS — PPSSPP (PSP) Control Mapping`,
    `# Controller: ${deviceLabel}`,
    `# Custom Remaps: ${remapCount} | Date: ${nowStr}`,
    `# =========================================================`,
    `[ControlMapping]`,
    `Up = ${resolveToken(12, remapMap, PPSSPP_KEYCODES_BY_PHYSICAL_INDEX)}`,
    `Down = ${resolveToken(13, remapMap, PPSSPP_KEYCODES_BY_PHYSICAL_INDEX)}`,
    `Left = ${resolveToken(14, remapMap, PPSSPP_KEYCODES_BY_PHYSICAL_INDEX)}`,
    `Right = ${resolveToken(15, remapMap, PPSSPP_KEYCODES_BY_PHYSICAL_INDEX)}`,
    `Circle = ${resolveToken(1, remapMap, PPSSPP_KEYCODES_BY_PHYSICAL_INDEX)}`,
    `Cross = ${resolveToken(0, remapMap, PPSSPP_KEYCODES_BY_PHYSICAL_INDEX)}`,
    `Square = ${resolveToken(2, remapMap, PPSSPP_KEYCODES_BY_PHYSICAL_INDEX)}`,
    `Triangle = ${resolveToken(3, remapMap, PPSSPP_KEYCODES_BY_PHYSICAL_INDEX)}`,
    `Start = ${resolveToken(9, remapMap, PPSSPP_KEYCODES_BY_PHYSICAL_INDEX)}`,
    `Select = ${resolveToken(8, remapMap, PPSSPP_KEYCODES_BY_PHYSICAL_INDEX)}`,
    `L = ${resolveToken(4, remapMap, PPSSPP_KEYCODES_BY_PHYSICAL_INDEX)}`,
    `R = ${resolveToken(5, remapMap, PPSSPP_KEYCODES_BY_PHYSICAL_INDEX)}`,
    `An.Up = 10-4003`,
    `An.Down = 10-4002`,
    `An.Left = 10-4001`,
    `An.Right = 10-4000`,
    `Pause = ${resolveToken(16, remapMap, PPSSPP_KEYCODES_BY_PHYSICAL_INDEX)}`,
  ];

  return {
    fileName: 'controls.ini',
    content: lines.join('\n'),
    installPathHint:
      lang === 'en'
        ? 'Replace controls.ini inside your PPSSPP folder: memstick/PSP/SYSTEM/controls.ini (back up your original file first).'
        : 'Substitua o arquivo controls.ini na pasta do PPSSPP: memstick/PSP/SYSTEM/controls.ini (faça backup do original antes).',
  };
}

export interface EmulatorQuickGuideData {
  id: GuideEmulatorId;
  name: string;
  consoleTag: ConsoleLayout;
  driverTitle: string;
  driverBadge: string;
  driverDesc: string;
  rumbleTitle: string;
  rumbleDesc: string;
  proTipTitle: string;
  proTipDesc: string;
}

export function getEmulatorQuickGuides(lang: AppLanguage): EmulatorQuickGuideData[] {
  if (lang === 'en') {
    return [
      {
        id: 'duckstation',
        name: 'DuckStation',
        consoleTag: 'ps1',
        driverTitle: 'Recommended Input Driver',
        driverBadge: 'SDL (Primary) · XInput',
        driverDesc:
          'Enable "SDL Input Source" under Settings → Controllers → Global Settings for instant GameSir, Xbox, and DualShock auto-detection. Use "AnalogController (DualShock)" on Port 1.',
        rumbleTitle: 'Vibration / Rumble',
        rumbleDesc:
          'Click "Test Vibration" inside Port 1 settings or assign SDL-0/LargeMotor and SDL-0/SmallMotor. Works natively in PS1 DualShock titles like Gran Turismo and Metal Gear Solid.',
        proTipTitle: 'Pro Calibration Tip',
        proTipDesc:
          'Set Analog Deadzone between 0.10 and 0.15 (10%–15%) to stop camera drift. For old non-analog PS1 games, keep a shortcut bound to "Analog Toggle" to switch modes mid-game.',
      },
      {
        id: 'pcsx2',
        name: 'PCSX2',
        consoleTag: 'ps2',
        driverTitle: 'Recommended Input Driver',
        driverBadge: 'SDL · DualShock 2',
        driverDesc:
          'Use PCSX2 Qt (v1.7 / v2.0+) with SDL Input Source enabled in Controllers → Global Settings. Set Port 1 Type to DualShock 2 and click "Automatic Mapping → SDL-0".',
        rumbleTitle: 'Vibration / Rumble',
        rumbleDesc:
          'Under Pad 1 → Vibration, bind Large Motor to SDL-0/LargeMotor and Small Motor to SDL-0/SmallMotor, then hit "Test" to verify both heavy and light DualShock 2 actuators.',
        proTipTitle: 'DualShock 2 Pressure & Deadzone',
        proTipDesc:
          'Keep Deadzone at 10%–12%. For games with pressure-sensitive buttons (MGS2/3, Gran Turismo 4, Ace Combat), bind "Pressure Modifier" to LB or LT so half-presses work on digital Xbox face buttons.',
      },
      {
        id: 'rpcs3',
        name: 'RPCS3',
        consoleTag: 'ps3',
        driverTitle: 'Recommended Input Handler',
        driverBadge: 'XInput · DualSense / SDL',
        driverDesc:
          'Open Pads → Player 1 and choose "XInput" for GameSir/Xbox controllers (or "SDL" / "DualSense" for PlayStation pads). XInput guarantees zero axis conflicts on Windows and Linux.',
        rumbleTitle: 'Vibration / Rumble',
        rumbleDesc:
          'Select "Enable Vibration" in the Player 1 Pad Settings panel and test both Left (Large) and Right (Small) rumble sliders. Ensure Steam Input desktop overlay is disabled to avoid double inputs.',
        proTipTitle: 'Triggers & Sixaxis Deadzone',
        proTipDesc:
          'Set Left/Right Stick Deadzone around 12%–15% and Trigger Threshold to ~10% so hair-triggers (LT/RT) do not misfire in shooters. Map R3/L3 cleanly for God of War III & Demon’s Souls.',
      },
      {
        id: 'ppsspp',
        name: 'PPSSPP',
        consoleTag: 'psp',
        driverTitle: 'Recommended Input Driver',
        driverBadge: 'XInput (Windows) · HID (Android)',
        driverDesc:
          'PPSSPP detects X-Input gamepads automatically. Open Settings → Controls → Control Mapping and verify that A/B/X/Y match Cross/Circle/Square/Triangle (or use our controls.ini export).',
        rumbleTitle: 'Vibration / Rumble',
        rumbleDesc:
          'The original PSP had no hardware rumble, so standard PSP games do not vibrate. Optional haptic plugins or Android "Vibrate on key press" can be toggled in Controls settings.',
        proTipTitle: 'Single-Stick & Camera Tip',
        proTipDesc:
          'Keep Analog Stick Deadzone at 10%–15%. Since PSP only has 1 left stick, you can map the unused Right Xbox Stick (RS) to D-Pad Left/Right/Up/Down for comfortable camera control in Monster Hunter and Peace Walker!',
      },
    ];
  }

  return [
    {
      id: 'duckstation',
      name: 'DuckStation',
      consoleTag: 'ps1',
      driverTitle: 'Driver de Controle Recomendado',
      driverBadge: 'SDL (Ideal) · XInput',
      driverDesc:
        'Ative "SDL Input Source" em Configurações → Controles → Configurações Globais para reconhecimento imediato de GameSir, Xbox e DualShock. Defina a Porta 1 como "AnalogController (DualShock)".',
      rumbleTitle: 'Vibração (Rumble)',
      rumbleDesc:
        'Vincule LargeMotor a SDL-0/LargeMotor e SmallMotor a SDL-0/SmallMotor na aba da Porta 1 e clique em "Testar". Funciona perfeitamente em jogos como Metal Gear Solid e Gran Turismo.',
      proTipTitle: 'Dica Pro de Deadzone e Analógico',
      proTipDesc:
        'Mantenha a Zona Morta entre 10% e 15% (0.10–0.15) para eliminar drift. Em jogos antigos de PS1 sem suporte a analógico, configure um atalho para "Analog Toggle" alternar entre digital e analógico.',
    },
    {
      id: 'pcsx2',
      name: 'PCSX2',
      consoleTag: 'ps2',
      driverTitle: 'Driver de Controle Recomendado',
      driverBadge: 'SDL · DualShock 2',
      driverDesc:
        'Use o PCSX2 Qt (v1.7 / v2.0+) com "SDL Input Source" ativado em Configurações → Controles. Selecione "DualShock 2" na Porta 1 e clique em "Mapeamento Automático → SDL-0".',
      rumbleTitle: 'Vibração (Rumble)',
      rumbleDesc:
        'Em Porta 1 → Vibração, associe Motor Grande (SDL-0/LargeMotor) e Motor Pequeno (SDL-0/SmallMotor) e clique em "Testar Vibração" para validar os dois motores do DualShock 2.',
      proTipTitle: 'Dica Pro: Pressão Analógica & Gatilhos',
      proTipDesc:
        'Use Deadzone de 10% a 12%. Jogos de PS2 como MGS2/3, Gran Turismo 4 e Ace Combat usam botões sensíveis à pressão: configure um botão para "Modificador de Pressão" (ex: LB) e evite disparos acidentais nos gatilhos LT/RT.',
    },
    {
      id: 'rpcs3',
      name: 'RPCS3',
      consoleTag: 'ps3',
      driverTitle: 'Driver de Controle Recomendado',
      driverBadge: 'XInput · SDL / DualSense',
      driverDesc:
        'Acesse Pads → Jogador 1 e selecione "XInput" para controles GameSir/Xbox (ou "SDL" / "DualSense" para controles Sony). O modo XInput evita conflitos de eixos e botões duplicados.',
      rumbleTitle: 'Vibração (Rumble)',
      rumbleDesc:
        'Marque a caixa "Enable Vibration" no painel do Jogador 1 e teste os controles deslizantes Left/Right Motor. Dica: feche ou desative o Steam Input em segundo plano para evitar entrada dupla.',
      proTipTitle: 'Dica Pro: Gatilhos & Sixaxis',
      proTipDesc:
        'Ajuste a Deadzone dos analógicos entre 12% e 15% e o limite dos gatilhos (Trigger Threshold) em ~10%. Isso evita toques falsos em gatilhos rápidos (hair-triggers) em jogos como God of War III.',
    },
    {
      id: 'ppsspp',
      name: 'PPSSPP',
      consoleTag: 'psp',
      driverTitle: 'Driver de Controle Recomendado',
      driverBadge: 'XInput (PC) · HID (Android)',
      driverDesc:
        'O PPSSPP reconhece controles X-Input nativamente. Vá em Configurações → Controles → Mapear Controles para conferir A/B/X/Y ↔ X/O/□/△ ou importe o arquivo controls.ini gerado ao lado.',
      rumbleTitle: 'Vibração (Rumble)',
      rumbleDesc:
        'O PSP original não possuía motor de vibração, portanto os jogos não enviam sinal de rumble. No Android/PC você pode ativar feedback tátil opcional nas opções de toque se desejar.',
      proTipTitle: 'Dica Pro: Analógico Direito Livre',
      proTipDesc:
        'Defina a Deadzone do analógico em 10%–15%. Como o PSP só tem 1 analógico (esquerdo), mapeie o analógico direito (RS) do seu controle nas setas do D-Pad para controlar a câmera confortavelmente em Monster Hunter e MGS Peace Walker!',
    },
  ];
}
