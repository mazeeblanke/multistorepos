'use strict'
const path = require('path')
const {
  app,
  BrowserWindow,
  Menu
} = require('electron')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  mainWindow = new BrowserWindow({
    // icon: path.join(__dirname, '../../static/img/posico.png'),
    height: 800,
    useContentSize: true,
    width: 1600,
    minWidth: 1200
  })

  mainWindow.loadURL(winURL)
  const menu = Menu.buildFromTemplate(
    require('./Templates/mainMenu')()
  )
  Menu.setApplicationMenu(menu)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  require('./globalShortcuts')(mainWindow)
  require('./download')(mainWindow)
  require('./IpcMainEvents')(mainWindow)
  // require('./tray')()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
