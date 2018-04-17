import Vue from 'vue'
import pluralize from 'pluralize'
import ModuleSymbols from './ModuleSymbols'
import _ from 'lodash'

const toCaps = s => s.toUpperCase()

export default function (model, prop) {
  const module = {
    namespaced: true
  }

  const symbols = ModuleSymbols(model)

  module.state = {
    [symbols.state.OBJECTS]: {},
    [symbols.state.SELECTED_OBJECT]: null
  }

  module.actions = {
    [symbols.actions.CREATE_OBJECT] ({ commit }, object) {
      return Vue.axios.post(`api/${pluralize(model)}`, object).then((res) => {
        commit(`ADD_NEW_${toCaps(model)}`, res.data)
        return res
      })
    },
    [symbols.actions.EDIT_OBJECT] ({ commit }, object) {
      return Vue.axios.put(`api/${pluralize(model)}/${object.id}`, object).then((response) => {
        if (symbols.actions.EDIT_OBJECT === 'editRequisition') {
          const setselectedRequisition = response.data
          Vue.axios.get(`api/requisitions/${object.id}/users`).then((_response) => {
            setselectedRequisition.approvalUsers = _response.data
            commit('SET_SELECTED_REQUISITION', setselectedRequisition)
          })
        } else {
          commit(symbols.mutations.SET_SELECTED_OBJECT, response.data)
        }
      })
    },
    [symbols.actions.LOAD_OBJECTS] ({ commit }, { filter, persist }) {
      return Vue.axios
        .get(`api/${pluralize(model)}`, {
          params: filter
        })
        .then((response) => {
          if (persist) {
            commit(symbols.mutations.SET_OBJECTS, response.data)
          }
          return response.data
        })
    },
    [symbols.actions.LOAD_OBJECT] ({ commit }, { id }) {
      return Vue.axios.get(`api/${pluralize(model)}/${id}`).then((response) => {
        commit(symbols.mutations.SET_SELECTED_OBJECT, response.data)
      })
    },
    [symbols.actions.CLEAR_SELECTED_OBJECT] ({ commit }) {
      commit(symbols.mutations.CLEAR_SELECTED_OBJECT)
    }
  }

  module.mutations = {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    [symbols.mutations.SET_OBJECTS] (state, objects) {
      if ('data' in state[symbols.state.OBJECTS]) {
        state[symbols.state.OBJECTS].data = state[symbols.state.OBJECTS].data.concat(objects.data)
        state[symbols.state.OBJECTS].meta = {
          ...state[symbols.state.OBJECTS].meta,
          ...objects.meta
        }
        state[symbols.state.OBJECTS].data = _.uniqBy(state[symbols.state.OBJECTS].data, O => O.id)
      } else {
        state[symbols.state.OBJECTS] = objects
      }
    },
    [symbols.mutations.SET_SELECTED_OBJECT] (state, selectedObject) {
      state[symbols.state.SELECTED_OBJECT] = selectedObject
    },
    [symbols.mutations.CLEAR_SELECTED_OBJECT] (state) {
      state[symbols.state.SELECTED_OBJECT] = null
    },
    [symbols.mutations.ADD_NEW_OBJECT] (state, newOject) {
      state[symbols.state.OBJECTS].data.unshift(newOject)
    }
  }

  module.getters = {}

  if (prop) {
    Object.assign(module.state, prop.state)
    Object.assign(module.actions, prop.actions)
    Object.assign(module.mutations, prop.mutations)
    Object.assign(module.getters, prop.getters)
  }

  return module
}
