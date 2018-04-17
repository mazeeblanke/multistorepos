<template lang="pug">
  section.section
    .container-fluid
      .columns.is-gapless
        .column(v-show="$can('admin|super-admin')" :class="$can('admin|super-admin') ? 'is-2' : ''")
          SideBar
        .column(:class="$can('admin|super-admin') ? 'is-10' : ''")
          .BaseAppCard.card(ref='base-card')
            header.card-header
              p.card-header-title Products Management
              p.level-item.page-title.subtitle.is-5
                span.tag.is-medium Branch: {{ currentBranch.name }}
              a.card-header-icon
                span.icon
                  i.material-icons keyboard_arrow_down
            .tabs
              ul
                router-link(tag="li", :to="{name: 'products_list'}", active-class="is-active")
                  a Products
                router-link(tag="li", :to="{name: 'products_history_list'}", active-class="is-active")
                  a Product History
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
    console.log('in here');
    next({ name: 'products_list' });
  } else {
    console.log('out here');
    next();
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
    ...mapState('branch', [
      'currentBranch',
    ]),
  },
  beforeRouteEnter(to, from, next) {
    redirectIfBase(to, next);
  },
  beforeRouteUpdate(to, from, next) {
    redirectIfBase(to, next);
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
