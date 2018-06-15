<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      CustomerForm.page-forms(
        ref="new-customer-form",
        @close-form="closeNewCustomerForm",
        @action-complete="closeNewCustomerForm",
        v-show="formPanelOpen"
      )
    .level.toolbar(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 
          | Listing Customers ({{ filteredItemsData.length }})
      .level-item
        div.search
          el-input(
            placeholder="Search customers by name...", 
            clearable,
            v-model="filter.full_name",
            @input="search('full_name')", 
            class="input-with-select",
            v-if="!displaySearchFilters"
          ) 
      .level-right
        .level-item
          a.button.is-primary(
            @click="createNewCustomer", 
            :disabled="formPanelOpen"
          )
            span.icon
              i.material-icons add
            span Create Customer
    ListFilter.shadow-divider(
      v-if="displaySearchFilters",
      :fields="searchFields",
      @change="filterItems",
      :filter-params.sync="filter"
    )
    EmptyState.h400(
      empty-text="No Result", 
      v-if="!filteredItemsData.length && !loading", 
      @contextmenu.native="showContextMenu"
    )
    Loading.h400(loading-text="Loading customers", v-if="(loading && !filteredItemsData.length)")
    el-table(
      @contextmenu.native="showContextMenu",
      ref="items-table",
      :data="filteredItemsData",
      :max-height="displaySearchFilters? 459 : 550",
      :default-sort="{prop: 'created_at', order: 'descending'}",
      :border="false",
      @cell-click="handleCellClick",
      v-show="filteredItemsData.length",
      @selection-change="handleSelectionChange"
    )
      el-table-column(type="selection")
      el-table-column(label="No", type="index", :index="1" width="50")
      el-table-column(prop="id", show-overflow-tooltip, label="ID", sortable)
      el-table-column(show-overflow-tooltip, label="Fullname", sortable)
        template(slot-scope="scope") 
          span.is-capitalized {{ scope.row.full_name }}
      el-table-column(label="Gender", show-overflow-tooltip, sortable )
        template(slot-scope="scope") 
          span.is-capitalized {{ parseColData(scope.row.gender) }}
      el-table-column(label="Phone No.", show-overflow-tooltip, sortable)
        template(slot-scope="scope") 
          span.is-capitalized {{ parseColData(scope.row.phone) }}
      el-table-column(label="Created at", show-overflow-tooltip, sortable)
        template(slot-scope="scope") 
            span.is-capitalized {{ formatDate(scope.row.created_at) }}
      el-table-column(label="Actions", :render-header="renderDelete", width="70")
        template(slot-scope="scope", scope="props")
          button.button(:class="$style.trash")
            span.el-icon-delete.font-size-23
      div(slot="append" v-show="showLoading")
       div(ref='loader' style="height: 45px")
         infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>

import { mapState, mapActions, mapMutations } from 'vuex'
import { formatDate, formatStatus, dateForHumans } from '@/filters/format'
import Loading from '@/components/shared/Loading'
import { parseColData } from '@/utils/helper'
import CustomerForm from '@/components/customers/CustomerForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import InfiniteLoading from 'vue-infinite-loading'
import deleteMixin from '@/mixins/DeleteMixin'
import filterMixin from '@/mixins/FilterMixin'
import EmptyState from '@/components/EmptyState'
import ListFilter from '@/components/Shared/ListFilter'
import { COUNTRIES_OPTIONS } from '@/utils/constants'

export default {
  mounted () {
    this.clearSelectedCustomer()
    this.clearCustomers()
    this.preloadItemsList()
    this.handleBottomScroll()
    this.$electron.ipcRenderer.on(
      'advancedSearch',
      () => this.handleAdvancedSearchToggle()
    )
  },

  mixins: [deleteMixin, filterMixin],

  data () {
    return {
      isCreatingCustomer: false,
      displaySearchFilters: false,
      filter: {
        full_name: null
      },
      filterParams: {
        full_name: null
      },
      loading: false,
      items: {
        data: []
      },
      searchFields: [
        {
          component: 'el-input',
          placeholder: 'Fullname',
          key: 'full_name',
          displayKey: 'Fullname'
        },
        {
          component: 'el-input',
          placeholder: 'phone',
          key: 'phone',
          displayKey: 'Phone no.'
        },
        {
          component: 'el-select',
          placeholder: 'gender',
          key: 'gender',
          displayKey: 'Gender',
          options: [
            { value: 'male', key: 'male' },
            { value: 'female', key: 'female' }
          ]
        },
        {
          component: 'el-select',
          placeholder: 'Country',
          key: 'country',
          displayKey: 'Country',
          options: COUNTRIES_OPTIONS
        },
        {
          component: 'el-date-picker',
          startPlaceholder: 'Start Date',
          endPlaceholder: 'End Date',
          defaultTime: "['12:00:00']",
          valueFormat: 'yyyy-MM-dd HH:mm:ss',
          displayKey: 'Created At'
        }
      ]
    }
  },

  watch: {

    customers (newValue) {
      this.items = newValue
    },

    filteredItemsData (newValue) {
      this.SET_FILTERED_ITEMS(newValue)
    }

  },

  methods: {

    ...mapActions('customers', [
      'loadCustomers',
      'clearSelectedCustomer',
      'loadCustomersByPage',
      'clearCustomers'
    ]),

    ...mapMutations('app', ['SET_FORM_STATE']),

    ...mapMutations('customers', {
      SET_FILTERED_ITEMS: 'SET_FILTERED_CUSTOMERS'
    }),

    ...mapActions('customers', {
      searchItems: 'loadCustomers'
    }),

    ...mapActions('customers', {
      loadItems: 'loadCustomers'
    }),

    deleteItems () {},

    handleCellClick (row, cell) {
      if (cell.type !== 'selection') {
        this.showCustomer(row)
      }
    },

    handleAdvancedSearchToggle () {
      this.displaySearchFilters = !this.displaySearchFilters
      this.filter = {
        ...this.filter,
        ...{
          full_name: null
        }
      }
    },

    showContextMenu () {
      this.$electron.ipcRenderer.send('contextmenu')
    },

    createNewCustomer () {
      this.SET_FORM_STATE(true)
      this.formPanelOpen = true
      this.isCreatingCustomer = true
      this.$scrollTo(this.$refs['new-customer-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20
      })
    },

    closeNewCustomerForm () {
      this.SET_FORM_STATE(false)
      this.isCreatingCustomer = false
    },

    showCustomer (row) {
      this.$router.push({
        name: 'customer_view',
        params: { id: row.id }
      })
    },

    ...{ formatDate, formatStatus, dateForHumans, parseColData }

  },
  computed: {

    ...mapState('customers', ['customers']),

    ...mapState('app', ['formPanelOpen'])

  },
  components: {
    Loading,
    CustomerForm,
    FullscreenDialog,
    InfiniteLoading,
    ListFilter,
    EmptyState
  }
}
</script>

<style lang="sass">
.humanize-display
  text-transform: capitalize
  i
    margin-right: 5px
</style>

<style lang="sass" module>
.columns
  margin: 0px 50px
.trash
  border: none
  background: transparent
</style>
