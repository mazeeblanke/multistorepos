import Vue from 'vue'
import BaseModule from '../utils/BaseModule'
// import axios from 'axios';

export default new BaseModule('sale', {
  state: {
    store: null
  },
  actions: {
    setStoreDetails ({ commit }, payload) {
      return Vue.axios
        .post('forms/setup.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // console.log(res.data);
          // commit('SET_STORE_DETAILS', res.data);
          return res.data
        })
    },
    getStoreDetails ({ commit }, payload) {
      return Vue.axios
        .post('forms/setup.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // console.log(res.data);
          // commit('SET_STORE_DETAILS', res.data);
          return res.data
        })
    }
  },
  mutations: {
    SET_STORE_DETAILS (state, data) {
      console.log(data.currency)
      state.store = {
        ...data,
        // setuployaltysetting: 'setuployaltysetting',
        taxes: data.tax ? JSON.parse(data.tax) : [],
        currency: data.currency ? JSON.parse(data.currency) : ''
      }
    }
  }
})
