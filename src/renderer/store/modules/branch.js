import { branches, search } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    branches: INIT_STATE,
    branchSuggestions: [],
    selectedBranch: {},
    currentBranch: {}
  },
  actions: {

    setSelectedBranchSales ({ commit }, payload) {
      commit('SET_SELECTED_BRANCH_SALES', payload)
    },

    clearSelectedBranch ({ commit }, payload) {
      commit('SET_SELECTED_BRANCH', null)
    },

    clearBranches ({ commit }) {
      commit('CLEAR_BRANCHES')
    },

    searchBranches ({ commit }, payload) {
      return search(payload).then(res => {
        return res.data
      })
    },

    loadBranch ({ commit }, payload) {
      return branches(payload).then(res => {
        commit('SET_SELECTED_BRANCH', res.data.message[0])
      })
    },

    deleteBranch ({ commit }, payload) {
      return branches(payload).then(res => {
        commit('REMOVE_BRANCH', payload.employee)
        return res.data
      })
    },

    createBranch ({ commit }, payload) {
      return Vue.axios.post('branches', payload).then(res => {
        commit('ADD_BRANCH', res.data.data)
        return res.data
      })
    },

    updateBranch ({ commit }, payload) {
      return branches(payload).then(res => {
        // commit('ADD_BRANCH', payload.customer);
        return res.data
      })
    },

    loadBranches ({ commit }, payload) {
      return Vue.axios.get('branches', { params: payload }).then(res => {
        if (payload.persist) {
          commit('SET_BRANCHES', res.data.data)
        }
        return res.data.data
      })
    }

  },
  mutations: {

    SET_CURRENT_BRANCH (state, data) {
      state.currentBranch = data
    },

    SET_SELECTED_BRANCH (state, data) {
      state.selectedBranch = { ...{ sales: [] }, ...data }
    },

    SET_SELECTED_BRANCH_SALES (state, data) {
      state.selectedBranch.sales = data
    },

    SET_BRANCHES (state, payload) {
      UPDATE_STATE(state, payload, 'branches')
    },

    SET_BRANCH_SUGGESTIONS (state, payload) {
      state.branchSuggestions = payload
    },

    REMOVE_BRANCH (state, employee) {
      state.branches.data.splice(state.branches.data.indexOf(employee), 1)
    },

    CLEAR_BRANCHES (state) {
      state.branches = INIT_STATE
    },

    ADD_BRANCH (state, data) {
      state.branches.data.unshift(data)
    }

  }
}
