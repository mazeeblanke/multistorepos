<template lang="pug">
  section.section
    .container-fluid
      .columns.is-gapless
        .column.is-2
          SideBar
        .column.is-10
          .BaseAppCard.card(ref='base-card')
            header.card-header
              p.card-header-title Branch Management
              p.level-item.page-title.subtitle.is-5
                span.tag.is-medium Branch: {{ settings.branch.name }}
              a.card-header-icon
                span.el-icon-more-outline.font-size-23
            .tabs
              ul
                router-link(
                  tag="li", 
                  :to="{name: 'branches_list'}", 
                  active-class="is-active"
                )
                  a Branches
            .tab-content
              router-view(@formPanelClose='resetScroll')
</template>

<script>

import { mapState } from 'vuex'
import SideBar from '@/components/shared/SideBar'
const BASE_PATH = '/app/branches'

const redirectIfBase = (to, next) => {
  if (to.path === BASE_PATH) {
    next({ name: 'branches_list' })
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
    ...mapState('settings', ['settings'])
  },

  beforeRouteEnter (to, from, next) {
    redirectIfBase(to, next)
  },

  beforeRouteUpdate (to, from, next) {
    redirectIfBase(to, next)
  },

  methods: {
    resetScroll () {
      this.$scrollTo(this.$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        cancelable: false
      })
    }
  },

  components: {
    SideBar
  }

}
</script>

<style lang="sass">
  .BaseAppCard
    min-height: 698px
</style>
