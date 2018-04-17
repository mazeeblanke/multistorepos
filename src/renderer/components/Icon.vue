<template lang="pug">  
  svg(:class="className", :width="width", :height="height")
    use(:xlink:href="glyph")
</template>

<script>
export default {
  name: 'icon',
  props: ['className', 'glyph', 'width', 'height']
}
</script>

<style scoped>  
.icon {
  display: inline-block;
}
</style>