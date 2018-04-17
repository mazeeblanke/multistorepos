<template lang="pug">
    div.mt-10.annualSales           
      button.button.is-primary.ml-25(@click="addAnnualSales")
        span.icon
          i.material-icons add
        span Add Annual Sales             
      el-table(
        ref="pricing-table",
        :data="newVendor.annualSales",
        max-height="250"
        :highlight-current-row="true",
        empty-text="No annual sales",
        @selection-change="handleSelectionChange",
        :stripe="true",
        ) 
          div(slot="empty")   
            //- EmptyState(empty-text="Add Annual sales")
            button.button.is-primary(@click="addAnnualSales")
              span.icon
                i.material-icons add
              span Add Annual Sales
          el-table-column(type="selection") 
          el-table-column(type="index", align="center", :index="1", label="No")
          el-table-column(label="Year")
            template(slot-scope="props")
              el-date-picker(
                v-model="newVendor.annualSales[props.$index].year"
                type="year"
                value-format="yyyy"
                placeholder="Pick a year")
          el-table-column(prop="annual_value_of_total_sales" show-overflow-tooltip, label="Annual Value of Total Sales", :sortable="true")
            template(slot-scope="props")
              el-input(
                v-model="newVendor.annualSales[props.$index].totalSales",
                type='text',
                placeholder="e.g $233,434",
              )
          el-table-column(prop="annual_value_of_export_sales" show-overflow-tooltip, label="Annual Value of Export Sales", :sortable="true")
            template(slot-scope="props")
              el-input(
                v-model="newVendor.annualSales[props.$index].exportSales",
                type='text',
                placeholder="e.g $123,304",
            ) 
          el-table-column(label="Delete", :render-header="renderDelete",  width="80")
            template(slot-scope="scope", scope="props")
              button.button.trash(:class="$style.trash" @click="deleteItem([props.row])")
                i.material-icons delete    
</template>

<script>
import { mapState, mapActions } from 'vuex'
import deleteMixin from '@/mixins/DeleteMixin'
import EmptyState from '@/components/EmptyState'

export default {
  data () {
    return {
      // tabIndex: 0,
    }
  },
  computed: {
    ...mapState('vendors', ['newVendor'])
    // annualSales() {
    //   if (this.newVendor) {
    //     return this.newVendor.annualSales;
    //   }
    //   return [];
    // },
  },
  methods: {
    ...mapActions('vendors', ['addAnnualSales', 'clearAnnualSales']),
    warnUser () {
      return this.$swal({
        title: 'Are you sure?',
        text: 'Do you want to remove selected file(s) ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      })
    },
    deleteItem (item) {
      this.deleteItems(item)
    },
    deleteItems (item = null) {
      const itemsToDelete = (item instanceof Array && item) || this.selectedItems
      this.warnUser().then(() => {
        this.clearAnnualSales(itemsToDelete)
        this.$snackbar.open('sucessfully removed file(s)!')
      })
    }
  },
  components: {
    EmptyState
  },
  mixins: [deleteMixin]
}
</script>

<style lang="sass">
.annualSales
  .el-date-editor
     width: 100%
</style>

<style lang="sass" module>
.columns
  margin: 0px 50px
.trash
  border: none
  background: transparent
</style>
