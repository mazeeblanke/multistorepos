<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      CustomerForm.page-forms(
        ref="new-customer-form",
        @close-form="closeNewCustomerForm",
        @action-complete="closeNewCustomerForm",
        v-if="isCreatingCustomer"
      )
    .level.toolbar(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 Listing Customers ({{ filteredItemsData.length }})
      .level-item
          div.search
            el-input(placeholder="Search customers by name...", clearable v-model="searchQuery" @input="search('customer')" class="input-with-select")
              el-button(slot="append" icon="el-icon-search")  
      .level-right
        .level-item
          a.button.is-primary(@click="createNewCustomer", :disabled="formPanelOpen")
            span.icon
              i.material-icons add
            span Create Customer
        //- .level-item
        //-   a.button
        //-     span Toggle search filters
        //-     span.icon
        //-       i.material-icons keyboard_arrow_down
    //- RequisitionListFilter(:filter-params.sync="filterParams", @change="filterItems", v-show="displaySearchFilters")
    EmptyState(empty-text="No Result" v-if="!filteredItemsData.length && !loading", :style="{ height: '400px' }")
    Loading(loading-text="Loading customers" v-if="(loading && !filteredItemsData.length) || isSearching", :style="{ height: '400px' }")
    el-table(
      ref="items-table",
      :data="filteredItemsData",
      :max-height="400",
      :border="false"
      :default-sort="{prop: 'created_at', order: 'descending'}",
      :highlight-current-row="true",
      @cell-click="handleCellClick"
      v-show="filteredItemsData.length && !isSearching",
      @selection-change="handleSelectionChange",
      :stripe="true"
    )
      el-table-column(type="selection", fixed="left")
      el-table-column(label="No", type="index", :index="1" width="50", fixed="left")
      el-table-column(prop="id", show-overflow-tooltip, label="ID", align="left", :sortable="true", fixed="left")
      el-table-column(prop="fullname", show-overflow-tooltip, label="Fullname", align="left", :sortable="true", fixed="left")
        template(slot-scope="scope") 
          span {{ scope.row.firstname + ' ' + scope.row.surname }}
      el-table-column(prop="email", label="Email", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope") 
          span {{ parseColData(scope.row.email) }}
      el-table-column(prop="gender", label="Gender", align="left", show-overflow-tooltip, :sortable="true" )
        template(slot-scope="scope") 
          span {{ parseColData(scope.row.gender) }}
      el-table-column(prop="marital_status", label="Marital status", show-overflow-tooltip, align="left", :sortable="true")
        template(slot-scope="scope") 
          span {{ parseColData(scope.row.marital_status) }}
      el-table-column(prop="phone", label="Phone No.", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope") 
          span {{ parseColData(scope.row.phone) }}
      el-table-column(prop="created", label="Created at", align="left", show-overflow-tooltip, :sortable="true", fixed="right")
        template(slot-scope="scope") 
            span {{ dateForHumans(scope.row.created) }}
      //- el-table-column(label="Actions", :render-header="renderDelete", width="70")
      //-   template(slot-scope="scope", scope="props")
      //-     button.button(:class="$style.trash")
      //-       i.material-icons delete
      //- div(slot="append" v-show="showLoading")
      //-  div(ref='loader' style="height: 45px;")
      //-    infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import { formatDate, formatStatus, dateForHumans } from '@/filters/format';
import Loading from '@/components/shared/Loading';
import CustomerForm from '@/components/customers/CustomerForm';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
// import RequisitionListFilter from '@/components/purchasing/RequisitionListFilter';
import EmptyState from '@/components/EmptyState';

export default {
  mounted() {
    this.clearSelectedCustomer();
    this.clearCustomers();
    this.loading = true;
    this.preloadItemsList();
    this.handleBottomScroll();
  },
  mixins: [deleteMixin, filterMixin],
  // watch: {
  //   customers(newValue) {
  //     this.items.data = _.flatMap(newValue);
  //   },
  // },
  data() {
    return {
      formPanelOpen: false,
      isCreatingCustomer: false,
      // isCreatingRFQ: false,
      filter: {
        allcustomers: 'allcustomers',
        page: 1,
      },
      displaySearchFilters: false,
      // searchQuery: null,
      // filteredRequisitions: [],
      // filterParams: {
      //   status: null,
      //   issuedBefore: null,
      //   issuedAfter: null,
      //   buyer: null,
      //   requisitionType: null,
      //   requisitionCode: null,
      // },
      loading: false,
      items: {
        data: []
      }
    };
  },
  watch: {
    customers(newValue) {
      this.items = newValue;
      this.filter.page = newValue.nextPage;
    },
    filteredItemsData(newValue) {
      this.SET_FILTERED_ITEMS(newValue);
    },
  },
  methods: {
    ...mapActions('customers', [
      'loadCustomers',
      'clearSelectedCustomer',
      'loadCustomersByPage',
      'clearCustomers',
    ]),
    ...mapMutations('customers', {
      SET_FILTERED_ITEMS: 'SET_FILTERED_CUSTOMERS',
    }),
    parseColData(data) {
      if (data === 'null') {
        return '-';
      }
      return data;
    },
    ...mapActions('customers', {
      searchItems: 'loadCustomers',
    }),
    // search(e) {
    //   if (this.searchQuery) {
    //     this.isSearching = true;
    //     this.loading = true;
    //     this.loadCustomers({
    //       type: 'customer',
    //       search: this.searchQuery,
    //     }).then((res) => {
    //       this.filteredItems.data = res instanceof Array ? res : [];
    //       this.loading = false;
    //       this.isSearching = false;
    //     })
    //     .catch(() => {
    //       this.isSearching = false;
    //       this.loading = false;
    //     });
    //   } else {
    //     this.isSearching = false;
    //   }
    // },
    ...mapActions('customers', {
      loadItems: 'loadCustomersByPage',
    }),
    deleteItems() {},
    handleCellClick(row, cell) {
      if (cell.type !== 'selection') {
        this.showCustomer(row);
      }
    },
    createNewCustomer() {
      this.formPanelOpen = true;
      this.isCreatingCustomer = true;
      this.$scrollTo(this.$refs['new-customer-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      });
    },
    closeNewCustomerForm() {
      this.formPanelOpen = false;
      this.isCreatingCustomer = false;
    },
    showCustomer(row) {
      this.$router.push({ name: 'customer_view', params: { id: row.id } });
    },
    ...{ formatDate, formatStatus, dateForHumans },
  },
  computed: {
    ...mapState('customers', ['customers']),
  },
  components: {
    Loading,
    CustomerForm,
    FullscreenDialog,
    InfiniteLoading,
    // RequisitionListFilter,
    EmptyState,
  },
};
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
