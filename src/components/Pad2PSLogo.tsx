import {Download, Gamepad2, ImageDown} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import type {Translations} from '../data/i18n';
import {exportLogoIconToPng, exportLogoToPng} from '../utils/exportLogoPng';

interface Pad2PSIconProps {
  className?: string;
  accentColor?: string;
}

export function Pad2PSIcon({
  className = 'w-9 h-9',
  accentColor = 'var(--accent-color)',
}: Pad2PSIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Square 1:1 Dark Frame */}
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="7"
        fill="#09090B"
        stroke={accentColor}
        strokeOpacity="0.45"
        strokeWidth="1.2"
      />

      {/* Minimalist DualShock Silhouette */}
      <path
        d="M8.8 10.2C6.4 10.2 4.8 12.1 4.4 14.8L3.4 20.6C3.1 22.6 4.4 24.2 6.1 24.2C7.6 24.2 8.7 22.8 9.6 20.8C10.2 19.4 10.9 19 11.9 19.6C12.8 20.2 14.1 20.5 16 20.5C17.9 20.5 19.2 20.2 20.1 19.6C21.1 19 21.8 19.4 22.4 20.8C23.3 22.8 24.4 24.2 25.9 24.2C27.6 24.2 28.9 22.6 28.6 20.6L27.6 14.8C27.2 12.1 25.6 10.2 23.2 10.2C21.6 10.2 20.6 11 19.5 11.2H12.5C11.4 11 10.4 10.2 8.8 10.2Z"
        fill="#121216"
        stroke={accentColor}
        strokeWidth="1.45"
        strokeLinejoin="round"
      />

      {/* Left Illuminated D-Pad Cross */}
      <path
        d="M8.1 15.1H10.9M9.5 13.7V16.5"
        stroke="#FAFAFA"
        strokeWidth="1.35"
        strokeLinecap="round"
      />

      {/* Right Illuminated PS Action Dots */}
      <circle cx="22.5" cy="13.2" r="0.95" fill="#34D399" />
      <circle cx="24.2" cy="14.9" r="0.95" fill="#FB7185" />
      <circle cx="22.5" cy="16.6" r="0.95" fill="#60A5FA" />
      <circle cx="20.8" cy="14.9" r="0.95" fill="#F472B6" />

      {/* Stylized Center "2" */}
      <text
        x="16"
        y="17.8"
        textAnchor="middle"
        fill="#FAFAFA"
        stroke={accentColor}
        strokeWidth="0.35"
        style={{
          fontFamily: '"Orbitron", "Outfit", sans-serif',
          fontWeight: 900,
          fontSize: '8.5px',
        }}
      >
        2
      </text>
    </svg>
  );
}

interface Pad2PSLogoProps {
  compact?: boolean;
  t?: Translations;
}

