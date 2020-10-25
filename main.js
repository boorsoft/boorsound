const { app, BrowserWindow } = require('electron')
const reload = require('electron-reload')

reload(__dirname);

function createWindow () {
  const win = new BrowserWindow({
    width: 370,
    height: 500,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  win.removeMenu()
  win.loadFile('src/index.html')
//   win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

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