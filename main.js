const { app, BrowserWindow, remote } = require('electron');
const reload = require('electron-reload')
const MemoryFileSystem = require("memory-fs");
const mfs = new MemoryFileSystem();
mfs.mkdirpSync("/audio");

reload(__dirname);

let win = null;

function createWindow () {
  win = new BrowserWindow({
    icon: 'assets/icons/icon.png',
    width: 370,
    height: 530,
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
  // win.webContents.openDevTools()
}

// prevent second instances of app
const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} 

app.on('second-instance', (e, argv) => {
  if (win) {
    if (win.minimized) win.restore()
    win.focus()
    win.webContents.send('second-instance', argv[2]) // send command line argument of second intance to the renderer process
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