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
                  .field-label.has-text-left.is-h-centered
                    label.label Amount
                  .field-body
                    .field 
                      el-input-number(
                        v-model="transaction.paid", 
                        placeholder="Enter Amount",
                        :min="0",
                      )
              .column.is-12
                button.button.is-primary.is-pulled-right(
                  @click="transaction.payment = 'cash'"
                  :disabled="transaction.payment === 'cash'"
                  title="Save payment type to cash",
                ) Save            
                button.button.is-primary.is-pulled-right.mr-15(
                  @click="removePayment"
                  :disabled="transaction.payment !== 'cash'"
                  title="Remove payment type (cash)",
                ) Remove payment            
            el-button(v-popover="popover1" slot="reference", title="Select payment type as cash", :disabled="hasPaid || processing" :class="{'active': transaction.payment === 'cash'}")
              i.material-icons(v-if="transaction.payment === 'cash'") done_all
              span Cash  
          el-popover(
            ref="popover2"
            placement="top-start"
            width="500"
            trigger="click"
          )
            div
              .column.is-12
                .field.is-horizontal
                  .field-label.has-text-left.is-h-centered
                    label.label Amount
                  .field-body
                    .field 
                      el-input-number(
                        v-model="transaction.paid", 
                        placeholder="Enter Amount",
                        :min="0",
                      )
              .column.is-12
                button.button.is-primary.is-pulled-right(
                  @click="transaction.payment = 'card'"
                  :disabled="transaction.payment === 'card'"
                  title="Save payment type to card",
                ) Save
                button.button.is-primary.is-pulled-right.mr-15(
                  @click="removePayment"
                  :disabled="transaction.payment !== 'card'"
                  title="Remove payment type (card)",
                ) Remove payment  
            el-button(v-popover="popover2", slot="reference", title="Select payment type as card", :disabled="hasPaid || processing" :class="{'active': transaction.payment === 'card'}") 
              i.material-icons(v-if="transaction.payment === 'card'") done_all
              span Card
          button.button.is-dark(
            :disabled="validation.$invalid || processing || paymentConditions"
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
        div.sale-stat 
          .field.is-horizontal
            .field-label
              label.label.is-pulled-left Sub Total:
            .field-body
              .field 
                span {{ money(calculateTotal) }} 
          .field.is-horizontal
            .field-label
              label.label.is-pulled-left Sales Discount ({{ transaction.discount }}%):
            .field-body
              .field 
                span {{ money(transaction.discountTotal) }}
          .field.is-horizontal
            .field-label
              label.label.is-pulled-left Tax ({{ transaction.tax }}%)
            .field-body
              .field 
                span {{ money(transaction.taxTotal) }}    
          .field.is-horizontal
            .field-label
              label.label.is-pulled-left Total Amount:
            .field-body
              .field 
                span {{ money(transaction.total) }}         
          .field.is-horizontal
            .field-label
              label.label.is-pulled-left Paid Amount:
            .field-body
              .field 
                span {{ money(transaction.paid) }} 
          .field.is-horizontal
            .field-label
              label.label.is-pulled-left Cash Change:
            .field-body
              .field 
                span {{ money(change) }}
</template>


<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
const parseAmount = (amount) => parseFloat(amount.toPrecision(4));
import { ObjectToFormData, money } from '@/utils/helper';
import MoneyMixin from '@/mixins/MoneyMixin';
// import { formatMoney } from '@/filters/format';

export default {
  props: {
    items: {
      type: Array,
    },
    transaction: {
      type: Object,
    },
    validation: {
      type: Object,
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
    calculateTotal: {
      required: true,
    },
    change: {
      require: true,
    },
    getTotal: {
      require: true,
    },
  },
  data() {
    return {
      refunding: false,
    };
  },
  methods: {
    // ...{ formatMoney },
    ...mapActions('sales', [
      'refundSale',
    ]),
    // money(amount) {
    //   return this.formatMoney(amount, this.store.currency.symbol);
    // },
    discountLabel(d) {
      return  `${d}% discount`;
    },
    refreshCart() {
      this.warnUser().then((res) => {
        if (res.value) {
          this.cancelSale();
        }
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
      });
    },
    refund() {
      const MESSAGE = "Do you want to return items and refund ?";
      this.warnUser(MESSAGE)
      .then((res) => {
        if (res.value) {
          this.refunding = true;
          this.refundSale(
            ObjectToFormData({
              refundsales: 'refundsales',
              salesid: this.salesid,
            }),
          ).then(res => {
            if (res.status === 'Success') {
              this.$snackbar.open(`Success !! - ${res.message}`);
              this.cancelSale();
            } else if (res.status === 'Failure') {
              this.$snackbar.open({
                message: `Failure!! - ${res.message}`,
                type: 'is-danger',
              });
            }
            this.refunding = false;
          })
          .catch(() => {
            this.refunding = false;
          });
        }
      })
    },
  },
  mixins: [
    MoneyMixin
  ],
  computed: {
    availableDiscounts() {
      return _.sortedUniq([
        this.transaction.availableDiscount,
        this.transaction.loyalty && this.transaction.loyalty.discount,
      ]);
    },
    ...mapState('sales', [
      'salesid',
    ]),
    paymentConditions() {
      if (!this.items.length) {
        return true;
      }
      if (this.hasPaid) {
        return true;
      }
      if (!this.hasPaid && (this.change === 0) && this.calculateTotal > 0) {
        return false;
      }
    },
  },
};
</script>

<style lang="sass">
.payment-bar
  // height: 150px
  box-shadow: inset 0px 1px 3px 0px #eaeaea;
  // bottom: 3px;
  // position: absolute;
  // width: 100%;
  border-top: 1px solid #e2e2e2;
.action-bar
  padding: 0px 10px 
  padding: 0px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;  
  height: 170px
  // padding: 10px 20px 5px 20px
  span, .button 
   margin: 5px 5px    
  button 
    background-color: #05296b;
    color: white;
    height: 50px;
    border: none; 
    width: 150px;
  .el-button.is-disabled, .el-button.is-disabled:focus, .el-button.is-disabled:hover
    color: #ffffff !important
    background-color: rgba(5, 41, 107, 0.2) !important 
    // border-color: #ebeef5 !important
.save-bar
  display: flex
  justify-content: flex-end 
  button 
    margin: 0px 5px
    height: 50px;
    border: none; 
    width: 150px;  
.sale-stat 
  font-weight: 900;
  width: 350px;
  flex-basis: 350px
  .field-body
    flex-grow: 1 !important
  text-align: right
  .field 
    margin-bottom: 0px !important   
  .field-label
    flex-grow: 2 !important  
  .field.is-horizontal 
    // border-bottom: 1px dashed #e6e6e6 !important  
.el-popover
  width: 500px;
  transform-origin: center bottom 0px;
  z-index: 2050;
  position: absolute;
  top: 385px;
  left: 34px;
  height: 260px; 
  .el-select, .input, .el-input-number 
    width: 100%   
.buttons 
  // justify-content: center;
  display: flex;
  flex-wrap: wrap;
.el-button
  // span 
  //   display: flex;
  //   justify-content: center;
  //   align-items: center 
.el-button:focus, .el-button:hover, .el-button.active
  background-color: #2196F3  
  color: white       
</style>

