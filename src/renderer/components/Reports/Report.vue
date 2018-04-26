<<template lang="pug">
div
  .reportFilters
    .level.toolbar.shadow-divider
      .level-left
      .level-right
        .level-item
          el-form(:inline="true", :model="filter" class="demo-form-inline")
            el-form-item(label="" v-show="$can('super-admin')")
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
                el-option(label="Top" value="top")
                el-option(label="Bottom" value="bottom")
            el-form-item(label="")
              el-select(v-model="filter.column", size="mini", clearable, placeholder="Type")
                el-option(label="Quantity" value="quantity")
                el-option(label="Discount" value="discount")
                el-option(label="Tax" value="tax")
                el-option(label="Total" value="total")
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
                el-option(label="Hourly" value="hourly")
                el-option(label="Daily" value="daily")
                el-option(label="Weekly" value="weekly")
                el-option(label="Monthly" value="monthly")
                el-option(label="Quarterly" value="quarterly")
                el-option(label="Anually" value="anually")
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
            span {{ parseColData(scope.row[`${type}id`]) }}
        el-table-column(:prop="type", show-overflow-tooltip, :label="typeLabel", align="left" sortable)
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
import EmployeeForm from "@/components/employees/EmployeeForm";
import FullscreenDialog from "@/components/shared/FullscreenDialog";
import Loading from "@/components/shared/Loading";
import JsonExcel from "vue-json-excel";
import {
  ObjectToFormData,
  parseColData,
  createImgOnCanvas,
} from "@/utils/helper";
import VueChart from "vue-chart-js";
import pluralize from "pluralize";
import $ from "jquery";
import MoneyMixin from "@/mixins/MoneyMixin";
import imgLetterHead from "@/assets/img/AXXIMUTH2.jpg";
import _ from "lodash";
let jsPDF = require("jspdf");
require("jspdf-autotable");

