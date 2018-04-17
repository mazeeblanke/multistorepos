import Vue from 'vue'
import BaseModule from '../utils/BaseModule'
// import axios from 'axios';

export default new BaseModule('expenditure', {
  state: {
    expenditures: {
      data: [],
      nextPage: null
    },
    selectedExpenditure: null
  },
  actions: {
    loadExpenditures ({ commit }, payload) {
      return Vue.axios
        .get(
          'forms/search.php',
          { params: payload },
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then(res => {
          // commit('SET_EXPENDITURES', res.data);
          return res.data
        })
    },
    loadExpendituresByPage ({ commit }, payload) {
      const data = payload.filter || payload
      return Vue.axios
        .post('forms/expenditure.php', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // console.log(res.data);
          if (!payload.filter) commit('SET_EXPENDITURES', res.data)
          return res.data
        })
    },
    loadExpenditure ({ commit }, payload) {
      return Vue.axios
        .post('forms/expenditure.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          commit('SET_SELECTED_EXPENDITURE', res.data.message[0])
        })
    },
    createExpenditure ({ commit }, payload) {
      return Vue.axios
        .post('forms/expenditure.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_EXPENDITURE', res.data.customer_details[0]);
          return res.data
        })
    },
    updateExpenditure ({ commit }, payload) {
      return Vue.axios
        .post('forms/expenditure.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_EXPENDITURE', payload.customer);
          return res.data
        })
    },
    setSelectedExpenditureSales ({ commit }, payload) {
      commit('SET_SELECTED_EXPENDITURE_SALES', payload)
    },
    clearSelectedExpenditure ({ commit }, payload) {
      commit('SET_SELECTED_EXPENDITURE', null)
    },
    clearExpenditures ({ commit }) {
      commit('CLEAR_EXPENDITURES')
    },
    getLoyaltyDiscount ({ commit }, payload) {
      return Vue.axios
        .post('forms/expenditure.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
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
    // SET_EXPENDITURES(state, data) {
    //   state.expenditures = data;
    // },
    SET_EXPENDITURES (state, payload) {
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      state.expenditures = {
        data: state.expenditures.data.concat(payload.message),
        nextPage: payload.next_page
      }
    },
    CLEAR_EXPENDITURES (state) {
      state.expenditures = {
        data: [],
        nextPage: null
      }
    },
    ADD_EXPENDITURE (state, data) {
      state.expenditures.data.unshift(data)
    }
  }
})
