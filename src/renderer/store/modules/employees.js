import { users, search } from '../../service/endpoints'
import { INIT_STATE } from '@/utils/constants'
import { UPDATE_STATE } from '@/utils/helper'

export default {
  state: {
    employees: INIT_STATE,
    selectedEmployee: null
  },
  actions: {

    loadEmployees ({ commit }, payload) {
      return search(payload).then(res => {
        return res.data
      })
    },

    loadEmployeesByPage ({ commit }, payload) {
      return users(payload).then(res => {
        commit('SET_EMPLOYEES', res.data)
        return res.data
      })
    },

    deleteEmployee ({ commit }, payload) {
      return users(payload.formData).then(res => {
        commit('REMOVE_EMPLOYEE', payload.employee)
        return res.data
      })
    },

    loadEmployee ({ commit }, payload) {
      return users(payload).then(res => {
        commit('SET_SELECTED_EMPLOYEE', {
          ...res.data.message[0],
          branch_details: res.data.branch_details[0]
        })
        return res.data
      })
    },

    createEmployee ({ commit }, payload) {
      return users(payload).then(res => {
        // commit('ADD_EMPLOYEE', res.data.customer_details[0])
        return res.data
      })
    },

    updateEmployee ({ commit }, payload) {
      return users(payload).then(res => {
        // commit('ADD_EMPLOYEE', payload.customer)
        return res.data
      })
    },

    setSelectedEmployeeSales ({ commit }, payload) {
      commit('SET_SELECTED_EMPLOYEE_SALES', payload)
    },

    clearSelectedEmployee ({ commit }, payload) {
      commit('SET_SELECTED_EMPLOYEE', null)
    },

    clearEmployees ({ commit }) {
      commit('CLEAR_EMPLOYEES')
    }

  },
  mutations: {

    SET_SELECTED_EMPLOYEE (state, data) {
      state.selectedEmployee = { ...{ sales: [] }, ...data }
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
