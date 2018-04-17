<template lang="pug">
  .SettingsView.shadow-divider
    Loading(loading-text="Loading product information" v-if="isLoading", :style="{ height: '400px' }")
    div.columns.is-mobile
      .column.is-2
        el-menu(
          default-active="2"
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          :router="true"
        )
          el-menu-item(index="/app/settings/v/general")
            b-icon.mr-5(icon="settings")
            span General
          el-menu-item(index="4")
            b-icon.mr-5(icon="system_update_alt")
            span Software Update
          el-menu-item(index="5")
            b-icon.mr-5(icon="restore")
            span Reset
          el-menu-item(index="6")
            b-icon.mr-5(icon="info")
            span About
      .column.is-10
        EmptyState(empty-text="Select a menu" v-if="$route.path === '/app/settings/v'", :style="{height: '400px'}")
        router-view(v-else)

</template>

<script>

import EmptyState from '@/components/EmptyState'
import { formatDate, dateForHumans } from '@/filters/format'
import { mapActions } from 'vuex'
import Loading from '@/components/shared/Loading'

const BASE_PATH = '/app/settings/v'
const redirectIfBase = (to, next) => {
  if (to.path === BASE_PATH) {
    next({ name: 'general' })
    // next()
  } else {
    next()
  }
}

export default {
  data () {
    return {
      previewingDoc: false,
      isLoading: false,
      fullScreenActive: false,
      isLoadingSales: false
    }
  },
  mounted () {

  },
  components: {
    EmptyState,
    Loading
  },
  methods: {
    ...{ formatDate, dateForHumans },
    ...mapActions('products', [
      'loadProduct',
      'clearSelectedProduct',
      'setSelectedProductSales'
    ]),
    handleOpen () {},
    handleClose () {},
    ...mapActions('sales', ['loadSales'])
  },
  computed: {},
  beforeRouteEnter (to, from, next) {
    redirectIfBase(to, next)
  },
  beforeRouteUpdate (to, from, next) {
    redirectIfBase(to, next)
  }
}
</script>

<style lang="sass" scoped>
.field-label
  text-align: left !important
.label
  font-weight: 100
.shadow-divider
  box-shadow: none !important;
  min-height: 560px !important;
  height: 100%
.columns
  // height: 75vh !important
  height: 80vh !important
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
.SettingsView
  .el-menu-item
    border-bottom: 1px solid #f3f3f3 !important
  .el-menu
    // height: 100% !important
    // height: 100vh !important
  .is-active
    background-color: #ecf5ff !important
    color: #0a44ae !important
  .el-loading-mask
    z-index: 0 !important
</style>

<style lang="sass" module>
.columns
  margin: 20px 50px 10px 50px
.trash
  border: none
  background: transparent
</style>
