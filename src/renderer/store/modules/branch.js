import { branches, search } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'

export default {
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

    loadBranchesByPage ({ commit }, payload) {
      return branches(payload).then(res => {
        commit('SET_BRANCHES', res.data)
        return res.data
      })
    },

    deleteBranch ({ commit }, payload) {
      return branches(payload).then(res => {
        commit('REMOVE_BRANCH', payload.employee)
        return res.data
      })
    },

    createBranch ({ commit }, payload) {
      return branches(payload).then(res => {
        // commit('ADD_BRANCH', res.data.customer_details[0]);
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
      return branches(payload).then(res => {
        commit('SET_BRANCH_SUGGESTIONS', res.data.message)
        return res.data.message
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
