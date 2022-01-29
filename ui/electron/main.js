const { app, BrowserWindow, session } = require('electron')
const path = require('path')
const { spawn } = require('child_process');

var service = null

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  if (service === null) {
    console.log(`Service is null, start from ${__dirname}/bundle/server/bundle.js`);
    service = spawn('node', [`${__dirname}/bundle/server/bundle.js`], {
      "detached": true
    });
    service.stdout.on('data', (data) => {
      console.log(`Service: ${data}`);
    })

    service.stderr.on('data', (data) => {
      console.log(`Service error: ${data}`);
    })
    
    service.on('close', (code) => {
      console.log(`Service ended with code ${code}`);
    })
  }

  win.loadFile('front/index.html')
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    details.responseHeaders['Cross-Origin-Embedder-Policy'] = 'require-corp';
    details.responseHeaders['Cross-Origin-Opener-Policy'] = 'same-origin';
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
  if (process.platform !== 'darwin') {
    app.quit()
  }
  service.kill()
})
