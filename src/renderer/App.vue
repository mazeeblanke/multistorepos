<template>
  <div id="app">
    <router-view></router-view>
    <vue-progress-bar></vue-progress-bar>
  </div>
</template>

<script>
/* eslint-disable */
import { mapState } from 'vuex'
import { isLoggedIn } from '@/utils/helper'

export default {
  name: 'multistore',
  mounted () {
    this.$Progress.finish()
  },
  created () {
    this.$Progress.start()
    this.$router.beforeEach((to, from, next) => {
      if (to.meta.progress !== undefined) {
        const meta = to.meta.progress
        this.$Progress.parseMeta(meta)
      }
      this.$Progress.start()
      next()
    })
    this.$router.afterEach((to, from) => {
      this.$Progress.finish()
    })
  }
}
</script>

<style>
  @font-face {
    font-family: 'Rubik';
      src: url('../../static/fonts/Rubik/Rubik-Regular.ttf');
    font-style: normal;
    font-weight: normal;
  }
</style>

<style>

@keyframes slow-slide {
  0% {
    background-position-x: -2000px;
  }

  100% {
    background-position-x: 1500px;
  }
} 


@media all and (min-width: 1024px) and (max-width: 1215px) {
  .sidebar .button {
    font-size: 10px !important;
  }

  .cell{
    font-size: 12px !important;
  }

  .search .el-input {
    width: 300px !important;
  }

  a.button.is-primary{
    font-size: 12px !important;
  }

  .cell.el-tooltip {
    font-size: 11px !important;
  }

  .level-item.page-title.subtitle.is-5 {
    font-size: 12px !important;
  }
}
</style>

<style lang="sass" src="./App.sass"></style>

