import {useEffect, useState} from 'react';

export type VisitorOS = 'windows' | 'linux' | 'android' | 'other';

interface TauriV1Global {
  shell?: {
    open?: (path: string) => Promise<void>;
  };
}

interface TauriV2Internals {
  invoke?: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
}

const DISPLAY_MODES = [
  '(display-mode: standalone)',
  '(display-mode: minimal-ui)',
  '(display-mode: window-controls-overlay)',
] as const;

export function detectIsInstalledApp(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 1. Display mode media queries (MSIX on Windows, APK/TWA/PWA on Android)
  for (const query of DISPLAY_MODES) {
    try {
      if (window.matchMedia(query).matches) {
        return true;
      }
    } catch {
      // Ignore unsupported media queries
    }
  }

  // 2. Safari / iOS standalone mode
  if ((window.navigator as unknown as {standalone?: boolean}).standalone === true) {
    return true;
  }

  // 3. Desktop wrappers (Tauri / Pake on Linux or Windows)
  if ('__TAURI__' in window || '__TAURI_INTERNALS__' in window) {
    return true;
  }

  // 4. Explicit URL query flags (?mode=app or ?app=1)
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'app' || params.get('app') === '1') {
      return true;
    }
  } catch {
    // Ignore malformed search params
  }

  return false;
}

export function useIsInstalledApp(): boolean {
  const [isApp, setIsApp] = useState<boolean>(detectIsInstalledApp);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const syncState = () => {
      setIsApp(detectIsInstalledApp());
    };

    syncState();

    const mediaQueries: MediaQueryList[] = [];
    for (const query of DISPLAY_MODES) {
      try {
        const mql = window.matchMedia(query);
        mql.addEventListener?.('change', syncState);
        mediaQueries.push(mql);
      } catch {
        // Ignore unsupported queries
      }
    }

    window.addEventListener('appinstalled', syncState);

    return () => {
      for (const mql of mediaQueries) {
        mql.removeEventListener?.('change', syncState);
      }
      window.removeEventListener('appinstalled', syncState);
    };
  }, []);

  return isApp;
}

export function detectVisitorOS(): VisitorOS {
  if (typeof window === 'undefined') {
    return 'other';
  }
  const ua = (window.navigator.userAgent || '').toLowerCase();
  const platform = (window.navigator.platform || '').toLowerCase();

  // Check Android before Linux because Android user agents often include "Linux"
  if (ua.includes('android')) {
    return 'android';
  }
  if (ua.includes('win') || platform.includes('win')) {
    return 'windows';
  }
  if (
    (ua.includes('linux') || platform.includes('linux') || ua.includes('x11')) &&
    !ua.includes('cros')
  ) {
    return 'linux';
  }
  return 'other';
}

export async function openExternalUrl(url: string, isApp: boolean): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  if (isApp) {
    const win = window as Window & {
      __TAURI__?: TauriV1Global;
      __TAURI_INTERNALS__?: TauriV2Internals;
    };

    if (typeof win.__TAURI__?.shell?.open === 'function') {
      try {
        await win.__TAURI__.shell.open(url);
        return;
      } catch {
        // Fallback to window.open below
      }
    }

    if (typeof win.__TAURI_INTERNALS__?.invoke === 'function') {
      try {
        await win.__TAURI_INTERNALS__.invoke('plugin:opener|open_url', {url});
        return;
      } catch {
        try {
          await win.__TAURI_INTERNALS__.invoke('plugin:shell|open', {path: url});
          return;
        } catch {
          // Fallback to window.open below
        }
      }
    }
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
