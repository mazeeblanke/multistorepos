<template lang="pug">
  .SettingsView.shadow-divider
    div.columns.is-mobile
      .column.is-2
        el-menu(
          default-active="/app/settings/v/general",
          class="el-menu-vertical-demo",
          :router="true"
        )
          el-menu-item(index="/app/settings/v/general")
            b-icon.mr-5(icon="settings")
            span General
          el-menu-item(index="/app/settings/v/profile")
            b-icon.mr-5(icon="person")
            span Profile
          el-menu-item(index="/app/settings/v/templates")
            b-icon.mr-5(icon="system_update_alt")
            span Templates
          el-menu-item(index="/app/settings/v/printer_settings")
            span.material-icons.mr-5 print
            span Printer Settings
          el-menu-item(index="5")
            b-icon.mr-5(icon="assignment")
            span Invoice Settings
          el-menu-item(index="5")
            b-icon.mr-5(icon="restore")
            span Reset
          el-menu-item(index="/app/settings/v/about")
            b-icon.mr-5(icon="info")
            span About
      .column.is-10
        router-view

</template>

<script>

const BASE_PATH = '/app/settings/v'

const redirectIfBase = (to, next) => {
  if (to.path === BASE_PATH) {
    next({ name: 'general' })
  } else {
    next()
  }
}

export default {
  beforeRouteEnter (to, from, next) {
    redirectIfBase(to, next)
  },

  beforeRouteUpdate (to, from, next) {
    redirectIfBase(to, next)
  }
}
</script>

<style lang="sass" scoped>
.shadow-divider
  box-shadow: none !important;
  height: 690px
.columns
  height: 103% !important
</style>

<style lang="sass">
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
    height: 100% !important
  .is-active
    background-color: #ffffff !important
    color: #05296b !important
  .el-loading-mask
    z-index: 0 !important
</style>
