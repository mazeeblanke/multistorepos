<template lang="pug">
  section.section
    .container-fluid
      .columns.is-gapless
        .column(
          v-show="$can('admin|superadmin')", 
          :class="$can('admin|superadmin') ? 'is-2' : ''"
        )
          SideBar
        .column(:class="$can('admin|superadmin') ? 'is-10' : ''")
          .reportManagement.BaseAppCard.card(ref='base-card')
            header.card-header
              p.card-header-title Report Management
              p.level-item.page-title.subtitle.is-5
                span.tag.is-medium Branch: {{ settings.branch.name }}
              a.card-header-icon
                span.el-icon-more-outline.font-size-23
            .tab-content
              .MaterialView.shadow-divider
                el-tabs(v-model="currentTab", value='summary', type="card")
                  el-tab-pane(
                    name="sales_report", 
                    label='Product Sales Report', 
                    v-loading="isLoadingProductReport", 
                    :style="{ 'min-height': '400px' }"
                  )
                    Report(
                      type="product",
                      @loading="(l) => isLoadingProductReport = l"
                    )
                  el-tab-pane(
                    name="customers_report", 
                    v-loading="isLoadingCustomerReport", 
                    label='Customers Report'
                  )
                    Report(
                      type="customer",
                      @loading="(l) => isLoadingCustomerReport = l"
                    )
                  el-tab-pane(
                    name="employees_report", 
                    v-loading="isLoadingEmployeeReport", 
                    label='Employees Report'
                  )
                    Report(
                      type="employee",
                      @loading="(l) => isLoadingEmployeeReport = l"
                    )
</template>

<script>
/* eslint-disable */
import { formatDate, formatMoney, dateForHumans } from '@/filters/format';
import { mapActions, mapState, mapMutations } from 'vuex';
import SideBar from '@/components/shared/SideBar';
import Report from '@/components/Reports/Report';

export default {

  beforeRouteEnter: (to, from, next) => {
    next((vm) => {
      vm.SET_FORM_STATE(true)
    })
  },

  beforeRouteLeave: (to, from, next) => {
    next((vm) => {
      this.SET_FORM_STATE(false)
    })
  },

  data() {
    return {
      selectedMaterials: [],
      isLoadingProductReport: false,
      isLoadingCustomerReport: false,
      isLoadingEmployeeReport: false,
      currentTab: 'sales_report',
    };
  },

  components: {

    SideBar,

    Report

  },

  methods: {
    ...{ formatDate, dateForHumans },

    ...mapMutations('app', [
      'SET_FORM_STATE'
    ])
  },

  computed: {
    ...mapState('settings', [
      'settings',
    ])
  }

}
</script>

<style lang="sass" scoped>
.label
  font-weight: 100
.shadow-divider
  box-shadow: 0px 0px 4px 0 rgba(0, 0, 0, 0.08) inset !important;
  min-height: 560px !important;
</style>

<style lang="sass">
.reportManagement
  .el-tab-pane
    padding: 0px !important
.el-progress
  padding: 25px
  position: absolute
  top: 5%
  z-index: 23
  width: 100%
h5
 text-transform: capitalize

</style>

