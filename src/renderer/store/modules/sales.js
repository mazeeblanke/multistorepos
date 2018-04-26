/* eslint-disable */
import BaseModule from '../utils/BaseModule'
import { sales } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'

export default {
  state: {
    salesid: null,
    transferid: null,
    sales: INIT_STATE,
    refundedSales: INIT_STATE,
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
    },

    getReceipt ({ commit }, payload) {
      return sales(payload).then(res => {
        return res.data
      })
    },

    addToCart ({ commit }, payload) {
      return sales(payload).then(res => {
        return res.data
      })
    },

    checkForThreshold ({ commit }, payload) {
      return sales(payload).then(res => {
        return res.data
      })
    },

    removeFromCart ({ commit }, payload) {
      return sales(payload).then(res => {
        return res.data
      })
    },

    refundSale ({ commit }, payload) {
      return sales(payload).then(res => {
        return res.data
      })
    },

    updateCart ({ commit }, payload) {
      return sales(payload).then(res => {
        return res.data
      })
    },

    completeTransaction ({ commit }, payload) {
      return sales(payload).then(res => {
        return res.data
      })
    },

    loadSales ({ commit }, payload) {
      return sales(payload).then(res => {
        return res.data
      })
    },

    loadSalesByPage ({ commit }, payload) {
      return sales(payload).then(res => {
        commit('SET_SALES', res.data)
        return res.data
      })
    },

    loadRefundsByPage ({ commit }, payload) {
      return sales(payload).then(res => {
        commit('SET_REFUNDED_SALES', res.data)
        return res.data
      })
    }

  },
  mutations: {

    SET_SELECTED_SALE (state, data) {
      state.selectedSale = data
    },

    CLEAR_SALES (state) {
      state.sales = INIT_STATE
    },

    CLEAR_REFUNDS (state) {
      state.refundedSales = INIT_STATE
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
      state.filteredSales = payload.message
      UPDATE_STATE(state, payload, 'sales')
    },

    SET_REFUNDED_SALES (state, payload) {
      UPDATE_STATE(state, payload, 'refundedSales')
    }

  }
}
