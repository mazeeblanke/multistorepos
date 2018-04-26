import { openingCash, search } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'

export default {
  namespaced: true,
  state: {
    openingcashs: INIT_STATE,
    selectedOpeningcash: null
  },
  actions: {

    setSelectedOpeningcashSales ({ commit }, payload) {
      commit('SET_SELECTED_OPENING_CASH_SALES', payload)
    },

    clearSelectedOpeningcash ({ commit }, payload) {
      commit('SET_SELECTED_OPENING_CASH', null)
    },

    clearOpeningcashs ({ commit }) {
      commit('CLEAR_OPENING_CASHS')
    },

    loadOpeningcashs ({ commit }, payload) {
      return search(payload).then(res => {
        return res.data
      })
    },

    createOpeningcash ({ commit }, payload) {
      return openingCash(payload).then(res => {
        // commit('ADD_OPENING_CASH', res.data.customer_details[0])
        return res.data
      })
    },

    updateOpeningcash ({ commit }, payload) {
      return openingCash(payload).then(res => {
        // commit('ADD_OPENING_CASH', payload.customer);
        return res.data
      })
    },

    getLoyaltyDiscount ({ commit }, payload) {
      return openingCash(payload).then(res => {
        return res.data
      })
    },

    loadOpeningcashsByPage ({ commit }, payload) {
      const data = payload.filter || payload
      return openingCash(data).then(res => {
        if (!payload.filter) commit('SET_OPENING_CASHS', res.data)
        return res.data
      })
    },

    loadOpeningcash ({ commit }, payload) {
      return openingCash(payload).then(res => {
        commit('SET_SELECTED_OPENING_CASH', res.data.message[0])
        return res.data
      })
    }

  },
  mutations: {

    SET_SELECTED_OPENING_CASH (state, data) {
      state.selectedOpeningcash = { ...{ sales: [] }, ...data }
    },

    SET_SELECTED_OPENING_CASH_SALES (state, data) {
      state.selectedOpeningcash.sales = data
    },

    SET_OPENING_CASHS (state, payload) {
      UPDATE_STATE(state, payload, 'openingcashs')
    },

    CLEAR_OPENING_CASHS (state) {
      state.openingcashs = INIT_STATE
    },

    ADD_OPENING_CASH (state, data) {
      state.openingcashs.data.unshift(data)
    }

  }
}
