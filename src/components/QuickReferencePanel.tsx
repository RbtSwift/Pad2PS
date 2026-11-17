import {ChevronDown, ChevronUp} from 'lucide-react';
import {useState} from 'react';
import type {Translations} from '../data/i18n';
import {
  CONSOLE_META,
  type ConsoleLayout,
  getQuickReferenceIndices,
  PS2_BUTTON_MAP,
} from '../data/ps2Mapping';
import {Ps2Symbol} from './Ps2Symbol';

interface QuickReferencePanelProps {
  layout: ConsoleLayout;
  pressedButtons: boolean[];
  remapMap?: Record<number, number>;
  t: Translations;
  onTestButtonDown: (index: number) => void;
  onTestButtonUp: (index: number) => void;
}

export function QuickReferencePanel({
  layout,
  pressedButtons,
  remapMap = {},
  t,
  onTestButtonDown,
  onTestButtonUp,
}: QuickReferencePanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const indices = getQuickReferenceIndices(layout);

  const getPhysicalShortForPsIndex = (psIndex: number): {short: string; isRemapped: boolean} => {
    for (const [physStr, targetIdx] of Object.entries(remapMap)) {
      if (targetIdx === psIndex) {
        const physIdx = Number(physStr);
        if (PS2_BUTTON_MAP[physIdx]) {
          return {
            short: PS2_BUTTON_MAP[physIdx].xinputShort,
            isRemapped: physIdx !== psIndex,
          };
        }
      }
    }
    return {
      short: PS2_BUTTON_MAP[psIndex].xinputShort,
      isRemapped: false,
    };
  };

  return (
    <section
      aria-label={t.quickRefTitle}
      className={`w-full accent-panel rounded-xl overflow-hidden flex flex-col min-h-0 ${
        isOpen ? 'flex-1 min-h-[76px]' : 'shrink-0'
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 text-left hover:bg-white/[0.03] transition-colors cursor-pointer shrink-0"
      >
        <div className="min-w-0">
          <h2 className="text-xs font-semibold text-[#FAFAFA] truncate">{t.quickRefTitle}</h2>
          <p className="text-[11px] text-[#A1A1AA] truncate">
            {t.quickRefSubtitle} → {CONSOLE_META[layout].shortLabel}
          </p>
        </div>
        <span className="text-[#A1A1AA] shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {isOpen && (
        <div className="px-3 sm:px-3.5 pb-3 pt-1 grid grid-cols-2 gap-1.5 sm:gap-2 overflow-y-auto flex-1 min-h-0 content-start">
          {indices.map((index) => {
            const item = PS2_BUTTON_MAP[index];
            const active = Boolean(pressedButtons[index]);
            const {short: physicalShort, isRemapped} = getPhysicalShortForPsIndex(index);
            return (
              <button
                key={item.id}
                type="button"
                onPointerDown={() => onTestButtonDown(index)}
                onPointerUp={() => onTestButtonUp(index)}
                onPointerLeave={() => {
                  if (active) {
                    onTestButtonUp(index);
                  }
                }}
                onPointerCancel={() => onTestButtonUp(index)}
                className={`flex items-center justify-between gap-2 px-2.5 py-1.5 sm:py-2 rounded-lg border text-left transition-all duration-75 cursor-pointer select-none ${
                  active ? 'text-white neon-glow-accent scale-[0.98]' : 'bg-[#09090B]/70 text-[#FAFAFA]'
                }`}
                style={
                  active
                    ? {
                        backgroundColor: 'rgba(var(--accent-rgb), 0.24)',
                        borderColor: 'var(--accent-color)',
                      }
                    : {borderColor: 'rgba(var(--accent-rgb), 0.14)'}
                }
              >
                <span
                  className="font-mono text-xs font-semibold whitespace-nowrap"
                  style={{color: isRemapped && !active ? 'var(--accent-color)' : active ? '#FFFFFF' : '#A1A1AA'}}
                >
                  {physicalShort}
                </span>
                <span
                  className="text-[10px]"
                  style={{color: 'rgba(var(--accent-rgb), 0.65)'}}
                  aria-hidden="true"
                >
                  =
                </span>
                <span
                  className="flex items-center justify-center min-w-[26px] text-xs font-bold"
                  style={{color: active ? '#FFFFFF' : 'var(--accent-color)'}}
                >
                  <Ps2Symbol id={item.id} className="w-4 h-4" layout={layout} />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
