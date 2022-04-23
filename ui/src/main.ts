import { app, BrowserWindow, session, ipcMain, dialog } from 'electron';
import path from 'path';
import { tryBDConnect } from './utils/typeorm-handler';
import { IpcServer } from 'ipc-express';
import expressApp from './app';
import { addwebContentSender } from './resources/beam-api/beam.repository';

tryBDConnect(() => {
  const ipc = new IpcServer(ipcMain);
  ipc.listen(expressApp);
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  ipcMain.on('select-dirs', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    })
    console.log('directories selected', result.filePaths)
    win.webContents.send('ping', result.filePaths[0])
  })

  win.webContents.userAgent = 'SOURC3-DESKTOP';
  if (process.env['NODE_ENV'] === 'dev')  win.loadURL('http://localhost:5000');
  else {
    win.setMenu(null);
    win.loadFile('front/dist/index.html');
  }
  const webContents = win.webContents.send.bind(win.webContents)
  addwebContentSender(webContents);
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (details.responseHeaders !== undefined) {
      details.responseHeaders['Cross-Origin-Embedder-Policy'] = ['require-corp'];
      details.responseHeaders['Cross-Origin-Opener-Policy'] = ['same-origin'];
    }

    callback({ responseHeaders: details.responseHeaders })
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // service.kill("SIGINT")
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
