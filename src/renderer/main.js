
import Vue from 'vue'
import VueScrollTo from 'vue-scrollto'
import Buefy from 'buefy'
import VueSweetalert2 from 'vue-sweetalert2'
import PopoverExt from 'vue-js-popover'
import moment from 'moment'
import VueMomentJS from 'vue-momentjs'
import { isLoggedIn } from '@/utils/helper'
import { mapMutations } from 'vuex'
import App from './App'
import router from './router'
import store from './store'

/* eslint-disable */
require('../renderer/service/registerElementUi')
require('../renderer/service/registerNetworkInterceptors')
require('../renderer/service/registerCloseDirective')
require('../renderer/service/registerProgressBar')
require('../renderer/service/initPermissions')
require('../renderer/service/registerWebSocket')
require('../renderer/service/registerFileAsCSP')

Vue.use(PopoverExt)
Vue.use(Buefy)
Vue.use(VueScrollTo)
Vue.use(VueSweetalert2)
Vue.use(VueMomentJS, moment)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

/* eslint-disable no-new */

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
  methods: {
    ...mapMutations('app', [
      'SET_FORM_STATE'
    ])
  },
  watch: {
    $route (newValue) {
      if (
        !isLoggedIn() &&
        newValue.meta.requiresAuth === true
      ) {
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
      if (
        !isLoggedIn() &&
        to.meta.requiresAuth === true
      ) {
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
