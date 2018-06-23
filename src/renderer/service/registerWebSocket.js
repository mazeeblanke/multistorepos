
import Vue from 'vue'
import 'babel-polyfill'
import Ws from '@adonisjs/websocket-client'
let baseUrl = window.baseUrl
let matched = baseUrl.match(/^(http|https):\/\//)

if (matched) {
  baseUrl = matched['input'].split(matched[0]).join('')
}

const ws = Ws(`ws://${baseUrl}`, {
  reconnectionAttempts: 100000
})

require('offline-js')

window.Offline.options = {
  checkOnLoad: true,
  checks: { xhr: { url: window.baseUrl } },
  interceptRequests: false,
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

setInterval(() => {
  if (window.Offline.state === 'up') {
    window.Offline.check()
  }
}, 5000)

Vue.prototype.$ws = ws

// const ws = require('adonis-websocket-client')
// // or available as global when using the script file from CDN
// const io = ws('http://localhost:3333')

// const chat = io.channel('chat').connect()
// chat.on('message', function (message) {
//   // do something with the message
// })
