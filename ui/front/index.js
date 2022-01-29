/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow, session } = require('electron');

const service = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  });

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
