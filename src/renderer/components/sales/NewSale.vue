<template lang="pug">
section.section
  .container-fluid
      .column
        .BaseAppCard.card
          .RequisitionList
            FullscreenDialog(@closed="closeDialog", :active.sync="fullScreenActive")
              CustomerForm.page-forms(
                ref="customer-form",
                @close-form="closeDialog",
                @action-complete="useCreatedCustomer"
                v-show="addingCustomer",
                :sell-items="sellItems"
                :processing-transaction="processing",
                :has-paid="hasPaid",
              )
            FullscreenDialog(@closed="closeReceiptDialog", :scrollable="true", :active.sync="printReceipt")
              span.material-icons.print.action(slot="action" @click="print") print
              component.receipt(
                ref="receipt"
                :items="filteredCartItems",
                :total="calculateTotal",
                :salesid="salesid",
                :transaction="transaction",
                v-show="printReceipt && store.printout == 'reciept'",
                :print-receipt="printReceipt",
                :is="(store && store.printout) || 'Reciept'",
              ) 
            .level.toolbar
              .level-left
                .level-item.page-title.subtitle.is-5
                  span.tag.is-medium.is-info(title="Making sales for this branch") Branch: {{ currentBranch.name }}
                .level-item.page-title.subtitle.is-5
                  span Listing items({{ getCartItemsNumber }})
                  template(v-if="transaction.customerDetails")
                    span(:style="{ margin: '0px 5px'}") for
                    span.tag.is-small {{ customerFullname }}
              .level-right
                .level-item(v-if="hasPaid")
                  a.button.is-primary(@click="newSale")
                    span New sale
                template(v-if="!hasPaid")
                  .level-item
                    a.button.is-primary(@click="addProducts", :disabled="formPanelOpen || processing", title="Add selected item/product to cart")
                      span.icon
                        i.material-icons add
                      span Add Items/Products
                  .level-item
                    a.button.is-primary(@click="addCustomer", :disabled="processing", title="Select the customer")
                      span.icon
                        i.material-icons add
                      span Add Customer
                  .level-item
                    SelectCustomer(:transaction.sync="transaction", :processing="processing")
            .form-panel(:class="{ 'is-active': formPanelOpen }")
              SalesForm.sales-form.page-forms(
                ref="new-product-form",
                @close-form="closeNewSalesForm",
                @action-complete="updateProductList",
                @discount="updateDiscount",
                :cart-items="filteredCartItems",
                :processing-transaction="processing",
                :has-paid="hasPaid",
              )
            EmptyState(empty-text="Add items/products to sell " v-if="!filteredItemsData.length && !loading", :style="{ height: '400px' }")
            el-table(
              ref="items-table",
              :data="filteredItemsData",
              :max-height="formPanelOpen? 390 : 455",
              :border="true"
              :default-sort="{prop: 'created_at', order: 'descending'}",
              v-show="filteredItemsData.length",
              stripe
            )
              el-table-column(type="selection")
              el-table-column(label="No", width="50")
                template(slot-scope="props" v-if="props.row")
                  span {{ props.$index + 1 }}
              el-table-column(prop="selectedItem.name", align="left", show-overflow-tooltip, label="Product Name")
              el-table-column(prop="quantity" label="Qty", align="left", show-overflow-tooltip)
                template(slot-scope="props" v-if="props.row")
                  el-input-number(
                    v-model="props.row.quantity",
                    placeholder="Enter Quantity",
                    controls-position="right",
                    size="mini",
                    @change="props.row.updated = true",
                    :min="1"
                    :max="parseInt(props.row.quantityInStock)",
                    :disabled="hasPaid || processing"
                  )
              el-table-column(prop="selectedItem.unitprice", :label="unitPriceLabel", align="left")
              el-table-column(align="left")
                template(slot-scope="scope", scope="props", v-if="props.row")
                  button.button.is-primary.is-small(@click="updateQty(props.row)", :disabled="!props.row.updated || hasPaid")
                    i.material-icons.updateCartBtn.mr-5 done_all
                    span Update Qty
              el-table-column(:label="totalLabel", align="left")
                template(slot-scope="scope", scope="props")
                  span {{ props.row && (props.row.quantity * props.row.selectedItem.unitprice).toFixed(1) }}
              el-table-column(label="Actions", :render-header="renderDelete", width="70")
                template(slot-scope="scope", scope="props", v-if="props.row")
                  button.button(:class="$style.trash", :disabled="hasPaid || processing" @click="removeItemFromCart(props.row)")
                    i.material-icons delete
              div(slot="append" v-show="showLoading")
              div(ref='loader' style="height: 45px;")
                infinite-loading(spinner="waveDots" v-if="loading")
            PaymentBar(
              :transaction="transaction",
              :proceed-transaction="proceedTransaction",
              :has-paid="hasPaid",
              :processing="processing",
              :validation="$v",
              :calculate-total="calculateTotal",
              :change="change",
              :remove-payment="removePayment",
              :get-total="getTotal",
              :cancel-sale="newSale",
              :items="filteredCartItems",
            )
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import { formatDate, formatStatus, formatMoney, dateForHumans } from '@/filters/format';
import Loading from '@/components/shared/Loading';
import SalesForm from '@/components/sales/SalesForm';
import CustomerForm from '@/components/customers/CustomerForm';
import SelectCustomer from '@/components/sales/SelectCustomer';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import Reciept from '@/components/shared/Reciept';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
import MoneyMixin from '@/mixins/MoneyMixin';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import { ObjectToFormData, money, clearAutoSavedForm } from '@/utils/helper';
import PaymentBar from '@/components/sales/PaymentBar';
import EmptyState from '@/components/EmptyState';
import { autoSaveForm } from '@/utils/helper';
import AutoSaveMixin from '@/mixins/AutoSaveMixin';
import { NEW_SALE } from '@/utils/constants';
// import SideBar from '@/components/shared/SideBar';
import Invoice from '@/components/shared/Invoice';
import jsPDF from 'jspdf';
// import swal from 'sweetalert2'


