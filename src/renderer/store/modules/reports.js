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
    loadReport ({ commit }, payload) {
      return Vue.axios.get('reports', { params: payload }).then(res => {
        return res.data
      })
    },

    loadProfitLossReport ({ commit }, payload) {
      return Vue.axios.get('profitloss', { params: payload }).then(res => {
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
