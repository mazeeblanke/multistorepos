<template lang="pug">
  .SalesView.shadow-divider
    .level.toolbar
      .level-left
        .level-item
          router-link.button(:to="{name: 'sale_details_list'}")
            span.icon.is-medium
              i.material-icons keyboard_arrow_left
        .level-item(v-if="selectedSaleDetail")
          .page-title.subtitle.is-6
            span.mr-5 Viewing Sales
      .level-right
        .level-item
          JsonExcel(
            class="btn btn-default",
            :data="selectedSaleDetail.sales",
            :fields="json_fields",
            :name="documentName",
            type="xlsx",
            v-if="selectedSaleDetail"
          )
            button.button.is-primary(
              :disabled="!selectedSaleDetail.sales"
            ) 
              span.el-icon-download.mr-5
              span Download Purchase history
        // .level-item
        //   .field.has-addons
        //     p.control
        //       button.button.is-info
        //         span.icon.mr-5
        //           i.material-icons timeline
        //         span Generate Receipt
    Loading(loading-text="Loading sales information..." v-if="isLoading", :style="{ height: '400px' }")
    el-tabs(v-model="currentTab", value='summary', type="card", v-if="!isLoading")
      el-tab-pane(name="details", label='Product Details')
        .columns(:class="$style.columns" v-if="selectedSaleDetail")
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Tax:
              .field-label.is-normal
                  label.label.is-pulled-left  {{ selectedSaleDetail.tax }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Threshold: 
              .field-label.is-normal
                label.label.is-pulled-left  {{ selectedSaleDetail.threshold }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Sold By:
              .field-label.is-normal
                label.label.is-pulled-left {{ selectedSaleDetail.user.full_name }}  
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Total:
              .field-label.is-normal
                label.label.is-pulled-left  {{ selectedSaleDetail.total }}  
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Sold At :
              .field-label.is-normal
                label.label.is-pulled-left {{ selectedSaleDetail.created_at }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Amount Paid:
              .field-label.is-normal
                label.label.is-pulled-left  {{ selectedSaleDetail.amount_paid }}    
        .mt-50
          h5.title.is-5.has-text-centered Sales Data
          el-table(
            v-loading="isLoading"
            :data="selectedSaleDetail.sales",
            :default-sort="{prop: 'created_at', order: 'descending'}",
            :max-height="300"
            :height="300"
          )
            el-table-column(label="No", type="index", :index="1")
            el-table-column(prop="id", label="Sale ID")
            el-table-column(prop="product.name", show-overflow-tooltip, label="Product", sortable)
            el-table-column(prop="sub_total", show-overflow-tooltip, label="Total")
            el-table-column(prop="unit_price", show-overflow-tooltip, label="Unit Price")
            el-table-column(prop="payment_type", show-overflow-tooltip, label="Payment method")
            el-table-column(prop="quantity", show-overflow-tooltip, label="Qty Bought")         
            el-table-column(prop="created_at", show-overflow-tooltip, label="Sold At")  
              template(slot-scope="props")
                span {{ formatDate(props.row.created_at)}} 
      // el-tab-pane(name="analytics", label='Sale Analytics')              
</template>

<script>
import EmptyState from '@/components/EmptyState'
import { formatDate, dateForHumans } from '@/filters/format'
import { mapActions, mapState, mapMutations } from 'vuex'
import Loading from '@/components/shared/Loading'
import JsonExcel from 'vue-json-excel'
export default {

  data () {
    return {
      isLoading: false,
      currentTab: 'details',
      filter: {
        aggregate: 0,
        limit: 4,
        with_user: 1,
        persist: false
      },
      json_fields: {
        'Sales ID': 'id',
        Product: 'product.name',
        Total: 'sub_total',
        Unitprice: 'unit_price',
        'Sold By': 'user.full_name',
        'Branch': 'branch.name',
        'Payment Method': 'payment_type',
        'Qty Bought': 'quantity',
        'Sold At': 'created_at'
      }
    }
  },

  mounted () {
    this.clearSelectedSaleDetail()
    this.isLoading = true
    this.SET_FORM_STATE(true)
    this.getReceipt({
      id: this.$route.params.id
    })
      .then(() => {
        this.isLoading = false
      })
      .catch(err => {
        console.log(err)
        this.$snackbar.open({
          message: 'Could not find a sale detail with that ID',
          type: 'is-danger'
        })
        this.isLoading = false
        this.$router.push({ name: 'sale_details_list' })
      })
  },
  components: {
    EmptyState,
    Loading,
    JsonExcel
  },
  methods: {

    ...{ formatDate, dateForHumans },

    ...mapActions('sales', [
      'loadSales',
      'clearSelectedSaleDetail',
      'getReceipt'
    ]),

    ...mapMutations('app', [
      'SET_FORM_STATE'
    ])

  },

  computed: {

    ...mapState('sales', ['selectedSaleDetail']),

    documentName () {
      return 'sales_history'
    }

  }

}
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
// .el-table__body-wrapper
//   overflow-x: hidden
.el-progress
  padding: 25px
  position: absolute
  top: 5%
  z-index: 23
  width: 100%  
</style>

<style lang="sass" module> 
.columns
  margin: 20px 50px 10px 50px
.trash
  border: none
  background: transparent    
</style>
