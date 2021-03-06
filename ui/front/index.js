/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow, session, ipcMain, dialog } = require('electron');
const path = require('path');
const env = process.env.NODE_ENV || 'production';
const os = require('os')

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

  win.webContents.userAgent = 'SOURC3-DESKTOP';

  ipcMain.on('select-dirs', async (event, arg) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
    console.log('directories selected', result.filePaths)
    win.webContents.send('ping', result.filePaths[0])
  })

  win.loadFile('dist/index.html');
}

app.whenReady().then(async () => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    details.responseHeaders['User-Agent'] = 'SuperDuperAgent';
    details.responseHeaders['Cross-Origin-Embedder-Policy'] = 'require-corp';
    details.responseHeaders['Cross-Origin-Opener-Policy'] = 'same-origin';
    callback({ responseHeaders: details.responseHeaders });
  });
  await session.defaultSession.loadExtension(path.join(os.homedir(),
    '.config/google-chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/3.0.9_0/'),
    { allowFileAccess: true }
  )
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
