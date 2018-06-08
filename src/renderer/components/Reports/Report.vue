<<template lang="pug">
div
  .reportFilters
    .level.toolbar.shadow-divider
      .level-left
      .level-right
        .level-item
          el-form(:inline="true", :model="filter" class="demo-form-inline")
            el-form-item(label="" v-show="$can('superadmin')")
              el-select(
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
            el-form-item(label="")
              el-select(v-model="filter.type", size="mini", clearable, placeholder="Direction")
                el-option(label="Top" value="desc")
                el-option(label="Bottom" value="asc")
            el-form-item(label="")
              el-select(v-model="filter.column", size="mini", clearable, placeholder="Type")
                el-option(label="Quantity" value="quantity")
                el-option(label="Discount" value="discount", :disabled="type === 'product'")
                el-option(label="Tax" value="tax", :disabled="type === 'product'")
                el-option(label="Sub Total" value="sub_total")
                el-option(label="Profit" value="profit")
            el-form-item(label="")
              el-select(v-model="filter.limit", :allow-create="true", clearable, :filterable="true", size="mini", placeholder="Limit")
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
                clearable,
              )
            el-form-item(label="")
              el-select(v-model="reportTimeRange", clearable, @change="setTimeRange", size="mini", placeholder="Time range/period")
                el-option(label="Hourly" value="hour")
                el-option(label="Daily" value="day")
                el-option(label="Weekly" value="week")
                el-option(label="Monthly" value="month")
                el-option(label="Quarterly" value="quarter")
                el-option(label="Anually" value="year")
            el-form-item
              el-dropdown(split-button size="mini" type="primary" @command="handleCommand" @click="generateReport") Generate Report
                el-dropdown-menu(slot="dropdown")
                  el-dropdown-item(:command="() => generateReportPdf('preview')") Preview and Print PDF
                  el-dropdown-item(:command="() => generateReportPdf('download')") Download PDF
                  el-dropdown-item(:command="() => generateReport()") Generate Report
                  JsonExcel(
                    class="btn btn-default",
                    :data="sales.data",
                    :fields="json_fields",
                    name="Report",
                    type="xlsx",
                    v-if="sales"
                  )
                    el-dropdown-item Export to Excel sheet
  EmptyState(empty-text="No Results" v-if="!sales", :style="{ height: '400px' }")
  .columns.mt-10.appView(v-if="sales")
    .column.is-7
      div
        h5#b.title.is-4.mb-10.font-size-17 {{ reportTitle }}
      el-table(
        :data="sales.data",
        :empty-text="emptyText",
        :height="700"
        :max-height="700"
        :stripe="true"
        v-if="sales"
        :border="true"
      )
        el-table-column(label="No", type="index", :index="1")
        el-table-column(show-overflow-tooltip, :label="typeId", align="left" sortable)
          template(slot-scope="scope")
            span {{ parseColData(scope.row[`${type}_id`]) }}
        el-table-column(:prop="type", show-overflow-tooltip, :label="typeLabel", align="left" sortable)
          template(slot-scope="scope")
            span {{ scope.row.name || scope.row.full_name }}
        el-table-column(:prop="reportTypeCol", show-overflow-tooltip, :label="reportTypeColLabel", align="left" sortable)
    .column.is-5
      div
        el-select(@change="changeChartType", :value="chartType", size="mini", placeholder="Chart type")
          el-option(label="Bar Chart" value="bar")
          el-option(label="Pie Chart" value="pie")
          el-option(label="Line Chart" value="line")
          el-option(label="PolarArea Chart" value="polarArea")
          el-option(label="Doughnut Chart" value="doughnut")
      div(:style="{ 'min-height': '500px' }")
        vue-chart(:type="chartType", v-if="displayChart", :height="300", :options="options", :data="chartData", id="myChart")
        Loading(loading-text="Loading graph" v-else, :style="{ height: '400px' }")
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
import EmptyState from "@/components/EmptyState";
import { formatDate, dateForHumans } from "@/filters/format";
import { mapActions, mapState } from "vuex";
import Loading from "@/components/shared/Loading";
import JsonExcel from "vue-json-excel";
import VueChart from 'vue-chart-js'
import { COLOR_PALETTE } from '@/utils/constants'
import {
  parseColData,
  ucFirst,
  createImgOnCanvas,
} from "@/utils/helper";
import pluralize from "pluralize";
import $ from "jquery";
import MoneyMixin from "@/mixins/MoneyMixin";
import imgLetterHead from "@/assets/img/AXXIMUTH2.jpg";
import _ from "lodash";
let jsPDF = require("jspdf");
require("jspdf-autotable");

