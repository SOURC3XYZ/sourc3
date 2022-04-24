import { app, BrowserWindow, session, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { tryBDConnect } from './utils/typeorm-handler';
import { IpcServer } from 'ipc-express';
import expressApp from './app';
import { addwebContentSender } from './resources/beam-api/beam.repository';

tryBDConnect(() => {
  const ipc = new IpcServer(ipcMain);
  ipc.listen(expressApp);
});

function CopyIfNotExists(src: string, dst: string) {
  if (!fs.existsSync(dst)) {
    console.log(`Copy from ${src} to ${dst}`);
    fs.copyFileSync(src, dst);
  } else {
    console.log(`Already has ${dst}`);
  }
}

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

  var sourc3Path = path.join(app.getPath('home'), '.sourc3');
  if (process.platform === "linux") {
    if (!fs.existsSync(path.join(app.getPath('home'), '.local', 'bin'))) {
      fs.mkdirSync(path.join(app.getPath('home'), '.local', 'bin'));
    }
    CopyIfNotExists(path.join(__dirname, '..', '..', 'git-remote-sourc3'), path.join(app.getPath('home'), '.local', 'bin', 'git-remote-sourc3'));
  } else if (process.platform === "win32") {
    CopyIfNotExists(path.join(__dirname, '..', '..', 'git-remote-sourc3.exe'), path.join(__dirname, '..', '..', '..', 'git-remote-sourc3.exe'));
  }
  if (!fs.existsSync(sourc3Path)) {
    fs.mkdirSync(sourc3Path);
  }
  var configPath = path.join(sourc3Path, 'sourc3-remote.cfg');
  CopyIfNotExists(path.join(__dirname, '..', '..', 'sourc3-remote.cfg'), configPath);
  fs.readFile(configPath, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    var result = data.replace('# app-shader-file="app.wasm"', `app-shader-file="${path.join(sourc3Path, 'app.wasm')}"`);

    fs.writeFile(configPath, result, 'utf8', function (err) {
      if (err) {
        return console.log(err);
      }
    });
  });
  CopyIfNotExists(path.join(__dirname, '..', 'front', 'dist', 'assets', 'app.wasm'), path.join(sourc3Path, 'app.wasm'));
  win.webContents.userAgent = 'SOURC3-DESKTOP';
  win.setMenu(null);
  win.loadFile('front/dist/index.html');
  // win.loadURL('http://localhost:5000');
  win.webContents.openDevTools();
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
