import {X} from 'lucide-react';
import {useEffect} from 'react';
import {createPortal} from 'react-dom';
import type {Translations} from '../data/i18n';
import type {ConsoleLayout} from '../data/ps2Mapping';
import type {StickState} from '../hooks/useGamepad';
import {DualShock2SVG} from './DualShock2SVG';

export type ChromaMode = 'dark' | 'green' | 'magenta';

export const CHROMA_BG_MAP: Record<ChromaMode, string> = {
  dark: '#09090B',
  green: '#00FF00',
  magenta: '#FF00FF',
};

interface PiPControllerPortalProps {
  pipWindow: Window | null;
  chromaMode: ChromaMode;
  onChangeChroma: (mode: ChromaMode) => void;
  onClose: () => void;
  layout: ConsoleLayout;
  pressedButtons: boolean[];
  l2Value: number;
  r2Value: number;
  leftStick: StickState;
  rightStick: StickState;
  onButtonDown: (index: number) => void;
  onButtonUp: (index: number) => void;
  t: Translations;
}

export function copyStylesAndVarsToWindow(targetWin: Window, accentHex: string, accentRgb: string) {
  const targetDoc = targetWin.document;
  targetDoc.head.innerHTML = '';

  const titleEl = targetDoc.createElement('title');
  titleEl.textContent = 'Pad2PS — PiP';
  targetDoc.head.appendChild(titleEl);

  // Copy all stylesheets and inline styles from main window
  const styleNodes = document.querySelectorAll('style, link[rel="stylesheet"]');
  styleNodes.forEach((node) => {
    if (node instanceof HTMLLinkElement) {
      const link = targetDoc.createElement('link');
      link.rel = 'stylesheet';
      link.href = node.href;
      targetDoc.head.appendChild(link);
    } else {
      targetDoc.head.appendChild(node.cloneNode(true));
    }
  });

  // Sync CSS variables
  const root = targetDoc.documentElement;
  root.style.setProperty('--accent-color', accentHex);
  root.style.setProperty('--accent-rgb', accentRgb);
  root.style.setProperty(
    '--accent-glow',
    `0 0 18px rgba(${accentRgb}, 0.42), 0 0 4px rgba(${accentRgb}, 0.55)`
  );
  targetDoc.body.style.margin = '0';
  targetDoc.body.style.overflow = 'hidden';
}

export function PiPControllerPortal({
  pipWindow,
  chromaMode,
  onChangeChroma,
  onClose,
  layout,
  pressedButtons,
  l2Value,
  r2Value,
  leftStick,
  rightStick,
  onButtonDown,
  onButtonUp,
  t,
}: PiPControllerPortalProps) {
  useEffect(() => {
    if (!pipWindow) {
      return;
    }
    const bg = CHROMA_BG_MAP[chromaMode];
    pipWindow.document.body.style.backgroundColor = bg;
  }, [pipWindow, chromaMode]);

  if (!pipWindow || pipWindow.closed) {
    return null;
  }

  const bg = CHROMA_BG_MAP[chromaMode];

  return createPortal(
    <div
      className="w-screen h-screen flex flex-col overflow-hidden select-none"
      style={{backgroundColor: bg}}
    >
      {/* Minimal Discrete Floating Bar */}
      <div className="px-2.5 py-1.5 flex items-center justify-between gap-2 bg-black/75 backdrop-blur-xs border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#FAFAFA]">
          <span>Pad</span>
          <span style={{color: 'var(--accent-color)'}}>2</span>
          <span>PS</span>
        </div>

        {/* OBS Chroma Key Selector */}
        <div className="flex items-center gap-1" role="group" aria-label={t.chromaLabel}>
          <button
            type="button"
            onClick={() => onChangeChroma('dark')}
            title={t.chromaDark}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
              chromaMode === 'dark' ? 'border-white text-white bg-zinc-800' : 'border-zinc-700 text-zinc-300 bg-zinc-900/80'
            }`}
          >
            {t.chromaDark}
          </button>
          <button
            type="button"
            onClick={() => onChangeChroma('green')}
            title={t.chromaGreen}
            className={`w-5 h-5 rounded border cursor-pointer ${
              chromaMode === 'green' ? 'ring-2 ring-white' : 'border-white/30'
            }`}
            style={{backgroundColor: '#00FF00'}}
            aria-label={t.chromaGreen}
          />
          <button
            type="button"
            onClick={() => onChangeChroma('magenta')}
            title={t.chromaMagenta}
            className={`w-5 h-5 rounded border cursor-pointer ${
              chromaMode === 'magenta' ? 'ring-2 ring-white' : 'border-white/30'
            }`}
            style={{backgroundColor: '#FF00FF'}}
            aria-label={t.chromaMagenta}
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          title={t.close}
          aria-label={t.close}
          className="w-5 h-5 rounded flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live Controller SVG */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-2">
        <DualShock2SVG
          layout={layout}
          pressedButtons={pressedButtons}
          l2Value={l2Value}
          r2Value={r2Value}
          leftStick={leftStick}
          rightStick={rightStick}
          isCompact={true}
          onButtonDown={onButtonDown}
          onButtonUp={onButtonUp}
        />
      </div>
    </div>,
    pipWindow.document.body
  );
}
