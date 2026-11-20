import {Download, Mail, MessageCircle, Scale} from 'lucide-react';
import type {MouseEvent} from 'react';
import type {AppLanguage, Translations} from '../data/i18n';
import {openExternalUrl} from '../hooks/useIsInstalledApp';

interface SiteFooterProps {
  t: Translations;
  lang: AppLanguage;
  isApp: boolean;
  termsHref: string;
  contactHref: string;
  onNavigateTerms: () => void;
  onNavigateContact: () => void;
  onOpenInstall: () => void;
}

export function SiteFooter({
  t,
  lang,
  isApp,
  termsHref,
  contactHref,
  onNavigateTerms,
  onNavigateContact,
  onOpenInstall,
}: SiteFooterProps) {
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

  const handleTermsLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    onNavigateTerms();
  };

  const handleContactLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    onNavigateContact();
  };

  return (
    <div
      className="w-full pt-1.5 sm:pt-2 border-t flex justify-between items-center flex-wrap gap-x-3 gap-y-1.5 text-[10px] sm:text-[11px] text-[#A1A1AA]"
      style={{borderColor: 'rgba(var(--accent-rgb), 0.14)'}}
    >
      <p className="hidden sm:block sm:max-w-[34%] text-center sm:text-left text-zinc-500 leading-snug">
        {t.footerNotice}
      </p>

      <div className="min-w-0 flex flex-wrap items-center justify-center sm:justify-end gap-1.5 w-full sm:flex-1">
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
          onClick={(e) =>
            handleExternalLinkClick(e, 'https://pacoca.net/@Pad2PS')
          }
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
            <path
              d="M5.5 6.2V18.2C5.5 20.0 8.4 21.3 12 21.3C15.6 21.3 18.5 20.0 18.5 18.2V6.2Z"
              className="fill-zinc-400/20 stroke-current group-hover:fill-[#C68B59] group-hover:stroke-[#3B2314] transition-colors duration-150"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <ellipse
              cx="12"
              cy="6.2"
              rx="6.5"
              ry="2.6"
              className="fill-zinc-300/35 stroke-current group-hover:fill-[#DDA574] group-hover:stroke-[#3B2314] transition-colors duration-150"
              strokeWidth="1.4"
            />
            <path
              d="M7.81 11.27 A1.75 2.2 0 1 1 7.81 13.13 L9.4 12.2 Z"
              className="fill-current group-hover:fill-[#3B2314] transition-colors duration-150"
            />
            <path
              d="M13.01 11.27 A1.75 2.2 0 1 1 13.01 13.13 L14.6 12.2 Z"
              className="fill-current group-hover:fill-[#3B2314] transition-colors duration-150"
            />
            <path
              d="M11.35 14.5 Q12 15.2 12.65 14.5"
              className="stroke-current group-hover:stroke-[#3B2314] transition-colors duration-150"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
            <path
              d="M9.2 16.5 Q12 18.4 14.8 16.5"
              className="stroke-current group-hover:stroke-[#3B2314] transition-colors duration-150"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M8.6 16.1 L9.3 17.0 M15.4 16.1 L14.7 17.0"
              className="stroke-current group-hover:stroke-[#3B2314] transition-colors duration-150"
              strokeWidth="1.15"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-mono text-[11px]">Paçoca (@Pad2PS)</span>
        </a>

        <a
          href="https://discord.gg/TWfKNvGkcj"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) =>
            handleExternalLinkClick(event, 'https://discord.gg/TWfKNvGkcj')
          }
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121216]/90 border text-[#A1A1AA] hover:text-white transition-all whitespace-nowrap"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
        >
          <MessageCircle className="h-3.5 w-3.5 text-indigo-300" />
          <span className="font-mono text-[11px]">Discord</span>
        </a>

        <a
          href="https://github.com/RbtSwift/Pad2PS"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) =>
            handleExternalLinkClick(event, 'https://github.com/RbtSwift/Pad2PS')
          }
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121216]/90 border text-[#A1A1AA] hover:text-white transition-all whitespace-nowrap"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
        >
          <span className="font-mono text-[11px]">GitHub · Pad2PS</span>
        </a>

        <a
          href="https://github.com/RbtSwift/Pad2PS-Launcher"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) =>
            handleExternalLinkClick(
              event,
              'https://github.com/RbtSwift/Pad2PS-Launcher'
            )
          }
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121216]/90 border text-[#A1A1AA] hover:text-white transition-all whitespace-nowrap"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
        >
          <span className="font-mono text-[11px]">GitHub · Launcher</span>
        </a>

        <a
          href="mailto:contato@pad2ps.com.br"
          onClick={(event) =>
            handleExternalLinkClick(event, 'mailto:contato@pad2ps.com.br')
          }
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121216]/90 border text-[#A1A1AA] hover:text-white transition-all whitespace-nowrap"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
        >
          <Mail className="h-3.5 w-3.5" />
          <span className="font-mono text-[11px]">contato@pad2ps.com.br</span>
        </a>

        <a
          href={contactHref}
          onClick={handleContactLinkClick}
          aria-label={lang === 'en' ? 'Contact and support' : 'Contato e suporte'}
          title={lang === 'en' ? 'Contact and support' : 'Contato e suporte'}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121216]/90 border text-[#A1A1AA] hover:text-white transition-all whitespace-nowrap"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
        >
          <span className="font-mono text-[11px]">{lang === 'en' ? 'Support' : 'Suporte'}</span>
        </a>

        {/* Single Unified "Instalar App" Button (Browser Mode Only) */}
        {!isApp && (
          <button
            type="button"
            onClick={onOpenInstall}
            title={t.installAppTitle}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121216]/90 border text-[#FAFAFA] hover:text-white transition-all hover:shadow-[0_0_12px_rgba(var(--accent-rgb),0.45)] cursor-pointer whitespace-nowrap"
            style={{
              borderColor: 'rgba(var(--accent-rgb), 0.45)',
              backgroundColor: 'rgba(var(--accent-rgb), 0.14)',
            }}
          >
            <Download
              className="w-3 h-3 shrink-0"
              style={{color: 'var(--accent-color)'}}
            />
            <span className="font-medium">{t.installApp}</span>
          </button>
        )}

        {/* Legal / Terms of Use Page Link */}
        <a
          href={termsHref}
          onClick={handleTermsLinkClick}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121216]/90 border text-[#A1A1AA] hover:text-white transition-all hover:shadow-[0_0_12px_rgba(var(--accent-rgb),0.32)] cursor-pointer whitespace-nowrap"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.22)'}}
        >
          <Scale
            className="w-3 h-3 shrink-0"
            style={{color: 'var(--accent-color)'}}
          />
          <span>{t.footerTermsButton}</span>
        </a>
      </div>
    </div>
  );
}