export function Pad2PSLogo({compact = false, t}: Pad2PSLogoProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }
    const handlePointerDown = (e: PointerEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleDownload = async (mode: 'full' | 'icon') => {
    if (isDownloading) {
      return;
    }
    setIsDownloading(true);
    setIsMenuOpen(false);
    try {
      if (mode === 'full') {
        await exportLogoToPng();
      } else {
        await exportLogoIconToPng();
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div ref={menuContainerRef} className="group relative inline-flex items-center gap-2.5 min-w-0 select-none">
      <div
        className="shrink-0 transition-all duration-200 group-hover:scale-105"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(var(--accent-rgb), 0.35))',
        }}
      >
        <Pad2PSIcon className={compact ? 'w-8 h-8' : 'w-9 h-9 sm:w-10 sm:h-10'} />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <h1
            className={`flex items-baseline tracking-tight leading-none transition-all duration-200 group-hover:drop-shadow-[0_0_14px_rgba(var(--accent-rgb),0.75)] ${
              compact ? 'text-lg' : 'text-xl sm:text-[22px]'
            }`}
            style={{
              fontFamily: '"Orbitron", "Outfit", ui-sans-serif, sans-serif',
              fontWeight: 800,
            }}
          >
            <span className="text-[#FAFAFA]">Pad</span>
            <span
              className="mx-[1px] transition-all duration-200 group-hover:brightness-125"
              style={{
                color: 'var(--accent-color)',
                textShadow: '0 0 12px rgba(var(--accent-rgb), 0.85)',
              }}
            >
              2
            </span>
            <span className="text-[#FAFAFA]">PS</span>
          </h1>

          {/* Discrete PNG Logo Download Menu Trigger */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            disabled={isDownloading}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            title="Baixar logo Pad2PS em PNG"
            aria-label="Baixar logo Pad2PS em PNG"
            className={`w-6 h-6 rounded-md flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0 disabled:opacity-30 ${
              isMenuOpen
                ? 'opacity-100 bg-white/10'
                : 'opacity-45 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100'
            }`}
          >
            <Download className="w-3 h-3" style={{color: 'var(--accent-color)'}} />
          </button>
        </div>

        {!compact && (
          <p className="text-[11px] sm:text-xs text-[#A1A1AA] truncate mt-0.5">
            {t?.appSubtitle ?? 'Tradutor Visual X-Input para PlayStation'}
          </p>
        )}
      </div>

      {/* Discrete 2-Option PNG Download Popover */}
      {isMenuOpen && (
        <div
          role="menu"
          aria-label="PNG Logo"
          className="absolute left-0 top-full mt-2 z-50 w-56 rounded-xl bg-[#121216] border p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.85)] neon-glow-accent"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.35)'}}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleDownload('full')}
            className="w-full px-2.5 py-2 rounded-lg flex items-center gap-2 text-left text-xs text-[#FAFAFA] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ImageDown className="w-3.5 h-3.5 shrink-0" style={{color: 'var(--accent-color)'}} />
            <div className="min-w-0">
              <p className="font-medium leading-tight">{t?.logoMenuFull ?? 'Logo completa (.png)'}</p>
              <p className="text-[10px] text-[#A1A1AA]">{t?.logoMenuFullSub ?? 'Ícone + texto Pad2PS'}</p>
            </div>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => handleDownload('icon')}
            className="w-full px-2.5 py-2 rounded-lg flex items-center gap-2 text-left text-xs text-[#FAFAFA] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Gamepad2 className="w-3.5 h-3.5 shrink-0" style={{color: 'var(--accent-color)'}} />
            <div className="min-w-0">
              <p className="font-medium leading-tight">{t?.logoMenuIcon ?? 'Apenas logo controle (.png)'}</p>
              <p className="text-[10px] text-[#A1A1AA]">{t?.logoMenuIconSub ?? 'Ícone quadrado 1:1 (512px)'}</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export function buildPad2PSFaviconDataUri(accentHex = '#FF2E93'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect x="1" y="1" width="30" height="30" rx="7" fill="#09090B" stroke="${accentHex}" stroke-width="1.5"/>
  <path d="M8.8 10.2C6.4 10.2 4.8 12.1 4.4 14.8L3.4 20.6C3.1 22.6 4.4 24.2 6.1 24.2C7.6 24.2 8.7 22.8 9.6 20.8C10.2 19.4 10.9 19 11.9 19.6C12.8 20.2 14.1 20.5 16 20.5C17.9 20.5 19.2 20.2 20.1 19.6C21.1 19 21.8 19.4 22.4 20.8C23.3 22.8 24.4 24.2 25.9 24.2C27.6 24.2 28.9 22.6 28.6 20.6L27.6 14.8C27.2 12.1 25.6 10.2 23.2 10.2C21.6 10.2 20.6 11 19.5 11.2H12.5C11.4 11 10.4 10.2 8.8 10.2Z" fill="#121216" stroke="${accentHex}" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M8.1 15.1H10.9M9.5 13.7V16.5" stroke="#FAFAFA" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="22.5" cy="13.2" r="1.05" fill="#34D399"/>
  <circle cx="24.2" cy="14.9" r="1.05" fill="#FB7185"/>
  <circle cx="22.5" cy="16.6" r="1.05" fill="#60A5FA"/>
  <circle cx="20.8" cy="14.9" r="1.05" fill="#F472B6"/>
  <text x="16" y="18" text-anchor="middle" fill="#FAFAFA" font-family="Arial Black, sans-serif" font-weight="900" font-size="8.5">2</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
