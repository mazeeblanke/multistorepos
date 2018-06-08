<template lang="pug">
div
  .expenditureReport
    .level.toolbar.shadow-divider
      .level-left
      .level-right
        .level-item(v-show="$can('super-admin')")
          .field.has-addons
            el-select.has-full-width(
              v-model="filter.currentBranch",
              filterable,
              clearable,
              placeholder="select branch",
              remote,
              :remote-method="_loadBranches",
              :loading="loadingBranches",
              no-data-text="No results!",
              value-key="id",
              @change="() => generateReport()"
              size="mini"
            )
              el-option(
                v-for="branch in branchSuggestions",
                :value="branch.id",
                :label="branch.name",
                :key="branch.id",
              )
        .level-item
          el-form(:inline="true", :model="filter" class="demo-form-inline")
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
              el-select(
                v-model="reportTimeRange", 
                @change="setTimeRange", 
                size="mini", 
                placeholder="Time range/period"
              )
                el-option(label="Hourly" value="hour")
                el-option(label="Daily" value="day")
                el-option(label="Weekly" value="week")
                el-option(label="Monthly" value="month")
                el-option(label="Quarterly" value="quarter")
                el-option(label="Anually" value="year")
            el-form-item
              el-dropdown(
                split-button size="mini", 
                type="primary", 
                @command="handleCommand", 
                @click="generateReport"
              ) Generate Report
                el-dropdown-menu(slot="dropdown")
                  el-dropdown-item(:command="() => generateReportPdf('preview')") Preview and Print PDF
                  el-dropdown-item(:command="() => generateReportPdf('download')") Download PDF
                  // JsonExcel(
                  //   class="btn btn-default",
                  //   :data="sales.expenditure",
                  //   :fields="json_fields",
                  //   name="Report",
                  //   type="xlsx",
                  //   v-if="sales"
                  // )
                  //   el-dropdown-item Export to Excel sheet
    nav(class="level expenditureStats" v-if="sales")
      div(class="level-item has-text-centered")
        div
          p(class="heading") Expenditure Costs
          p(class="title") {{ money(sales.total_expenditure) }}
      div(class="level-item has-text-centered")
        div
          p(class="heading") Inventory Costs
          p(class="title") {{ money(sales.total_costprice) }}
      div(class="level-item has-text-centered")
        div
          p(class="heading") Opening Cash Total
          p(class="title")  {{ money(sales.total_openingcash) }}
      div(class="level-item has-text-centered")
        div
          p(class="heading") Profit/Loss
          p(class="title") {{ money(sales.total_profitloss) }}
  EmptyState(empty-text="No Expenditures" v-if="!sales && !isLoading", :style="{ height: '400px' }")
  Loading(loading-text="Loading expenditure report" v-if="isLoading && !sales", :style="{ height: '400px' }")
  .columns.appView(v-if="sales && sales.expenditure.length")
    .column.is-7
      div#d
        h5.title.mb-20 Expenditures
      el-table(
        :data="sales.expenditure",
        :empty-text="emptyText",
        :height="680"
        :max-height="680"
        :stripe="true"
        v-if="sales.expenditure.length"
        :border="true"
      )
        el-table-column(label="No", type="index", :index="1")
        el-table-column(prop="user", show-overflow-tooltip, label="Username", align="left" sortable)
          template(slot-scope="scope")
            span {{ parseColData(scope.row.user.full_name) }}
        el-table-column(prop="type", show-overflow-tooltip, label="Type", align="left" sortable)
          template(slot-scope="scope")
            span {{ parseColData(scope.row.type) }}
        el-table-column(prop="amoun", show-overflow-tooltip, label="Amount", align="left" sortable)
          template(slot-scope="scope")
            span {{ money(parseColData(scope.row.amount)) }}
    .column.is-5
      div
        el-select(@change="changeChartType", :value="chartType", size="mini", placeholder="Chart type")
          el-option(label="Bar Chart" value="bar")
          el-option(label="Pie Chart" value="pie")
          el-option(label="Line Chart" value="line")
          el-option(label="PolarArea Chart" value="polarArea")
          el-option(label="Doughnut Chart" value="doughnut")
      div(:style="{ 'min-height': '500px' }")
        vue-chart#myChart(:type="chartType", v-if="displayChart", :height="300", :options="options", :data="chartData")
        Loading(loading-text="Loading graph" v-if="!displayChart", :style="{ height: '400px' }")
      div.mt-50
        h6.title.is-4.mb-10 Remarks
        el-input#remarks(
          type="textarea"
          :rows="5"
          placeholder="Enter remarks"
          v-model="remarks")
</template>

<script>
/* eslint-disable */
import EmptyState from '@/components/EmptyState'
import { formatDate, dateForHumans } from '@/filters/format'
import { mapActions, mapState } from 'vuex'
import EmployeeForm from '@/components/employees/EmployeeForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import Loading from '@/components/shared/Loading'
import MoneyMixin from '@/mixins/MoneyMixin'
import JsonExcel from 'vue-json-excel'
import { COLOR_PALETTE } from '@/utils/constants'
import { parseColData, createImgOnCanvas } from '@/utils/helper'
import VueChart from 'vue-chart-js'
import $ from 'jquery'
import imgLetterHead from '@/assets/img/AXXIMUTH2.jpg'
let jsPDF = require('jspdf')
require('jspdf-autotable')

