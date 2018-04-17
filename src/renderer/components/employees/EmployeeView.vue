<template lang="pug">
  .MaterialView.shadow-divider
    FullscreenDialog( v-close="closeDialog", @closed="closeDialog", :active.sync="fullScreenActive")
      EmployeeForm.page-forms(
        ref="employee-form",
        :class="$style.pageForms",
        @close-form="closeDialog",
        @updated-employee="updatedEmployeeDetails"
        :_employee="selectedEmployee",
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
            span.tag.is-medium.is-warning {{ selectedEmployee.name }}
      .level-right
        .level-item
          .field.has-addons
            p.control
              JsonExcel(
                class="btn btn-default",
                :data="selectedEmployee.sales",
                :fields="json_fields",
                :name="documentName",
                type="xlsx",
                v-if="selectedEmployee"
              )
                button.button.is-primary(
                  :disabled="!selectedEmployee.sales.length"
                ) Download Purchase history
        .level-item
          .field.has-addons
            p.control
              button.button(@click="fullScreenActive = !fullScreenActive")
                span.icon
                  i.material-icons edit
                span Edit Information
    Loading(loading-text="Loading employee information" v-if="isLoading", :style="{ height: '400px' }")
    el-tabs(v-model="currentTab", value='summary', type="card", v-if="!isLoading")
      el-tab-pane(name="details", label='Employee Details')
        .columns(:class="$style.columns" v-if="selectedEmployee")
          .column.is-6 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Name:
              .field-label.is-normal
                label.label.is-pulled-left  {{ selectedEmployee.name }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Username: 
              .field-label.is-normal
                label.label.is-pulled-left  {{ parseColData(selectedEmployee.username) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Registration date: 
              .field-label.is-normal
                label.label.is-pulled-left {{ parseColData(selectedEmployee.reg_time) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Branch name:
              .field-label.is-normal          
                label.label.is-pulled-left {{ employeeBranch.name }}     
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong ID:
              .field-label.is-normal
                label.label.is-pulled-left {{ parseColData(selectedEmployee.id) }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Access:
              .field-label.is-normal
                label.label.is-pulled-left  {{ parseColData(selectedEmployee.access) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Branch address: 
              .field-label.is-normal
                label.label.is-pulled-left {{ employeeBranch.address }}     
        .mt-30
          h5.title.is-5.has-text-centered Sales history
          el-table(
            v-loading="isLoadingSales"
            :data="selectedEmployee.sales",
            :empty-text="emptyText",
            :max-height="200",
            :height="200",
          )
            el-table-column(label="No", type="index", :index="1")
            el-table-column(prop="customer", show-overflow-tooltip, label="Customer name", align="center" sortable)
            el-table-column(prop="salesid", show-overflow-tooltip, label="Sales ID", align="center" sortable)
            el-table-column(prop="total", show-overflow-tooltip, label="Total", align="center" sortable)
            el-table-column(prop="discount", show-overflow-tooltip, label="Discount", align="center" sortable)
            el-table-column(prop="paid", show-overflow-tooltip, label="Paid", align="center" sortable)   
            el-table-column(prop="user", show-overflow-tooltip, label="Sold by", align="center" sortable)     
            el-table-column(prop="salestime", show-overflow-tooltip, label="Sold at", align="center" sortable)     
</template>

<script>
/* eslint-disable */
import EmptyState from '@/components/EmptyState';
import { formatDate, formatMoney, dateForHumans } from '@/filters/format';
import { mapActions, mapState, mapMutations } from 'vuex';
import EmployeeForm from '@/components/employees/EmployeeForm';
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
    this.clearSelectedEmployee();
    this.isLoading = true;
    this.loadEmployee(
      ObjectToFormData({
        user: this.$route.params.id,
        getuser: 'getuser',
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
          usersearch: this.selectedEmployee.username,
        })
      )
    })
    .then((res) => {
      this.isLoadingSales = false;
      if (res.status === 'Success') {
        this.setSelectedEmployeeSales(res.message);
      }
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
    FullscreenDialog,
    JsonExcel,
  },
  methods: {
    ...{ formatDate, dateForHumans },
    ...mapActions('employees', [
      'loadEmployee',
      'clearSelectedEmployee',
      'setSelectedEmployeeSales',
    ]),
    ...mapActions('sales', [
      'loadSales',
    ]),
    ...mapMutations('employees', [
      'SET_SELECTED_EMPLOYEE',
    ]),
    updatedEmployeeDetails(employee) {
      this.SET_SELECTED_EMPLOYEE({
        ...this.selectedEmployee,
        ...employee,
      });
    },
    closeDialog() {
      this.fullScreenActive = false;
    },
    ...{ parseColData },
  },
  computed: {
    ...mapState('employees', [
      'selectedEmployee',
    ]),
    employeeBranch() {
      if (this.selectedEmployee.branch_details) {
        return this.selectedEmployee.branch_details;
      }
      return {};
    },
    fullname() {
      if (this.selectedEmployee.firstname && this.selectedEmployee.surname) {
        return `${this.selectedEmployee.firstname} ${this.selectedEmployee.surname}`;
      }
      return '-';
    },
    documentName() {
      if (this.selectedEmployee) {
        return `${this.selectedEmployee.name}'s purchase history`;
      }
      return null;
    },
    emptyText() {
      return `${this.selectedEmployee.name} has not sold anything yet`;
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
