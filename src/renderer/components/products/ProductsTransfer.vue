<template lang="pug">
  .ProductTransfer(
    v-loading="processing", 
    element-loading-text="Transfering Items..."
  )
    .level.toolbar.shadow-divider
      .level-left
        .level-item 
          el-switch(
            :value="transferCart.source"
            active-text="Warehouse/Store"
            inactive-text="Branch"
            active-value="store"
            active-color="#000000"
            inactive-value="branch"
            @change="handleSourceChange"
          )
    .columns
      .column.is-9.transfer--cart
        div.border-right
          button.button.transfer-arrow-btn(
            @click="transferItemsToBranch",
            disabled
          )
            el-tooltip(
              class="item", 
              effect="dark", 
              content="Transfer to Branch", 
              placement="top-start"
            )
              i.material-icons navigate_next
          .level.toolbar
            .level-left
              .level-item
                .field.is-horizontal
                  .field-label.has-text-left.is-v-centered
                    label.label From:
                  .field-body
                    .field
                      el-select(
                        :value="transferCart.fromBranch",
                        filterable,
                        clearable,
                        placeholder="select branch",
                        remote,
                        @change="handleFromBranchChange"
                        :remote-method="loadBranchSuggestions",
                        :loading="loadingBranches",
                        no-data-text="No results!",
                        value-key="id",
                        size="small",
                        :disabled="shouldTransferFromStore"
                      )
                        el-option(
                          v-for="branch in branchSuggestions",
                          :value="branch",
                          :label="branch.name",
                          :key="branch.id"
                        )   
            .level-right.group
              .level-item
                el-select.productSelect(
                  :value="formatedValue"
                  :filterable="true"
                  :remote="true"
                  placeholder="Enter product name"
                  :remote-method="(e) => getProductSuggestions({ query: e })"
                  :fetchingProduct="fetchingProduct"
                  @change="selectProduct"
                  value-key="id"
                  clearable,
                  size="small",
                  :disabled="!transferCart.fromBranch && shouldTransferFromBranch"
                ) 
                  el-option(
                    v-for="(item, index) in productSuggestions"
                    :key="index"
                    :label="item.name"
                    :value="item"
                  )
                    el-tooltip(
                      class="item", 
                      effect="dark", 
                      :open-delay="1000", 
                      :content="item.name", 
                      placement="top-start"
                    )
                      span.sale-item.has-text-left {{ item.name }}
                    span.font-size-13.has-text-right(style="color: #8492a6; float: right;")
                      strong {{ getItemQty(item) }} QTY LEFT
              .level-item
                el-input.qty(
                  type="number",
                  v-model.number="transferItem.quantity",
                  :min="0",
                  size="small", 
                  placeholder="Qty", 
                  :max="maxTransferQty",
                  @input="resetQty"
                  controls-position="right"
                  :disabled="!transferCart.fromBranch && shouldTransferFromBranch"
                )
              .level-item
                button.button.is-primary(
                  @click="addToCart", 
                  :disabled="!transferItem.selectedItem.name || !transferItem.quantity", 
                )
                  span.icon
                    i.material-icons add
                  span Add Product                
          el-table.transfer--table(
            ref="items-table",
            :data="transferCart.products",
            :max-height="500",
            :height="430",
            :border="false"
            :highlight-current-row="true",
            @selection-change="handleSelectionChange",
            v-loading="refreshingProducts",
            element-loading-text="Please wait..."
            :stripe="true"
          )
            el-table-column(type="selection" fixed="left")
            el-table-column(label="No", type="index", :index="1" width="50" fixed="left")
              template(slot-scope="props", v-if="props.row")
                span {{ props.$index + 1 }}
            el-table-column(show-overflow-tooltip, label="Name", :min-width="200")
              template(slot-scope="scope" v-if="scope.row")
                el-input(
                  disabled,
                  :value="scope.row.name",
                  size="mini",
                )
            el-table-column(label="Qty", width="200", show-overflow-tooltip)
              template(slot-scope="props" v-if="props.row")
                el-input-number(
                  v-model="props.row.quantity",
                  placeholder="Enter Quantity",
                  controls-position="right",
                  size="mini",
                  @change="updateSubtotal(props.row, $event)",
                  :min="0"
                  :max="parseInt(props.row.quantityInStock)",
                )
            el-table-column(label="Qty Left", width="200", show-overflow-tooltip)
              template(slot-scope="props" v-if="props.row")
                el-input-number(
                  :value="props.row.quantityInStock",
                  placeholder="Enter Quantity",
                  controls-position="right",
                  size="mini",
                  disabled
                )
            el-table-column(show-overflow-tooltip, :label="unitPriceLabel", width="200")
              template(slot-scope="scope" v-if="scope.row")
                el-input-number(
                  :value="scope.row.unitprice",
                  placeholder="Enter Unit price",
                  controls-position="right",
                  disabled,
                  size="mini"
                )
            el-table-column(label="Actions", :render-header="renderDelete", width="70", fixed="right")
              template(slot-scope="props", v-if="props.row")
                button.button(:class="$style.trash" @click="removeItemFromTransferCart(props.row)")
                  span.el-icon-delete.font-size-23
        button.button.ml-10.mt-10.is-primary.is-medium(
          @click="transferItemsToBranch",
          :disabled="$v.$invalid"
        )
          span.material-icons local_shipping
          span Transfer
      .column.is-3
        .level.toolbar
          .level-left
            .level-item
              .field.is-horizontal
                  .field-label.has-text-right.is-v-centered
                    label.label To:
                  .field-body
                    .field 
                      el-select(
                        :value="transferCart.toBranch",
                        filterable,
                        clearable,
                        placeholder="select branch",
                        remote,
                        :remote-method="loadBranchSuggestions",
                        :loading="loadingBranches",
                        @focus="branchSuggestions = []",
                        @change="handleToBranchChange"
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
        EmptyState.emptyState(
          empty-text="Select a branch to transfer the products!", 
          v-if="!transferCart.toBranch"
        )
        div(v-else)
          p.has-text-centered.mt-25
            span.tag.is-6.title.is-dark {{ transferCart.toBranch.name }}
          div.mt-35
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Transfer ID:
              .field-label.is-normal
                label.label.is-pulled-left.has-text-weight-normal.tag {{ transferid }}             
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapMutations } from 'vuex'
import deleteMixin from '@/mixins/DeleteMixin'
import filterMixin from '@/mixins/FilterMixin'
import { validationMixin } from 'vuelidate'
import { required, minValue } from 'vuelidate/lib/validators'
import EmptyState from '@/components/EmptyState'
import MoneyMixin from '@/mixins/MoneyMixin'

