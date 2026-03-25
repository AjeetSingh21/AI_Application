import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),
  restartBackend: () => ipcRenderer.invoke('restart-backend'),
  platform: process.platform,
  isElectron: true
});
