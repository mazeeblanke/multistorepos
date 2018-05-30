import Vue from 'vue'
import Router from 'vue-router'
import settings from './settings'
import products from './products'
import suppliers from './suppliers'
import accounts from './accounts'
import branches from './branches'
import employees from './employees'
import reports from './reports'
import customers from './customers'
import sales from './sales'
import dashboard from './dashboard'
import newSale from './new_sale'
import auth from './auth'
import signup from './signup'

const AppBase = () => import('@/components/AppBase')

Vue.use(Router)

export default new Router({
  routes: [
    auth,
    signup,
    {
      path: '/app',
      component: AppBase,
      children: [
        dashboard,
        newSale,
        sales,
        customers,
        reports,
        employees,
        branches,
        accounts,
        suppliers,
        products,
        settings
      ]
    }
  ]
})
