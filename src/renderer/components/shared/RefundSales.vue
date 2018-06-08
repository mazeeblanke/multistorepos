<template lang="pug">
.refundSales
  el-dialog.center(
    title="Refund Sale", 
    :visible="visible", 
    @close="close",
  )
    el-table(
      :data="productsForRefund"
    )
      el-table-column(label="S/N", width="50")
        template(slot-scope="props", v-if="props.row")
          span {{ props.$index + 1 }}
      el-table-column(prop="name", show-overflow-tooltip, label="Product")
      el-table-column(prop="quantity" label="QTY (Bought)", show-overflow-tooltip)
        template(slot-scope="props" v-if="props.row")
          el-input.qty(
            :value="props.row.quantity",
            placeholder="Enter Quantity",
            type="number",
            size="small"
            disabled
          )
      el-table-column(prop="quantity" label="QTY (To Refund)", show-overflow-tooltip)
        template(slot-scope="props" v-if="props.row")
          el-input-number.qty(
            v-model.number="props.row.quantityToRefund",
            placeholder="Enter Quantity",
            size="small",
            controls-position="right",
            type="number",
            :min="0",
            :max="+props.row.quantity",
            @input="(val) => props.row.subTotalToRefund = multiplyCash(props.row.quantityToRefund, props.row.unitprice)"
          )
      el-table-column(prop="unitprice", :label="unitPriceLabel")
        template(slot-scope="props" v-if="props.row")
          el-input-number(
            :value="props.row.unitprice",
            placeholder="Enter Unit price",
            controls-position="right",
            size="small",
            disabled,
          )
      el-table-column(:label="`${totalLabel} (To Refund)`")
        template(slot-scope="props" v-if="props.row")
          el-input-number(
            v-model.number="props.row.subTotalToRefund",
            placeholder="Enter Unit price",
            controls-position="right",
            size="small",
            disabled        
          )    
    div(slot="footer" class="dialog-footer")
      button.button.is-primary(@click="refund", :disabled="!productsForRefund.length")
        span Refund
</template>

<script>
/* eslint-disable */
// import deleteMixin from '@/mixins/DeleteMixin'
import MoneyMixin from '@/mixins/MoneyMixin'
import { multiplyCash, subtractCash } from '@/utils/helper'
import { mapState, mapActions } from 'vuex'

  export default {

    props: {

      visible: {
        type: Boolean
      },

      close: {
        type: Function
      },

      products: {
        type: Array
      },

      unitPriceLabel: {
        type: String
      }, 

      totalLabel: {
        type: String
      },

      salesId: {
        required: true
      }

    },

    mixins: [MoneyMixin],

    data () {
      return {
        productsForRefund: []
      }
    },

    computed: {
      ...mapState('settings', ['settings'])
    },

    mounted () {
      this.productsForRefund = JSON.parse(JSON.stringify(this.products))
      .map(i => ({
        ...i,
        subTotalToRefund: 0,
        quantityToRefund: 0
      }))
    },

    methods: {

      ...mapActions('refunds', [
        'makeRefunds'
      ]),

      warnUser () {
        return this.$swal({
          title: 'Are you sure?',
          text: 'Do you want to refund items ?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        })
      },

      updateRefundState (payload) {
        let foundProduct;
        this.productsForRefund = this.productsForRefund.map(p => {
          if (p) {
            if (foundProduct = payload.products.find(_p => _p.id === p.id)) {
              const qty = subtractCash(p.quantity, foundProduct.quantity)
              return {
                ...p,
                quantity: qty,
                subTotalToRefund: 0,
                quantityToRefund: 0,
                subTotal: multiplyCash(qty, p.unitprice)
              }
            }
          }
          return p
        })
      },

      refund () {

        this.warnUser()
        .then((res) => {
          if (res.value) {

            const payload = {
              sales_id: this.salesId,
              branch_id: this.settings.branch.id,
              store_id: this.settings.store.id,
              products: this.productsForRefund.map(i => ({
                id: i.id,
                quantity: i.quantityToRefund
              }))
            }

            this.makeRefunds(payload)
            .then((res) => {
              this.$swal({
                type: 'success',
                title: `Successfully refunded ${this.money(res.totalAmountToRefund)}`
              })
              this.updateRefundState(payload)
              this.$emit('refunded', payload)
            })
            .catch((err) => {
              this.$snackbar.open({
                type: 'is-danger',
                message: `${err.message} Could not refund`
              })
            })

          }
        })
      },

      ...{ multiplyCash }

    }
  }
</script>

<style lang="sass">
  .refundSales
    .el-dialog
      width: 65% !important
      margin-top: 0px !important
</style>

<style lang="sass" scoped>
  .center 
    height: 100% !important
    display: flex !important
    align-items: center !important
</style>