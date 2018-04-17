<template lang="pug">
  .MaterialView.shadow-divider
    FullscreenDialog( v-close="closeDialog", @closed="closeDialog", :active.sync="fullScreenActive")
      SupplierForm.page-forms(
        ref="supplier-form",
        :class="$style.pageForms",
        @close-form="closeDialog",
        @action-complete="updateSupplier",
        :_supplier="selectedSupplier",
      )
    .level.toolbar
      .level-left
        .level-item
          router-link.button(:to="{name: 'suppliers_list'}")
            span.icon.is-medium
              i.material-icons keyboard_arrow_left
        .level-item(v-if="selectedSupplier")
          .page-title.subtitle.is-6
            span.mr-5 Viewing Supplier
            span.tag.is-medium.is-warning {{ selectedSupplier.name }}
      .level-right
        .level-item
          .field.has-addons
            //- p.control
            //-   JsonExcel(
            //-     class="btn btn-default",
            //-     :data="selectedSupplier.sales",
            //-     :fields="json_fields",
            //-     :name="documentName",
            //-     type="xlsx",
            //-     v-if="selectedSupplier"
            //-   )
            button.button.is-primary(:disabled="true")
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
    Loading(loading-text="Loading supplier information" v-if="isLoading", :style="{ height: '400px' }")
    el-tabs(v-model="currentTab", value='summary', type="card", v-if="!isLoading")
      el-tab-pane(name="details", label='Supplier Details')
        .columns(:class="$style.columns" v-if="selectedSupplier")
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-right
                  strong  ID:
              .field-label.is-normal
                label.label.is-pulled-left  {{ selectedSupplier.id }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-right
                  strong  Name:
              .field-label.is-normal
                label.label.is-pulled-left  {{ selectedSupplier.name }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-right
                  strong  Email: 
              .field-label.is-normal
                label.label.is-pulled-left  {{ parseColData(selectedSupplier.email) }}
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-right
                  strong  Address: 
              .field-label.is-normal
                label.label.is-pulled-left {{ parseColData(selectedSupplier.address) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-right
                  strong  Phone No.:
              .field-label.is-normal
                label.label.is-pulled-left {{ parseColData(selectedSupplier.phone) }} 
        .mt-56
          h5.title.is-5.has-text-centered Supply history
          el-table(
            v-loading="isLoadingSuppliedProducts"
            :data="sales",
            :empty-text="emptyText",
            :max-height="200",
            :height="200",
          )
            el-table-column(label="No", type="index", :index="1")
            //- el-table-column(prop="supplierid", label="Supplier ID", align="center")
            el-table-column(prop="supplier", show-overflow-tooltip, label="Supplier name", align="center")
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
import SupplierForm from '@/components/suppliers/SupplierForm';
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
      isLoadingSuppliedProducts: false,
      json_fields : {
        Supplier: 'supplier',
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
    this.clearSelectedSupplier();
    this.isLoading = true;
    this.loadSupplier(
      ObjectToFormData({
        supplierid: this.$route.params.id,
        getsupplier: 'getsupplier',
      })
    )
    .then(() => {
      this.isLoading = false;
      this.isLoadingSuppliedProducts = true;
      return this.getSupplierProducts(
        ObjectToFormData({
          productsupplysearch: 'productsupplysearch',
          fromtime3: '1970-01-01 00:00:01',
          totime3: '7018-02-07 00:00:00',
          supplierid4: this.selectedSupplier.id,
        })
      )
    })
    .then((res) => {
      this.isLoadingSuppliedProducts = false;
      if (res.status === 'Success') {
        this.setSelectedSupplierSales(res.message);
      }
    })
    .catch((err) => {
      console.log(err);
      this.$snackbar.open({
        message: 'Could not find a Supplier with that ID',
        type: 'is-danger',
      });
      this.isLoading = false;
      this.isLoadingSuppliedProducts = false;
      this.$router.push({ name: 'suppliers_list'});
    });
  },
  components:{
    EmptyState,
    Loading,
    SupplierForm,
    FullscreenDialog,
    JsonExcel,
  },
  methods: {
    ...{ formatDate, dateForHumans },
    ...mapActions('suppliers', [
      'loadSupplier',
      'clearSelectedSupplier',
      'setSelectedSupplierSales',
    ]),
    ...mapMutations('suppliers', [
      'SET_SELECTED_SUPPLIER',
    ]),
    ...mapActions('products', [
      'getSupplierProducts',
      // 'clearSelectedSupplier',
      // 'setSelectedSupplierSales',
    ]),
    ...mapActions('sales', [
      'loadSales',
    ]),
    closeDialog() {
      this.fullScreenActive = false;
    },
    updateSupplier(updatedSupplier) {
      console.log(updatedSupplier);
      this.SET_SELECTED_SUPPLIER(updatedSupplier);
    },
    ...{ parseColData },
  },
  computed: {
    ...mapState('suppliers', [
      'selectedSupplier',
    ]),
    fullname() {
      // if (this.selectedSupplier.firstname && this.selectedSupplier.surname) {
      //   return `${this.selectedSupplier.firstname} ${this.selectedSupplier.surname}`;
      // }
      return '-';
    },
    sales() {
      if (this.selectedSupplier && this.selectedSupplier.sales) {
        return this.selectedSupplier.sales;
      }
      return [];
    },
    documentName() {
      if (this.selectedSupplier) {
        return `${this.selectedSupplier.firstname}'s purchase history`;
      }
      return null;
    },
    emptyText() {
      return `${this.selectedSupplier.name} has not supplied anything yet`;
    }
  },
};
</script>

<style lang="sass" scoped>
.field-label
  text-align: left !important
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
