
import Vue from 'vue'
import 'babel-polyfill'
import Ws from '@adonisjs/websocket-client'
const ws = Ws('ws://localhost:9238')

require('offline-js')

window.Offline.options = {
  checkOnLoad: true,
  checks: { xhr: { url: window.baseUrl } },
  interceptRequests: false,
  // requests: false,
  initialDelay: 3
}

ws.connect()

ws.on('open', () => {
  console.log('connected')
  window.Offline.check()
})

ws.on('close', () => {
  console.log('disconnected!')
  window.Offline.check()
})

Vue.prototype.$ws = ws

// const ws = require('adonis-websocket-client')
// // or available as global when using the script file from CDN
// const io = ws('http://localhost:3333')

// const chat = io.channel('chat').connect()
// chat.on('message', function (message) {
//   // do something with the message
// })