const ucFirst = s => s.charAt(0).toUpperCase() + s.slice(1);
const DAILY = "daily";
const WEEKLY = "weekly";
const HOURLY = "hourly";
const MONTHLY = "monthly";
const QUARTERLY = "quarterly";
const ANUALLY = "anually";

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
    EmployeeForm,
    FullscreenDialog,
    JsonExcel,
    VueChart,
  },
  methods: {
    ...mapActions("branch", ["loadBranches", "searchBranches"]),
    _loadBranches(query) {
      if (query !== "") {
        this.loadingBranches = true;
        this.searchBranches({
          search: query,
          type: "branch",
        })
          .then(res => {
            this.branchSuggestions = res;
            this.loadingBranches = false;
          })
          .catch(() => {
            this.loadingBranches = false;
          });
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
      command();
    },
    generateReportPdf(action) {
      const columns = [
        { title: "No", dataKey: "index" },
        { title: this.typeId, dataKey: `${this.type}id` },
        { title: this.typeLabel, dataKey: this.type },
        { title: ucFirst(this.title), dataKey: this.reportTypeCol },
      ];
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
          headerStyles: { fillColor: 255, textColor: "black" },
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
      if (value === DAILY) {
        this.filter.range = [
          this.$moment()
            .startOf("day")
            .format("YYYY-MM-DD HH:mm:ss"),
          this.$moment()
            .endOf("day")
            .format("YYYY-MM-DD HH:mm:ss"),
        ];
      }

      if (value === WEEKLY) {
        this.filter.range = [
          this.$moment()
            .startOf("week")
            .format("YYYY-MM-DD HH:mm:ss"),
          this.$moment()
            .endOf("week")
            .format("YYYY-MM-DD HH:mm:ss"),
        ];
      }

      if (value === MONTHLY) {
        this.filter.range = [
          this.$moment()
            .startOf("month")
            .format("YYYY-MM-DD HH:mm:ss"),
          this.$moment()
            .endOf("month")
            .format("YYYY-MM-DD HH:mm:ss"),
        ];
      }

      if (value === QUARTERLY) {
        this.filter.range = [
          this.$moment()
            .startOf("quarter")
            .format("YYYY-MM-DD HH:mm:ss"),
          this.$moment()
            .endOf("quarter")
            .format("YYYY-MM-DD HH:mm:ss"),
        ];
      }

      if (value === ANUALLY) {
        this.filter.range = [
          this.$moment()
            .startOf("year")
            .format("YYYY-MM-DD HH:mm:ss"),
          this.$moment()
            .endOf("year")
            .format("YYYY-MM-DD HH:mm:ss"),
        ];
      }

      if (value === HOURLY) {
        this.filter.range = [
          this.$moment()
            .startOf("hour")
            .format("YYYY-MM-DD HH:mm:ss"),
          this.$moment()
            .endOf("hour")
            .format("YYYY-MM-DD HH:mm:ss"),
        ];
      }
    },
    ...{ formatDate, dateForHumans },
    ...mapActions("sales", ["loadSales"]),
    changeChartType(type) {
      this.displayChart = false;
      setTimeout(() => {
        this.chartType = type;
        this.displayChart = true;
      }, 1000);
    },
    generateReport() {
      const { type, column, limit, range } = this.filter;
      const payload = {
        [`reporttopbottom${pluralize(this.type)}`]: "value",
        fromtime: range[0] || "1970-01-01 00:00:01",
        totime: range[1] || "7018-02-07 00:00:00",
        type: type || "top",
        column: column || "profit",
        limit: limit || 10,
        branchid: this.filter.currentBranch || this.currentBranch.id,
      };
      this.sales = null;
      this.isLoading = true;
      this.$emit("loading", true);
      this.loadSales(ObjectToFormData(payload))
        .then(res => {
          this.$emit("loading", false);
          this.isLoading = false;
          if (res.status === "Success") {
            this.sales = {
              data: res.message,
              meta: payload,
            };
            this.sales.data = this.sales.data.map((s, i) => {
              s[this.type] = this.typeLabelValue(s);
              s[`parsed${ucFirst(this.title)}`] = this.parseTitle(
                this.title,
                s,
              );
              s.index = i + 1;
              return s;
            });
            this.displayChart = true;
          }
        })
        .catch(err => {
          this.$emit("loading", false);
          this.isLoading = false;
        });
    },
    ...{ parseColData },
  },
  computed: {
    ...mapState("employees", ["selectedEmployee"]),
    ...mapState("store", ["store"]),
    ...mapState("branch", ["currentBranch"]),
    title() {
      let title;
      const cols = ["quantity", "discount", "tax", "profit", "total"];
      cols.forEach(c => {
        if (this.sales.meta.column === c) {
          title = c;
        }
      });
      return title;
    },
    chartData() {
      return {
        labels: _.map(this.sales.data, this.type),
        datasets: [
          {
            label: `${this.sales.meta.type} of ${pluralize(
              ucFirst(this.type),
            )}`,
            data: _.map(this.sales.data, this.sales.meta.column),
            // backgroundColor: _.map(this.sales.data, s => 'rgba(153, 102, 255, 1)'),
            backgroundColor: [
              "#05296b",
              "#14056b",
              "#055c6b",
              "#6b4705",
              "#031840",
              "#221702",
              "#020d22",
              "#042053",
              "#14056b",
              "#055c6b",
              "#6b4705",
              "#031840",
            ],
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
      return `${ucFirst(this.sales.meta.column)}`;
    },
    json_fields() {
      return {
        No: "index",
        [this.typeId]: `${this.type}id`,
        [`${this.typeLabel}`]: this.type,
        [`${this.reportTypeColLabel}`]: this.reportTypeCol,
      };
    },
    reportTitle() {
      return `${ucFirst(this.sales.meta.type)} ${this.sales.meta
        .limit} ${ucFirst(this.type)} Sales (${ucFirst(
        this.sales.meta.column,
      )})`;
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
