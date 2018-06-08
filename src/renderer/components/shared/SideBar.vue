<template lang="pug">
  .sidebar.card
    .columns.is-multiline.is-mobile
      .column.is-6(v-show="$can('admin|superadmin|clerk')")
        router-link.button.is-primary.has-full-width(
          :to="{ name: 'new_sale'}", 
          active-class="is-active", 
          tag="button"
        ) 
          span.material-icons.is-15.mr-5 new_releases
          span New Sale
      .column.is-6(v-show="$can('admin|superadmin|clerk')")
        router-link.button.is-primary.has-full-width(
          :to="{ name: 'products_list'}", 
          active-class="is-active", 
          tag="button"
        ) 
          span.material-icons.is-15.mr-5 shopping_basket
          span Inventory
      .column.is-6(v-show="$can('admin|superadmin')")
        router-link.button.is-primary.has-full-width(
          :to="{ name: 'customers_list'}", 
          active-class="is-active", 
          tag="button"
        ) 
          span.material-icons.is-15.mr-5 contacts
          span Customers
      .column.is-6(v-show="$can('superadmin')")
        router-link.button.is-primary.has-full-width(
          :to="{ name: 'branches_list'}", 
          active-class="is-active", 
          tag="button"
        ) 
          span.material-icons.is-15.mr-5 account_balance
          span Branches
      .column.is-6(v-show="$can('admin|superadmin')")
        router-link.button.is-primary.has-full-width(
          :to="{ name: 'suppliers_list'}", 
          active-class="is-active", 
          tag="button"
        ) 
          span.material-icons.is-15.mr-5 shopping_cart
          span Suppliers
      .column.is-6(v-show="$can('admin|superadmin')")
        router-link.button.is-primary.has-full-width(
          :to="{ name: 'sale_details_list'}", 
          active-class="is-active", 
          tag="button"
        ) 
          span.material-icons.is-15.mr-5 attach_money
          span Sales
      .column.is-6(v-show="$can('admin|superadmin')")
        router-link.button.is-primary.has-full-width(
           :to="{ name: 'expenditures_list'}", 
           active-class="is-active", 
           tag="button"
        ) 
          span.material-icons.is-15.mr-5 account_balance_wallet
          span Accounts
      .column.is-6(v-show="$can('admin|superadmin')")
        router-link.button.is-primary.has-full-width(
          :to="{ name: 'employees_list'}", 
          active-class="is-active", 
          tag="button"
        ) 
          span.material-icons.is-15.mr-5 account_box
          span Employees
      .column.is-6(v-show="$can('admin|superadmin')")
        router-link.button.is-primary.has-full-width(
          :to="{ name: 'reports'}", 
          active-class="is-active", 
          tag="button"
        ) 
          span.material-icons.is-15.mr-5 report
          span Report
      .column.is-6(v-show="$can('admin|superadmin')")
        router-link.button.is-primary.has-full-width(
          :to="{ name: 'dashboard'}", 
          active-class="is-active", 
          tag="button"
        ) 
          span.material-icons.is-15.mr-5 dashboard
          span Dashboard
      .column.is-6(v-show="$can('admin|superadmin')")
        router-link.button.is-primary.has-full-width(
          :to="{ name: 'SettingsView'}", 
          active-class="is-active", 
          tag="button"
        ) 
          span.material-icons.is-15.mr-5 settings
          span Setting
</template>

<style lang="sass">
  .sidebar
    button.is-active
      background: #223458 !important
</style>
