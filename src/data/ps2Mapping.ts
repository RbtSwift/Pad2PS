export type ConsoleLayout = 'ps1' | 'ps2' | 'ps3' | 'psp';

export type Ps2ButtonId =
  | 'cross'
  | 'circle'
  | 'square'
  | 'triangle'
  | 'l1'
  | 'r1'
  | 'l2'
  | 'r2'
  | 'select'
  | 'start'
  | 'l3'
  | 'r3'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'ps';

export interface Ps2ButtonMapping {
  index: number;
  id: Ps2ButtonId;
  ps2Symbol: string;
  ps2Short: string;
  ps2Name: string;
  xinputLabel: string;
  xinputShort: string;
  category: 'face' | 'shoulder' | 'system' | 'stick' | 'dpad';
  isAnalogTrigger?: boolean;
}

export const PS2_BUTTON_MAP: Record<number, Ps2ButtonMapping> = {
  0: {
    index: 0,
    id: 'cross',
    ps2Symbol: '✕',
    ps2Short: 'X',
    ps2Name: 'X (Cruz)',
    xinputLabel: 'Botão A no GameSir / Xbox',
    xinputShort: 'A',
    category: 'face',
  },
  1: {
    index: 1,
    id: 'circle',
    ps2Symbol: '◯',
    ps2Short: 'O',
    ps2Name: 'Bolinha (Círculo)',
    xinputLabel: 'Botão B no GameSir / Xbox',
    xinputShort: 'B',
    category: 'face',
  },
  2: {
    index: 2,
    id: 'square',
    ps2Symbol: '□',
    ps2Short: '□',
    ps2Name: 'Quadrado',
    xinputLabel: 'Botão X no GameSir / Xbox',
    xinputShort: 'X',
    category: 'face',
  },
  3: {
    index: 3,
    id: 'triangle',
    ps2Symbol: '△',
    ps2Short: '△',
    ps2Name: 'Triângulo',
    xinputLabel: 'Botão Y no GameSir / Xbox',
    xinputShort: 'Y',
    category: 'face',
  },
  4: {
    index: 4,
    id: 'l1',
    ps2Symbol: 'L1',
    ps2Short: 'L1',
    ps2Name: 'L1 (Ombro Esquerdo)',
    xinputLabel: 'Botão LB no GameSir / Xbox',
    xinputShort: 'LB',
    category: 'shoulder',
  },
  5: {
    index: 5,
    id: 'r1',
    ps2Symbol: 'R1',
    ps2Short: 'R1',
    ps2Name: 'R1 (Ombro Direito)',
    xinputLabel: 'Botão RB no GameSir / Xbox',
    xinputShort: 'RB',
    category: 'shoulder',
  },
  6: {
    index: 6,
    id: 'l2',
    ps2Symbol: 'L2',
    ps2Short: 'L2',
    ps2Name: 'L2 (Gatilho Esquerdo)',
    xinputLabel: 'Gatilho LT no GameSir / Xbox',
    xinputShort: 'LT',
    category: 'shoulder',
    isAnalogTrigger: true,
  },
  7: {
    index: 7,
    id: 'r2',
    ps2Symbol: 'R2',
    ps2Short: 'R2',
    ps2Name: 'R2 (Gatilho Direito)',
    xinputLabel: 'Gatilho RT no GameSir / Xbox',
    xinputShort: 'RT',
    category: 'shoulder',
    isAnalogTrigger: true,
  },
  8: {
    index: 8,
    id: 'select',
    ps2Symbol: 'SELECT',
    ps2Short: 'SEL',
    ps2Name: 'SELECT',
    xinputLabel: 'Botão View / Back no GameSir / Xbox',
    xinputShort: 'View',
    category: 'system',
  },
  9: {
    index: 9,
    id: 'start',
    ps2Symbol: 'START',
    ps2Short: 'STA',
    ps2Name: 'START',
    xinputLabel: 'Botão Menu / Start no GameSir / Xbox',
    xinputShort: 'Menu',
    category: 'system',
  },
  10: {
    index: 10,
    id: 'l3',
    ps2Symbol: 'L3',
    ps2Short: 'L3',
    ps2Name: 'L3 (Clique Analógico Esq.)',
    xinputLabel: 'Clique no Analógico Esquerdo (LS)',
    xinputShort: 'LS',
    category: 'stick',
  },
  11: {
    index: 11,
    id: 'r3',
    ps2Symbol: 'R3',
    ps2Short: 'R3',
    ps2Name: 'R3 (Clique Analógico Dir.)',
    xinputLabel: 'Clique no Analógico Direito (RS)',
    xinputShort: 'RS',
    category: 'stick',
  },
  12: {
    index: 12,
    id: 'up',
    ps2Symbol: '↑',
    ps2Short: '↑',
    ps2Name: 'Seta para Cima',
    xinputLabel: 'D-Pad Cima no GameSir / Xbox',
    xinputShort: 'D-Cima',
    category: 'dpad',
  },
  13: {
    index: 13,
    id: 'down',
    ps2Symbol: '↓',
    ps2Short: '↓',
    ps2Name: 'Seta para Baixo',
    xinputLabel: 'D-Pad Baixo no GameSir / Xbox',
    xinputShort: 'D-Baixo',
    category: 'dpad',
  },
  14: {
    index: 14,
    id: 'left',
    ps2Symbol: '←',
    ps2Short: '←',
    ps2Name: 'Seta para Esquerda',
    xinputLabel: 'D-Pad Esquerda no GameSir / Xbox',
    xinputShort: 'D-Esq',
    category: 'dpad',
  },
  15: {
    index: 15,
    id: 'right',
    ps2Symbol: '→',
    ps2Short: '→',
    ps2Name: 'Seta para Direita',
    xinputLabel: 'D-Pad Direita no GameSir / Xbox',
    xinputShort: 'D-Dir',
    category: 'dpad',
  },
  16: {
    index: 16,
    id: 'ps',
    ps2Symbol: 'PS',
    ps2Short: 'PS',
    ps2Name: 'Botão PS (Home)',
    xinputLabel: 'Botão Guide / Home no GameSir / Xbox',
    xinputShort: 'Guide',
    category: 'system',
  },
};

