import {
  app, BrowserWindow, session, ipcMain, dialog
} from 'electron';
import path from 'path';
import fs from 'fs';
import { IpcServer } from 'ipc-express';
import { tryBDConnect } from './utils/typeorm-handler';
import expressApp from './app';
import { addwebContentSender } from './resources/beam-api/beam.repository';
import crypto from 'crypto';

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

function GetHash(file: string, algo: string) {
  const hashSum = crypto.createHash(algo);
  const fileBuffer = fs.readFileSync(file);
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function CopyIfNotEqualHash(src: string, dst: string) {
  console.log(`Check ${src} to ${dst}`)
  if (fs.existsSync(dst)) {
    const dstHex = GetHash(dst, "sha256");
    const srcHex = GetHash(src, "sha256");
    if (srcHex != dstHex) {
      fs.copyFileSync(src, dst);
    }
  } else {
    fs.copyFileSync(src, dst);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 786,
    minWidth: 1024,
    minHeight: 785,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  ipcMain.on('select-dirs', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });
    console.log('directories selected', result.filePaths);
    win.webContents.send('ping', result.filePaths[0]);
  });
  try {
    const sourc3Path = path.join(app.getPath('home'), '.sourc3');
    if (process.platform === 'linux') {
      if (!fs.existsSync(path.join(app.getPath('home'), '.local', 'bin'))) {
        fs.mkdirSync(path.join(app.getPath('home'), '.local', 'bin'));
      }
      CopyIfNotEqualHash(
        path.join(__dirname, '..', '..', '..', 'git-remote-sourc3'),
        path.join(app.getPath('home'), '.local', 'bin', 'git-remote-sourc3')
      );
    } else if (process.platform === 'darwin') {
      console.log(app.getPath('exe'));
      const dst = path.join(__dirname, '..', '..', '..', 'Contents', 'MacOS', 'git-remote-sourc3');
      const src = path.join(__dirname, '..', '..', '..', 'git-remote-sourc3');
      if (!fs.existsSync(dst)) {
        fs.symlinkSync(src, dst);
      }
    }
    if (!fs.existsSync(sourc3Path)) {
      fs.mkdirSync(sourc3Path);
    }
    const configPath = path.join(sourc3Path, 'sourc3-remote.cfg');
    CopyIfNotExists(path.join(__dirname, '..', '..', 'sourc3-remote.cfg'), configPath);
    fs.readFile(configPath, 'utf8', (err, data) => {
      if (err) return console.log(err);
      const result = data.replace(
        '# app-shader-file="app.wasm"',
        `app-shader-file=${path.join(sourc3Path, 'app.wasm')}`
      );

      return fs.writeFile(configPath, result, 'utf8', (error) => {
        if (error) return console.log(error);
        return null;
      });
    });
    CopyIfNotEqualHash(
      path.join(__dirname, '..', 'front', 'dist', 'assets', 'app.wasm'),
      path.join(sourc3Path, 'app.wasm')
    );
  } catch (error) {
    console.error(error);
  }

  win.webContents.userAgent = 'SOURC3-DESKTOP';
  if (process.env['NODE_ENV'] === 'dev') {
    win.loadURL('http://localhost:5003');
    win.webContents.openDevTools();
  } else {
    win.setMenu(null);
    win.loadFile('front/dist/index.html');
  }
  const webContents = win.webContents.send.bind(win.webContents);
  addwebContentSender(webContents);
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (details.responseHeaders !== undefined) {
      details.responseHeaders['Cross-Origin-Embedder-Policy'] = ['require-corp'];
      details.responseHeaders['Cross-Origin-Opener-Policy'] = ['same-origin'];
    }

    callback({ responseHeaders: details.responseHeaders });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // service.kill("SIGINT")
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
