import Vue from 'vue'
import BaseModule from '../utils/BaseModule'
// import axios from 'axios';

export default new BaseModule('product', {
  state: {
    branches: {
      data: [],
      nextPage: null
    },
    branchSuggestions: [],
    selectedBranch: {},
    currentBranch: {}
  },
  actions: {
    searchBranches ({ commit }, payload) {
      return Vue.axios
        .get(
          'forms/search.php',
          { params: payload },
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then(res => {
          // commit('SET_BRANCHES', res.data);
          return res.data
        })
    },
    loadBranchesByPage ({ commit }, payload) {
      return Vue.axios
        .post('forms/branch.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // console.log(res.data);
          commit('SET_BRANCHES', res.data)
          return res.data
        })
    },
    deleteBranch ({ commit }, payload) {
      return Vue.axios
        .post('forms/branch.php', payload.formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          commit('REMOVE_BRANCH', payload.employee)
          return res.data
        })
    },
    loadBranch ({ commit }, payload) {
      return Vue.axios
        .post('forms/branch.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          commit('SET_SELECTED_BRANCH', res.data.message[0])
        })
    },
    createOASBranch ({ commit }, payload) {
      console.log(payload)
      return Vue.OAS.post('api/create-branch', payload)
    },
    updateOASBranch ({ commit }, payload) {
      return Vue.OAS.put(`api/create-branch/${payload.pos_branch_id}`, payload)
    },
    createBranch ({ commit }, payload) {
      return Vue.axios
        .post('forms/branch.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_BRANCH', res.data.customer_details[0]);
          return res.data
        })
    },
    updateBranch ({ commit }, payload) {
      return Vue.axios
        .post('forms/branch.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_BRANCH', payload.customer);
          return res.data
        })
    },
    setSelectedBranchSales ({ commit }, payload) {
      commit('SET_SELECTED_BRANCH_SALES', payload)
    },
    clearSelectedBranch ({ commit }, payload) {
      commit('SET_SELECTED_BRANCH', null)
    },
    clearBranches ({ commit }) {
      commit('CLEAR_BRANCHES')
    },
    getLoyaltyDiscount ({ commit }, payload) {
      return Vue.axios
        .post('forms/branch.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_BRANCH', payload.customer);
          return res.data
        })
    },
    loadBranches ({ commit }, payload) {
      return Vue.axios
        .post('forms/branch.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          commit('SET_BRANCH_SUGGESTIONS', res.data.message)
          return res.data.message
        })
    }
  },
  mutations: {
    // SET_BRANCHES (state, data) {
    //   state.branches = data
    // },
    // SET_SELECTED_BRANCH (state, data) {
    //   state.selectedBranch = data
    // },
    SET_CURRENT_BRANCH (state, data) {
      state.currentBranch = data
    },
    SET_SELECTED_BRANCH (state, data) {
      state.selectedBranch = { ...{ sales: [] }, ...data }
    },
    SET_SELECTED_BRANCH_SALES (state, data) {
      state.selectedBranch.sales = data
    },
    // SET_BRANCHES(state, data) {
    //   state.branches = data;
    // },
    SET_BRANCHES (state, payload) {
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      state.branches = {
        data: state.branches.data.concat(payload.message),
        nextPage: payload.next_page
      }
    },
    SET_BRANCH_SUGGESTIONS (state, payload) {
      state.branchSuggestions = payload
    },
    REMOVE_BRANCH (state, employee) {
      state.branches.data.splice(state.branches.data.indexOf(employee), 1)
    },
    CLEAR_BRANCHES (state) {
      state.branches = {
        data: [],
        nextPage: null
      }
    },
    ADD_BRANCH (state, data) {
      state.branches.data.unshift(data)
    }
  }
})
