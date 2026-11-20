export const RELEASE_PROJECTS = [
  {
    id: 'launcher',
    repo: 'RbtSwift/Pad2PS-Launcher',
    name: 'Pad2PS-Launcher',
    description: 'Uma central de jogos estilo console para jogar da cama ou do sofá, controlada 100% pelo gamepad.',
    fallback: 'https://github.com/RbtSwift/Pad2PS-Launcher/releases/latest',
  },
  {
    id: 'pad2ps',
    repo: 'RbtSwift/Pad2PS',
    name: 'Pad2PS Oficial',
    description: 'Tradutor visual, overlay em tempo real e suíte de diagnóstico.',
    fallback: 'https://github.com/RbtSwift/Pad2PS/releases/latest',
  },
] as const;

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

export interface LatestRelease {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string | null;
  body: string;
  assets: ReleaseAsset[];
  isFallback?: boolean;
}

export async function fetchLatestRelease(repo: string): Promise<LatestRelease> {
  const project = RELEASE_PROJECTS.find((item) => item.repo === repo);
  if (!project) {
    throw new Error(`Unsupported release repository: ${repo}`);
  }

  try {
    const response = await fetch(
      `/api/latest-release?${new URLSearchParams({repo})}`,
      {cache: 'no-store'}
    );
    if (!response.ok) {
      throw new Error(`Latest release endpoint returned ${response.status}`);
    }
    return (await response.json()) as LatestRelease;
  } catch {
    return {
      tag_name: '',
      name: project.name,
      html_url: project.fallback,
      published_at: null,
      body: '',
      assets: [],
      isFallback: true,
    };
  }
}

export function installerType(filename: string): string | null {
  const name = filename.toLowerCase();
  if (name.endsWith('.deb')) return '.deb';
  if (name.endsWith('.rpm')) return '.rpm';
  if (name.endsWith('.appimage')) return '.AppImage';
  if (name.endsWith('.flatpak')) return '.flatpak';
  if (name.endsWith('.tar.gz')) return '.tar.gz';
  if (name.endsWith('setup.exe')) return 'Setup.exe';
  if (name.endsWith('portable.exe')) return 'Portable.exe';
  if (name.endsWith('.apk')) return '.apk';
  return null;
}
