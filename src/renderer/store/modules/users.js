import { ObjectToFormData } from '@/utils/helper'
import { users } from '../../service/endpoints'

export default {
  namespaced: true,
  state: {
    currentUser: null
  },
  actions: {
    login ({ commit, state }, payload) {
      return users(ObjectToFormData(payload)).then(res => {
        localStorage.setItem('pos_token', res.data.user_token)
        commit('SET_CURRENT_USER', res.data.user_details[0])
        return res
      })
    },
    logout ({ commit }) {
      return new Promise((resolve, reject) => {
        try {
          localStorage.removeItem('pos_token')
          localStorage.removeItem('vuex')
          commit('SET_CURRENT_USER', null)
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
    }
  }
}
