<template lang="pug">
    .payment-bar
      .action-bar
        div.buttons
          el-popover(
            ref="popover1"
            placement="top-start"
            width="500"
            trigger="click"
          )
            div
              .column.is-12
                .field.is-horizontal
                  .field-label.has-text-left.is-v-centered
                    label.label Amount
                  .field-body
                    .field 
                      el-input-number(
                        :value="cart.amountPaid", 
                        placeholder="Enter Amount",
                        type="number"
                        :min=0,
                        :max="cart.payment_type === 'loyalty' ? cart.customer && cart.customer.loyalty_points : Infinity"
                        @change="updateCart"
                        controls-position="right",
                      )
              .column.is-12
                h4.title.is-6.mt-10.mb-2 Payment Method
                el-radio(
                  v-model="payment_type", 
                  @change="selectPaymentType", 
                  size="small", 
                  label="card", 
                  border
                ) Card
                el-radio(
                  v-model="payment_type",
                  @change="selectPaymentType",
                  size="small",
                  label="cash", 
                  border
                ) Cash   
                el-radio(
                  v-model="payment_type",
                  @change="selectPaymentType",
                  :disabled="!isLoyaltyEligible || !hasLoyaltyPoints",
                  size="small",
                  label="loyalty", 
                  border
                ) Loyalty 
              .column.is-12 
                div.is-v-centered
                  label.label.mr-15 Use Current Discount/Loyalty points
                  el-switch(
                    :disabled="!isLoyaltyEligible"
                    v-model="loyalty_charge", 
                    @change="updateLoyaltyCharge", 
                    :value="cart.loyalty_charge"
                  )                           
            el-button(
              v-popover="popover1",
              size="mini",
              slot="reference", 
              :disabled="hasPaid || processing", 
              :icon="cart.payment_type ? 'el-icon-success' : ''"
              :class="{'active': cart.payment_type}"
            ) Pay  
          // el-popover(
          //   ref="popover1"
          //   placement="top-start"
          //   width="500"
          //   trigger="click"
          // )
          //   div
          //     .column.is-12
          //       .field.is-horizontal
          //         .field-label.has-text-left.is-h-centered
          //           label.label Amount
          //         .field-body
          //           .field 
          //             el-input(
          //               :value="cart.amountPaid", 
          //               placeholder="Enter Amount",
          //               type="number"
          //               :min=0,
          //               @change="updateCart"
          //               controls-position="right",
          //             )
          //     .column.is-12
          //       button.button.is-primary.is-pulled-right(
          //         @click="selectPaymentType('cash')"
          //         :disabled="cart.payment_type === 'cash'"
          //         title="Save payment type to cash",
          //       ) Save            
          //       button.button.is-primary.is-pulled-right.mr-15(
          //         @click="removePayment"
          //         :disabled="cart.payment_type !== 'cash'"
          //         title="Remove payment type (cash)",
          //       ) Remove payment            
          //   el-button(
          //     v-popover="popover1",
          //     size="mini",
          //     slot="reference", 
          //     title="Select payment type as cash", 
          //     :disabled="hasPaid || processing", 
          //     :icon="cart.payment_type === 'cash' ? 'el-icon-success' : ''"
          //     :class="{'active': cart.payment_type === 'cash'}"
          //   ) Cash  
          // el-popover(
          //   ref="popover2"
          //   placement="top-start"
          //   width="500"
          //   trigger="click"
          // )
          //   div
          //     .column.is-12
          //       .field.is-horizontal
          //         .field-label.has-text-left.is-h-centered
          //           label.label Amount
          //         .field-body
          //           .field 
          //             el-input(
          //               :value="cart.amountPaid", 
          //               placeholder="Enter Amount",
          //               type="number",
          //               :min="0",
          //               @change="updateCart"
          //               controls-position="right",
          //             )
          //     .column.is-12
          //       button.button.is-primary.is-pulled-right(
          //         @click="selectPaymentType('card')"
          //         :disabled="cart.payment_type === 'card'"
          //         title="Save payment type to card",
          //       ) Save
          //       button.button.is-primary.is-pulled-right.mr-15(
          //         @click="removePayment"
          //         :disabled="cart.payment_type !== 'card'"
          //         title="Remove payment type (card)",
          //       ) Remove payment  
          //   el-button(
          //     v-popover="popover2",
          //     size="small",
          //     slot="reference", 
          //     title="Select payment type as card", 
          //     :disabled="hasPaid || processing", 
          //     :class="{'active': cart.payment_type === 'card'}"
          //     :icon="cart.payment_type === 'card' ? 'el-icon-success' : ''"
          //   ) Card
          button.button.is-dark(
            :disabled="processing || paymentConditions"
            :class="{'is-loading': processing}",
            @click="proceedTransaction",
            title="Process the transaction and print sales reciept",
          ) Save & Print
          button.button.is-dark(
            @click="proceedTransaction",
            :disabled="!hasPaid || refunding"
            title="Print sales reciept only",
          ) Print only     
          button.button.is-danger(
            v-if="!hasPaid",
            @click="refreshCart",
            :disabled="!items.length || processing",
            title="Cancel sale and refresh cart",
          ) Cancel     
          button.button.is-danger(
            v-if="hasPaid"
            @click="refund",
            :disabled="!items.length || refunding",
            :class="{'is-loading' : refunding}"
            title="Refund cash and cancel sale",
          ) Return     
        SalesStats(:cart="cart")
