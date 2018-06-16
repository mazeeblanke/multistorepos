<template lang="pug">
  .sidebar.card
    .columns.is-multiline.is-mobile
      .column.is-6(v-show="$can('admin|superadmin|clerk')", v-for="sideLink in sideLinks")
        router-link.button.is-primary.has-full-width(
          :to="{ name: `${sideLink.route}`}", 
          active-class="is-active", 
          tag="button"
        ) 
          span.material-icons.is-15.mr-5 {{ sideLink.icon }}
          span {{ sideLink.name }}
</template>

<script>
  export default {
    data () {
      return {
        sideLinks: [
          {
            name: 'New Sale',
            icon: 'new_releases',
            route: 'new_sale'
          },
          {
            name: 'Inventory',
            icon: 'shopping_basket',
            route: 'products_list'
          },
          {
            name: 'Customers',
            icon: 'contacts',
            route: 'customers_list'
          },
          {
            name: 'Branches',
            icon: 'account_balance',
            route: 'branches_list'
          },
          {
            name: 'Suppliers',
            icon: 'shopping_cart',
            route: 'suppliers_list'
          },
          {
            name: 'Sales',
            icon: 'attach_money',
            route: 'sale_details_list'
          },
          {
            name: 'Accounts',
            icon: 'account_balance_wallet',
            route: 'expenditures_list'
          },
          {
            name: 'Employees',
            icon: 'account_box',
            route: 'employees_list'
          },
          {
            name: 'Report',
            icon: 'report',
            route: 'reports'
          },
          {
            name: 'Dashboard',
            icon: 'dashboard',
            route: 'dashboard'
          },
          {
            name: 'Online Orders',
            icon: 'shopping_cart',
            route: ''
          },
          {
            name: 'Setting',
            icon: 'settings',
            route: 'SettingsView'
          }
        ]
      }
    }
  }
</script>


<style lang="sass">
  .sidebar
    button.is-active
      background: #223458 !important 
</style>
