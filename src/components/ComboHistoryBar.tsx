import {Download, Trash2} from 'lucide-react';
import type {AppLanguage, Translations} from '../data/i18n';
import {
  CONSOLE_META,
  type ConsoleLayout,
  getConsoleButtonDisplayName,
  getConsoleButtonShort,
  getXInputDisplayLabel,
} from '../data/ps2Mapping';
import type {ComboEntry} from '../hooks/useGamepad';
import {Ps2Symbol} from './Ps2Symbol';

interface ComboHistoryBarProps {
  history: ComboEntry[];
  controllerName: string | null;
  deadzone: number;
  layout: ConsoleLayout;
  lang: AppLanguage;
  t: Translations;
  onClear: () => void;
}

export function ComboHistoryBar({
  history,
  controllerName,
  deadzone,
  layout,
  lang,
  t,
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
    const formattedDateTime = now.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });

    const inlineSequence = history
      .map((entry) => getConsoleButtonShort(entry.button, layout))
      .join(' → ');
    const numberedSteps = history
      .map(
        (entry, index) =>
          `${index + 1}. ${getConsoleButtonDisplayName(entry.button, layout, lang)} [${getXInputDisplayLabel(entry.button, lang)}]`
      )
      .join('\n');

    const lines =
      lang === 'en'
        ? [
            '==================================================',
            'Pad2PS - Command Sequence History',
            '==================================================',
            `Console layout: ${CONSOLE_META[layout].hardwareName}`,
            `Controller: ${controllerName || 'Simulation Mode (Mouse / Keyboard)'}`,
            `Analog deadzone: ${deadzone.toFixed(2)}`,
            `Exported at: ${formattedDateTime}`,
            `Total inputs: ${history.length}`,
            '',
            `Sequence: ${inlineSequence}`,
            '',
            'Step-by-step breakdown:',
            numberedSteps,
            '',
          ]
        : [
            '==================================================',
            'Pad2PS - Sequência de Comandos',
            '==================================================',
            `Layout do console: ${CONSOLE_META[layout].hardwareName}`,
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
    link.download = `pad2ps-sequence-${dateSlug}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      aria-label={t.comboHistoryTitle}
      className="accent-panel rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 sm:gap-4"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="shrink-0">
          <h2 className="text-xs font-semibold text-[#FAFAFA] whitespace-nowrap">
            {t.comboHistoryTitle}
          </h2>
          <p className="text-[11px] text-[#A1A1AA] whitespace-nowrap">
            {t.last10Buttons}
          </p>
        </div>

        <div
          className="h-7 w-px shrink-0 hidden sm:block"
          style={{backgroundColor: 'rgba(var(--accent-rgb), 0.18)'}}
          aria-hidden="true"
        />

        {history.length === 0 ? (
          <p className="text-xs text-zinc-500 truncate">{t.comboHistoryEmpty}</p>
        ) : (
          <ol className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            {history.map((entry, idx) => {
              const isLatest = idx === history.length - 1;
              return (
                <li
                  key={entry.uid}
                  title={`${getConsoleButtonDisplayName(entry.button, layout, lang)} (${entry.button.xinputShort})`}
                  className={`shrink-0 h-9 min-w-[36px] px-2 rounded-lg border flex items-center justify-center transition-all ${
                    isLatest ? 'text-white neon-glow-accent' : 'bg-[#09090B]/80'
                  }`}
                  style={
                    isLatest
                      ? {
                          backgroundColor: 'rgba(var(--accent-rgb), 0.24)',
                          borderColor: 'var(--accent-color)',
                        }
                      : {
                          borderColor: 'rgba(var(--accent-rgb), 0.22)',
                          color: 'var(--accent-color)',
                        }
                  }
                >
                  <Ps2Symbol id={entry.button.id} className="w-4 h-4" layout={layout} />
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
          title={t.downloadTxt}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#09090B]/80 border text-[#FAFAFA] hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer whitespace-nowrap"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.38)'}}
        >
          <Download className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
          <span>{t.downloadTxt}</span>
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={history.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border text-[#FAFAFA] hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer whitespace-nowrap"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.25)'}}
        >
          <Trash2 className="w-3.5 h-3.5" style={{color: 'var(--accent-color)'}} />
          <span>{t.clear}</span>
        </button>
      </div>
    </section>
  );
}
