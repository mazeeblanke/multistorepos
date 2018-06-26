<template lang="pug">
section.section(:style="{ width: '100%' }")
  .container-fluid
      .column
        .BaseAppCard.card
          .Sales
            RefundSales(
              v-if="refundSales"
              :visible.sync="refundSales", 
              :close="closeRefundSales",
              :products="filteredCartItems",
              :total-label="totalLabel",
              :unit-price-label="unitPriceLabel",
              :sales-id="cart.sales_id",
              @refunded="updateCart"
            )
            FullscreenDialog(
              @closed="closeReceiptDialog",
              v-show="settings.branch.printout === 'Receipt'"
              :scrollable="true", 
              :active.sync="printReceipt"
            )
              span.material-icons.print.action(slot="action" @click="print") print
              component.receipt(
                ref="receipt"
                :items="filteredCartItems",
                :total="subTotal",
                :cart="cart",
                v-show="printReceipt",
                :print-receipt="printReceipt",
                :is="(settings && settings.branch.printout) || 'Receipt'",
              ) 
            .level.toolbar
              .level-left
                .level-item.page-title.subtitle.is-5
                  span.el-icon-news.mr-5.font-size-23
                  span(:style="{ width: '120px' }") Listing Items ({{ getCartItemsNumber }})
                  template(v-if="cart.customer")
                    span.tag.is-dark.is-medium 
                      span.material-icons accessibility
                      span {{ customerFullname }}
              .level-right
                .level-item(v-if="hasPaid")
                  a.button.is-primary(@click="newSale")
                    span New sale
                template(v-if="!hasPaid")
                  .level-item
                    a.button.is-primary(
                      @click="addProducts", 
                      :disabled="formPanelOpen || processing", 
                      title="Add selected item/product to cart"
                    )
                      span.icon
                        i.material-icons add
                      span Add Items/Products
                  .level-item
                    SelectCustomer(
                      top="60px"
                      right="0px"
                      :processing="processing", 
                      @selected:customer="useCreatedCustomer"
                    )
            .form-panel(:class="{ 'is-active': formPanelOpen }")
              SalesForm.sales-form.page-forms(
                ref="new-product-form",
                @close-form="closeNewSalesForm",
                :processing-transaction="processing",
                :has-paid="hasPaid",
              )
            el-table.sales-table(
              ref="items-table",
              :data="cart.products",
              :max-height="formPanelOpen? 450 : 455",
              :border="true"
              :default-sort="{prop: 'created_at', order: 'descending'}",
              v-show="cart.products.length",
              stripe
            )
              el-table-column(type="selection")
              el-table-column(label="S/N", width="50")
                template(slot-scope="props" v-if="props.row")
                  span {{ props.$index + 1 }}
              el-table-column(prop="name", align="left", show-overflow-tooltip, label="Product Name")
              el-table-column(prop="quantity" label="Qty", align="left", show-overflow-tooltip)
                template(slot-scope="props" v-if="props.row")
                  el-input.qty(
                    :value="props.row.quantity",
                    placeholder="Enter Quantity",
                    type="number",
                    @change="updateSubtotal(props.row, $event)",
                    :min="1"
                    :max="parseInt(props.row.quantityInStock)",
                    :disabled="hasPaid || processing"
                  )
              el-table-column(prop="unitprice", :label="unitPriceLabel", align="left")
                template(slot-scope="props" v-if="props.row")
                  el-input-number(
                    :value="props.row.unitprice",
                    placeholder="Enter Unit price",
                    controls-position="right",
                    disabled,
                  )
              el-table-column(:label="totalLabel", align="left")
                template(slot-scope="props" v-if="props.row")
                  el-input-number(
                    :value="props.row.subTotal",
                    placeholder="Enter Unit price",
                    controls-position="right",
                    disabled,
                  )
              el-table-column(label="Actions", :render-header="renderDelete", width="70")
                template(slot-scope="props", v-if="props.row")
                  button.button(
                    :class="$style.trash", 
                    :disabled="hasPaid || processing", 
                    @click="removeItemFromCart(props.row)"
                  )
                    span.el-icon-delete.font-size-23
            PaymentBar(
              :proceed-transaction="proceedTransaction",
              :has-paid="hasPaid",
              :processing="processing",
              :calculate-total="subTotal",
              :remove-payment="removePayment",
              :cancel-sale="newSale",
              :items="filteredCartItems",
            )
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapMutations } from 'vuex'
import SalesForm from '@/components/sales/SalesForm'
import SelectCustomer from '@/components/products/enquiries/SelectCustomer'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import deleteMixin from '@/mixins/DeleteMixin'
import MoneyMixin from '@/mixins/MoneyMixin'
import PaymentBar from '@/components/sales/PaymentBar'
import Invoice from '@/components/shared/Invoice'
import {
  multiplyCash,
  sumCash,
  calculatePercentInCash,
  calculateDiscount,
  subtractCash
} from '@/utils/helper'
import RefundSales from '@/components/shared/RefundSales'
import _ from 'lodash'

