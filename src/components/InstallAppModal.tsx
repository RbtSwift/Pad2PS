import {
  Activity,
  ArrowDownToLine,
  Check,
  Cpu,
  Disc3,
  Download,
  ExternalLink,
  Gamepad2,
  Image as ImageIcon,
  Layers3,
  LoaderCircle,
  Monitor,
  PanelsTopLeft,
  Sparkles,
  Smartphone,
  X,
  type LucideIcon,
} from 'lucide-react';
import {useEffect, useState} from 'react';
import type {AppLanguage, Translations} from '../data/i18n';
import {fetchLatestRelease, installerType, RELEASE_PROJECTS, type LatestRelease} from '../data/installers';

type Platform = 'linux' | 'windows' | 'android';
type ReleaseProject = (typeof RELEASE_PROJECTS)[number];
interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isApp: boolean;
  lang: AppLanguage;
  t: Translations;
}

const PLATFORM_ICONS: Record<Platform, LucideIcon> = {
  linux: Monitor,
  windows: PanelsTopLeft,
  android: Smartphone,
};

const COPY = {
  pt: {
    intro: 'Do tradutor visual ao seu console de sala: conheça os apps oficiais e escolha o download ideal.',
    recommended: 'RECOMENDADO PARA VOCÊ',
    size: 'Tamanho',
    alternatives: 'Outras opções para',
    noBuild: 'Não há um instalador desta plataforma nesta release.',
    fallback: 'Ver todos os downloads da última versão',
    apiFallback: 'Abrir página oficial da release',
    loading: 'Buscando as versões mais recentes…',
    sofa: 'SEU CONSOLE, NO SOFÁ',
    library: 'Reúne seus jogos em uma só biblioteca',
    gamepad: 'Navegação e controle 100% pelo gamepad',
    covers: 'Capas encontradas automaticamente',
    tester: 'Testador de controle integrado',
    platforms: 'Lojas e emuladores em um só lugar',
    pad2ps: 'Tradutor visual de controles com overlay ao vivo e suíte de diagnóstico.',
    ps1: 'PS1 · DuckStation',
    ps2: 'PS2 · PCSX2',
    downloading: 'Baixar',
    forLinux: 'para Linux',
    forWindows: 'para Windows',
    forAndroid: 'para Android',
    installer: 'Instalador',
    portable: 'Portátil',
    androidApp: 'APK',
    tabLinux: 'Linux',
    tabWindows: 'Windows',
    tabAndroid: 'Android',
    loadingRelease: 'Carregando…',
  },
  en: {
    intro: 'From visual controller translation to your living-room console: explore the official apps and choose a download.',
    recommended: 'RECOMMENDED FOR YOU',
    size: 'File size',
    alternatives: 'More options for',
    noBuild: 'There is no installer for this platform in this release.',
    fallback: 'See all downloads for the latest release',
    apiFallback: 'Open the official release page',
    loading: 'Checking the latest versions…',
    sofa: 'YOUR CONSOLE, FROM THE COUCH',
    library: 'Bring your games into one library',
    gamepad: 'Navigate and play 100% with a gamepad',
    covers: 'Game covers found automatically',
    tester: 'Built-in controller tester',
    platforms: 'Stores and emulators in one place',
    pad2ps: 'Visual controller translator with a live overlay and diagnostic suite.',
    ps1: 'PS1 · DuckStation',
    ps2: 'PS2 · PCSX2',
    downloading: 'Download',
    forLinux: 'for Linux',
    forWindows: 'for Windows',
    forAndroid: 'for Android',
    installer: 'Installer',
    portable: 'Portable',
    androidApp: 'APK',
    tabLinux: 'Linux',
    tabWindows: 'Windows',
    tabAndroid: 'Android',
    loadingRelease: 'Loading…',
  },
} as const;

function detectVisitorPlatform(): Platform {
  const nav = navigator as Navigator & {userAgentData?: {platform?: string}};
  const platform = `${nav.userAgentData?.platform ?? ''} ${navigator.platform ?? ''} ${navigator.userAgent ?? ''}`;
  if (/android/i.test(platform)) return 'android';
  if (/windows/i.test(platform)) return 'windows';
  return 'linux';
}

function platformForType(type: string): Platform | null {
  const normalized = type.toLowerCase();
  if (['.deb', '.rpm', '.appimage', '.flatpak', '.tar.gz'].includes(normalized)) return 'linux';
  if (normalized === 'setup.exe' || normalized === 'portable.exe') return 'windows';
  if (normalized === '.apk') return 'android';
  return null;
}

