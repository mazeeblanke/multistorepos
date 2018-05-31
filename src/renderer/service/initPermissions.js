import Vue from 'vue'
import { PERMISSIONS } from '@/utils/constants'
import Acl from 'vue-acl'
import router from './router'

let initPermision = null

if (JSON.parse(localStorage.getItem('vuex'))) {
  const vuexStore = JSON.parse(localStorage.getItem('vuex'))
  if (typeof vuexStore.users === 'object' && vuexStore.users.currentUser) {
    initPermision = PERMISSIONS.includes(
      vuexStore.users.currentUser.access_level
    )
      ? vuexStore.users.currentUser.access_level
      : 'clerk'
  }
}

Vue.use(Acl, { router, init: initPermision || 'clerk' })
