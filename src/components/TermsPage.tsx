import {ArrowLeft, Download, ShieldCheck} from 'lucide-react';
import type {MouseEvent} from 'react';
import type {AppLanguage, Translations} from '../data/i18n';
import {NEON_THEMES} from '../data/themes';
import {openExternalUrl} from '../hooks/useIsInstalledApp';
import {Pad2PSLogo} from './Pad2PSLogo';

interface TermsPageProps {
  lang: AppLanguage;
  onChangeLang: (lang: AppLanguage) => void;
  themeId: string;
  onChangeTheme: (themeId: string) => void;
  t: Translations;
  isApp: boolean;
  homeHref: string;
  onNavigateHome: () => void;
  onOpenInstall: () => void;
}

interface LegalSection {
  title: string;
  body: string;
}

const LEGAL_CONTENT: Record<AppLanguage, {title: string; sections: LegalSection[]}> = {
  pt: {
    title: 'Termos de Uso, Privacidade e Isenção de Responsabilidade',
    sections: [
      {
        title: '1. Isenção de Afiliação e Marcas Registradas (Disclaimer)',
        body: 'O Pad2PS é um projeto independente e gratuito desenvolvido por fãs para fins educativos, de acessibilidade e referência visual. Este site não possui qualquer vínculo, patrocínio, endosso ou associação oficial com a Sony Interactive Entertainment Inc., Microsoft Corporation ou qualquer desenvolvedora de jogos e emuladores. "PlayStation", "DualShock", "PS1", "PS2", "PS3", "PSP" e os símbolos dos botões (Triângulo, Círculo, Xis e Quadrado) são marcas registradas de seus respectivos proprietários. "Xbox" é uma marca registrada da Microsoft Corporation.',
      },
      {
        title: '2. Conteúdo de Jogos e Propriedade Intelectual',
        body: 'O Pad2PS atua exclusivamente como um visualizador de entradas de controle (input display) em tempo real e guia de consulta de comandos. Esta plataforma não hospeda, não distribui, não comercializa e não incentiva o download de ROMs, ISOs, arquivos de BIOS ou qualquer material protegido por direitos autorais. Os combos e códigos exibidos na biblioteca são sequências públicas de referência criadas pela comunidade.',
      },
      {
        title: '3. Privacidade e Armazenamento Local (Zero Rastreamento)',
        body: 'Respeitamos integralmente a sua privacidade. O Pad2PS não exige cadastro, não coleta dados pessoais, não utiliza cookies de rastreamento publicitário e não envia informações dos seus controles ou comandos para servidores externos. Todas as suas preferências (como tema neon, idioma, remapeamento de botões e combos personalizados) ficam salvas exclusivamente no armazenamento local (localStorage) do seu próprio navegador.',
      },
      {
        title: '4. Limitação de Responsabilidade',
        body: 'Esta ferramenta é fornecida gratuitamente "no estado em que se encontra", sem garantias expressas ou implícitas de funcionamento contínuo ou compatibilidade universal com todos os modelos de controles, navegadores ou sistemas operacionais. O uso da aplicação é de inteira responsabilidade do usuário.',
      },
    ],
  },
  en: {
    title: 'Terms of Use, Privacy & Disclaimer',
    sections: [
      {
        title: '1. Non-Affiliation & Trademarks Disclaimer',
        body: 'Pad2PS is an independent, free fan-made project created for educational, accessibility, and visual reference purposes. This website is not affiliated with, sponsored, endorsed, or officially connected with Sony Interactive Entertainment Inc., Microsoft Corporation, or any game and emulator developers. "PlayStation", "DualShock", "PS1", "PS2", "PS3", "PSP", and the button symbols (Triangle, Circle, Cross, and Square) are registered trademarks of their respective owners. "Xbox" is a registered trademark of Microsoft Corporation.',
      },
      {
        title: '2. Game Content & Intellectual Property',
        body: 'Pad2PS operates strictly as a real-time controller input visualizer and command reference guide. This platform does not host, distribute, sell, or encourage the downloading of ROMs, ISOs, BIOS files, or any copyrighted game software. The combos and cheat codes listed in the library are publicly known reference sequences shared by the gaming community.',
      },
      {
        title: '3. Privacy & Local Storage (Zero Tracking)',
        body: "We fully respect your privacy. Pad2PS requires no registration, collects no personal data, uses no advertising tracking cookies, and never transmits your controller inputs or custom commands to external servers. All user preferences (such as neon themes, language, button remapping, and custom combos) are stored exclusively in your browser's local storage (localStorage).",
      },
      {
        title: '4. Limitation of Liability',
        body: 'This utility is provided free of charge "as is", without any express or implied warranties of uninterrupted operation or universal compatibility across all controller models, browsers, or operating systems. Use of this application is at your own discretion and risk.',
      },
    ],
  },
};

