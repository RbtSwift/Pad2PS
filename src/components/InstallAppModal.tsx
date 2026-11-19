import {Download, ExternalLink, LoaderCircle, Package, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import type {Translations} from '../data/i18n';
import {fetchLatestRelease, installerType, RELEASE_PROJECTS, type LatestRelease} from '../data/installers';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isApp: boolean;
  t: Translations;
}

export function InstallAppModal({isOpen, onClose, isApp, t}: InstallAppModalProps) {
  const [releases, setReleases] = useState<Record<string, LatestRelease | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all(RELEASE_PROJECTS.map(async (project) => {
      try {
        return [project.repo, await fetchLatestRelease(project.repo)] as const;
      } catch {
        return [project.repo, null] as const;
      }
    })).then((entries) => setReleases(Object.fromEntries(entries)))
      .finally(() => setLoading(false));
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || isApp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="install-app-modal-title" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl bg-[#121216] border flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden" style={{borderColor: 'rgba(var(--accent-rgb), 0.38)'}} onClick={(event) => event.stopPropagation()}>
        <div className="px-5 py-4 border-b flex items-center justify-between gap-3 shrink-0" style={{borderColor: 'rgba(var(--accent-rgb), 0.16)'}}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{backgroundColor: 'rgba(var(--accent-rgb), 0.16)', border: '1px solid rgba(var(--accent-rgb), 0.38)', color: 'var(--accent-color)'}}><Download className="w-4 h-4" /></div>
            <div className="min-w-0"><h2 id="install-app-modal-title" className="font-display text-base font-bold text-[#FAFAFA]">{t.installAppTitle}</h2><p className="text-xs text-[#A1A1AA]">{t.popupInstallDesc}</p></div>
          </div>
          <button type="button" onClick={onClose} aria-label={t.close} className="w-8 h-8 rounded-lg border text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center justify-center cursor-pointer" style={{borderColor: 'rgba(var(--accent-rgb), 0.24)'}}><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="rounded-xl border p-3 text-sm text-[#D4D4D8]" style={{borderColor: 'rgba(var(--accent-rgb), 0.2)', backgroundColor: 'rgba(var(--accent-rgb), 0.06)'}}>
            O app web Pad2PS continua disponível normalmente. Escolha abaixo um dos aplicativos nativos do ecossistema.
          </div>
          {RELEASE_PROJECTS.map((project) => {
            const release = releases[project.repo];
            const assets = release?.assets.map((asset) => ({asset, type: installerType(asset.name)})).filter((item): item is {asset: LatestRelease['assets'][number]; type: string} => item.type !== null) ?? [];
            return <section key={project.repo} className="rounded-2xl border p-4 space-y-3" style={{borderColor: 'rgba(var(--accent-rgb), 0.24)', backgroundColor: '#09090B'}}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><h3 className="text-sm font-bold text-white">{project.name}</h3><p className="mt-1 text-xs text-[#A1A1AA]">{project.description}</p></div>
                <span className="font-mono text-xs px-2 py-1 rounded-md text-[#FAFAFA]" style={{backgroundColor: 'rgba(var(--accent-rgb), 0.15)', color: 'var(--accent-color)'}}>{release?.tag_name ?? (loading ? '…' : 'Release')}</span>
              </div>
              {loading && !release ? <p className="flex items-center gap-2 text-xs text-[#A1A1AA]"><LoaderCircle className="w-4 h-4 animate-spin" />Carregando downloads…</p> : assets.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{assets.map(({asset, type}) => <a key={asset.name} href={asset.browser_download_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-xs text-[#E4E4E7] hover:bg-white/[0.06] hover:text-white" style={{borderColor: 'rgba(var(--accent-rgb), 0.18)'}}><span className="flex items-center gap-2 min-w-0"><Package className="w-4 h-4 shrink-0" style={{color: 'var(--accent-color)'}}/><span className="truncate">{asset.name}</span></span><span className="font-mono text-[10px] shrink-0 text-[#A1A1AA]">{type}</span></a>)}</div> : <a href={release?.html_url ?? project.fallback} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{backgroundColor: 'rgba(var(--accent-rgb), 0.2)', border: '1px solid rgba(var(--accent-rgb), 0.4)'}}><ExternalLink className="w-4 h-4" />Abrir página de downloads da última versão</a>}
              {!loading && !release && <a href={project.fallback} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs text-[#A1A1AA] hover:text-white"><ExternalLink className="w-3.5 h-3.5"/>A API não respondeu? Baixe pela página oficial da release.</a>}
            </section>;
          })}
        </div>
      </div>
    </div>
  );
}
