import {
  Download,
  Globe,
  Monitor,
  Package,
  Smartphone,
  Terminal,
  X,
} from 'lucide-react';
import {useEffect, useMemo} from 'react';
import type {Translations} from '../data/i18n';
import {INSTALLER_PACKAGES, type InstallerId} from '../data/installers';
import {detectVisitorOS} from '../hooks/useIsInstalledApp';
import {usePWAInstall} from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isApp: boolean;
  t: Translations;
}

function InstallerIcon({
  id,
  className = 'w-4 h-4',
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

function getInstallerShortLabel(id: InstallerId, t: Translations): string {
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

export function InstallAppModal({
  isOpen,
  onClose,
  isApp,
  t,
}: InstallAppModalProps) {
  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();
  const visitorOS = useMemo(() => detectVisitorOS(), []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || isApp) {
    return null;
  }

  const primaryPackages =
    visitorOS === 'other'
      ? []
      : INSTALLER_PACKAGES.filter((pkg) => pkg.osGroup === visitorOS);

  const otherPackages =
    visitorOS === 'other'
      ? INSTALLER_PACKAGES
      : INSTALLER_PACKAGES.filter((pkg) => pkg.osGroup !== visitorOS);

  const handlePwaInstall = async () => {
    const installed = await install();
    if (installed) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-app-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] rounded-2xl bg-[#121216] border flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden"
        style={{borderColor: 'rgba(var(--accent-rgb), 0.38)'}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between gap-3 shrink-0"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.16)'}}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'rgba(var(--accent-rgb), 0.16)',
                border: '1px solid rgba(var(--accent-rgb), 0.38)',
                color: 'var(--accent-color)',
              }}
            >
              <Download className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="install-app-modal-title"
                className="font-display text-base font-bold text-[#FAFAFA] truncate"
              >
                {t.installAppTitle}
              </h2>
              <p className="text-xs text-[#A1A1AA] line-clamp-2">
                {t.popupInstallDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="w-8 h-8 rounded-lg border text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            style={{borderColor: 'rgba(var(--accent-rgb), 0.24)'}}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Primary Native OS Installers */}
          {primaryPackages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#FAFAFA]">
                  {t.popupInstallTitle}
                </span>
                <span
                  className="px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold"
                  style={{
                    backgroundColor: 'rgba(var(--accent-rgb), 0.16)',
                    color: 'var(--accent-color)',
                  }}
                >
                  {t.installRecommended}
                </span>
              </div>

              <div
                className={
                  primaryPackages.length > 1
                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5'
                    : 'flex flex-col gap-2.5'
                }
              >
                {primaryPackages.map((pkg) => (
                  <a
                    key={pkg.id}
                    href={pkg.url}
                    download={pkg.filename}
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-white transition-all hover:brightness-110 neon-glow-accent"
                    style={{
                      backgroundColor: 'rgba(var(--accent-rgb), 0.24)',
                      border: '1px solid var(--accent-color)',
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <InstallerIcon id={pkg.id} className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        {getInstallerPrimaryLabel(pkg.id, t)}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-zinc-200 shrink-0">
                      {pkg.extension}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Browser PWA 1-Click Install (when supported) */}
          {!isInstalled && isInstallable && (
            <button
              type="button"
              onClick={handlePwaInstall}
              className="w-full px-4 py-3 rounded-xl bg-[#09090B]/90 border flex items-center justify-between gap-3 text-left hover:bg-white/[0.04] transition-colors cursor-pointer"
              style={{borderColor: 'rgba(var(--accent-rgb), 0.32)'}}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: 'rgba(var(--accent-rgb), 0.14)',
                    border: '1px solid rgba(var(--accent-rgb), 0.35)',
                    color: 'var(--accent-color)',
                  }}
                >
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#FAFAFA] truncate">
                    {t.installPwaButton}
                  </p>
                  <p className="text-[11px] text-[#A1A1AA] truncate">
                    {t.installPwaDesc}
                  </p>
                </div>
              </div>
              <Download
                className="w-4 h-4 shrink-0"
                style={{color: 'var(--accent-color)'}}
              />
            </button>
          )}

          {/* iOS Safari Add-to-Home-Screen Guide */}
          {!isInstalled && isIOS && (
            <div
              className="rounded-xl bg-[#09090B]/90 border p-3.5 space-y-1.5"
              style={{borderColor: 'rgba(var(--accent-rgb), 0.28)'}}
            >
              <p className="text-xs font-semibold text-[#FAFAFA]">
                {t.installIosTitle}
              </p>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                {t.installIosStep1}
              </p>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                {t.installIosStep2}
              </p>
            </div>
          )}

          {/* All / Other Platform Installers */}
          {otherPackages.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-medium text-[#A1A1AA]">
                {primaryPackages.length > 0
                  ? t.popupOtherPlatforms
                  : t.installAllPlatforms}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {otherPackages.map((pkg) => (
                  <a
                    key={pkg.id}
                    href={pkg.url}
                    download={pkg.filename}
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[#09090B]/85 border text-xs font-medium text-[#D4D4D8] hover:text-white hover:bg-white/[0.04] transition-colors"
                    style={{borderColor: 'rgba(var(--accent-rgb), 0.24)'}}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <InstallerIcon id={pkg.id} className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        {getInstallerShortLabel(pkg.id, t)}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-500 shrink-0">
                      {pkg.extension}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
