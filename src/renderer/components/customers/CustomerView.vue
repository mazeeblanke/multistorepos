<template lang="pug">
  .MaterialView.shadow-divider
    FullscreenDialog(v-close="closeDialog", @closed="closeDialog", :active.sync="fullScreenActive")
      CustomerForm.page-forms(
        ref="customer-form",
        :class="$style.pageForms",
        @close-form="closeDialog",
        :_customer="selectedCustomer",
        @action-complete="updateCustomer",
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
                :data="sales",
                :fields="json_fields",
                :name="documentName",
                type="xlsx",
                v-if="selectedCustomer"
              )
                button.button.is-primary(:disabled="sales.length")
                  //- span.icon
                  //-   i.material-icons edit
                  span Download Purchase history
        .level-item
          .field.has-addons
            p.control
              button.button(@click="fullScreenActive = !fullScreenActive")
                span.icon
                  i.material-icons edit
                span Edit Information
    Loading(loading-text="Loading customer information" v-if="isLoading", :style="{ height: '400px' }")
    el-tabs(v-model="currentTab", value='summary', type="card", v-if="!isLoading")
      el-tab-pane(name="details", label='Customer Details')
        .columns(:class="$style.columns" v-if="selectedCustomer")
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Fullname:
              .field-label.is-normal
                label.label.is-pulled-left  {{ fullname }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Email: 
              .field-label.is-normal
                label.label.is-pulled-left  {{ parseColData(selectedCustomer.email) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Address: 
              .field-label.is-normal
                label.label.is-pulled-left {{ parseColData(selectedCustomer.address1) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Phone No.:
              .field-label.is-normal
                label.label.is-pulled-left {{ parseColData(selectedCustomer.phone) }}
            //- .field.is-horizontal
            //-   .field-label.is-normal
            //-     label.label
            //-       strong  Card No.:
            //-   .field-label.is-normal
            //-     label.label.is-pulled-left {{ parseColData(selectedCustomer.cardnumber) }}
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong ID:
              .field-label.is-normal
                label.label.is-pulled-left {{ parseColData(selectedCustomer.id) }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Marital status:
              .field-label.is-normal
                label.label.is-pulled-left  {{ parseColData(selectedCustomer.marital_status) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Gender:
              .field-label.is-normal          
                label.label.is-pulled-left {{ parseColData(selectedCustomer.gender) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Card Number: 
              .field-label.is-normal
                label.label.is-pulled-left {{ parseColData(selectedCustomer.cardnumber) }}  
        .mt-30
          h5.title.is-5.has-text-centered Purchase history
          el-table(
            v-loading="isLoadingSales"
            :data="sales",
            :empty-text="emptyText",
            :max-height="300"
          )
            el-table-column(label="No", type="index", :index="1")
            //- el-table-column(prop="customerid", label="Customer ID", align="center")
            el-table-column(prop="customer", show-overflow-tooltip, label="Customer name", align="center")
            el-table-column(prop="salesid", show-overflow-tooltip, label="Sales ID", align="center")
            el-table-column(prop="total", show-overflow-tooltip, label="Total", align="center")
            el-table-column(prop="discount", show-overflow-tooltip, label="Discount", align="center")
            el-table-column(prop="tax", show-overflow-tooltip, label="Tax", align="center")
            el-table-column(prop="paid", show-overflow-tooltip, label="Paid", align="center")
            //- el-table-column(prop="payment", show-overflow-tooltip, label="Payment method", align="center")
            el-table-column(prop="profit", show-overflow-tooltip, label="Profit", align="center")     
            el-table-column(prop="user", show-overflow-tooltip, label="Sold by", align="center")     
            el-table-column(prop="salestime", show-overflow-tooltip, label="Sold at", align="center")     
</template>

<script>
/* eslint-disable */
import EmptyState from '@/components/EmptyState';
import { formatDate, formatMoney, dateForHumans } from '@/filters/format';
import { mapActions, mapState, mapMutations } from 'vuex';
import CustomerForm from '@/components/customers/CustomerForm';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import Loading from '@/components/shared/Loading';
import JsonExcel from 'vue-json-excel';
import { ObjectToFormData, parseColData } from '@/utils/helper';
export default {
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
        Customer: 'customer',
        Total: 'total',
        Discount: 'discount',
        profit:  'profit',
        Tax: 'tax',
        'Sales ID': 'salesid',
        'Sold by': 'user',
        'Payment method': 'payment',
        'Sold at': 'salestime',
      },
    }
  },
  mounted() {
    this.clearSelectedCustomer();
    this.isLoading = true;
    this.loadCustomer(
      ObjectToFormData({
        customerid: this.$route.params.id,
        getcustomer: 'getcustomer',
      })
    )
    .then(() => {
      this.isLoading = false;
      this.isLoadingSales = true;
      return this.loadSales(
        ObjectToFormData({
          salessearch: 'salessearch',
          fromtime: '0000-00-01 00:00:00',
          totime: '7018-02-07 00:00:00',
          customersearch: this.selectedCustomer.id,
        })
      )
    })
    .then((res) => {
      this.isLoadingSales = false;
      if (res.status === 'Success') {
        this.setSelectedCustomerSales(res.message);
      }
    })
    .catch((err) => {
      console.log(err);
      this.$snackbar.open({
        message: 'Could not find a Customer with that ID',
        type: 'is-danger',
      });
      this.isLoading = false;
      this.isLoadingSales = false;
      this.$router.push({ name: 'customers_list'});
    });
  },
  components:{
    EmptyState,
    Loading,
    CustomerForm,
    FullscreenDialog,
    JsonExcel,
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
    ...mapActions('sales', [
      'loadSales',
    ]),
    updateCustomer(customer) {
      console.log(customer);
      this.SET_SELECTED_CUSTOMER(customer);
    },
    closeDialog() {
      this.fullScreenActive = false;
    },
    ...{ parseColData },
  },
  computed: {
    ...mapState('customers', [
      'selectedCustomer',
    ]),
    fullname() {
      if (this.selectedCustomer.firstname || this.selectedCustomer.surname) {
        return `${this.selectedCustomer.firstname} ${this.selectedCustomer.surname}`;
      }
      return '-';
    },
    sales() {
      if (this.selectedCustomer && this.selectedCustomer.sales) {
        return this.selectedCustomer.sales;
      }
      return [];
    },
    documentName() {
      if (this.selectedCustomer) {
        return `${this.selectedCustomer.firstname}'s purchase history`;
      }
      return null;
    },
    emptyText() {
      return `${this.fullname} has not purchased anything yet`;
    }
  },
};
</script>

<style lang="sass" scoped>
// .field-label
//   text-align: left !important
.label  
  font-weight: 100
.shadow-divider
  box-shadow: 0px 0px 4px 0 rgba(0, 0, 0, 0.08) inset !important;
  min-height: 560px !important;  
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
