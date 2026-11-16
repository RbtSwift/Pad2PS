import {buildPad2PSFaviconDataUri} from '../components/Pad2PSLogo';

export interface NeonTheme {
  id: string;
  name: string;
  hex: string;
  rgb: string;
}

export const NEON_THEMES: NeonTheme[] = [
  {
    id: 'neon-pink',
    name: 'Rosa Neon',
    hex: '#FF2E93',
    rgb: '255, 46, 147',
  },
  {
    id: 'ps2-blue',
    name: 'Azul PS2 Clássico',
    hex: '#3B82F6',
    rgb: '59, 130, 246',
  },
  {
    id: 'cyber-purple',
    name: 'Roxo Cyberpunk',
    hex: '#A855F7',
    rgb: '168, 85, 247',
  },
  {
    id: 'matrix-green',
    name: 'Verde Matrix',
    hex: '#10B981',
    rgb: '16, 185, 129',
  },
  {
    id: 'gow-red',
    name: 'Vermelho God of War',
    hex: '#EF4444',
    rgb: '239, 68, 68',
  },
];

export const DEFAULT_THEME_ID = 'neon-pink';

export function getThemeById(id: string | null): NeonTheme {
  return NEON_THEMES.find((t) => t.id === id) ?? NEON_THEMES[0];
}

export function applyNeonThemeToDocument(theme: NeonTheme): void {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  root.style.setProperty('--accent-color', theme.hex);
  root.style.setProperty('--accent-rgb', theme.rgb);
  root.style.setProperty(
    '--accent-glow',
    `0 0 18px rgba(${theme.rgb}, 0.42), 0 0 4px rgba(${theme.rgb}, 0.55)`
  );

  const faviconHref = buildPad2PSFaviconDataUri(theme.hex);
  let link = document.getElementById('pad2ps-favicon') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = 'pad2ps-favicon';
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
  }
  link.href = faviconHref;
}
