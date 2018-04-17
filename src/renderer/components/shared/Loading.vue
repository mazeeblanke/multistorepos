<template lang="pug">
  div.is-h-centered
    .Loading(v-if="isLoading")
      .loading-indicator
      p.loading-text {{ loadingText }}...
    EmptyState(:empty-text="emptyText", v-if="isEmpty")
</template>

<script>
import EmptyState from '@/components/EmptyState'

export default {
  props: {
    collection: Array,
    loadingText: {
      type: String,
      default: 'Loading'
    },
    emptyText: {
      type: String,
      default: 'Nothing here yet'
    }
  },
  computed: {
    isLoading () {
      return !this.collection
    },
    isEmpty () {
      return this.collection instanceof Array && !this.collection.length
    }
  },
  components: {
    EmptyState
  }
}
</script>

<style lang="sass">
.Loading
  display: flex
  flex-direction: column
  min-height: 300px
  align-items: center
  justify-content: center

.loading-indicator
  animation: spinAround 500ms infinite linear
  border: 4px solid #0A44AE
  border-radius: 290486px
  border-right-color: transparent
  border-top-color: transparent
  display: block
  height: 3em
  width: 3em

.loading-text
  color: #0A44AE
  padding-top: 40px
  font-weight: 500
</style>
