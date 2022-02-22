/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow, session, ipcMain, dialog } = require('electron');
const path = require('path');
const env = process.env.NODE_ENV || 'production';

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  hardResetMethod: 'exit'
});

const service = null;

function createWindow() {
  console.log(path.join(__dirname, 'preload.js'));
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true
    }
  });

  ipcMain.on('select-dirs', async (event, arg) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
    console.log('directories selected', result.filePaths)
    win.webContents.send('ping', result.filePaths[0])
  })

  win.loadFile('dist/index.html');
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    details.responseHeaders['Cross-Origin-Embedder-Policy'] = 'require-corp';
    details.responseHeaders['Cross-Origin-Opener-Policy'] = 'same-origin';
    callback({ responseHeaders: details.responseHeaders });
  });

  createWindow();

  app.on('ready', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  service.kill();
});
