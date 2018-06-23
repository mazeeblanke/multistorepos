const {
  globalShortcut
} = require('electron')

module.exports = (mainWindow) => {
  globalShortcut.register('CommandOrControl+f', () => {
    mainWindow.webContents.send('advancedSearch')
  })

  globalShortcut.register('CommandOrControl+e', () => {
    mainWindow.webContents.send('exportListToCsv')
  })
}
