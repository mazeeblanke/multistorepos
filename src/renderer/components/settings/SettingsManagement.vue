<template lang="pug">
  section.section
    .container-fluid
      .columns.is-gapless
        .column.is-2
          SideBar
        .column.is-10
          .BaseAppCard.card
            header.card-header
              p.card-header-title Settings
              p.level-item.page-title.subtitle.is-5
                span.tag.is-medium Branch: {{ settings.branch.name }}
              a.card-header-icon
                span.el-icon-more-outline.font-size-23
            router-view
</template>

<script>
import SideBar from '@/components/shared/SideBar'
import { mapState } from 'vuex'

const BASE_PATH = '/app/settings'

const redirectIfBase = (to, next) => {
  if (to.path === BASE_PATH) {
    next({ name: 'SettingsView' })
  } else {
    next()
  }
}

export default {

  data () {
    return {
      activeTab: 0
    }
  },

  computed: {
    ...mapState('settings', [
      'settings'
    ])
  },

  beforeRouteEnter (to, from, next) {
    redirectIfBase(to, next)
  },

  components: {
    SideBar
  },

  beforeRouteUpdate (to, from, next) {
    redirectIfBase(to, next)
  }

}
</script>

