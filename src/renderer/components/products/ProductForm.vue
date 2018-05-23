<template lang="pug">
  .ProductForm
    FullscreenDialog(@closed="closeDialog", :active.sync="fullScreenActive")
      div.xcel-import 
        .level.toolbar
          .level-left
            .level-item 
              h5.title.is-5 Add Products
          .level-right
            .level-item
              b-field
                input(type="file", @change="addCSVFile", ref="uploadInput", :style="{display: 'none'}")
                div.groupUpload(@click="triggerUpload")
                  button(class="button is-primary")
                    span.icon.mr-10.ml-2
                      i.material-icons cloud_upload
                    span Click to upload
                  div.filename(v-if="files && files.length")
                    span.file-name {{ files[0].name }}
            .level-item
              button.button.is-primary(@click="addItemsFromCSV", :disabled="processing",)
                span.icon
                  i.material-icons add
                span Add items 
        EmptyState(empty-text="Select an excel file!" v-if="!csvHeaders.length")
        div.xcel-import-content(v-loading="parsingCSV || processing")  
          a.button(@click="resetImport", v-if="csvHeaders.length")
            span.icon
              i.material-icons close
            span Clear         
          .columns(v-if="csvHeaders.length")
            .column.is-5
              nav.panel
                p.panel-heading.font-weight-bold CSV Headers
                draggable(v-model="csvHeaders")
                  transition-group
                    a.panel-block(v-for="(header, index) in csvHeaders", :key="index")
                      span.icon.mr-15
                        i.material-icons reorder
                      span {{ header }} 
            .column.is-1
              nav.panel
                a.panel-block(v-for="(header, index) in systemHeaders", :key="index")
                  span.icon
                    i.material-icons forward
            .column.is-5
              nav.panel
                p.panel-heading.font-weight-bold System Headers
                draggable(v-model="systemHeaders")
                  transition-group
                    a.panel-block(v-for="(header, index) in systemHeaders", :key="index")
                      span.icon.mr-15
                        i.material-icons reorder
                      span {{ header }}   
    .level.toolbar
      .level-left
        .level-item
          .page-title.subtitle.is-5 {{ _product? 'Edit Product' : 'New Product' }}
      .level-right
        .level-item
          button.button.is-primary(
            :class="{'is-loading': processing}",
            :disabled="processing",
            @click="submit()"
          )
            b-icon(icon="save")
            span {{ _product? 'Save product edits' : 'Add product' }}
        .level-item    
          button.button.is-primary(
            @click="fullScreenActive = true"
          ) Import Excel
        .level-item
          a.button(@click="closeForm()")
            span.icon
              i.material-icons close
            span Close       
    .columns.is-desktop.productFormMain
      .column.is-4
        .field.is-horizontal
          .field-label.has-text-right.is-v-centered
            label.label Name
          .field-body
            .field 
              el-input(
                size="small",
                v-model="product.name",
                placeholder="Enter product name",
                @input="() => $v.product.name.$touch()"
                :class="{ 'is-error': $v.product.name.$error }",
              )
        .field.is-horizontal
          .field-label.has-text-right.is-v-centered
            label.label Quantity
          .field-body
            .field 
              el-input-number(
                size="small",
                controls-position="right",
                v-model="product.quantity",
                placeholder="Enter product quantity",
                :min="1",
                @input="() => $v.product.quantity.$touch()"
                :class="{ 'is-error': $v.product.quantity.$error }",
              )
        .field.is-horizontal
          .field-label.has-text-right.is-v-centered
            label.label Unit Price
          .field-body
            .field 
              el-input-number(
                size="small",
                controls-position="right",
                v-model="product.unitprice",
                placeholder="Enter unit price",
                :min="1",
                @input="() => $v.product.unitprice.$touch()"
                :class="{ 'is-error': $v.product.unitprice.$error }",
              )
      .column.is-4
        .field.is-horizontal
          .field-label.has-text-right.is-v-centered
            label.label Cost Price
          .field-body
            .field 
              el-input-number(
                size="small",
                controls-position="right",
                v-model="product.costprice",
                placeholder="Enter cost price",
                :min="1",
                @input="() => $v.product.costprice.$touch()"
                :class="{ 'is-error': $v.product.costprice.$error }",
              )
        .field.is-horizontal
          .field-label.has-text-right.is-v-centered
            label.label Reorder
          .field-body
            .field 
              el-input-number(
                size="small",
                controls-position="right",
                v-model="product.reorder",
                placeholder="Enter reorder",
                :min="1",
                @input="() => $v.product.reorder.$touch()"
                :class="{ 'is-error': $v.product.reorder.$error }",
              )
      .column.is-4
        .field.is-horizontal
          .field-label.has-text-right.is-v-centered
            label.label Barcode
          .field-body
            .field 
              el-input(
                size="small",
                v-model="product.barcode",
                placeholder="Enter barcode",
                @input="() => $v.product.barcode.$touch()"
                :class="{ 'is-error': $v.product.barcode.$error }",
              ) 
        .field.is-horizontal
          .field-label.has-text-right.is-v-centered
            label.label Expiry Date
          .field-body
            .field 
              el-date-picker(
                size="small",
                v-model="product.exptime"
                type="date"
                placeholder="select expiry date"
                value-format="yyyy-MM-dd HH:mm:ss"
                @input="() => $v.product.exptime.$touch()"
                :class="{ 'is-error': $v.product.exptime.$error }",
              )                        
</template>

<script>

