<template lang="pug">
div
  .ExpiredProductList
    .level.toolbar(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 Listing Products to reorder ({{ filteredItemsData.length }})
      //- .level-item
      //-     div.search
      //-       el-input(placeholder="Search expired products...", clearable v-model="searchQuery" @input="search('user')" class="input-with-select")
      //-         el-button(slot="append" icon="el-icon-search")
      //- .level-right
      //-   .level-item
      //-     a.button
      //-       span Toggle search filters
      //-       span.icon
      //-         i.material-icons keyboard_arrow_down
    //- ExpiredProductListFilter(:filter-params.sync="filterParams", @change="filterItems", v-show="displaySearchFilters")
    EmptyState(empty-text="No Result" v-if="!filteredItemsData.length && !loading", :style="{ height: '400px' }")
    Loading(loading-text="Loading products to reorder" v-if="(loading && !filteredItemsData.length) || isSearching", :style="{ height: '400px' }")
    el-table.p-0.reorderproductlist(
      ref="items-table",
      :data="filteredItemsData",
      max-height="400",
      :border="false"
      :highlight-current-row="true",
      :stripe="true",
       v-show="filteredItemsData.length && !isSearching",
    )
      el-table-column(prop="status", label="", :render-header="renderAvailability", align="left", show-overflow-tooltip, width="70")
        template(slot-scope="scope")
          span.dot.dot-lg.dot-warning
      el-table-column(prop="id", show-overflow-tooltip, align="left", label="ID", width="70", :sortable="true")
      el-table-column(prop="name", show-overflow-tooltip, align="left", label="Description", :sortable="true")
      el-table-column(prop="barcode", show-overflow-tooltip, align="left", label="Barcode", :sortable="true")
      el-table-column(prop="costprice", show-overflow-tooltip, align="left", label="Cost price", :sortable="true")
        template(slot-scope="scope")
          span {{ money(scope.row.costprice) }}
      el-table-column(prop="quantity", show-overflow-tooltip, align="left", label="Quantity", :sortable="true")
      el-table-column(label="Expiry Date", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span {{ dateForHumans(scope.row.exptime) }}
      //- el-table-column(label="Actions", width="180")
      //-   template(slot-scope="scope")
      //-     .actions
      //-       el-dropdown(split-button size="small" type="primary") Read
      //-         el-dropdown-menu(slot="dropdown")
      //-           el-dropdown-item Action 3
      //-           el-dropdown-item Action 4
      //-           el-dropdown-item Action 5
      div(slot="append" v-show="showLoading")
       div(ref='loader' style="height: 45px;")
         infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import { formatDate, formatStatus, dateForHumans } from '@/filters/format';
import Loading from '@/components/shared/Loading';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
import MoneyMixin from '@/mixins/MoneyMixin';
import EmptyState from '@/components/EmptyState';
import { ObjectToFormData, parseColData, money } from '@/utils/helper';

export default {
  mounted() {
    this.clearReorderProducts();
    this.loading = true;
    this.preloadItemsList();
    this.handleBottomScroll(
      document.querySelector('.reorderproductlist .el-table__body-wrapper')
    );
  },
  mixins: [deleteMixin, filterMixin, MoneyMixin],
  data() {
    return {
      formPanelOpen: false,
      filter: {
        reorderproducts: 'reorderproducts',
        page: 1,
      },
      displaySearchFilters: false,
      isEditingEnquiry: false,
      selectedEnquiry: {},
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
      fullScreenActive: false,
      items: {
        data: []
      }
    };
  },
  watch: {
    reorderProducts(newValue) {
      this.items = newValue;
      this.filter.page = newValue.nextPage;
    },
  },
  methods: {
    ...{ money },
    ...mapActions('products', [
         'clearReorderProducts',
      // 'loadProductEnquiries',
      // 'clearExpiredProducts',
      // 'clearProductEnquiries',
    ]),
    ...mapMutations('products', {
      setItems: 'SET_REORDER_PRODUCTS',
    }),
    ...mapMutations('products', [
      'ADD_ENQUIRY',
    ]),
    renderAvailability(h) {
      return h('i', { class: 'material-icons' }, 'rss_feed');
    },
    parseColData(data) {
      if (data === 'null') {
        return '-';
      }
      return data;
    },
    ...mapActions('products', {
      searchItems: 'loadProductEnquiries',
    }),
    ...mapActions('products', {
      loadItems: 'getProductsStats',
    }),
    deleteItems() {},
    handleCellClick(row, cell) {
      // if (cell.type !== 'selection') {
      //   this.showEnquiry(row);
      // }
    },
    createNewEmployee() {
      this.formPanelOpen = true;
      this.isCreatingEnquiry = true;
      this.$scrollTo(this.$refs['new-enquiry-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      });
    },
    ...{ formatDate, formatStatus, dateForHumans, parseColData },
  },
  computed: {
    ...mapState('products', ['reorderProducts']),
  },
  components: {
    Loading,
    InfiniteLoading,
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
