<template lang="pug">
  .MaterialView.shadow-divider
    FullscreenDialog(
      v-close="closeDialog", 
      @closed="closeDialog", 
      :active.sync="fullScreenActive"
    )
      CustomerForm.page-forms(
        ref="customer-form",
        :class="$style.pageForms",
        @close-form="closeDialog",
        :_customer="selectedCustomer"
      )
    .level.toolbar
      .level-left
        .level-item
          router-link.button(:to="{name: 'customers_list'}")
            span.icon.is-medium
              i.material-icons keyboard_arrow_left
        .level-item(v-if="selectedCustomer")
          .page-title.subtitle.is-6
            span.mr-5 Viewing Customer
            span.tag.is-medium.is-warning {{ fullname }}
      .level-right
        .level-item
          .field.has-addons
            p.control
              JsonExcel(
                class="btn btn-default",
                :data="selectedCustomerSales.data",
                :fields="json_fields",
                :name="documentName",
                type="xlsx",
                v-if="selectedCustomerSales"
              )
                button.button.is-primary(:disabled="disablePurchaseHistory")
                  span Download Purchase history
        .level-item
          .field.has-addons
            p.control
              button.button(@click="fullScreenActive = !fullScreenActive")
                span.icon
                  i.material-icons edit
                span Edit Information
    Loading(
      loading-text="Loading customer information", 
      v-if="isLoading", 
      :style="{ height: '400px' }"
    )
    el-tabs(v-model="currentTab", value='summary', type="card", v-if="!isLoading")
      el-tab-pane(name="details", label='Customer Details')
        .columns(:class="$style.columns" v-if="selectedCustomer")
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Email: 
              .field-label.is-normal
                label.label.is-pulled-left 
                  | {{ parseColData(selectedCustomer.email) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Fullname:
              .field-label.is-normal
                label.label.is-pulled-left.is-capitalized  
                  | {{ fullname }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Phone No.:
              .field-label.is-normal
                label.label.is-pulled-left 
                  | {{ parseColData(selectedCustomer.phone) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label.is-capitalized
                  strong  Address: 
              .field-label.is-normal.is-capitalized
                label.label.is-pulled-left 
                  | {{ parseColData(selectedCustomer.address) }}
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong ID:
              .field-label.is-normal
                label.label.is-pulled-left 
                  | {{ parseColData(selectedCustomer.id) }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Marital status:
              .field-label.is-normal
                label.label.is-pulled-left.is-capitalized  
                  | {{ parseColData(selectedCustomer.marital_status) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label.is-capitalized
                  strong Card Number: 
              .field-label.is-normal
                label.label.is-pulled-left.is-capitalized 
                  | {{ parseColData(selectedCustomer.cardnumber) }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Gender:
              .field-label.is-normal          
                label.label.is-pulled-left.is-capitalized 
                  | {{ parseColData(selectedCustomer.gender) }}
                   
        .mt-30
          h5.title.is-5.has-text-centered Purchase history
          el-table(
            v-loading="isLoadingSales"
            :data="filteredItemsData",
            :empty-text="emptyText",
            :max-height="300"
          )
            el-table-column(label="No", type="index", :index="1")
            el-table-column(prop="customerOrder.customer.full_name", show-overflow-tooltip, label="Customer name")
            el-table-column(prop="sales_id", show-overflow-tooltip, label="Sales ID")
            el-table-column(prop="sub_total", show-overflow-tooltip, label="Total")
            el-table-column(prop="quantity", show-overflow-tooltip, label="Qty")
            el-table-column(prop="payment_type", show-overflow-tooltip, label="Payment type")
            el-table-column(prop="unit_price", show-overflow-tooltip, label="Unit price")   
            el-table-column(prop="user.full_name", show-overflow-tooltip, label="Sold by")     
            el-table-column(show-overflow-tooltip, label="Sold at")  
              template(slot-scope="props")
                span {{ formatDate(props.row.created_at)}}
            div(slot="append" v-show="showLoading")
              div(ref='loader' style="height: 45px")
                infinite-loading(spinner="waveDots" v-if="loading")   
</template>

<script>
/* eslint-disable */
import EmptyState from '@/components/EmptyState'
import { formatDate, formatMoney, dateForHumans } from '@/filters/format'
import { mapActions, mapState, mapMutations } from 'vuex'
import CustomerForm from '@/components/customers/CustomerForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import Loading from '@/components/shared/Loading'
import JsonExcel from 'vue-json-excel'
import InfiniteLoading from 'vue-infinite-loading'
import filterMixin from '@/mixins/FilterMixin'
import { parseColData } from '@/utils/helper'

export default {

  mixins: [filterMixin],

  data() {
    return {
      isEditing: false,
      editMat: false,
      isSavingAssessment: false,
      previewingDoc: false,
      selectedMaterials: [],
      isLoading: false,
      editRemarks: false,
      fullScreenActive: false,
      currentTab: 'details',
      isLoadingSales: false,
      json_fields : {
        Customer: 'customerOrder.customer.full_name',
        Total: 'sub_total',
        // Discount: 'discount',
        // profit:  'profit',
        // Tax: 'tax',
        'Sales ID': 'sales_id',
        'Sold by': 'user.full_name',
        'Payment method': 'payment_type',
        'Sold at': 'created_at',
      },
      filter: {
        aggregate: 0,
        with_user: 1
      }
    }
  },

  mounted() {
    this.clearSelectedCustomer()
    this.isLoading = true
    this.loadCustomer({
      id: this.$route.params.id,
    })
    .then(() => {
      this.isLoading = false
      this.isLoadingSales = true
      this.filter = {
        ...this.filter,
        customer_id: this.selectedCustomer.id
      }
      return this.preloadItemsList()
    })
    .then((res) => {
      this.isLoadingSales = false
      this.handleBottomScroll()
      this.setSelectedCustomerSales(res.body)
    })
    .catch((err) => {
      console.log(err)
      this.$snackbar.open({
        message: 'Could not find a Customer with that ID',
        type: 'is-danger',
      })
      this.isLoading = false
      this.isLoadingSales = false
      this.$router.push({ name: 'customers_list'})
    })
  },

  components:{
    EmptyState,
    Loading,
    CustomerForm,
    FullscreenDialog,
    InfiniteLoading,
    JsonExcel
  },

  methods: {

    ...{ formatDate, dateForHumans },

    ...mapActions('customers', [
      'loadCustomer',
      'clearSelectedCustomer',
      'setSelectedCustomerSales',
    ]),

    ...mapMutations('customers', [
      'SET_SELECTED_CUSTOMER',
    ]),

    ...mapActions('sales', {
      loadItems: 'loadSales'
    }),

    closeDialog() {
      this.fullScreenActive = false
    },

    ...{ parseColData },

  },

  computed: {

    ...mapState('customers', [
      'selectedCustomer',
    ]),

    disablePurchaseHistory () {
      return !this.selectedCustomerSales || 
      !(this.selectedCustomerSales.data && 
      this.selectedCustomerSales.data.length)
    },

    fullname() {
      return (this.selectedCustomer && this.selectedCustomer.full_name) || '-'
    },

    selectedCustomerSales () {
      return this.selectedCustomer && this.selectedCustomer.sales || {}
    },

    documentName() {
      if (this.selectedCustomer) {
        return `${this.selectedCustomer.full_name}'s purchase history`
      }
      return null
    },

    emptyText() {
      return `${this.fullname} has not purchased anything yet`
    },

    setItems (res) {
      const { data } = res.body
      const salesHistory = {
        ...res.body,
        data: this.items.data.concat(data)
      }
      this.setSelectedCustomerSales(salesHistory)
    }

  },

  watch: {

    selectedCustomerSales (value) {
      this.items = value
    }

  }
}
</script>

<style lang="sass" scoped>
// .field-label
//   text-align: left !important
.label  
  font-weight: 100
.shadow-divider
  box-shadow: 0px 0px 4px 0 rgba(0, 0, 0, 0.08) inset !important
  min-height: 560px !important  
</style>

<style lang="sass">
// .el-table__body-wrapper
//   overflow-x: hidden
.el-progress
  padding: 25px
  position: absolute
  top: 5%
  z-index: 23
  width: 100%  
</style>

<style lang="sass" module> 
.columns
  margin: 20px 50px 10px 50px
.trash
  border: none
  background: transparent    
</style>
