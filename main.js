const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
    }
  })

  const template = [
    {
        label: "Git-Filemanager",
        submenu:[],

    },
  ];

  win.loadURL('http://localhost:3000/')
}

app.whenReady().then(createWindow)
