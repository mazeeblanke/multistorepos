// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/* eslint-disable */
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueProgressBar from 'vue-progressbar'
import VueScrollTo from 'vue-scrollto'
import Buefy from 'buefy'
import VueSweetalert2 from 'vue-sweetalert2'
import PopoverExt from 'vue-js-popover'
import {
  Table,
  TableColumn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Tabs,
  TabPane,
  Select,
  Tooltip,
  Option,
  Collapse,
  CollapseItem,
  Input,
  InputNumber,
  Button,
  Upload,
  Dialog,
  Form,
  FormItem,
  Progress,
  Loading,
  Autocomplete,
  Checkbox,
  DatePicker,
  Radio,
  Popover,
  Menu,
  MenuItem
} from 'element-ui'
import lang from 'element-ui/lib/locale/lang/en'
import Acl from 'vue-acl'
import locale from 'element-ui/lib/locale'
import { isLoggedIn } from '@/utils/helper'
import { PERMISSIONS } from '@/utils/constants'
import App from './App'
import router from './router'
import store from './store'
import '../../theme/index.css'

let initPermision = null

if (JSON.parse(localStorage.getItem('vuex'))) {
  const vuexStore = JSON.parse(localStorage.getItem('vuex'))
  if (typeof vuexStore.users === 'object' && typeof vuexStore.users.currentUser === 'object') {
    initPermision = PERMISSIONS.includes(vuexStore.users.currentUser.access)
      ? vuexStore.users.currentUser.access
      : 'clerk'
  }
}

Vue.use(VueProgressBar, {
  color: 'rgb(143, 255, 199)',
  failedColor: 'red',
  height: '2px'
})
Vue.use(PopoverExt)
Vue.use(VueAxios, axios)
Vue.use(Buefy)
Vue.use(Table)
Vue.use(Progress)
Vue.use(Checkbox)
Vue.use(Select)
Vue.use(Dropdown)
Vue.use(DropdownItem)
Vue.use(DropdownMenu)
Vue.use(Option)
Vue.use(Dialog)
Vue.use(TableColumn)
Vue.use(Radio)
Vue.use(Tabs)
Vue.use(Tooltip)
Vue.use(TabPane)
Vue.use(Autocomplete)
Vue.use(Checkbox)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Option)
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(Input)
Vue.use(InputNumber)
Vue.use(Button)
Vue.use(DatePicker)
Vue.use(Upload)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Loading)
Vue.use(VueScrollTo)
Vue.use(VueSweetalert2)
Vue.use(Acl, { router, init: initPermision || 'clerk' })
Vue.use(Popover)
locale.use(lang)

Vue.directive('close', {
  bind (el, bindings, vnode) {
    el.addEventListener('click', (e) => {
      if (e.target === el) {
        vnode.context[bindings.expression]()
      }
    })
  },
  unbind (el, bindings, vnode) {
    el.removeEventListener('click', (e) => {
      if (e.target === el) {
        vnode.context[bindings.expression]()
      }
    })
  }
})

Vue.OAS = axios.create({
  baseURL: 'https://oxbridge-dev-api.herokuapp.com/',
  headers: {'X-Access-Token': localStorage.getItem('oas_token')}
})

window.baseUrl = 'http://104.237.153.63/multistore'
Vue.config.productionTip = false
axios.interceptors.request.use(
  (config) => {
    const baseUrl = window.baseUrl
    config.url = `${baseUrl}/${config.url}`
    config.headers['Content-Type'] = 'multipart/form-data'
    return config
  },
  err => Promise.reject(err)
)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
  mounted () {
    this.$router.beforeEach((to, from, next) => {
      if (to.name === 'home') {
        next('/')
      } else if (isLoggedIn()) {
        next()
      } else {
        window.location.href = '/'
      }
    })
  }
})
