/* eslint-disable */
import { sales } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE, subtractCash } from '@/utils/helper'
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    salesid: null,
    transferid: null,
    refundSales: false,
    sales: INIT_STATE,
    refundedSales: INIT_STATE,
    transferHistory: INIT_STATE,
    filteredSales: [],
    selectedSale: null,
    selectedSaleDetail: null,
    cart: {
      customer_id: null,
      sales_id: null,
      products: Array(12).fill(null),
      tax: 0,
      threshold: null,
      payment_type: null,
      discount: 0,
      customer: null,
      amountPaid: 0,
      cashChange: 0,
      loyalty: null,
      total: 0,
      subTotal: 0,
      loyalty_charge: false,
      discount_per_threshold: 0,
      availableDiscount: null,
      customerDetails: null,
      discountTotal: 0,
      taxTotal: 0,
    },
    transferCart: {
      products: Array(12).fill(null),
      source: 'branch',
      fromBranch: null,
      toBranch: null
    }
  },
  actions: {

    setCart ({ commit }, data) {
      commit('SET_CART', data)
    },

    setTransferCart ({ commit }, data) {
      commit('SET_TRANSFER_CART', data)
    },

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

    clearSelectedSaleDetail ({ commit }, payload) {
      commit('SET_SELECTED_SALE_DETAIL', null)
    },

    clearSales ({ commit }) {
      commit('CLEAR_SALES')
    },

    clearRefunds ({ commit }) {
      commit('CLEAR_REFUNDS')
    },

    clearTransferHistory ({ commit }) {
      commit('CLEAR_TRANSFER_HISTORY')
    },

    removeSale ({ commit }, sale) {
      commit('REMOVE_SALE', sale)
    },

    getReceipt ({ commit }, { id }) {
      return Vue.axios.get(`sales-history/${id}`).then(res => {
        commit('SET_SELECTED_SALE_DETAIL', res.data.data)
        return res.data.data
      })
    },

    refundSale ({ commit }, payload) {
      return sales(payload).then(res => {
        return res.data
      })
    },

    completeTransaction ({ commit }, payload) {
      return Vue.axios.post('sales', payload).then(res => {
        return res.data
      })
    },

    transferProductsToBranch ({ commit }, payload) {
      return Vue.axios.post('producttransfer', payload).then(res => {
        console.log(res)
        return res.data
      })
    },

    loadSales ({ commit }, payload) {
      return Vue.axios.get('sales-history', { params: payload }).then(res => {
        if (payload.persist) {
          console.log(res.data.body)
          commit('SET_SALES', res.data.body)
        }
        return res.data.body
      })
    },

    loadTransferHistory ({ commit }, payload) {
      return Vue.axios.get('producttransfer', { params: payload }).then(res => {
        if (payload.persist) {
          console.log(res.data.data)
          commit('SET_TRANSFER_HISTORY', res.data.data)
        }
        return res.data.body
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

    SET_REFUND_SALE_STATE (state, value) {
      state.refundSales = value
    },

    RESET_CART (state) {
      state.cart = {
        customer_id: null,
        sales_id: Date.now(),
        products: Array(12).fill(null),
        tax: 0,
        payment_type: null,
        discount: 0,
        customer: null,
        amountPaid: 0,
        cashChange: 0,
        loyalty: null,
        threshold: 0,
        discount_per_threshold: 0,
        total: 0,
        subTotal: 0,
        loyalty_charge: false,
        availableDiscount: null,
        customerDetails: null,
        discountTotal: 0,
        taxTotal: 0
      }
    }, 

    RESET_TRANSFER_CART (state) {
      state.transferCart = {
        ...state.transferCart,
        products: Array(12).fill(null),
        fromBranch: null,
        toBranch: null
      }
    }, 

    SET_CART (state, payload) {
      state.cart = {
        ...state.cart,
        ...payload,
        cashChange: Math.max((payload.amountPaid - payload.total), 0)
      }

      const products = state.cart.products
      if (!products[products.length - 1] && products.length > 12) {
        state.cart.products.splice(products.length - 1, 1)
      }
    },

    SET_TRANSFER_CART (state, payload) {
      state.transferCart = {
        ...state.transferCart,
        ...payload
      }

      const products = state.transferCart.products
      if (!products[products.length - 1] && products.length > 12) {
        state.transferCart.products.splice(products.length - 1, 1)
      }
    },

    REMOVE_CART_ITEM (state, product) {
      const products = state.cart.products.filter(p => {
        if (p) return product.id !== p.id
        return true
      })
      state.cart.products = products
    },

    REMOVE_TRANSFER_CART_ITEM (state, items) {
      const products = state.transferCart.products.filter(p => {
        if (p && items instanceof Array) {
          const itemIDS = items.map(i => i && i.id)
          return !itemIDS.includes(p.id)
        } else if (p) {
          return items.id !== p.id
        }
        return true
      })

      state.transferCart.products = products

      if (products.length < 12) {
        let rowsToAdd = 12 - products.length
        rowsToAdd = Array(rowsToAdd).fill(null)
        state.transferCart.products = [
          ...state.transferCart.products,
          ...rowsToAdd
        ]
      }

    },

    SET_SELECTED_SALE (state, data) {
      state.selectedSale = data
    },

    SET_SELECTED_SALE_DETAIL (state, data) {
      state.selectedSaleDetail = data
    },

    CLEAR_SALES (state) {
      state.sales = INIT_STATE
    },

    CLEAR_REFUNDS (state) {
      state.refundedSales = INIT_STATE
    },

    CLEAR_TRANSFER_HISTORY (state) {
      state.transferHistory = INIT_STATE
    },

    CLEAR_SALES_ID (state) {
      state.salesid = null
    },

    GENERATE_SALES_ID (state) {
      state.cart.sales_id = Date.now()
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
      UPDATE_STATE(state, payload, 'sales')
    },

    SET_TRANSFER_HISTORY (state, payload) {
      UPDATE_STATE(state, payload, 'transferHistory')
    },

    SET_REFUNDED_SALES (state, payload) {
      UPDATE_STATE(state, payload, 'refundedSales')
    }

  }
}