</template>


<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import SalesStats from '@/components/sales/SalesStats'

export default {
  props: {
    items: {
      type: Array,
    },
    proceedTransaction: {
      type: Function,
    },
    removePayment: {
      type: Function,
    },
    cancelSale: {
      type: Function,
    },
    hasPaid: {
      type: Boolean,
    },
    processing: {
      type: Boolean,
    },
  },


  data() {
    return {
      refunding: false,
      amountPaid: 0,
      payment_type: null,
      loyalty_charge: false
    }
  },

  mounted () {
    this.payment_type = this.cart.payment_type
  }, 


  methods: {

    ...mapActions('sales', [
      'refundSale',
      'setCart'
    ]),

    ...mapMutations('sales', [
      'SET_REFUND_SALE_STATE'
    ]),

    discountLabel(d) {
      return  `${d}% discount`
    },

    updateLoyaltyCharge (loyalty_charge) {
      let totalWithoutTax = this.cart.subTotal;
      if (loyalty_charge && !this.cart.loyalty_charge) {
        totalWithoutTax = totalWithoutTax - this.cart.discountTotal
      }
      const total = Math.max(totalWithoutTax + this.cart.taxTotal, 0)
      this.setCart({
        ...this.cart,
        loyalty_charge,
        total
      })
    },

    refreshCart() {
      this.warnUser().then((res) => {
        if (res.value) {
          this.cancelSale()
        }
      })
    },

    selectPaymentType (e) {

      let amountPaid = this.cart.amountPaid

      amountPaid = this.checkLoyaltyPointsValidity(
        amountPaid,
        e
      )

      this.setCart({
        ...this.cart,
        payment_type: e,
        amountPaid
      })
    },

    warnUser(warning) {
      return this.$swal({
        title: 'Are you sure?',
        text: warning || 'Do you want to cancel sale ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      })
    },


    refund() {
      this.SET_REFUND_SALE_STATE(true)
    },

    // setPaymentType (type) {
    //   this.setCart({
    //     ...this.cart,
    //     payment_type: type.value
    //   })
    // },

    checkLoyaltyPointsValidity (amountPaid, payment_type) {
      const { customer } = this.cart

      if (
        payment_type === 'loyalty' && 
        customer && 
        customer.loyalty_points < amountPaid
      ) {
        amountPaid = customer.loyalty_points
        this.$snackbar.open({
          type: 'is-warning',
          message: 'Loyalty Amount is greater than available customer\'s loyalty points'
        })
      }

      return amountPaid
    },

    updateCart (value) {

      let amountPaid = value

      amountPaid = this.checkLoyaltyPointsValidity(
        amountPaid,
        this.cart.payment_type
      )

      this.setCart({
        ...this.cart,
        amountPaid: parseFloat(amountPaid),
      })
    }

  },

  components: {

    SalesStats,

  },

  watch: {

    cartLoyaltyCharge (newVal) {
      this.loyalty_charge = newVal
    },

    cartPaymentType (newVal) {
      this.payment_type = newVal
    }

  },

  computed: {

    ...mapState('sales', ['cart']),

    cartLoyaltyCharge () {
      return this.cart.loyalty_charge
    },

    cartPaymentType () {
      return this.cart.payment_type
    },

    isLoyaltyEligible () {
      return this.cart.customer && this.cart.customer.loyalty_status
    },

    hasLoyaltyPoints () {
      return this.cart.customer && this.cart.customer.loyalty_points > 0
    },

    paymentConditions() {

      if (!this.cartPaymentType) return true

      if (!this.items.length) return true

      if (this.hasPaid) return true

      if (!this.hasPaid && (this.change === 0) && this.cart.total > 0) {
        return false
      }

    },


  },
}
</script>

<style lang="sass">
.payment-bar
  // height: 150px
  box-shadow: inset 0px 1px 3px 0px #eaeaea
  // bottom: 3px
  // position: absolute
  // width: 100%
  border-top: 1px solid #e2e2e2
.action-bar
  padding: 0px 10px 
  padding: 0px 10px
  display: flex
  justify-content: space-between
  align-items: center  
  height: 170px
  // padding: 10px 20px 5px 20px
  span, .button 
   margin: 5px 5px    
  button 
    background-color: #05296b
    color: white
    height: 50px
    border: none 
    width: 150px
  .el-button.is-disabled, .el-button.is-disabled:focus, .el-button.is-disabled:hover
    color: #ffffff !important
    background-color: rgba(5, 41, 107, 0.2) !important 
    // border-color: #ebeef5 !important
.save-bar
  display: flex
  justify-content: flex-end 
  button 
    margin: 0px 5px
    height: 50px
    border: none 
    width: 150px
.el-popover
  width: 500px
  transform-origin: center bottom 0px
  z-index: 2050
  position: absolute
  top: 385px
  left: 34px
  height: 260px 
  .el-select, .input, .el-input-number 
    width: 100%   
.buttons 
  // justify-content: center
  display: flex
  flex-wrap: wrap
.el-button
  // span 
  //   display: flex
  //   justify-content: center
  //   align-items: center 
.el-button:focus, .el-button:hover, .el-button.active
  background-color: #2196F3
  // background-color: #00040a  
  color: white       
</style>

