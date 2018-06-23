const wifi = require('node-wifi')
const { ipcMain } = require('electron')

wifi.init({
  iface: null
})

module.exports = () => {
  ipcMain.on('getWifiConnection', (event, data) => {
    wifi.getCurrentConnections(function (err, currentConnections) {
      if (err) {
        console.log(err)
      }
      // console.log(currentConnections)
      event.sender.send('wifiConnection', currentConnections)
      /*
          // you may have several connections
          [
              {
                  iface: '...', // network interface used for the connection, not available on macOS
                  ssid: '...',
                  bssid: '...',
                  mac: '...', // equals to bssid (for retrocompatibility)
                  channel: <number>,
                  frequency: <number>, // in MHz
                  signal_level: <number>, // in dB
                  security: '...' //
                  security_flags: '...' // encryption protocols (format currently depending of the OS)
                  mode: '...' // network mode like Infra (format currently depending of the OS)
              }
          ]
          */
    })
  })
}