export const PS2_BUTTON_BY_ID: Record<Ps2ButtonId, Ps2ButtonMapping> = Object.values(
  PS2_BUTTON_MAP
).reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<Ps2ButtonId, Ps2ButtonMapping>
);

export const PS2_BUTTON_LIST: Ps2ButtonMapping[] = Object.values(PS2_BUTTON_MAP).sort(
  (a, b) => a.index - b.index
);

export const CONSOLE_META: Record<
  ConsoleLayout,
  {label: string; shortLabel: string; hardwareName: string}
> = {
  ps1: {
    label: 'PS1 Clássico',
    shortLabel: 'PS1',
    hardwareName: 'PlayStation 1 (Digital)',
  },
  ps2: {
    label: 'PS2 DualShock 2',
    shortLabel: 'PS2',
    hardwareName: 'PlayStation 2 (DualShock 2)',
  },
  ps3: {
    label: 'PS3 DualShock 3',
    shortLabel: 'PS3',
    hardwareName: 'PlayStation 3 (DualShock 3)',
  },
  psp: {
    label: 'PSP Portátil',
    shortLabel: 'PSP',
    hardwareName: 'PlayStation Portable (PSP)',
  },
};

export function getQuickReferenceIndices(layout: ConsoleLayout): number[] {
  switch (layout) {
    case 'ps1':
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    case 'ps2':
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    case 'ps3':
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16];
    case 'psp':
      return [0, 1, 2, 3, 4, 5, 8, 9];
  }
}

export function getConsoleButtonDisplayName(
  mapping: Ps2ButtonMapping,
  layout: ConsoleLayout,
  lang: 'pt' | 'en' = 'pt'
): string {
  if (lang === 'en') {
    if (layout === 'psp') {
      if (mapping.id === 'l1') {
        return 'L Trigger (Left Shoulder)';
      }
      if (mapping.id === 'r1') {
        return 'R Trigger (Right Shoulder)';
      }
    }
    switch (mapping.id) {
      case 'cross':
        return 'Cross (X)';
      case 'circle':
        return 'Circle (O)';
      case 'square':
        return 'Square (□)';
      case 'triangle':
        return 'Triangle (△)';
      case 'l1':
        return 'L1 (Left Bumper)';
      case 'r1':
        return 'R1 (Right Bumper)';
      case 'l2':
        return 'L2 (Left Trigger)';
      case 'r2':
        return 'R2 (Right Trigger)';
      case 'l3':
        return 'L3 (Left Stick Click)';
      case 'r3':
        return 'R3 (Right Stick Click)';
      case 'up':
        return 'D-Pad Up';
      case 'down':
        return 'D-Pad Down';
      case 'left':
        return 'D-Pad Left';
      case 'right':
        return 'D-Pad Right';
      case 'ps':
        return 'PS Button (Home)';
      default:
        return mapping.ps2Name;
    }
  }

  if (layout === 'psp') {
    if (mapping.id === 'l1') {
      return 'Gatilho L (Ombro Esq.)';
    }
    if (mapping.id === 'r1') {
      return 'Gatilho R (Ombro Dir.)';
    }
  }
  return mapping.ps2Name;
}

export function getXInputDisplayLabel(
  mapping: Ps2ButtonMapping,
  lang: 'pt' | 'en' = 'pt'
): string {
  if (lang === 'pt') {
    return mapping.xinputLabel;
  }
  switch (mapping.id) {
    case 'cross':
      return 'A Button on GameSir / Xbox';
    case 'circle':
      return 'B Button on GameSir / Xbox';
    case 'square':
      return 'X Button on GameSir / Xbox';
    case 'triangle':
      return 'Y Button on GameSir / Xbox';
    case 'l1':
      return 'LB Button on GameSir / Xbox';
    case 'r1':
      return 'RB Button on GameSir / Xbox';
    case 'l2':
      return 'LT Trigger on GameSir / Xbox';
    case 'r2':
      return 'RT Trigger on GameSir / Xbox';
    case 'select':
      return 'View / Back Button on GameSir / Xbox';
    case 'start':
      return 'Menu / Start Button on GameSir / Xbox';
    case 'l3':
      return 'Left Stick Click (LS)';
    case 'r3':
      return 'Right Stick Click (RS)';
    case 'up':
      return 'D-Pad Up on GameSir / Xbox';
    case 'down':
      return 'D-Pad Down on GameSir / Xbox';
    case 'left':
      return 'D-Pad Left on GameSir / Xbox';
    case 'right':
      return 'D-Pad Right on GameSir / Xbox';
    case 'ps':
      return 'Guide / Home Button on GameSir / Xbox';
  }
}

export function getConsoleButtonShort(
  mapping: Ps2ButtonMapping,
  layout: ConsoleLayout
): string {
  if (layout === 'psp') {
    if (mapping.id === 'l1') {
      return 'L';
    }
    if (mapping.id === 'r1') {
      return 'R';
    }
  }
  return mapping.ps2Short;
}

export const DEADZONE = 0.1;

export function applyDeadzone(value: number, deadzone = DEADZONE): number {
  if (Math.abs(value) < deadzone) {
    return 0;
  }
  const sign = Math.sign(value);
  const scaled = (Math.abs(value) - deadzone) / (1 - deadzone);
  return Math.max(-1, Math.min(1, sign * scaled));
}
