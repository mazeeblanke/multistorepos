
import Vue from 'vue'
// import axios from 'axios'
import { ObjectToFormData } from '@/utils/helper'
/* eslint-disable */

export default {
  namespaced: true,
  state: {
    currentUser: null
  },
  actions: {
    login ({ commit, state }, payload) {
      /**
       *  Integration without OAS
       */
      return Vue.axios.post(
        'forms/users.php',
        ObjectToFormData(payload),
        { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((response) => {
          localStorage.setItem('pos_token', response.data.user_token)
          commit('SET_CURRENT_USER', response.data.user_details[0])
          return response
        })

      /**
       * Integration with OAS
       */
      // const axiosInstance = axios.create()
      // return axiosInstance
      //   .post(
      //     'https://oxbridge-dev-api.herokuapp.com/api/user/login',
      //     {
      //       ...payload,
      //       email: payload.username
      //     }
      //   )
      //   .then(res => {
      //     state.currentUser = {
      //       ...state.currentUser,
      //       OAS_USER: res
      //     }
      //     localStorage.setItem('oas_token', res.data.token)
      //     return Vue.axios.post('forms/users.php', ObjectToFormData(payload), { headers: { 'Content-Type': 'multipart/form-data' } })
      //   })
      //   .then((response) => {
      //     localStorage.setItem('pos_token', response.data.user_token)
      //     commit('SET_CURRENT_USER', response.data.user_details[0])
      //     return response
      //   })
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
