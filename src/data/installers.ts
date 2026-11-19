export type InstallerId = "windows" | "linux-deb" | "linux-appimage" | "android";
export interface InstallerPackage { id: InstallerId; osGroup: "windows" | "linux" | "android"; url: string; filename: string; extension: string; }
export const INSTALLER_PACKAGES: InstallerPackage[] = [
  { id: "windows", osGroup: "windows", url: "https://github.com/RbtSwift/Pad2PS/releases/latest/download/Pad2PS-1.0.4-Setup.exe", filename: "Pad2PS-1.0.4-Setup.exe", extension: ".exe" },
  { id: "linux-deb", osGroup: "linux", url: "https://github.com/RbtSwift/Pad2PS/releases/latest/download/Pad2PS-1.0.4-amd64.deb", filename: "Pad2PS-1.0.4-amd64.deb", extension: ".deb" },
  { id: "linux-appimage", osGroup: "linux", url: "https://github.com/RbtSwift/Pad2PS/releases/latest/download/Pad2PS-1.0.4-x86_64.AppImage", filename: "Pad2PS-1.0.4-x86_64.AppImage", extension: ".AppImage" },
  { id: "android", osGroup: "android", url: "https://github.com/RbtSwift/Pad2PS/releases/latest/download/Pad2PS-1.0.4-Android.apk", filename: "Pad2PS-1.0.4-Android.apk", extension: ".apk" }
];