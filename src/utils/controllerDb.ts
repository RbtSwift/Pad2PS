export type ControllerFamily = 'playstation' | 'xbox' | 'nintendo' | 'generic';
export type SuggestedLayout = 'ps2' | 'xbox' | 'switch';

export interface ControllerIdentity {
  name: string;
  family: ControllerFamily;
  suggestedLayout: SuggestedLayout;
}

const DB_CACHE_KEY = 'pad2ps:sdl-controller-db:v1';
const DB_URL = 'https://raw.githubusercontent.com/mdqinc/SDL_GameControllerDB/master/gamecontrollerdb.txt';
let dbPromise: Promise<string> | null = null;

function familyFor(name: string, vendor?: string): ControllerFamily {
  const value = name.toLowerCase();
  if (/sony|playstation|dualsense|dualshock/.test(value) || vendor === '054c') return 'playstation';
  if (/xbox|microsoft/.test(value) || vendor === '045e') return 'xbox';
  if (/nintendo|switch|joy.con/.test(value) || vendor === '057e') return 'nintendo';
  return 'generic';
}

function identity(name: string, vendor?: string): ControllerIdentity {
  const family = familyFor(name, vendor);
  return {name, family, suggestedLayout: family === 'xbox' ? 'xbox' : family === 'nintendo' ? 'switch' : 'ps2'};
}

function readCached(): string {
  try { return localStorage.getItem(DB_CACHE_KEY) || ''; } catch { return ''; }
}

async function getDatabase(): Promise<string> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const cached = readCached();
      if (cached) {
        void fetch(DB_URL, {cache: 'no-store'}).then((r) => r.ok ? r.text() : '').then((text) => {
          if (text.length > 1000) { try { localStorage.setItem(DB_CACHE_KEY, text); } catch { /* storage is optional */ } }
        }).catch(() => {});
        return cached;
      }
      try {
        const response = await fetch('/gamecontrollerdb.txt');
        if (response.ok) {
          const bundled = await response.text();
          try { localStorage.setItem(DB_CACHE_KEY, bundled); } catch { /* storage is optional */ }
          void fetch(DB_URL, {cache: 'no-store'}).then((r) => r.ok ? r.text() : '').then((text) => {
            if (text.length > 1000) { try { localStorage.setItem(DB_CACHE_KEY, text); } catch { /* storage is optional */ } }
          }).catch(() => {});
          return bundled;
        }
      } catch { /* bundled offline copy is best effort */ }
      return '';
    })();
  }
  return dbPromise;
}

function hardwareIds(id: string): {vendor?: string; product?: string} {
  const vendorMatch = id.match(/Vendor:\s*([0-9a-f]{4}).*Product:\s*([0-9a-f]{4})/i);
  if (vendorMatch) return {vendor: vendorMatch[1].toLowerCase(), product: vendorMatch[2].toLowerCase()};
  const dash = id.match(/\b([0-9a-f]{4})-([0-9a-f]{4})-/i);
  return dash ? {vendor: dash[1].toLowerCase(), product: dash[2].toLowerCase()} : {};
}

function reverseBytes(hex: string): string { return `${hex.slice(2)}${hex.slice(0, 2)}`; }

export async function identifyController(rawId: string | null): Promise<ControllerIdentity | null> {
  if (!rawId) return null;
  const ids = hardwareIds(rawId);
  const db = await getDatabase();
  if (ids.vendor && ids.product && db) {
    const vendorForms = [ids.vendor, reverseBytes(ids.vendor)];
    const productForms = [ids.product, reverseBytes(ids.product)];
    for (const line of db.split(/\r?\n/)) {
      const match = line.match(/^([0-9a-f]{32}),([^,]+),/i);
      if (!match) continue;
      const guid = match[1].toLowerCase();
      const guidVendor = guid.slice(8, 12);
      const guidProduct = guid.slice(12, 16);
      if (vendorForms.includes(guidVendor) && productForms.includes(guidProduct)) {
        return identity(match[2].trim(), ids.vendor);
      }
    }
  }
  const normalized = rawId.replace(/\s*\(.*?\)\s*/g, ' ').trim();
  return identity(normalized || 'Gamepad', ids.vendor);
}
