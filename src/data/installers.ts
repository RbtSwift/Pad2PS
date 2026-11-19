export const RELEASE_PROJECTS = [
  {
    repo: 'RbtSwift/Pad2PS',
    name: 'Pad2PS Oficial',
    description: 'Tradutor visual, overlay em tempo real e suíte de diagnóstico.',
    fallback: 'https://github.com/RbtSwift/Pad2PS/releases/latest',
  },
  {
    repo: 'RbtSwift/Pad2PS-Launcher',
    name: 'Pad2PS-Launcher',
    description: 'Central de jogos estilo console controlada 100% pelo gamepad.',
    fallback: 'https://github.com/RbtSwift/Pad2PS-Launcher/releases/latest',
  },
] as const;

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

export interface LatestRelease {
  tag_name: string;
  html_url: string;
  assets: ReleaseAsset[];
}

export async function fetchLatestRelease(repo: string): Promise<LatestRelease> {
  const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
    headers: {Accept: 'application/vnd.github+json'},
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`GitHub release API returned ${response.status}`);
  return response.json() as Promise<LatestRelease>;
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
