import { suppliers, search } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'

export default {
  state: {
    suppliers: INIT_STATE,
    selectedSupplier: null
  },
  actions: {

    setSelectedSupplierSales ({ commit }, payload) {
      commit('SET_SELECTED_SUPPLIER_SALES', payload)
    },

    clearSelectedSupplier ({ commit }, payload) {
      commit('SET_SELECTED_SUPPLIER', null)
    },

    clearSuppliers ({ commit }) {
      commit('CLEAR_SUPPLIERS')
    },

    loadSuppliers ({ commit }, payload) {
      return search(payload).then(res => {
        return res.data
      })
    },

    searchSupplier ({ commit }, payload) {
      return search(payload).then(res => {
        return res.data
      })
    },

    updateSupplier ({ commit }, payload) {
      return suppliers(payload).then(res => {
        return res.data
      })
    },

    getLoyaltyDiscount ({ commit }, payload) {
      return suppliers(payload).then(res => {
        return res.data
      })
    },

    loadSuppliersByPage ({ commit }, payload) {
      return suppliers(payload).then(res => {
        commit('SET_SUPPLIERS', res.data)
        return res.data
      })
    },

    createSupplier ({ commit }, payload) {
      return suppliers(payload).then(res => {
        // commit('ADD_SUPPLIER', res.data.customer_details[0]);
        return res.data
      })
    },

    loadSupplier ({ commit }, payload) {
      return suppliers(payload).then(res => {
        commit('SET_SELECTED_SUPPLIER', res.data.message[0])
        return res.data
      })
    }

  },
  mutations: {

    SET_SELECTED_SUPPLIER (state, data) {
      state.selectedSupplier = data
    },

    SET_SELECTED_SUPPLIER_SALES (state, data) {
      state.selectedeSupplier.sales = data
    },

    SET_SUPPLIERS (state, payload) {
      UPDATE_STATE(state, payload, 'suppliers')
    },

    CLEAR_SUPPLIERS (state) {
      state.suppliers = INIT_STATE
    },

    ADD_SUPPLIER (state, data) {
      state.suppliers.data.unshift(data)
    }

  }
}