/* eslint-disable */
export default {

  data() {
    return {
      transferItem: {
        selectedItem: {
          name: '',
        },
        quantityInStock: null,
        quantity: null,
      },
      transferItems: [],
      fetchingProduct: false,
      loadingBranches: false,
      refreshingProducts: false,
      processing: false,
      productSuggestions: [],
      branchSuggestions: []
    }
  },

  components: {
    EmptyState,
  },

  mixins: [
    deleteMixin,
    filterMixin,
    MoneyMixin,
    validationMixin
  ],

  validations: {
    selectedItems: {
      required,
      $each: {
        quantity: {
          required,
          minValue: minValue(1)
        }
      }
    },
    transferCart: {
      toBranch: { required }
    }
  },

  mounted () {
    this.RESET_TRANSFER_CART()

    if (!this.transferid) {
      this.generateTransferId();
    }
    // this.branchSuggestions = [
    //   this.transferCart.toBranch,
    //   this.transferCart.fromBranch
    // ]
  },

  methods: {

    ...mapActions('sales', [
      'completeTransaction',
      'generateTransferId',
      'setTransferCart',
      'transferProductsToBranch'
    ]),

    ...mapActions('products', [
      'loadProducts',
    ]),
    
    ...mapMutations('sales', [
      'RESET_TRANSFER_CART',
      'REMOVE_TRANSFER_CART_ITEM'
    ]),

    ...mapActions('branch', [
      'loadBranches'
    ]),

    resetQty (v) {
      if (v > this.maxTransferQty) {
        this.$nextTick(vm => {
          this.$snackbar.open({
            type: 'is-warning',
            message: 'Selected qty exceeded maximum qty !!'
          })
          this.transferItem.quantity = this.maxTransferQty
        })
      }
    }, 

    handleSourceChange (value) {
      this.productSuggestions = this
      .productSuggestions
      .filter(p => p.branch)

      this.setTransferCart({ 
        ...this.transferCart,
        source: value 
      })

      if (this.shouldTransferFromStore) {
        this.resetQty(this.transferItem.quantity)
      } 

      if (this.shouldTransferFromBranch) {
        this.resetTransferItem()
      }

      this.RESET_TRANSFER_CART()
    },

    refreshTransferCartItems (data = []) {
      return this.transferCart.products
      .slice()
      .map(p => {
        let quantityInStock = 0
        let foundTransferCartItem

        if (p) {
          foundTransferCartItem = data.find(i => {
            return i.id === p.id
          })
        }

        if (foundTransferCartItem) {
          quantityInStock = this.shouldTransferFromBranch 
          ? +foundTransferCartItem.branch.quantity
          : +foundTransferCartItem.quantity
        }

        return p && {
          ...p,
          quantity: 0,
          quantityInStock,
          quantity_to_transfer: 0
        }
      })
    },

    handleFromBranchChange (value) {
      this.resetTransferItem()

      this.setTransferCart({
        ...this.transferCart,
        fromBranch: value
      })

      if (!value) return

      this.refreshingProducts = true

      this.getProductSuggestions({ 
        ids: JSON.stringify(this.transferCartProductIDS),
        branch: value
      })
      .then((res) => {
        this.refreshingProducts = false
        const products = this.refreshTransferCartItems(res)

        this.setTransferCart({ 
          ...this.transferCart,
          products
        })

      })
      .catch((err) => {
        this.refreshingProducts = false
      })
    },

    handleToBranchChange (value) {
      this.setTransferCart({ 
        ...this.transferCart,
        toBranch: value 
      })
    },

    getItemQty (item) {
      if (this.shouldTransferFromBranch) {
        return item.branch.quantity
      }
      return +item.quantity
    },

    updateSubtotal (item, newQty) {
      let products = this.transferCart.products.slice()
      products = products.map((_item) => {
        if (_item && _item.id === item.id) {
          return {
            ...item,
            quantity: newQty,
            quantity_to_transfer: newQty,
          }
        }
        return _item
      })
      this.setTransferCart({ ...this.transferCart, products })
    },

    processPayload () {
      return {
        source: this.transferCart.source,
        data: this.selectedItems
        .filter(p => p)
        .map(p => ({
          transfer_id: p.transfer_id,
          store_id: p.store_id,
          user_id: this.settings.loggedInUser.id,
          source_branch_id: this.shouldTransferFromBranch
          ? this.transferCart.fromBranch.id
          : null,
          destination_branch_id: this.transferCart.toBranch.id,
          product_id: p.product_id,
          quantity_to_transfer: p.quantity_to_transfer
        }))
      }
    },

    transferItemsToBranch() {
      if (!this.$v.$invalid) {
        const payload = this.processPayload()

        this.processing = true;

        this.transferProductsToBranch(payload)
        .then(res => {
          this.$swal({
            type: 'success',
            title: 'Trasfer Complete'
          })

          return this.getProductSuggestions({ 
            ids: JSON.stringify(this.transferCartProductIDS),
            branch: this.transferCart.fromBranch
          })
        })
        .then((res) => {
          this.refreshingProducts = false
          const products = this.refreshTransferCartItems(res)

          this.setTransferCart({ 
            ...this.transferCart,
            products,
            toBranch: null
          })

          this.processing = false
        })
        .catch((err) => {
          this.$snackbar.open({
            type: 'is-danger',
            message: err.message,
          })
          this.processing = false;
        });
      }
    },


    resetTransferItem() {
      this.transferItem = {
        selectedItem: {
          name: '',
        },
        quantityInStock: null,
        quantity: null
      };
      this.productSuggestions = []
    },

    filterProductSuggestions (data) {
      return data.filter((s) => {
        if (this.transferCart.products.length) {
          return !this.transferCartItemNames.includes(s.name)
        }
        return false
      });
    },

    addToCart() {
      let { 
        selectedItem: product, 
        quantity 
      } = this.transferItem

      product = {
        ...product,
        transfer_id: this.transferid,
        store_id: this.settings.store.id,
        source_id: this.settings.store.id,
        product_id: product.id,
        quantity_to_transfer: quantity,
        quantity,
        quantityInStock: this.shouldTransferFromBranch 
        ? +product.branch.quantity
        : +product.quantity
      }

      delete product.branches

      const products = [
        product,
        ...this.transferCart.products
      ]

      this.setTransferCart({
        ...this.transferCart,
        transferid: this.transferid,
        products
      })
      
      this.resetTransferItem()
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

    deleteItems () {
      this.warnUser().then((res) => {
        if (res.value) {
          this.REMOVE_TRANSFER_CART_ITEM(this.selectedItems)
          this.$snackbar.open('Removed item successfully')
        }
      })
    },

    loadBranchSuggestions(query) {
      if (query) {
        this.loadingBranches = true;
        this.loadBranches({
          name: query,
          store_id: this.settings.store.id
        }).then((res) => {
          const selectedBranchesIDs = [
            this.transferCart.toBranch,
            this.transferCart.fromBranch
          ]
          .filter(b => b)
          .map(b => b.id)
          this.branchSuggestions = res.data.filter(d => !selectedBranchesIDs.includes(d.id))
          this.loadingBranches = false;
        }).catch(() => {
          this.loadingBranches = false;
        });
      }
    },

    selectProduct(item) {

      let { id, quantity: quantityInStock } = item;

      this.transferItem = {
        ...this.transferItem,
        ...{
          quantityInStock,
          transferid: this.transferid,
          selectedItem: item
        }
      }

      if (this.transferItem.quantity) {
        this.resetQty(this.transferItem.quantity)
      }

    },

    removeItemFromTransferCart (item) {
      this.warnUser().then((res) => {
        if (res.value) {
          this.REMOVE_TRANSFER_CART_ITEM(item)
          this.$snackbar.open('Removed item successfully')
        }
      })
    },

    getFromBranchId (branch) {
      if (branch) return branch.id

      if (this.shouldTransferFromBranch) {
        return this.transferCart.fromBranch.id
      }

      return null
    },  

    getMaxQty (ITEM) {
      if (this.shouldTransferFromStore) {
        return +ITEM.quantity
      }
      return ITEM.branch && +ITEM.branch.quantity
    },

    getProductSuggestions(data) {
      this.fetchingProduct = true;

      let payload = {
        name: data.query,
        ids: data.ids,
        store_id: this.settings.store.id,
        branch_id: this.getFromBranchId(data.branch)
      };

      return this.loadProducts(payload)
      .then(({ data }) => {
        this.fetchingProduct = false;
        this.productSuggestions = this.filterProductSuggestions(data)
        return data
      })
      .catch(() => {
        this.fetchingProduct = false;
      })

    }

  },

  computed: {

    ...mapState('sales', [
      'transferid',
      'transferCart'
    ]),

    ...mapState('settings', [
      'settings'
    ]),

    shouldTransferFromBranch () {
      return this.transferCart.source === 'branch'
    },

    shouldTransferFromStore () {
      return this.transferCart.source === 'store'
    },

    transferCartItemNames() {
      if (this.transferCart.products.length) {
        return this.transferCart.products.map(i => i && i.name);
      }
      return [];
    },

    maxTransferQty () {
      const ITEM = this.transferItem.selectedItem
      return this.getMaxQty(ITEM)
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

    transferCartProductIDS () {
      return this.transferCart.products
      .map(p => p && p.id)
      .filter(p => p)
    },

    formatedValue() {
      if (this.transferItem.selectedItem.name) {
        return this.transferItem.selectedItem.name.length > 45
          ? `${this.transferItem.selectedItem.name.substring(0, 45)}...`
          : this.transferItem.selectedItem.name;
      }
      return '';
    },
  },
}
</script>

<style lang="sass">
.ProductTransfer
  height: 550px
  border-bottom: 1px solid #ebeef5 !important
  .el-tabs--card > .el-tabs__header .el-tabs__nav
    border-top: 0px
  .transfer--table
    z-index: 5
  .productSelect
    width: 300px
  .level-right.group
    .el-input.qty
      width: 100px !important
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
  .level-right.group .level-item, .level-right.group .level-item
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
.is-primary
  background-color: #05296b !important
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