import { mapState, mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import { ObjectToFormData } from '@/utils/helper'
import EmptyState from '@/components/EmptyState'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import Papa from 'papaparse'
import draggable from 'vuedraggable'

export default {
  props: ['_product'],
  mixins: [validationMixin],
  data () {
    return {
      product: {
        quantity: 1,
        unitprice: 1,
        costprice: 1,
        reorder: 0,
        barcode: null,
        exptime: null,
        name: null
      },
      parsingCSV: false,
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
        'exptime',
        // 'id',
        'name',
        'quantity',
        // 'regtime',
        'reorder',
        // 'status',
        'unitprice'
      ]
    }
  },
  validations: {
    product: {
      quantity: { required },
      unitprice: { required },
      costprice: { required },
      reorder: { required },
      barcode: { required },
      exptime: { required },
      name: { required }
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
    // files(newVal) {
    //   console.log('jwejwe');
    //   console.log(newVal);
    //   if (Array.from(newVal).length) {
    //     this.parseCSV();
    //   }
    // },
  },
  computed: {
    ...mapState('users', ['currentUser'])
  },
  methods: {
    closeDialog () {
      this.fullScreenActive = false
    },
    triggerUpload () {
      this.$refs.uploadInput.click()
    },
    addCSVFile (e) {
      this.files = Array.from(e.target.files)
      if (this.files.length) {
        this.parseCSV()
      }
      this.$refs.uploadInput.value = []
    },
    resetImport () {
      this.files = []
      this.$refs.uploadInput.value = []
      this.csvHeaders = []
    },
    addItemsFromCSV () {
      const headerMappings = this.systemHeaders.reduce((agg, curr, index) => {
        agg[this.csvHeaders[index]] = curr
        return agg
      }, {})
      console.log(headerMappings)
      const data = this.csvData.data.map((product, i) => {
        let payload = {}
        Object.keys(product).forEach((key) => {
          if (headerMappings[key]) {
            payload[headerMappings[key]] = product[key]
          }
        })
        return payload
      })
      this.processing = true
      this.createProduct({
        productFormData: ObjectToFormData({
          arrayproducts: JSON.stringify(data),
          productsarrayupload: 'productsarrayupload'
        }),
        product: data
      }).then(res => {
        if (res.status === 'Success') {
          this.$snackbar.open(res.status + ' !' + res.message)
          this.$emit('action-complete')
          // if (!this._product) {
          //   this.resetproduct();
          // }
        } else {
          this.$snackbar.open(res.status)
        }
        this.processing = false
      })
        .catch(() => {
          this.processing = false
          this.$snackbar.open({
            type: 'is-danger',
            message: 'Server error !!'
          })
        })
    },
    parseCSV () {
      this.parsingCSV = true
      Papa.parse(this.files[0], {
        header: true,
        // dynamicTyping: true,
        error: (err, file, inputElem, reason) => {
          // executed if an error occurs while loading the file,
          // or if before callback aborted for some reason
          console.log(err)
          if (err) {
            this.parsingCSV = false
            this.$snackbar.open({
              type: 'is-danger',
              message: `${reason}`
            })
          }
        },
        complete: (results) => {
          this.csvHeaders = Object.keys(results.data[0])
          this.csvHeaders = this.csvHeaders.reduce((agg, curr, i) => {
            const indexOfSystemHeader = this.systemHeaders.indexOf(curr)
            if (agg[indexOfSystemHeader]) {
              agg.splice(indexOfSystemHeader, 0, curr)
            } else if (indexOfSystemHeader === -1 && agg.length <= this.csvHeaders.length) {
              agg.splice(agg.lastIndexOf(null), 0, curr)
            } else {
              agg.splice(indexOfSystemHeader, 1, curr)
            }
            if (agg.length > this.csvHeaders.length) { agg.splice(agg.indexOf(null), 1) }
            return agg
          }, Array(this.csvHeaders.length).fill(null))
          this.csvData = {
            ...results,
            data: results.data.slice(0, results.data.length - 1)
          }
          this.parsingCSV = false
        }
      })
    },
    ...mapActions('products', [
      'createProduct'
    ]),
    ...mapActions('products', ['updateProduct', 'clearSelectedproduct']),
    closeForm () {
      this.$emit('close-form')
    },
    resetproduct () {
      this.product = {
        quantity: 1,
        unitprice: 1,
        costprice: 1,
        reorder: 0,
        barcode: null,
        exptime: null,
        name: null
      }
    },
    submit () {
      this.$v.product.$touch()
      if (!this.$v.$invalid) {
        this.processing = true
        const doAction = this._product
          ? this.updateProduct
          : this.createProduct
        this.product = {
          ...this.product,
          ...{
            [this._product ? 'updateproduct' : 'addproduct']: 'value',
            updateid: this._product ? this._product.id : null,
            updatename: this._product ? this._product.name : null,
            updatequantity: this._product ? this._product.quantity : null,
            updateunitprice: this._product ? this._product.unitprice : null,
            updatecostprice: this._product ? this._product.costprice : null,
            updatereorder: this._product ? this._product.reorder : null,
            updatebarcode: this._product ? this._product.barcode : null,
            updateexptime: this._product ? this._product.exptime : null
          }
        }
        doAction({
          productFormData: ObjectToFormData(this.product),
          product: this.product
        }).then(res => {
          if (res.status === 'Success') {
            this.$snackbar.open(res.status + ' !' + res.message)
            this.$emit('action-complete')
            if (!this._product) {
              this.resetproduct()
              this.$v.product.$reset()
            }
          } else {
            this.$snackbar.open(res.status)
          }
          this.processing = false
        })
      }
    }
  },
  components: {
    EmptyState,
    FullscreenDialog,
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
    height: 450px
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
