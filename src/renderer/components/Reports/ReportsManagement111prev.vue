<template lang="pug">
  section.section
    .container-fluid
      .columns.is-gapless
        .column(v-show="$can('admin|superadmin')" :class="$can('admin|superadmin') ? 'is-2' : ''")
          SideBar
        .column(:class="$can('admin|superadmin') ? 'is-10' : ''")
          .BaseAppCard.card(ref='base-card')
            header.card-header
              p.card-header-title Report Management
              p.level-item.page-title.subtitle.is-5
                span.tag.is-medium Branch: {{ settings.branch.name }}
              a.card-header-icon
                span.el-icon-more-outline.font-size-23
            .tab-content
              router-view(@formPanelClose='resetScroll')
</template>

<script>
/* eslint-disable */
import { mapState } from 'vuex';
import SideBar from '@/components/shared/SideBar';
const BASE_PATH = '/app/customers';

const redirectIfBase = (to, next) => {
  if (to.path === BASE_PATH) {
    next({ name: 'customers_list' });
  } else {
    next();
  }
};

export default {

  data() {
    return {
      activeTab: 0,
    };
  },

  computed: {

    ...mapState('settings', ['settings'])

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

  components: {
    SideBar,
  }

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