function installerLabel(type: string, lang: AppLanguage): string {
  const normalized = type.toLowerCase();
  const labels = lang === 'pt'
    ? {
        '.deb': 'Pacote .deb (Zorin OS, Ubuntu, Debian, Mint)',
        '.rpm': 'Pacote .rpm (Fedora, openSUSE)',
        '.appimage': 'AppImage (Portátil Universal)',
        '.flatpak': 'Flatpak',
        '.tar.gz': 'Arquivo .tar.gz',
        'setup.exe': 'Instalador Completo (Setup .exe)',
        'portable.exe': 'Versão Portátil (.exe sem instalação)',
        '.apk': 'Instalador Android (.apk)',
      }
    : {
        '.deb': '.deb package (Zorin OS, Ubuntu, Debian, Mint)',
        '.rpm': '.rpm package (Fedora, openSUSE)',
        '.appimage': 'AppImage (Universal Portable)',
        '.flatpak': 'Flatpak',
        '.tar.gz': '.tar.gz archive',
        'setup.exe': 'Full Installer (Setup .exe)',
        'portable.exe': 'Portable version (.exe, no install)',
        '.apk': 'Android installer (.apk)',
      };
  return labels[normalized as keyof typeof labels] ?? (lang === 'pt' ? 'Instalador' : 'Installer');
}

function formatSize(bytes: number, lang: AppLanguage): string {
  const value = bytes / (1024 * 1024);
  return `${new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {maximumFractionDigits: 1}).format(value)} MB`;
}

function releaseVersion(release: LatestRelease | null | undefined): string {
  if (!release?.tag_name) return '';
  return release.tag_name.startsWith('v') ? release.tag_name : `v${release.tag_name}`;
}

function downloadLabel(platform: Platform, type: string, lang: AppLanguage): string {
  const c = COPY[lang];
  const suffix = type.toLowerCase() === '.deb' ? ' (.deb)'
    : type.toLowerCase() === '.appimage' ? ' (AppImage)'
      : type.toLowerCase() === '.apk' ? ' (.apk)'
        : type.toLowerCase() === 'setup.exe' ? ` (${c.installer})`
          : ` (${installerLabel(type, lang)})`;
  const target = platform === 'linux' ? c.forLinux : platform === 'windows' ? c.forWindows : c.forAndroid;
  return `${c.downloading} ${target}${suffix}`;
}

function recommendedAsset(files: {asset: LatestRelease['assets'][number]; type: string}[], platform: Platform) {
  const priority: Record<Platform, string[]> = {
    linux: ['.deb', '.appimage', '.flatpak', '.rpm', '.tar.gz'],
    windows: ['setup.exe', 'portable.exe'],
    android: ['.apk'],
  };
  return priority[platform].map((type) => files.find((file) => file.type.toLowerCase() === type)).find(Boolean) ?? files[0];
}

function ProjectDownloads({
  project,
  release,
  platform,
  loading,
  lang,
}: {
  project: ReleaseProject;
  release: LatestRelease | null | undefined;
  platform: Platform;
  loading: boolean;
  lang: AppLanguage;
}) {
  const c = COPY[lang];
  const files = release?.assets
    .map((asset) => ({asset, type: installerType(asset.name)}))
    .filter((file): file is {asset: LatestRelease['assets'][number]; type: string} =>
      file.type !== null && platformForType(file.type) === platform
    ) ?? [];
  const primary = recommendedAsset(files, platform);
  const alternatives = files.filter((file) => file !== primary);
  const fallback = release?.html_url ?? project.fallback;

  if (loading && !release) {
    return <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-zinc-400"><LoaderCircle className="h-4 w-4 animate-spin text-fuchsia-300"/>{c.loadingRelease}</div>;
  }

  if (!primary) {
    return <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4"><p className="text-xs text-zinc-300">{release ? c.noBuild : c.apiFallback}</p><a href={fallback} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-fuchsia-300/40 bg-fuchsia-400/10 px-3 py-2 text-xs font-semibold text-fuchsia-100 hover:bg-fuchsia-400/20"><ExternalLink className="h-3.5 w-3.5"/>{c.fallback}</a></div>;
  }

  return <div className="space-y-3">
    <a href={primary.asset.browser_download_url} className="group flex w-full items-center justify-between gap-3 rounded-xl border border-fuchsia-200/70 bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-3.5 text-left text-white shadow-[0_0_28px_rgba(236,72,153,.28)] transition hover:brightness-110 sm:px-5 sm:py-4">
      <span className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/15"><ArrowDownToLine className="h-5 w-5"/></span><span className="min-w-0"><span className="block truncate text-sm font-extrabold sm:text-base">{downloadLabel(platform, primary.type, lang)}</span><span className="mt-0.5 block text-[11px] font-medium text-white/80">{c.recommended} · {formatSize(primary.asset.size, lang)}</span></span></span>
      <ArrowDownToLine className="h-5 w-5 shrink-0 transition-transform group-hover:translate-y-0.5"/>
    </a>

    {alternatives.length > 0 && <div className="space-y-2"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-zinc-500">{c.alternatives} {platform === 'linux' ? 'Linux' : platform === 'windows' ? 'Windows' : 'Android'}</p><div className="grid gap-2 sm:grid-cols-2">{alternatives.map(({asset, type}) => <a key={asset.browser_download_url} href={asset.browser_download_url} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-xs text-zinc-200 transition hover:border-fuchsia-300/40 hover:bg-fuchsia-500/[.07]"><span className="flex min-w-0 items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-300/10 text-fuchsia-200"><DownloadIcon type={type}/></span><span className="min-w-0"><span className="block text-[11px] font-semibold leading-snug">{installerLabel(type, lang)}</span><span className="mt-0.5 block text-[10px] text-zinc-500">{formatSize(asset.size, lang)}</span></span></span><ArrowDownToLine className="h-4 w-4 shrink-0 text-fuchsia-300"/></a>)}</div></div>}
    <a href={fallback} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 transition hover:text-fuchsia-200"><ExternalLink className="h-3 w-3"/>{c.fallback}</a>
  </div>;
}

