import {Download, Scale, X} from 'lucide-react';
import {type MouseEvent, useState} from 'react';
import type {Translations} from '../data/i18n';
import {INSTALLER_PACKAGES} from '../data/installers';
import {openExternalUrl} from '../hooks/useIsInstalledApp';
import {usePWAInstall} from '../hooks/usePWAInstall';
import {getInstallerShortLabel, InstallerIcon} from './InstallSuggestionPopup';

interface SiteFooterProps {
  t: Translations;
  isApp: boolean;
  onOpenLegal: () => void;
}

export function SiteFooter({t, isApp, onOpenLegal}: SiteFooterProps) {
  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const showInstallButton = !isApp && !isInstalled && (isInstallable || isIOS);

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleExternalLinkClick = (
    event: MouseEvent<HTMLAnchorElement>,
    url: string
  ) => {
    if (!isApp) {
      return;
    }
    event.preventDefault();
    void openExternalUrl(url, true);
  };

  return (
    <div
      className="w-full pt-2.5 border-t flex justify-between items-center flex-wrap gap-4 text-[11px] text-[#A1A1AA]"
      style={{borderColor: 'rgba(var(--accent-rgb), 0.14)'}}
    >
      <p className="text-center sm:text-left text-zinc-500 leading-snug">
        {t.footerNotice}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
        {/* Official X (Twitter) Link */}
        <a
          href="https://x.com/Pad2PS"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => handleExternalLinkClick(e, 'https://x.com/Pad2PS')}
          aria-label="X (@Pad2PS)"
          title="X (@Pad2PS)"
          className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121216]/90 border text-[#A1A1AA] hover:text-white transition-all hover:shadow-[0_0_12px_rgba(var(--accent-rgb),0.38)] whitespace-nowrap"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3.5 h-3.5 shrink-0 transition-colors group-hover:text-[var(--accent-color)]"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="font-mono text-[11px]">X (@Pad2PS)</span>
        </a>

        {/* Official Paçoca Social Link */}
        <a
          href="https://pacoca.net/@Pad2PS"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => handleExternalLinkClick(e, 'https://pacoca.net/@Pad2PS')}
          aria-label="Paçoca (@Pad2PS)"
          title="Paçoca (@Pad2PS)"
          className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121216]/90 border text-[#A1A1AA] hover:text-white transition-all hover:shadow-[0_0_12px_rgba(var(--accent-rgb),0.38)] whitespace-nowrap"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105"
            aria-hidden="true"
          >
            {/* Cylindrical paçoca body */}
            <path
              d="M5.5 6.2V18.2C5.5 20.0 8.4 21.3 12 21.3C15.6 21.3 18.5 20.0 18.5 18.2V6.2Z"
              className="fill-zinc-400/20 stroke-current group-hover:fill-[#C68B59] group-hover:stroke-[#3B2314] transition-colors duration-150"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            {/* Slightly lighter oval top lid */}
            <ellipse
              cx="12"
              cy="6.2"
              rx="6.5"
              ry="2.6"
              className="fill-zinc-300/35 stroke-current group-hover:fill-[#DDA574] group-hover:stroke-[#3B2314] transition-colors duration-150"
              strokeWidth="1.4"
            />
            {/* Left classic oval pie-eye (cutout facing left) */}
            <path
              d="M7.81 11.27 A1.75 2.2 0 1 1 7.81 13.13 L9.4 12.2 Z"
              className="fill-current group-hover:fill-[#3B2314] transition-colors duration-150"
            />
            {/* Right classic oval pie-eye (cutout facing left) */}
            <path
              d="M13.01 11.27 A1.75 2.2 0 1 1 13.01 13.13 L14.6 12.2 Z"
              className="fill-current group-hover:fill-[#3B2314] transition-colors duration-150"
            />
            {/* Small curved nose */}
            <path
              d="M11.35 14.5 Q12 15.2 12.65 14.5"
              className="stroke-current group-hover:stroke-[#3B2314] transition-colors duration-150"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
            {/* Friendly smile */}
            <path
              d="M9.2 16.5 Q12 18.4 14.8 16.5"
              className="stroke-current group-hover:stroke-[#3B2314] transition-colors duration-150"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            {/* Dimples at smile corners */}
            <path
              d="M8.6 16.1 L9.3 17.0 M15.4 16.1 L14.7 17.0"
              className="stroke-current group-hover:stroke-[#3B2314] transition-colors duration-150"
              strokeWidth="1.15"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-mono text-[11px]">Paçoca (@Pad2PS)</span>
        </a>

        {/* Native Platform Installers (Browser Mode Only) */}
        {!isApp && (
          <div
            role="group"
            aria-label={t.dlSectionLabel}
            className="flex flex-wrap items-center justify-center gap-1.5"
          >
            {INSTALLER_PACKAGES.map((pkg) => {
              const label = getInstallerShortLabel(pkg.id, t);
              return (
                <a
                  key={pkg.id}
                  href={pkg.url}
                  download={pkg.filename}
                  rel="noopener noreferrer"
                  title={`${t.dlSectionLabel}: ${label} (${pkg.filename})`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121216]/90 border text-[#A1A1AA] hover:text-white transition-all hover:shadow-[0_0_12px_rgba(var(--accent-rgb),0.36)] whitespace-nowrap"
                  style={{borderColor: 'rgba(var(--accent-rgb), 0.24)'}}
                >
                  <InstallerIcon id={pkg.id} className="w-3 h-3 shrink-0" />
                  <span className="font-mono text-[11px]">{label}</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Discrete PWA Install App Button (Browser Mode Only) */}
        {showInstallButton && (
          <button
            type="button"
            onClick={handleInstallClick}
            title={t.installAppTitle}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121216]/90 border text-[#FAFAFA] hover:text-white transition-all hover:shadow-[0_0_12px_rgba(var(--accent-rgb),0.45)] cursor-pointer whitespace-nowrap"
            style={{
              borderColor: 'rgba(var(--accent-rgb), 0.45)',
              backgroundColor: 'rgba(var(--accent-rgb), 0.14)',
            }}
          >
            <Download className="w-3 h-3" style={{color: 'var(--accent-color)'}} />
            <span className="font-medium">{t.installApp}</span>
          </button>
        )}

        {/* Legal / Terms Modal Trigger */}
        <button
          type="button"
          onClick={onOpenLegal}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121216]/90 border text-[#A1A1AA] hover:text-white transition-all hover:shadow-[0_0_12px_rgba(var(--accent-rgb),0.32)] cursor-pointer whitespace-nowrap"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
        >
          <Scale className="w-3 h-3" style={{color: 'var(--accent-color)'}} />
          <span>{t.footerTermsButton}</span>
        </button>
      </div>

      {/* iOS Safari Add-to-Home-Screen Guide Modal */}
      {showIOSGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pad2ps-ios-install-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-[#121216] border p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
            style={{borderColor: 'rgba(var(--accent-rgb), 0.4)'}}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3
                id="pad2ps-ios-install-title"
                className="text-sm font-semibold text-[#FAFAFA]"
              >
                {t.installIosTitle}
              </h3>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                aria-label={t.close}
                className="p-1 rounded-md text-[#A1A1AA] hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-[#A1A1AA] leading-relaxed">
              <p>{t.installIosStep1}</p>
              <p>{t.installIosStep2}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full py-2 rounded-lg text-xs font-semibold text-white cursor-pointer"
              style={{
                backgroundColor: 'rgba(var(--accent-rgb), 0.26)',
                border: '1px solid var(--accent-color)',
              }}
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

