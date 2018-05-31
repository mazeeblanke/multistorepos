<template lang="pug">
  div
    FullscreenDialog(@closed="closeDialog", scrollable, :active.sync="fullScreenActive")
      span.material-icons.print.action(slot="action" @click="print") print
      Reciept(
        :items="salesItems",
        :transaction="salesTransaction",
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
            .field.is-horizontal
              .field-label.has-text-right.is-v-centered
                label.label Branch:
              .field-body
                .field
                  el-select.has-full-width(
                    v-model="selected_branch",
                    filterable,
                    clearable,
                    placeholder="select branch",
                    remote,
                    :remote-method="_loadBranches",
                    :loading="loadingBranches",
                    no-data-text="No results!",
                    value-key="id",
                    @change="(newBranch) => refreshSales(newBranch)",
                    size="small",
                    v-show="$can('superadmin')"
                  )
                    el-option(
                      v-for="branch in branchSuggestions",
                      :value="branch",
                      :label="branch.name",
                      :key="branch.id"
                    )
          .level-item(v-show="$can('admin')")
            a.button(@click="toggleFilteringState")
              span Toggle search filters
              span.icon
                i.material-icons keyboard_arrow_down
      //- SalesListFilter(:filter-params.sync="filterParams", @change="filterItems", v-show="displaySearchFilters")
      EmptyState(empty-message="No results" v-if="!filteredItemsData.length && !loading", :style="{height: '400px'}")
      Loading(loading-text="Loading sales" v-if="loading && !filteredItemsData.length", :style="{ height: '400px' }")
      el-table(
        ref="items-table",
        :data="filteredItemsData",
        max-height="400",
        :border="false"
        :highlight-current-row="true",
        @cell-click="handleCellClick"
        v-show="filteredItemsData.length",
        @selection-change="handleSelectionChange",
        :stripe="true",
      )
        el-table-column(type="selection", fixed="left")
        el-table-column(label="No", type="index", :index="1", width="50", fixed="left")
        el-table-column(prop="customer", show-overflow-tooltip, align="left", label="Customer name", :sortable="true", fixed="left")
          template(slot-scope="scope")
            span {{ scope.row.customer || '-' }}
        el-table-column(prop="paid", label="Paid", align="left", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
            span {{ money(scope.row.paid) }}
        el-table-column(prop="payment", label="Payment type", align="left", show-overflow-tooltip, :sortable="true")
        el-table-column(prop="salesid", label="Sales ID", align="left", show-overflow-tooltip, :sortable="true")
        el-table-column(prop="user", label="Sold by", align="left", show-overflow-tooltip, :sortable="true")
        el-table-column(prop="salestime", label="Sold at", align="left", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
            span {{ dateForHumans(scope.row.salestime) }}
        el-table-column(label="Actions", width="180", fixed="right")
          template(slot-scope="scope")
            .actions
              el-dropdown(split-button size="small" type="primary" @command="handleCommand" @click="generateReceipt(scope.row)") Generate receipt
                el-dropdown-menu(slot="dropdown")
                  el-dropdown-item(:command="() => generateReceipt(scope.row)") Generate reciept
                  el-dropdown-item(:command="() => refund(scope.row)" :disabled="scope.row.salesid.startsWith('R') || !$can('super-admin|admin')") Refund
                  el-dropdown-item Action 3
                  el-dropdown-item Action 4
                  el-dropdown-item Action 5
              //- button.button(:class="$style.trash" @click="refund(scope.row)")
              //-   i.material-icons delete
        //- div(slot="append" v-show="showLoading")
        //-   div(ref='loader' style="height: 45px;")
        //-     infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
 /* eslint-disable */
import { mapState, mapActions, mapMutations } from 'vuex'
import { formatDate, formatStatus, dateForHumans } from '@/filters/format'
import Loading from '@/components/shared/Loading'
// import RequisitionForm from '@/components/purchasing/RequisitionForm';
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import InfiniteLoading from 'vue-infinite-loading'
import deleteMixin from '@/mixins/DeleteMixin'
import filterMixin from '@/mixins/FilterMixin'
import moneyMixin from '@/mixins/MoneyMixin'
import Reciept from '@/components/shared/Reciept'
// import SalesListFilter from '@/components/purchasing/SalesListFilter';
import EmptyState from '@/components/EmptyState'
import { ObjectToFormData } from '@/utils/helper'

const parseAmount = (amount) => parseFloat(amount.toPrecision(4))

export default {
  mounted () {
    this.clearSelectedSale()
    this.clearSales()
    this.filter = { ...this.filter, branchid: this.currentBranch.id }
    this.preloadItemsList()
    this.handleBottomScroll()
    // this.branchSuggestions = this.branches;
    this.branchSuggestions = [this.currentBranch]
    this.selected_branch = this.currentBranch
  },
  mixins: [deleteMixin, filterMixin, moneyMixin],
  data () {
    return {
      formPanelOpen: false,
      isCreatingRFP: false,
      isCreatingRFQ: false,
      selectedSale: null,
      fullScreenActive: false,
      salesItems: [],
      salesTransaction: {},
      filter: {
        // limit: 7,
        page: 1,
        salessearch: 'salessearch',
        fromtime: '0000-00-00 00:00:01',
        totime: '8000-00-00 00:00:00',
        branchid: null
      },
      suggestions: [],
      displaySearchFilters: false,
      filteredRequisitions: [],
      generatingReceipt: false,
      refunding: false,
      filterParams: {
        status: null,
        issuedBefore: null,
        issuedAfter: null,
        buyer: null,
        requisitionType: null,
        requisitionCode: null
      },
      selected_branch: null,
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
      // console.log('asasass');
      this.items = newValue
      this.filter.page = newValue.nextPage
    },
    branches (newValue) {
      this.branchSuggestions = newValue
    },
    searchQuery (newValue) {
      // console.log('ajjaskjdhasjdsk');
      this.searchSales()
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
      console.log(this.filter)
      this.preloadItemsList()
    },
    ...mapActions('customers', [
      'loadCustomers'
    ]),
    ...mapActions('sales', {
      loadItems: 'loadSalesByPage'
    }),
    ...mapMutations('sales', {
      SET_FILTERED_ITEMS: 'SET_FILTERED_SALES'
    }),
    // renderAvailability(h) {
    //   return h('i', { class: 'material-icons' }, 'delete');
    // },
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
    searchSales () {
      this.loading = true
      this.loadSales(
        ObjectToFormData({
          salessearch: 'salessearch',
          fromtime: '0000-00-01 00:00:00',
          totime: '7018-02-07 00:00:00',
          usersearch: this.searchQuery
        })
      ).then(res => {
        this.filteredItems.data = res.message
        // console.log('weew');
        // this.SET_FILTERED_ITEMS(res.message);
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
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
        // this.showRequisition(row);
      }
    },
    calculateTax () {
      const tax = this.store.taxes || 0
      if (tax) {
        return tax.reduce((agg, i) => agg + i.value, 0)
      }
      return tax
    },
    getTotal (transaction) {
      const subtotalTotal = transaction.total
      // const tax = this.calculateTax();
      const discountTotal = parseAmount(Math.max(((transaction.discount / 100) * subtotalTotal), 0))
      const taxTotal = parseAmount(Math.max(((transaction.tax / 100) * subtotalTotal), 0))
      this.salesTransaction = {
        ...transaction,
        subtotalTotal,
        discountTotal,
        taxTotal,
        tax: transaction.tax,
        total: (subtotalTotal - discountTotal) + taxTotal
      }
    },
    generateReceipt (row) {
      this.generatingReceipt = true
      this.getReceipt(ObjectToFormData({
        getreceipt: 'getreceipt',
        salesid: row.salesid
      })).then((res) => {
        let { customer_details, message: transaction, cart, product_cart_details } = res
        transaction = { ...transaction[0], customerDetails: customer_details[0] }
        const items = cart.reduce((agg, i) => {
          const productDetail = product_cart_details.find((p) => p[0].id === i.productid)
          agg.push({
            selectedItem: { ...i, productDetail: productDetail[0], name: productDetail[0].name },
            quantity: i.quantity
          })
          return agg
        }, [])
        this.generatingReceipt = false
        this.salesItems = items
        // this.salesTransaction = transaction;
        this.getTotal(transaction)
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
    createNewRequisition () {
      // this.formPanelOpen = true;
      // this.isCreatingRFP = true;
      // this.$scrollTo(this.$refs['new-requisition-form'].$el, 1000, {
      //   container: '#snap-screen',
      //   easing: 'ease',
      //   offset: 20,
      // });
    },
    // createNewRFQ() {
    //   this.formPanelOpen = true;
    //   this.isCreatingRFQ = true;
    // },
    // closeNewRequisitionForm() {
    //   this.formPanelOpen = false;
    //   this.isCreatingRFP = false;
    //   this.$emit('formPanelClose');
    // },
    // closeNewRFQForm() {
    //   this.formPanelOpen = false;
    //   this.isCreatingRFQ = false;
    //   this.$emit('formPanelClose');
    // },
    // showRequisition(row) {
    //   this.$router.push({ name: 'requisition_view', params: { id: row.id } });
    // },
    // refreshList() {
    //   this.formPanelOpen = false;
    //   this.loadRequisitions();
    // },
    ...{ formatDate, formatStatus, dateForHumans }
  },
  computed: {
    ...mapState('sales', ['sales']),
    ...mapState('store', ['store']),
    // ...mapState('branch', [
    //   'currentBranch',
    // ]),
    ...mapState('branch', ['currentBranch', 'branches'])
    // ...mapGetters('requisitions', ['requisitions']),
    // ...mapState('requisitions', { items: 'requisitions' }),
  },
  components: {
    Loading,
    Reciept,
    // RequisitionForm,
    FullscreenDialog,
    InfiniteLoading,
    // SalesListFilter,
    EmptyState
  }
}
</script>

<style lang="sass">
// .actions
//   display: flex
//   .el-button-group
//     display: flex !important
//   .el-button
//     height: 33px !important
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

<style lang="sass" scoped>
  // .search
  //   .el-input
  //     width: 300px !important
</style>


<style lang="sass" module>
.columns
  margin: 0px 50px
.trash
  border: none
  background: transparent
</style>
