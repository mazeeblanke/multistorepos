import { expenditures, search } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'

export default {
  namespaced: true,
  state: {
    expenditures: INIT_STATE,
    selectedExpenditure: null
  },
  actions: {

    setSelectedExpenditureSales ({ commit }, payload) {
      commit('SET_SELECTED_EXPENDITURE_SALES', payload)
    },

    clearSelectedExpenditure ({ commit }, payload) {
      commit('SET_SELECTED_EXPENDITURE', null)
    },

    clearExpenditures ({ commit }) {
      commit('CLEAR_EXPENDITURES')
    },

    loadExpenditures ({ commit }, payload) {
      return search(payload).then(res => {
        return res.data
      })
    },

    loadExpendituresByPage ({ commit }, payload) {
      const data = payload.filter || payload
      return expenditures(data).then(res => {
        if (!payload.filter) commit('SET_EXPENDITURES', res.data)
        return res.data
      })
    },

    loadExpenditure ({ commit }, payload) {
      return expenditures(payload).then(res => {
        commit('SET_SELECTED_EXPENDITURE', res.data.message[0])
        return res.data
      })
    },

    createExpenditure ({ commit }, payload) {
      return expenditures(payload).then(res => {
        // commit('ADD_EXPENDITURE', res.data.customer_details[0]);
        return res.data
      })
    },

    updateExpenditure ({ commit }, payload) {
      return expenditures(payload).then(res => {
        // commit('ADD_EXPENDITURE', payload.customer);
        return res.data
      })
    }

  },
  mutations: {

    SET_SELECTED_EXPENDITURE (state, data) {
      state.selectedExpenditure = { ...{ sales: [] }, ...data }
    },

    SET_SELECTED_EXPENDITURE_SALES (state, data) {
      state.selectedExpenditure.sales = data
    },

    SET_EXPENDITURES (state, payload) {
      UPDATE_STATE(state, payload, 'expenditures')
    },

    CLEAR_EXPENDITURES (state) {
      state.expenditures = INIT_STATE
    },

    ADD_EXPENDITURE (state, data) {
      state.expenditures.data.unshift(data)
    }

  }
}
