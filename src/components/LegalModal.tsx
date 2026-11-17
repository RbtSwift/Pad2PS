import {ShieldCheck, X} from 'lucide-react';
import {type MouseEvent, useEffect} from 'react';
import type {AppLanguage, Translations} from '../data/i18n';
import {openExternalUrl} from '../hooks/useIsInstalledApp';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  t: Translations;
  isApp?: boolean;
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

export function LegalModal({
  isOpen,
  onClose,
  lang,
  t,
  isApp = false,
}: LegalModalProps) {
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

  if (!isOpen) {
    return null;
  }

  const content = LEGAL_CONTENT[lang];

  const handleModalClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!isApp) {
      return;
    }
    const target = e.target as HTMLElement | null;
    const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
    if (anchor && /^https?:\/\//i.test(anchor.href)) {
      e.preventDefault();
      void openExternalUrl(anchor.href, true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#121216] rounded-2xl p-5 shadow-[0_24px_60px_rgba(0,0,0,0.85)] neon-glow-accent flex flex-col gap-4 max-h-[88vh]"
        style={{border: '1px solid rgba(var(--accent-rgb), 0.38)'}}
        onClick={handleModalClick}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-3 pb-3 border-b shrink-0"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.16)'}}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
                border: '1px solid rgba(var(--accent-rgb), 0.38)',
                color: 'var(--accent-color)',
              }}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2
              id="legal-modal-title"
              className="font-display text-sm sm:text-base font-bold text-[#FAFAFA] leading-snug"
            >
              {content.title}
            </h2>
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

        {/* Scrollable Legal Sections */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 scroll-smooth">
          {content.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-xl bg-[#09090B]/85 border p-4 space-y-1.5"
              style={{borderColor: 'rgba(var(--accent-rgb), 0.16)'}}
            >
              <h3
                className="text-xs sm:text-sm font-semibold"
                style={{color: 'var(--accent-color)'}}
              >
                {section.title}
              </h3>
              <p className="text-xs sm:text-[13px] text-[#D4D4D8] leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        {/* Footer Action */}
        <div
          className="pt-3 border-t flex items-center justify-end shrink-0"
          style={{borderColor: 'rgba(var(--accent-rgb), 0.16)'}}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer neon-glow-accent"
            style={{
              backgroundColor: 'rgba(var(--accent-rgb), 0.26)',
              border: '1px solid var(--accent-color)',
            }}
          >
            {t.legalCloseButton}
          </button>
        </div>
      </div>
    </div>
  );
}
