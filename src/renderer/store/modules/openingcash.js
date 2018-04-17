import Vue from 'vue'
import BaseModule from '../utils/BaseModule'
// import axios from 'axios';

export default new BaseModule('openingcash', {
  state: {
    openingcashs: {
      data: [],
      nextPage: null
    },
    selectedOpeningcash: null
  },
  actions: {
    loadOpeningcashs ({ commit }, payload) {
      return Vue.axios
        .get(
          'forms/search.php',
          { params: payload },
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then(res => {
          // commit('SET_OPENING_CASHS', res.data);
          return res.data
        })
    },
    loadOpeningcashsByPage ({ commit }, payload) {
      // console.log(!!payload.filter);
      const data = payload.filter || payload
      return Vue.axios
        .post('forms/openingcash.php', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          if (!payload.filter) commit('SET_OPENING_CASHS', res.data)
          return res.data
        })
    },
    loadOpeningcash ({ commit }, payload) {
      return Vue.axios
        .post('forms/openingcash.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          commit('SET_SELECTED_OPENING_CASH', res.data.message[0])
        })
    },
    createOpeningcash ({ commit }, payload) {
      return Vue.axios
        .post('forms/openingcash.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_OPENING_CASH', res.data.customer_details[0]);
          return res.data
        })
    },
    updateOpeningcash ({ commit }, payload) {
      return Vue.axios
        .post('forms/openingcash.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_OPENING_CASH', payload.customer);
          return res.data
        })
    },
    setSelectedOpeningcashSales ({ commit }, payload) {
      commit('SET_SELECTED_OPENING_CASH_SALES', payload)
    },
    clearSelectedOpeningcash ({ commit }, payload) {
      commit('SET_SELECTED_OPENING_CASH', null)
    },
    clearOpeningcashs ({ commit }) {
      commit('CLEAR_OPENING_CASHS')
    },
    getLoyaltyDiscount ({ commit }, payload) {
      return Vue.axios
        .post('forms/openingcash.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_OPENING_CASH', payload.customer);
          return res.data
        })
    }
  },
  mutations: {
    SET_SELECTED_OPENING_CASH (state, data) {
      state.selectedOpeningcash = { ...{ sales: [] }, ...data }
    },
    SET_SELECTED_OPENING_CASH_SALES (state, data) {
      state.selectedOpeningcash.sales = data
    },
    // SET_OPENING_CASHS(state, data) {
    //   state.openingcashs = data;
    // },
    SET_OPENING_CASHS (state, payload) {
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      state.openingcashs = {
        data: state.openingcashs.data.concat(payload.message),
        nextPage: payload.next_page
      }
    },
    CLEAR_OPENING_CASHS (state) {
      state.openingcashs = {
        data: [],
        nextPage: null
      }
    },
    ADD_OPENING_CASH (state, data) {
      state.openingcashs.data.unshift(data)
    }
  }
})
