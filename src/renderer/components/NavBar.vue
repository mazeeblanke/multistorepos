<template lang="pug">
  .NavBar
    nav.nav.has-shadow
      .nav-left(style="overflow: visible")
        a.nav-item
          img#oaslogo(src='../assets/img/logo.png', alt='OAS logo')
        .nav-item
          b-dropdown
            button.button.is-primary.is-inverted.is-medium(
              slot='trigger'
            )
              b-icon(:icon="selectedMenuItem.icon")
              span {{ selectedMenuItem.label }}
              b-icon(icon="keyboard_arrow_down")
            b-dropdown-item(v-for="(menuItem, index) in computedMenu", :key="index" )
              router-link.media(:to="menuItem.path")
                b-icon.media-left(:icon="menuItem.icon")
                .media-content
                  router-link(:to="menuItem.path") {{ menuItem.label }}
      span.nav-toggle
        span
        span
        span
      .nav-right.nav-menu(style="overflow: visible")
        .nav-item
          Wifi
        .nav-item.is-tab
          b-dropdown(position="is-bottom-left")
            a.button(slot="trigger")
              span Logged in as {{ ucFirst(currentUser.username) }}
              span.ml-10
                strong.is-uppercase ({{ currentUser.access_level }})
              b-icon(icon="arrow_drop_down")
            router-link.dropdown-item(:to="{name: 'profile'}") Profile
            router-link.dropdown-item(:to="{name: 'settings'}") Settings
            b-dropdown-item
              a(@click="logoutUser") Log Out
        .nav-item.is-tab
          figure(class="image is-48x48")
            img(:src="currentUser.gravatar", class="is-rounded has-max-height")
</template>


<script>
/* eslint-disable */
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import { ucFirst } from '@/utils/helper'
import Wifi from '@/components/shared/Wifi'

export default {
  // mounted () {
  //   this.initWifiMonitoring()
  //   this.$electron.ipcRenderer.on(
  //     'wifiConnection',
  //     (e, data) => this.updateWifiConnection(data)
  //   )
  // },
  data () {
    return {
      // connection: null,
      menu: [
        {
          icon: 'new_releases',
          path: '/app/new-sale',
          label: 'New Sale'
        },
        {
          icon: 'report',
          path: '/app/reports',
          label: 'Reports'
        }
      ]
    }
  },

  components: {
    Wifi
  },

  methods: {
    ...{ ucFirst },

    ...mapActions('users', [
      'logout'
    ]),

    logoutUser () {
      this.logout().then(() => {
        this.$router.push({ name: 'home' })
      }).catch((e) => {
        console.log(e)
      })
    },

    // updateWifiConnection (connection) {
    //   if (
    //     connection && 
    //     connection instanceof Array && 
    //     connection.length
    //   ) {
    //     this.connection = connection[0]
    //   } else {
    //     this.connection = null
    //   }
    // },

    // initWifiMonitoring () {
    //   setInterval(() => this.$electron.ipcRenderer.send('getWifiConnection'), 5000)
    // }
  },

  computed: {
    ...mapState('settings', [
      'settings'
    ]),

    currentUser () {
      return this.settings && this.settings.loggedInUser
    },

    computedMenu () {
      const menu = [
        {
          icon: 'attach_money',
          path: '/app/sales/sale_details',
          label: 'Sales'
        },
        {
          icon: 'contacts',
          path: '/app/customers/customers-list',
          label: 'Customers'
        },
        {
          icon: 'store',
          path: '/app/products/products-list',
          label: 'Products'
        },
        {
          icon: 'account_box',
          path: '/app/employees/employees-list',
          label: 'Employees'
        },
        {
          icon: 'dashboard',
          path: '/app/dashboard',
          label: 'Dashboard'
        },
        {
          icon: 'account_balance',
          path: '/app/branches/branches_list',
          label: 'Branches'
        },
        {
          icon: 'account_balance_wallet',
          path: '/app/accounts/expenditures-list',
          label: 'Accounts'
        }
      ]
      if (this.$can('admin|superadmin')) {
        return [
          ...this.menu,
          ...menu
        ]
      }
      return this.menu
    },

    selectedMenuItem () {
      return _.find(this.computedMenu, o => this.$route.path.includes(o.label.toLowerCase())) ||
      this.computedMenu[0]
    }
  }
}
</script>

<style lang="sass">
.dropdown-content a
  padding: 5px !important
.NavBar
  // position: fixed !important
  width: 100% !important
  z-index: 100 !important
</style>

<style lang="sass" scoped>
  .notifications
    font-size: 27px
    color: white !important
</style>
