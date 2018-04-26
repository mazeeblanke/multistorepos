import { storeSetup } from '../../service/endpoints'

export default {
  state: {
    store: null
  },
  actions: {
    
    setStoreDetails ({ commit }, payload) {
      return storeSetup(payload).then(res => {
        // commit("SET_STORE_DETAILS", res.data)
        return res.data
      })
    },

    getStoreDetails ({ commit }, payload) {
      return storeSetup(payload).then(res => {
        // commit('SET_STORE_DETAILS', res.data)
        return res.data
      })
    }

  },
  mutations: {

    SET_STORE_DETAILS (state, data) {
      state.store = {
        ...data,
        taxes: data.tax ? JSON.parse(data.tax) : [],
        currency: data.currency ? JSON.parse(data.currency) : ''
      }
    }

  }
}
