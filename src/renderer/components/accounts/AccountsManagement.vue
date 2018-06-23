<template lang="pug">
  section.section
    .container-fluid
      .columns.is-gapless
        .column.is-2
          SideBar
        .column.is-10
          .BaseAppCard.card(ref='base-card')
            header.card-header
              p.card-header-title Accounts Management
              p.level-item.page-title.subtitle.is-5
                span.tag.is-medium Branch: {{ settings.branch.name }}
              a.card-header-icon
                span.el-icon-more-outline.font-size-23
            .tabs
              ul
                router-link(tag="li", :to="{name: 'expenditures_list'}", active-class="is-active")
                  a Expenditures
                router-link(tag="li", :to="{name: 'opening_cash_list'}", active-class="is-active")
                  a Opening Cash
                router-link(tag="li", :to="{name: 'banking_cash_list'}", active-class="is-active")
                  a Banking Cash
                router-link(tag="li", :to="{name: 'profit_loss_report'}", active-class="is-active")
                  a Profit/Loss Report
                router-link(tag="li", :to="{name: 'annual_report'}", active-class="is-active")
                  a Annual Report
            .tab-content
              router-view(@formPanelClose='resetScroll')
</template>

<script>
/* eslint-disable */
import { mapState } from 'vuex';
import SideBar from '@/components/shared/SideBar';
const BASE_PATH = '/app/accounts'
const redirectIfBase = (to, next) => {
  if (to.path === BASE_PATH) {
    next({ name: 'expenditures_list' });
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
   ...mapState('settings', ['settings']),
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
  },
};
</script>

<style lang="sass">

</style>
<style lang="sass">
.BaseAppCard
  display: flow-root !important
  min-height: 740px !important
  // .el-input
  //   width: 300px
</style>
