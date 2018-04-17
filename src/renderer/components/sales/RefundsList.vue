<template lang="pug">
  div
    FullscreenDialog(@closed="closeDialog", scrollable, :active.sync="fullScreenActive")
      Reciept(
        :items="salesItems",
        :transaction="salesTransaction",
      )
    .RefundsList(
      v-loading="generatingReceipt || refunding"
      element-loading-text="processing ..."
    )
      .level.toolbar.shadow-divider(:class="{ 'shadow-divider': formPanelOpen }")
        .level-left
          .level-item.page-title.subtitle.is-5 Listing Refunds ({{ filteredItemsData.length }})
        .level-item
          div.search
            el-select(
              v-model="searchQuery"
              :filterable="true"
              :remote="true"
              :clearable="true"
              @change="filteredItems.data = []"
              placeholder="Search sales by user..."
              :remote-method="getRefundsSuggestions"
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
            a.button(@click="toggleFilteringState")
              span Toggle search filters
              span.icon
                i.material-icons keyboard_arrow_down
      //- RefundsListFilter(:filter-params.sync="filterParams", @change="filterItems", v-show="displaySearchFilters")
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
        el-table-column(prop="salesid", label="Refunds ID", align="left", show-overflow-tooltip, :sortable="true")
        el-table-column(prop="user", label="Sold by", align="left", show-overflow-tooltip, :sortable="true")
        el-table-column(prop="salestime", label="Sold at", align="left", show-overflow-tooltip, :sortable="true", fixed="right")
          template(slot-scope="scope")
            span {{ dateForHumans(scope.row.salestime) }}
        //- div(slot="append" v-show="showLoading")
        //-   div(ref='loader' style="height: 45px;")
        //-     infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import { formatDate, formatStatus, dateForHumans } from '@/filters/format';
import Loading from '@/components/shared/Loading';
// import RequisitionForm from '@/components/purchasing/RequisitionForm';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
import moneyMixin from '@/mixins/MoneyMixin';
import Reciept from '@/components/shared/Reciept';
// import RefundsListFilter from '@/components/purchasing/RefundsListFilter';
import EmptyState from '@/components/EmptyState';
import { ObjectToFormData } from '@/utils/helper';

const parseAmount = (amount) => parseFloat(amount.toPrecision(4));

export default {
  mounted() {
    this.clearSelectedSale();
    this.clearRefunds();
    this.preloadItemsList();
    this.handleBottomScroll();
  },
  mixins: [deleteMixin, filterMixin, moneyMixin],
  data() {
    return {
      formPanelOpen: false,
      isCreatingRFP: false,
      isCreatingRFQ: false,
      selectedSale: null,
      fullScreenActive: false,
      salesItems: [],
      salesTransaction: {},
      filter: {
        limit: 10,
        page: 1,
        // salessearch: 'salessearch',
        refundedsales: 'refundedsales',
        fromtime: '1970-01-01 00:00:01',
        totime: '8000-00-00 00:00:00',
        branchid: 4,
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
        requisitionCode: null,
      },
      loading: false,
      items: {
        data: [],
      },
      tax: [
        {
          name: 'tax1',
          value: 20,
        },
        {
          name: 'tax1',
          value: 20,
        },
      ]
    };
  },
  watch: {
    refundedSales(newValue) {
      // console.log('asasass');
      this.items = newValue;
      this.filter.page = newValue.nextPage;
    },
    searchQuery(newValue) {
      // console.log('ajjaskjdhasjdsk');
      this.searchRefunds();
    },
    filteredItemsData(newValue) {
      this.SET_FILTERED_ITEMS(newValue);
    },
  },
  methods: {
    ...mapActions('sales', [
      'loadRefunds',
      'clearSelectedSale',
      'loadRefundsByPage',
      'clearRefunds',
      'removeFromCart',
      'refundSale',
      'removeSale',
      'getReceipt',
    ]),
    handleCommand(command) {
      command();
    },
    ...mapActions('customers', [
      'loadCustomers',
    ]),
    ...mapActions('sales', {
      loadItems: 'loadRefundsByPage',
    }),
    ...mapMutations('sales', {
      SET_FILTERED_ITEMS: 'SET_FILTERED_SALES',
    }),
    // updateSearchQuery(q) {
    //   console.log(q);
    //   this.searchQuery = q;
    // },
    searchRefunds() {
      this.loading = true;
      this.loadRefundsByPage(
        ObjectToFormData({
          // salessearch: 'salessearch',
          fromtime: '1970-01-01 00:00:01',
          totime: '7018-02-07 00:00:00',
          refundedsales: 'refundedsales',
          usersearch: this.searchQuery,
          page: 1,
          limit: 10,
        }),
      ).then(res => {
        this.filteredItems.data = res.message;
        // console.log('weew');
        // this.SET_FILTERED_ITEMS(res.message);
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    warnUser() {
      return this.$swal({
        title: 'Are you sure?',
        text: 'Do you want to refund and return?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      });
    },
    refund(sale) {
      this.warnUser().then((res) => {
        if (res.value) {
          this.refunding = true;
          this.refundSale(
            ObjectToFormData({
              refundsales: 'refundsales',
              salesid: sale.salesid,
            }),
          ).then(res => {
            if (res.status === 'Success') {
              this.$snackbar.open(`Success !! - ${res.message}`);
              this.removeSale(sale);
            } else if (res.status === 'Failure') {
              this.$snackbar.open({
                message: `Failure!! - ${res.message}`,
                type: 'is-danger',
              });
            }
            this.refunding = false;
          })
          .catch(() => {
            this.refunding = false;
          });
        }
      });
    },
    deleteItems() {},
    handleCellClick(row, cell) {
      if (cell.type !== 'selection') {
        // this.showRequisition(row);
      }
    },
    calculateTax() {
       return this.tax.reduce((agg, i) => agg + i.value, 0);
    },
    getTotal(transaction) {
      const subtotalTotal = transaction.total;
      const tax = this.calculateTax();
      const discountTotal = parseAmount(Math.max(((transaction.discount / 100) * subtotalTotal), 0));
      const taxTotal = parseAmount(Math.max(((tax / 100) * subtotalTotal), 0));
      this.salesTransaction = {
        ...transaction,
        subtotalTotal,
        discountTotal,
        taxTotal,
        tax,
        total: (subtotalTotal - discountTotal) + taxTotal,
      };
    },
    generateReceipt(row) {
      this.generatingReceipt = true;
        this.getReceipt(ObjectToFormData({
          getreceipt: 'getreceipt',
          salesid: row.salesid,
        })).then((res) => {
          let { customer_details, message: transaction, cart, product_cart_details } = res;
          transaction = { ...transaction[0], customerDetails: customer_details[0] };
          const items = cart.reduce((agg, i) => {
            const productDetail = product_cart_details.find((p) => p[0].id === i.productid);
            agg.push({
              selectedItem: { ...i, productDetail: productDetail[0] , name: productDetail[0].name },
              quantity: i.quantity,
            });
            return agg;
          }, []);
          this.generatingReceipt = false;
          this.salesItems = items;
          // this.salesTransaction = transaction;
          this.getTotal(transaction);
          this.fullScreenActive = true;
        })
        .catch((err) => {
          console.log(err);
          this.generatingReceipt = false;
        });
    },
    closeDialog() {
      this.fullScreenActive = false;
      this.salesItems = [];
      this.salesTransaction = {};
    },
    getRefundsSuggestions(query) {
      if (query) {
        this.loading = true;
        let payload = {
          search: query,
          type: 'user',
        };
        this.loadCustomers(payload)
          .then(suggestions => {
            this.loading = false;
            this.suggestions = suggestions;
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        this.suggestions = [];
      }
    },
    createNewRequisition() {
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
    ...{ formatDate, formatStatus, dateForHumans },
  },
  computed: {
    ...mapState('sales', ['refundedSales']),
    // ...mapGetters('requisitions', ['requisitions']),
    // ...mapState('requisitions', { items: 'requisitions' }),
  },
  components: {
    Loading,
    Reciept,
    // RequisitionForm,
    FullscreenDialog,
    InfiniteLoading,
    // RefundsListFilter,
    EmptyState,
  },
};
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
