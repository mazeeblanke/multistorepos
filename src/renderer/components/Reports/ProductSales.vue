<<template lang="pug">
div
  .mt-10.reportFilters  
    el-form(:inline="true", :model="filter" class="demo-form-inline")
      el-form-item(label="")
        el-select(v-model="filter.type", size="mini", placeholder="Direction")
          el-option(label="Top" value="top")
          el-option(label="Bottom" value="bottom")
      el-form-item(label="")
        el-select(v-model="filter.column", size="mini", placeholder="Type")
          el-option(label="Quantity" value="quantity")
          el-option(label="Total" value="total")
          el-option(label="Profit" value="profit")
      el-form-item(label="")
        el-select(v-model="filter.limit", size="mini", placeholder="Limit")
          el-option(label="10" value="10")
          el-option(label="20" value="20")
          el-option(label="30" value="30")
      el-form-item(label="")
        el-date-picker(
          size="mini"
          v-model="filter.range"
          type="datetimerange"
          start-placeholder="Start Date"
          end-placeholder="End Date"
          :default-time="['12:00:00']"
          value-format="yyyy-MM-dd HH:mm:ss"
        )
      el-form-item(label="")
        el-select(v-model="reportTimeRange", @change="setTimeRange", size="mini", placeholder="Time range/period")
          el-option(label="Hourly" value="hourly")
          el-option(label="Daily" value="daily")
          el-option(label="Weekly" value="weekly")   
          el-option(label="Monthly" value="monthly")   
          el-option(label="Quarterly" value="quarterly")   
          el-option(label="Anually" value="anually")   
      el-form-item
        el-button(type="primary", size="mini", @click="generateReport" ) Generate report 
  EmptyState(empty-text="No Results" v-if="!sales", :style="{ height: '400px' }")      
  .columns(v-if="sales") 
    .column.is-7
      div
        h5.title.is-4 {{ `${sales.meta.type} ${sales.meta.limit} Product Sales (${sales.meta.column})` }}    
      el-table(
        :data="sales.data",
        :empty-text="emptyText",
        :height="700"
        :max-height="700"
        :stripe="true"
        v-if="sales"
      )
        el-table-column(label="No", type="index", :index="1")
        el-table-column(prop="productid", show-overflow-tooltip, label="ProductID", align="left" sortable)
        el-table-column(prop="product", show-overflow-tooltip, label="Product name", align="left" sortable)
        el-table-column(prop="quantity", show-overflow-tooltip, label="Quantity", v-if="sales.meta.column === 'quantity'", align="left" sortable)
        el-table-column(prop="profit", show-overflow-tooltip, label="Profit", v-if="sales.meta.column === 'profit'", align="left" sortable)
        el-table-column(prop="total", show-overflow-tooltip, label="Total", v-if="sales.meta.column === 'total'", align="left" sortable)
    .column.is-5 
      div
        el-select(@change="changeChartType", :value="chartType", size="mini", placeholder="Chart type")
          el-option(label="Bar Chart" value="bar")
          el-option(label="Pie Chart" value="pie")
          el-option(label="Line Chart" value="line")
          //- el-option(label="Radar Chart" value="radar")
          el-option(label="PolarArea Chart" value="polarArea")
          el-option(label="Doughnut Chart" value="doughnut")
      div(:style="{ 'min-height': '500px' }")
        vue-chart(:type="chartType", v-if="displayChart", :height="300", :options="options", :data="chartData")
        Loading(loading-text="Loading graph" v-else, :style="{ height: '400px' }")
      div.mt-50
        h6.title.is-4.mb-10 Remarks
        el-input(
          type="textarea"
          :rows="5"
          placeholder="Enter remarks"
          v-model="remarks")
        //- <a v-print="'#k'">Print</a>
        //- <a v-print>Print</a>
        //- <a v-print="'.p'">Print</a>
        //- Print(ref="print", element-id="k")
</template>

<<script>
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

const DAILY = 'daily';
const WEEKLY = 'weekly';
const HOURLY = 'hourly';
const MONTHLY = 'monthly';
const QUARTERLY = 'quarterly';
const ANUALLY = 'anually';

export default {
  mounted() {
    this.generateReport();
  },
  data() {
    return {
      isLoading: false,
      filter: {
        type: null,
        column: null,
        limit: null,
        range: [],
      },
      remarks: '',
      reportTimeRange: null,
      chartType: 'bar',
      displayChart: false,
      sales: null,
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
            },
            // barThickness: 2,
            backgroundColor: 'red',
            // gridLines: {
            //     display: false,
            //   },
            // display: false,
          }],
          xAxes: [
            { 
              // barThickness: 20,
              display: false,
              // gridLines: {
              //   display: false,
              // },
            },
          ],
        },
      },
    }
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
    // ...mapActions('employees', [
    //   'loadEmployee',
    //   'clearSelectedEmployee',
    //   'setSelectedEmployeeSales',
    // ]),
    ...mapActions('sales', [
      'loadSales',
    ]),
    // ...mapMutations('employees', [
    //   'SET_SELECTED_EMPLOYEE',
    // ]),
    // updatedEmployeeDetails(employee) {
    //   this.SET_SELECTED_EMPLOYEE({
    //     ...this.selectedEmployee,
    //     ...employee,
    //   });
    // },
    // closeDialog() {
    //   this.fullScreenActive = false;
    // },
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
      this.$emit('loading', true);
      this.loadSales(
        ObjectToFormData(payload)
      )
      .then((res) => {
        this.$emit('loading', false);
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
        this.$emit('loading', false);
        this.isLoading = false;
      });
    },
    ...{ parseColData },
  },
   computed: {
    ...mapState('employees', [
      'selectedEmployee',
    ]),
    chartData() {
      return {
        labels: _.map(this.sales.data, 'product'),
        datasets: [{
            label: `${this.sales.meta.type} of Products`,
            data: _.map(this.sales.data, this.sales.meta.column),
            // backgroundColor: [
            //     'rgba(255, 99, 132, 0.2)',
            //     'rgba(54, 162, 235, 0.2)',
            //     'rgba(255, 206, 86, 0.2)',
            //     'rgba(75, 192, 192, 0.2)',
            //     'rgba(153, 102, 255, 0.2)',
            //     'rgba(255, 159, 64, 0.2)'
            // ],
            // backgroundColor: [
            //     '#4b3832',
            //     '#854442',
            //     '#3c2f2f',
            //     '#fff4e6',
            //     '#3c2f2f',
            //     '#be9b7b',
            // ],
            backgroundColor: _.map(this.sales.data, s => 'rgba(153, 102, 255, 1)'),
            borderWidth: 1
        }],
      };
    },
    emptyText() {
      return `No results`;
    },
  },
}
</script>

<<style lang="sass">
  
</style>