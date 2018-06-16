<template lang="pug">
  div
    h4.title.is-4.mt-30.mb-50 Printer Settings
    .columns
      .column.is-6
        .field.is-horizontal
          .field-label.has-text-left.is-v-centered
            label.label.has-text-weight-normal Select Default Printer
          .field-body
            .field
              el-select.has-full-width(
                v-model="printerSelected", 
                placeholder="Select default printer",
                size="small",
                value-key="name",
                @clear="clearPrinterSelected"
                clearable
              )
                el-option(
                  v-for="printer in installedPrinters"
                  :key="printer.name"
                  :label="printer.name"
                  :value="printer"
                )
    .columns.mt-10
      .column.is-6
        EmptyState.h400(empty-text="No printer selected !!", v-if="!printerSelected")
        div.h400.is-v-centered(v-if="printerSelected")
          span.material-icons(style="font-size: 250px") local_printshop
          h4.title.is-5.mt-10.has-text-weight-normal {{ printerSelected.name }}
    button.button.is-primary(
      @click="updateSelectedPrinter",
      :disabled="!shouldSaveChanges"
    )
      span Save changes              
</template>

<script>
/* eslint-disable */
import { mapMutations, mapState } from 'vuex'
import EmptyState from '@/components/EmptyState'
import _ from 'lodash'

export default{

  data () {
    return {
      installedPrinters: [],
      printerSelected: null
    }
  },

  methods: {
    ...mapMutations('app', [
      'SET_SELECTED_PRINTER',
      'CLEAR_SELECTED_PRINTER'
    ]),

    updateSelectedPrinter () {
      this.SET_SELECTED_PRINTER(this.printerSelected)
      this.$snackbar.open('Saved Changes')
    },

    clearPrinterSelected () {
      this.printerSelected = null
    },

    warnUser (msg) {
      return this.$swal({
        title: 'Are you sure?',
        text: msg,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      })
    },

  },

  mounted () {
    this.$electron.ipcRenderer.send('fetchPrinters')
    this.printerSelected = this.selectedPrinter && Object.assign({}, this.selectedPrinter)
    this.$electron.ipcRenderer.on('installedPrinters', (event, arg) => {
      if (this.printerSelected) {
        arg = [ this.printerSelected, ...arg ]
      }
      this.installedPrinters = _.uniqBy(arg, 'name')
    })
  },

  components: {
    EmptyState
  },

  computed: {
    ...mapState('app', ['selectedPrinter']),

    shouldSaveChanges () {
      return !_.isEqual(this.selectedPrinter, this.printerSelected)
    }

  },

  beforeRouteLeave(to, from, next) {
    if (this.shouldSaveChanges) {
      this.warnUser('You have unsaved changes!')
      .then((res) => {
        if (res.value) {
          next()
        } else {
          next(false)
        }
      })
    } else {
      next()
    }
  }

}
</script>

<style lang="scss">
  
</style>