import Vue from 'vue'
import BaseModule from '../utils/BaseModule'
// import axios from 'axios';

export default new BaseModule('employee', {
  state: {
    employees: {
      data: [],
      nextPage: null
    },
    selectedEmployee: null
  },
  actions: {
    loadEmployees ({ commit }, payload) {
      return Vue.axios
        .get(
          'forms/search.php',
          { params: payload },
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then(res => {
          // commit('SET_EMPLOYEES', res.data);
          return res.data
        })
    },
    loadEmployeesByPage ({ commit }, payload) {
      return Vue.axios
        .post('forms/users.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // console.log(res.data);
          commit('SET_EMPLOYEES', res.data)
          return res.data
        })
    },
    deleteEmployee ({ commit }, payload) {
      return Vue.axios
        .post('forms/users.php', payload.formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          commit('REMOVE_EMPLOYEE', payload.employee)
          return res.data
        })
    },
    loadEmployee ({ commit }, payload) {
      return Vue.axios
        .post('forms/users.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // console.log({ ...res.data.message[0], branch_details: res.data.branch_details[0] })
          commit('SET_SELECTED_EMPLOYEE', { ...res.data.message[0], branch_details: res.data.branch_details[0] })
        })
    },
    createEmployee ({ commit }, payload) {
      return Vue.axios
        .post('forms/users.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_EMPLOYEE', res.data.customer_details[0]);
          return res.data
        })
    },
    updateEmployee ({ commit }, payload) {
      return Vue.axios
        .post('forms/users.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_EMPLOYEE', payload.customer);
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
    },
    getLoyaltyDiscount ({ commit }, payload) {
      return Vue.axios
        .post('forms/users.php', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        .then(res => {
          // commit('ADD_EMPLOYEE', payload.customer);
          return res.data
        })
    }
  },
  mutations: {
    SET_SELECTED_EMPLOYEE (state, data) {
      state.selectedEmployee = { ...{ sales: [] }, ...data }
    },
    SET_SELECTED_EMPLOYEE_SALES (state, data) {
      state.selectedEmployee.sales = data
    },
    // SET_EMPLOYEES(state, data) {
    //   state.employees = data;
    // },
    SET_EMPLOYEES (state, payload) {
      if (payload.message instanceof Object) {
        payload.message = Object.values(payload.message)
      }
      state.employees = {
        data: state.employees.data.concat(payload.message),
        nextPage: payload.next_page
      }
    },
    REMOVE_EMPLOYEE (state, employee) {
      state.employees.data.splice(state.employees.data.indexOf(employee), 1)
    },
    CLEAR_EMPLOYEES (state) {
      state.employees = {
        data: [],
        nextPage: null
      }
    },
    ADD_EMPLOYEE (state, data) {
      state.employees.data.unshift(data)
    }
  }
})
