<template lang="pug">
  .ProductTransfer(v-loading="processing", element-loading-text="Transfering Items...")
    .columns
      .column.is-9.border-right.transfer--cart
        button.button.transfer-arrow-btn(:disabled="!canTransferProducts" @click="transferItemsToBranch")
          el-tooltip(class="item" effect="dark", content="Transfer to Branch" placement="top-start")
            i.material-icons navigate_next
        .level.toolbar
          .level-left
            .level-item
              h5.title.is-6.has-text-weight-normal Transfer Products ({{ getCartItemsNumber }})
          .level-right.group
            .level-item
              el-select.productSelect(
                :value="formatedValue"
                :filterable="true"
                :remote="true"
                placeholder="Enter product name"
                :remote-method="getProductSuggestions"
                :fetchingProduct="fetchingProduct"
                @change="selectProduct"
                :value-key="transferItem.selectedItem.id"
                clearable,
                size="small"
              )
                el-option(
                  v-for="(item, index) in suggestions"
                  :key="index"
                  :label="item.name"
                  :value="item"
                )
                  el-tooltip(class="item" effect="dark", :open-delay="1000", :content="item.name" placement="top-start")
                    <span class="sale-item" style="float: left">{{ item.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">
                    <strong>{{ item.quantity }} QTY LEFT</strong>
                  </span>
            .level-item
              el-input(type="number", v-model="transferItem.quantity", :min="1", size="small", placeholder="Qty" :max="10")
            .level-item
              button.button.is-primary(@click="add_to_cart", :disabled="addingToCart || !transferItem.product3", :class="{ 'is-loading': addingToCart }")
                span.icon
                  i.material-icons add
                span Add Product
        el-table.transfer--table(
          ref="items-table",
          :data="filteredItemsData",
          :max-height="500",
          :height="430",
          :border="false"
          :default-sort="{prop: 'created_at', order: 'descending'}",
          :highlight-current-row="true",
          @selection-change="handleSelectionChange",
          :stripe="true"
        )
          el-table-column(type="selection" fixed="left")
          el-table-column(label="No", type="index", :index="1" width="50" fixed="left")
            template(slot-scope="props" v-if="props.row")
              span {{ props.$index + 1 }}
          el-table-column(prop="selectedItem.name", show-overflow-tooltip, label="Name", :min-width="200" align="left")
            template(slot-scope="scope" v-if="scope.row")
              span.font-size-12 {{ scope.row.selectedItem.name }}
          el-table-column(prop="quantity" label="Qty", align="left", width="200" show-overflow-tooltip)
            template(slot-scope="props" v-if="props.row")
              el-input-number(
                v-model="props.row.quantity",
                placeholder="Enter Quantity",
                controls-position="right",
                size="mini",
                @change="props.row.updated = true",
                :min="1"
                :max="parseInt(props.row.quantityInStock)",
              )
          el-table-column(prop="selectedItem.unitprice", show-overflow-tooltip, :label="unitPriceLabel", width="200" align="left")
            template(slot-scope="scope" v-if="scope.row")
              span.font-size-12 {{ scope.row.selectedItem.unitprice }}
          el-table-column(align="left", width="150")
            template(slot-scope="props", v-if="props.row")
              button.button.is-primary.is-small(@click="updateQty(props.row)", :disabled="!props.row.updated")
                i.material-icons.updateCartBtn.mr-5 done_all
                span Update Qty
          el-table-column(label="Actions", :render-header="renderDelete", width="70", fixed="right")
            template(slot-scope="props", v-if="props.row")
              button.button(:class="$style.trash" @click="removeItemFromCart(props.row)")
                i.material-icons delete
      .column.is-3
        .level.toolbar
          .level-left
          .level-item
            div
              el-select(
                v-model="transaction.selectedBranch",
                filterable,
                clearable,
                placeholder="select branch",
                remote,
                :remote-method="_loadBranches",
                :loading="loadingBranches",
                no-data-text="No results!",
                value-key="id",
                size="small",
              )
                el-option(
                  v-for="branch in branchSuggestions",
                  :value="branch",
                  :label="branch.name",
                  :key="branch.id"
                )
          .level-right
        EmptyState.emptyState(empty-text="Select a branch to transfer the products!" v-if="!transaction.selectedBranch")
        div(v-else)
          p.has-text-centered.mt-25
            span.tag.is-6.title.is-dark {{ transaction.selectedBranch.name }}
          div.mt-35
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Transfer ID:
              .field-label.is-normal
                label.label.is-pulled-left.has-text-weight-normal.tag {{ transferid }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Total:
              .field-label.is-normal
                label.label.is-pulled-left.has-text-weight-normal.tag  {{ money(calculateTotal) }}
</template>

<script>
import { mapState, mapActions } from 'vuex'
import deleteMixin from '@/mixins/DeleteMixin'
import filterMixin from '@/mixins/FilterMixin'
import { ObjectToFormData } from '@/utils/helper'
import EmptyState from '@/components/EmptyState'
import MoneyMixin from '@/mixins/MoneyMixin'
import _ from 'lodash'

// const LINES_LENGTH = 8

/* eslint-disable */
export default {
  data() {
    return {
      transferItem: {
        selectedItem: {
          name: '',
        },
        product3: null,
        quantityInStock: null,
        quantity: null,
        addtocart: 'addtocart',
        branchid: 0,
        user: null,
      },
      transaction: {
        tax: 0,
        salesid: null,
        payment: 'cash',
        discount: 0,
        customer: null,
        paid: 0,
        completetrans: 'completetrans',
        loyalty: null,
        total: 0,
        subtotalTotal: 0,
        availableDiscount: 0,
        customerDetails: null,
        selectedBranch: null,
        discountTotal: 0,
        taxTotal: 0,
        branchid: 0,
      },
      transferItems: [],
      fetchingProduct: false,
      loadingBranches: false,
      addingToCart: false,
      processing: false,
      printReceipt: false,
      suggestions: [],
      branchSuggestions: [],
      items: {
        // data: Array(LINES_LENGTH).fill(null),
        data: [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ],
      },
    }
  },
  components: {
    EmptyState,
  },
  mixins: [deleteMixin, filterMixin, MoneyMixin],
  mounted() {
    if (!this.transferid) {
      this.generateTransferId();
    }
  },
  methods: {
    ...mapActions('sales', [
      'removeFromCart',
      'updateCart',
      'completeTransaction',
      'clearTransferId',
      'generateTransferId',
      'addToCart',
    ]),
    ...mapActions('products', [
      'loadProducts',
    ]),
    ...mapActions('branch', [
      'loadBranches',
      'searchBranches',
    ]),
    transferItemsToBranch() {
      // if (!this.$v.$invalid) {
        this.processing = true;
        this.completeTransaction(
          ObjectToFormData({
            ...this.transaction,
            customer: this.transaction.selectedBranch.id,
            paid: this.calculateTotal,
            salesid: this.transferid,
            branchid: 0,
          }),
        ).then(res => {
          if (res.status === 'Success') {
            this.$snackbar.open(res.status + ' !' + res.message);
            // this.$emit('action-complete');
            // this.hasPaid = true;
            // this.addingCustomer = false;
            this.printReceipt = true;
            this.resetTransaction();
          } else {
            this.$snackbar.open(res.status);
            this.resetTransaction();
          }
          this.processing = false;
        }).catch((err) => {
          this.$snackbar.open({
            type: 'is-danger',
            message: err,
          })
          this.processing = false;
        });
      // }
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
        availableDiscount: 0,
        customerDetails: null,
        selectedBranch: null,
        discountTotal: 0,
        taxTotal: 0,
        subtotalTotal: 0,
        branchid: 0,
      };
      this.printReceipt = false;
      // this.items.data = Array(LINES_LENGTH).fill(null);
      this.items.data = [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ];
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
          // this.updateDiscount();
          item.updated = false;
          this.$snackbar.open('Updated item quantity');
        }
      });
    },
    resetTransferItem() {
      this.transferItem = {
        selectedItem: {
          name: '',
        },
        product3: null,
        quantityInStock: null,
        quantity: null,
        addtocart: 'addtocart',
        branchid: 0,
        user: null,
      };
      this.suggestions = []
    },
    add_to_cart() {
      // if (!this.$v.$invalid) {
        this.addingToCart = true;
        this.addToCart(ObjectToFormData(
          {
            ...this.transferItem,
            salesid: this.transferid,
          }
        )).then((res) => {
          if (res.status === 'Success') {
            // this.checkForThreshold(ObjectToFormData({
            //   checkforthreshold: 'checkforthreshold',
            //   salesid: this.salesid,
            // })).then((_res) => {
              this.$snackbar.open(res.status + '! Added to cart');
              // this.$emit('action-complete', { ...this.sale, ...{ cartid: res.cartid, updated: false }});
              this.updateProductList({
                ...this.transferItem,
                ...{ cartid: res.cartid, updated: false }
              });
              // this.$emit('discount', _res.message.discount);
              this.addingToCart = false;
              this.resetTransferItem();
              
            // })
          }
          else {
            this.$snackbar.open(res.status + 'out of stock');
            this.addingToCart = false;
          }
        })
      // }
    },
    warnUser(warning) {
      return this.$swal({
        text: warning || 'Do you want to remove selected item(s) ?',
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
              // this.updateDiscount();
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
    _loadBranches(query) {
      if (query !== '') {
        this.loadingBranches = true;
        this.searchBranches({
          search: query,
          type: 'branch',
        })
        .then((res) => {
          this.branchSuggestions = res;
          this.loadingBranches = false;
        })
        .catch(() => {
          this.loadingBranches = false;
        });
      }
    },
    updateProductList(item) {
      let data = this.items.data;
      data.unshift(item);
      if (!data[data.length - 1]) {
        data.pop();
      }
    },
    selectProduct(item) {
      let { id, quantity: quantityInStock } = item;
      this.transferItem = {
        ...this.transferItem,
        ...{
          product3: id,
          quantityInStock,
          user: this.currentUser.username,
          salesid: this.transferid,
          selectedItem: item,
          branchid: 0
        }};
    },
    getProductSuggestions(query) {
      if (query !== '') {
        this.fetchingProduct = true;
        let payload = {
          search: query,
          type: 'product',
          branchid: 0,
        };
        this.loadProducts(payload)
        .then((suggestions) => {
          this.fetchingProduct = false;
           this.suggestions = _.flatMap(suggestions).filter((s) => {
            if (this.filteredCartItems.length) {
              return !this.filteredCartItems.map(i => i.selectedItem.name).includes(s.name);
            }
            return true;
          });
        })
        .catch(() => {
          this.fetchingProduct = false;
        });
      } else {
        this.suggestions = [];
      }
    },
  },
  computed: {
    ...mapState('sales', ['transferid']),
    ...mapState('branch', [
      'currentBranch',
    ]),
    ...mapState('users', [
      'currentUser',
    ]),
    filteredCartItems() {
      if (this.items.length) {
        return this.items.data.filter(i => i);
      }
      return [];
    },
    canTransferProducts() {
      // return this.getCartItemsNumber && this.transaction.selectedBranch;
      return this.getCartItemsNumber && this.transaction.selectedBranch;
    },
    unitPriceLabel() {
      if (this.currencySymbol) {
        return `Unit Price (${this.currencySymbol})`;
      } 
      return 'Unit Price';
    },
    totalLabel() {
      if (this.currencySymbol) {
        return `Total (${this.currencySymbol})`
      }
      return 'Total';
    },
    calculateTotal() {
      if (this.items.data.length) {
        return this.items.data.reduce((agg, item) => {
          if (item) {
            const subTotal = Math.round(item.quantity * item.selectedItem.unitprice);
            return subTotal + agg;
          }
          return agg;
        }, 0);
      }
      return 0;
    },
    getCartItemsNumber() {
      if (this.items.data.length) {
        return this.items.data.reduce((agg,i) => {
          if (i) {
            return agg + 1;
          }
          return agg;
        }, 0);
      }
      return 0;
    },
    formatedValue() {
      if (this.transferItem.selectedItem.name) {
        return this.transferItem.selectedItem.name.length > 61
          ? this.transferItem.selectedItem.name.substring(0, 61) + '...'
          : this.transferItem.selectedItem.name;
      }
      return '';
    },
  },
}
</script>

<style lang="sass">
.ProductTransfer
  height: 500px
  margin-top: 10px
  border-bottom: 1px solid #ebeef5 !important
  .transfer--table
    z-index: 5
  .productSelect
    width: 300px
  .level-right.group
    .el-select, input
      border-radius: 0px;
      border-left: none;
      border-right: none;
    .el-input__inner:focus
      outline: none;
      border-color: #dcdfe6;
  .level-right.group .level-item:first-of-type
    .el-input__inner
      border: 1px solid #dcdfe6
    .el-select, input, button
      border-top-right-radius: 0px;
      border-bottom-right-radius: 0px;
      border-top-left-radius: 3px;
      border-bottom-left-radius: 3px;
  .level-right.group .level-item:last-of-type
    .el-input__inner
      border: 1px solid #dcdfe6
    .el-select, input, button
      border-top-left-radius: 0px;
      border-bottom-left-radius: 0px;
  .level-right.group .level-item
    margin: 0px
    padding: 0px
  .transfer--cart
    position: relative
    padding-right: 0px !important
  .columns
    height: 100%
  .border-right
    border-right: 1px solid #ebeef5 !important
  .transfer-arrow-btn
    border-radius: 100%;
    height: 90px;
    width: 90px;
    position: absolute;
    right: -28px;
    top: 230px;
    z-index: 4;
    background-color: #05296b;
    color: white;
    border: none;
    i
     position: absolute;
     right: 0px;
</style>

<style lang="sass" scoped>
.emptyState
  font-size: 12px
  height: 400px
  width: 100%
.updateCartBtn
  font-size: 15px !important
</style>


<style lang="sass" module>
.columns
  margin: 0px 50px
.trash
  border: none
  background: transparent
</style>
