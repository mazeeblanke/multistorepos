import Vue from 'vue'
import BaseModule from '../utils/BaseModule'
// import axios from 'axios';

export default new BaseModule('customer', {
  state: {
    customers: {
      data: [],
      nextPage: null
    },
    selectedCustomer: null,
    filteredCustomers: []
  },
  actions: {
    loadCustomers ({ commit }, payload) {
      return Vue.axios
        .get(
          'forms/search.php',
          { params: payload },
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then(res => {
          // commit('SET_CUSTOMERS', res.data);
          return res.data
        })
    },
    loadCustomersByPage ({ commit }, payload) {
      return Vue.axios
        .post('forms/customers.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // console.log(res.data);
          commit('SET_CUSTOMERS', res.data)
          return res.data
        })
    },
    loadCustomer ({ commit }, payload) {
      return Vue.axios
        .post('forms/customers.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          commit('SET_SELECTED_CUSTOMER', res.data.message[0])
        })
    },
    createCustomer ({ commit }, payload) {
      return Vue.axios
        .post('forms/customers.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          commit('ADD_CUSTOMER', res.data.customer_details[0])
          return res.data
        })
    },
    updateCustomer ({ commit }, payload) {
      return Vue.axios
        .post('forms/customers.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_CUSTOMER', payload.customer);
          return res.data
        })
    },
    setSelectedCustomerSales ({ commit }, payload) {
      commit('SET_SELECTED_CUSTOMER_SALES', payload)
    },
    clearSelectedCustomer ({ commit }, payload) {
      commit('SET_SELECTED_CUSTOMER', null)
    },
    clearCustomers ({ commit }) {
      commit('CLEAR_CUSTOMERS')
    },
    getLoyaltyDiscount ({ commit }, payload) {
      return Vue.axios
        .post('forms/customers.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
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
    // SET_CUSTOMERS(state, data) {
    //   state.customers = data;
    // },
    SET_CUSTOMERS (state, payload) {
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      state.filteredCustomers = payload.message
      state.customers = {
        data: state.customers.data.concat(payload.message),
        nextPage: payload.next_page
      }
    },
    CLEAR_CUSTOMERS (state) {
      state.customers = {
        data: [],
        nextPage: null
      }
    },
    SET_FILTERED_CUSTOMERS (state, payload) {
      state.filteredCustomers = payload
    },
    ADD_CUSTOMER (state, data) {
      state.customers.data.unshift(data)
    }
  }
})
