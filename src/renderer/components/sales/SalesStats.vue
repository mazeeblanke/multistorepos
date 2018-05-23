<template lang="pug">
div.sale-stat 
  .field.is-horizontal
    .field-label
      label.label.is-pulled-left Sub Total:
    .field-body
      .field 
        span {{ money(cart.subTotal) }} 
  .field.is-horizontal
    .field-label
      label.label.is-pulled-left Sales Discount ({{ cart.discount }}%):
    .field-body
      .field 
        span {{ money(cart.discountTotal) }}
  .field.is-horizontal
    .field-label
      label.label.is-pulled-left Tax ({{ cart.tax }}%)
    .field-body
      .field 
        span {{ money(cart.taxTotal) }}    
  .field.is-horizontal
    .field-label
      label.label.is-pulled-left Total Amount:
    .field-body
      .field 
        span {{ money(cart.total) }}         
  .field.is-horizontal
    .field-label
      label.label.is-pulled-left Paid Amount:
    .field-body
      .field 
        span {{ money(cart.amountPaid) }} 
  .field.is-horizontal
    .field-label
      label.label.is-pulled-left Cash Change:
    .field-body
      .field 
        span {{ money(cart.cashChange) }}
</template>

<script>
import MoneyMixin from '@/mixins/MoneyMixin'

export default {
  props: {
    cart: {
      type: Object
    }
  },

  mixins: [MoneyMixin]
}
</script>

<style lang="sass">
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
</style>