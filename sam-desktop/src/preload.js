/**
 * sam-desktop/src/preload.js — Secure IPC bridge.
 *
 * Exposes a minimal, typed API to the renderer via contextBridge.
 * Only explicitly whitelisted channels are exposed — no `ipcRenderer.send`
 * or `require` access in the renderer process.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Channels the renderer can SEND to main
const SEND_CHANNELS = [
  'sam:send-message',
  'sam:voice-start',
  'sam:voice-stop',
  'sam:kill-switch',
  'sam:unlock',
  'sam:set-always-on-top',
  'sam:settings-save',
];

// Channels the renderer can RECEIVE from main
const RECEIVE_CHANNELS = [
  'sam:response-token',
  'sam:response-done',
  'sam:response-error',
  'sam:voice-transcript',
  'sam:voice-listening',
  'sam:voice-done',
  'sam:tool-start',
  'sam:tool-end',
  'sam:approval-request',
  'sam:status-update',
  'sam:notification',
];

contextBridge.exposeInMainWorld('samAPI', {
  // Send a message to main process
  send: (channel, data) => {
    if (SEND_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel, data);
    } else {
      console.warn(`[Preload] Blocked send on channel: ${channel}`);
    }
  },

  // Listen for messages from main process (returns unsubscribe fn)
  on: (channel, callback) => {
    if (!RECEIVE_CHANNELS.includes(channel)) {
      console.warn(`[Preload] Blocked receive on channel: ${channel}`);
      return () => {};
    }
    const handler = (_, ...args) => callback(...args);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },

  // One-time listener
  once: (channel, callback) => {
    if (RECEIVE_CHANNELS.includes(channel)) {
      ipcRenderer.once(channel, (_, ...args) => callback(...args));
    }
  },

  // Invoke (request/response)
  invoke: async (channel, data) => {
    if (SEND_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    throw new Error(`Channel not allowed: ${channel}`);
  },
});
