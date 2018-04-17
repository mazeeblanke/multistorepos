<template lang="pug">
  section.section
    .container-fluid
      .columns.is-gapless
        .column(v-show="$can('admin|super-admin')" :class="$can('admin|super-admin') ? 'is-2' : ''")
          SideBar
        .column(:class="$can('admin|super-admin') ? 'is-10' : ''")
          .reportManagement.BaseAppCard.card(ref='base-card')
            header.card-header
              p.card-header-title Report Management
              p.level-item.page-title.subtitle.is-5
                span.tag.is-medium Branch: {{ currentBranch.name }}
              a.card-header-icon
            .tab-content
              .MaterialView.shadow-divider
                el-tabs(v-model="currentTab", value='summary', type="card")
                  el-tab-pane(name="sales_report", label='Product Sales Report', v-loading="isLoadingProductReport", :style="{ 'min-height': '400px' }")
                    //- ProductSales(@loading="(l) => isLoadingProductReport = l")
                    Report(
                      type="product",
                      @loading="(l) => isLoadingProductReport = l"
                    )
                  el-tab-pane(name="customers_report", v-loading="isLoadingCustomerReport", label='Customers Report')
                    Report(
                      type="customer",
                      @loading="(l) => isLoadingCustomerReport = l"
                    )
                  el-tab-pane(name="employees_report", v-loading="isLoadingEmployeeReport", label='Employees Report')
                    Report(
                      type="user",
                      @loading="(l) => isLoadingEmployeeReport = l"
                    )
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
import SideBar from '@/components/shared/SideBar';
import VueChart from 'vue-chart-js'
import Print from '@/components/shared/Print';
import ProductSales from '@/components/Reports/ProductSales';
import Report from '@/components/Reports/Report';

export default {
  data() {
    return {
      selectedMaterials: [],
      isLoadingProductReport: false,
      isLoadingCustomerReport: false,
      isLoadingEmployeeReport: false,
      fullScreenActive: false,
      currentTab: 'sales_report',
    };
  },
  components:{
    EmptyState,
    Loading,
    EmployeeForm,
    FullscreenDialog,
    JsonExcel,
    SideBar,
    VueChart,
    Print,
    ProductSales,
    Report,
  },
  methods: {
    setTimeRange(value) {
      if (value === DAILY) {
        this.filter.range = [
          this.$moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          this.$moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        ]
      }

      if (value === WEEKLY) {
        this.filter.range = [
          this.$moment().startOf('week').format('YYYY-MM-DD HH:mm:ss'),
          this.$moment().endOf('week').format('YYYY-MM-DD HH:mm:ss'),
        ]
      }

      if (value === MONTHLY) {
        this.filter.range = [
          this.$moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
          this.$moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'),
        ]
      }

      if (value === QUARTERLY) {
        this.filter.range = [
          this.$moment().startOf('quarter').format('YYYY-MM-DD HH:mm:ss'),
          this.$moment().endOf('quarter').format('YYYY-MM-DD HH:mm:ss'),
        ]
      }

      if (value === ANUALLY) {
        this.filter.range = [
          this.$moment().startOf('year').format('YYYY-MM-DD HH:mm:ss'),
          this.$moment().endOf('year').format('YYYY-MM-DD HH:mm:ss'),
        ]
      }

      if (value === HOURLY) {
        this.filter.range = [
          this.$moment().startOf('hour').format('YYYY-MM-DD HH:mm:ss'),
          this.$moment().endOf('hour').format('YYYY-MM-DD HH:mm:ss'),
        ]
      }

    },
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
    changeChartType(type) {
      this.displayChart = false;
      setTimeout(() => {
        this.chartType = type;
        this.displayChart = true;
      }, 1000);
    },
    generateReport() {
      const { type, column, limit, range} = this.filter;
      const payload = {
        reporttopbottomproduct: 'reporttopbottomproduct',
        fromtime: range[0] || '1970-01-01 00:00:01',
        totime: range[1] || '7018-02-07 00:00:00',
        type: type || 'top',
        column: column || 'profit',
        limit: limit || 10,
      };
      this.sales = null;
      this.isLoading = true;
      this.loadSales(
        ObjectToFormData(payload)
      )
      .then((res) => {
        this.isLoading = false;
        if (res.status === 'Success') {
          this.sales = {
            data: res.message,
            meta: payload,
          };
          this.displayChart = true;
        }
      })
      .catch((err) => {
        this.isLoading = false;
      });
    },
    ...{ parseColData },
  },
  computed: {
    ...mapState('employees', [
      'selectedEmployee',
    ]),
    ...mapState('branch', [
      'currentBranch',
    ]),
    chartData() {
      return {
        labels: _.map(this.sales.data, 'product'),
        datasets: [{
            label: `${this.sales.meta.type} of Products`,
            data: _.map(this.sales.data, this.sales.meta.column),
            backgroundColor: _.map(this.sales.data, s => 'rgba(153, 102, 255, 1)'),
            borderWidth: 1
        }],
      };
    },
    emptyText() {
      return `No results`;
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
// .reportFilters
//   .el-form--inline
//     display: flex !important
//     flex-wrap: nowrap !important
//   .el-form-item .el-select.el-select--mini
//     width: 158px !important
//     input
//       width: 158px !important
.reportManagement
  .el-tab-pane
    padding: 0px !important
.el-progress
  padding: 25px
  position: absolute
  top: 5%
  z-index: 23
  width: 100%
h5
 text-transform: capitalize
</style>

<style lang="sass" module>
.columns
  margin: 20px 50px 10px 50px
.trash
  border: none
  background: transparent
</style>
