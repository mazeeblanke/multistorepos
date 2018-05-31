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
              class="input-with-select"
            )
              // el-button(slot="append", icon="el-icon-search")  
      .level-right
        .level-item
          a.button.is-primary(
            @click="createNewCustomer", 
            :disabled="formPanelOpen"
          )
            span.icon
              i.material-icons add
            span Create Customer
    EmptyState(
      empty-text="No Result", 
      v-if="!filteredItemsData.length && !loading", 
      :style="{ height: '400px' }"
    )
    Loading(
      loading-text="Loading customers", 
      v-if="(loading && !filteredItemsData.length)", 
      :style="{ height: '400px' }"
    )
    el-table(
      ref="items-table",
      :data="filteredItemsData",
      :max-height="500",
      :border="false",
      :highlight-current-row="true",
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
      el-table-column(label="Email", show-overflow-tooltip, sortable)
        template(slot-scope="scope") 
          span {{ parseColData(scope.row.email) }}
      el-table-column(label="Gender", show-overflow-tooltip, sortable )
        template(slot-scope="scope") 
          span.is-capitalized {{ parseColData(scope.row.gender) }}
      el-table-column(label="Marital status", show-overflow-tooltip, sortable)
        template(slot-scope="scope") 
          span.is-capitalized {{ parseColData(scope.row.marital_status) }}
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
       div(ref='loader' style="height: 45px;")
         infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import { formatDate, formatStatus, dateForHumans } from '@/filters/format'
import Loading from '@/components/shared/Loading'
import CustomerForm from '@/components/customers/CustomerForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import InfiniteLoading from 'vue-infinite-loading'
import deleteMixin from '@/mixins/DeleteMixin'
import filterMixin from '@/mixins/FilterMixin'
import EmptyState from '@/components/EmptyState'

export default {
  mounted() {
    this.clearSelectedCustomer()
    this.clearCustomers()
    this.loading = true
    this.preloadItemsList()
    this.handleBottomScroll()
  },
  mixins: [deleteMixin, filterMixin],
  // watch: {
  //   customers(newValue) {
  //     this.items.data = _.flatMap(newValue)
  //   },
  // },
  data() {
    return {
      isCreatingCustomer: false,
      displaySearchFilters: false,
      filter: {
        full_name: null,
        email: null,
        status: null
      },
      loading: false,
      items: {
        data: []
      }
    }
  },

  watch: {

    customers(newValue) {
      this.items = newValue
      // this.filter.page = newValue.nextPage
    },

    filteredItemsData(newValue) {
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
      SET_FILTERED_ITEMS: 'SET_FILTERED_CUSTOMERS',
    }),

    parseColData(data) {
      if (data === 'null') {
        return '-'
      }
      return data
    },

    ...mapActions('customers', {
      searchItems: 'loadCustomers',
    }),

    // search(e) {
    //   if (this.searchQuery) {
    //     this.isSearching = true
    //     this.loading = true
    //     this.loadCustomers({
    //       type: 'customer',
    //       search: this.searchQuery,
    //     }).then((res) => {
    //       this.filteredItems.data = res instanceof Array ? res : []
    //       this.loading = false
    //       this.isSearching = false
    //     })
    //     .catch(() => {
    //       this.isSearching = false
    //       this.loading = false
    //     })
    //   } else {
    //     this.isSearching = false
    //   }
    // },

    ...mapActions('customers', {
      loadItems: 'loadCustomers',
    }),

    deleteItems() {},

    handleCellClick(row, cell) {
      if (cell.type !== 'selection') {
        this.showCustomer(row)
      }
    },

    createNewCustomer () {
      this.SET_FORM_STATE(true)
      // this.formPanelOpen = true
      // this.isCreatingCustomer = true
      // this.$scrollTo(this.$refs['new-customer-form'].$el, 1000, {
      //   container: '#snap-screen',
      //   easing: 'ease',
      //   offset: 20,
      // })
    },

    closeNewCustomerForm() {
      this.SET_FORM_STATE(false)
      // this.formPanelOpen = false
      this.isCreatingCustomer = false
    },

    showCustomer(row) {
      this.$router.push({ 
        name: 'customer_view', 
        params: { id: row.id } 
      })
    },

    ...{ formatDate, formatStatus, dateForHumans }

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
    EmptyState,
  },
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
