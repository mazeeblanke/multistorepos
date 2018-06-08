<template lang="pug">
  div
    .RefundsList
      .level.toolbar
        .level-left
          .level-item.page-title.subtitle.is-5 
            | Listing Refunds ({{ filteredItemsData.length }})
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
            a.button(@click="toggleFilteringState")
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
        :border="false"
        v-show="filteredItemsData.length",
        @selection-change="handleSelectionChange",
      )
        el-table-column(type="selection")
        el-table-column(label="No", type="index", :index="1", width="50")
        el-table-column(prop="customer", show-overflow-tooltip, label="Customer name", :sortable="true")
          template(slot-scope="scope")
            span {{ scope.row.customerOrder ? scope.row.customerOrder.customer.full_name : '-' }}
        el-table-column(label="Amount Refunded", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
            span {{ money(scope.row.amount_refunded) }}
        el-table-column(prop="branch.name", label="Branch", show-overflow-tooltip, :sortable="true")
        el-table-column(prop="product.name", label="Product", show-overflow-tooltip, :sortable="true")
        el-table-column(prop="user.full_name", label="Sold by", show-overflow-tooltip, :sortable="true")
        el-table-column(prop="created_at", label="Returned At", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
            span.el-icon-time.mr-5
            span {{ formatDate(scope.row.created_at) }}
        div(slot="append" v-show="showLoading")
          div(ref='loader' style="height: 45px;")
            infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import { formatDate, formatStatus, dateForHumans } from '@/filters/format';
import Loading from '@/components/shared/Loading';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
import moneyMixin from '@/mixins/MoneyMixin';
import Reciept from '@/components/shared/Reciept';
import EmptyState from '@/components/EmptyState';
import { ObjectToFormData } from '@/utils/helper';

const parseAmount = (amount) => parseFloat(amount.toPrecision(4));

export default {

  mounted() {
    this.clearSelectedRefund();
    this.clearRefunds();
    this.preloadItemsList();
    this.handleBottomScroll();
  },

  mixins: [deleteMixin, filterMixin, moneyMixin],

  data() {
    return {
      formPanelOpen: false,
      selectedSale: null,
      fullScreenActive: false,
      filter: {
        user_id: null
      },
      employeeSuggestions: [],
      loadingEmployees: false,
      displaySearchFilters: false,
      generatingReceipt: false,
      refunding: false,
      loading: false,
      items: {
        data: [],
      }
    }
  },

  watch: {

    refundedSales(newValue) {
      this.items = newValue
    }

  },

  methods: {

    ...mapActions('refunds', [
      'loadRefunds',
      'clearSelectedRefund',
      'clearRefunds',
    ]),

    ...mapActions('employees', [
      'loadEmployees'
    ]),

    ...mapActions('refunds', {
      loadItems: 'loadRefunds',
    }),

    ...mapActions('refunds', {
      searchItems: 'loadRefunds',
    }),

    ...mapMutations('sales', {
      SET_FILTERED_ITEMS: 'SET_FILTERED_SALES',
    }),

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

    ...{ formatDate, formatStatus, dateForHumans }

  },

  computed: {
    ...mapState('refunds', ['refundedSales']),
    ...mapState('settings', ['settings']),
  },

  components: {
    Loading,
    Reciept,
    FullscreenDialog,
    InfiniteLoading,
    EmptyState
  }

};
</script>

<style lang="sass">
.salesUserSelect
  .el-select-dropdown__item
    text-align: center;
  .popper__arrow:after, .el-popper[x-placement^=bottom] .popper__arrow::after
    margin-left: 40px !important
</style>

<style lang="sass" module>
.columns
  margin: 0px 50px
</style>
