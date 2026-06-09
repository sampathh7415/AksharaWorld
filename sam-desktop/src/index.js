/**
 * sam-desktop/src/index.js — Electron main process for Sam Desktop.
 *
 * Features:
 *   - Always-on-top toggle
 *   - Push-to-talk (Ctrl+Space global shortcut)
 *   - Voice activity indicator via IPC
 *   - Tool execution visualizer
 *   - Emergency kill switch
 *   - System tray integration
 *   - Settings panel (Ollama endpoint, approval defaults)
 *   - Communicates with Sam daemon at :8765 via HTTP/WebSocket
 */

'use strict';

const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  Tray,
  Menu,
  nativeImage,
  dialog,
  shell,
} = require('electron');
const path = require('node:path');
const http = require('node:http');

// ── Handle electron-squirrel-startup ─────────────────────────────────────────
if (require('electron-squirrel-startup')) {
  app.quit();
}

// ── Config ────────────────────────────────────────────────────────────────────
const SAM_URL = process.env.SAM_URL || 'http://localhost:8765';
const SAM_SECRET = process.env.SAM_DASHBOARD_SECRET || '';

let mainWindow = null;
let tray = null;
let alwaysOnTop = false;
let isListening = false;

// ── API helper ────────────────────────────────────────────────────────────────
async function samApi(path, method = 'GET', body = null) {
  const url = new URL(path, SAM_URL);
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(SAM_SECRET ? { Authorization: `Bearer ${SAM_SECRET}` } : {}),
    },
  };
  if (body) opts.body = JSON.stringify(body);

  try {
    const { default: fetch } = await import('node-fetch');
    const res = await fetch(url.toString(), opts);
    return res.json();
  } catch (err) {
    return { error: err.message };
  }
}

// ── Window creation ───────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 640,
    minHeight: 480,
    frame: true,
    transparent: false,
    backgroundColor: '#020812',
    title: 'Sam — AI Agent',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    alwaysOnTop: alwaysOnTop,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Load the Sam dashboard served by the daemon
  mainWindow.loadURL(`${SAM_URL}/`).catch(() => {
    // Daemon not running — load bundled fallback
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Forward status updates to renderer
  startStatusPolling();
}

// ── System tray ───────────────────────────────────────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  try {
    const icon = nativeImage.createFromPath(iconPath).resize({ width: 16 });
    tray = new Tray(icon);
  } catch {
    tray = new Tray(nativeImage.createEmpty());
  }

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Sam', click: () => mainWindow?.show() },
    { label: 'Always on Top', type: 'checkbox', checked: alwaysOnTop,
      click: (menuItem) => {
        alwaysOnTop = menuItem.checked;
        mainWindow?.setAlwaysOnTop(alwaysOnTop);
      }
    },
    { type: 'separator' },
    { label: 'Open Dashboard in Browser',
      click: () => shell.openExternal(`${SAM_URL}/`) },
    { type: 'separator' },
    { label: 'Emergency Shutdown',
      click: async () => {
        const { response } = await dialog.showMessageBox({
          type: 'warning', title: 'Emergency Shutdown',
          message: 'Stop all Sam actions?',
          buttons: ['Cancel', 'SHUTDOWN'],
        });
        if (response === 1) {
          await samApi('/api/shutdown', 'POST');
          mainWindow?.webContents.send('sam:notification', '🛑 Emergency shutdown activated.');
        }
      }
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setToolTip('Sam — AI Agent');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow?.show());
}

// ── Status polling ────────────────────────────────────────────────────────────
let statusInterval = null;

function startStatusPolling() {
  statusInterval = setInterval(async () => {
    if (!mainWindow) return;
    const status = await samApi('/api/status');
    if (status && !status.error) {
      mainWindow.webContents.send('sam:status-update', status);
    }
  }, 5000);
}

// ── Global shortcuts ──────────────────────────────────────────────────────────
function registerShortcuts() {
  // Ctrl+Space = push to talk
  globalShortcut.register('Control+Space', () => {
    if (!mainWindow) return;
    if (!isListening) {
      isListening = true;
      mainWindow.webContents.send('sam:voice-listening', true);
    } else {
      isListening = false;
      mainWindow.webContents.send('sam:voice-done', true);
    }
  });

  // Ctrl+Shift+K = emergency kill
  globalShortcut.register('Control+Shift+K', async () => {
    await samApi('/api/shutdown', 'POST');
    mainWindow?.webContents.send('sam:notification', '🛑 Emergency shutdown via hotkey.');
  });
}

// ── IPC handlers ──────────────────────────────────────────────────────────────
function setupIPC() {
  // Send chat message to Sam daemon
  ipcMain.on('sam:send-message', async (event, { message, sessionId }) => {
    const result = await samApi('/api/command', 'POST', { message, session_id: sessionId });
    event.reply('sam:response-done', result?.response || result?.error || 'No response');
  });

  // Toggle always-on-top
  ipcMain.on('sam:set-always-on-top', (event, { enabled }) => {
    alwaysOnTop = enabled;
    mainWindow?.setAlwaysOnTop(enabled);
  });

  // Kill switch
  ipcMain.on('sam:kill-switch', async () => {
    await samApi('/api/shutdown', 'POST');
    mainWindow?.webContents.send('sam:notification', '🛑 Emergency shutdown activated.');
  });

  // Unlock
  ipcMain.on('sam:unlock', async (event, { code }) => {
    const result = await samApi('/api/unlock', 'POST', { code });
    mainWindow?.webContents.send('sam:notification',
      result?.status === 'unlocked' ? '🔓 Session unlocked!' : '❌ Invalid code.'
    );
  });

  // Settings save — stores in electron-store or local file
  ipcMain.on('sam:settings-save', (event, settings) => {
    // In production, use electron-store for persistence
    console.log('[Main] Settings saved:', settings);
  });
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerShortcuts();
  setupIPC();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (statusInterval) clearInterval(statusInterval);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep tray alive instead of quitting
    // app.quit();
  }
});
