export type InstallerId = 'windows' | 'linux-deb' | 'linux-appimage' | 'android';

export interface InstallerPackage {
  id: InstallerId;
  osGroup: 'windows' | 'linux' | 'android';
  url: string;
  filename: string;
  extension: string;
}

export const INSTALLER_PACKAGES: InstallerPackage[] = [
  {
    id: 'windows',
    osGroup: 'windows',
    url: 'https://pub-183531f333ae48db9963d1abee49643b.r2.dev/Pad2PS.msix',
    filename: 'Pad2PS.msix',
    extension: '.msix',
  },
  {
    id: 'linux-deb',
    osGroup: 'linux',
    url: 'https://pub-183531f333ae48db9963d1abee49643b.r2.dev/Pad2PS.deb',
    filename: 'Pad2PS.deb',
    extension: '.deb',
  },
  {
    id: 'linux-appimage',
    osGroup: 'linux',
    url: 'https://pub-183531f333ae48db9963d1abee49643b.r2.dev/Pad2PS.AppImage',
    filename: 'Pad2PS.AppImage',
    extension: '.AppImage',
  },
  {
    id: 'android',
    osGroup: 'android',
    url: 'https://pub-183531f333ae48db9963d1abee49643b.r2.dev/Pad2PS.apk',
    filename: 'Pad2PS.apk',
    extension: '.apk',
  },
];
