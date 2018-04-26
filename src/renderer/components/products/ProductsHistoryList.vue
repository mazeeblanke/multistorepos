<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      ProductForm.page-forms(
        ref="new-product-form",
        @close-form="closeNewProductsForm",
        @action-complete="closeNewProductsForm",
        v-if="isCreatingProduct"
      )
    .level.toolbar(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 Listing Product changes ({{ filteredItemsData.length }})
      .level-right
        .level-item
          a.button
            span Toggle search filters
            span.icon
              i.material-icons keyboard_arrow_down
    EmptyState(empty-message="Nothing here yet" v-if="!filteredItemsData.length && !loading", :style="{ height: '400px' }")
    Loading(loading-text="Loading Products" v-if="loading && !filteredItemsData.length", :style="{ height: '400px' }")
    el-table(
      ref="items-table",
      :data="filteredItemsData",
      :max-height="400",
      :border="false"
      :default-sort="{prop: 'created_at', order: 'descending'}",
      :highlight-current-row="true",
      @cell-click="handleCellClick"
      v-show="filteredItemsData.length",
      @selection-change="handleSelectionChange",
      :stripe="true"
    )
      el-table-column(type="selection", fixed="left")
      el-table-column(label="No", type="index", :index="1" width="50" fixed="left")
      el-table-column(prop="productid", show-overflow-tooltip, label="ID", align="left", :sortable="true")
      el-table-column(prop="product", show-overflow-tooltip, label="Product Name", align="left", :sortable="true")
      el-table-column(prop="previous_price", :label="PreviousPriceLabel", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span {{ `${currencySymbol} ${scope.row.previous_price}` }}
      el-table-column(prop="next_price", :label="NextPriceLabel", align="left", :sortable="true" )
        template(slot-scope="scope",)
          span {{ `${currencySymbol} ${scope.row.next_price}` }}
      el-table-column(prop="change_date", label="Changed at", align="left", :sortable="true" fixed="right")
        template(slot-scope="scope") 
          span {{ dateForHumans(scope.row.change_date) }}
      //- div(slot="append" v-show="showLoading")
      //-  div(ref='loader' style="height: 45px;")
      //-    infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters } from 'vuex';
import { formatDate, formatStatus, dateForHumans } from '@/filters/format';
import Loading from '@/components/shared/Loading';
import ProductForm from '@/components/products/ProductForm';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
import MoneyMixin from '@/mixins/MoneyMixin';
import EmptyState from '@/components/EmptyState';
import { ObjectToFormData } from '@/utils/helper';

export default {
  mounted() {
    // this.clearSelectedProduct();
    this.loading = true;
    // this.loadProductsByPage(
    //   ObjectToFormData({ page: 1, allproducts: 'allproducts' })
    // )
    // .then((products) => {
    //   this.loading = false;
    //   // this.items.data = _.flatMap(Products);
    // })
    // .catch(() => {
    //   this.loading = false;
    // });
    // this.clearSelectedRequisition();
    // this.clearCommercialEvaluation();
    this.clearChangedProducts();
    this.preloadItemsList();
    this.handleBottomScroll();
  },
  mixins: [deleteMixin, filterMixin, MoneyMixin],
  watch: {
    changedProducts(newValue) {
      this.items = newValue;
      this.filter.page = newValue.nextPage;
    },
  },
  data() {
    return {
      formPanelOpen: false,
      isCreatingProduct: false,
      // isCreatingRFQ: false,
      filter: {
        page: 1,
        productpricechange: 'productpricechange',
      },
      displaySearchFilters: false,
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
  methods: {
    ...mapActions('products', [
      'loadProducts',
      'clearProducts',
      'clearChangedProducts',
      // 'clearSelectedProduct',
    ]),
    // deleteProduct() 
    ...mapActions('products', {
      searchItems: 'loadProducts',
    }),
    ...mapActions('products', {
      loadItems: 'loadProductChangesByPage',
    }),
    deleteItems() {},
    handleCellClick(row, cell) {
      if (cell.type !== 'selection') {
        this.showProduct(row);
      }
    },
    createNewProduct() {
      this.formPanelOpen = true;
      this.isCreatingProduct = true;
      this.$scrollTo(this.$refs['new-product-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      });
    },
    closeNewProductsForm() {
      this.formPanelOpen = false;
      this.isCreatingProduct = false;
    },
    showProduct(row) {
      this.$router.push({ name: 'product_view', params: { id: row.productid } });
    },
    ...{ formatDate, formatStatus, dateForHumans },
  },
  computed: {
    ...mapState('products', ['changedProducts']),
    NextPriceLabel() {
      return `Next Price (${this.currencySymbol})`
    },
    PreviousPriceLabel() {
      return `Previous Price (${this.currencySymbol})`
    },
  },
  components: {
    Loading,
    ProductForm,
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
