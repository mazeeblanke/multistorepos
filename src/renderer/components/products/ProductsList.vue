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
        .level-item.page-title.subtitle.is-5 Listing Products ({{ filteredItemsData.length }})
      .level-item
        div.search
          el-input(
            placeholder="Search products by name...",
            clearable,
            v-model="searchQuery",
            @input="search('product')",
            class="input-with-select"
          )
            el-button(slot="append" icon="el-icon-search")
      .level-right
        .level-item
          a.button.is-primary(@click="createNewProduct", :disabled="formPanelOpen")
            span.icon
              i.material-icons add
            span Create product
    EmptyState(empty-message="Nothing here yet" v-if="!filteredItemsData.length && !loading", :style="{ height: '400px' }")
    Loading(loading-text="Loading Products" v-if="loading && !filteredItemsData.length", :style="{ height: '400px' }")
    el-table(
      ref="items-table",
      :data="filteredItemsData",
      :max-height="400",
      height="400"
      :border="false"
      :default-sort="{prop: 'created_at', order: 'descending'}",
      :highlight-current-row="true",
      @cell-click="handleCellClick"
      v-show="filteredItemsData.length",
      @selection-change="handleSelectionChange",
      :stripe="true"
    )
      el-table-column(type="selection" fixed="left")
      el-table-column(label="No", type="index", :index="1" width="50" fixed="left")
      el-table-column(prop="id", show-overflow-tooltip, label="ID", align="left", :sortable="true")
      el-table-column(prop="name", show-overflow-tooltip, label="Name", align="left", :sortable="true")
      el-table-column(prop="quantity", label="Quantity", align="left", show-overflow-tooltip, :sortable="true")
      el-table-column(prop="unitprice", show-overflow-tooltip, :label="unitPriceLabel", align="left", :sortable="true")
        template(slot-scope="scope", scope="props")
          span {{ `${currencySymbol} ${props.row.unitprice}` }}
      el-table-column(prop="costprice", show-overflow-tooltip, :label="costPriceLabel", align="left", :sortable="true")
        template(slot-scope="scope", scope="props")
          span {{ `${currencySymbol} ${props.row.costprice}` }}
      el-table-column(prop="exptime", show-overflow-tooltip, label="Expiry date", align="left", :sortable="true")
        template(slot-scope="scope")
          span {{ dateForHumans(scope.row.exptime) }}
      el-table-column(label="Actions", :render-header="renderDelete", @click.stop="deleteRow(props.row)", width="70", fixed="right")
        template(slot-scope="scope", scope="props")
          button.button(:class="$style.trash" @click.stop="deleteRow(props.row)")
            i.material-icons delete
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
import MoneyMixin from '@/mixins/MoneyMixin';
import filterMixin from '@/mixins/FilterMixin';
import EmptyState from '@/components/EmptyState';
import { ObjectToFormData } from '@/utils/helper';

export default {
  mounted() {
    this.loading = true;
    this.clearProducts();
    this.preloadItemsList();
    this.handleBottomScroll();
  },
  mixins: [deleteMixin, filterMixin, MoneyMixin],
  watch: {
    products(newValue) {
      this.items = newValue;
      this.filter.page = newValue.nextPage;
    },
  },
  data() {
    return {
      formPanelOpen: false,
      isCreatingProduct: false,
      filter: {
        page: 1,
        allproducts: 'allproducts',
      },
      displaySearchFilters: false,
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
      'deleteProduct',
    ]),
    ...mapActions('products', {
      searchItems: 'loadProducts',
    }),
    ...mapActions('products', {
      loadItems: 'loadProductsByPage',
    }),
    deleteItems() {},
    warnUser(warning) {
      return this.$swal({
        title: 'Are you sure?',
        text: warning || 'Do you want to delete this product(s) ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      });
    },
    deleteRow(row) {
      this.warnUser().then((res) => {
        if (res.value) {
          this.deleteProduct(
          {
            formData: ObjectToFormData({ product2: row.id, deleteproduct: "deleteproduct" }),
            product: row,
          })
          .then((res) => {
            this.$snackbar.open('successfully deleted');
          })
        }
      })
    },
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
      this.$router.push({ name: 'product_view', params: { id: row.id } });
    },
    ...{ formatDate, formatStatus, dateForHumans },
  },
  computed: {
    ...mapState('products', ['products']),
    costPriceLabel() {
      return `Cost Price (${this.currencySymbol})`
    },
    unitPriceLabel() {
      return `Unit Price (${this.currencySymbol})`
    },
  },
  components: {
    Loading,
    ProductForm,
    FullscreenDialog,
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