function DownloadIcon({type}: {type: string}) {
  const normalized = type.toLowerCase();
  if (normalized === '.apk') return <Smartphone className="h-4 w-4"/>;
  if (normalized.includes('exe')) return <PanelsTopLeft className="h-4 w-4"/>;
  if (normalized === '.flatpak') return <Layers3 className="h-4 w-4"/>;
  return <Monitor className="h-4 w-4"/>;
}

function LauncherHighlights({lang}: {lang: AppLanguage}) {
  const c = COPY[lang];
  const stores = [
    {name: 'Steam', icon: Gamepad2},
    {name: 'Heroic', icon: Sparkles},
    {name: 'Lutris', icon: Layers3},
    {name: c.ps1, icon: Disc3},
    {name: c.ps2, icon: Cpu},
  ];
  const features = [
    {title: c.library, icon: Layers3},
    {title: c.gamepad, icon: Gamepad2},
    {title: c.covers, icon: ImageIcon},
    {title: c.tester, icon: Activity},
  ];
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-2">{stores.map(({name, icon: Icon}) => <span key={name} className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-200/15 bg-black/25 px-2.5 py-1.5 text-[10px] font-semibold text-fuchsia-50 sm:text-[11px]"><Icon className="h-3.5 w-3.5 text-pink-300"/>{name}</span>)}</div>
    <div className="grid gap-2 sm:grid-cols-2">{features.map(({title, icon: Icon}) => <div key={title} className="flex items-center gap-2.5 rounded-xl border border-white/[.07] bg-black/20 px-3 py-2.5 text-[11px] font-medium leading-snug text-zinc-200"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-400/10 text-fuchsia-200"><Icon className="h-4 w-4"/></span>{title}</div>)}</div>
  </div>;
}

export function InstallAppModal({isOpen, onClose, isApp, lang, t}: InstallAppModalProps) {
  const [releases, setReleases] = useState<Record<string, LatestRelease | null>>({});
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<Platform>(detectVisitorPlatform);
  const c = COPY[lang];

  useEffect(() => {
    setLoading(true);
    let active = true;
    Promise.all(RELEASE_PROJECTS.map(async (project) => {
      try { return [project.repo, await fetchLatestRelease(project.repo)] as const; }
      catch { return [project.repo, null] as const; }
    })).then((entries) => { if (active) setReleases(Object.fromEntries(entries)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || isApp) return null;

  const platforms: Platform[] = ['linux', 'windows', 'android'];
  const platformNames: Record<Platform, string> = {linux: c.tabLinux, windows: c.tabWindows, android: c.tabAndroid};
  const PlatformIcon = PLATFORM_ICONS[platform];

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-5" role="dialog" aria-modal="true" aria-labelledby="install-app-modal-title" onClick={onClose}>
    <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-fuchsia-300/30 bg-[#0b0a10] shadow-[0_24px_100px_rgba(0,0,0,.78),0_0_50px_rgba(217,70,239,.08)]" onClick={(event) => event.stopPropagation()}>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-fuchsia-300/10 bg-[#100d15] px-4 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-fuchsia-300/25 bg-fuchsia-400/10 text-fuchsia-200 shadow-[0_0_18px_rgba(236,72,153,.16)]"><Download className="h-5 w-5"/></div><div className="min-w-0"><h2 id="install-app-modal-title" className="truncate text-base font-extrabold text-white sm:text-lg">{t.installAppTitle}</h2><p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-400 sm:text-xs">{t.popupInstallDesc}</p></div></div>
        <button type="button" onClick={onClose} aria-label={t.close} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-fuchsia-300/40 hover:bg-fuchsia-400/10 hover:text-white"><X className="h-4 w-4"/></button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-3.5 sm:space-y-5 sm:p-6">
        <p className="text-xs leading-relaxed text-zinc-400 sm:text-sm">{c.intro}</p>
        <div role="tablist" aria-label={lang === 'pt' ? 'Sistema operacional' : 'Operating system'} className="grid grid-cols-3 gap-2 rounded-2xl border border-white/[.07] bg-black/30 p-1.5">
          {platforms.map((item) => { const Icon = PLATFORM_ICONS[item]; const active = platform === item; return <button key={item} type="button" role="tab" aria-selected={active} onClick={() => setPlatform(item)} className={`flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-xs font-bold transition sm:text-sm ${active ? 'bg-gradient-to-r from-fuchsia-500/25 to-pink-500/20 text-white shadow-[0_0_18px_rgba(236,72,153,.1)]' : 'text-zinc-500 hover:bg-white/[.04] hover:text-zinc-200'}`}><Icon className={`h-4 w-4 ${active ? 'text-pink-300' : ''}`}/>{platformNames[item]}{active && <Check className="h-3.5 w-3.5 text-pink-300"/>}</button>; })}
        </div>

        {RELEASE_PROJECTS.map((project) => {
          const release = releases[project.repo];
          const featured = project.id === 'launcher';
          const ProjectIcon = featured ? Gamepad2 : Activity;
          return <section key={project.repo} className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 ${featured ? 'border-fuchsia-300/45 bg-[linear-gradient(125deg,rgba(61,18,61,.78),rgba(18,12,25,.98)_47%,rgba(31,12,24,.9))] shadow-[0_0_35px_rgba(217,70,239,.1)]' : 'border-white/10 bg-[#111016]'}`}>
            {featured && <div className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl"/>}
            <div className="relative grid gap-4 lg:grid-cols-[1.1fr_.9fr] lg:gap-6">
              <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2"><span className={`flex h-10 w-10 items-center justify-center rounded-xl border ${featured ? 'border-pink-200/30 bg-fuchsia-400/15 text-pink-200' : 'border-white/10 bg-white/[.04] text-zinc-300'}`}><ProjectIcon className="h-5 w-5"/></span><div><h3 className="text-base font-extrabold text-white sm:text-lg">{project.name}</h3><p className="text-[10px] uppercase tracking-[.15em] text-zinc-500">{featured ? c.sofa : lang === 'pt' ? 'TRADUTOR VISUAL' : 'LIVE TRANSLATOR'}</p></div><span className="ml-auto rounded-full border border-fuchsia-200/20 bg-black/20 px-2.5 py-1 font-mono text-[10px] font-semibold text-fuchsia-100">{releaseVersion(release) || (loading ? c.loading : 'GitHub Releases')}</span></div>
                <p className="text-xs leading-relaxed text-zinc-300 sm:text-sm">{featured ? (lang === 'pt' ? 'Transforme o PC em uma central de jogos estilo console, perfeita para jogar da cama ou do sofá.' : 'Turn your PC into a console-style game hub, made for playing from your bed or couch.') : c.pad2ps}</p>
                {featured ? <LauncherHighlights lang={lang}/> : <div className="flex flex-wrap gap-2 text-[10px] text-zinc-400"><span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1.5">{lang === 'pt' ? 'Overlay em tempo real' : 'Live overlay'}</span><span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1.5">{lang === 'pt' ? 'Diagnóstico completo' : 'Full diagnostics'}</span><span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1.5">{lang === 'pt' ? 'Ícones PlayStation' : 'PlayStation icons'}</span></div>}
              </div>
              <div className={`rounded-2xl border p-3.5 sm:p-4 ${featured ? 'border-fuchsia-200/15 bg-black/25' : 'border-white/[.07] bg-black/20'}`}>
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-zinc-400"><PlatformIcon className="h-3.5 w-3.5 text-pink-300"/>{platformNames[platform]} · {c.recommended}</div>
                <ProjectDownloads project={project} release={release} platform={platform} loading={loading} lang={lang}/>
              </div>
            </div>
          </section>;
        })}
      </div>
    </div>
  </div>;
}
