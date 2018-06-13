<template lang="pug">
  .ProductForm
    FullscreenDialog(@closed="closeDialog", :active.sync="fullScreenActive")
      ImportExcel(
        :create-items="createProduct",
        :system-headers="systemHeaders",
        :close-form="closeForm",
        :additional-payload="additionalImportPayload"
        model="product"
      )     
    .level.toolbar
      .level-left
        .level-item
          .page-title.subtitle.is-5 {{ initProduct? 'Edit Product' : 'New Product' }}
      .level-right
        .level-item(v-if="!initProduct")
          el-switch(
            style="display: block"
            v-model="product.advanced"
            active-color="#000000"
            inactive-color="#e4e7ed"
            active-text="Advanced"
            :disabled="this.initProduct"
          )
        .level-item
          button.button.is-primary(
            :class="{'is-loading': processing}",
            :disabled="processing",
            @click="submit()"
          )
            span.el-icon-circle-plus-outline.mr-5
            span {{ initProduct? 'Save product edits' : 'Add Product' }}
        .level-item(v-if="!initProduct")    
          button.button.is-primary(
            @click="fullScreenActive = true"
          ) 
            span.el-icon-download.mr-5
            span Import Excel
        .level-item
          a.button.no-border(@click="closeForm()")
            span.icon
              i.material-icons close      
    .columns.is-desktop.productFormMain
      .column.is-4
        .field.is-horizontal
          .field-label.has-text-left.is-v-centered
            label.label Name
          .field-body
            .field 
              el-input(
                clearable,
                size="small",
                v-model="product.name",
                placeholder="Enter product name",
                @input="() => $v.product.name.$touch()"
                :class="{ 'is-error': $v.product.name.$error }",
              )
        .field.is-horizontal
          .field-label.has-text-left.is-v-centered
            label.label Qty (In Store)
          .field-body
            .field 
              el-input-number(
                clearable,
                size="small",
                controls-position="right",
                v-model="product.quantity",
                placeholder="Enter product quantity",
                :min="0",
                @input="() => $v.product.quantity.$touch()"
                :class="{ 'is-error': $v.product.quantity.$error }",
              )
        .field.is-horizontal
          .field-label.has-text-left.is-v-centered
            label.label Unit Price
          .field-body
            .field 
              el-input-number(
                clearable,
                size="small",
                controls-position="right",
                v-model="product.unitprice",
                placeholder="Enter unit price",
                :min="0",
                @input="() => $v.product.unitprice.$touch()"
                :class="{ 'is-error': $v.product.unitprice.$error }",
              )
      .column.is-4
        .field.is-horizontal
          .field-label.has-text-left.is-v-centered
            label.label Status
          .field-body
            .field 
              el-select(
                clearable,
                size="small",      
                v-model="product.status",
                placeholder="Select product status",
                @input="() => $v.product.status.$touch()",
                :class="{ 'is-error': $v.product.status.$error }",
              )
                el-option(label="Active", value="active")
                el-option(label="InActive", value="inactive")
        .field.is-horizontal
          .field-label.has-text-left.is-v-centered
            label.label Cost Price
          .field-body
            .field 
              el-input-number(
                clearable,
                size="small",
                controls-position="right",
                v-model="product.costprice",
                placeholder="Enter cost price",
                :min="0",
                @input="() => $v.product.costprice.$touch()"
                :class="{ 'is-error': $v.product.costprice.$error }",
              )
        .field.is-horizontal
          .field-label.has-text-left.is-v-centered
            label.label Reorder (Store)
          .field-body
            .field 
              el-input-number(
                clearable,
                size="small",
                controls-position="right",
                v-model="product.reorder",
                placeholder="Enter reorder",
                :min="0",
                @input="() => $v.product.reorder.$touch()"
                :class="{ 'is-error': $v.product.reorder.$error }",
              )
      .column.is-4
        .field.is-horizontal
          .field-label.has-text-left.is-v-centered
            label.label Barcode
          .field-body
            .field 
              el-input(
                clearable,
                size="small",
                v-model="product.barcode",
                placeholder="Enter barcode",
                @input="() => $v.product.barcode.$touch()"
                :class="{ 'is-error': $v.product.barcode.$error }",
              )                      
        .field.is-horizontal
          .field-label.has-text-left.is-v-centered
            label.label Store
          .field-body
            .field 
              el-input(
                clearable,
                size="small",
                :value="settings.store.name",
                disabled
              )
    MaterialsForm(
      v-if="product.advanced", 
      :addBranch="addBranch", 
      :product.sync="product",
      :edit-mode="!!initProduct"
    )                             
</template>

