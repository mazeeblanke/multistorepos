export default {
  namespaced: true,

  state: {
    currentPageTitle: '',
    authModalOpen: false,
    countries: null,
    formPanelOpen: false
  },

  actions: {

    openAuthModal ({ commit }) {
      commit('OPEN_AUTH_MODAL')
    },

    closeAuthModal ({ commit }) {
      commit('CLOSE_AUTH_MODAL')
    },

    setCurrentPageTitle ({ commit }, title) {
      commit('SET_CURRENT_PAGE_TITLE', title)
    },

    loadCountries ({ commit }) {
      return fetch('https://restcountries.eu/rest/v2')
        .then(res => res.json())
        .then((json) => {
          commit('SET_COUNTRIES', json)
        })
    }

  },

  mutations: {

    OPEN_AUTH_MODAL (state) {
      state.authModalOpen = true
    },

    SET_FORM_STATE (state, newState) {
      state.formPanelOpen = newState
    },

    CLOSE_AUTH_MODAL (state) {
      state.authModalOpen = false
    },

    SET_CURRENT_PAGE_TITLE (state, title) {
      state.currentPageTitle = title
    },

    SET_COUNTRIES (state, data) {
      state.countries = data
    }

  }
}
