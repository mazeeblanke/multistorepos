<template lang="pug">
  .wifi
    el-tooltip(
      content="Not Connected!", 
      placement="top", 
      v-if="!connection"
    )
      img.is-white(src="../../assets/img/wifi/white/signaloff.png")
    el-tooltip(
      :content="connection.ssid", 
      placement="top", 
      v-else-if="wifiStrength === 0"
    )
      img.is-white(src="../../assets/img/wifi/white/signal0.png")
    el-tooltip(
      :content="connection.ssid", 
      placement="top",
      v-else-if="wifiStrength === 1"
    )
      img.is-white(src="../../assets/img/wifi/white/signal1lock.png")
    el-tooltip(
      :content="connection.ssid",
      placement="top",
      v-else-if="wifiStrength === 2"
    )
      img.is-white(src="../../assets/img/wifi/white/signal2lock.png")
    el-tooltip(
      :content="connection.ssid", 
      placement="top",
      v-else-if="wifiStrength === 3"
    )
      img.is-white(src="../../assets/img/wifi/white/signal3lock.png")
    el-tooltip(
      :content="connection.ssid",
      placement="top",
      v-else-if="wifiStrength === 4"
    )
      img.is-white(src="../../assets/img/wifi/white/signal4lock.png")
</template>

<script>
/* eslint-disable */
export default {
  data () {
    return {
      connection: null
    }
  },

  computed: {
    wifiStrength () {
      let qualityInDb = this.connection.signal_level
      let qualityInPercent = Math.min(Math.max(2 * (qualityInDb + 100), 0), 100) 
      return Math.round((qualityInPercent/100) * 5) - 1
    }
  },

  mounted () {
    this.initWifiMonitoring()
    this.$electron.ipcRenderer.on(
      'wifiConnection',
      (e, data) => this.updateWifiConnection(data)
    )
  },

  methods: {
    updateWifiConnection (connection) {
      if (
        connection && 
        connection instanceof Array && 
        connection.length
      ) {
        this.connection = connection[0]
      } else {
        this.connection = null
      }
    },

    initWifiMonitoring () {
      setInterval(() => this.$electron.ipcRenderer.send('getWifiConnection'), 2000)
    }
  }
}
</script>

<style lang="sass" scoped>
  // .material-icons
  //   cursor: pointer !important
  //   color: white !important
</style>
