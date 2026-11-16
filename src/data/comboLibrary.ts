import type {Ps2ButtonId} from './ps2Mapping';

export interface ComboDefinition {
  id: string;
  game: string;
  title: string;
  subtitle: string;
  sequence: Ps2ButtonId[];
  isCustom?: boolean;
}

export const SUGGESTED_GAMES: string[] = [
  'God of War II',
  'GTA San Andreas',
  'Resident Evil 4',
  'Tekken 5',
  'Bully',
  'Shadow of the Colossus',
  'Devil May Cry 3',
];

export const BUILDER_BUTTON_PALETTE: {id: Ps2ButtonId; label: string}[] = [
  {id: 'cross', label: 'X'},
  {id: 'circle', label: 'O'},
  {id: 'square', label: '□'},
  {id: 'triangle', label: '△'},
  {id: 'l1', label: 'L1'},
  {id: 'r1', label: 'R1'},
  {id: 'l2', label: 'L2'},
  {id: 'r2', label: 'R2'},
  {id: 'l3', label: 'L3'},
  {id: 'r3', label: 'R3'},
  {id: 'up', label: 'Cima'},
  {id: 'down', label: 'Baixo'},
  {id: 'left', label: 'Esq.'},
  {id: 'right', label: 'Dir.'},
  {id: 'start', label: 'START'},
  {id: 'select', label: 'SELECT'},
];

export const COMBO_LIBRARY: ComboDefinition[] = [
  // God of War II
  {
    id: 'gow2-plume',
    game: 'God of War II',
    title: 'Plume of Prometheus',
    subtitle: 'Combo clássico de finalização com as Lâminas de Atena',
    sequence: ['square', 'square', 'triangle'],
  },
  {
    id: 'gow2-cyclone',
    game: 'God of War II',
    title: 'Cyclone of Chaos',
    subtitle: 'Ataque giratório em área (segure L1 + □)',
    sequence: ['l1', 'square'],
  },
  {
    id: 'gow2-valor',
    game: 'God of War II',
    title: 'Valor of Hercules',
    subtitle: 'Sequência pesada de três golpes fortes',
    sequence: ['triangle', 'triangle', 'triangle'],
  },
  {
    id: 'gow2-spirit',
    game: 'God of War II',
    title: 'Spirit of Hercules',
    subtitle: 'Combo misto aéreo / impacto no chão',
    sequence: ['triangle', 'triangle', 'square'],
  },

  // GTA San Andreas
  {
    id: 'gtasa-health',
    game: 'GTA San Andreas',
    title: 'Vida, Colete e $250k',
    subtitle: 'Restaura saúde, armadura e adiciona dinheiro',
    sequence: [
      'r1',
      'r2',
      'l1',
      'cross',
      'left',
      'down',
      'right',
      'up',
      'left',
      'down',
      'right',
      'up',
    ],
  },
  {
    id: 'gtasa-jetpack',
    game: 'GTA San Andreas',
    title: 'Invocar Jetpack',
    subtitle: 'Equipamento de voo instantâneo',
    sequence: [
      'l1',
      'l2',
      'r1',
      'r2',
      'up',
      'down',
      'left',
      'right',
      'l1',
      'l2',
      'r1',
      'r2',
      'up',
      'down',
      'left',
      'right',
    ],
  },
  {
    id: 'gtasa-weapons1',
    game: 'GTA San Andreas',
    title: 'Armas Tier 1',
    subtitle: 'Pacote inicial de armas de rua',
    sequence: [
      'r1',
      'r2',
      'l1',
      'r2',
      'left',
      'down',
      'right',
      'up',
      'left',
      'down',
      'right',
      'up',
    ],
  },
  {
    id: 'gtasa-wanted',
    game: 'GTA San Andreas',
    title: 'Zerar Nível de Procurado',
    subtitle: 'Remove todas as estrelas da polícia',
    sequence: [
      'r1',
      'r1',
      'circle',
      'r2',
      'up',
      'down',
      'up',
      'down',
      'up',
      'down',
    ],
  },

  // Resident Evil 4
  {
    id: 're4-quickturn',
    game: 'Resident Evil 4',
    title: 'Giro Rápido 180°',
    subtitle: 'Virada instantânea para escapar de cercos',
    sequence: ['down', 'square'],
  },
  {
    id: 're4-qte-dodge',
    game: 'Resident Evil 4',
    title: 'Esquiva QTE Clássica',
    subtitle: 'Acionamento rápido de esquiva em cutscenes',
    sequence: ['l1', 'r1'],
  },
  {
    id: 're4-knife-slash',
    game: 'Resident Evil 4',
    title: 'Ataque Rápido com Faca',
    subtitle: 'Preparar faca e golpear em seguida',
    sequence: ['l1', 'cross'],
  },

  // Tekken 5
  {
    id: 'tk5-ewgf',
    game: 'Tekken 5',
    title: 'Wind God Fist (Mishima)',
    subtitle: 'Entrada clássica → ↓ → △',
    sequence: ['right', 'down', 'right', 'triangle'],
  },
  {
    id: 'tk5-jin-combo',
    game: 'Tekken 5',
    title: 'Sequência Clássica (Jin)',
    subtitle: 'Encadeamento rápido de socos e chutes',
    sequence: ['triangle', 'square', 'triangle', 'triangle', 'circle', 'cross'],
  },
];
