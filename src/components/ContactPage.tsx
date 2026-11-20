import {ArrowLeft, Check, Copy, Mail, Send} from 'lucide-react';
import {useState, type FormEvent, type MouseEvent} from 'react';
import type {AppLanguage} from '../data/i18n';
import {openExternalUrl} from '../hooks/useIsInstalledApp';

interface ContactPageProps {
  lang: AppLanguage;
  isApp: boolean;
  homeHref: string;
  onNavigateHome: () => void;
}

const EMAIL = 'contato@pad2ps.com.br';

const COPY = {
  pt: {
    title: 'Contato & Suporte',
    subtitle: 'Fale com a equipe Pad2PS para dúvidas, suporte técnico ou privacidade.',
    name: 'Nome',
    email: 'E-mail',
    subject: 'Assunto',
    message: 'Mensagem',
    submit: 'Enviar mensagem',
    sending: 'Enviando…',
    sent: 'Mensagem enviada. Obrigado por entrar em contato!',
    notConfigured: 'O envio pelo formulário ainda não está configurado. Use o e-mail abaixo.',
    failed: 'Não foi possível enviar agora. Tente novamente ou use o e-mail abaixo.',
    copy: 'Copiar e-mail',
    copied: 'E-mail copiado',
    copyFailed: 'Não foi possível copiar. Selecione e copie o endereço.',
    directEmail: 'Prefere seu aplicativo de e-mail?',
    back: 'Voltar ao Pad2PS',
    community: 'Comunidade',
    repo: 'Repositório',
  },
  en: {
    title: 'Contact & Support',
    subtitle: 'Contact the Pad2PS team for questions, technical support, or privacy requests.',
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    submit: 'Send message',
    sending: 'Sending…',
    sent: 'Message sent. Thanks for getting in touch!',
    notConfigured: 'Form delivery is not configured yet. Please use the email below.',
    failed: 'Could not send your message. Try again or use the email below.',
    copy: 'Copy email',
    copied: 'Email copied',
    copyFailed: 'Could not copy. Select and copy the address.',
    directEmail: 'Prefer your email app?',
    back: 'Back to Pad2PS',
    community: 'Community',
    repo: 'Repository',
  },
} as const;

export function ContactPage({
  lang,
  isApp,
  homeHref,
  onNavigateHome,
}: ContactPageProps) {
  const text = COPY[lang];
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'sent' | 'not-configured' | 'failed'
  >('idle');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>(
    'idle'
  );

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          subject: data.get('subject'),
          message: data.get('message'),
          website: data.get('website'),
        }),
      });

      if (response.status === 503) {
        setStatus('not-configured');
        return;
      }
      if (!response.ok) {
        setStatus('failed');
        return;
      }
      const result = (await response.json()) as {ok?: unknown};
      if (result.ok !== true) {
        setStatus('failed');
        return;
      }
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  const handleExternalLink = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isApp) return;
    event.preventDefault();
    void openExternalUrl(event.currentTarget.href, true);
  };

  return (
    <div className="cyber-grid-bg h-dvh w-full overflow-y-auto flex flex-col text-[#FAFAFA]">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8 flex-1 flex flex-col gap-5">
        <header className="flex items-center justify-between gap-3 border-b accent-border-subtle pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-fuchsia-300">
              Pad2PS
            </p>
            <h1 className="mt-1 text-xl sm:text-2xl font-bold">{text.title}</h1>
          </div>
          <a
            href={homeHref}
            onClick={handleHomeLinkClick}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {text.back}
          </a>
        </header>

        <p className="text-sm leading-relaxed text-zinc-300">{text.subtitle}</p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/10 bg-[#121216]/90 p-4 sm:p-6"
        >
          <div
            aria-hidden="true"
            className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
          >
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <label className="block space-y-1.5 text-xs font-semibold text-zinc-300">
            {text.name}
            <input
              name="name"
              autoComplete="name"
              maxLength={120}
              required
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-fuchsia-300/60"
            />
          </label>

          <label className="block space-y-1.5 text-xs font-semibold text-zinc-300">
            {text.email}
            <input
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-fuchsia-300/60"
            />
          </label>

          <label className="block space-y-1.5 text-xs font-semibold text-zinc-300">
            {text.subject}
            <input
              name="subject"
              maxLength={160}
              required
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-fuchsia-300/60"
            />
          </label>

          <label className="block space-y-1.5 text-xs font-semibold text-zinc-300">
            {text.message}
            <textarea
              name="message"
              rows={6}
              maxLength={5000}
              required
              className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-fuchsia-300/60"
            />
          </label>

          {status !== 'idle' && (
            <p
              role="status"
              className={`text-sm ${
                status === 'sent' ? 'text-emerald-300' : 'text-amber-200'
              }`}
            >
              {status === 'sending' && text.sending}
              {status === 'sent' && text.sent}
              {status === 'not-configured' && text.notConfigured}
              {status === 'failed' && text.failed}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {status === 'sending' ? text.sending : text.submit}
          </button>
        </form>

        <section className="rounded-2xl border border-white/10 bg-[#121216]/90 p-4 sm:p-5">
          <p className="text-xs text-zinc-400">{text.directEmail}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${EMAIL}`}
              onClick={handleExternalLink}
              className="inline-flex items-center gap-2 text-sm font-semibold text-fuchsia-200 underline underline-offset-4"
            >
              <Mail className="h-4 w-4" />
              {EMAIL}
            </a>
            <button
              type="button"
              onClick={() => void copyEmail()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white"
            >
              {copyStatus === 'copied' ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copyStatus === 'copied' ? text.copied : text.copy}
            </button>
          </div>
          {copyStatus === 'failed' && (
            <p role="status" className="mt-2 text-xs text-amber-200">
              {text.copyFailed}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 border-t border-white/10 pt-3 text-xs">
            <a
              href="https://discord.gg/TWfKNvGkcj"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleExternalLink}
              className="text-zinc-300 hover:text-white"
            >
              Discord · {text.community}
            </a>
            <a
              href="https://github.com/RbtSwift/Pad2PS"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleExternalLink}
              className="text-zinc-300 hover:text-white"
            >
              Pad2PS · {text.repo}
            </a>
            <a
              href="https://github.com/RbtSwift/Pad2PS-Launcher"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleExternalLink}
              className="text-zinc-300 hover:text-white"
            >
              Pad2PS Launcher · {text.repo}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
