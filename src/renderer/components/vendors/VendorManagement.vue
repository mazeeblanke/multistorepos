<template lang="pug">
  section.section
    .container-fluid
      //- .columns
      .column
        .BaseAppCard.card
          header.card-header
            p.card-header-title Vendor Management
            a.card-header-icon
              el-input(placeholder="Search" class="input-with-select")
                  el-button(slot="append" icon="el-icon-search" style="{background-color: white}")
            //- a.card-header-icon
            //-   span.icon
            //-     i.material-icons keyboard_arrow_down      
               
          router-view
</template>

<script>

export default {
  data () {
    return {
      activeTab: 0
    }
  }
}
</script>

<style lang="sass" scoped>
// .BaseAppCard
//   height: 900px !important
.card-header
  .el-input
    width: 400px !important;
  // .input-with-select .el-input-group__prepend 
  //   background-color: #fff !important;
  // .el-button
  //   background-color: white !important;  
</style>

