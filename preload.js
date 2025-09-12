const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Dari Renderer ke Main
  restartApp: () => ipcRenderer.send('restart_app'),

  // Dari Main ke Renderer
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  
  // Saluran baru untuk umpan balik
  onUpdateChecking: (callback) => ipcRenderer.on('update-checking', callback),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', callback),
  onUpdateError: (callback) => ipcRenderer.on('update-error', (_event, error) => callback(error)),
});
