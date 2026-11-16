import {Download, Trash2} from 'lucide-react';
import type {ComboEntry} from '../hooks/useGamepad';
import {Ps2Symbol} from './Ps2Symbol';

interface ComboHistoryBarProps {
  history: ComboEntry[];
  controllerName: string | null;
  deadzone: number;
  onClear: () => void;
}

export function ComboHistoryBar({
  history,
  controllerName,
  deadzone,
  onClear,
}: ComboHistoryBarProps) {
  const handleDownloadTxt = () => {
    if (history.length === 0) {
      return;
    }

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateSlug = `${yyyy}-${mm}-${dd}`;
    const formattedDateTime = now.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });

    const inlineSequence = history.map((entry) => entry.button.ps2Short).join(' → ');
    const numberedSteps = history
      .map(
        (entry, index) =>
          `${index + 1}. ${entry.button.ps2Name} [${entry.button.xinputLabel}]`
      )
      .join('\n');

    const lines = [
      '==================================================',
      'PS2 Pad Guide - Sequência de Comandos',
      '==================================================',
      `Controle: ${controllerName || 'Modo Simulação (Mouse / Teclado)'}`,
      `Zona morta dos analógicos: ${deadzone.toFixed(2)}`,
      `Data/Hora da exportação: ${formattedDateTime}`,
      `Total de comandos: ${history.length}`,
      '',
      `Sequência: ${inlineSequence}`,
      '',
      'Detalhamento passo a passo:',
      numberedSteps,
      '',
    ];

    const blob = new Blob([lines.join('\n')], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sequencia-ps2-${dateSlug}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      aria-label="Histórico de Sequência"
      className="bg-[#121216] border border-pink-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 sm:gap-4"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="shrink-0">
          <h2 className="text-xs font-semibold text-[#FAFAFA] whitespace-nowrap">
            Sequência de Comandos
          </h2>
          <p className="text-[11px] text-[#A1A1AA] whitespace-nowrap">
            Últimos 10 botões
          </p>
        </div>

        <div className="h-7 w-px bg-pink-500/15 shrink-0 hidden sm:block" aria-hidden="true" />

        {history.length === 0 ? (
          <p className="text-xs text-zinc-500 truncate">
            Os últimos botões pressionados aparecerão aqui em ordem cronológica...
          </p>
        ) : (
          <ol className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {history.map((entry, idx) => {
              const isLatest = idx === history.length - 1;
              return (
                <li
                  key={entry.uid}
                  title={`${entry.button.ps2Name} (${entry.button.xinputShort})`}
                  className={`shrink-0 h-9 min-w-[36px] px-2 rounded-lg border flex items-center justify-center transition-all ${
                    isLatest
                      ? 'bg-[#FF2E93]/20 border-[#FF2E93] text-white neon-glow-pink'
                      : 'bg-[#09090B]/80 border-pink-500/20 text-pink-300'
                  }`}
                >
                  <Ps2Symbol id={entry.button.id} className="w-4 h-4" />
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleDownloadTxt}
          disabled={history.length === 0}
          title="Exportar sequência de comandos para arquivo .txt"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#09090B]/80 border border-pink-500/35 text-pink-200 hover:bg-[#FF2E93]/15 hover:border-[#FF2E93] hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 text-[#FF2E93]" />
          <span>Baixar .txt</span>
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={history.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-pink-500/25 text-[#FAFAFA] hover:bg-pink-500/15 hover:border-pink-500/50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer whitespace-nowrap"
        >
          <Trash2 className="w-3.5 h-3.5 text-[#FF2E93]" />
          <span>Limpar</span>
        </button>
      </div>
    </section>
  );
}
