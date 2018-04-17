<template lang="pug">
  .Panel
    .header {{ title }} 
    slot
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    icon: String
  }
}
</script>

<style lang="sass">

</style>
