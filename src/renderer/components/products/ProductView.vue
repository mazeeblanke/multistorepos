<template lang="pug">
  .MaterialView.shadow-divider
    FullscreenDialog( v-close="closeDialog" @closed="closeDialog" :active.sync="fullScreenActive")
      ProductForm.page-forms(
        ref="product-form",
        :class="$style.pageForms",
        @close-form="closeDialog",
        :_product="selectedProduct",
        v-if="isEditingProduct"
      )
      ProductSupplyForm.page-forms(
        ref="product-supply-form",
        :class="$style.pageForms",
        @close-form="closeDialog",
        @action-complete="updateSelectedProduct",
        v-if="isAddingProductSupply"
      )
    .level.toolbar
      .level-left
        .level-item
          router-link.button(:to="{name: 'products_list'}")
            span.icon.is-medium
              i.material-icons keyboard_arrow_left
        .level-item(v-if="selectedProduct")
          .page-title.subtitle.is-6
            span.mr-5 Viewing Product
            span.tag.is-medium.is-warning {{ formattedProductName }}
      .level-right
        .level-item
            button.button.is-primary(@click="addProductSupply") Add product supply
        .level-item
          JsonExcel(
            class="btn btn-default",
            :data="selectedProductSales.data",
            :fields="json_fields",
            :name="documentName",
            type="xlsx",
            v-if="selectedProduct"
          )
            button.button.is-primary(
              :disabled="!selectedProductSales.data.length"
            ) Download Purchase history
        .level-item
          .field.has-addons
            p.control
              button.button(@click="editProduct")
                span.icon
                  i.material-icons edit
                span Edit Information
    Loading(loading-text="Loading product information" v-if="isLoading", :style="{ height: '400px' }")
    el-tabs(v-model="currentTab", value='summary', type="card", v-if="!isLoading")
      el-tab-pane(name="details", label='Product Details')
        .columns(:class="$style.columns" v-if="selectedProduct")
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Name:
              .field-label.is-normal
                el-tooltip(class="item", effect="dark", :content="selectedProduct.name", placement="right-start")
                  label.label.is-pulled-left  {{ formattedProductName }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Quantity: 
              .field-label.is-normal
                label.label.is-pulled-left  {{ selectedProduct.quantity }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Registration Date: 
              .field-label.is-normal
                label.label.is-pulled-left {{ dateForHumans(selectedProduct.regtime) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Reorder:
              .field-label.is-normal
                label.label.is-pulled-left {{ selectedProduct.reorder }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Status:
              .field-label.is-normal
                label.label.is-pulled-left {{ selectedProduct.status }}
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong ID:
              .field-label.is-normal
                label.label.is-pulled-left {{ selectedProduct.id }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Unit price:
              .field-label.is-normal
                label.label.is-pulled-left  {{ selectedProduct.unitprice }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Cost price:
              .field-label.is-normal
                label.label.is-pulled-left {{ selectedProduct.costprice }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Barcode: 
              .field-label.is-normal
                label.label.is-pulled-left {{ selectedProduct.barcode }}  
        .mt-30
          h5.title.is-5.has-text-centered Product Purchase history
          el-table(
            v-loading="isLoadingSales"
            :data="filteredItemsData",
            :empty-text="emptyText",
            :max-height="200"
            :height="200"
          )
            el-table-column(label="No", type="index", :index="1")
            el-table-column(prop="product_id", label="Product ID")
            el-table-column(prop="sales_id", show-overflow-tooltip, label="Sales ID")
            el-table-column(prop="sub_total", show-overflow-tooltip, label="Total")
            el-table-column(prop="unit_price", show-overflow-tooltip, label="Unit Price")
            el-table-column(prop="payment_type", show-overflow-tooltip, label="Payment method")
            el-table-column(prop="quantity", show-overflow-tooltip, label="Qty Bought")         
            el-table-column(prop="created_at", show-overflow-tooltip, label="Sold At")  
              template(slot-scope="props")
                span {{ formatDate(props.row.created_at)}} 
            div(slot="append" v-show="showLoading")
              div(ref='loader' style="height: 45px")
                infinite-loading(spinner="waveDots" v-if="loading")  
      el-tab-pane(name="analytics", label='Product Analytics')              
</template>

<script>
import EmptyState from '@/components/EmptyState'
import { formatDate, dateForHumans } from '@/filters/format'
import { mapActions, mapState } from 'vuex'
import ProductForm from '@/components/products/ProductForm'
import ProductSupplyForm from '@/components/products/ProductSupplyForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import InfiniteLoading from 'vue-infinite-loading'
import filterMixin from '@/mixins/FilterMixin'
import Loading from '@/components/shared/Loading'
import JsonExcel from 'vue-json-excel'
export default {

  data () {
    return {
      isEditingProduct: false,
      isAddingProductSupply: false,
      previewingDoc: false,
      isLoading: false,
      fullScreenActive: false,
      currentTab: 'details',
      isLoadingSales: false,
      filter: {
        aggregate: 0,
        limit: 4,
        persist: false
      },
      items: {
        data: []
      },
      json_fields: {
        'Sales ID': 'sales_id',
        Customer: 'customer',
        Total: 'sub_total',
        Discount: 'discount',
        profit: 'profit',
        Costprice: 'costprice',
        Unitprice: 'unit_price',
        'Sold By': 'user',
        'Payment Method': 'payment_type',
        'Qty Bought': 'quantity',
        'Sold At': 'created_At'
      }
    }
  },

  mixins: [filterMixin],

  mounted () {
    this.clearSelectedProduct()
    this.isLoading = true
    this.loadProduct({
      id: this.$route.params.id
    })
      .then(() => {
        this.isLoading = false
        this.isLoadingSales = true
        this.filter = {
          ...this.filter,
          product_id: this.selectedProduct.id
        }
        return this.preloadItemsList()
      })
      .then(res => {
        this.isLoadingSales = false
        this.handleBottomScroll()
        this.setSelectedProductSales(res.body)
      })
      .catch(err => {
        console.log(err)
        this.$snackbar.open({
          message: 'Could not find a product with that ID',
          type: 'is-danger'
        })
        this.isLoading = false
        this.isLoadingSales = false
        this.$router.push({ name: 'products_list' })
      })
  },
  components: {
    EmptyState,
    Loading,
    ProductForm,
    ProductSupplyForm,
    FullscreenDialog,
    InfiniteLoading,
    JsonExcel
  },
  methods: {

    ...{ formatDate, dateForHumans },

    ...mapActions('products', [
      'loadProduct',
      'clearSelectedProduct',
      'setSelectedProductSales',
      'deleteProduct'
    ]),

    ...mapActions('sales', {
      loadItems: 'loadSales'
    }),

    ...mapActions('sales', ['loadSales']),

    setItems (res) {
      const { data } = res.body
      const salesHistory = {
        ...res.body,
        data: this.items.data.concat(data)
      }
      this.setSelectedProductSales(salesHistory)
    },

    updateSelectedProduct (updatedProduct) {
      if (
        this.selectedProduct &&
        this.selectedProduct.id === updatedProduct.product5
      ) {
        this.selectedProduct.quantity =
          parseInt(this.selectedProduct.quantity, 10) +
          parseInt(updatedProduct.quantity, 10)
      }
    },

    editProduct () {
      this.isEditingProduct = true
      this.fullScreenActive = true
    },

    addProductSupply () {
      this.isAddingProductSupply = true
      this.fullScreenActive = true
    },

    closeDialog () {
      this.fullScreenActive = false
      this.isEditingProduct = false
      this.isAddingProductSupply = false
    }
  },

  computed: {

    ...mapState('products', ['selectedProduct']),

    emptyText () {
      return `${this.selectedProduct.name} has not been purchased yet`
    },

    documentName () {
      if (this.selectedProduct) {
        return `${this.selectedProduct.name}'s purchase history`
      }
      return null
    },

    formattedProductName () {
      return this.selectedProduct.name && this.selectedProduct.name.length > 15
        ? this.selectedProduct.name.substring(0, 15) + '...'
        : this.selectedProduct.name
    },

    selectedProductSales () {
      return this.selectedProduct ? this.selectedProduct.sales : { data: [] }
    }

  },

  watch: {
    selectedProductSales (newValue) {
      this.items = newValue
    }
  }

}
</script>

<style lang="sass" scoped>
// .field-label
//   text-align: left !important
.label  
  font-weight: 100
.shadow-divider
  box-shadow: 0px 0px 4px 0 rgba(0, 0, 0, 0.08) inset !important;
  min-height: 560px !important;  
</style>

<style lang="sass">
// .el-table__body-wrapper
//   overflow-x: hidden
.el-progress
  padding: 25px
  position: absolute
  top: 5%
  z-index: 23
  width: 100%  
</style>

<style lang="sass" module> 
.columns
  margin: 20px 50px 10px 50px
.trash
  border: none
  background: transparent    
</style>
