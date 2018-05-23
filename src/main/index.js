'use strict'
/* eslint-disable */
import { app, BrowserWindow, ipcMain, Menu, protocol } from 'electron'
const path = require("path");

// Modify the user agent for all requests to the following urls.

const template = [
  {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'pasteandmatchstyle'},
      {role: 'delete'},
      {role: 'selectall'}
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'reload'},
      {role: 'forcereload'},
      {role: 'toggledevtools'},
      {type: 'separator'},
      {role: 'resetzoom'},
      {role: 'zoomin'},
      {role: 'zoomout'},
      {type: 'separator'},
      {role: 'togglefullscreen'}
    ]
  },
  {
    role: 'window',
    submenu: [
      {role: 'minimize'},
      {role: 'close'}
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('https://electronjs.org') }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  })

  // Edit menu
  template[1].submenu.push(
    {type: 'separator'},
    {
      label: 'Speech',
      submenu: [
        {role: 'startspeaking'},
        {role: 'stopspeaking'}
      ]
    }
  )

  // Window menu
  template[3].submenu = [
    {role: 'close'},
    {role: 'minimize'},
    {role: 'zoom'},
    {type: 'separator'},
    {role: 'front'}
  ]
}

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
  /**
   * Initial window options
   */
  protocol.registerServiceWorkerSchemes(['file', 'l'])
  // protocol.interceptFileProtocol('file', (request, callback) => {
  //   // const url = request.url.substr(7)
  //   // console.log(request)
  //   // console.log('badeest g ------------')
  //   // ipcMain.emit('stuff', request)
  //   callback({path: request.url})
  //   }, (error) => {
  //   if (error) {
  //     console.error('Failed to intercept file protocol')
  //   }
  // })

  mainWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 1600,
    minWidth: 1200,
    webPreferences: {
      webSecurity: false
    }
  })

  mainWindow.loadURL(winURL)
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  ipcMain.on('print', (event, data) => {
    // if (data.type !== 'report') {
    //   setTimeout(() => {
    //     prevWindow.loadURL(data.data)
    //   }, 5000)
    // } else {
    mainWindow.webContents.print({ silent: false })
    // }
  })

  // const filter = { urls: ["https://*.github.com/*", "*://electron.github.io", "*"] };

  // session.defaultSession.webRequest.onBeforeSendHeaders(
  //   filter,
  //   (details, callback) => {
  //     details.requestHeaders["User-Agent"] = "MyAgent";
  //     console.log("hit n run");
  //     callback({ cancel: false, requestHeaders: details.requestHeaders });
  //   },
  // );
}

// app.commandLine.appendSwitch('disable-web-security') // try add this line
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

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
