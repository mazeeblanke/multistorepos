import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    notifications: null,
    notificationsPreview: null
  },
  actions: {

    loadNotifications ({ commit }) {
      return Vue.axios.get('api/notifications')
        .then((response) => {
          commit('SET_NOTIFICATIONS', response.data)
        })
    }

  },
  mutations: {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    SET_NOTIFICATIONS (state, notifications) {
      state.notificationsPreview = notifications.slice(0, 10)
      state.notifications = notifications
    }
    
  }
}
