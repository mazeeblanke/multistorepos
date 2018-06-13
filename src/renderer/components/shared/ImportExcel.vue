<template lang="pug">
  .xcel-import 
    .level.toolbar
      .level-left
        .level-item 
          h5.title.is-5 Add {{ formatedModel }}
      .level-right
        .level-item
          b-field
            input(
              type="file", 
              @change="addCSVFile", 
              ref="uploadInput", 
              :style="{display: 'none'}"
            )
            div.groupUpload(@click="triggerUpload")
              button(class="button is-primary")
                span.icon.mr-10.ml-2
                  i.material-icons cloud_upload
                span Click to upload
              div.filename(v-if="files && files.length")
                span.file-name {{ files[0].name }}
        .level-item
          button.button.is-primary(
            @click="addItemsFromCSV", 
            :disabled="processing"
          )
            span.icon
              i.material-icons add
            span Add items 
    EmptyState(
      empty-text="Select an excel file! [CSV format only]", 
      v-if="!csvHeaders.length",
      :style="{height: '420px'}"
    )
    div.xcel-import-content(v-loading="parsingCSV || processing")        
      .columns(v-if="csvHeaders.length")
        .column.is-5
          nav.panel
            p.panel-heading.font-weight-bold CSV Headers
            draggable(v-model="csvHeaders")
              transition-group
                a.panel-block(
                  v-for="(header, index) in csvHeaders", 
                  :key="index"
                )
                  span.icon.mr-15
                    span.el-icon-rank
                  span {{ header }} 
        .column.is-1
          nav.panel
            a.panel-block(
              v-for="(header, index) in systemHeaders", 
              :key="index"
            )
              span.icon
                span.material-icons swap_horiz
        .column.is-5
          nav.panel
            p.panel-heading.font-weight-bold System Headers
            draggable(v-model="systemHeaders")
              transition-group
                a.panel-block(
                  v-for="(header, index) in systemHeaders", 
                  :key="index"
                )
                  span.icon.mr-15
                    span.el-icon-rank
                  span {{ header }} 
    button.button.is-primary.mt-25.ml-64(
      @click="resetImport",
      v-if="csvHeaders.length"
    )
      span.icon
        i.material-icons close
      span Clear   
</template>

<script>
  import EmptyState from '@/components/EmptyState'
  import Papa from 'papaparse'
  import draggable from 'vuedraggable'
  import { ucFirst } from '@/utils/helper'

  const pluralize = require('pluralize')

  export default {

    props: {

      createItems: {
        required: true,
        type: Function
      },

      systemHeaders: {
        required: true,
        type: Array
      },

      closeForm: {
        required: true,
        type: Function
      },

      model: {
        type: String,
        required: true
      },

      additionalPayload: {
        type: Object
      }

    },

    data () {
      return {
        csvErrors: [],
        parsingCSV: false,
        processing: false,
        csvHeaders: [],
        csvData: [],
        files: []
      }
    },

    computed: {

      formatedModel () {
        return ucFirst(pluralize(this.model))
      }

    },

    components: {
      EmptyState,
      draggable
    },

    methods: {

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

        const data = this.csvData.data.map((item, i) => {
          let payload = {}
          Object.keys(item).forEach((key) => {
            if (headerMappings[key]) {
              payload[headerMappings[key]] = item[key]
            }
          })
          return {
            ...this.additionalPayload,
            ...payload
          }
        })

        this.processing = true

        this.persist(data)
      },

      persist (data) {
        this.createItems({ [pluralize(this.model)]: data })
          .then(res => {
            this.$snackbar.open(res.message)
            this.closeForm()
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
                      ${_e[2]} of ${_e[0]} at position/line ${+_e[1] + 2} must be a ${e.validation}
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
            this.csvHeaders = Object.keys(results.data[0]).filter(h => h)
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
      }

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
</style>