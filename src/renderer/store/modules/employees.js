import { users } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    employees: INIT_STATE,
    selectedEmployee: null
  },
  actions: {
    loadEmployees ({ commit }, payload) {
      return Vue.axios.get('users', { params: payload }).then(res => {
        if (payload.persist) {
          commit('SET_EMPLOYEES', res.data.data)
        }
        return res.data.data
      })
    },

    deleteEmployee ({ commit }, payload) {
      return users(payload.formData).then(res => {
        commit('REMOVE_EMPLOYEE', payload.employee)
        return res.data
      })
    },

    loadEmployee ({ commit }, { id }) {
      return Vue.axios.get(`user/${id}`).then(res => {
        commit('SET_SELECTED_EMPLOYEE', res.data.data)
        return res.data
      })
    },

    createEmployee ({ commit }, payload) {
      return Vue.axios.post('users', payload).then(res => {
        commit('SET_EMPLOYEES', res.data)
        return res.data
      })
    },

    updateEmployee ({ commit }, payload) {
      return Vue.axios.patch(`user/${payload.id}`, payload).then(res => {
        commit('SET_SELECTED_EMPLOYEE', res.data.data)
        return res.data
      })
    },

    setSelectedEmployeeSales ({ commit }, payload) {
      commit('SET_SELECTED_EMPLOYEE_SALES', payload)
    },

    clearSelectedEmployee ({ commit }, payload) {
      commit('CLEAR_SELECTED_EMPLOYEE', null)
    },

    clearEmployees ({ commit }) {
      commit('CLEAR_EMPLOYEES')
    }
  },
  mutations: {
    SET_SELECTED_EMPLOYEE (state, data) {
      // if (state.selectedEmployee && data.id === state.selectedEmployee.id) {
      state.selectedEmployee = {
        sales: { data: [] },
        ...state.selectedEmployee,
        ...data
      }
      // }
    },

    CLEAR_SELECTED_EMPLOYEE (state) {
      state.selectedEmployee = null
    },

    SET_SELECTED_EMPLOYEE_SALES (state, data) {
      state.selectedEmployee.sales = data
    },

    SET_EMPLOYEES (state, payload) {
      UPDATE_STATE(state, payload, 'employees')
    },

    REMOVE_EMPLOYEE (state, employee) {
      state.employees.data.splice(state.employees.data.indexOf(employee), 1)
    },

    CLEAR_EMPLOYEES (state) {
      state.employees = INIT_STATE
    },

    ADD_EMPLOYEE (state, data) {
      state.employees.data.unshift(data)
    }
  }
}
