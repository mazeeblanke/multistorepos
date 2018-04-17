<template lang="pug">
  div.selectCustomer
    FullscreenDialog( v-close="closeDialog" @closed="closeDialog" :active.sync="fullScreenActive")
      CustomerForm.page-forms(
        ref="new-customer-form",
        @close-form="closeNewCustomerForm",
        @action-complete="closeNewCustomerForm",
      )
    button.button.is-primary(
      @click.stop="showPopover",
      :disabled="processing",
    )
      span.icon
        i.material-icons add
      span Select customer
    popover.selectCustomerPopover(
      ref="selectCustomerPopover",
      name="selectCustomerPopover"
    )
     .columns.is-multiline
      .column.is-12.mt-30
        .field.is-horizontal
          .field-label.has-text-right.is-v-centered
            label.label Select customer:
          .field-body
            .field 
              el-select(
                v-model="transaction.customer"
                :filterable="true"
                :clearable="true"
                :remote="true"
                placeholder="Enter customer name"
                @change="updateTransaction"
                :remote-method="getCustomerSuggestions"
                :loading="loading"
              )
                el-option(
                  v-for="(item, index) in suggestions"
                  :key="index"
                  :label="fullname(item)"
                  :value="item.id"
                )         
</template>

<script>

import { mapActions } from 'vuex'
import CustomerForm from '@/components/customers/CustomerForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import { ObjectToFormData } from '@/utils/helper'
import _ from 'lodash'

export default {
  props: ['transaction', 'processing'],
  data () {
    return {
      loading: false,
      suggestions: [],
      fullScreenActive: false
    }
  },
  components: {
    CustomerForm,
    FullscreenDialog
  },
  computed: {
    selectCustomerVisible () {
      // return this.$refs.selectCustomerPopover.visible;
      return true
    }
  },
  watch: {
    transaction (newValue) {
      if (newValue.customer) {
        // this.suggestions = Array(newValue.customerDetails);
        this.suggestions.push(newValue.customerDetails)
      }
    }
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
    ...mapActions('customers', ['loadCustomers', 'getLoyaltyDiscount']),
    closeNewCustomerForm () {
      this.fullScreenActive = false
    },
    fullname (c) {
      return `${c.firstname} ${c.surname}`
    },
    closeDialog () {
      this.fullScreenActive = false
    },
    showPopover () {
      const popover = this.$refs.selectCustomerPopover
      popover.visible = !popover.visible
      // this.suggestions = [];
    },
    updateTransaction () {
      if (this.transaction.customer) {
        this.getLoyaltyDiscount(ObjectToFormData({
          getloyaltydiscount: 'getloyaltydiscount',
          customerid: this.transaction.customer
        })).then((res) => {
          this.updateCustomerDetails(res)
        })
      } else {
        this.updateCustomerDetails({message: null})
      }
    },
    updateCustomerDetails (res) {
      const customerDetails = this.suggestions.find(
        s => s.id === this.transaction.customer
      )
      this.$emit(
        'update:transaction',
        {
          ...this.transaction,
          ...{ customerDetails, loyalty: res.message }
        }
      )
    },
    getCustomerSuggestions (query) {
      if (query !== '') {
        this.loading = true
        let payload = {
          search: query,
          type: 'customer'
        }
        this.loadCustomers(payload)
          .then(suggestions => {
            this.loading = false
            this.suggestions = _.flatMap(suggestions)
          })
          .catch(() => {
            this.loading = false
          })
      } else {
        this.suggestions = []
      }
    }
  }
}
</script>

<style lang="sass">
.selectCustomerPopover
  width: 400px !important
  right: 10px !important
  left: auto !important
  top: 160px !important
  height: 200px !important
.selectCustomer
  .el-select
    width: 90% !important  
</style>
