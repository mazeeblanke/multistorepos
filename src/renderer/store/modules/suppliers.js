import Vue from 'vue'
import BaseModule from '../utils/BaseModule'
// import axios from 'axios';

export default new BaseModule('supplier', {
  state: {
    suppliers: {
      data: [],
      nextPage: null
    },
    selectedSupplier: null
  },
  actions: {
    loadSuppliers ({ commit }, payload) {
      return Vue.axios
        .get(
          'forms/search.php',
          { params: payload },
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then(res => {
          // commit('SET_SUPPLIERS', res.data);
          return res.data
        })
    },
    loadSuppliersByPage ({ commit }, payload) {
      return Vue.axios
        .post('forms/suppliers.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // console.log(res.data);
          commit('SET_SUPPLIERS', res.data)
          return res.data
        })
    },
    loadSupplier ({ commit }, payload) {
      return Vue.axios
        .post('forms/suppliers.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          commit('SET_SELECTED_SUPPLIER', res.data.message[0])
        })
    },
    searchSupplier ({ commit }, payload) {
      return Vue.axios
        .get('forms/search.php', { params: payload }, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          return res.data
          // commit('SET_SELECTED_SUPPLIER', res.data.message[0]);
        })
    },
    createOASSupplier ({ commit }, payload) {
      console.log(payload)
      return Vue.OAS.post('api/pos_vendors', payload)
    },
    updateOASSupplier ({ commit }, payload) {
      return Vue.OAS.put(`api/vendors/${payload.pos_vendor_id}`, payload)
    },
    createSupplier ({ commit }, payload) {
      return Vue.axios
        .post('forms/suppliers.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_SUPPLIER', res.data.customer_details[0]);
          return res.data
        })
    },
    updateSupplier ({ commit }, payload) {
      return Vue.axios
        .post('forms/suppliers.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_SUPPLIER', payload.customer);
          return res.data
        })
    },
    setSelectedSupplierSales ({ commit }, payload) {
      commit('SET_SELECTED_SUPPLIER_SALES', payload)
    },
    clearSelectedSupplier ({ commit }, payload) {
      commit('SET_SELECTED_SUPPLIER', null)
    },
    clearSuppliers ({ commit }) {
      commit('CLEAR_SUPPLIERS')
    },
    getLoyaltyDiscount ({ commit }, payload) {
      return Vue.axios
        .post('forms/suppliers.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_SUPPLIER', payload.customer);
          return res.data
        })
    }
  },
  mutations: {
    SET_SELECTED_SUPPLIER (state, data) {
      console.log(data)
      state.selectedSupplier = data
    },
    SET_SELECTED_SUPPLIER_SALES (state, data) {
      state.selectedeSupplier.sales = data
    },
    // SET_SUPPLIERS(state, data) {
    //   state.suppliers = data;
    // },
    SET_SUPPLIERS (state, payload) {
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      state.suppliers = {
        data: state.suppliers.data.concat(payload.message),
        nextPage: payload.next_page
      }
    },
    CLEAR_SUPPLIERS (state) {
      state.suppliers = {
        data: [],
        nextPage: null
      }
    },
    ADD_SUPPLIER (state, data) {
      state.suppliers.data.unshift(data)
    }
  }
})
