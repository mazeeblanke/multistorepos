import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    metrics: null,
    productsStats: null
  },
  actions: {
    loadDashboardMetrics ({ commit }, payload) {
      return Vue.axios
        .get(
          'forms/search.php',
          { params: payload },
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then(res => {
          commit('SET_DASHBOARD_METRICS', res.data)
          return res.data
        })
    },
    loadProductStats ({ commit }, payload) {
      return Vue.axios
        .get(
          'forms/search.php',
          { params: payload },
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then(res => {
          commit('SET_PRODUCTS_STATS', res.data)
          return res.data
        })
    }
  },
  mutations: {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    SET_DASHBOARD_METRICS (state, metrics) {
      state.metrics = metrics
    },
    SET_PRODUCTS_STATS (state, productsStats) {
      state.productsStats = productsStats
    }
  }
}
