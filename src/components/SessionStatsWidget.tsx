import {Gauge, MousePointerClick, RotateCcw, Zap} from 'lucide-react';
import type {Translations} from '../data/i18n';
import type {SessionStats} from '../hooks/useGamepad';

interface SessionStatsWidgetProps {
  stats: SessionStats;
  t: Translations;
  onReset: () => void;
}

export function SessionStatsWidget({stats, t, onReset}: SessionStatsWidgetProps) {
  const peakPct =
    stats.peakApm > 0 ? Math.min(100, Math.round((stats.apm / stats.peakApm) * 100)) : 0;

  return (
    <section
      aria-label="Estatísticas da Sessão"
      className="w-full shrink-0 accent-panel rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2.5 flex flex-col gap-1 sm:gap-2"
    >
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
        {/* Total Clicks */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="inline-flex items-center gap-1 text-[#A1A1AA] truncate">
            <MousePointerClick className="w-3 h-3 shrink-0" style={{color: 'var(--accent-color)'}} />
            <span>{t.statsClicks}</span>
          </span>
          <span className="font-mono text-xs sm:text-sm font-bold text-[#FAFAFA] tabular-nums">
            {stats.totalClicks}
          </span>
        </div>

        {/* Speed (CPS & APM) */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="inline-flex items-center gap-1 text-[#A1A1AA] truncate">
            <Zap className="w-3 h-3 shrink-0" style={{color: 'var(--accent-color)'}} />
            <span>{t.statsSpeed}</span>
          </span>
          <div className="flex items-baseline gap-1 font-mono tabular-nums">
            <span className="text-xs sm:text-sm font-bold" style={{color: 'var(--accent-color)'}}>
              {stats.apm}
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#A1A1AA]">APM</span>
            <span className="text-[10px] text-zinc-500 hidden sm:inline">
              ({stats.clicksPerSecond.toFixed(1)}/s)
            </span>
          </div>
        </div>

        {/* Polling Rate */}
        <div className="flex items-start justify-between gap-1 min-w-0">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="inline-flex items-center gap-1 text-[#A1A1AA] truncate">
              <Gauge className="w-3 h-3 shrink-0" style={{color: 'var(--accent-color)'}} />
              <span>{t.statsPolling}</span>
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-[#FAFAFA] tabular-nums">
              {stats.pollingRateHz > 0 ? `${stats.pollingRateHz}Hz` : '—'}
            </span>
          </div>

          <button
            type="button"
            onClick={onReset}
            title={t.statsReset}
            aria-label={t.statsReset}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-md text-[#A1A1AA] hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Peak Speed Progress Bar */}
      <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono tabular-nums">
        <span className="text-[#A1A1AA] whitespace-nowrap">
          {t.statsPeak}: <strong className="text-[#FAFAFA]">{stats.peakApm}</strong> APM
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-zinc-900 overflow-hidden">
          <div
            className="h-full transition-[width] duration-150"
            style={{
              width: `${peakPct}%`,
              backgroundColor: 'var(--accent-color)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
