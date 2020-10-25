const { app, BrowserWindow } = require('electron')
const reload = require('electron-reload')

reload(__dirname);

function createWindow () {
  const win = new BrowserWindow({
    width: 370,
    height: 500,
    frame: false,
    resizable: false,
    minimizable: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  // get rid of the menu on the top
  win.removeMenu()
  win.loadFile('src/index.html')
  // win.webContents.openDevTools()
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