const parseAmount = (amount) => parseFloat(amount.toPrecision(4));
const LINES_LENGTH = 12;

export default {
  mounted() {
    let storeDetails;
    // this.clearSalesId();
    if (!this.store) {
      this.getStoreDetails(
        ObjectToFormData({
          getloyaltysetting: 'getloyaltysetting',
        }
      ))
      .then((res) => {
        storeDetails = res.message[0];
        return this.getStoreDetails(
          ObjectToFormData({
            getsetup: 'getsetup',
          }
        ))
      })
      .then((_res) => {
        storeDetails = {
          ...storeDetails,
          ..._res.message[0],
        }
        this.SET_STORE_DETAILS(storeDetails);
      })
    }
    this.initForm(NEW_SALE);
  },
  mixins: [deleteMixin, filterMixin, validationMixin, MoneyMixin, AutoSaveMixin],
  data() {
    return {
      formKey: 'items',
      formPanelOpen: true,
      linesLength: 12,
      transaction: {
        tax: 0,
        salesid: null,
        payment: null,
        discount: 0,
        customer: null,
        paid: 0,
        completetrans: 'completetrans',
        loyalty: null,
        total: 0,
        subtotalTotal: 0,
        availableDiscount: null,
        customerDetails: null,
        discountTotal: 0,
        taxTotal: 0,
        branchid: null,
      },
      showingReciept: false,
      printReceipt: false,
      addingCustomer: false,
      fullScreenActive: false,
      loading: false,
      processing: false,
      hasPaid: false,
      items: {
        data: Array(LINES_LENGTH).fill(null),
      },
    };
  },
  validations: {
    transaction: {
      payment: { required },
    },
  },
  watch: {
    calculateTotal(val) {
      this.transaction = {
        ...this.transaction,
        total: val,
      };
    },
    items(newValue) {
      if (newValue.data.length < this.linesLength) {
        this.item.data.push(null);
      }
      if (newValue.data[0] && newValue.data[0].salesid && newValue.data[0].salesid != this.salesid) {
        this.SET_SALES_ID(newValue.data[0].salesid);
      }
    },
  },
  methods: {
    ...mapActions('sales', [
      'removeFromCart',
      'updateCart',
      'completeTransaction',
      'checkForThreshold',
      'clearSalesId',
      'updateOasBranchProducts',
    ]),
    ...mapActions('store', [
      'getStoreDetails',
    ]),
    ...mapMutations('store', [
      'SET_STORE_DETAILS',
    ]),
    ...mapMutations('sales', [
      'SET_SALES_ID',
    ]),
    print() {
      if (this.store && this.store.printout == 'reciept') {
        this.$electron.ipcRenderer.send('print')
      }
      // this.$refs.receipt.generateReceiptPdf();
    },
    useCreatedCustomer(data) {
      this.transaction = {
        ...this.transaction,
        customerDetails: data,
        customer: data.id,
      };
      this.closeDialog();
    },
    addCustomer() {
      this.fullScreenActive = true;
      this.addingCustomer = true;
    },
    updateDiscount(discount) {
      this.transaction.discount = discount;
      this.transaction.availableDiscount = discount;
    },
    proceedTransaction() {
      if (this.hasPaid) {
        if (this.store && this.store.printout == 'reciept') {
          this.printReceipt = true;
        } else {
          this.$refs.receipt.generateReceiptPdf();
        }
      } else if (!this.shouldProceedWithTransaction) {
        const message = 'Amount paid is insufficient';
        this.warnUser(message)
        .then((res) => {
          if (res.value) {
            this.sellItems();
          }
        })
        // .catch(() => {})
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
      this.resetTransaction();
      this.clearSalesId();
      clearInterval(window[`POS_${NEW_SALE}`]);
      this.initForm(NEW_SALE);
      this.hasPaid = false;
    },
    sellItems() {
      if (!this.$v.$invalid) {
        this.processing = true;
        this.completeTransaction(
          ObjectToFormData({
            ...this.transaction,
            salesid: this.salesid,
            branchid: this.currentBranch.id,
          }),
        ).then(res => {
          /**
           * without OAS integration 
           */
          this.handleSale(res);



          /** 
           * 
           * With OAS integration
           * 
          */
          // let _payload = this.filteredCartItems.map((i) => {
          //   return {
          //     issue_quantity: i.quantity, 
          //     pos_branch_id: parseInt(i.branchid),
          //     pos_product_id: i.selectedItem.id,
          //     pos_user_id: parseInt(this.currentUser.id),
          //   }
          // })
          // this.updateOasBranchProducts(_payload)
          // .then(() => {
          //   this.handleSale();
          // })
          // // .catch((err) => {
          //   clearAutoSavedForm(NEW_SALE);
          //   clearInterval(window[`POS_${NEW_SALE}`]);
          //   this.processing = false;
          //   this.$emit('action-complete');
          //   this.hasPaid = true;
          //   this.addingCustomer = false;
          //   this.printReceipt = true;
          //   // console.log(err.response);
          //   this.$snackbar.open({
          //     type: 'is-danger',
          //     message: `Could not save on OAS! ${err.response.data.message}`
          //   })
          
        });
      }
    },
    handleSale(res) {
      if (res.status === 'Success') {
        this.$snackbar.open(res.status + ' !' + res.message);
        this.$emit('action-complete');
        this.hasPaid = true;
        this.addingCustomer = false;
        if (this.store && this.store.printout == 'reciept') {
          this.printReceipt = true;
        } else {
          this.$refs.receipt.generateReceiptPdf();
        }
      } else {
        this.$snackbar.open(res.status);
      }
        clearAutoSavedForm(NEW_SALE);
        clearInterval(window[`POS_${NEW_SALE}`]);
        this.processing = false;
    },
    resetTransaction() {
      this.transaction = {
        tax: 0,
        salesid: null,
        payment: null,
        discount: 0,
        customer: null,
        paid: 0,
        completetrans: 'completetrans',
        loyalty: null,
        total: 0,
        availableDiscount: null,
        customerDetails: null,
        discountTotal: 0,
        taxTotal: 0,
        subtotalTotal: 0,
        branchid: null,
      };
      this.printReceipt = false;
      this.items.data = Array(this.linesLength).fill(null);
    },
    removePayment() {
      this.transaction = {
        ...this.transaction,
        ...{
          paid: 0,
          payment: null,
          discount: 0,
          tax: 0,
        },
      };
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
          this.removeFromCart(
            ObjectToFormData({
              cartid: item.cartid,
              removecartitem: 'removecartitem',
            }),
          )
          .then((res) => {
            if (res.status === 'Success') {
              this.updateDiscount();
              this.$snackbar.open('Removed item successfully');
              this.items.data.splice(this.items.data.indexOf(item), 1);
              let lineDiff = this.linesLength - this.items.data.length;
              if (lineDiff > 0 ) {
                this.items.data = this.items.data.concat(Array(lineDiff).fill(null));
              }
            }
          })
          .catch(err => {
            console.log(err);
            this.$snackbar.open({
              message: err.status,
              type: 'is-danger',
            });
          });
        }
      });
    },
    deleteItems() {},
    updateDiscount() {
      this.checkForThreshold(ObjectToFormData({
        checkforthreshold: 'checkforthreshold',
        salesid: this.salesid,
      }))
      .then((_res) => {
        this.transaction = {
          ...this.transaction,
          discount: _res.message.discount,
          availableDiscount: _res.message.discount,
        }
      })
    },
    updateQty(item) {
      this.updateCart(
        ObjectToFormData({
          cartid: item.cartid,
          quantity: item.quantity,
          updatecartitem: 'updatecartitem',
        }),
      ).then((res) => {
        if (res.status === 'Success') {
          this.updateDiscount();
          item.updated = false;
          this.$snackbar.open('Updated item quantity');
        }
      });
    },
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
    updateProductList(item) {
      let data = this.items.data;
      data.unshift(item);
      if (!data[data.length - 1]) {
        data.pop();
      }
    },
    calculateTax() {
      if (this.store) {
        this.transaction.tax = this.store.taxes.reduce((agg, tax) => {
          if (typeof tax === "object" && Object.keys(tax).length) {
            return agg + tax.value;
          }
          return agg;
        }, 0);
        return this.transaction.tax;
      }
      return 0;
    },
    ...{ formatDate, formatStatus, formatMoney, dateForHumans },
  },
  computed: {
    ...mapState('sales', ['salesid']),
    ...mapState('store', ['store']),
    ...mapState('users', ['currentUser']),
    ...mapState('branch', [
      'currentBranch',
    ]),
    unitPriceLabel() {
      return `Unit Price (${this.currencySymbol})`
    },
    totalLabel() {
      return `Total (${this.currencySymbol})`
    },
    filteredCartItems() {
      return this.items.data.filter(i => i);
    },
    customerFullname() {
      const { firstname, surname } = this.transaction.customerDetails || {};
      return `${firstname} ${surname}`
    },
    calculateTotal() {
      return this.items.data.reduce((agg, item) => {
        if (item) {
          const subTotal = Math.round(item.quantity * item.selectedItem.unitprice);
          return subTotal + agg;
        }
        return agg;
      }, 0);
    },
    change() {
      return parseAmount(
        Math.max((this.transaction.paid - this.transaction.total), 0)
      );
    },
    getTotal() {
      const subtotalTotal = this.calculateTotal;
      const discountTotal = parseAmount(Math.max(((this.transaction.discount / 100) * subtotalTotal), 0));
      const taxTotal = parseAmount(Math.max(((this.calculateTax() / 100) * subtotalTotal), 0));
      this.transaction = {
        ...this.transaction,
        subtotalTotal,
        discountTotal,
        taxTotal,
        total: Math.max((subtotalTotal - discountTotal) + taxTotal, 0),
      };
    },
    shouldProceedWithTransaction() {
      const difference = this.transaction.paid - this.transaction.total;
      return difference >= 0;
    },
    getCartItemsNumber() {
      return this.items.data.reduce((agg,i) => {
        if (i) {
          return agg + 1;
        }
        return agg;
      }, 0);
    },
  },
  components: {
    Loading,
    SalesForm,
    FullscreenDialog,
    InfiniteLoading,
    SelectCustomer,
    Reciept,
    CustomerForm,
    PaymentBar,
    EmptyState,
    // SideBar,
    Invoice,
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
// .action
//   position: fixed
//   right: 55px
//   top: 20px
//   font-size: 30px
//   color: white
//   cursor: pointer
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
