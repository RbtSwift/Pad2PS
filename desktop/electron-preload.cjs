const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pad2psDesktop', {
  getBatteryDevices: () => ipcRenderer.invoke('pad2ps:get-battery-devices'),
  setAlwaysOnTop: (enabled) => ipcRenderer.invoke('pad2ps:set-always-on-top', Boolean(enabled)),
  setPiPMode: (enabled) => ipcRenderer.invoke('pad2ps:set-pip-mode', Boolean(enabled)),
});
