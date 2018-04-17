<template lang="pug">
  .EmptyState
    .empty-icon.is-h-centered
      figure.image.is-96x96
        img(src="../../../static/warning.svg" alt="Kiwi standing on oval")
      //- WarningIcon
    p.empty-text {{ emptyText }}
    p.help {{ emptyTextSubtitle }}
    slot
</template>

<script>
// import WarningIcon from '@/assets/img/warning.svg'

export default {
  props: {
    emptyText: {
      type: String,
      default: 'Nothing here yet'
    },
    emptyTextSubtitle: {
      type: String,
      required: false
    }
  },
  components: {
    // WarningIcon
  }
}
</script>

<style lang="sass">
  .EmptyState
    width: 400px
    margin: 0 auto
    padding: 60px 0
    text-align: center

    display: flex
    justify-content: center
    flex-direction: column

  .empty-icon svg
    width: 80px

  .empty-text
    padding-top: 20px
    font-weight: 500
</style>
