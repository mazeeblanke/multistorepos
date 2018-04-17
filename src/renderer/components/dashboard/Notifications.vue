<template lang="pug">
  .Notifications.card
    .card-header
      p.card-header-title Notifications
      //- div.notificationSearch.is-h-centered
      //-   el-input(
      //-     placeholder="Search notifications...", 
      //-     clearable,
      //-     class="input-with-select"
      //-   )
      a.card-header-icon
        span.icon
          i.material-icons keyboard_arrow_down
    el-tabs(v-model="currentTab", value='summary', type="card")
      el-tab-pane.p-0(name="enquirires_list", label='Enquiries') 
        EnquiriesList 
      el-tab-pane.p-0(name="expired_products", label='Expired Products', :style="{ 'min-height': '400px' }")
        ExpiredProductsList  
      el-tab-pane.p-0(name="close_to_expired_products", label='Close to Expired Products ')  
        CloseToExpiredProductsList                  
      el-tab-pane.p-0(name="reorder_products", label='Reorder Products ')  
        ReorderProductsList                  
</template>

<script>
import Loading from '@/components/shared/Loading'
// import { f } from '@/filters/format';
import { formatDate, formatStatus, dateForHumans, formatTimeAgo } from '@/filters/format'
import EnquiriesList from '@/components/products/enquiries/EnquiriesList'
import ExpiredProductsList from '@/components/products/ExpiredProductsList'
import CloseToExpiredProductsList from '@/components/products/CloseToExpiredProductsList'
import ReorderProductsList from '@/components/products/ReorderProductsList'

export default {
  props: {
    notifications: Array
  },
  data () {
    return {
      currentTab: 'enquirires_list'
    }
  },
  filters: {
    ...{ formatTimeAgo }
  },
  methods: {
    ...{ formatDate, formatStatus, dateForHumans }
  },
  components: {
    Loading,
    EnquiriesList,
    ExpiredProductsList,
    CloseToExpiredProductsList,
    ReorderProductsList
  }
}
</script>

<style lang="sass">
  .Notifications
    min-height: 450px !important
</style>

<<style lang="sass">
  .notificationSearch
    margin-right: 10px !important
    .el-input 
      width: 300px !important
</style>
