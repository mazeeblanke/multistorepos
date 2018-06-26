<template lang="pug">
  .ProductSupplyForm
    .level.toolbar
      .level-left
        .level-item
          .page-title.subtitle.is-5 New product supply
      .level-right
        .level-item
          button.button.is-primary
            b-icon(icon="save")
            span  Add Supplier
        .level-item
          button.button.is-primary(
            :class="{'is-loading': processing}",
            :disabled="processing || $v.$invalid",
            @click="submit()"
          )
            b-icon(icon="save")
            span  Add Supply
        .level-item
          a.button(@click="closeForm()")
            span.icon
              i.material-icons close
            span Close
    .columns.is-desktop.productFormMain
      .column.is-6
        .field.is-horizontal
          .field-label.has-text-right.is-v-centered
            label.label Name
          .field-body
            .field
              el-select(
                v-model="product.product5"
                :filterable="true"
                :remote="true"
                placeholder="Enter product name"
                :remote-method="getProductSuggestions"
                :loading="loading"
              )
                el-option(
                  v-for="(item, index) in suggestions"
                  :key="index"
                  :label="item.name"
                  :value="item.id"
                  :disabled="item === product.product5"
                )
        .field.is-horizontal
          .field-label.has-text-right.is-v-centered
            label.label Title
          .field-body
            .field
              el-input(
                v-model="product.title",
                placeholder="Enter title",
              )
        .field.is-horizontal
          .field-label.has-text-right.is-v-centered
            label.label Supplier
          .field-body
            .field
              //- el-input(
              //-   v-model="product.supplier",
              //-   placeholder="Enter supplier",
              //- )
              el-select(
                  v-model="product.supplier.name"
                  :filterable="true"
                  :clearable="true"
                  :remote="true"
                  placeholder="Enter supplier name"
                  @change="selectSupplier"
                  :remote-method="getSupplierSuggestions"
                  :loading="loading"
                )
                  div.selectAdd
                    a
                      span.icon
                        i.material-icons add
                      span Add new supplier
                  el-option(
                    v-for="(item, index) in supplierSuggestions"
                    :key="index"
                    :label="item.name"
                    :value="item"
                  )
      .column.is-6
        .field.is-horizontal
          .field-label.has-text-right.is-v-centered
            label.label Quantity
          .field-body
            .field
              el-input-number(
                v-model="product.quantity",
                placeholder="Enter quantity",
                :min="1",
              )
        .field.is-horizontal
          .field-label.has-text-right.is-v-centered
            label.label Amount
          .field-body
            .field
              el-input-number(
                v-model="product.amount",
                placeholder="Enter amount",
              )
        .field.is-horizontal
          .field-label.has-text-right.is-v-centered
            label.label Note
          .field-body
            .field
              el-input(
                v-model="product.note",
                placeholder="Enter note",
              )
</template>

<script>
/* eslint-disable */
import { mapState, mapActions } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import EmptyState from '@/components/EmptyState';
import _ from 'lodash';

// const ucFirst = s => s.charAt(0).toUpperCase() + s.slice(1);

export default {
  mixins: [validationMixin],
  data() {
    return {
      product: {
        quantity: 1,
        amount: 1,
        note: null,
        product5: null,
        title: null,
        supplier: {},
        supplierid3: null,
        addproductsupply: 'addproductsupply',
      },
      suggestions: [],
      supplierSuggestions: [],
      loading: false,
      availableMaterials: [],
      processing: false,
    };
  },
  validations: {
    product: {
      quantity: { required },
      amount: { required },
      product5: { required },
      title: { required },
      supplier: { required },
    },
  },
  mounted() {
    if (this._product) {
      this.product = this._product;
    }
  },
  computed: {
    ...mapState('users', ['currentUser']),
  },
  methods: {
    addNewItem() {},
    handleChange() {},
    getProductSuggestions(query) {
      if (query !== '') {
        this.loading = true;
        let payload = {
          search: query,
          type: 'product',
        };
        this.loadProducts(payload)
          .then(suggestions => {
            this.loading = false;
            this.suggestions = _.flatMap(suggestions);
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        this.suggestions = [];
      }
    },
    ...mapActions('products', ['createProduct']),
    ...mapActions('products', [
      'updateProduct',
      'addProductSupply',
      'clearSelectedproduct',
      'loadProducts',
    ]),
    ...mapActions('suppliers', [
      'searchSupplier',
    ]),
    closeForm() {
      this.$emit('close-form');
    },
    resetproduct() {
      this.product = {
        quantity: 1,
        amount: 1,
        note: null,
        product5: null,
        title: null,
        supplier: {},
        supplierid3: null,
        addproductsupply: 'addproductsupply',
      };
    },
    selectSupplier(item) {
      // this.customer = this.productSuggestions.find(
      //   s => s.id === this.customerId,
      // );
      this.product = {
        ...this.product,
        supplierid3: item.id,
        supplier: item,
      }
    },
    getSupplierSuggestions(query) {
      if (query !== '') {
        this.loading = true;
        let payload = {
          search: query,
          type: 'supplier',
        };
        this.searchSupplier(payload)
          .then(supplierSuggestions => {
            this.loading = false;
            this.supplierSuggestions = _.flatMap(supplierSuggestions);
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        this.supplierSuggestions = [];
      }
    },
    submit() {
      if (!this.$v.$invalid) {
        this.processing = true;
        this.addProductSupply(this.product).then(res => {
          if (res.status === 'Success') {
            this.$snackbar.open(res.status + ' !' + res.message);
            this.$emit('action-complete', { ...this.product });
            this.resetproduct();
          } else {
            this.$snackbar.open(res.status);
          }
          this.processing = false;
        });
      }
    },
  },
  components: {
    EmptyState,
  },
};
</script>

<style lang="sass">
  .ProductSupplyFormHeader
    padding: 2rem
    padding-bottom: 0

  .productFormMain
    padding: 2rem

  .MaterialsForm
    border-top: 1px solid #EAEAEA

  .multiselect
    font-size: 1rem
    min-height: 2.25em

  .multiselect__tags
    display: flex
    align-items: center
    min-height: 2.25em
    padding-left: calc(0.375em - 1px)
    padding-right: calc(0.375em - 1px)
    padding-top: calc(0.375em - 1px)
    border-color: #dbdbdb

  .multiselect__input
    font-size: 1rem
    width: auto
    margin-bottom: calc(0.375em - 1px)

  .multiselect__tags
    border-bottom-left-radius: 3px !important
    border-bottom-right-radius: 3px !important

  .custom__tag
    display: inline-block
    padding: 0px 7px
    background: #EFEFEF
    margin-right: 5px
    border-radius: 3px
    cursor: pointer
    margin-bottom: calc(0.375em - 1px)

  .custom__remove
    padding: 0
    font-size: 10px
    margin-left: 8px

  .vendors-select
    width: 400px

  .ProductSupplyForm
    // .el-input-number
    //   width: 300px !important

    .el-date-editor, .el-input-number
      width: 100% !important
    .is-v-centered
      align-items: flex-start

    .el-select, .el-input-number, .el-input__inner
      width: 100% !important
</style>
