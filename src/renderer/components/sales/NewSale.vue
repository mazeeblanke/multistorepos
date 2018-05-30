<template lang="pug">
section.section(:style="{ width: '100%' }")
  .container-fluid
      .column
        .BaseAppCard.card
          .Sales
            FullscreenDialog(
              @closed="closeDialog", 
              :active.sync="fullScreenActive"
            )
              CustomerForm.page-forms(
                ref="customer-form",
                @close-form="closeDialog",
                @action-complete="useCreatedCustomer"
                v-show="addingCustomer"
              )
            FullscreenDialog(
              @closed="closeReceiptDialog", 
              :scrollable="true", 
              :active.sync="printReceipt"
            )
              span.material-icons.print.action(slot="action" @click="print") print
              component.receipt(
                ref="receipt"
                :items="filteredCartItems",
                :total="subTotal",
                :cart="cart",
                v-if="printReceipt",
                :print-receipt="printReceipt",
                :is="(store && store.printout) || 'Reciept'",
              ) 
            .level.toolbar
              .level-left
                .level-item.page-title.subtitle.is-5
                  span.el-icon-news.mr-5.font-size-23
                  span.mr-10 Listing Items({{ getCartItemsNumber }})
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
                    a.button.is-primary(
                      @click="addCustomer",
                      :disabled="processing", 
                      title="Create and add the customer"
                    )
                      span.icon
                        i.material-icons add
                      span Add Customer
                  .level-item
                    SelectCustomer(:processing="processing")
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
              :max-height="formPanelOpen? 390 : 455",
              :border="true"
              :default-sort="{prop: 'created_at', order: 'descending'}",
              v-show="cart.products.length",
              stripe
            )
              el-table-column(type="selection")
              el-table-column(label="No", width="50")
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
import CustomerForm from '@/components/customers/CustomerForm'
import SelectCustomer from '@/components/sales/SelectCustomer'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import deleteMixin from '@/mixins/DeleteMixin'
import MoneyMixin from '@/mixins/MoneyMixin'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import { money, calculatePercentInCash, calculateDiscount, ucFirst } from '@/utils/helper'
import PaymentBar from '@/components/sales/PaymentBar'
import { multiplyCash, sumCash } from '@/utils/helper'
import _ from 'lodash'

