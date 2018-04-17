import Vue from 'vue'
import BaseModule from '../utils/BaseModule'
// import axios from 'axios';

export default new BaseModule('product', {
  state: {
    products: {
      data: [],
      nextPage: null
    },
    changedProducts: {
      data: [],
      nextPage: null
    },
    productEnquiries: {
      data: [],
      nextPage: null
    },
    closeToExpiredProducts: {
      data: [],
      nextPage: null
    },
    expiredProducts: {
      data: [],
      nextPage: null
    },
    reorderProducts: {
      data: [],
      nextPage: null
    },
    selectedProduct: null,
    selectedProductEnquiry: null
    // reorderProducts: null,
    // expiredProducts: null,
    // closeToExpiredProducts: null,
  },
  actions: {
    loadProducts ({ commit }, payload) {
      return Vue.axios
        .get(
          'forms/search.php',
          { params: payload },
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then(res => {
          return res.data
        })
    },
    getProductsStats ({ commit }, payload) {
      return Vue.axios
        .post('forms/products.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          return res.data
        })
    },
    getSupplierProducts ({ commit }, payload) {
      return Vue.axios
        .post('forms/products.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          return res.data.message
        })
    },
    loadProduct ({ commit }, payload) {
      return Vue.axios
        .post('forms/products.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          commit('SET_SELECTED_PRODUCT', res.data.message[0])
        })
    },
    loadProductEnquiry ({ commit }, payload) {
      return Vue.axios
        .post('forms/products.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // console, log(res);
          commit('SET_SELECTED_PRODUCT_ENQUIRY', res.data.message[0])
        })
    },
    loadProductsByPage ({ commit }, payload) {
      return Vue.axios
        .post('forms/products.php', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(res => {
          // console.log(res.data);
          commit('SET_PRODUCTS', res.data)
          return res.data
        })
    },
    loadProductInBranches ({ commit }, payload) {
      return Vue.axios
        .post('forms/products.php', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(res => {
          return res.data
        })
    },
    loadProductChangesByPage ({ commit }, payload) {
      return Vue.axios
        .post('forms/products.php', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(res => {
          // console.log(res.data);
          commit('SET_CHANGED_PRODUCTS', res.data)
          return res.data
        })
    },
    loadProductEnquiriesByPage ({ commit }, payload) {
      return Vue.axios
        .post('forms/products.php', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(res => {
          // console.log(res.data);
          commit('SET_PRODUCTS_ENQUIRIES', res.data)
          return res.data
        })
    },
    createProduct ({ commit }, payload) {
      console.log(payload.productFormData)
      // for (let key in object) {
      //   // formData.append(key, object[key])
      //   console.log(key, object[key])
      // }

      return Vue.axios
        .post('forms/products.php', payload.productFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('SET_PRODUCTS', res.data);
          return res.data
        })
    },
    addEnquiry ({ commit }, payload) {
      return Vue.axios
        .post('forms/products.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('SET_PRODUCTS', res.data);
          return res.data
        })
    },
    addProductSupply ({ commit }, payload) {
      return Vue.axios
        .post('forms/products.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('SET_PRODUCTS', res.data);
          return res.data
        })
    },
    deleteProduct ({ commit }, payload) {
      return Vue.axios
        .post('forms/products.php', payload.formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          commit('REMOVE_PRODUCT', payload.product)
          return res.data
        })
    },
    updateProduct ({ commit }, payload) {
      return Vue.axios
        .post('forms/products.php', payload.productFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_CUSTOMER', payload.customer);
          return res.data
        })
    },
    updateProductEnquiry ({ commit }, payload) {
      return Vue.axios
        .post('forms/products.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_CUSTOMER', payload.customer);
          return res.data
        })
    },
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
    }
  },
  mutations: {
    SET_SELECTED_PRODUCT (state, data) {
      state.selectedProduct = { ...data, sales: [] }
    },
    SET_SELECTED_PRODUCT_ENQUIRY (state, data) {
      state.selectedProductEnquiry = data
    },
    SET_SELECTED_PRODUCT_SALES (state, data) {
      state.selectedProduct.sales = data
    },
    SET_PRODUCTS (state, payload) {
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      state.products = {
        data: state.products.data.concat(payload.message),
        nextPage: payload.next_page
      }
    },
    SET_PRODUCTS_ENQUIRIES (state, payload) {
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      state.productEnquiries = {
        data: state.productEnquiries.data.concat(payload.message),
        nextPage: payload.next_page
      }
      // console.log(state.productEnquiries);
    },
    ADD_ENQUIRY (state, payload) {
      // if (payload.message instanceof Object) {
      //   payload.message = Object.values(payload.message);
      // }
      state.productEnquiries.data.unshift(payload)
      // console.log(state.productEnquiries);
    },
    CLEAR_PRODUCTS (state) {
      state.products = {
        data: [],
        nextPage: null
      }
    },
    CLEAR_CLOSE_TO_EXPIRED_PRODUCTS (state) {
      state.closeToExpiredProducts = {
        data: [],
        nextPage: null
      }
    },
    CLEAR_EXPIRED_PRODUCTS (state) {
      state.expiredProducts = {
        data: [],
        nextPage: null
      }
    },
    CLEAR_REORDER_PRODUCTS (state) {
      state.reorderProducts = {
        data: [],
        nextPage: null
      }
    },
    CLEAR_PRODUCTS_ENQUIRIES (state) {
      state.productEnquiries = {
        data: [],
        nextPage: null
      }
    },
    CLEAR_CHANGED_PRODUCTS (state) {
      state.changedProducts = {
        data: [],
        nextPage: null
      }
    },
    REMOVE_PRODUCT (state, product) {
      state.products.data.splice(state.products.data.indexOf(product), 1)
    },
    SET_EXPIRED_PRODUCTS (state, payload) {
      // state.expiredProducts = data;
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      state.expiredProducts = {
        data: state.expiredProducts.data.concat(payload.message),
        nextPage: payload.next_page
      }
    },
    SET_CLOSE_TO_EXPIRED_PRODUCTS (state, payload) {
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      state.closeToExpiredProducts = {
        data: state.closeToExpiredProducts.data.concat(payload.message),
        nextPage: payload.next_page
      }
    },
    SET_REORDER_PRODUCTS (state, payload) {
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      state.reorderProducts = {
        data: state.reorderProducts.data.concat(payload.message),
        nextPage: payload.next_page
      }
    },
    SET_CHANGED_PRODUCTS (state, payload) {
      console.log(payload)
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      state.changedProducts = {
        data: state.changedProducts.data.concat(payload.message),
        nextPage: payload.next_page
      }
    }
  }
})
