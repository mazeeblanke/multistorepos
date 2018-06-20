'use strict'

import { app, BrowserWindow, ipcMain, Menu, MenuItem, globalShortcut } from 'electron'
import { CMD } from '../renderer/utils/helper'
const exec = require('child_process').exec
const notifier = require('node-notifier')
const printer = require('printer')

const template = [
  {
    label: 'Edit',
    submenu: [
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
  mainWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 1600,
    minWidth: 1200
  })

  mainWindow.loadURL(winURL)
  const menu = Menu.buildFromTemplate(template)

  let contextMenu
  Menu.setApplicationMenu(menu)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  require('./registerGlobalShortcuts')(mainWindow, globalShortcut)

  ipcMain.on('print', (event, selectedPrinterName) => {
    let options = { silent: true }

    if (selectedPrinterName) {
      options = {
        ...options,
        deviceName: selectedPrinterName
      }
    }
    mainWindow.webContents.print(options)
  })

  ipcMain.on('fetchPrinters', (event, data) => {
    event.sender.send('installedPrinters', printer.getPrinters())
  })

  ipcMain.on('contextmenu', (event, data) => {
    let contextMenuOptions = [
      new MenuItem({
        label: 'Navigate Forward',
        accelerator: 'CommandOrControl+o',
        click () {
          event.sender.send('navigateForward')
        }
      }),
      new MenuItem({
        label: 'Navigate Back',
        accelerator: 'CommandOrControl+p',
        click () {
          event.sender.send('navigateBackwards')
        }
      }),
      {type: 'separator'},
      {role: 'selectall'},
      new MenuItem({
        label: 'Toggle Advanced search',
        accelerator: 'CommandOrControl+f',
        click () {
          event.sender.send('advancedSearch')
        }
      }),
      new MenuItem({
        label: 'Export list to csv',
        accelerator: 'CommandOrControl+e',
        click () {
          event.sender.send('exportListToCsv')
        }
      })
    ]
    contextMenu = Menu.buildFromTemplate(contextMenuOptions)
    contextMenu.popup()
  })

  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    item.on('updated', (event, state) => {
      const RECEIVED_BYTES = item.getReceivedBytes()
      const FILE_SIZE = item.getTotalBytes()

      if (state === 'progressing') {
        if (item.isPaused()) {
        } else {
          mainWindow.setProgressBar(RECEIVED_BYTES / FILE_SIZE)
        }
      }
    })

    item.once('done', (event, state) => {
      const FILE_PATH = item.getSavePath()
      if (state === 'completed') {
        mainWindow.setProgressBar(0)
        console.log('Download successfully')
        notifier.notify({
          title: 'Download Complete',
          message: `Your file ${item.getFilename()} download successfully`,
          sound: true,
          wait: true
        },
        function (err, response) {
        // Response is response from notification
          console.log(err)
        })

        notifier.on('click', function (notifierObject, options) {
        // Triggers if `wait: true` and user clicks notification
          exec(CMD(FILE_PATH))
        })

        notifier.on('timeout', function (notifierObject, options) {
        // Triggers if `wait: true` and notification closes
        })
      } else {
        console.log(`Download failed: ${state}`)
      }
    })
  })
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
