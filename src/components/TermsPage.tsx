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
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
  links?: {label: string; href: string}[];
}

interface LegalContent {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}

const LEGAL_CONTENT: Record<AppLanguage, LegalContent> = {
  pt: {
    title: 'Termos de Uso e Política de Privacidade — Ecossistema Pad2PS',
    updatedAt: 'Última atualização: Novembro de 2026',
    intro:
      'Bem-vindo ao ecossistema Pad2PS, desenvolvido e mantido por Ravi Rosa (rbtswift). Estes Termos de Uso e Política de Privacidade regulam o acesso e a utilização de todas as aplicações, versões e serviços oficiais vinculados ao projeto, independentemente da plataforma utilizada (Web, Desktop ou Dispositivos Móveis).',
    sections: [
      {
        title: '1. Escopo e Produtos Abrangidos',
        bullets: [
          'Pad2PS: Aplicação multiplataforma (disponível via Web em pad2ps.vercel.app, Desktop e Mobile) voltada para tradução visual de botões, consulta de layouts interativos de controles (PlayStation, Xbox, Nintendo, entre outros), diagnóstico de entradas e referência rápida de comandos.',
          'Pad2PS Launcher: Aplicação multiplataforma (Desktop, Mobile e Web) destinada à organização, catalogação e inicialização unificada de bibliotecas de jogos, plataformas digitais, mídias físicas/virtuais e emuladores configurados localmente pelo usuário.',
        ],
        note: 'Nota: Expressões descritivas utilizadas em lojas de aplicativos ou mecanismos de busca, como “Guia de Controle”, têm caráter meramente informativo para auxiliar na descoberta do software, não alterando o nome oficial Pad2PS.',
      },
      {
        title: '2. Propriedade Intelectual e Marcas de Terceiros',
        bullets: [
          'Direitos do Desenvolvedor: O código-fonte, a identidade visual, os textos, os ícones originais e as interfaces do Pad2PS e do Pad2PS Launcher são de titularidade de Ravi Rosa (rbtswift), protegidos pelas leis de direitos autorais e licenças de software aplicáveis.',
          'Marcas de Terceiros: Nomes comerciais, logotipos, simbologias de botões e referências a consoles, controles ou plataformas (incluindo, mas não se limitando a PlayStation, DualShock, DualSense, Xbox, Nintendo, Steam, Heroic, Lutris, PCSX2 e DuckStation) pertencem exclusivamente aos seus respectivos proprietários e são mencionados apenas para fins de compatibilidade, identificação visual e referência informativa, sem qualquer vínculo oficial, patrocínio ou endosso.',
        ],
      },
      {
        title: '3. Responsabilidade sobre Arquivos Locais, Jogos e Emulação',
        bullets: [
          'Uso Exclusivamente Local: O Pad2PS Launcher atua estritamente como uma interface organizadora de arquivos, atalhos, executáveis e diretórios já existentes no dispositivo do usuário.',
          'Proibição de Pirataria: Nenhuma aplicação do ecossistema Pad2PS hospeda, distribui, comercializa ou fornece links para download de jogos protegidos por direitos autorais, imagens de disco (ROMs/ISOs) ou arquivos de sistema (BIOS).',
          'Responsabilidade do Usuário: É de inteira responsabilidade do usuário garantir que possui licença legal ou cópia legítima de todos os jogos, softwares e arquivos adicionados ou iniciados por meio do Pad2PS Launcher, bem como respeitar os termos de uso de cada plataforma ou emulador integrado.',
        ],
      },
      {
        title: '4. Política de Privacidade e Proteção de Dados (LGPD)',
        paragraphs: [
          'O Pad2PS e o Pad2PS Launcher foram projetados com foco em privacidade e funcionamento local, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD):',
        ],
        bullets: [
          'Não Coleta de Dados Pessoais Sensíveis: Não exigimos cadastro obrigatório nem coletamos nome, CPF, localização precisa, contatos ou dados financeiros para o funcionamento básico das aplicações.',
          'Armazenamento Local: Preferências de interface, layouts selecionados, caminhos de pastas de jogos, capas e configurações de controles são armazenados localmente no próprio dispositivo do usuário (via armazenamento local do navegador ou arquivos de configuração do sistema).',
          'Logs Técnicos e Serviços de Distribuição: Ao acessar o portal web (pad2ps.vercel.app) ou baixar os aplicativos por lojas oficiais (como a Google Play Store) e repositórios (como o GitHub), dados técnicos básicos e anônimos (como endereço IP temporário, modelo do dispositivo, versão do sistema operacional e relatórios de falha) podem ser processados pelos respectivos provedores de infraestrutura e distribuição para fins de segurança, entrega de atualizações e estabilidade.',
          'Permissões do Sistema: Eventuais permissões solicitadas pelo Pad2PS ou pelo Pad2PS Launcher (como acesso a diretórios locais para leitura de bibliotecas de jogos ou leitura de dispositivos de entrada/gamepads) são utilizadas exclusivamente para executar as funcionalidades principais do aplicativo no dispositivo, sem envio dessas informações para servidores externos.',
        ],
      },
      {
        title: '5. Isenção de Garantias e Limitação de Responsabilidade',
        bullets: [
          'Fornecimento “No Estado em que se Encontra”: O Pad2PS e o Pad2PS Launcher são disponibilizados gratuitamente “no estado em que se encontram” (as is), sem garantias expressas ou implícitas de funcionamento ininterrupto ou compatibilidade universal com todos os modelos de controles genéricos, adaptadores USB/Bluetooth, drivers de sistema operacional ou versões específicas de emuladores de terceiros.',
          'Limitação de Danos: O desenvolvedor não se responsabiliza por perdas de dados decorrentes de configurações incorretas de diretórios pelo usuário, modificações em arquivos de terceiros ou indisponibilidades temporárias de serviços externos.',
        ],
      },
      {
        title: '6. Atualizações destes Termos e Contato',
        paragraphs: [
          'Estes Termos de Uso e Política de Privacidade podem ser atualizados periodicamente para refletir novos recursos no Pad2PS, no Pad2PS Launcher ou adequações legais. A versão mais recente estará sempre disponível na página oficial do projeto.',
          'Para dúvidas, sugestões, suporte técnico ou solicitações relacionadas à privacidade, entre em contato pelos canais oficiais:',
        ],
        links: [
          {label: 'E-mail: contato@pad2ps.com.br', href: 'mailto:contato@pad2ps.com.br'},
          {label: 'Portal Oficial: https://pad2ps.vercel.app', href: 'https://pad2ps.vercel.app'},
          {label: 'Repositórios Oficiais: https://github.com/RbtSwift', href: 'https://github.com/RbtSwift'},
        ],
      },
    ],
  },
  en: {
    title: 'Terms of Use and Privacy Policy — Pad2PS Ecosystem',
    updatedAt: 'Last updated: November 2026',
    intro:
      'Welcome to the Pad2PS ecosystem, developed and maintained by Ravi Rosa (rbtswift). These Terms of Use and Privacy Policy govern access to and use of all official applications, versions, and services related to the project, regardless of platform (Web, Desktop, or Mobile Devices).',
    sections: [
      {
        title: '1. Scope and Covered Products',
        bullets: [
          'Pad2PS: A cross-platform application (available on the Web at pad2ps.vercel.app, Desktop, and Mobile) for visual button translation, interactive controller layout reference (PlayStation, Xbox, Nintendo, and others), input diagnostics, and quick command reference.',
          'Pad2PS Launcher: A cross-platform application (Desktop, Mobile, and Web) for organizing, cataloging, and launching unified libraries of games, digital platforms, physical/virtual media, and emulators configured locally by the user.',
        ],
        note: 'Note: Descriptive terms used in app stores or search engines, such as “Controller Guide,” are informational only and help users discover the software; they do not change the official name Pad2PS.',
      },
      {
        title: '2. Intellectual Property and Third-Party Trademarks',
        bullets: [
          'Developer Rights: The source code, visual identity, text, original icons, and interfaces of Pad2PS and Pad2PS Launcher belong to Ravi Rosa (rbtswift) and are protected by applicable copyright laws and software licenses.',
          'Third-Party Trademarks: Trade names, logos, button symbols, and references to consoles, controllers, or platforms (including, but not limited to, PlayStation, DualShock, DualSense, Xbox, Nintendo, Steam, Heroic, Lutris, PCSX2, and DuckStation) belong exclusively to their respective owners and are mentioned only for compatibility, visual identification, and informational reference, without any official affiliation, sponsorship, or endorsement.',
        ],
      },
      {
        title: '3. Responsibility for Local Files, Games, and Emulation',
        bullets: [
          'Local Use Only: Pad2PS Launcher acts strictly as an interface for organizing files, shortcuts, executables, and directories that already exist on the user’s device.',
          'No Piracy: No application in the Pad2PS ecosystem hosts, distributes, sells, or provides download links to copyrighted games, disk images (ROMs/ISOs), or system files (BIOS).',
          'User Responsibility: Users are solely responsible for ensuring they have a legal license or legitimate copy of all games, software, and files added to or launched through Pad2PS Launcher, and for complying with the terms of each platform or integrated emulator.',
        ],
      },
      {
        title: '4. Privacy Policy and Data Protection (LGPD)',
        paragraphs: [
          'Pad2PS and Pad2PS Launcher are designed with privacy and local operation in mind, in accordance with Brazil’s General Data Protection Law (Law No. 13,709/2018 — LGPD):',
        ],
        bullets: [
          'No Collection of Sensitive Personal Data: We do not require mandatory registration or collect names, Brazilian CPF numbers, precise location, contacts, or financial data for basic app functionality.',
          'Local Storage: Interface preferences, selected layouts, game folder paths, artwork, and controller settings are stored locally on the user’s device (in browser storage or system configuration files).',
          'Technical Logs and Distribution Services: When accessing the web portal (pad2ps.vercel.app) or downloading apps from official stores (such as Google Play Store) and repositories (such as GitHub), basic technical and anonymous data (such as temporary IP address, device model, operating system version, and crash reports) may be processed by the respective infrastructure and distribution providers for security, update delivery, and stability.',
          'System Permissions: Any permissions requested by Pad2PS or Pad2PS Launcher (such as access to local directories to read game libraries or access to input devices/gamepads) are used solely to provide the app’s main features on the device, without sending this information to external servers.',
        ],
      },
      {
        title: '5. Disclaimer of Warranties and Limitation of Liability',
        bullets: [
          'Provided “As Is”: Pad2PS and Pad2PS Launcher are provided free of charge “as is,” without express or implied warranties of uninterrupted operation or universal compatibility with all generic controller models, USB/Bluetooth adapters, operating system drivers, or specific versions of third-party emulators.',
          'Limitation of Damages: The developer is not responsible for data loss resulting from incorrect directory settings by the user, modifications to third-party files, or temporary unavailability of external services.',
        ],
      },
      {
        title: '6. Updates to These Terms and Contact',
        paragraphs: [
          'These Terms of Use and Privacy Policy may be updated periodically to reflect new features in Pad2PS or Pad2PS Launcher or legal changes. The latest version will always be available on the project’s official page.',
          'For questions, suggestions, technical support, or privacy-related requests, contact us through the official channels:',
        ],
        links: [
          {label: 'Email: contato@pad2ps.com.br', href: 'mailto:contato@pad2ps.com.br'},
          {label: 'Official Portal: https://pad2ps.vercel.app', href: 'https://pad2ps.vercel.app'},
          {label: 'Official Repositories: https://github.com/RbtSwift', href: 'https://github.com/RbtSwift'},
        ],
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
                {content.updatedAt}
              </p>
            </div>
          </div>

          <section
            className="rounded-2xl bg-[#121216]/90 border p-5 sm:p-6 space-y-3 shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
            style={{borderColor: 'rgba(var(--accent-rgb), 0.2)'}}
          >
            <p className="text-sm sm:text-base text-[#E4DDE6] leading-relaxed">
              {content.intro}
            </p>
          </section>

          {/* Legal Sections */}
          <div className="grid grid-cols-1 gap-4">
            {content.sections.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl bg-[#121216]/90 border p-5 sm:p-6 space-y-3 shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
                style={{borderColor: 'rgba(var(--accent-rgb), 0.2)'}}
              >
                <h2
                  className="text-base sm:text-lg font-semibold leading-snug"
                  style={{color: 'var(--accent-color)'}}
                >
                  {section.title}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm sm:text-base text-[#D4D4D8] leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="list-disc space-y-2 pl-5 marker:text-[var(--accent-color)] text-sm sm:text-base text-[#D4D4D8] leading-relaxed">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="pl-1">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
                {section.note && (
                  <p className="rounded-xl border-l-2 bg-[#1a141c] px-4 py-3 text-sm italic text-[#BDB2C0] leading-relaxed" style={{borderColor: 'var(--accent-color)'}}>
                    {section.note}
                  </p>
                )}
                {section.links && (
                  <ul className="space-y-2 pl-5 list-disc marker:text-[var(--accent-color)] text-sm sm:text-base">
                    {section.links.map((link) => (
                      <li key={link.href} className="pl-1">
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) =>
                            handleExternalLinkClick(event, link.href)
                          }
                          className="text-[#F4D8E9] underline decoration-[var(--accent-color)]/50 underline-offset-4 hover:text-white"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
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
