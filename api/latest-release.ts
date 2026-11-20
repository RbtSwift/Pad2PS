interface ApiRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
}

interface GithubRelease {
  tag_name?: string;
  name?: string | null;
  html_url?: string;
  published_at?: string | null;
  body?: string | null;
  assets?: Array<{
    name?: string;
    browser_download_url?: string;
    size?: number;
  }>;
}

const RELEASE_PROJECTS = {
  'RbtSwift/Pad2PS': {
    api: 'https://api.github.com/repos/RbtSwift/Pad2PS/releases/latest',
    releases: 'https://github.com/RbtSwift/Pad2PS/releases/latest',
  },
  'RbtSwift/Pad2PS-Launcher': {
    api: 'https://api.github.com/repos/RbtSwift/Pad2PS-Launcher/releases/latest',
    releases: 'https://github.com/RbtSwift/Pad2PS-Launcher/releases/latest',
  },
} as const;

type ReleaseRepository = keyof typeof RELEASE_PROJECTS;

function isReleaseRepository(value: string): value is ReleaseRepository {
  return Object.hasOwn(RELEASE_PROJECTS, value);
}

function fallbackRelease(repository: ReleaseRepository) {
  return {
    tag_name: '',
    name: repository === 'RbtSwift/Pad2PS' ? 'Pad2PS' : 'Pad2PS Launcher',
    html_url: RELEASE_PROJECTS[repository].releases,
    published_at: null,
    body: '',
    assets: [],
    isFallback: true,
  };
}

export default async function handler(
  request: ApiRequest,
  response: ApiResponse
): Promise<void> {
  response.setHeader(
    'Cache-Control',
    'public, max-age=0, s-maxage=300, stale-while-revalidate=3600'
  );
  response.setHeader('X-Content-Type-Options', 'nosniff');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).json({error: 'method_not_allowed'});
    return;
  }

  const repository = request.query?.repo;
  if (typeof repository !== 'string' || !isReleaseRepository(repository)) {
    response.status(400).json({error: 'unsupported_repository'});
    return;
  }

  try {
    const releaseResponse = await fetch(RELEASE_PROJECTS[repository].api, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Pad2PS-Official-Site',
      },
    });

    if (!releaseResponse.ok) {
      throw new Error(`GitHub release API returned ${releaseResponse.status}`);
    }

    const release = (await releaseResponse.json()) as GithubRelease;
    const assets = (release.assets ?? [])
      .filter(
        (asset) =>
          typeof asset.name === 'string' &&
          typeof asset.browser_download_url === 'string' &&
          asset.browser_download_url.startsWith(
            `https://github.com/${repository}/releases/download/`
          )
      )
      .map((asset) => ({
        name: asset.name!,
        browser_download_url: asset.browser_download_url!,
        size: Number.isFinite(asset.size) ? asset.size : 0,
      }));

    response.status(200).json({
      tag_name: release.tag_name ?? '',
      name: release.name ?? '',
      html_url:
        release.html_url?.startsWith(
          `https://github.com/${repository}/releases/`
        )
          ? release.html_url
          : RELEASE_PROJECTS[repository].releases,
      published_at: release.published_at ?? null,
      body: release.body ?? '',
      assets,
      isFallback: false,
    });
  } catch {
    response.status(200).json(fallbackRelease(repository));
  }
}
