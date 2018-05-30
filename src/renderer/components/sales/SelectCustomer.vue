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
      .column.is-12.mt-25
        .field.is-horizontal
          .field-body
            .field 
              el-select.has-width-100(
                :filterable="true"
                :clearable="true"
                :remote="true"
                placeholder="Enter customer name"
                @change="applyCustomerToCart"
                :remote-method="getCustomerSuggestions"
                :loading="loading"
              )
                el-option(
                  v-for="(item, index) in suggestions"
                  :key="index"
                  :label="item.full_name"
                  :value="item"
                )         
</template>

<script>

import CustomerForm from '@/components/customers/CustomerForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import { mapState, mapActions } from 'vuex'

export default {

  props: ['processing'],

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

    ...mapState('sales', ['cart']),

    selectCustomerVisible () {
      // return this.$refs.selectCustomerPopover.visible;
      return true
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

    ...mapActions('customers', ['loadCustomers']),

    ...mapActions('sales', [
      'removeFromCart',
      'completeTransaction',
      'setCart'
    ]),

    closeNewCustomerForm () {
      this.fullScreenActive = false
    },

    closeDialog () {
      this.fullScreenActive = false
    },

    showPopover () {
      const popover = this.$refs.selectCustomerPopover
      popover.visible = !popover.visible
      // this.suggestions = [];
    },

    applyCustomerToCart (customer) {
      this.setCart({
        ...this.cart,
        customer: customer,
        customer_id: customer.id
      })
      this.$snackbar.open('Successfully added customer to cart')
    },

    getCustomerSuggestions (query) {
      if (query !== '') {
        this.loading = true
        let payload = {
          full_name: query,
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

  }
}
</script>

<style lang="sass">
  .selectCustomerPopover
    padding-left: 15px
    padding-right: 15px 
    width: 400px !important
    right: 2px !important
    left: auto !important
    top: 60px !important
    height: 100px !important  
</style>