<script>
/* eslint-disable */
import { mapState, mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, minValue } from 'vuelidate/lib/validators'
import EmptyState from '@/components/EmptyState'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import draggable from 'vuedraggable'
import MaterialsForm from '@/components/products/MaterialsForm'
import ImportExcel from '@/components/shared/ImportExcel'

export default {

  props: ['initProduct'],

  mixins: [validationMixin],

  data () {
    return {
      product: {
        quantity: null,
        unitprice: null,
        costprice: null,
        reorder: null,
        barcode: null,
        exptime: null,
        name: null,
        advanced: 1,
        branches: [{}],
        status: null
      },
      parsingCSV: false,
      csvErrors: [],
      files: [],
      suggestions: [],
      loading: false,
      availableMaterials: [],
      processing: false,
      fullScreenActive: false,
      csvHeaders: [],
      csvData: [],
      systemHeaders: [
        'barcode',
        'costprice',
        'name',
        'quantity',
        'reorder',
        'status',
        'unitprice'
      ]
    }
  },

  validations: {
    product: {
      quantity: {
        required,
        minValue: minValue(0)
      },
      unitprice: {
        required,
        minValue: minValue(0)
      },
      costprice: {
        required,
        minValue: minValue(0)
      },
      reorder: {
        required,
        minValue: minValue(0)
      },
      barcode: { required },
      name: { required },
      status: { required }
    }
  },

  mounted () {
    if (this.initProduct) {
      this._updateProduct()
    }
  },

  watch: {
    initProduct () {
      this.product = this.initProduct
    }
  },

  computed: {

    ...mapState('settings', ['settings']),

    additionalImportPayload () {
      return {
        store_id: this.settings.store.id
      }
    }

  },

  methods: {

    ...mapActions('products', ['createProduct']),

    ...mapActions('products', ['updateProduct']),

    addBranch () {
      this.product.branches.push({})
    },

    closeDialog () {
      this.fullScreenActive = false
    },

    _updateProduct () {
      let initProductBranch = this.initProduct.productBranch || {}
      let branch = initProductBranch.branch || this.settings.branch
      this.product = {
        ...this.initProduct,
        advanced: 1,
        branches: [
          {
            ...initProductBranch,
            ...branch,
            product_branch_id: initProductBranch.id
          }
        ]
      }
    },

    warnUser (msg) {
      return this.$swal({
        title: 'Fix Errors',
        html: `${this.csvErrors}`,
        type: 'error',
        showCloseButton: true
      })
    },

    closeForm () {
      this.closeDialog()
      this.$emit('close-form')
    },

    resetproduct () {
      this.product = {
        quantity: null,
        unitprice: null,
        costprice: null,
        reorder: null,
        barcode: null,
        exptime: null,
        name: null,
        branches: [{}, {}],
        status: null
      }
    },

    processPayload () {
      let productBranches
      const {
        id,
        name,
        quantity,
        unitprice,
        costprice,
        barcode,
        store_id,
        reorder,
        branches,
        status
      } = this.product
      if (branches) {
        productBranches = this.product.branches
          .filter(b => b.id)
          .map(b => ({
            id: b.product_branch_id,
            product_id: id,
            quantity: b.quantity || 0,
            branch_id: b.branch_id || this.settings.branch.id,
            store_id: b.store_id,
            reorder: b.reorder
          }))
      }
      return {
        id,
        name,
        quantity,
        unitprice,
        costprice,
        barcode,
        store_id,
        reorder,
        status,
        branches: !this.initProduct 
          ? productBranches 
          : null,
        productBranches: this.initProduct
          ? productBranches[0]
          : null,
        store_id: this.settings.store.id,
        branch_id: this.settings.branch.id
      }
    },

    submit () {
      this.$v.product.$touch()
      if (!this.$v.$invalid) {
        this.processing = true
        const doAction = this.initProduct
          ? this.updateProduct
          : this.createProduct
        const payload = this.processPayload() 
        doAction(payload)
          .then(res => {
            this.$snackbar.open(res.message)
            this.$emit('action-complete', res.data)
            if (!this.initProduct) {
              this.resetproduct()
              this.$v.product.$reset()
            } else {
              console.log('jejwej j ewj eke')
              this._updateProduct()
            }
            this.processing = false
          })
          .catch((err) => {
            console.log(err.response.data)
            this.processing = false
            this.$snackbar.open({
              type: 'is-danger',
              message: err.message
            })
          })
      }
    }
  },

  components: {

    EmptyState,

    FullscreenDialog,

    MaterialsForm,

    ImportExcel,

    draggable
  }

}
</script>

<style lang="sass">
  .ProductFormHeader
    padding: 2rem
    padding-bottom: 0

  .productFormMain
    padding: 2rem

  .ProductForm
    .el-select, .el-input-number, .el-input__inner, .el-input
      width: 100% !important  
</style>
