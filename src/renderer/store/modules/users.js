// import { users } from '../../service/endpoints'
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    currentUser: null
  },
  actions: {
    signUp ({ commit, state }, payload) {
      return Vue.axios.post('register', payload).then(res => {
        const { user, token } = res.data.data
        const { store, branch } = user
        localStorage.setItem('pos_token', token.token)
        commit('SET_CURRENT_USER', user)
        commit('sales/RESET_CART', null, { root: true })
        commit(
          'settings/SET_STORE_SETTINGS',
          { data: { branch, store, loggedInUser: user } },
          { root: true }
        )
        return res.data
      })
    },
    login ({ commit, state, rootState }, payload) {
      return Vue.axios.post('login', payload).then(res => {
        localStorage.setItem('pos_token', res.data.token.token)

        const { user, branch, store } = res.data
        const appPrevSettings = rootState.settings.settings

        let settings = {
          loggedInUser: user,
          store
        }

        if (
          appPrevSettings &&
          (!appPrevSettings.branch || appPrevSettings.store.id !== store.id)
        ) {
          settings.branch = branch
        }

        commit('SET_CURRENT_USER', user)
        commit(
          'settings/SET_STORE_SETTINGS',
          { ...settings },
          { root: true }
        )
        return res.data
      })
    },
    logout ({ commit }) {
      return new Promise((resolve, reject) => {
        try {
          localStorage.removeItem('pos_token')
          commit('CLEAR_CURRENT_USER')
          return resolve('success')
        } catch (e) {
          return reject(new Error(e))
        }
      })
    }
  },
  getters: {
    isLoggedIn: () => localStorage.getItem('pos_token')
  },
  mutations: {
    SET_CURRENT_USER (state, user) {
      state.currentUser = {
        ...state.currentUser,
        ...user
      }
    },

    CLEAR_CURRENT_USER (state) {
      state.currentUser = null
    }
  }
}
