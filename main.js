const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Konfigurasi logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let mainWindow;

function createMenu() {
  const template = [
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        {
          label: 'Periksa Pembaruan',
          click: () => {
            log.info('Manual update check triggered from menu.');
            autoUpdater.checkForUpdates();
          }
        },
        { type: 'separator' },
        { label: `Versi ${app.getVersion()}`, enabled: false },
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
  
  mainWindow.once('ready-to-show', () => {
    log.info('Window ready, checking for updates on startup...');
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// --- LOGIKA AUTO-UPDATE YANG DIPERLUAS ---

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
  if (mainWindow) mainWindow.webContents.send('update-checking');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available.', info);
  if (mainWindow) mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available.', info);
  if (mainWindow) mainWindow.webContents.send('update-not-available');
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater. ' + err);
  if (mainWindow) mainWindow.webContents.send('update-error', err);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded.', info);
  if (mainWindow) mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  log.info('Restarting app to install update.');
  autoUpdater.quitAndInstall();
});