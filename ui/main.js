const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let service = null

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "PIT Desktop Client"
  })

  if (service === null) {
    console.log(`Service is null, start from ${__dirname}/../service/bundle/bundle.js on ${app.getPath('userData')}`);

    if (!fs.existsSync(`${path.join(app.getPath('userData'), '.env')}`)) {
      fs.copyFileSync(path.join(__dirname, '..', '.env'), `${path.join(app.getPath('userData'), '.env')}`)
    }

    service = spawn('node', [`${path.join(__dirname, '..', 'service', 'bundle', 'bundle.js')}`, '-l',
      `${app.getPath('userData')}`]);
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
  win.setMenu(null)
  win.loadFile('front/dist/index.html')
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    details.responseHeaders['Cross-Origin-Embedder-Policy'] = ['require-corp'];
    details.responseHeaders['Cross-Origin-Opener-Policy'] = ['same-origin'];
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
