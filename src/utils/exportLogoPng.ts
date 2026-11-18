function getActiveNeonTheme(): { hex: string; rgb: string } {
  if (typeof window === 'undefined') {
    return { hex: '#FF1E8E', rgb: '255, 30, 142' };
  }
  const styles = window.getComputedStyle(document.documentElement);
  const hex = styles.getPropertyValue('--accent-color').trim() || '#FF1E8E';
  const rgb = styles.getPropertyValue('--accent-rgb').trim() || '255, 30, 142';
  return { hex, rgb };
}

export function buildPad2PSIconSvg(accentHex = '#FF1E8E', size = 1024): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024" fill="none">
  <defs>
    <filter id="p2pGlowSoft" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="14" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="p2pGlowStrong" x="-60%" y="-60%" width="220%" height="220%" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="22" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <linearGradient id="p2pSquircle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E0E15" />
      <stop offset="100%" stop-color="#09090D" />
    </linearGradient>
  </defs>

  <rect x="64" y="64" width="896" height="896" rx="220" fill="url(#p2pSquircle)" stroke="${accentHex}" stroke-width="14" filter="url(#p2pGlowStrong)" />
  <rect x="96" y="96" width="832" height="832" rx="190" fill="none" stroke="${accentHex}" stroke-width="3.5" stroke-opacity="0.65" />

  <!-- Controle DualShock Neon Central -->
  <g transform="translate(82, 102) scale(26.875)" filter="url(#p2pGlowSoft)">
    <path
      d="M8.8 10.2C6.4 10.2 4.8 12.1 4.4 14.8L3.4 20.6C3.1 22.6 4.4 24.2 6.1 24.2C7.6 24.2 8.7 22.8 9.6 20.8C10.2 19.4 10.9 19 11.9 19.6C12.8 20.2 14.1 20.5 16 20.5C17.9 20.5 19.2 20.2 20.1 19.6C21.1 19 21.8 19.4 22.4 20.8C23.3 22.8 24.4 24.2 25.9 24.2C27.6 24.2 28.9 22.6 28.6 20.6L27.6 14.8C27.2 12.1 25.6 10.2 23.2 10.2C21.6 10.2 20.6 11 19.5 11.2H12.5C11.4 11 10.4 10.2 8.8 10.2Z"
      fill="#121218"
      stroke="${accentHex}"
      stroke-width="1.3"
      stroke-linejoin="round"
    />
    <path d="M8.1 15.1H10.9M9.5 13.7V16.5" stroke="#FFFFFF" stroke-width="1.35" stroke-linecap="round" />
    <circle cx="22.5" cy="13.2" r="0.95" fill="#22C55E" />
    <circle cx="24.2" cy="14.9" r="0.95" fill="#FB7185" />
    <circle cx="22.5" cy="16.6" r="0.95" fill="#3B82F6" />
    <circle cx="20.8" cy="14.9" r="0.95" fill="#F97316" />
    <text
      x="16"
      y="17.8"
      text-anchor="middle"
      fill="#FFFFFF"
      stroke="${accentHex}"
      stroke-width="0.25"
      font-family="Orbitron, Outfit, DejaVu Sans, Arial, sans-serif"
      font-weight="900"
      font-size="8.2"
    >2</text>
  </g>
