import Vue from 'vue'
import BaseModule from '../utils/BaseModule'
// import axios from 'axios'

export default new BaseModule('sale', {
  state: {
    salesid: null,
    transferid: null,
    sales: {
      data: [],
      nextPage: null
    },
    refundedSales: {
      data: [],
      nextPage: null
    },
    filteredSales: [],
    selectedSale: null
  },
  actions: {
    clearSalesId ({ commit }) {
      commit('CLEAR_SALES_ID')
    },
    generateSalesId ({ commit }) {
      commit('GENERATE_SALES_ID')
    },
    clearTransferId ({ commit }) {
      commit('CLEAR_TRANSFER_ID')
    },
    generateTransferId ({ commit }) {
      commit('GENERATE_TRANSFER_ID')
    },
    getReceipt ({ commit }, payload) {
      return Vue.axios
        .post('forms/sales.php', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(res => {
          return res.data
        })
    },
    addToCart ({ commit }, payload) {
      return Vue.axios
        .post('forms/sales.php', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(res => {
          return res.data
        })
    },
    checkForThreshold ({ commit }, payload) {
      return Vue.axios
        .post('forms/sales.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          return res.data
        })
    },
    removeFromCart ({ commit }, payload) {
      return Vue.axios
        .post('forms/sales.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          return res.data
        })
    },
    refundSale ({ commit }, payload) {
      return Vue.axios
        .post('forms/sales.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          return res.data
        })
    },
    updateCart ({ commit }, payload) {
      return Vue.axios
        .post('forms/sales.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          return res.data
        })
    },
    updateOasBranchProducts ({ commit }, payload) {
      // const axiosInstance = axios.create()
      return Vue.OAS.post('api/pos/issue-items', payload)
    },
    completeTransaction ({ commit }, payload) {
      return Vue.axios
        .post('forms/sales.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        // .then(() => {
        //    const axiosInstance = axios.create()
        //    return axiosInstance
        //     .post(
        //       'https://oxbridge-dev-api.herokuapp.com//api/pos/issue-items',
        //       {
        //         pos_branch_id: ,
        //         issue_quantity: ,
        //       },
        //     )
        // })
        .then(res => {
          return res.data
        })
    },
    loadSales ({ commit }, payload) {
      return Vue.axios
        .post('forms/sales.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          return res.data
        })
    },
    // loadRefundedSales({ commit }, payload) {
    //   return Vue.axios
    //     .post('forms/sales.php', payload, {
    //       headers: { 'Content-Type': 'multipart/form-data' },
    //     })
    //     .then(res => {
    //       return res.data;
    //     });
    // },
    loadSalesByPage ({ commit }, payload) {
      return Vue.axios
        .post('forms/sales.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // console.log(res.data);
          commit('SET_SALES', res.data)
          return res.data
        })
    },
    loadRefundsByPage ({ commit }, payload) {
      return Vue.axios
        .post('forms/sales.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // console.log(res.data);
          commit('SET_REFUNDED_SALES', res.data)
          return res.data
        })
    },
    clearSelectedSale ({ commit }, payload) {
      commit('SET_SELECTED_SALE', null)
    },
    clearSales ({ commit }) {
      commit('CLEAR_SALES')
    },
    clearRefunds ({ commit }) {
      commit('CLEAR_REFUNDS')
    },
    removeSale ({ commit }, sale) {
      commit('REMOVE_SALE', sale)
    }
  },
  mutations: {
    SET_SELECTED_SALE (state, data) {
      state.selectedSale = data
    },
    CLEAR_SALES (state) {
      state.sales = {
        data: [],
        nextPage: null
      }
    },
    CLEAR_REFUNDS (state) {
      state.refundedSales = {
        data: [],
        nextPage: null
      }
    },
    CLEAR_SALES_ID (state) {
      state.salesid = null
    },
    GENERATE_SALES_ID (state) {
      state.salesid = Date.now()
    },
    SET_SALES_ID (state, payload) {
      state.salesid = payload
    },
    CLEAR_TRANSFER_ID (state) {
      state.transferid = null
    },
    GENERATE_TRANSFER_ID (state) {
      state.transferid = Date.now()
    },
    REMOVE_SALE (state, sale) {
      state.sales.data.splice(state.sales.data.indexOf(sale), 1)
    },
    SET_FILTERED_SALES (state, payload) {
      state.filteredSales = payload
    },
    SET_SALES (state, payload) {
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      state.filteredSales = payload.message
      state.sales = {
        data: state.sales.data.concat(payload.message),
        nextPage: payload.next_page
      }
    },
    SET_REFUNDED_SALES (state, payload) {
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      // state.filteredSales = payload.message;
      state.refundedSales = {
        data: state.refundedSales.data.concat(payload.message),
        nextPage: payload.next_page
      }
    }
  }
})
