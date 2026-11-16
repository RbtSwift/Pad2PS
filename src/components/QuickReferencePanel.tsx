import {ChevronDown, ChevronUp} from 'lucide-react';
import {useState} from 'react';
import {PS2_BUTTON_MAP, QUICK_REFERENCE_INDICES} from '../data/ps2Mapping';
import {Ps2Symbol} from './Ps2Symbol';

interface QuickReferencePanelProps {
  pressedButtons: boolean[];
  onTestButtonDown: (index: number) => void;
  onTestButtonUp: (index: number) => void;
}

export function QuickReferencePanel({
  pressedButtons,
  onTestButtonDown,
  onTestButtonUp,
}: QuickReferencePanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <section
      aria-label="Tabela Rápida de Referência"
      className="bg-[#121216] border border-pink-500/20 rounded-xl overflow-hidden flex flex-col min-h-0"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-pink-500/5 transition-colors cursor-pointer"
      >
        <div>
          <h2 className="text-xs font-semibold text-[#FAFAFA]">
            Tabela Rápida de Referência
          </h2>
          <p className="text-[11px] text-[#A1A1AA]">
            Equivalência X-Input (GameSir / Xbox) → PS2
          </p>
        </div>
        <span className="text-[#A1A1AA] shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 pt-1 grid grid-cols-2 gap-1.5 overflow-y-auto">
          {QUICK_REFERENCE_INDICES.map((index) => {
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
                  active
                    ? 'bg-[#FF2E93]/20 border-[#FF2E93] text-white neon-glow-pink scale-[0.98]'
                    : 'bg-[#09090B]/70 border-pink-500/10 text-[#FAFAFA] hover:border-pink-500/35'
                }`}
              >
                <span className="font-mono text-xs font-semibold text-[#A1A1AA] whitespace-nowrap">
                  {item.xinputShort}
                </span>
                <span className="text-[10px] text-pink-500/60" aria-hidden="true">
                  =
                </span>
                <span
                  className={`flex items-center justify-center min-w-[26px] text-xs font-bold ${
                    active ? 'text-white' : 'text-[#FF2E93]'
                  }`}
                >
                  <Ps2Symbol id={item.id} className="w-4 h-4" />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
