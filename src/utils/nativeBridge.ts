export interface BatteryDeviceInfo {
  name: string;
  percentage: number;
  charging: boolean;
  source: 'electron' | 'android' | 'web';
}

interface ElectronDesktopApi {
  getBatteryDevices?: () => Promise<Array<{ name: string; percentage: number; charging: boolean }>>;
  setAlwaysOnTop?: (enabled: boolean) => Promise<boolean>;
  setPiPMode?: (enabled: boolean) => Promise<boolean>;
}

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: {
    Pad2PSNative?: {
      getGamepadBattery?: () => Promise<{
        devices?: Array<{ name: string; percentage: number; charging: boolean }>;
      }>;
    };
  };
}

export function isElectronDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as unknown as { pad2psDesktop?: ElectronDesktopApi }).pad2psDesktop);
}

export function isAndroidCapacitor(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  return Boolean(cap?.isNativePlatform?.() && cap?.getPlatform?.() === 'android');
}

export async function setNativePiPAlwaysOnTop(enabled: boolean): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const desktop = (window as unknown as { pad2psDesktop?: ElectronDesktopApi }).pad2psDesktop;
  if (!desktop) return false;
  try {
    if (desktop.setPiPMode) {
      return await desktop.setPiPMode(enabled);
    }
    if (desktop.setAlwaysOnTop) {
      return await desktop.setAlwaysOnTop(enabled);
    }
  } catch {
    // ignore
  }
  return false;
}

export async function fetchControllerBatteries(): Promise<BatteryDeviceInfo[]> {
  if (typeof window === 'undefined') return [];

  // 1. Electron Desktop (Linux /sys/class/power_supply + upower ou Windows HID)
  const desktop = (window as unknown as { pad2psDesktop?: ElectronDesktopApi }).pad2psDesktop;
  if (desktop?.getBatteryDevices) {
    try {
      const list = await desktop.getBatteryDevices();
      if (Array.isArray(list) && list.length > 0) {
        return list.map((d) => ({
          name: d.name,
          percentage: Math.max(0, Math.min(100, Math.round(d.percentage))),
          charging: Boolean(d.charging),
          source: 'electron',
        }));
      }
    } catch {
      // ignore
    }
  }

  // 2. Android Capacitor (InputDevice.getBatteryState + BatteryManager)
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  const nativePlugin = cap?.Plugins?.Pad2PSNative;
  if (isAndroidCapacitor() && nativePlugin?.getGamepadBattery) {
    try {
      const res = await nativePlugin.getGamepadBattery();
      if (Array.isArray(res?.devices) && res.devices.length > 0) {
        return res.devices.map((d) => ({
          name: d.name,
          percentage: Math.max(0, Math.min(100, Math.round(d.percentage))),
          charging: Boolean(d.charging),
          source: 'android',
        }));
      }
    } catch {
      // ignore
    }
  }

  // 3. Web Battery API fallback (notebooks / dispositivos móveis no navegador)
  const nav = navigator as unknown as {
    getBattery?: () => Promise<{ level: number; charging: boolean }>;
  };
  if (typeof nav.getBattery === 'function') {
    try {
      const bat = await nav.getBattery();
      return [
        {
          name: 'Dispositivo',
          percentage: Math.round(bat.level * 100),
          charging: Boolean(bat.charging),
          source: 'web',
        },
      ];
    } catch {
      // ignore
    }
  }

  return [];
}
