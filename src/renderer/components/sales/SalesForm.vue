<template lang="pug">
div
  CheckProduct(
    :check-product-visible="checkProductVisible",
    :handle-check-product-close="handleCheckProductClose",
    :product="saleForm.product3",
    ref="check-product",
  )
  .RequisitionForm
    .level.toolbar.shadow-divider
      .level-left
        .level-item
          span.tag.is-medium(title="Sales id") 
            | Sale ID {{ cart.sales_id }}
      .level-center.columns
        .level-item.column.is-5
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Product
            .field-body
              .field
                el-select(
                  :value="formatedValue"
                  :default-first-option="true"
                  :filterable="true"
                  :remote="true"
                  placeholder="Enter product name"
                  :remote-method="getProductSuggestions"
                  :loading="loading"
                  @change="selectProduct"
                  value-key="name"
                  :disabled="processingTransaction || hasPaid"
                  clearable,
                )
                  el-option(
                    v-for="(item, index) in suggestions"
                    :key="index"
                    :label="item.name"
                    :value="item"
                    :disabled="item.name === saleForm.selectedItem.name"
                  )
                    el-tooltip(
                      class="item", 
                      effect="dark", 
                      :open-delay="1000", 
                      :content="item.name", 
                      placement="top-start"
                    )
                      <span class="sale-item" style="float: left">{{ item.name }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">
                      <strong>{{ item.branch.quantity }} QTY LEFT</strong>
                    </span>
        .level-item.column.is-5
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Quantity
            .field-body
              .field.is-narrow
                .control
                  el-input-number(
                    v-model="saleForm.quantity",
                    placeholder="Enter Quantity",
                    @change="handleChange",
                    controls-position="right",
                    :min="1"
                    :max="parseInt(saleForm.quantityInStock)"
                    :disabled="processingTransaction || hasPaid"
                  )
      .level-right
        .level-item
          button.button(
            @click="handleCheckProductOpen",
            :disabled="!formatedValue",
            title="search for product in other branches"
          )
            span.icon
              i.material-icons find_replace
        .level-item
          button.button.is-primary(
            :class="{'is-loading': processing}",
            :disabled="processing || $v.$invalid",
            @click="addToCart()"
            title="Add products to the customer's cart"
          )
            b-icon(icon="save")
            span Add product
        .level-item
          a.button.no-border(
            @click="closeForm()", 
            title="Close product cart form"
          )
            span.icon
              i.material-icons close
</template>

<script>
/* eslint-disable */
import { mapState, mapActions } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import { ObjectToFormData, multiplyCash } from '@/utils/helper';
import EmptyState from '@/components/EmptyState';
import CheckProduct from '@/components/sales/CheckProduct';
import _ from 'lodash';

export default {
  props: {
    processingTransaction: {
      type: Boolean,
    },
    hasPaid: {
      type: Boolean,
    },
  },
  mixins: [validationMixin],
  data() {
    return {
      saleForm: {
        selectedItem: {
          name: '',
        },
        product3: null,
        quantityInStock: null,
        quantity: null,
        subTotal: null
      },
      suggestions: [],
      loading: false,
      availableMaterials: [],
      processing: false,
      checkProductVisible: false,
    };
  },
  validations: {
    saleForm: {
      product3: { required },
      quantity: { required },
    },
  },
  mounted() {
    // if (!this.salesid) {
      this.generateSalesId();
    // }
  },
  watch: {
    salesid(newVal) {
      if (!newVal) {
        this.generateSalesId();
      }
    },
  },
  computed: {
    ...mapState('users', [
      'currentUser',
    ]),
    ...mapState('sales', [
      'salesid',
      'cart',
    ]),
    ...mapState('branch', [
      'currentBranch',
    ]),
    ...mapState('settings', [
      'settings',
    ]),


    cartItemNames() {
      if (this.cart.products.length) {
        return this.cart.products.map(i => i && i.name);
      }
      return [];
    },


    formatedValue() {
      if (this.saleForm.selectedItem.name) {
        return this.saleForm.selectedItem.name.length > 61
          ? this.saleForm.selectedItem.name.substring(0, 61) + '...'
          : this.saleForm.selectedItem.name;
      }
      return '';
    },
    searchInfo() {
      if (this.saleForm.selectedItem.name) {
        const product_name = this.saleForm.selectedItem.name.length > 61
          ? this.saleForm.selectedItem.name.substring(0, 61) + '...'
          : this.saleForm.selectedItem.name;
          return `Search for ${product_name} in other branches`;
      }
      return '';
    },
  },
  methods: {
    selectProduct(item) {
      let { id, branch } = item;
      this.saleForm = {
        ...this.saleForm,
        ...{
          product3: id,
          quantityInStock: branch.quantity,
          selectedItem: item
        }};
    },
    addNewItem() {

    },
    handleChange() {

    },
    handleCheckProductOpen() {
      this.checkProductVisible = true;
      this.$refs['check-product'].findProductInBranches();
    },
    handleCheckProductClose(done) {
      this.checkProductVisible = false;
    },


    filterSuggestions (data) {
      return data.filter((s) => {
        if (this.cart.products.length) {
          return !this.cartItemNames.includes(s.name)
        }
        return false
      });
    },

    getProductSuggestions(query) {
      if (query !== '') {
        this.loading = true;
        let payload = {
          name: query,
          // nam: query,
          // branch_id: 1,
          branch_id: this.settings.branch.id,
        };
        this.loadProducts(payload)
        .then(({ data }) => {
          this.loading = false;
          this.suggestions = this.filterSuggestions(data)
        })
        .catch(() => {
          this.loading = false;
        });
      } else {
        this.suggestions = [];
      }
    },


    ...mapActions('products', [
      'loadProducts',
    ]),
    ...mapActions('sales', [
      'generateSalesId',
      // 'addToCart',
      'setCart',
      'checkForThreshold',
    ]),
    closeForm() {
      this.$emit('close-form');
    },
    resetSaleForm() {
      this.saleForm = {
        selectedItem: {
          name: '',
        },
        product3: null,
        quantityInStock: null,
        quantity: null,
        subTotal: null
      };
    },
    addToCart() {
      // if (!this.$v.$invalid) {
        let { selectedItem: product, quantity } = this.saleForm
        product = {
          ...product,
          subTotal: multiplyCash(quantity, product.unitprice),
          quantityInStock: product.branch.quantity,
          quantity,
        }
        delete product.branches
        const products = [
          product,
          ...this.cart.products
        ]
        this.setCart({ ...this.cart, products })
        this.suggestions = this.filterSuggestions(this.suggestions)
        this.resetSaleForm()
        this.$snackbar.open('Added to cart')
      // }
    },
  },
  components: {
    EmptyState,
    CheckProduct,
  },
};
</script>

<<style lang="sass" scoped>
.level-center.columns
  width: 80%
  margin-bottom: 0px
  margin-top: 1px
  display: flex
  justify-content: center
.sale-item
  width: 50%
  overflow: auto
  text-overflow: ellipsis
</style>


<style lang="sass">
  .el-select, .el-input-number, .el-input__inner
    width: 100% !important
</style>
