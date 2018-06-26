const { ipcMain } = require('electron')
// const { ipcMain, BrowserWindow } = require('electron')
const blobUtil = require('blob-util')
// const PDFWindow = require('electron-pdf-window')

module.exports = (mainWindow) => {
  ipcMain.on('invoicePreview', (e, res) => {
    console.log('jsddj sjd sdj')
    console.log(res)
    res.getBlob((result) => {
      // console.log(result)
      const url = blobUtil.createObjectURL(result)
      console.log(url)
    })
    // const url = blobUtil.createObjectURL(res.res)
    // console.log(url)
    // console.log('s jsdhd hsh d')
    // let child = new BrowserWindow({
    //   parent: mainWindow,
    //   autoHideMenuBar: true,
    //   modal: true,
    //   webPreferences: {
    //     plugins: true,
    //     devTools: false
    //   },
    //   show: true
    // })

    // child.loadURL(url)
    // // child.loadURL('http://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf')
    // child.once('ready-to-show', () => {
    //   child.show()
    // })
  })
}