export function TermsPage({
  lang,
  onChangeLang,
  themeId,
  onChangeTheme,
  t,
  isApp,
  homeHref,
  onNavigateHome,
  onOpenInstall,
}: TermsPageProps) {
  const content = LEGAL_CONTENT[lang];

  const handleHomeLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
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
    onNavigateHome();
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
    <div className="cyber-grid-bg h-dvh w-full overflow-y-auto flex flex-col text-[#FAFAFA]">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 flex flex-col gap-5 sm:gap-6">
        {/* Top Bar */}
        <header className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b accent-border-subtle shrink-0">
          <Pad2PSLogo isApp={isApp} t={t} />

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {/* Neon Theme Swatches */}
            <div
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#121216] border accent-border-subtle"
              role="group"
              aria-label="Neon theme"
            >
              {NEON_THEMES.map((theme) => {
                const selected = theme.id === themeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => onChangeTheme(theme.id)}
                    title={theme.name}
                    aria-label={theme.name}
                    aria-pressed={selected}
                    className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                      selected
                        ? 'scale-125 ring-2 ring-white/90 ring-offset-1 ring-offset-[#121216]'
                        : 'opacity-70 hover:opacity-100 hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: theme.hex,
                      boxShadow: selected ? `0 0 8px ${theme.hex}` : undefined,
                    }}
                  />
                );
              })}
            </div>

            {/* PT | EN Language Toggle */}
            <div
              role="group"
              aria-label="Language"
              className="inline-flex items-center p-0.5 rounded-lg bg-[#121216] border accent-border-subtle text-[11px] font-mono"
            >
              {(['pt', 'en'] as const).map((code) => {
                const active = lang === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => onChangeLang(code)}
                    aria-pressed={active}
                    className={`px-2 py-1 rounded-md font-semibold uppercase transition-colors cursor-pointer ${
                      active ? 'text-white' : 'text-[#A1A1AA] hover:text-white'
                    }`}
                    style={
                      active
                        ? {
                            backgroundColor: 'rgba(var(--accent-rgb), 0.28)',
                            color: '#FFFFFF',
                          }
                        : undefined
                    }
                  >
                    {code.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Back to App Button */}
            <a
              href={homeHref}
              onClick={handleHomeLinkClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110 neon-glow-accent whitespace-nowrap"
              style={{
                backgroundColor: 'rgba(var(--accent-rgb), 0.24)',
                border: '1px solid var(--accent-color)',
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>{t.termsBackButton}</span>
            </a>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-4 sm:gap-5">
          {/* Page Hero Card */}
          <div
            className="accent-panel rounded-2xl p-5 sm:p-6 neon-glow-accent flex flex-col sm:flex-row sm:items-center gap-4"
            style={{border: '1px solid rgba(var(--accent-rgb), 0.34)'}}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'rgba(var(--accent-rgb), 0.16)',
                border: '1px solid rgba(var(--accent-rgb), 0.4)',
                color: 'var(--accent-color)',
              }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: 'rgba(var(--accent-rgb), 0.16)',
                    color: 'var(--accent-color)',
                  }}
                >
                  {t.termsPageBadge}
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  /termos-de-uso
                </span>
              </div>
              <h1 className="font-display text-lg sm:text-2xl font-bold text-[#FAFAFA] leading-snug">
                {content.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                {t.termsPageSubtitle}
              </p>
            </div>
          </div>

          {/* Legal Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.sections.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl bg-[#121216]/90 border p-5 space-y-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.2)'}}
              >
                <h2
                  className="text-sm sm:text-base font-semibold leading-snug"
                  style={{color: 'var(--accent-color)'}}
                >
                  {section.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer
          className="w-full pt-3 pb-2 border-t flex flex-wrap justify-between items-center gap-3 text-[11px] text-[#A1A1AA] shrink-0"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.14)'}}
        >
          <p className="text-zinc-500 leading-snug">{t.footerNotice}</p>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="https://x.com/Pad2PS"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleExternalLinkClick(e, 'https://x.com/Pad2PS')}
              aria-label="X (@Pad2PS)"
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

            <a
              href="https://pacoca.net/@Pad2PS"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) =>
                handleExternalLinkClick(e, 'https://pacoca.net/@Pad2PS')
              }
              aria-label="Paçoca (@Pad2PS)"
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
          </div>
        </footer>
      </div>
    </div>
  );
}
