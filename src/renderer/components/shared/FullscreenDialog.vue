<template lang="pug">
  .FullscreenDialog(v-show="active", :class="{'scrollable' : scrollable}")
    span.material-icons.close(@click="close") close
    slot.action(name="action")
    slot
</template>

<script>
export default {
  props: {
    active: {
      type: Boolean,
      default: false
    },
    scrollable: {
      required: false,
      default: false
    }
  },
  methods: {
    close () {
      this.$emit('closed')
    }
  }
}
</script>

<style lang="sass" scoped>
.FullscreenDialog
  position: fixed
  display: flex
  align-items: center
  justify-content: center
  background: rgba(0,0,0,0.9)
  left: 0
  right: 0
  top: 0
  bottom: 0
  z-index: 999
  padding: 0 7rem
  // overflow-y: scroll
.scrollable
  padding-top: 60px
  padding-bottom: 0px
  min-height: 100px
  overflow-y: scroll
  align-items: flex-start

.close
  position: fixed
  right: 35px
  top: 20px
  font-size: 30px
  color: white
  cursor: pointer
.action
  position: fixed
  right: 70px
  top: 20px
  font-size: 30px
  color: white
  cursor: pointer
</style>