</svg>
`.trim();
}

export function buildPad2PSFullLogoSvg(
  accentHex = '#FF1E8E',
  mode: 'dark' | 'light' = 'dark',
  size = 1024
): string {
  const textColor = mode === 'light' ? '#0F172A' : '#FFFFFF';
  const subColor = mode === 'light' ? '#475569' : '#A1A1AA';
  const height = Math.round((size * 340) / 1024);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${height}" viewBox="0 0 1024 340" fill="none">
  <defs>
    <filter id="p2pFullGlowSoft" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="14" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="p2pFullGlowStrong" x="-60%" y="-60%" width="220%" height="220%" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="22" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <linearGradient id="p2pFullSquircle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0E0E15" />
      <stop offset="100%" stop-color="#09090D" />
    </linearGradient>
  </defs>

  <!-- Ícone Squircle à esquerda -->
  <g transform="translate(34, 34) scale(0.265625)">
    <rect x="64" y="64" width="896" height="896" rx="220" fill="url(#p2pFullSquircle)" stroke="${accentHex}" stroke-width="18" filter="url(#p2pFullGlowStrong)" />
    <rect x="96" y="96" width="832" height="832" rx="190" fill="none" stroke="${accentHex}" stroke-width="5" stroke-opacity="0.65" />
    <g transform="translate(82, 102) scale(26.875)" filter="url(#p2pFullGlowSoft)">
      <path d="M8.8 10.2C6.4 10.2 4.8 12.1 4.4 14.8L3.4 20.6C3.1 22.6 4.4 24.2 6.1 24.2C7.6 24.2 8.7 22.8 9.6 20.8C10.2 19.4 10.9 19 11.9 19.6C12.8 20.2 14.1 20.5 16 20.5C17.9 20.5 19.2 20.2 20.1 19.6C21.1 19 21.8 19.4 22.4 20.8C23.3 22.8 24.4 24.2 25.9 24.2C27.6 24.2 28.9 22.6 28.6 20.6L27.6 14.8C27.2 12.1 25.6 10.2 23.2 10.2C21.6 10.2 20.6 11 19.5 11.2H12.5C11.4 11 10.4 10.2 8.8 10.2Z" fill="#121218" stroke="${accentHex}" stroke-width="1.3" stroke-linejoin="round" />
      <path d="M8.1 15.1H10.9M9.5 13.7V16.5" stroke="#FFFFFF" stroke-width="1.35" stroke-linecap="round" />
      <circle cx="22.5" cy="13.2" r="0.95" fill="#22C55E" />
      <circle cx="24.2" cy="14.9" r="0.95" fill="#FB7185" />
      <circle cx="22.5" cy="16.6" r="0.95" fill="#3B82F6" />
      <circle cx="20.8" cy="14.9" r="0.95" fill="#F97316" />
      <text x="16" y="17.8" text-anchor="middle" fill="#FFFFFF" stroke="${accentHex}" stroke-width="0.25" font-family="Orbitron, Outfit, DejaVu Sans, Arial, sans-serif" font-weight="900" font-size="8.2">2</text>
    </g>
  </g>

  <!-- Assinatura Pad2PS -->
  <text
    x="356"
    y="188"
    font-family="Orbitron, Outfit, DejaVu Sans, Arial, sans-serif"
    font-weight="800"
    font-size="146"
    letter-spacing="-2"
    fill="${textColor}"
  >Pad<tspan fill="${accentHex}" filter="url(#p2pFullGlowSoft)">2</tspan>PS</text>

  <text
    x="362"
    y="258"
    font-family="Outfit, Plus Jakarta Sans, DejaVu Sans, Arial, sans-serif"
    font-weight="600"
    font-size="28"
    letter-spacing="2"
    fill="${subColor}"
  >TRADUTOR VISUAL &amp; DIAGNÓSTICO DE CONTROLES</text>
</svg>
`.trim();
}

async function renderSvgToPngDownload(
  svgMarkup: string,
  filename: string,
  width: number,
  height: number
): Promise<void> {
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const pngBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png')
    );
    if (!pngBlob) return;

    const dlUrl = URL.createObjectURL(pngBlob);
    const link = document.createElement('a');
    link.href = dlUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(dlUrl);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportLogoToPng(): Promise<void> {
  if (typeof document === 'undefined') return;
  const { hex } = getActiveNeonTheme();
  const svg = buildPad2PSFullLogoSvg(hex, 'dark', 1024);
  await renderSvgToPngDownload(svg, 'pad2ps-logo-1024.png', 1024, 340);
}

export async function exportLogoIconToPng(): Promise<void> {
  if (typeof document === 'undefined') return;
  const { hex } = getActiveNeonTheme();
  const svg = buildPad2PSIconSvg(hex, 1024);
  await renderSvgToPngDownload(svg, 'pad2ps-icone-1024.png', 1024, 1024);
}
