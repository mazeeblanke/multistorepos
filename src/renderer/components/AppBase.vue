<template lang="pug">
  .AppBase
    NavBar
    #snap-screen.u-flex-fill(
      ref="snap-screen"
      :class="{ 'is-v-flex-start': formPanelOpen }"
    )
      router-view
</template>

<script>
import NavBar from '@/components/NavBar'
import { mapState, mapActions } from 'vuex'

export default {

  components: {
    NavBar
  },

  mounted () {
    if (!this.settings) {
      this.loadSettings()
    }
  },

  watch: {
    $route (newValue) {
      if (!this.settings) {
        this.loadSettings()
      }
    }
  },

  methods: {
    ...mapActions('settings', ['loadSettings'])
  },

  computed: {
    ...mapState('settings', ['settings']),
    ...mapState('app', ['formPanelOpen'])
  }

}
</script>
