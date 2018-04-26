/* eslint-disable */
import Vue from 'vue'
import BaseModule from '../utils/BaseModule'
import { products, search } from '../../service/endpoints'
import { HTTP_VERBS, INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'

export default new BaseModule('product', {
  state: {
    products: INIT_STATE,
    changedProducts: INIT_STATE,
    productEnquiries: INIT_STATE,
    closeToExpiredProducts: INIT_STATE,
    expiredProducts: INIT_STATE,
    reorderProducts: INIT_STATE,
    selectedProduct: null,
    selectedProductEnquiry: null
  },
  actions: {

    setSelectedProductSales ({ commit }, payload) {
      commit('SET_SELECTED_PRODUCT_SALES', payload)
    },

    clearSelectedProduct ({ commit }, payload) {
      commit('SET_SELECTED_PRODUCT', null)
    },

    clearProducts ({ commit }) {
      commit('CLEAR_PRODUCTS')
    },

    clearCloseToExpiredProducts ({ commit }) {
      commit('CLEAR_CLOSE_TO_EXPIRED_PRODUCTS')
    },

    clearExpiredProducts ({ commit }) {
      commit('CLEAR_EXPIRED_PRODUCTS')
    },

    clearChangedProducts ({ commit }) {
      commit('CLEAR_CHANGED_PRODUCTS')
    },

    clearReorderProducts ({ commit }) {
      commit('CLEAR_REORDER_PRODUCTS')
    },

    clearProductEnquiries ({ commit }) {
      commit('CLEAR_PRODUCTS_ENQUIRIES')
    },

    loadProducts ({ commit }, payload) {
      return search(payload).then(res => {
        return res.data;
      });
    },

    getProductsStats ({ commit }, payload) {
      return products(payload).then(res => {
        return res.data
      })
    },

    getSupplierProducts ({ commit }, payload) {
      return products(payload).then(res => {
        return res.data.message
      })
    },

    loadProduct ({ commit }, payload) {
      return products(payload).then(res => {
        commit("SET_SELECTED_PRODUCT", res.data.message[0])
      })
    },

    loadProductEnquiry ({ commit }, payload) {
      return products(payload).then(res => {
        commit("SET_SELECTED_PRODUCT_ENQUIRY", res.data.message[0])
      })
    },

    loadProductsByPage ({ commit }, payload) {
      return products(payload).then(res => {
        commit('SET_PRODUCTS', res.data)
        return res.data
      })
    },

    loadProductInBranches ({ commit }, payload) {
      return products(payload).then(res => {
        return res.data
      })
    },

    loadProductChangesByPage ({ commit }, payload) {
      return products(payload).then(res => {
        commit("SET_CHANGED_PRODUCTS", res.data)
        return res.data
      })
    },

    loadProductEnquiriesByPage ({ commit }, payload) {
      return products(payload).then(res => {
        commit("SET_PRODUCTS_ENQUIRIES", res.data)
        return res.data
      })
    },

    createProduct ({ commit }, payload) {
      return products(payload.productFormData).then(res => {
        return res.data
      })
    },

    addEnquiry ({ commit }, payload) {
      return products(payload).then(res => {
        return res.data
      })
    },

    addProductSupply ({ commit }, payload) {
      return products(payload).then(res => {
        return res.data
      })
    },

    deleteProduct ({ commit }, payload) {
      return products(payload.formData).then(res => {
        commit("REMOVE_PRODUCT", payload.product)
        return res.data
      })
    },

    updateProduct ({ commit }, payload) {
      return products(payload.productFormData).then(res => {
        return res.data
      })
    },

    updateProductEnquiry ({ commit }, payload) {
      return products(payload).then(res => {
         return res.data
      })
    }

  },
  mutations: {

    CLEAR_PRODUCTS (state) {
      state.products = INIT_STATE
    },

    CLEAR_CLOSE_TO_EXPIRED_PRODUCTS (state) {
      state.closeToExpiredProducts = INIT_STATE
    },

    CLEAR_EXPIRED_PRODUCTS (state) {
      state.expiredProducts = INIT_STATE
    },

    CLEAR_REORDER_PRODUCTS (state) {
      state.reorderProducts = INIT_STATE
    },

    CLEAR_PRODUCTS_ENQUIRIES (state) {
      state.productEnquiries = INIT_STATE
    },

    CLEAR_CHANGED_PRODUCTS (state) {
      state.changedProducts = INIT_STATE
    },

    SET_SELECTED_PRODUCT (state, data) {
      state.selectedProduct = { ...data, sales: [] }
    },

    SET_SELECTED_PRODUCT_ENQUIRY (state, data) {
      state.selectedProductEnquiry = data
    },

    SET_SELECTED_PRODUCT_SALES (state, data) {
      state.selectedProduct.sales = data
    },

    ADD_ENQUIRY (state, payload) {
      state.productEnquiries.data.unshift(payload)
    },

    REMOVE_PRODUCT (state, product) {
      state.products.data.splice(state.products.data.indexOf(product), 1)
    },

    SET_PRODUCTS (state, payload) {
      UPDATE_STATE(state, payload, 'products')
    },

    SET_PRODUCTS_ENQUIRIES (state, payload) {
      UPDATE_STATE(state, payload, 'productEnquiries')
    },

    SET_EXPIRED_PRODUCTS (state, payload) {
      UPDATE_STATE(state, payload, 'expiredProducts')
    },

    SET_CLOSE_TO_EXPIRED_PRODUCTS (state, payload) {
      UPDATE_STATE(state, payload, 'closeToExpiredProducts')
    },

    SET_REORDER_PRODUCTS (state, payload) {
      UPDATE_STATE(state, payload, 'reorderProducts')
    },

    SET_CHANGED_PRODUCTS (state, payload) {
      UPDATE_STATE(state, payload, 'changedProducts')
    }

  }
})
