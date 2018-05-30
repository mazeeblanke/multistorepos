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
        EmptyState(empty-text="Select an excel file! [CSV format only]" v-if="!csvHeaders.length")
        div.xcel-import-content(v-loading="parsingCSV || processing")        
          .columns(v-if="csvHeaders.length")
            .column.is-5
              nav.panel
                p.panel-heading.font-weight-bold CSV Headers
                draggable(v-model="csvHeaders")
                  transition-group
                    a.panel-block(v-for="(header, index) in csvHeaders", :key="index")
                      span.icon.mr-15
                        span.el-icon-rank
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
                        span.el-icon-rank
                      span {{ header }} 
        button.button.is-primary.mt-25.ml-64(@click="resetImport", v-if="csvHeaders.length")
          span.icon
            i.material-icons close
          span Clear                
    .level.toolbar
      .level-left
        .level-item
          .page-title.subtitle.is-5 {{ _product? 'Edit Product' : 'New Product' }}
      .level-right
        .level-item
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
        .level-item    
          button.button.is-primary(
            @click="fullScreenActive = true"
          ) 
            span.el-icon-download
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
import Papa from 'papaparse'
import draggable from 'vuedraggable'
import MaterialsForm from '@/components/products/MaterialsForm'

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
      // exptime: { required },
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
    // files(newVal) {
    //   console.log('jwejwe');
    //   console.log(newVal);
    //   if (Array.from(newVal).length) {
    //     this.parseCSV();
    //   }
    // },
  },

  computed: {

    ...mapState('users', ['currentUser']),

    ...mapState('settings', ['settings'])

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

    triggerUpload () {
      this.$refs.uploadInput.click()
    },

    addCSVFile (e) {
      const file = e.target.files[0]
      if (!file.name.match(/\.csv$/)) {
        this.$snackbar.open({
          type: 'is-warning',
          message: 'File must be a csv!!'
        })
        return
      }
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
        return {
          ...payload,
          store_id: this.settings.store.id
        }
      })
      this.processing = true
      this.createProduct({products: data})
        .then(res => {
          this.$snackbar.open(res.message)
          this.$emit('action-complete')
          this.processing = false
        })
        .catch((err) => {
          console.log(err.response.data)
          this.csvErrors = err.response.data
            .map((e, i) => {
              const _e = e.field.split('.')
              return `<article class="message is-danger">
                      <div class="message-body">
                        <strong>${i + 1}) </strong>
                        ${_e[2]} of ${_e[0]} at position/line ${+_e[1] + 1} must be a ${e.validation}
                      </div>
                    </article>`
            })
            .join(' ')
          this.warnUser(this.csvErrors)
          this.processing = false
          this.$snackbar.open({
            type: 'is-danger',
            message: err.message
          })
        })
    },

    parseCSV () {
      this.parsingCSV = true
      Papa.parse(this.files[0], {
        header: true,
        dynamicTyping: true,
        error: (err, file, inputElem, reason) => {
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

    closeForm () {
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
