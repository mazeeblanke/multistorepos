<template lang="pug">
  .SettingsView.shadow-divider
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
  data () {
    return {
      previewingDoc: false,
      isLoading: false,
      fullScreenActive: false,
      isLoadingSales: false
    }
  },

  methods: {

    handleOpen () {},

    handleClose () {}

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
.shadow-divider
  box-shadow: none !important;
  min-height: 560px !important;
  height: 100%
.columns
  height: 80vh !important
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
    background-color: #ecf5ff !important
    color: #0a44ae !important
  .el-loading-mask
    z-index: 0 !important
</style>
