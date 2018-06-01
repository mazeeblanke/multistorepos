<template lang="pug">
  div
    FullscreenDialog(@closed="closeDialog", scrollable, :active.sync="fullScreenActive")
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
          .level-item.page-title.subtitle.is-5 Listing Sales ({{ filteredItemsData.length }})
        .level-item
          div.search
            el-select(
              v-model="searchQuery"
              :filterable="true"
              :remote="true"
              :clearable="true"
              @change="filteredItems.data = []"
              placeholder="Search sales by user..."
              :remote-method="getSalesSuggestions"
              popper-class="salesUserSelect"
            )
              el-option(
                v-for="(item, index) in suggestions"
                :key="index"
                :label="item.username"
                :value="item.username"
              )
              el-button(slot="append" icon="el-icon-search")
        .level-right
          .level-item
            a.button(@click="toggleFilteringState", :disabled="!$can('admin|superadmin')")
              span Toggle search filters
              span.icon
                i.material-icons keyboard_arrow_down
      EmptyState(empty-message="No results" v-if="!filteredItemsData.length && !loading", :style="{height: '400px'}")
      Loading(loading-text="Loading sales" v-if="loading && !filteredItemsData.length", :style="{ height: '400px' }")
      el-table(
        ref="items-table",
        :data="filteredItemsData",
        max-height="500",
        :border="false"
        :highlight-current-row="true",
        @cell-click="handleCellClick"
        v-show="filteredItemsData.length",
        @selection-change="handleSelectionChange",
      )
        el-table-column(type="selection")
        el-table-column(label="No", type="index", :index="1", width="50")
        el-table-column(show-overflow-tooltip, label="Customer name", :sortable="true")
          template(slot-scope="scope")
            span.is-capitalized {{ scope.row.customerOrder ? scope.row.customerOrder.customer.full_name : '-' }}
        el-table-column(prop="paid", label="Paid", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
            span.is-capitalized {{ money(scope.row.amount_paid) }}
        el-table-column(prop="payment_type", label="Payment type", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
            span.is-capitalized {{ scope.row.payment_type }}
        el-table-column(prop="sales_id", label="Sales ID", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
            span.is-capitalized {{ scope.row.sales_id }}
        el-table-column(label="Sold by", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
            span.is-capitalized {{ scope.row.user.full_name }}
        el-table-column(label="Sold at", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
            span.el-icon-time.mr-5
            span.is-capitalized {{ formatDate(scope.row.created_at) }}
        el-table-column(label="Actions", width="180")
          template(slot-scope="scope")
            .actions
              el-dropdown(split-button size="small" type="primary" @command="handleCommand" @click="generateReceipt(scope.row)") Generate receipt
                el-dropdown-menu(slot="dropdown")
                  // el-dropdown-item(:command="() => generateReceipt(scope.row)") Generate reciept
                  // el-dropdown-item(:command="() => refund(scope.row)" :disabled="!$can('superadmin|admin')") Refund
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
// import SalesListFilter from '@/components/purchasing/SalesListFilter';
import EmptyState from '@/components/EmptyState'
import { calculatePercentInCash, sumCash, calcSubTotal } from '@/utils/helper'

const parseAmount = (amount) => parseFloat(amount.toPrecision(4))

export default {

  mounted () {

    this.clearSelectedSale()

    this.clearSales()

    // this.filter = { ...this.filter, branchid: this.currentBranch.id }
    this.preloadItemsList()

    this.handleBottomScroll()
    // this.branchSuggestions = this.branches;
    this.branchSuggestions = [this.settings.branch]
    // this.selected_branch = this.currentBranch
  },

  mixins: [deleteMixin, filterMixin, moneyMixin],

  data () {
    return {
      formPanelOpen: false,
      // isCreatingRFP: false,
      // isCreatingRFQ: false,
      selectedSale: null,
      fullScreenActive: false,
      salesItems: [],
      salesTransaction: {},
      filter: {
        aggregate: 1,
        with_user: 1,
        with_customer: 1
      },
      suggestions: [],
      displaySearchFilters: false,
      filteredRequisitions: [],
      generatingReceipt: false,
      refunding: false,
      // filterParams: {
      //   status: null,
      //   issuedBefore: null,
      //   issuedAfter: null,
      //   buyer: null,
      //   requisitionType: null,
      //   requisitionCode: null
      // },
      // selected_branch: null,
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

    // searchQuery (newValue) {
    //   // console.log('ajjaskjdhasjdsk');
    //   this.searchSales()
    // },

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

    ...mapActions('customers', [
      'loadCustomers'
    ]),

    ...mapActions('sales', {
      loadItems: 'loadSales'
    }),

    ...mapMutations('sales', {
      SET_FILTERED_ITEMS: 'SET_FILTERED_SALES'
    }),

    handleCommand (command) {
      command()
    },

    print () {
      window.print()
    },

    refreshSales (newBranch) {
      this.clearSales()
      this.filter = {
        ...this.filter,
        branchid: newBranch.id,
        page: 1
      }
      // console.log(this.filter)
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

    // updateSearchQuery(q) {
    //   console.log(q);
    //   this.searchQuery = q;
    // },
    // searchSales () {
    //   this.loading = true
    //   this.loadSales(
    //     ObjectToFormData({
    //       salessearch: 'salessearch',
    //       fromtime: '0000-00-01 00:00:00',
    //       totime: '7018-02-07 00:00:00',
    //       usersearch: this.searchQuery
    //     })
    //   ).then(res => {
    //     this.filteredItems.data = res.message
    //     // console.log('weew');
    //     // this.SET_FILTERED_ITEMS(res.message);
    //     this.loading = false
    //   }).catch(() => {
    //     this.loading = false
    //   })
    // },

    warnUser () {
      return this.$swal({
        title: 'Are you sure?',
        text: 'Do you want to refund and return?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      })
    },

    refund (sale) {
      this.warnUser().then((res) => {
        if (res.value) {
          this.refunding = true
          this.refundSale(
            ObjectToFormData({
              refundsales: 'refundsales',
              salesid: sale.salesid
            })
          ).then(res => {
            if (res.status === 'Success') {
              this.$snackbar.open(`Success !! - ${res.message}`)
              this.removeSale(sale)
            } else if (res.status === 'Failure') {
              this.$snackbar.open({
                message: `Failure!! - ${res.message}`,
                type: 'is-danger'
              })
            }
            this.refunding = false
          })
            .catch(() => {
              this.refunding = false
            })
        }
      })
    },

    deleteItems () {},

    handleCellClick (row, cell) {
      if (cell.type !== 'selection') {
        this.showSales(row)
      }
    },

    showSales(row) {
      this.$router.push({ name: 'sales_list', params: { id: row.id } })
    },

    generateReceipt (row) {
      this.generatingReceipt = true

      this.getReceipt({ id: row.id }).then((res) => {
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

    getSalesSuggestions (query) {
      if (query) {
        this.loading = true
        let payload = {
          search: query,
          type: 'user'
        }
        this.loadCustomers(payload)
          .then(suggestions => {
            this.loading = false
            this.suggestions = suggestions
          })
          .catch(() => {
            this.loading = false
          })
      } else {
        this.suggestions = []
      }
    },

    ...{ formatDate, formatStatus, dateForHumans }

  },
  computed: {

    ...mapState('sales', ['sales']),

    ...mapState('settings', ['settings']),

    ...mapState('branch', ['branches'])

  },
  components: {

    Loading,

    Reciept,

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
