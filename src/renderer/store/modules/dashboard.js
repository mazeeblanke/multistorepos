import { search } from '../../service/endpoints'
import Vue from 'vue'

export default {

  namespaced: true,

  state: {
    metrics: null,
    productsStats: null
  },

  actions: {

    loadMetrics ({ commit }, payload) {
      return Vue.axios.get('dashboard/stats', payload).then(res => {
        commit('SET_DASHBOARD_METRICS', res.data.data)
        return res.data.data
      })
    },

    loadProductStats ({ commit }, payload) {
      return search(payload).then(res => {
        commit('SET_PRODUCTS_STATS', res.data)
        return res.data
      })
    }

  },
  mutations: {

    SET_DASHBOARD_METRICS (state, metrics) {
      state.metrics = metrics
    },

    SET_PRODUCTS_STATS (state, productsStats) {
      state.productsStats = productsStats
    }

  }
}
