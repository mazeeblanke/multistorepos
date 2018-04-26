import Vue from 'vue'
import {
  PRODUCTS_API,
  SALES_API,
  SEARCH_API,
  STORE_SETUP_API,
  SUPPLIERS_API,
  USERS_API,
  OPENING_CASH_API,
  BANKING_CASH_API,
  EXPENDITURES_API,
  CUSTOMERS_API,
  BRANCHES_API,
  HTTP_VERBS
} from '@/utils/constants'

export const products = (
  payload,
  type = HTTP_VERBS.POST,
  url = PRODUCTS_API
) => {
  if (type === HTTP_VERBS.GET) {
    payload = {
      params: payload
    }
  }
  return Vue.axios[type](url, payload)
}

export const sales = (payload, type = HTTP_VERBS.POST, url = SALES_API) => {
  if (type === HTTP_VERBS.GET) {
    payload = {
      params: payload
    }
  }
  return Vue.axios[type](url, payload)
}

export const suppliers = (payload, type = HTTP_VERBS.POST, url = SUPPLIERS_API) => {
  if (type === HTTP_VERBS.GET) {
    payload = {
      params: payload
    }
  }
  return Vue.axios[type](url, payload)
}

export const users = (payload, type = HTTP_VERBS.POST, url = USERS_API) => {
  if (type === HTTP_VERBS.GET) {
    payload = {
      params: payload
    }
  }
  return Vue.axios[type](url, payload)
}

export const customers = (payload, type = HTTP_VERBS.POST, url = CUSTOMERS_API) => {
  if (type === HTTP_VERBS.GET) {
    payload = {
      params: payload
    }
  }
  return Vue.axios[type](url, payload)
}

export const branches = (payload, type = HTTP_VERBS.POST, url = BRANCHES_API) => {
  if (type === HTTP_VERBS.GET) {
    payload = {
      params: payload
    }
  }
  return Vue.axios[type](url, payload)
}

export const openingCash = (payload, type = HTTP_VERBS.POST, url = OPENING_CASH_API) => {
  if (type === HTTP_VERBS.GET) {
    payload = {
      params: payload
    }
  }
  return Vue.axios[type](url, payload)
}

export const bankingCash = (payload, type = HTTP_VERBS.POST, url = BANKING_CASH_API) => {
  if (type === HTTP_VERBS.GET) {
    payload = {
      params: payload
    }
  }
  return Vue.axios[type](url, payload)
}

export const expenditures = (payload, type = HTTP_VERBS.POST, url = EXPENDITURES_API) => {
  if (type === HTTP_VERBS.GET) {
    payload = {
      params: payload
    }
  }
  return Vue.axios[type](url, payload)
}

export const storeSetup = (payload, type = HTTP_VERBS.POST, url = STORE_SETUP_API) => {
  if (type === HTTP_VERBS.GET) {
    payload = {
      params: payload
    }
  }
  return Vue.axios[type](url, payload)
}

export const search = (payload, type = HTTP_VERBS.GET, url = SEARCH_API) => {
  if (type === HTTP_VERBS.GET) {
    payload = {
      params: payload
    }
  }
  return Vue.axios[type](url, payload)
}