export default {

  props: {
    type: {
      required: true,
    },
  },

  mixins: [MoneyMixin],

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
        currentBranch: null,
      },
      branchSuggestions: [],
      remarks: "",
      isGeneratingPDF: false,
      reportTimeRange: null,
      loadingBranches: false,
      chartType: "bar",
      displayChart: false,
      sales: null,
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
              backgroundColor: "red",
            },
          ],
          xAxes: [
            {
              display: false,
            },
          ],
        },
      },
    };
  },


  components: {
    EmptyState,
    Loading,
    VueChart,
    JsonExcel
  },

  methods: {

    ...mapActions("branch", ["loadBranches"]),

    ...mapActions("reports", ["loadReport"]),

    ...{ formatDate, dateForHumans, parseColData },
    
    _loadBranches (query) {
      if (query) {
        this.loadingBranches = true
        this.loadBranches({
          name: query,
          store_id: this.settings.store.id
        }).then((res) => {
          this.branchSuggestions = res.data
          this.loadingBranches = false
        }).catch(() => {
          this.loadingBranches = false
        })
      }
    },


    typeLabelValue(scope) {
      const TYPE = scope[this.type];
      if (TYPE instanceof Array) {
        if (!TYPE.length) {
          return "-";
        }
        return TYPE[0].firstname;
      }
      return TYPE;
    },


    handleCommand(command) {
      if (!command) return 
      command();
    },


    generateReportPdf(action) {
      const columns = [
        { title: "No", dataKey: "index" },
        { title: this.typeId, dataKey: `${this.type}_id` },
        { title: this.typeLabel, dataKey: this.type === 'product' ? 'name' : 'full_name' },
        { title: ucFirst(this.title), dataKey: this.reportTypeCol },
      ];
      console.log(columns)
      this.isGeneratingPDF = true;
      let imgData = document.getElementById("myChart").toDataURL("image/jpg");
      let remarks = $("#remarks").val();
      let headerMarginTop = 55;
      createImgOnCanvas(imgLetterHead, letterHead => {
        let printDoc = new jsPDF();
        printDoc.addImage(letterHead, "JPEG", 0, 0, 210, 297);
        printDoc.setFontType("bold");
        printDoc.setFontSize(16);
        printDoc.autoTable(columns, this.sales.data, {
          styles: {
            cellPadding: 6,
            fontSize: 10,
          },
          headerStyles: { fillColor: 255, textColor: 0 },
          alternateRowStyles: { fillColor: false },
          bodyStyles: { fillColor: false },
          columnStyles: {
            index: { columnWidth: 25 },
            [`${this.type}id`]: { columnWidth: 35 },
            [this.type]: { columnWidth: 80 },
          },
          margin: { top: headerMarginTop },
          addPageContent: data => {
            printDoc.setFontType("bold");
            printDoc.setFontSize(16);
            if (data.pageCount > 1) {
              headerMarginTop = 20;
            }
            console.log(this.reportTitle)
            printDoc.text(this.reportTitle, 15, 46);
          },
        });
        printDoc.addPage();
        printDoc.addImage(imgData, "JPEG", 15, 40, 180, 180);
        if (remarks) {
          printDoc.addPage();
          printDoc.setFontType("bold");
          printDoc.setFontSize(25);
          printDoc.text("Remarks", 20, 30);
          printDoc.setFontType("normal");
          printDoc.setFontSize(11);
          remarks = printDoc.splitTextToSize($("#remarks").val(), 170);
          printDoc.text(remarks, 20, 40);
        }
        if (action === "preview") {
          printDoc.output("dataurlnewwindow");
        } else if (action === "download") {
          printDoc.save("report.pdf");
        }
      });
    },

    parseTitle(title, row) {
      const moneyTitle = ["profit", "total"];
      if (moneyTitle.includes(title)) {
        return this.money(row[title]);
      }
      return row[title];
    },

    setTimeRange(value) {
      this.filter.range = [
        this.$moment()
          .startOf(value)
          .format("YYYY-MM-DD HH:mm:ss"),
        this.$moment()
          .endOf(value)
          .format("YYYY-MM-DD HH:mm:ss"),
      ]
    },

    changeChartType(type) {
      this.displayChart = false;
      setTimeout(() => {
        this.chartType = type;
        this.displayChart = true;
      }, 1000);
    },

    processPayload () {
      const { 
        type,
        column,
        limit,
        range,
        currentBranch,
        store = {}
      } = this.filter;

      return {
        fromtime: range[0],
        totime: range[1],
        direction: type,
        type: column,
        limit: limit,
        report_type: this.type,
        branch_id: currentBranch || this.settings.branch.id,
        store_id: store.id || this.settings.store.id,
      }

    },

    generateReport() {

      this.sales = null;

      this.isLoading = true;

      this.$emit("loading", true);

      this.loadReport(this.processPayload())
      .then(({ data, meta }) => {

        this.$emit("loading", false)

        this.isLoading = false

        this.sales = { data, meta }
        
        this.sales.data = this.sales.data.map((s, i) => {
          s[this.type] = this.typeLabelValue(s);
          s[`parsed${ucFirst(this.title)}`] = this.parseTitle(
            this.title,
            s,
          );
          s.index = i + 1;
          return s
        })

        this.displayChart = true;

      })
      .catch(err => {
        this.$emit("loading", false);
        this.isLoading = false;
      });
    }

  },

  computed: {

    ...mapState("employees", ["selectedEmployee"]),

    ...mapState("settings", ["settings"]),

    ...mapState("store", ["store"]),

    ...mapState("branch", ["currentBranch"]),

    title() {
      let title;
      const cols = ["quantity", "discount", "tax", "profit", "total"];
      cols.forEach(c => {
        if (this.sales.meta.type === c) {
          title = c;
        }
      });
      return this.sales.meta.type;
    },

    chartData() {
      return {
        labels: _.map(this.sales.data, 'name'),
        datasets: [
          {
            label: `${ucFirst(this.sales.meta.type)} of ${pluralize(ucFirst(this.type))}`,
            data: _.map(this.sales.data, this.sales.meta.type),
            backgroundColor: COLOR_PALETTE,
            borderWidth: 1,
          },
        ],
      };
    },

    emptyText() {
      return `No results`;
    },

    typeLabel() {
      return ucFirst(`${this.type} Name`);
    },

    typeId() {
      return ucFirst(`${this.type} ID`);
    },

    reportTypeCol() {
      return `parsed${ucFirst(this.title)}`;
    },

    reportTypeColLabel() {
      return `${ucFirst(this.sales.meta.type)}`;
    },

    json_fields() {
      return {
        No: "index",
        [this.typeId]: `${this.type}_id`,
        [`${this.typeLabel}`]: this.type === 'product' ? 'name' : 'full_name',
        [`${this.reportTypeColLabel}`]: this.reportTypeCol,
      };
    },

    reportTitle() {
      return `${ucFirst(this.sales.meta.direction)} ${this.sales.meta.limit} ${ucFirst(this.type)} Sales (${ucFirst(this.sales.meta.type)})`;
    },

  },
};
</script>

<style lang="sass" scoped>
  .columns
    padding: 2.5rem !important
    padding-top: 10px !important
</style>

<style lang="sass">
.reportFilters
  .el-dropdown__caret-button
      height: 28px !important
</style>
