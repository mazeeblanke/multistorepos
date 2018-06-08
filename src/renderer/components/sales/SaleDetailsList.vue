<template lang="pug">
  div
    RefundSales(
      v-if="refundSales"
      :visible.sync="refundSales", 
      :close="closeRefundSales",
      :products="salesTransaction.items",
      :total-label="totalLabel",
      :unit-price-label="unitPriceLabel",
      :sales-id="salesTransaction.sales_id"
    )
    FullscreenDialog(
      @closed="closeDialog", 
      scrollable, 
      :active.sync="fullScreenActive"
    )
      span.material-icons.print.action(slot="action" @click="print") print
      Reciept(
        :items="salesTransaction.items",
        :cart="salesTransaction",
        v-if="fullScreenActive"
      )
    .SalesList(
      v-loading="generatingReceipt || refunding"
      element-loading-text="processing ..."
    )
      .level.toolbar(:class="{ 'shadow-divider': formPanelOpen }")
        .level-left
          .level-item.page-title.subtitle.is-5 
            | Listing Sales ({{ filteredItemsData.length }})
        .level-item
          div.search
            el-select(
              v-model="filter.user_id"
              :filterable="true"
              :remote="true"
              :clearable="true"
              @change="search('user_id')"
              placeholder="Search sales by user..."
              :remote-method="getEmployeeSuggestions"
              popper-class="salesUserSelect"
            )
              el-option(
                v-for="(employee, index) in employeeSuggestions"
                :key="index"
                :label="employee.username"
                :value="employee.id"
              )
              el-button(slot="append" icon="el-icon-search")
        .level-right
          .level-item
            a.button(
              @click="toggleFilteringState", 
              :disabled="!$can('admin|superadmin')"
            )
              span Toggle search filters
              span.icon
                i.material-icons keyboard_arrow_down
      EmptyState(
        empty-message="No results", 
        v-if="!filteredItemsData.length && !loading", 
        :style="{height: '400px'}"
      )
      Loading(
        loading-text="Loading sales", 
        v-if="loading && !filteredItemsData.length", 
        :style="{ height: '400px' }"
      )
      el-table(
        ref="items-table",
        :data="filteredItemsData",
        :default-sort="{prop: 'created_at', order: 'descending'}",
        max-height="500",
        :border="false", 
        v-show="filteredItemsData.length",
        @cell-click="handleCellClick"
        @selection-change="handleSelectionChange",
      )
        el-table-column(type="selection")
        el-table-column(label="No", type="index", :index="1", width="50")
        el-table-column(show-overflow-tooltip, label="Customer name", :sortable="true")
          template(slot-scope="scope")
            span.is-capitalized 
              | {{ scope.row.customerOrder ? scope.row.customerOrder.customer.full_name : '-' }}
        el-table-column(label="Paid", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
            span.is-capitalized {{ money(scope.row.amount_paid) }}
        el-table-column(label="Payment type", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
            span.is-capitalized {{ scope.row.payment_type }}
        el-table-column(label="Sales ID", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
            span.is-capitalized {{ scope.row.sales_id }}
        el-table-column(label="Sold by", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
            span.is-capitalized {{ scope.row.user.full_name }}
        el-table-column(label="Sold at", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
            span.el-icon-time.mr-5
            span.is-capitalized {{ formatDate(scope.row.created_at) }}
        el-table-column(label="Actions", width="150")
          template(slot-scope="scope")
            .actions
              el-dropdown(
                split-button size="small", 
                type="primary", 
                @command="handleCommand", 
                @click.stop="generateReceipt(scope.row)"
              ) 
                span.el-icon-view
                span Receipt
                el-dropdown-menu(slot="dropdown")
                  el-dropdown-item(
                    :command="() => generateReceipt(scope.row)"
                  ) Generate reciept
                  el-dropdown-item(
                    :command="() => triggerRefund(scope.row)", 
                    :disabled="!$can('superadmin|admin')"
                  ) Refund
                  el-dropdown-item Action 3
                  el-dropdown-item Action 4
                  el-dropdown-item Action 5
        div(slot="append" v-show="showLoading")
          div(ref='loader' style="height: 45px")
            infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
 /* eslint-disable */
import { mapState, mapActions, mapMutations } from 'vuex'
import { formatDate, formatStatus, dateForHumans } from '@/filters/format'
import Loading from '@/components/shared/Loading'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import InfiniteLoading from 'vue-infinite-loading'
import deleteMixin from '@/mixins/DeleteMixin'
import filterMixin from '@/mixins/FilterMixin'
import moneyMixin from '@/mixins/MoneyMixin'
import Reciept from '@/components/shared/Reciept'
import RefundSales from '@/components/shared/RefundSales'
// import SalesListFilter from '@/components/purchasing/SalesListFilter';
import EmptyState from '@/components/EmptyState'
import { calculatePercentInCash, sumCash, calcSubTotal } from '@/utils/helper'

const parseAmount = (amount) => parseFloat(amount.toPrecision(4))

export default {

  mounted () {
    this.clearSelectedSale()
    this.clearSales()
    this.preloadItemsList()
    this.handleBottomScroll()
    this.branchSuggestions = [this.settings.branch]
  },

  mixins: [deleteMixin, filterMixin, moneyMixin],

  data () {
    return {
      formPanelOpen: false,
      selectedSale: null,
      fullScreenActive: false,
      salesItems: [],
      salesTransaction: {},
      filter: {
        aggregate: 1,
        with_user: 1,
        with_customer: 1,
        user_id: null
      },
      employeeSuggestions: [],
      displaySearchFilters: false,
      filteredRequisitions: [],
      generatingReceipt: false,
      refunding: false,
      sales_id: null,
      loadingEmployees: false,
      loading: false,
      loadingBranches: false,
      items: {
        data: []
      },
      branchSuggestions: []
    }
  },

  watch: {

    sales (newValue) {
      this.items = newValue
    },

    branches (newValue) {
      this.branchSuggestions = newValue
    },

    filteredItemsData (newValue) {
      this.SET_FILTERED_ITEMS(newValue)
    }

  },

  methods: {

    ...mapActions('sales', [
      'loadSales',
      'clearSelectedSale',
      'loadSalesByPage',
      'clearSales',
      'removeFromCart',
      'refundSale',
      'removeSale',
      'getReceipt'
    ]),

    ...mapActions('branch', [
      'loadBranches',
      'searchBranches'
    ]),

    ...mapActions('employees', [
      'loadEmployees'
    ]),

    ...mapActions('sales', {
      loadItems: 'loadSales'
    }),

    ...mapActions('sales', {
      searchItems: 'loadSales',
    }),

    ...mapMutations('sales', {
      SET_FILTERED_ITEMS: 'SET_FILTERED_SALES'
    }),

    ...mapMutations('sales', ['SET_REFUND_SALE_STATE']),

    closeRefundSales () {
      this.SET_REFUND_SALE_STATE(false)
    },

    handleCellClick(row, cell) {
      if (cell.type !== 'selection') {
        this.showSales(row)
      }
    },

    showSales(row) {
      this.$router.push({ 
        name: 'sales_view',
        params: { id: row.sale_details_id } 
      })
    },

    handleCommand (command) {
      console.log('here')
      command()
    },

    print () {
      window.print()
    },

    getEmployeeSuggestions (query) {
      if (query) {
        this.loadingEmployees = true;
        this.loadEmployees({
          username: query,
          store_id: this.settings.store.id,
          branch_id: this.settings.branch.id
        })
          .then(({ data }) => {
            this.loadingEmployees = false
            this.employeeSuggestions = data
          })
          .catch(() => {
            this.loadingEmployees = false
          });
      } else {
        this.employeeSuggestions = []
      }
    },

    refreshSales (newBranch) {
      this.clearSales()
      this.filter = {
        ...this.filter,
        branchid: newBranch.id,
        page: 1
      }
      this.preloadItemsList()
    },

    _loadBranches (query) {
      if (query !== '') {
        this.loadingBranches = true
        this.searchBranches({
          search: query,
          type: 'branch'
        })
          .then((res) => {
            this.branchSuggestions = res
            this.loadingBranches = false
          })
          .catch(() => {
            this.loadingBranches = false
          })
      }
    },

    triggerRefund (row) {
      this.generatingReceipt = true
      this.getReceipt({ id: row.sale_details_id })
      .then((res) => {
        const { sales } = res
        this.salesTransaction.sales_id = row.sales_id
        this.salesTransaction.items = sales.map(s => ({
          ...s.product,
          quantity: s.quantity,
          id: s.product_id,
        }))
        this.SET_REFUND_SALE_STATE(true)
        this.generatingReceipt = false
      })
      .catch(() => {
        this.generatingReceipt = false
        this.SET_REFUND_SALE_STATE(false)
        this.$snackbar.open({
          message: `Failure!! - ${res.message}`,
          type: 'is-danger'
        })
      })
    },

    deleteItems () {},

    generateReceipt (row) {
      this.generatingReceipt = true

      this.getReceipt({ id: row.sale_details_id }).then((res) => {
        const { 
          amount_paid: amountPaid, 
          sales_id,
          customerOrder,
          payment_type,
          sales: items,
          total,
          tax,
          discount
        } = res
        const subTotal = calcSubTotal(items)
        const discountTotal = calculatePercentInCash(discount, subTotal)
        const taxTotal = calculatePercentInCash(tax, subTotal)

        this.salesTransaction = {
          amountPaid,
          sales_id,
          customer: customerOrder && customerOrder.customer,
          items: items.map(i => ({
            name: i.product.name,
            unitprice: i.unit_price,
            quantity: i.quantity
          })),
          tax,
          subTotal,
          discountTotal,
          taxTotal,
          payment_type,
          discount,
          total,
        }

        this.generatingReceipt = false
        this.fullScreenActive = true

      })
        .catch((err) => {
          console.log(err)
          this.generatingReceipt = false
        })
    },

    closeDialog () {
      this.fullScreenActive = false
      this.salesItems = []
      this.salesTransaction = {}
    },

    ...{ formatDate, formatStatus, dateForHumans }

  },
  computed: {

    ...mapState('sales', ['sales', 'refundSales']),

    ...mapState('settings', ['settings']),

    ...mapState('branch', ['branches']),

    unitPriceLabel() {
      return `Unit Price (${this.currencySymbol})`
    },

    totalLabel() {
      return `Total (${this.currencySymbol})`
    },

  },
  components: {

    Loading,

    Reciept,

    RefundSales,

    FullscreenDialog,

    InfiniteLoading,

    EmptyState

  }
}
</script>

<style lang="sass">
.salesUserSelect
  .el-select-dropdown__item
    text-align: center;
  .popper__arrow:after, .el-popper[x-placement^=bottom] .popper__arrow::after
    margin-left: 40px !important
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
