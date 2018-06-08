<template lang="pug">
  .MaterialView.shadow-divider
    FullscreenDialog(
      v-close="closeDialog", 
      @closed="closeDialog", 
      :active.sync="fullScreenActive"
    )
      EmployeeForm.page-forms(
        v-if="fullScreenActive"
        ref="employee-form",
        :class="$style.pageForms",
        @close-form="closeDialog",
        :_employee="selectedEmployee",
        :allow-excel-import="false"
      )
    .level.toolbar
      .level-left
        .level-item
          router-link.button(:to="{name: 'employees_list'}")
            span.icon.is-medium
              i.material-icons keyboard_arrow_left
        .level-item(v-if="selectedEmployee")
          .page-title.subtitle.is-6
            span.mr-5 Viewing Employee
            span.tag.is-medium.is-warning 
              | {{ selectedEmployee.full_name }}
      .level-right
        .level-item
          .field.has-addons
            p.control
              JsonExcel(
                class="btn btn-default",
                :data="selectedEmployeeSales.data",
                :fields="json_fields",
                :name="documentName",
                type="xlsx",
                v-if="selectedEmployee"
              )
                button.button.is-primary(
                  :disabled="!selectedEmployeeSales.data.length"
                ) 
                  span.el-icon-download.mr-5
                  span Download Purchase history
        .level-item
          .field.has-addons
            p.control
              button.button(@click="fullScreenActive = !fullScreenActive")
                span.icon
                  i.material-icons edit
                span Edit Information
    Loading(
      loading-text="Loading employee information", 
      v-if="isLoading", 
      :style="{ height: '400px' }"
    )
    el-tabs(v-model="currentTab", value='summary', type="card", v-if="!isLoading")
      el-tab-pane(name="details", label='Employee Details')
        .columns(:class="$style.columns" v-if="selectedEmployee")
          .column.is-6 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Name:
              .field-label.is-normal
                label.label.is-pulled-left.is-capitalized  
                  | {{ selectedEmployee.full_name }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Username: 
              .field-label.is-normal
                label.label.is-pulled-left.is-capitalized  
                  | {{ parseColData(selectedEmployee.username) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Registration date: 
              .field-label.is-normal
                label.label.is-pulled-left.is-capitalized 
                  | {{ parseColData(selectedEmployee.created_at) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Branch name:
              .field-label.is-normal          
                label.label.is-pulled-left.is-capitalized 
                  | {{ employeeBranch.name }}     
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong ID:
              .field-label.is-normal
                label.label.is-pulled-left.is-capitalized 
                  | {{ parseColData(selectedEmployee.id) }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Access:
              .field-label.is-normal
                label.label.is-pulled-left.is-capitalized  
                  | {{ parseColData(selectedEmployee.access_level) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Branch address: 
              .field-label.is-normal
                label.label.is-pulled-left.is-capitalized 
                  | {{ employeeBranch.address }}     
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Email: 
              .field-label.is-normal
                label.label.is-pulled-left 
                  | {{ parseColData(selectedEmployee.email) }}     
        .mt-30
          h5.title.is-5.has-text-centered Sales history
          el-table(
            v-loading="isLoadingSales"
            :data="filteredItemsData",
            :empty-text="emptyText",
            :max-height="200",
            :height="200",
          )
            el-table-column(label="No", type="index", :index="1")
            el-table-column(prop="sales_id", show-overflow-tooltip, label="Sales ID", sortable)
            el-table-column(prop="product.name", show-overflow-tooltip, label="Product", sortable)
            el-table-column(prop="sub_total", show-overflow-tooltip, label="Total", sortable)
            el-table-column(prop="payment_type", show-overflow-tooltip, label="Payment Method")
            el-table-column(prop="quantity", show-overflow-tooltip, label="Qty Bought")
            el-table-column(prop="unit_price", show-overflow-tooltip, label="Sold By", sortable)     
            el-table-column(prop="created_at", show-overflow-tooltip, label="Sold At", sortable)  
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
import EmployeeForm from '@/components/employees/EmployeeForm'
import InfiniteLoading from 'vue-infinite-loading'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import filterMixin from '@/mixins/FilterMixin'
import Loading from '@/components/shared/Loading'
import JsonExcel from 'vue-json-excel'
import { parseColData } from '@/utils/helper'

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
      filter: {
        aggregate: 0
      },
      json_fields : {
        Customer: 'customer',
        Product: 'product.name',
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

  mixins: [filterMixin],

  mounted() {
    this.clearSelectedEmployee();
    this.isLoading = true;
    this.loadEmployee({
      id: parseInt(this.$route.params.id, 10),
    })
    .then((res) => {
      this.isLoading = false;
      this.isLoadingSales = true;
      this.filter = {
          ...this.filter,
        user_id: this.selectedEmployee.id
      }
      return this.preloadItemsList()
    })
    .then((res) => {
      this.isLoadingSales = false
      this.handleBottomScroll()
      this.setSelectedEmployeeSales(res)
    })
    .catch((err) => {
      console.log(err);
      this.$snackbar.open({
        message: 'Could not find a Employee with that ID',
        type: 'is-danger',
      });
      this.isLoading = false;
      this.isLoadingSales = false;
      this.$router.push({ name: 'employees_list'});
    });
  },

  components:{
    EmptyState,
    Loading,
    EmployeeForm,
    InfiniteLoading,
    FullscreenDialog,
    JsonExcel,
  },

  methods: {

    ...{ formatDate, dateForHumans },

    setItems (res) {
      const { data } = res
      const salesHistory = {
        ...res,
        data: this.items.data.concat(data)
      }
      this.setSelectedEmployeeSales(salesHistory)
    },

    ...mapActions('employees', [
      'loadEmployee',
      'clearSelectedEmployee',
      'setSelectedEmployeeSales'
    ]),

    ...mapActions('sales', {
      loadItems: 'loadSales'
    }),

    ...mapMutations('employees', [
      'SET_SELECTED_EMPLOYEE'
    ]),

    closeDialog() {
      this.fullScreenActive = false;
    },

    ...{ parseColData }

  },

  computed: {

    ...mapState('employees', [
      'selectedEmployee',
    ]),

    employeeBranch() {
      return this.selectedEmployee.branch || {}
    },

    selectedEmployeeSales () {
      return this.selectedEmployee 
        ? this.selectedEmployee.sales 
        : { data: [] }
    },

    documentName() {
      if (this.selectedEmployee) {
        return `${this.selectedEmployee.full_name}'s_purchase_history`;
      }
      return null;
    },

    emptyText() {
      return `${this.selectedEmployee.full_name} has not sold anything yet`;
    }

  },

  watch: {

    selectedEmployeeSales (newValue) {
      this.items = newValue
    },

  }

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
