
module.exports = (mainWindow) => {
  require('./fetchPrinters')()
  require('./contextMenu')()
  require('./print')(mainWindow)
  require('./network')()
}