const blobUtil = require('blob-util')

export default {

  mixins: [deleteMixin, MoneyMixin],

  data () {
    return {
      formKey: 'items',
      formPanelOpen: true,
      showingReciept: false,
      printReceipt: false,
      addingCustomer: false,
      fullScreenActive: false,
      loading: false,
      processing: false,
      hasPaid: false
    }
  },

  watch: {

    subTotal (newValue) {
      let totalWithoutTax = newValue
      let discountTotal = 0
      const branch = this.settings.branch
      const discount = branch.discount
      const threshold = branch.threshold
      const taxTotal = calculatePercentInCash(this.tax, newValue)
      if (totalWithoutTax >= threshold) {
        discountTotal = calculatePercentInCash(discount, threshold)
      }
      if (this.cart.loyalty_charge) {
        totalWithoutTax = newValue - discountTotal
      }
      const total = Math.max(totalWithoutTax + taxTotal, 0)
      const tax = this.tax
      const discount_per_threshold = branch.discount
      const subTotal = newValue
      this.setCart({
        ...this.cart,
        discountTotal,
        discount_per_threshold,
        taxTotal,
        threshold,
        total,
        discount,
        tax,
        subTotal
      })
    }

  },

  // mounted () {
  //   this.printReceipt = false
  // },

  methods: {

    ...{ multiplyCash },

    ...mapActions('sales', [
      'removeFromCart',
      'completeTransaction',
      'setCart'
    ]),

    closeRefundSales () {
      this.SET_REFUND_SALE_STATE(false)
    },

    ...mapMutations('sales', [
      'SET_SALES_ID',
      'REMOVE_CART_ITEM',
      'RESET_CART',
      'SET_REFUND_SALE_STATE'
    ]),

    print () {
      console.log('sdjhsdj  jshd jshdj print')
      if (this.settings && this.settings.branch.printout === 'receipt') {
        console.log('print 3')
        this
        .$electron
        .ipcRenderer
        .send('print', this.selectedPrinter && this.selectedPrinter.name)
      }
    },

    updateCart (payload) {
      if (this.cart.sales_id === payload.sales_id) {
        let products = this.cart.products.slice()
        let foundProduct
        products = products.map(p => {
          if (p) {
            if (foundProduct = payload.products.find(_p => _p.id === p.id)) {
              const qty = subtractCash(p.quantity, foundProduct.quantity)
              return {
                ...p,
                quantity: qty,
                subTotal: multiplyCash(qty, p.unitprice)
              }
            }
          }
          return p
        })
        this.setCart({ ...this.cart, products })
      }
    },

    useCreatedCustomer (data) {
      let payload = {
        customer: data,
        customer_id: data && data.id
      }

      if (!data && this.cart.payment_type === 'loyalty') {
        payload.payment_type = 'cash'
      }

      this.setCart({
        ...this.cart,
        ...payload
      })
      this.closeDialog()
    },

    addCustomer () {
      this.fullScreenActive = true
      this.addingCustomer = true
    },

    handleReceiptDisplay () {
      this.printReceipt = true
      this.print()
      // if (this.settings.branch.printout !== 'Receipt') {
        // this.$refs.receipt.generateReceiptPdf().then((res) => {
        //   // console.log('here ejhf hfdhfhdjfhdf djfhdfj')
        //   // console.log(res)
        //   // console.log(blobUtil.createObjectURL(res))
        //   // const url = blobUtil.createObjectURL(res)
        //   // this.$electron.ipcRenderer.send('invoicePreview', res)
        // }).catch((err) => {
        //   console.log(err)
        // }) 
      // }
    },

    proceedTransaction () {
      if (this.hasPaid) {
        this.handleReceiptDisplay()
      } else if (this.shouldProceedWithTransaction) {
        const message = 'Amount paid is insufficient'
        this.warnUser(message)
          .then((res) => {
            if (res.value) {
              this.sellItems()
            }
          })
      } else {
        console.log('6')
        this.sellItems()
      }
    },

    closeDialog () {
      this.fullScreenActive = false
      this.addingCustomer = false
      this.showingReciept = false
    },

    closeReceiptDialog () {
      this.printReceipt = false
    },

    newSale () {
      this.RESET_CART()
      this.hasPaid = false
    },

    getProcessedCart () {
      return {
        ...this.cart,
        products: this
        .cart
        .products
        .filter(p => p)
        .map(p => {
          console.log(p)
          const {
            id,
            name,
            unitprice,
            costprice,
            quantity,
            subTotal
          } = p
          return {
            id,
            name,
            unitprice,
            costprice,
            quantity,
            subTotal
          }
        })
      }
    },

    sellItems () {
      this.processing = true
      this.completeTransaction({
        ...this.getProcessedCart(),
        branch_id: this.settings.branch.id,
        store_id: this.settings.store.id,
        loyalty_status: this.cart.customer 
          ? Boolean(this.cart.customer.loyalty_status)
          : false,
        loyalty_point: this.cart.discountTotal,
      })
      .then(res => {
        this.handleSale(res)
      })
      .catch((err) => {
        console.log(err)
        this.processing = false
        this.$snackbar.open({
          type: 'is-danger',
          message: err.message
        })
      })
    },

    handleSale (res) {
      this.$snackbar.open('Transaction complete !!')
      this.hasPaid = true
      this.addingCustomer = false
      this.handleReceiptDisplay()
      // if (this.settings && this.settings.branch.printout === 'receipt') {
      //   this.printReceipt = true
      //   this.print()
      // } else {
      //   this.printReceipt = true
      //   // this.$refs.receipt.generateReceiptPdf();
      // }
      this.processing = false
    },

    removePayment () {
      this.setCart({
        ...this.cart,
        payment_type: null,
        amountPaid: 0
      })
    },

    warnUser (warning) {
      return this.$swal({
        title: 'Are you sure?',
        text: warning || 'Do you want to remove selected item(s) from cart ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      })
    },

    removeItemFromCart (item) {
      this.warnUser().then((res) => {
        if (res.value) {
          this.REMOVE_CART_ITEM(item)
          this.$snackbar.open('Removed item successfully')
        }
      })
    },

    deleteItems () {},

    addProducts () {
      this.formPanelOpen = true
      this.$scrollTo(this.$refs['new-product-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20
      })
    },

    closeNewSalesForm () {
      this.formPanelOpen = false
      this.$emit('formPanelClose')
    },

    updateSubtotal (item, newQty) {
      let products = this.cart.products.slice()
      products = products.map((_item) => {
        if (_item && _item.id === item.id) {
          return {
            ...item,
            quantity: newQty,
            subTotal: multiplyCash(newQty, item.unitprice)
          }
        }
        return _item
      })
      this.setCart({ ...this.cart, products })
    }
  },

  computed: {

    ...mapState('sales', ['salesid', 'cart', 'refundSales']),

    ...mapState('settings', ['settings']),

    ...mapState('users', ['currentUser']),

    ...mapState('app', ['selectedPrinter']),

    ...mapState('branch', [
      'currentBranch'
    ]),

    // selectedReciept() {
    //   if (this.hasPaid) {
    //     return () => import('@/components/shared/Invoice')
    //   }
    // },

    unitPriceLabel () {
      return `Unit Price (${this.currencySymbol})`
    },

    totalLabel () {
      return `Total (${this.currencySymbol})`
    },

    filteredCartItems () {
      return this.cart.products.filter(i => i)
    },

    customerFullname () {
      return this.cart.customer && this.cart.customer.full_name
    },

    subTotal () {
      const subTotals = _.map(this.filteredCartItems, 'subTotal')
      return sumCash(subTotals)
    },

    tax () {
      const taxes = this.settings && _.map(this.settings.store.tax, 'value')
      return sumCash(taxes) || 0
    },

    shouldProceedWithTransaction () {
      return this.cart.amountPaid < this.cart.total
    },

    getCartItemsNumber () {
      return this.filteredCartItems.length
    }

  },

  components: {

    SalesForm,

    FullscreenDialog,

    SelectCustomer,

    Receipt: () => import('@/components/shared/Reciept'),

    RefundSales,

    PaymentBar,

    Invoice

  },

  beforeRouteLeave (to, from, next) {
    if (this.hasPaid) {
      this.newSale()
      next()
    } else {
      next()
    }
  }

}
</script>

<style lang="sass" scoped>
.receipt
  z-index: -100;
  position: absolute;
.el-table__body-wrapper
  overflow-x: hidden !important
.form-panel
  padding: 0rem !important
  overflow: hidden !important
  border: 0px !important
.sales-form
  border: none !important
.section
   padding: 0rem 0rem !important
</style>


<style lang="sass">
.Sales  
  .sales-table
    .el-input-number, .el-input.qty
      width: 100% !important
    // padding-left: 4px;
    box-shadow: 0px -3px 4px 0px rgba(0, 0, 0, 0.12) inset;
    // padding-right: 4px;  
</style>

<style lang="sass" module>
.columns
  margin: 0px 50px
.trash
  border: none
  background: transparent
</style>
