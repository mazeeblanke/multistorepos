// import { users } from '../../service/endpoints'
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    currentUser: null
  },
  actions: {
    signUp ({ commit, state }, payload) {
      return Vue.axios.post('register', payload).then((res) => {
        console.log(res.data.data.token.token)
        localStorage.setItem('pos_token', res.data.data.token.token)
        commit('SET_CURRENT_USER', res.data.data.user)
        return res.data
      })
    },
    login ({ commit, state }, payload) {
      return Vue.axios.post('login', payload).then(res => {
        console.log(res.data)
        localStorage.setItem('pos_token', res.data.token.token)
        commit('SET_CURRENT_USER', res.data.user)
        return res.data
      })
    },
    logout ({ commit }) {
      return new Promise((resolve, reject) => {
        try {
          console.log('got here inside user logout')
          localStorage.removeItem('pos_token')
          commit('CLEAR_CURRENT_USER')
          console.log('done with dat basard')
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
      console.log('we we wieu iweu weiewu')
      console.log(user)
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
