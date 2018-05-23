<template lang="pug">
  .sidebar.card
    .columns.is-multiline.is-mobile
      .column.is-6(v-show="$can('admin|superadmin|clerk')")
        router-link.button.is-primary.has-full-width(:to="{ name: 'new_sale'}" active-class="is-active" tag="button") New Sale
      .column.is-6(v-show="$can('admin|superadmin|clerk')")
        router-link.button.is-primary.has-full-width(:to="{ name: 'products_list'}" active-class="is-active" tag="button") Inventory
      .column.is-6(v-show="$can('admin|superadmin')")
        router-link.button.is-primary.has-full-width(:to="{ name: 'customers_list'}" active-class="is-active" tag="button") Customers
      .column.is-6(v-show="$can('superadmin')")
        router-link.button.is-primary.has-full-width(:to="{ name: 'branches_list'}" active-class="is-active" tag="button") Branches
      .column.is-6(v-show="$can('admin|superadmin')")
        router-link.button.is-primary.has-full-width(:to="{ name: 'suppliers_list'}" active-class="is-active" tag="button") Purchase Order
      .column.is-6(v-show="$can('admin|superadmin')")
        router-link.button.is-primary.has-full-width(:to="{ name: 'sales_list'}" active-class="is-active" tag="button") Invoices
      .column.is-6(v-show="$can('admin|superadmin')")
         router-link.button.is-primary.has-full-width(:to="{ name: 'expenditures_list'}" active-class="is-active" tag="button") Accounts
      .column.is-6(v-show="$can('admin|superadmin')")
       router-link.button.is-primary.has-full-width(:to="{ name: 'employees_list'}" active-class="is-active" tag="button") Employees
      .column.is-6(v-show="$can('admin|superadmin')")
        router-link.button.is-primary.has-full-width(:to="{ name: 'reports'}" active-class="is-active" tag="button") Report
      .column.is-6(v-show="$can('admin|superadmin')")
        router-link.button.is-primary.has-full-width(:to="{ name: 'dashboard'}" active-class="is-active" tag="button") Dashboard
      //- .column.is-6(v-show="$can('admin|superadmin')")
      //-   button.button.is-primary.has-full-width File
      .column.is-6(v-show="$can('admin|superadmin')")
        router-link.button.is-primary.has-full-width(:to="{ name: 'SettingsView'}" active-class="is-active" tag="button") Setting
</template>

<script>
/* eslint-disable */
import { mapState } from 'vuex';

export default{
  computed: {
    ...mapState('store', ['store']),
    ...mapState('users', [
      'currentUser',
    ]),
  },
}
</script>

<style lang="sass">
  .sidebar
    button.is-active
      background-color: #051021 !important
</style>
