<template lang="pug">
  div
    .SalesList
      .level.toolbar
        .level-left
          .level-item.page-title.subtitle.is-5 
            | Listing Transfers ({{ filteredItemsData.length }})
        .level-right
          .level-item(v-show="$can('admin|superadmin')")
            a.button(@click="toggleFilteringState")
              span Toggle search filters
              span.icon
                i.material-icons keyboard_arrow_down
      EmptyState.h400(empty-message="No results" v-if="!filteredItemsData.length && !loading")
      Loading.h400(loading-text="Loading sales" v-if="loading && !filteredItemsData.length")
      el-table(
        ref="items-table",
        :data="filteredItemsData",
        max-height="500",
        :border="false"
        v-show="filteredItemsData.length",
        @selection-change="handleSelectionChange",
      )
        el-table-column(label="No", type="index", :index="1", width="50")
        el-table-column(prop="transfer_id", label="ID", show-overflow-tooltip, :sortable="true")
        el-table-column(prop="source", label="Source", show-overflow-tooltip, :sortable="true")
        el-table-column(prop="product.name", label="Product", show-overflow-tooltip, :sortable="true")
        el-table-column(prop="quantity_transferred", label="Qty", show-overflow-tooltip, :sortable="true")
        el-table-column(prop="source_branch.name", label="From", show-overflow-tooltip, :sortable="true")
           template(slot-scope="scope")
            span.is-capitalized {{ scope.row.source_branch && scope.row.source_branch.name || '-' }}
        el-table-column(prop="destination_branch.name", label="To Branch", show-overflow-tooltip, :sortable="true")
        el-table-column(label="Transfered At", show-overflow-tooltip, :sortable="true")
          template(slot-scope="scope")
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
import Reciept from '@/components/shared/Reciept';
import EmptyState from '@/components/EmptyState';
import { parseColData } from '@/utils/helper';

const parseAmount = (amount) => parseFloat(amount.toPrecision(4));

export default {
  mounted() {
    this.clearTransferHistory();
    this.preloadItemsList();
    this.handleBottomScroll();
  },
  mixins: [deleteMixin, filterMixin],
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
         // limit: 7,
      },
      suggestions: [],
      displaySearchFilters: false,
      filteredRequisitions: [],
      generatingReceipt: false,
      refunding: false,
      selected_branch: null,
      loading: false,
      loadingBranches: false,
      items: {
        data: [],
      },
      branchSuggestions: [],
    };
  },

  watch: {

    transferHistory (newValue) {
      this.items = newValue;
    }

  },

  methods: {

    ...mapActions('sales', [
      'loadSales',
      'clearTransferHistory',
      'clearSelectedSale'
    ]),

    ...mapActions('branch', [
      'loadBranches', 
    ]),

    handleCommand(command) {
      command();
    },

    ...mapActions('customers', [
      'loadCustomers',
    ]),

    ...mapActions('sales', {
      loadItems: 'loadTransferHistory',
    }),

    warnUser (msg) {
      return this.$swal({
        title: 'Are you sure?',
        text: msg,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      });
    },

    deleteItems() {},

    ...{ formatDate, formatStatus, dateForHumans, parseColData }

  },

  computed: {
    ...mapState('sales', ['transferHistory']),
  },

  components: {
    Loading,
    FullscreenDialog,
    InfiniteLoading,
    EmptyState,
  }
};
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
