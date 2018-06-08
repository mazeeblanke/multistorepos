import { bankingCash } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    bankingcashs: INIT_STATE,
    selectedBankingcash: null
  },
  actions: {

    setSelectedBankingcashSales ({ commit }, payload) {
      commit('SET_SELECTED_BANKING_CASH_SALES', payload)
    },

    clearSelectedBankingcash ({ commit }, payload) {
      commit('SET_SELECTED_BANKING_CASH', null)
    },

    clearBankingcashs ({ commit }) {
      commit('CLEAR_BANKING_CASHS')
    },

    loadBankingcashs ({ commit }, payload) {
      return Vue.axios.get('bankingcash', { params: payload }).then(res => {
        if (payload.persist === true) {
          commit('SET_BANKING_CASHS', res.data.data)
        }
        return res.data.data
      })
    },

    loadBankingcash ({ commit }, payload) {
      return bankingCash(payload).then(res => {
        commit('SET_SELECTED_BANKING_CASH', res.data.message[0])
      })
    },

    createBankingcash ({ commit, rootState }, payload) {
      return Vue.axios.post('bankingcash', payload).then(res => {
        if (rootState.settings.settings.branch.id === payload.branch_id) {
          commit('SET_BANKING_CASHS', res.data)
        }
        return res.data
      })
    },

    updateBankingcash ({ commit }, payload) {
      return bankingCash(payload).then(res => {
        // commit('ADD_BANKING_CASH', payload.customer);
        return res.data
      })
    },

    loadBankingcashsByPage ({ commit }, payload) {
      const data = payload.filter || payload
      return bankingCash(data).then(res => {
        if (!payload.filter) commit('SET_BANKING_CASHS', res.data)
        return res.data
      })
    }

  },
  mutations: {

    SET_SELECTED_BANKING_CASH (state, data) {
      state.selectedBankingcash = { ...{ sales: [] }, ...data }
    },

    SET_SELECTED_BANKING_CASH_SALES (state, data) {
      state.selectedBankingcash.sales = data
    },

    SET_BANKING_CASHS (state, payload) {
      UPDATE_STATE(state, payload, 'bankingcashs')
    },

    CLEAR_BANKING_CASHS (state) {
      state.bankingcashs = INIT_STATE
    },

    ADD_BANKING_CASH (state, data) {
      state.bankingcashs.data.unshift(data)
    }

  }
}
