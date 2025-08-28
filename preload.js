const { contextBridge, ipcRenderer } = require('electron');

// Mengekspos API yang aman ke proses renderer (index.html)
contextBridge.exposeInMainWorld('electronAPI', {
  // Menerima event dari main process dan meneruskannya ke window
  onUpdateAvailable: (callback) => ipcRenderer.on('update_available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update_downloaded', callback),
  // Mengirim event dari renderer ke main process
  restartApp: () => ipcRenderer.send('restart_app'),
});