import {WifiOff} from 'lucide-react';
import type {Translations} from '../data/i18n';
import {useOnlineStatus} from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  t: Translations;
}

export function OfflineIndicator({t}: OfflineIndicatorProps) {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-[#121216]/95 border px-3 py-1.5 text-xs font-medium text-[#FAFAFA] shadow-[0_10px_28px_rgba(0,0,0,0.75)] backdrop-blur-md"
      style={{borderColor: 'rgba(var(--accent-rgb), 0.45)'}}
    >
      <WifiOff
        className="w-3.5 h-3.5 shrink-0"
        style={{color: 'var(--accent-color)'}}
      />
      <span>{t.offlineBadge}</span>
    </div>
  );
}
