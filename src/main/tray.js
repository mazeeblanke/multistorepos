const path = require('path')
const { Menu, Tray } = require('electron')

let tray = null
module.exports = () => {
  tray = new Tray(path.join(__dirname, '../../static/img/posico.png'))
  const contextMenu = Menu.buildFromTemplate([
    { role: 'hideothers' },
    { role: 'unhide' },
    { type: 'separator' },
    { role: 'quit' }
  ])
  tray.setToolTip('POS Application')
  tray.setContextMenu(contextMenu)
}
