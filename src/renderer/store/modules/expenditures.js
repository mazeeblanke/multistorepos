import { expenditures } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'
import Vue from 'vue'

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

    // loadExpenditures ({ commit }, payload) {
    //   return search(payload).then(res => {
    //     return res.data
    //   })
    // },

    loadExpenditures ({ commit }, payload) {
      return Vue.axios.get('expenditures', { params: payload }).then(res => {
        if (payload.persist === true) {
          commit('SET_EXPENDITURES', res.data.data)
        }
        return res.data.data
      })
    },

    loadExpenditure ({ commit }, payload) {
      return expenditures(payload).then(res => {
        commit('SET_SELECTED_EXPENDITURE', res.data.message[0])
        return res.data
      })
    },

    createExpenditure ({ commit, rootState }, payload) {
      return Vue.axios.post('expenditures', payload).then(res => {
        if (rootState.settings.settings.branch.id === payload.branch_id) {
          commit('SET_EXPENDITURES', res.data)
        }
        return res.data
      })
    },

    updateExpenditure ({ commit }, payload) {
      return expenditures(payload).then(res => {
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
