import { customers, search } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'

export default {
  namespaced: true,
  state: {
    customers: INIT_STATE,
    selectedCustomer: null,
    filteredCustomers: []
  },
  actions: {

    setSelectedCustomerSales ({ commit }, payload) {
      commit('SET_SELECTED_CUSTOMER_SALES', payload)
    },

    clearSelectedCustomer ({ commit }, payload) {
      commit('SET_SELECTED_CUSTOMER', null)
    },

    clearCustomers ({ commit }) {
      commit('CLEAR_CUSTOMERS')
    },

    loadCustomers ({ commit }, payload) {
      return search(payload).then(res => {
        return res.data
      })
    },

    loadCustomersByPage ({ commit }, payload) {
      return customers(payload).then(res => {
        commit('SET_CUSTOMERS', res.data)
        return res.data
      })
    },

    loadCustomer ({ commit }, payload) {
      return customers(payload).then(res => {
        commit('SET_SELECTED_CUSTOMER', res.data.message[0])
      })
    },

    createCustomer ({ commit }, payload) {
      return customers(payload).then(res => {
        commit('ADD_CUSTOMER', res.data.customer_details[0])
        return res.data
      })
    },

    updateCustomer ({ commit }, payload) {
      return customers(payload).then(res => {
        // commit('ADD_CUSTOMER', payload.customer);
        return res.data
      })
    }

  },
  mutations: {

    SET_SELECTED_CUSTOMER (state, data) {
      state.selectedCustomer = data
    },

    SET_SELECTED_CUSTOMER_SALES (state, data) {
      state.selectedCustomer.sales = data
    },

    SET_CUSTOMERS (state, payload) {
      state.filteredCustomers = payload.message
      UPDATE_STATE(state, payload, 'customers')
    },

    CLEAR_CUSTOMERS (state) {
      state.customers = INIT_STATE
    },

    SET_FILTERED_CUSTOMERS (state, payload) {
      state.filteredCustomers = payload
    },

    ADD_CUSTOMER (state, data) {
      state.customers.data.unshift(data)
    }

  }
}
