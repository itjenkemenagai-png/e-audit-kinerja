const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;

// Fungsi untuk membuat menu aplikasi kustom
function createMenu() {
  const template = [
    // Menu default (opsional, bisa disesuaikan)
    { role: 'appMenu' },
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    // Menu "Bantuan" yang kita tambahkan
    {
      role: 'help',
      submenu: [
        {
          label: 'Periksa Pembaruan',
          click: async () => {
            // Memulai pengecekan pembaruan secara manual
            autoUpdater.checkForUpdates();
          }
        },
        {
          label: 'Pelajari Lebih Lanjut',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://github.com/itjenkemenagai-png/e-audit-kinerja');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
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

  mainWindow.loadFile('index.html');

  // Hapus menu default bawaan Electron
  // mainWindow.setMenu(null); 
  
  // Setelah jendela siap, periksa pembaruan secara otomatis saat pertama kali dibuka.
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.whenReady().then(() => {
  createWindow();
  createMenu(); // Panggil fungsi untuk membuat menu kustom kita

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// --- LOGIKA AUTO-UPDATE YANG DIPERLUAS ---

// Saat pengecekan dimulai
autoUpdater.on('checking-for-update', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-checking');
  }
});

// Saat pembaruan ditemukan
autoUpdater.on('update-available', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update_available');
  }
});

// Saat tidak ada pembaruan
autoUpdater.on('update-not-available', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available');
  }
});

// Saat pembaruan telah diunduh
autoUpdater.on('update-downloaded', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update_downloaded');
  }
});

// Saat terjadi error
autoUpdater.on('error', (err) => {
    if (mainWindow) {
        // Kirim pesan error ke renderer untuk ditampilkan jika perlu
        mainWindow.webContents.send('update-error', err);
    }
});


// Listener untuk merestart aplikasi
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});