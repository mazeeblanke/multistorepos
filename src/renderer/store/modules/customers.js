// import { customers } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'
import Vue from 'vue'

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
      commit('CLEAR_SELECTED_CUSTOMER', null)
    },

    clearCustomers ({ commit }) {
      commit('CLEAR_CUSTOMERS')
    },

    loadCustomers ({ commit }, payload) {
      return Vue.axios.get('customers', { params: payload }).then(res => {
        if (payload.persist) {
          commit('SET_CUSTOMERS', res.data.data)
        }
        return res.data.data
      })
    },

    loadCustomer ({ commit }, payload) {
      return Vue.axios.get(`customers/${payload.id}`, payload).then(res => {
        commit('SET_SELECTED_CUSTOMER', res.data.data)
      })
    },

    createCustomer ({ commit }, payload) {
      return Vue.axios.post('customers', payload).then(res => {
        commit('ADD_CUSTOMER', res.data.data)
        return res.data
      })
    },

    updateCustomer ({ commit }, payload) {
      return Vue.axios.patch(`customer/${payload.id}`, payload).then(res => {
        commit('SET_SELECTED_CUSTOMER', res.data.data)
        return res.data
      })
    }

  },
  mutations: {

    SET_SELECTED_CUSTOMER (state, data) {
      state.selectedCustomer = {
        sales: {},
        ...state.selectedCustomer,
        ...data
      }
    },

    CLEAR_SELECTED_CUSTOMER (state) {
      state.selectedCustomer = null
    },

    SET_SELECTED_CUSTOMER_SALES (state, data) {
      state.selectedCustomer.sales = data
    },

    SET_CUSTOMERS (state, payload) {
      // state.filteredCustomers = payload.message
      UPDATE_STATE(state, payload, 'customers')
    },

    // SET_CUSTOMERS (state, payload) {
    //   state.customers = {
    //     ...state.customers,
    //     ...payload
    //   }
    // },

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
