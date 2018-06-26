const path = require('path')
const { Menu, Tray, nativeImage } = require('electron')

let tray = null
module.exports = () => {
  let image = nativeImage
    .createFromPath(path.resolve(__dirname, '../../static/img/icon.ico'))
    .resize({ width: 16, height: 16 })
  tray = new Tray(image)
  const contextMenu = Menu.buildFromTemplate([
    { role: 'hideothers' },
    { role: 'unhide' },
    { type: 'separator' },
    { role: 'quit' }
  ])
  tray.setToolTip('POS Application')
  tray.setContextMenu(contextMenu)
}
