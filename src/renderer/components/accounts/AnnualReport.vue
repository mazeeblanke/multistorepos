<template lang="pug">
div
  Loading.h400(loading-text="Loading annual report", v-if="(loading && !reportData.length)")
  .columns 
    .column.is-8
      el-table(
        :data="reportData",
        :min-height=580,
        :height=580,
        :border="false",
        v-if="reportData.length",
        show-summary,
        :summary-method="getSummaries"
      )
        el-table-column(prop="month", show-overflow-tooltip, label="Month")
          template(slot-scope="scope") 
            span.el-icon-date.mr-5
            span.is-capitalized {{ scope.row.month }}
        el-table-column(prop="expenditure", show-overflow-tooltip, label="Expenditure")
          template(slot-scope="scope") 
            span.is-capitalized {{ money(scope.row.expenditure) }}
        el-table-column(prop="sales", show-overflow-tooltip, label="Sales")
          template(slot-scope="scope") 
            span.is-capitalized {{ money(scope.row.sales) }}
        el-table-column(prop="profit", show-overflow-tooltip, label="Profit")
          template(slot-scope="scope") 
            span.is-capitalized {{ money(scope.row.profit) }}
    .column.is-4 
      Chart.mb-10(:chartData="chartData")
</template>

<script>
/* eslint-disable */
import Loading from '@/components/shared/Loading'
import { mapActions, mapState } from 'vuex'
import MoneyMixin from '@/mixins/MoneyMixin'
import Chart from '@/components/shared/Chart'
import { COLOR_PALETTE } from '@/utils/constants'

export default {
  data () {
    return {
      loading: true,
      reportData: []
    }
  },

  components: {
    Loading,
    Chart
  },

  methods: {

    ...mapActions('reports', ['loadAnnualReport']),

    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = 'Total Cost';
          return;
        }
        const values = data.map(item => Number(item[column.property]));
        if (!values.every(value => isNaN(value))) {
          sums[index] = '$ ' + values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
        } else {
          sums[index] = 'N/A';
        }
      });
      return sums;
    }

  },

  mixins: [MoneyMixin],

  mounted () {
    this.loadAnnualReport({
      store_id: this.settings.store.id,
      branch_id: this.settings.branch.id,
      date_year: 2018
    }).then((res) => {
      this.reportData = res
    }).catch((err) => {
      console.log(err.data)
      this.$snackbar.open({
        type: 'is-danger',
        message: 'error occurred!!'
      })
    })
  },

  computed: {

    ...mapState('settings', ['settings']),

    chartData () {
      return {
        labels: this.reportData.map(d => d.month),
        datasets: [{
          label: 'Annual Report',
          data: this.reportData.map(d => d.profit),
          backgroundColor: COLOR_PALETTE,
          borderWidth: 1
        }]
      }
    }

  }
}
</script>

<style lang="sass">
  
</style>
