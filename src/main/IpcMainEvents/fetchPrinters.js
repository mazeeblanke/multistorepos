const printer = require('printer')
const { ipcMain } = require('electron')

module.exports = () => {
  ipcMain.on('fetchPrinters', (event, data) => {
    event.sender.send('installedPrinters', printer.getPrinters())
  })
}
