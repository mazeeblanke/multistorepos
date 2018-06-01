<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      ProductForm.page-forms(
        ref="new-product-form",
        @close-form="closeNewProductsForm",
        @action-complete="closeNewProductsForm",
        v-show="isCreatingProduct"
      )
    .level.toolbar(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 
          span.el-icon-news.mr-5.font-size-23
          span Listing Products ({{ filteredItemsData.length }})
      .level-item
        div.search
          el-input(
            placeholder="Search products by name...",
            clearable,
            v-model="filter.name",
            @input="search('name')",
            class="input-with-select"
          )
            // el-button(slot="append" icon="el-icon-search")
      .level-right
        .level-item
          a.button.is-primary(@click="createNewProduct", :disabled="formPanelOpen")
            span.icon
              i.material-icons add
            span Create product
    EmptyState(
      empty-message="Nothing here yet",
      v-if="!filteredItemsData.length && !loading", 
      :style="{ height: '400px' }"
    )
    Loading(
      loading-text="Loading Products", 
      v-if="loading && !filteredItemsData.length", 
      :style="{ height: '400px' }"
    )
    el-table(
      ref="items_table",
      :data="filteredItemsData",
      :max-height="500",
      height="500"
      :border="false"
      :highlight-current-row="true",
      @cell-click="handleCellClick"
      v-show="filteredItemsData.length",
      @selection-change="handleSelectionChange",
    )
      el-table-column(type="selection")
      el-table-column(label="No", type="index", :index="1" width="50")
      el-table-column(prop="id", show-overflow-tooltip, label="ID", :sortable="true")
      el-table-column(prop="name", show-overflow-tooltip, label="Name", :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ scope.row.name }}
      el-table-column(label="Qty", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ scope.row.branch ? scope.row.branch.quantity || 0 : 0 }}
      el-table-column(label="Qty (HQ)", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ scope.row.quantity }}
      el-table-column(show-overflow-tooltip, :label="unitPriceLabel", :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ `${currencySymbol} ${scope.row.unitprice}` }}
      el-table-column(show-overflow-tooltip, :label="costPriceLabel", :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ `${currencySymbol} ${scope.row.costprice}` }}
      el-table-column(show-overflow-tooltip, label="Created At", :sortable="true")
        template(slot-scope="scope")
          span.el-icon-time.mr-5
          span.is-capitalized {{ formatDate(scope.row.created_at) }}
      el-table-column(label="Actions", :render-header="renderDelete", width="70")
        template(slot-scope="scope")
          button.button(:class="$style.trash" @click.stop="deleteRow(scope.row)")
            span.el-icon-delete.font-size-23
      div(slot="append" v-show="showLoading")
       div(ref='loader' style="height: 45px")
         infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import { formatDate, formatStatus, dateForHumans } from '@/filters/format'
import Loading from '@/components/shared/Loading'
import ProductForm from '@/components/products/ProductForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import InfiniteLoading from 'vue-infinite-loading'
import deleteMixin from '@/mixins/DeleteMixin'
import MoneyMixin from '@/mixins/MoneyMixin'
import filterMixin from '@/mixins/FilterMixin'
import EmptyState from '@/components/EmptyState'
import { ObjectToFormData } from '@/utils/helper'

export default {

  mounted() {
    this.loading = true
    this.clearProducts()
    this.preloadItemsList()
    this.handleBottomScroll()
  },

  mixins: [deleteMixin, filterMixin, MoneyMixin],

  watch: {
    products(newValue) {
      this.items = newValue
      this.filter.page = newValue.nextPage
    },
  },

  data() {
    return {
      isCreatingProduct: false,
      filter: {
        page: 1,
        strict: 0,
        name: null
      },
      displaySearchFilters: false,
      loading: false,
      items: {
        data: []
      }
    }
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
      loadItems: 'loadProducts',
    }),

    ...mapMutations('app', ['SET_FORM_STATE']),

    deleteItems() {},

    warnUser(warning) {
      return this.$swal({
        title: 'Are you sure?',
        text: warning || 'Do you want to delete this product(s) ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      })
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
            this.$snackbar.open('successfully deleted')
          })
        }
      })
    },

    handleCellClick(row, cell) {
      if (cell.type !== 'selection') {
        this.showProduct(row)
      }
    },

    createNewProduct() {
      this.SET_FORM_STATE(true)
      this.isCreatingProduct = true
      this.$scrollTo(this.$refs['new-product-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      })
    },

    closeNewProductsForm() {
      this.SET_FORM_STATE(false)
      this.isCreatingProduct = false
    },

    showProduct(row) {
      this.$router.push({ name: 'product_view', params: { id: row.id } })
    },

    ...{ formatDate, formatStatus, dateForHumans }

  },

  computed: {

    ...mapState('products', ['products']),
    ...mapState('app', ['formPanelOpen']),
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

}
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
