// @ts-ignore

import { app, BrowserWindow, session, ipcMain, dialog } from 'electron';
import path from 'path';
// const { spawn } = require('child_process');
import cors from 'cors';
import fs from 'fs';
import express, { Request, Response, NextFunction } from 'express';
import {
  ErrorHandler,
  handleError,
  logerRequests,
  uncaughtException,
  unhandledRejection
} from './middlewares';
import { beamRouter } from './resources/beam-api';
import { gitRouter } from './resources/git';
import { walletRouter } from './resources/wallet';

import { PORT } from './common/config';
import { tryBDConnect } from './utils/typeorm-handler';

const expressApp = express();

expressApp.use(cors());
expressApp.use(express.json());

expressApp.use(logerRequests);
console.log("Setup logger");
expressApp.use('/', (req, res, next) => {
  if (req.originalUrl === '/') {
    res.send('Service is running!');
    return;
  }
  next();
});
console.log("Setup root");

expressApp.use('/wallet', walletRouter);

console.log("Setup walley");
expressApp.use('/beam', beamRouter);

console.log("Setup beam");
expressApp.use('/git', gitRouter);

console.log("Setup git");
expressApp.use((err:ErrorHandler, _req:Request, res:Response, next:NextFunction) => {
  handleError(err, res);
  next();
});

process.on('uncaughtException', uncaughtException);
process.on('unhandledRejection', unhandledRejection);

tryBDConnect(() => {
  expressApp.listen(PORT, () => console.log(
  `App is running on http://localhost:${5001}`
  ));
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

  if (!fs.existsSync(`${path.join(app.getPath('userData'), '.env')}`)) {
    fs.copyFileSync(path.join(__dirname, '..', '.env'), `${path.join(app.getPath('userData'), '.env')}`)
  }

  win.setMenu(null);
  win.loadFile('front/dist/index.html')
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
