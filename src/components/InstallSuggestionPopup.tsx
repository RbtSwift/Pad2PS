import {
  ChevronDown,
  ChevronUp,
  Download,
  Monitor,
  Package,
  Smartphone,
  Terminal,
  X,
} from 'lucide-react';
import {useMemo, useState} from 'react';
import type {Translations} from '../data/i18n';
import {INSTALLER_PACKAGES, type InstallerId} from '../data/installers';
import {detectVisitorOS} from '../hooks/useIsInstalledApp';

const DISMISS_STORAGE_KEY = 'pad2ps_dismiss_install_popup';

interface InstallSuggestionPopupProps {
  isApp: boolean;
  isCompact: boolean;
  isPipActive: boolean;
  t: Translations;
}

function readDismissed(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  try {
    return window.localStorage.getItem(DISMISS_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function InstallerIcon({
  id,
  className = 'w-3.5 h-3.5',
}: {
  id: InstallerId;
  className?: string;
}) {
  switch (id) {
    case 'windows':
      return <Monitor className={className} style={{color: 'var(--accent-color)'}} />;
    case 'linux-deb':
      return <Package className={className} style={{color: 'var(--accent-color)'}} />;
    case 'linux-appimage':
      return <Terminal className={className} style={{color: 'var(--accent-color)'}} />;
    case 'android':
      return <Smartphone className={className} style={{color: 'var(--accent-color)'}} />;
  }
}

export function getInstallerShortLabel(id: InstallerId, t: Translations): string {
  switch (id) {
    case 'windows':
      return t.dlWindowsShort;
    case 'linux-deb':
      return t.dlLinuxDebShort;
    case 'linux-appimage':
      return t.dlLinuxAppImageShort;
    case 'android':
      return t.dlAndroidShort;
  }
}

function getInstallerPrimaryLabel(id: InstallerId, t: Translations): string {
  switch (id) {
    case 'windows':
      return t.dlWindowsPrimary;
    case 'linux-deb':
      return t.dlLinuxDebPrimary;
    case 'linux-appimage':
      return t.dlLinuxAppImagePrimary;
    case 'android':
      return t.dlAndroidPrimary;
  }
}

export function InstallSuggestionPopup({
  isApp,
  isCompact,
  isPipActive,
  t,
}: InstallSuggestionPopupProps) {
  const [dismissed, setDismissed] = useState<boolean>(readDismissed);
  const [showAllPlatforms, setShowAllPlatforms] = useState<boolean>(false);
  const visitorOS = useMemo(() => detectVisitorOS(), []);

  // Strictly hidden in Installed App mode, Compact mode, PiP, or once dismissed
  if (isApp || dismissed || isCompact || isPipActive) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  };

  const primaryPackages =
    visitorOS === 'other'
      ? INSTALLER_PACKAGES
      : INSTALLER_PACKAGES.filter((pkg) => pkg.osGroup === visitorOS);

  const secondaryPackages =
    visitorOS === 'other'
      ? []
      : INSTALLER_PACKAGES.filter((pkg) => pkg.osGroup !== visitorOS);

  return (
    <aside
      role="dialog"
      aria-label={t.popupInstallTitle}
      className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-2xl bg-[#121216]/92 backdrop-blur-md border p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] neon-glow-accent flex flex-col gap-3"
      style={{borderColor: 'rgba(var(--accent-rgb), 0.42)'}}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'rgba(var(--accent-rgb), 0.16)',
              border: '1px solid rgba(var(--accent-rgb), 0.45)',
              color: 'var(--accent-color)',
            }}
          >
            <Download className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-display text-xs sm:text-sm font-bold text-[#FAFAFA] leading-tight">
            {t.popupInstallTitle}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label={t.close}
          title={t.close}
          className="w-7 h-7 rounded-lg border text-[#A1A1AA] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.24)'}}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-xs text-[#D4D4D8] leading-relaxed">
        {t.popupInstallDesc}
      </p>

      {/* Primary OS-Matched Download Action(s) */}
      <div
        className={
          primaryPackages.length > 1
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-2'
            : 'flex flex-col gap-2'
        }
      >
        {primaryPackages.map((pkg) => (
          <a
            key={pkg.id}
            href={pkg.url}
            download={pkg.filename}
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:brightness-110 neon-glow-accent text-center"
            style={{
              backgroundColor: 'rgba(var(--accent-rgb), 0.26)',
              border: '1px solid var(--accent-color)',
            }}
          >
            <InstallerIcon id={pkg.id} className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{getInstallerPrimaryLabel(pkg.id, t)}</span>
          </a>
        ))}
      </div>

      {/* Expandable Other Platforms */}
      {secondaryPackages.length > 0 && showAllPlatforms && (
        <div
          className="pt-2 border-t grid grid-cols-2 gap-1.5"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.16)'}}
        >
          {secondaryPackages.map((pkg) => (
            <a
              key={pkg.id}
              href={pkg.url}
              download={pkg.filename}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#09090B]/85 border text-[11px] font-medium text-[#D4D4D8] hover:text-white transition-colors"
              style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
            >
              <InstallerIcon id={pkg.id} className="w-3 h-3 shrink-0" />
              <span className="truncate">{getInstallerShortLabel(pkg.id, t)}</span>
            </a>
          ))}
        </div>
      )}

      {/* Bottom Controls: Other Platforms Toggle + "Not Now" */}
      <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px]">
        {secondaryPackages.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowAllPlatforms((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
          >
            <span>{t.popupOtherPlatforms}</span>
            {showAllPlatforms ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={handleDismiss}
          className="text-[#A1A1AA] hover:text-white transition-colors cursor-pointer font-medium"
        >
          {t.popupNotNow}
        </button>
      </div>
    </aside>
  );
}
