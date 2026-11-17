import {ChevronRight, ImageDown, Layers, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import type {AppLanguage, Translations} from '../data/i18n';
import type {ConsoleLayout, Ps2ButtonId} from '../data/ps2Mapping';
import {exportSingleSequencePng, slugifyPngName} from '../utils/exportComboPng';
import {Ps2Symbol} from './Ps2Symbol';

interface PngExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle: string;
  subtitle?: string;
  sequence: Ps2ButtonId[];
  layout: ConsoleLayout;
  lang: AppLanguage;
  t: Translations;
  defaultFileName?: string;
}

export function PngExportModal({
  isOpen,
  onClose,
  defaultTitle,
  subtitle,
  sequence,
  layout,
  lang,
  t,
  defaultFileName,
}: PngExportModalProps) {
  const [title, setTitle] = useState<string>(defaultTitle);
  const [transparentBg, setTransparentBg] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle);
    }
  }, [isOpen, defaultTitle]);

  useEffect(() => {
    if (!isOpen) {
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

  if (!isOpen || sequence.length === 0) {
    return null;
  }

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) {
      return;
    }
    setIsGenerating(true);
    try {
      const cleanTitle = title.trim() || defaultTitle || 'Pad2PS Combo';
      const resolvedFileName =
        defaultFileName ||
        (cleanTitle === defaultTitle && defaultTitle === 'Combo Infinito'
          ? 'pad2ps-combo.png'
          : `pad2ps-combo-${slugifyPngName(cleanTitle)}.png`);

      await exportSingleSequencePng({
        title: cleanTitle,
        subtitle,
        sequence,
        layout,
        lang,
        transparentBackground: transparentBg,
        fileName: resolvedFileName,
      });
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="png-export-modal-title"
      onClick={onClose}
    >
      <form
        onSubmit={handleDownload}
        className="w-full max-w-lg rounded-2xl bg-[#121216] border flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden"
        style={{borderColor: 'rgba(var(--accent-rgb), 0.38)'}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-3.5 border-b flex items-center justify-between gap-3"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.16)'}}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'rgba(var(--accent-rgb), 0.16)',
                border: '1px solid rgba(var(--accent-rgb), 0.38)',
                color: 'var(--accent-color)',
              }}
            >
              <ImageDown className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3
                id="png-export-modal-title"
                className="font-display text-sm font-bold text-[#FAFAFA] truncate"
              >
                {t.pngModalTitle}
              </h3>
              <p className="text-[11px] text-[#A1A1AA] truncate">
                1200×400px · PNG
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="w-7 h-7 rounded-lg border text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            style={{borderColor: 'rgba(var(--accent-rgb), 0.24)'}}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Editable Title */}
          <div>
            <label
              htmlFor="png-export-title-input"
              className="block text-xs font-medium text-[#FAFAFA] mb-1.5"
            >
              {t.pngTitleLabel}
            </label>
            <input
              id="png-export-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.pngTitlePlaceholder}
              className="w-full h-9 px-3 rounded-lg bg-[#09090B] border text-xs text-[#FAFAFA] placeholder:text-zinc-500 outline-none focus:border-white"
              style={{borderColor: 'rgba(var(--accent-rgb), 0.32)'}}
            />
          </div>

          {/* Mini Preview Card */}
          <div
            className="rounded-xl p-3.5 border space-y-2.5 transition-colors"
            style={{
              borderColor: 'rgba(var(--accent-rgb), 0.28)',
              backgroundColor: transparentBg ? 'transparent' : '#09090B',
              backgroundImage: transparentBg
                ? 'linear-gradient(45deg, #16161b 25%, transparent 25%), linear-gradient(-45deg, #16161b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #16161b 75%), linear-gradient(-45deg, transparent 75%, #16161b 75%)'
                : undefined,
              backgroundSize: transparentBg ? '16px 16px' : undefined,
              backgroundPosition: transparentBg
                ? '0 0, 0 8px, 8px -8px, -8px 0px'
                : undefined,
            }}
          >
            <div className="text-xs font-bold text-[#FAFAFA] truncate">
              {title.trim() || defaultTitle || 'Pad2PS Combo'}
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {sequence.map((btnId, idx) => (
                <div key={`preview-${idx}`} className="flex items-center gap-1">
                  <span
                    className="h-7 min-w-[28px] px-1.5 rounded-md bg-[#15151C] border flex items-center justify-center text-[#FAFAFA]"
                    style={{borderColor: 'rgba(var(--accent-rgb), 0.5)'}}
                  >
                    <Ps2Symbol id={btnId} className="w-3.5 h-3.5" layout={layout} />
                  </span>
                  {idx < sequence.length - 1 && (
                    <ChevronRight
                      className="w-3 h-3 shrink-0"
                      style={{color: 'var(--accent-color)'}}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="text-right font-mono text-[10px] text-[#A1A1AA]">
              {t.pngFooter}
            </div>
          </div>

          {/* Transparent Background Toggle */}
          <label
            className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[#09090B]/90 border cursor-pointer hover:bg-white/[0.02] transition-colors"
            style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Layers
                className="w-4 h-4 shrink-0"
                style={{color: 'var(--accent-color)'}}
              />
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-[#FAFAFA]">
                  {t.pngTransparentLabel}
                </span>
                <span className="block text-[11px] text-[#A1A1AA]">
                  {t.pngTransparentHint}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={transparentBg}
              onChange={(e) => setTransparentBg(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-pink-500 shrink-0"
            />
          </label>
        </div>

        {/* Footer Actions */}
        <div
          className="px-5 py-3.5 border-t bg-[#0B0B0F] flex items-center justify-end gap-2"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.14)'}}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 text-xs text-[#A1A1AA] hover:text-[#FAFAFA] cursor-pointer"
          >
            {lang === 'en' ? 'Cancel' : 'Cancelar'}
          </button>
          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer neon-glow-accent disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(var(--accent-rgb), 0.28)',
              border: '1px solid var(--accent-color)',
            }}
          >
            <ImageDown className="w-3.5 h-3.5" />
            <span>
              {isGenerating ? t.combosGeneratingPng : t.combosDownloadPng}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
