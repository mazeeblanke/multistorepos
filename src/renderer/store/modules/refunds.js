/* eslint-disable */
import { sales } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE, subtractCash } from '@/utils/helper'
import Vue from 'vue'

export default {

  namespaced: true,

  state: {
    refundedSales: INIT_STATE,
    selectedRefund: null,
  },

  actions: {

    clearSelectedRefund ({ commit }, payload) {
      commit('SET_SELECTED_REFUND', null)
    },

    clearRefunds ({ commit }) {
      commit('CLEAR_REFUNDS')
    },

    loadRefunds ({ commit }, payload) {
      return Vue.axios.get('refunds', { params: payload }).then(res => {
        console.log(payload)
        if (payload.persist) {
          console.log(res.data.body)
          commit('SET_REFUNDS', res.data.data)
        }
        return res.data.data
      })
    },

    makeRefunds ({ commit }, payload) {
      return Vue.axios.post('refunds', payload).then((res) => {
        console.log(res.data.data)
        return res.data.data
      })
    },

    loadRefund ({ commit }, payload) {
      return sales(payload).then(res => {
        commit('SET_REFUNDED_SALES', res.data)
        return res.data
      })
    }

  },

  mutations: {

    SET_SELECTED_REFUND (state, data) {
      state.selectedSale = data
    },

    CLEAR_REFUNDS (state) {
      state.refundedSales = INIT_STATE
    },

    SET_REFUNDS (state, payload) {
      console.log(payload)
      UPDATE_STATE(state, payload, 'refundedSales')
    }

  }
}
