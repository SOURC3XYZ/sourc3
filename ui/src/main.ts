import {
  app, BrowserWindow, session, ipcMain, dialog, shell
} from 'electron';
import path from 'path';
import fs from 'fs';
import { IpcServer } from 'ipc-express';
import crypto from 'crypto';
import { tryBDConnect } from './utils/typeorm-handler';
import expressApp from './app';
import { addwebContentSender } from './resources/beam-api/beam.repository';
import { loggerLevel } from './middlewares';
import { ethApi, wsConnection } from './ether/websocket';

const transactionParameters = {
  gasPrice: '0x09184e72a000', // customizable by user during MetaMask confirmation.
  // gas: '0x2710', // customizable by user during MetaMask confirmation.
  to: '0xed18C15a42AdBa5770c79EeF945E74065f2B4698', // Required except during contract publications.
  from: '0x7CB5ba674b8167A032855E1DcC033c405bE17918', // must match user's active address.
  value: '0x38d7ea4c68000' // Only required to send ether to the recipient from the initiating external account.
};

ethApi();

tryBDConnect(() => {
  const ipc = new IpcServer(ipcMain);
  ipc.listen(expressApp);
});

function CopyIfNotExists(src: string, dst: string) {
  if (!fs.existsSync(dst)) {
    loggerLevel('info', `Copy from ${src} to ${dst}`);
    fs.copyFileSync(src, dst);
  } else {
    loggerLevel('info', `Already has ${dst}`);
  }
}

function GetHash(file: string, algo: string) {
  const hashSum = crypto.createHash(algo);
  const fileBuffer = fs.readFileSync(file);
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function CopyIfNotEqualHash(src: string, dst: string) {
  loggerLevel('info', `Check copy ${src} to ${dst}`);
  if (fs.existsSync(dst)) {
    const dstHex = GetHash(dst, 'sha256');
    const srcHex = GetHash(src, 'sha256');
    if (srcHex !== dstHex) {
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
    minHeight: 768,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // win.webContents.setWindowOpenHandler(() => ({ action: 'allow' }));

  win.webContents.on('new-window', (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });

  ipcMain.on('select-dirs', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });
    loggerLevel('info', `directories selected${result.filePaths}`);
    win.webContents.send('ping', result.filePaths[0]);
  });

  ipcMain.on('ws-send', async () => {
    if (typeof wsConnection.wsSend === 'function') {
      wsConnection.wsSend(JSON.stringify({
        action: 'TX_SEND',
        data: { method: 'eth_sendTransaction', params: [transactionParameters] }
      }));
    }
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
      // TODO: Place logic for MacOS here
    }
    if (!fs.existsSync(sourc3Path)) {
      fs.mkdirSync(sourc3Path);
    }
    const configPath = path.join(sourc3Path, 'sourc3-remote.cfg');
    CopyIfNotExists(path.join(__dirname, '..', '..', 'sourc3-remote.cfg'), configPath);
    fs.readFile(configPath, 'utf8', (err, data) => {
      if (err) return loggerLevel('info', err);
      const result = data.replace(
        '# app-shader-file="app.wasm"',
        `app-shader-file=${path.join(sourc3Path, 'app.wasm')}`
      );

      return fs.writeFile(configPath, result, 'utf8', (error) => {
        if (error) return loggerLevel('info', error);
        return null;
      });
    });
    CopyIfNotEqualHash(
      path.join(__dirname, '..', 'front', 'dist', 'assets', 'app.wasm'),
      path.join(sourc3Path, 'app.wasm')
    );
  } catch (error) {
    loggerLevel('error', error);
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
  win.webContents.on('before-input-event', (_, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') {
      win.webContents.toggleDevTools();

      win.webContents.on('devtools-opened', () => {
        // Can't use win.webContents.devToolsWebContents.on("before-input-event") - it just doesn't intercept any events.
        win.webContents.devToolsWebContents?.executeJavaScript(`
            new Promise((resolve)=> {
              addEventListener("keydown", (event) => {
                if (event.key === "F12") {
                  resolve();
                }
              }, { once: true });
            })
          `)
          .then(() => {
            win.webContents.toggleDevTools();
          });
      });
    }
  });
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
