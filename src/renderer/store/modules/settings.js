// import { storeSetup } from '../../service/endpoints'
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    settings: null
  },
  actions: {

    loadSettings ({ commit }, payload) {
      return Vue.axios.get('settings').then((res) => {
        commit('SET_STORE_SETTINGS', res.data.payload)
        return res.data
      })
    },

    updateSettings ({ commit }, payload) {
      return Vue.axios.post('settings', payload).then((res) => {
        commit('SET_STORE_SETTINGS', res.data)
        return res.data
      })
    }
  },
  mutations: {

    SET_STORE_SETTINGS (state, { data }) {
      state.settings = {
        ...state.settings,
        ...data
      }
    },

    UPDATE_SETTINGS (state, { key, value }) {
      let arr = key.split('.')
      arr.reduce((agg, curr, i) => {
        if (i === arr.length - 1) {
          agg[curr] = value
        }
        return agg[curr]
      }, state.settings)
    }
  }
}
