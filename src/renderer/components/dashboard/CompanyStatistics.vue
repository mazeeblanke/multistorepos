<template lang="pug">
  .CompanyStatistics.card
    header.card-header
      p.card-header-title Product Statistics
      a.card-header-icon
        el-select(@change="changeChartType", :value="chartType", size="mini", placeholder="Chart type")
          el-option(label="Bar Chart" value="bar")
          el-option(label="Pie Chart" value="pie")
          el-option(label="Line Chart" value="line")
          el-option(label="PolarArea Chart" value="polarArea")
          el-option(label="Doughnut Chart" value="doughnut")
    .card-content.p-0
      .content
        vue-chart(:type="chartType", :width="1000", v-if="displayChart", :height="700", :options="options", :data="chartData")
        Loading(loading-text="Loading graph" v-else, :style="{ height: '250px' }")
</template>

<script>
/* eslint-disable */
import VueChart from 'vue-chart-js';
import { mapState } from 'vuex';
import Loading from '@/components/shared/Loading';

export default{
  // extends: Bar,
  data() {
    return {
      displayChart: true,
      chartType: 'pie',
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
            },
            barThickness: 2,
            backgroundColor: 'red',
            // gridLines: {
            //     display: false,
            // },
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
    };
  },
  mounted() {
    // this.renderChart(this.d);
  },
  methods: {
    changeChartType(type) {
      this.displayChart = false;
      setTimeout(() => {
        this.chartType = type;
        this.displayChart = true;
      }, 1000);
    },
  },
  computed: {
    ...mapState('dashboard', [
      'productsStats',
    ]),
    chartData() {
      if (this.productsStats) {
        return {
          labels: Object.keys(this.productsStats),
          datasets: [
            {
              label: 'products',
              data: Object.values(this.productsStats),
              backgroundColor: [
                '#14056b',
                '#055c6b',
                '#031840',
                '#221702',
                '#042053',
              ],
            },
          ],
        };
      }
      return [];
    },
  },
  components: {
    VueChart,
    Loading,
  },
};
</script>
