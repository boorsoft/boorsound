const { app, BrowserWindow } = require('electron')
const reload = require('electron-reload')
const fs = require('fs')

reload(__dirname);

let win = null;

function createWindow () {
  win = new BrowserWindow({
    icon: 'assets/icons/icon.png',
    width: 370,
    height: 500,
    frame: false,
    autoHideMenuBar: true,
    resizable: false,
    minimizable: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  win.loadFile('src/index.html')
  win.webContents.openDevTools()
}

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.minimized) win.restore()
      win.focus()
    }
  })

  app.on('ready', createWindow)

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
}