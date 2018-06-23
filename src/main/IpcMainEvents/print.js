const {
  ipcMain
} = require('electron')

module.exports = (mainWindow) => {
  ipcMain.on('print', (event, selectedPrinterName) => {
    let options = { silent: true }
    if (selectedPrinterName) {
      options.deviceName = selectedPrinterName
    }
    mainWindow.webContents.print(options)
  })
}
