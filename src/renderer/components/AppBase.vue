<template lang="pug">
  .AppBase
    NavBar
    #snap-screen.u-flex-fill
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
    // if (!this.settings) {
    this.loadSettings()
    // }
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
    ...mapState('settings', ['settings'])
  }

}
</script>
