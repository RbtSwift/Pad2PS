const { app, BrowserWindow, ipcMain } = require('electron');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

let mainWindow = null;
let pipWin = null;
let normalBounds = { width: 1240, height: 840 };

function execCmd(cmd, args, timeout = 2500) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout }, (err, stdout) => {
      if (err) return resolve('');
      resolve(stdout || '');
    });
  });
}

async function getLinuxBatteryDevices() {
  const devices = [];
  const seen = new Set();

  // 1. /sys/class/power_supply
  const psRoot = '/sys/class/power_supply';
  try {
    if (fs.existsSync(psRoot)) {
      const entries = fs.readdirSync(psRoot);
      for (const name of entries) {
        try {
          const dir = path.join(psRoot, name);
          const capPath = path.join(dir, 'capacity');
          if (!fs.existsSync(capPath)) continue;

          const scopePath = path.join(dir, 'scope');
          const scope = fs.existsSync(scopePath)
            ? fs.readFileSync(scopePath, 'utf-8').trim().toLowerCase()
            : '';
          const lower = name.toLowerCase();

          const isController =
            lower.includes('sony_controller') ||
            lower.includes('ps-controller') ||
            lower.includes('xbox') ||
            lower.includes('xpad') ||
            lower.includes('nintendo') ||
            lower.includes('switch') ||
            lower.includes('8bitdo') ||
            lower.includes('gamesir');

          if ((scope === 'system' || /^(bat|ac|acad|usb)/.test(lower)) && !isController) {
            continue;
          }

          const percentage = parseInt(fs.readFileSync(capPath, 'utf-8').trim(), 10);
          if (Number.isNaN(percentage)) continue;

          const statusPath = path.join(dir, 'status');
          const status = fs.existsSync(statusPath)
            ? fs.readFileSync(statusPath, 'utf-8').trim().toLowerCase()
            : '';

          const modelPath = path.join(dir, 'model_name');
          let model = fs.existsSync(modelPath)
            ? fs.readFileSync(modelPath, 'utf-8').trim()
            : name;

          if (lower.includes('sony_controller') || lower.includes('ps-controller')) {
            model = 'Controle PlayStation';
          } else if (lower.includes('xbox') || lower.includes('xpad')) {
            model = 'Controle Xbox';
          } else if (lower.includes('nintendo') || lower.includes('switch')) {
            model = 'Controle Nintendo';
          }

          const key = model.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            devices.push({
              name: model,
              percentage: Math.max(0, Math.min(100, percentage)),
              charging: status === 'charging',
            });
          }
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // ignore
  }

  // 2. upower -d
  const upowerOut = await execCmd('upower', ['-d']);
  if (upowerOut) {
    const blocks = upowerOut.split('Device: ');
    for (let i = 1; i < blocks.length; i++) {
      const lines = blocks[i].split('\n').map((l) => l.trim()).filter(Boolean);
      const header = (lines[0] || '').toLowerCase();
      if (header.includes('line_power') || header.includes('battery_bat') || header.includes('displaydevice')) {
        continue;
      }
      let model = '';
      let percentage = null;
      let charging = false;
      for (const line of lines.slice(1)) {
        if (line.startsWith('model:')) model = line.slice(6).trim();
        else if (line.startsWith('percentage:')) {
          const val = parseInt(line.slice(11).trim().replace('%', ''), 10);
          if (!Number.isNaN(val)) percentage = val;
        } else if (line.startsWith('state:')) {
          const st = line.slice(6).toLowerCase();
          charging = st.includes('charging') && !st.includes('discharging');
        }
      }
      if (percentage === null) continue;
      const combined = `${header} ${model}`.toLowerCase();
      if (
        combined.includes('gaming') ||
        combined.includes('joystick') ||
        combined.includes('controller') ||
        combined.includes('dualsense') ||
        combined.includes('dualshock') ||
        combined.includes('xbox') ||
        combined.includes('nintendo') ||
        combined.includes('8bitdo')
      ) {
        const cleanName = model || 'Controle Bluetooth';
        const key = cleanName.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          devices.push({
            name: cleanName,
            percentage: Math.max(0, Math.min(100, percentage)),
            charging,
          });
        }
      }
    }
  }

  return devices;
}

async function getWindowsBatteryDevices() {
  const psScript = `
    $out = @()
    try {
      $bt = Get-PnpDevice -Class Bluetooth -Status OK -ErrorAction SilentlyContinue | Where-Object { $_.FriendlyName -match 'Controller|Xbox|DualSense|DualShock|Gamepad|Switch' }
      foreach ($d in $bt) {
        $prop = Get-PnpDeviceProperty -InstanceId $d.InstanceId -KeyName '{104EA319-6EE2-4701-BD47-8DDBF425BBE5} 2' -ErrorAction SilentlyContinue
        if ($prop -and $prop.Data -ne $null) {
          $out += [PSCustomObject]@{ name = $d.FriendlyName; percentage = [int]$prop.Data; charging = $false }
        }
      }
    } catch {}
    $out | ConvertTo-Json -Compress
  `;
  const raw = await execCmd('powershell', ['-NoProfile', '-NonInteractive', '-Command', psScript], 3000);
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw.trim());
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    return arr.filter((x) => x && typeof x.percentage === 'number');
  } catch {
    return [];
  }
}

ipcMain.handle('pad2ps:get-battery-devices', async () => {
  if (process.platform === 'linux') {
    return getLinuxBatteryDevices();
  }
  if (process.platform === 'win32') {
    return getWindowsBatteryDevices();
  }
  return [];
});

ipcMain.handle('pad2ps:set-always-on-top', (_ev, enabled) => {
  if (!mainWindow) return false;
  mainWindow.setAlwaysOnTop(Boolean(enabled), 'screen-saver');
  return true;
});

ipcMain.handle('pad2ps:set-pip-mode', (_ev, enabled) => {
  if (Boolean(enabled)) {
    if (pipWin && !pipWin.isDestroyed()) { pipWin.focus(); return true; }
    pipWin = new BrowserWindow({
      title: 'Pad2PS — PiP',
      width: 430,
      height: 280,
      minWidth: 280,
      minHeight: 190,
      alwaysOnTop: true,
      autoHideMenuBar: true,
      backgroundColor: '#09090B',
      icon: path.join(__dirname, 'icon.png'),
      webPreferences: { preload: path.join(__dirname, 'electron-preload.cjs'), contextIsolation: true, nodeIntegration: false }
    });
    pipWin.setAlwaysOnTop(true, 'screen-saver');
    pipWin.loadFile(path.join(__dirname, 'dist', 'index.html'), { query: { pip: '1' } });
    pipWin.on('closed', () => { pipWin = null; });
  } else if (pipWin && !pipWin.isDestroyed()) {
    pipWin.close();
    pipWin = null;
  }
  return true;
});

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Pad2PS',
    width: 1240,
    height: 840,
    minWidth: 320,
    minHeight: 220,
    autoHideMenuBar: true,
    backgroundColor: '#09090D',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ frameName }) => {
    if (frameName === 'pad2ps-pip') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          title: 'Pad2PS PiP',
          width: 440,
          height: 290,
          alwaysOnTop: true,
          autoHideMenuBar: true,
          backgroundColor: '#09090D',
          icon: path.join(__dirname, 'icon.png'),
        },
      };
    }
    return { action: 'allow' };
  });
  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
