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
          .page-title.subtitle.is-5 {{ _product? 'Edit Product' : 'New Product' }}
      .level-right
        .level-item(v-if="!_product")
          el-switch(
            style="display: block"
            v-model="product.advanced"
            active-color="#000000"
            inactive-color="#e4e7ed"
            active-text="Advanced"
          )
        .level-item
          button.button.is-primary(
            :class="{'is-loading': processing}",
            :disabled="processing",
            @click="submit()"
          )
            span.el-icon-circle-plus-outline.mr-5
            span {{ _product? 'Save product edits' : 'Add Product' }}
        .level-item(v-if="!_product")    
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
            label.label Quantity
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
            label.label Reorder
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
    MaterialsForm(v-show="product.advanced", :addBranch="addBranch" :product.sync="product")                             
</template>

<script>

import { mapState, mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, minValue } from 'vuelidate/lib/validators'
import EmptyState from '@/components/EmptyState'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import draggable from 'vuedraggable'
import MaterialsForm from '@/components/products/MaterialsForm'
import ImportExcel from '@/components/shared/ImportExcel'

export default {

  props: ['_product'],

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
        branches: [{}, {}],
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
    if (this._product) {
      this.product = this._product
    }
  },

  watch: {
    _product () {
      this.product = this._product
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
      let branches = this.product.branches
        .filter(b => b.id)
        .map(b => ({
          quantity: b.quantity,
          branch_id: b.id
        }))
      return {
        ...this.product,
        branches,
        store_id: this.settings.store.id,
        branch_id: this.settings.branch.id
      }
    },

    submit () {
      this.$v.product.$touch()
      if (!this.$v.$invalid) {
        this.processing = true
        const doAction = this._product
          ? this.updateProduct
          : this.createProduct
        const payload = this.processPayload()
        doAction(payload)
          .then(res => {
            this.$snackbar.open(res.message)
            this.$emit('action-complete', res.data)
            if (!this._product) {
              this.resetproduct()
              this.$v.product.$reset()
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
  .xcel-import
    .groupUpload
      display: flex
      button 
        border-top-right-radius: 0px
        border-bottom-right-radius: 0px
      .filename
        border-top-left-radius: 0px
        border-bottom-left-radius: 0px
    background-color: white
    height: 525px
    width: 900px
    padding: 2px
    border-radius: 2px
    .xcel-import-content
      position: relative
      .button 
        position: absolute
        margin-top: 10px
        right: 82px
    .panel-heading
      background-color: white !important
    .columns 
      overflow-y: scroll
      margin: 0px 0px
      padding: 40px 20px
      display: flex
      justify-content: center
      height: 380px
    .is-1 
      .panel-block
        display: flex
        justify-content: center
        border: none
        &:first-of-type
          margin-top: 41px
      i.material-icons 
        color: #9E9E9E !important

  .ProductFormHeader
    padding: 2rem
    padding-bottom: 0

  .productFormMain
    padding: 2rem

  .ProductForm
    .el-select, .el-input-number, .el-input__inner, .el-input
      width: 100% !important  
</style>
