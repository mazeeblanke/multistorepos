const notifier = require('node-notifier')
const {
  session,
  shell
} = require('electron')

const notify = (message, title) => {
  notifier.notify({
    title,
    message,
    sound: true,
    wait: true
  })
}

module.exports = (mainWindow) => {
  session.defaultSession.on('will-download', (event, item, webContents) => {
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
      if (state === 'completed') {
        const FILE_PATH = item.getSavePath()
        const message = `Your file ${item.getFilename()} download successfully`
        const title = 'Download Complete'
        mainWindow.setProgressBar(-1)
        notify(message, title)

        notifier.on('click', function (notifierObject, options) {
          console.log(FILE_PATH)
          shell.openItem(FILE_PATH)
        })
      } else {
        mainWindow.setProgressBar(-1)
        const message = `Your file ${item.getFilename()} download failed`
        const title = 'Download Failed'
        notify(message, title)
      }
    })
  })
}
