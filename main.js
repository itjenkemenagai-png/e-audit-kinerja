const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Deklarasikan mainWindow di sini agar dapat diakses di seluruh file
let mainWindow;

function createWindow() {
  // Buat jendela browser dan tetapkan ke variabel mainWindow.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'icon.png')
  });

  // Muat file index.html ke dalam jendela.
  mainWindow.loadFile('index.html');
  
  // Setelah jendela siap, periksa pembaruan.
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

// Method ini akan dipanggil ketika Electron selesai inisialisasi.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Keluar dari aplikasi ketika semua jendela ditutup, kecuali di macOS.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// --- LOGIKA AUTO-UPDATE ---

// Event ini akan dipicu saat pembaruan ditemukan.
autoUpdater.on('update-available', () => {
  // Kirim event ke jendela renderer (index.html)
  if (mainWindow) {
    mainWindow.webContents.send('update_available');
  }
});

// Event ini akan dipicu saat pembaruan telah diunduh.
autoUpdater.on('update-downloaded', () => {
  // Kirim event ke jendela renderer (index.html)
  if (mainWindow) {
    mainWindow.webContents.send('update_downloaded');
  }
});

// Event listener untuk merestart aplikasi dan menginstal pembaruan.
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});