export default {

  mounted () {
    this.generateReport()
  },

  data () {
    return {
      isLoading: false,
      isGeneratingPDF: false,
      filter: {
        range: [],
        branch: {}
      },
      remarks: '',
      loadingBranches: false,
      branchSuggestions: [],
      reportTimeRange: null,
      chartType: 'bar',
      displayChart: false,
      sales: null,
      json_fields: {
        Username: 'user',
        Type: 'type',
        Amount: 'amount',
        'Created at': 'expendituretime'
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            },
            backgroundColor: 'red'
          }],
          xAxes: [
            {
              display: false
            }
          ]
        }
      }
    }
  },

  mixins: [MoneyMixin],

  components: {
    EmptyState,
    Loading,
    EmployeeForm,
    FullscreenDialog,
    JsonExcel,
    VueChart,
  },

  methods: {

    ...mapActions('branch', [
      'loadBranches',
      'searchBranches'
    ]),

    ...mapActions('reports', [
      'loadProfitLossReport'
    ]),

    ...{ formatDate, dateForHumans, parseColData },

    _loadBranches (query) {
      if (query !== '') {
        this.loadingBranches = true
        this.searchBranches({
          search: query,
          type: 'branch'
        })
          .then((res) => {
            this.branchSuggestions = res
            this.loadingBranches = false
          })
          .catch(() => {
            this.loadingBranches = false
          })
      }
    },

    generateReportPdf (action) {
      const columns = [
        {title: 'No', dataKey: 'index'},
        {title: 'Username', dataKey: 'user.full_name'},
        {title: 'Type', dataKey: 'type'},
        {title: 'Amount', dataKey: 'amount'}
      ]
      const data = this.sales.expenditure
        .map((s, i) => {
          s.amount = this.money(parseColData(s.amount))
          s.user = parseColData(s.user)
          s.index = i + 1
          return s
        })
      this.isGeneratingPDF = true
      let imgData = document.getElementById('myChart').toDataURL('image/jpg')
      let remarks = $('#remarks').val()
      let headerMarginTop = 46
      let tableMarginTop = 55
      createImgOnCanvas(imgLetterHead, (letterHead) => {
        let printDoc = new jsPDF()
        printDoc.addImage(letterHead, 'JPEG', 0, 0, 210, 297)
        printDoc.setFontType('bold')
        printDoc.setFontSize(16)
        printDoc.autoTable(columns, data, {
          styles: {
            cellPadding: 7,
            fontSize: 11
          },
          margin: {top: tableMarginTop},
          createdCell: function (cell, data) {
            let dataKeyParts = data.column.raw.dataKey.split('.');
            if(dataKeyParts.length > 1) {
              let o = data.row.raw;
              dataKeyParts.forEach(key => {(o !== null || o !== '') ? o = o[key] : ''});
              cell.text = o;
            }
          },
          headerStyles: {fillColor: 255, textColor: 0},
          alternateRowStyles: {fillColor: false},
          bodyStyles: {fillColor: false},
          addPageContent: (data) => {
            printDoc.setFontType('bold')
            printDoc.setFontSize(16)
            printDoc.text('Expenditures', 15, headerMarginTop)
          }
        })
        printDoc.addPage()
        printDoc.addImage(imgData, 'JPEG', 15, 40, 180, 180)
        if (remarks) {
          printDoc.addPage()
          printDoc.setFontType('bold')
          printDoc.setFontSize(25)
          printDoc.text('Remarks', 20, 30)
          printDoc.setFontType('normal')
          printDoc.setFontSize(11)
          remarks = printDoc.splitTextToSize(
            $('#remarks').val(),
            170
          )
          printDoc.text(remarks, 20, 40)
        }
        if (action === 'preview') {
          printDoc.autoPrint()
          printDoc.output('dataurlnewwindow')
        } else if (action === 'download') {
          printDoc.save('report.pdf')
        }
      })
    },
    
    handleCommand (command) {
      command()
    },

    typeLabelValue (scope) {
      const TYPE = scope.row[this.type]
      if (TYPE instanceof Array) {
        if (!TYPE.length) {
          return '-'
        }
        return TYPE[0].firstname
      }
      return TYPE
    },

    setTimeRange (value) {
      this.filter.range = [
        this.$moment().startOf(value).format('YYYY-MM-DD HH:mm:ss'),
        this.$moment().endOf(value).format('YYYY-MM-DD HH:mm:ss')
      ]
    },

    changeChartType (type) {
      this.displayChart = false
      setTimeout(() => {
        this.chartType = type
        this.displayChart = true
      }, 500)
    },

    generateReport () {
      const { range, branch } = this.filter
      const payload = {
        from_time: range[0],
        to_time: range[1],
        branch_id: branch.id || this.settings.branch.id,
        store_id: this.settings.store.id
      }
      this.sales = null
      this.isLoading = true
      this.$emit('loading', true)
      this.loadProfitLossReport(payload)
        .then((res) => {
          this.isLoading = false
          this.sales = res
          this.displayChart = true
        })
        .catch((err) => {
          this.$emit('loading', false)
          this.isLoading = false
        })
    },

  },
  computed: {

    ...mapState('settings', [
      'settings'
    ]),

    chartData () {
      const data = JSON.parse(JSON.stringify({ ...this.sales }))
      delete data.expenditure
      return {
        labels: Object.keys(data),
        datasets: [{
          label: 'Profit/loss Report',
          data: Object.values(data),
          backgroundColor: COLOR_PALETTE,
          borderWidth: 1
        }]
      }
    },

    emptyText () {
      return `No results`
    }

  }
}
</script>

<style lang="sass">
  .expenditureReport
    .el-dropdown__caret-button
      height: 28px !important
    .el-form
      height: 40px !important
    // .columns
    //   height: 380px !important  
  .expenditureStats
    margin-bottom: 25px !important;
    border-bottom: 1px solid #fdfdfd;
    height: 100px;
    box-shadow: 0px 23px 47px -42px #333;
</style>

<style lang="sass" scoped>
  .columns
    margin-bottom: 0px !important
    padding: 2.5rem !important
    height: 400px !important
</style>
