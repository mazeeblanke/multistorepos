import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import app from '@/store/modules/app'
import notifications from '@/store/modules/notifications'
import users from '@/store/modules/users'
import products from '@/store/modules/products'
import sales from '@/store/modules/sales'
import store from '@/store/modules/store'
import customers from '@/store/modules/customers'
import employees from '@/store/modules/employees'
import expenditures from '@/store/modules/expenditures'
import openingcash from '@/store/modules/openingcash'
import bankingcash from '@/store/modules/bankingcash'
import suppliers from '@/store/modules/suppliers'
import dashboard from '@/store/modules/dashboard'
import branch from '@/store/modules/branch'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState()],
  modules: {
    app,
    notifications,
    users,
    products,
    sales,
    customers,
    store,
    employees,
    dashboard,
    suppliers,
    expenditures,
    openingcash,
    bankingcash,
    branch
  }
})
