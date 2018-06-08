import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'
import Vue from 'vue'

export default {
  namespaced: true,
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

    updateSupplier ({ commit }, payload) {
      return Vue.axios.patch(`supplier/${payload.id}`, payload).then(res => {
        commit('SET_SELECTED_SUPPLIER', res.data.data)
        return res.data
      })
    },

    loadSuppliers ({ commit }, payload) {
      return Vue.axios.get('suppliers', { params: payload }).then(res => {
        if (payload.persist) {
          commit('SET_SUPPLIERS', res.data.data)
        }
        return res.data.data
      })
    },

    createSupplier ({ commit }, payload) {
      return Vue.axios.post('suppliers', payload).then(res => {
        commit('SET_SUPPLIERS', res.data)
        return res.data
      })
    },

    loadSupplier ({ commit }, payload) {
      return Vue.axios.get(`suppliers/${payload.id}`).then(res => {
        commit('SET_SELECTED_SUPPLIER', res.data.data)
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
