import { products } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'
import Vue from 'vue'

/* eslint-disable */

export default {
  namespaced: true,
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
      return Vue.axios.get('products', { params: payload }).then((res) => {
        let products = res.data.products
        let data = products.data.map((p) => {
          let branch = {}
          if (p.branches && p.branches.length) {
            branch = {
              ...p.branches[0],
              ...p.branches[0].pivot
            }
            delete branch.pivot
            delete p.branches
          }

          return {
            ...p,
            branch
          }
        })

        products = { ...products, data }

        if (payload.persist & payload.isReorderProducts) {
          commit('SET_REORDER_PRODUCTS', products)
        } else if (payload.persist) {
          commit('SET_PRODUCTS', products)
        }

        return products
      })
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

    loadProduct ({ commit }, { id, branch_id }) {
      return Vue.axios.get(`product/${id}`, { params: { branch_id } }).then(res => {
        commit('SET_SELECTED_PRODUCT', res.data.product)
      })
    },

    // loadProductEnquiry ({ commit }, payload) {
    //   return products(payload).then(res => {
    //     commit('SET_SELECTED_PRODUCT_ENQUIRY', res.data.message[0])
    //   })
    // },

    // loadProductsByPage ({ commit }, payload) {
    //   return products(payload).then(res => {
    //     commit('SET_PRODUCTS', res.data)
    //     return res.data
    //   })
    // },

    // loadProductInBranches ({ commit }, payload) {
    //   return products(payload).then(res => {
    //     return res.data
    //   })
    // },

    // loadProductChangesByPage ({ commit }, payload) {
    //   return products(payload).then(res => {
    //     commit('SET_CHANGED_PRODUCTS', res.data)
    //     return res.data
    //   })
    // },

    loadProductEnquiries ({ commit }, payload) {
      return Vue.axios.get('productinquiry', { params: payload }).then(res => {
        if (payload.persist) {
          commit('SET_PRODUCTS_ENQUIRIES', res.data.data)
        }
        return res.data.data
      })
    },

    loadProductCategories ({ commit }, payload) {
      return Vue.axios.get('product-category', { params: payload }).then(res => {
        return res.data.data
      })
    },

    createProduct ({ commit }, payload) {
      return Vue.axios.post('products', payload).then(res => {
        commit('SET_PRODUCTS', res.data)
        return res.data
      })
    },

    addEnquiry ({ commit }, payload) {
      return Vue.axios.post('productinquiry', payload).then(res => {
        commit('SET_ENQUIRIES', res.data)
        return res.data
      })
    },

    updateProductEnquiry ({ commit }, { products: payload }) {
      return Vue
      .axios
      .patch(`productinquiry/${payload[0].product_id}`, payload[0])
      .then(res => {
        commit('UPDATE_PRODUCT_ENQUIRY', res.data.data)
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
        commit('REMOVE_PRODUCT', payload.product)
        return res.data
      })
    },

    updateProduct ({ commit }, payload) {
      return Vue.axios.patch(`products/${payload.id}`, payload).then(res => {
        commit('SET_SELECTED_PRODUCT', res.data.data)
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
      state.selectedProduct = { 
        sales: { data: [] },
        ...state.selectedProduct,
        ...data
      }
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

    SET_ENQUIRIES (state, payload) {
      UPDATE_STATE(state, payload, 'productEnquiries')
    },

    SET_PRODUCT (state, payload) {
      state.products.data = state.products.data.concat(payload.data)
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

    UPDATE_PRODUCT_ENQUIRY (state, payload) {
      const foundIndex = state.productEnquiries.data.findIndex(e => e.id === payload.id)
      Vue.set(state.productEnquiries.data, foundIndex, payload)
    },

    SET_CHANGED_PRODUCTS (state, payload) {
      UPDATE_STATE(state, payload, 'changedProducts')
    }

  }
}
