import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios)

window.baseUrl = process.env.NODE_ENV === 'development'
  ? `http://127.0.0.1:${process.env.PORT}`
  : 'https://enigmatic-forest-11569.herokuapp.com'

// window.baseUrl = 'https://enigmatic-forest-11569.herokuapp.com'

axios.interceptors.request.use(
  config => {
    const baseUrl = window.baseUrl
    let token
    config.url = `${baseUrl}/${config.url}`
    config.headers['Content-Type'] = 'application/json'
    if ((token = localStorage.getItem('pos_token'))) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  err => Promise.reject(err)
)
