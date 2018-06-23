<template lang="pug">
div.mt-10
  div
    el-select(
      @change="changeChartType", 
      :value="chartType", 
      size="mini", 
      placeholder="Chart type"
    )
      el-option(label="Bar Chart" value="bar")
      el-option(label="Pie Chart" value="pie")
      el-option(label="Line Chart" value="line")
      el-option(label="PolarArea Chart" value="polarArea")
      el-option(label="Doughnut Chart" value="doughnut")
  div(:style="{ 'min-height': '450px' }")
    vue-chart#myChart(
      :type="chartType", 
      v-if="displayChart", 
      :height="300", 
      :options="options", 
      :data="chartData"
    )
    Loading(
      loading-text="Loading graph", 
      v-if="!displayChart", 
      :style="{ height: '400px' }"
    )
  div.mt-30
    h6.title.is-4.mb-10 Remarks
    el-input#remarks(
      type="textarea"
      :rows="5"
      placeholder="Enter remarks"
      v-model="remarks"
    )
</template>

<script>
/* eslint-disable */
import VueChart from 'vue-chart-js'
import Loading from '@/components/shared/Loading'

export default {
  props: ['chartData'],

  data () {
    return {
      chartType: 'line',
      displayChart: false,
      remarks: null,
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

  watch: {
    chartData: {
      handler (newVal) {
        if (newVal) {
          setTimeout(() => {
            this.displayChart = true
          }, 1000)
        }
      },
      immediate: true
    }
  },

  methods: {
    changeChartType (type) {
      this.displayChart = false
      setTimeout(() => {
        this.chartType = type
        this.displayChart = true
      }, 500)
    },
  }, 

  components: {
    VueChart,
    Loading
  }

} 
</script>

<style lang="sass">
  
</style>