export default {

  mixins: [deleteMixin, validationMixin, MoneyMixin],

  data() {
    return {
      formKey: 'items',
      formPanelOpen: true,
      showingReciept: false,
      printReceipt: false,
      addingCustomer: false,
      fullScreenActive: false,
      loading: false,
      processing: false,
      hasPaid: false,
    };
  },

  watch: {

    subTotal (newValue) {
      const branch = this.settings.branch
      const discount = calculateDiscount(newValue, branch.threshold, branch.discount)
      const discountTotal = calculatePercentInCash(discount, newValue)
      const taxTotal = calculatePercentInCash(this.tax, newValue)
      const total = Math.max((newValue - discountTotal) + taxTotal, 0)
      const tax = this.tax
      const subTotal = newValue
      this.setCart({
        ...this.cart,
        discountTotal,
        taxTotal,
        total,
        discount,
        tax,
        subTotal,
      })
    },

  },

  methods: {

    ...{ multiplyCash },

    ...mapActions('sales', [
      'removeFromCart',
      'completeTransaction',
      'setCart'
    ]),

    ...mapMutations('sales', [
      'SET_SALES_ID',
      'REMOVE_CART_ITEM',
      'RESET_CART'
    ]),

    print() {
      if (this.settings && this.settings.branch.printout === 'receipt') {
        this.$electron.ipcRenderer.send('print')
      }
    },

    useCreatedCustomer(data) {
      this.setCart({
        ...this.cart,
        customer: data,
        customer_id: data.id
      })
      this.closeDialog();
    },

    addCustomer() {
      this.fullScreenActive = true;
      this.addingCustomer = true;
    },

    proceedTransaction() {
      if (this.hasPaid) {
        if (this.store && this.store.printout == 'reciept') {
          this.printReceipt = true;
        } else {
          this.printReceipt = true;
          // this.$refs.receipt.generateReceiptPdf();
        }
      } else if (!this.shouldProceedWithTransaction) {
        const message = 'Amount paid is insufficient';
        this.warnUser(message)
        .then((res) => {
          if (res.value) {
            this.sellItems();
          }
        })
      } else{
        this.sellItems();
      }
    },

    closeDialog() {
      this.fullScreenActive = false;
      this.addingCustomer = false;
      this.showingReciept = false;
    },

    closeReceiptDialog() {
      this.printReceipt = false;
    },

    newSale() {
      this.RESET_CART();
      this.hasPaid = false;
    },

    sellItems() {
      // if (!this.$v.$invalid) {
        this.processing = true;
        this.completeTransaction({
          ...this.cart,
          branch_id: this.settings.branch.id,
          store_id: this.settings.store.id
        })
        .then(res => {
          this.handleSale(res);
        })
        .catch((err) => {
          console.log(err)
          this.processing = false
          this.$snackbar.open({
            type: 'is-danger',
            message: err.message
          })
        })
      // }
    },

    handleSale(res) {
      this.$snackbar.open('Transaction complete !!');
      this.hasPaid = true;
      this.addingCustomer = false
      if (this.settings && this.settings.branch.printout == 'receipt') {
        this.printReceipt = true
        this.print()
      } else {
        this.printReceipt = true
        // this.$refs.receipt.generateReceiptPdf();
      }
      this.processing = false
    },

    removePayment() {
      this.setCart({
        ...this.cart,
        payment_type: null,
        amountPaid: 0
      })
    },

    warnUser(warning) {
      return this.$swal({
        title: 'Are you sure?',
        text: warning || 'Do you want to remove selected item(s) from cart ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      });
    },

    removeItemFromCart(item) {
      this.warnUser().then((res) => {
        if (res.value) {
          this.REMOVE_CART_ITEM(item)
          this.$snackbar.open('Removed item successfully');
        }
      });
    },

    deleteItems() {},

    addProducts() {
      this.formPanelOpen = true;
      this.$scrollTo(this.$refs['new-product-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      });
    },

    closeNewSalesForm() {
      this.formPanelOpen = false;
      this.$emit('formPanelClose');
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

    ...mapState('sales', ['salesid', 'cart']),

    ...mapState('settings', ['settings']),

    ...mapState('users', ['currentUser']),

    ...mapState('branch', [
      'currentBranch',
    ]),

    // selectedReciept() {
    //   if (this.hasPaid) {
    //     return () => import('@/components/shared/Invoice')
    //   }
    // },

    unitPriceLabel() {
      return `Unit Price (${this.currencySymbol})`
    },

    totalLabel() {
      return `Total (${this.currencySymbol})`
    },

    filteredCartItems() {
      return this.cart.products.filter(i => i);
    },

    customerFullname() {
      return this.cart.customer && this.cart.customer.full_name
    },

    subTotal () {
      const subTotals = _.map(this.filteredCartItems, 'subTotal')
      return sumCash(subTotals)
    },

    tax() {
      const taxes = this.settings && _.map(this.settings.store.tax, 'value')
      return sumCash(taxes) || 0
    },

    shouldProceedWithTransaction() {
      return this.cart.cashChange >= 0;
    },

    getCartItemsNumber() {
      return this.filteredCartItems.length
    },

  },

  components: {

    SalesForm,

    FullscreenDialog,

    SelectCustomer,

    Reciept: () => import('@/components/shared/Reciept'),

    CustomerForm,

    PaymentBar,

    Invoice: () => import('@/components/shared/Invoice')

  },

};
</script>

<style lang="sass" scoped>
.receipt
  z-index: -100;
  position: absolute;
  // display: none;
.el-table__body-wrapper
  overflow-x: hidden !important
.form-panel
  padding: 0rem !important
  overflow: hidden !important
  border: 0px !important
.sales-form
  border: none !important
.sale-stat
  // font-family: 'Alegreya Sans SC', sans-serif !important
  .field-label, .field
    font-size: 17px !important
  .field-body
    .field
      flex-grow: 0 !important
i.material-icons.updateCartBtn
  font-size: 15px !important
.section
   padding: 0rem 0rem !important
</style>


<style lang="sass">
.Sales  
  .sales-table
    .el-input-number, .el-input.qty
      width: 100% !important
.humanize-display
  text-transform: capitalize
  i
    margin-right: 5px
</style>

<style lang="sass" module>
.columns
  margin: 0px 50px
.trash
  border: none
  background: transparent
</style>
