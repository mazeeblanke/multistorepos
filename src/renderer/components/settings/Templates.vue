<template lang="pug">
div.moduleTemplates
  h4.title.is-4.mt-30.mb-25 Templates
  el-table(
    ref="items_table",
    :data="templates",
    :max-height="600",
    :border="false"
  )
    el-table-column(label="Template")
      template(slot-scope="scope")
        span.is-capitalized {{ scope.row && scope.row.name }}
    el-table-column(label="Details", width="450")
      template(slot-scope="scope")
        span {{ scope.row && scope.row.details }}
    el-table-column(width="180")
      template(slot-scope="scope")
        JsonExcel(
          :data="[{}]",
          :fields="initColumns(scope.row.columns)",
          :name="`${scope.row.name} template.csv`",
          type="csv",
          v-if="scope.row"
        )
          el-button.downloadBtn(size="mini", type="info")
            i.mr-5 Download
            i.material-icons.font-size-13 unfold_more
</template>

<script>
import JsonExcel from 'vue-json-excel'

export default{

  components: {
    JsonExcel
  },

  methods: {
    initColumns (columns) {
      return columns.reduce((agg, curr) => {
        agg[curr] = {
          field: curr,
          callback: () => ''
        }
        return agg
      }, {})
    }
  },

  data () {
    return {
      templates: [
        {
          name: 'employees',
          icon: 'perm_identity',
          details: 'Employee template containing headings',
          columns: [
            'full_name',
            'username',
            'email',
            'status',
            'password',
            'access_level'
          ]
        },
        {
          name: 'customers',
          details: 'Customers template containing headings',
          columns: [
            'full_name',
            'address',
            'date_of_birth',
            'email',
            'marital_status',
            'gender',
            'town',
            'phone',
            'cardnumber'
          ]
        },
        {
          name: 'products',
          details: 'Products template containing headings',
          columns: [
            'quantity',
            'name',
            'reorder',
            'unitprice',
            'costprice',
            'barcode',
            'status'
          ]
        },
        {
          name: 'branches',
          details: 'Branches template containing headings',
          columns: [
            'name',
            'address',
            'email',
            'printout'
          ]
        },
        ...Array(5).fill(null)
      ]
    }
  }

}
</script>

<style lang="sass">
.moduleTemplates
  padding-right: 1.5rem
  .el-table tr
    height: 60px !important
  .downloadBtn
    span 
      display: flex
      align-items: center
      i 
        font-style: normal !important
</style>