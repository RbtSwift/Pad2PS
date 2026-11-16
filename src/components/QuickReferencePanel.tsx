import {ChevronDown, ChevronUp} from 'lucide-react';
import {useState} from 'react';
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
  onTestButtonDown: (index: number) => void;
  onTestButtonUp: (index: number) => void;
}

export function QuickReferencePanel({
  layout,
  pressedButtons,
  onTestButtonDown,
  onTestButtonUp,
}: QuickReferencePanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const indices = getQuickReferenceIndices(layout);

  return (
    <section
      aria-label="Tabela Rápida de Referência"
      className="accent-panel rounded-xl overflow-hidden flex flex-col min-h-0"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div>
          <h2 className="text-xs font-semibold text-[#FAFAFA]">
            Tabela Rápida de Referência
          </h2>
          <p className="text-[11px] text-[#A1A1AA]">
            X-Input (GameSir / Xbox) → {CONSOLE_META[layout].shortLabel}
          </p>
        </div>
        <span className="text-[#A1A1AA] shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 pt-1 grid grid-cols-2 gap-1.5 overflow-y-auto">
          {indices.map((index) => {
            const item = PS2_BUTTON_MAP[index];
            const active = Boolean(pressedButtons[index]);
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
                className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border text-left transition-all duration-75 cursor-pointer select-none ${
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
                <span className="font-mono text-xs font-semibold text-[#A1A1AA] whitespace-nowrap">
                  {item.xinputShort}
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
