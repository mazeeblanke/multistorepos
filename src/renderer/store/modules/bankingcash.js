import Vue from 'vue'
import BaseModule from '../utils/BaseModule'
// import axios from 'axios';

export default new BaseModule('bankingcash', {
  state: {
    bankingcashs: {
      data: [],
      nextPage: null
    },
    selectedBankingcash: null
  },
  actions: {
    loadBankingcashs ({ commit }, payload) {
      return Vue.axios
        .get(
          'forms/search.php',
          { params: payload },
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then(res => {
          // commit('SET_BANKING_CASHS', res.data);
          return res.data
        })
    },
    loadBankingcashsByPage ({ commit }, payload) {
      const data = payload.filter || payload
      return Vue.axios
        .post('forms/bankingcash.php', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // console.log(res.data);
          if (!payload.filter) commit('SET_BANKING_CASHS', res.data)
          return res.data
        })
    },
    loadBankingcash ({ commit }, payload) {
      return Vue.axios
        .post('forms/bankingcash.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          commit('SET_SELECTED_BANKING_CASH', res.data.message[0])
        })
    },
    createBankingcash ({ commit }, payload) {
      return Vue.axios
        .post('forms/bankingcash.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_BANKING_CASH', res.data.customer_details[0]);
          return res.data
        })
    },
    updateBankingcash ({ commit }, payload) {
      return Vue.axios
        .post('forms/bankingcash.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_BANKING_CASH', payload.customer);
          return res.data
        })
    },
    setSelectedBankingcashSales ({ commit }, payload) {
      commit('SET_SELECTED_BANKING_CASH_SALES', payload)
    },
    clearSelectedBankingcash ({ commit }, payload) {
      commit('SET_SELECTED_BANKING_CASH', null)
    },
    clearBankingcashs ({ commit }) {
      commit('CLEAR_BANKING_CASHS')
    },
    getLoyaltyDiscount ({ commit }, payload) {
      return Vue.axios
        .post('forms/bankingcash.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_BANKING_CASH', payload.customer);
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
    // SET_BANKING_CASHS(state, data) {
    //   state.bankingcashs = data;
    // },
    SET_BANKING_CASHS (state, payload) {
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      state.bankingcashs = {
        data: state.bankingcashs.data.concat(payload.message),
        nextPage: payload.next_page
      }
    },
    CLEAR_BANKING_CASHS (state) {
      state.bankingcashs = {
        data: [],
        nextPage: null
      }
    },
    ADD_BANKING_CASH (state, data) {
      state.bankingcashs.data.unshift(data)
    }
  }
})
