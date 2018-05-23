// import { storeSetup } from '../../service/endpoints'
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    settings: null,
    go: {
      kk: 'jsd'
    }
  },
  actions: {

    loadSettings ({ commit }, payload) {
      return Vue.axios.get('settings').then((res) => {
        // console.log(res)
        commit('SET_STORE_SETTINGS', res.data.payload)
        return res.data
      })
    }

    // setStoreDetails ({ commit }, payload) {
    //   return storeSetup(payload).then(res => {
    //     // commit("SET_STORE_DETAILS", res.data)
    //     return res.data
    //   })
    // },

    // getStoreDetails ({ commit }, payload) {
    //   return storeSetup(payload).then(res => {
    //     // commit('SET_STORE_DETAILS', res.data)
    //     return res.data
    //   })
    // }

  },
  mutations: {

    SET_STORE_SETTINGS (state, data) {
      // console.log('here')
      // state.settings[key] = value
      state.settings = {
        ...data
        // taxes: data.tax ? JSON.parse(data.tax) : [],
        // currency: data.currency ? JSON.parse(data.currency) : ''
      }
    },

    UPDATE_SETTINGS (state, { key, value }) {
      // state.settings[key] = value
      let arr = key.split('.')
      arr.reduce((agg, curr, i) => {
        if (i === arr.length - 1) {
          agg[curr] = value
        }
        return agg[curr]
      }, state.settings)
    }

    // SET_G (state, data) {
    //   state.go = {
    //     ...data
    //   }
    // }

  }
}
