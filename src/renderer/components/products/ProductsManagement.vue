<template lang="pug">
  section.section
    .container-fluid
      .columns.is-gapless
        .column(v-show="$can('admin|superadmin')" :class="$can('admin|superadmin') ? 'is-2' : ''")
          SideBar
        .column(:class="$can('admin|superadmin') ? 'is-10' : ''")
          .BaseAppCard.card(ref='base-card')
            header.card-header
              p.card-header-title Products Management
              p.level-item.page-title.subtitle.is-5
                span.tag.is-medium Branch: {{ settings.branch.name }}
              a.card-header-icon
                span.el-icon-more-outline.font-size-23
            .tabs
              ul
                router-link(tag="li", :to="{name: 'products_list'}", active-class="is-active")
                  a Products
                // router-link(tag="li", :to="{name: 'products_history_list'}", active-class="is-active")
                //   a Product History
                router-link(tag="li", :to="{name: 'products_transfer'}", active-class="is-active")
                  a Products Transfer
                router-link(tag="li", :to="{name: 'products_transfer_list'}", active-class="is-active")
                  a Products Transfer History
            .tab-content
              router-view(@formPanelClose='resetScroll')
</template>

<script>
/* eslint-disable */
import { mapState, mapActions } from 'vuex';
import SideBar from '@/components/shared/SideBar';
const BASE_PATH = '/app/products';

const redirectIfBase = (to, next) => {
  if (to.path === BASE_PATH) {
    next({ name: 'products_list' })
  } else {
    next()
  }
};

export default {

  data() {
    return {
      activeTab: 0,
    };
  },

  components: {
    SideBar,
  },

  computed: {
    ...mapState('settings', ['settings']),
  },

  beforeRouteEnter(to, from, next) {
    redirectIfBase(to, next)
  },

  beforeRouteUpdate(to, from, next) {
    redirectIfBase(to, next)
  },

  methods: {
    resetScroll() {
      this.$scrollTo(this.$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        cancelable: false,
      });
    },
  },
};
</script>

<style lang="sass">

</style>
<style lang="sass">
.BaseAppCard
  min-height: 670px
  // .el-input
  //   width: 300px
</style>
