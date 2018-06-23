const {
  ipcMain,
  Menu,
  MenuItem
} = require('electron')

module.exports = () => {
  let contextMenu
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
}
