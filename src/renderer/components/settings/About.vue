<template lang="pug">
div
  div
    img#oaslogo(src='../../assets/img/logo.png', alt='OAS logo')
    h4.title.is-4.mt-30.mb-25 About
    .columns
      .column.is-5
        .field.is-horizontal.mb-30
          .field-label.has-text-left.is-v-centered
            label.label.has-text-weight-normal.font-size-13 Electron
          .field-body
            .field {{ electron }}
        .field.is-horizontal.mb-30
          .field-label.has-text-left.is-v-centered
            label.label.has-text-weight-normal.font-size-13 Version
          .field-body
            .field {{ vue }}
        .field.is-horizontal.mb-30
          .field-label.has-text-left.is-v-centered
            label.label.has-text-weight-normal.font-size-13 Platform
          .field-body
            .field {{ platform }}
</template>

<script>

export default {
  data () {
    return {
      electron: process.versions['atom-shell'],
      name: this.$route.name,
      node: process.versions.node,
      path: this.$route.path,
      platform: require('os').platform(),
      vue: require('vue/package.json').version
    }
  }
}
</script>

<style lang="sass" scoped>
  #oaslogo
    background: rgb(5, 41, 107)
    margin-top: 30px
    padding: 10px
    border-radius: 20px
</style>
