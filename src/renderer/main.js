// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/* eslint-disable */
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
  Steps,
  Step,
  Alert,
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
  Switch,
  MenuItem
} from 'element-ui'
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueProgressBar from 'vue-progressbar'
import VueScrollTo from 'vue-scrollto'
import Buefy from 'buefy'
import VueSweetalert2 from 'vue-sweetalert2'
import PopoverExt from 'vue-js-popover'
import moment from 'moment'
import VueMomentJS from 'vue-momentjs'
import lang from 'element-ui/lib/locale/lang/en'
// import VueLodash from 'vue-lodash'
import Acl from 'vue-acl'
import locale from 'element-ui/lib/locale'
import { isLoggedIn } from '@/utils/helper'
import { PERMISSIONS } from '@/utils/constants'
import { mapMutations } from 'vuex'
import App from './App'
import router from './router'
import store from './store'
import '../../theme/index.css'

let initPermision = null

if (JSON.parse(localStorage.getItem('vuex'))) {
  const vuexStore = JSON.parse(localStorage.getItem('vuex'))
  if (typeof vuexStore.users === 'object' && vuexStore.users.currentUser) {
    initPermision = PERMISSIONS.includes(vuexStore.users.currentUser.access_level)
      ? vuexStore.users.currentUser.access_level
      : 'clerk'
  }
}

const options = {
  color: "#84a6e5",
  failedColor: "#874b4b",
  thickness: "3px",
  transition: {
    speed: "0.4s",
    opacity: "0.7s",
    termination: 400,
  },
  autoRevert: true,
}

Vue.use(VueProgressBar, options)
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
Vue.use(Alert)
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
Vue.use(Steps)
Vue.use(Step)
Vue.use(Menu)
Vue.use(Switch)
Vue.use(MenuItem)
Vue.use(Loading)
Vue.use(VueScrollTo)
Vue.use(VueSweetalert2)
Vue.use(VueMomentJS, moment)
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

// window.baseUrl = 'http://104.237.153.63/multistore'
window.baseUrl = 'http://127.0.0.1:9238'

axios.interceptors.request.use(
  (config) => {
    const baseUrl = window.baseUrl
    let token;
    config.url = `${baseUrl}/${config.url}`
    config.headers['Content-Type'] = 'application/json'
    if ((token = localStorage.getItem("pos_token"))) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
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

  methods: {
    ...mapMutations('app', [
      'SET_FORM_STATE'
    ]),
  },

  watch: {
    $route (newValue) {
      if (!isLoggedIn() && newValue.meta.requiresAuth === true) {
        this.$snackbar.open({
          type: 'is-warning',
          position: 'is-top',
          duration: 5000,
          message: 'You are not logged in'
        })
        this.$router.push('/')
      }
    }
  },

  mounted () {
    this.$router.beforeEach((to, from, next) => {
      this.SET_FORM_STATE(false)
      if (!isLoggedIn() && to.meta.requiresAuth === true) {
        this.$snackbar.open({
          type: 'is-warning',
          position: 'is-top',
          duration: 5000,
          message: 'You are not logged in'
        })
        next('/')
      } else {
        next()
      }
    })
  }

})
