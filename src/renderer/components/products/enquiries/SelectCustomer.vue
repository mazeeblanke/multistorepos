<template lang="pug">
  div.selectCustomer
    FullscreenDialog( v-close="closeDialog" @closed="closeDialog" :active.sync="fullScreenActive")
      CustomerForm.page-forms(
        ref="new-customer-form",
        @close-form="closeNewCustomerForm",
        @action-complete="closeNewCustomerForm",
        :allow-excel-import="false"
      )
    button.button.is-primary(
      @click.stop="showPopover"
    )
      span.icon
        i.material-icons add
      span Select customer
    popover.selectCustomerPopover(
      ref="selectCustomerPopover",
      name="selectCustomerPopover",
      :style="{top: top, right: right}"
    )
      .columns.is-multiline
        .column.is-11.mt-25
          .field.is-horizontal
            .field-body
              .field 
                el-select.has-width-100(
                  v-model="customer"
                  :filterable="true"
                  :clearable="true"
                  :remote="true"
                  placeholder="Enter customer name"
                  @change="notify"
                  :remote-method="getCustomerSuggestions"
                  :loading="loading"
                  value-key="full_name"
                )
                  el-option(
                    v-for="(item, index) in suggestions"
                    :key="index"
                    :label="item.full_name"
                    :value="item"
                  )
        .column.is-1.mt-25.is-h-centered
          span.no-border(@click.stop="fullScreenActive = true")
            span.material-icons add 
      .columns.is-multiline(v-if="customer.id")
        .column.is-12
          .field.is-horizontal
            .field-label.has-text-left.is-v-centered
              label.label Loyalty Status:
            .field-body
              .field 
                el-input(
                  disabled,
                  size="small",
                  :value="customer.loyalty_status ? 'Active' : 'In-Active'"
                )
        .column.is-12
          .field.is-horizontal
            .field-label.has-text-left.is-v-centered
              label.label Loyalty Points:
            .field-body
              .field 
                el-input-number(
                  v-model.number="customer.loyalty_points",
                  placeholder="Enter Quantity",
                  size="small",
                  min=0,
                  controls-position="right",
                  disabled
                ) 
</template>

<script>

import CustomerForm from '@/components/customers/CustomerForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import { mapActions, mapState } from 'vuex'
import _ from 'lodash'

export default {

  props: {
    top: {
      default: '170px'
    },
    right: {
      default: '20px'
    }
  },

  data () {
    return {
      customer: {},
      loading: false,
      suggestions: [],
      fullScreenActive: false
    }
  },

  components: {
    CustomerForm,
    FullscreenDialog
  },

  mounted () {
    document.addEventListener('click', (e) => {
      if (e.target) {
        const popover = this.$refs.selectCustomerPopover
        if (popover) {
          popover.visible = false
        }
      }
    })
  },

  methods: {

    ...mapActions('customers', ['loadCustomers']),

    closeNewCustomerForm (e) {
      this.closeDialog()
      this.customer = e
      this.notify(e)
      if (!e) return
      this.suggestions = _.uniqBy([
        ...this.suggestions,
        ...[e]
      ], 'id')
    },

    notify (customer) {
      if (!customer) customer = null
      this.$emit('selected:customer', customer)
    },

    closeDialog () {
      this.fullScreenActive = false
      this.$refs.selectCustomerPopover.visible = true
    },

    showPopover () {
      const popover = this.$refs.selectCustomerPopover
      popover.visible = !popover.visible
    },

    getCustomerSuggestions (query) {
      if (query !== '') {
        this.loading = true
        let payload = {
          full_name: query,
          branch_id: this.settings.branch.id,
          store_id: this.settings.store.id,
          persist: false
        }
        this.loadCustomers(payload)
          .then(({ data }) => {
            console.log(data)
            this.loading = false
            this.suggestions = data
          })
          .catch(() => {
            this.loading = false
          })
      } else {
        this.suggestions = []
      }
    }

  },

  computed: {
    ...mapState('settings', ['settings'])
  }
}
</script>

<style lang="sass">
  .selectCustomerPopover
    padding-left: 15px
    padding-right: 15px 
    width: 400px !important
    // right: 20px !important
    left: auto !important
    // top: 170px !important
    height: 190px !important
  .material-icons
    cursor: pointer !important  
</style>
