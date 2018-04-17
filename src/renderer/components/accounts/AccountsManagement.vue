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
                span.tag.is-medium Branch: {{ currentBranch.name }}
              a.card-header-icon
                //- div
                //-   el-input(placeholder="Search..." class="input-with-select")
                //-     el-button(slot="append" icon="el-icon-search")
              a.card-header-icon
                span.icon
                  i.material-icons keyboard_arrow_down
            .tabs
              ul
                //- template(v-if="$route.path === '/app/purchasing/requisitions' || $route.path === '/app/purchasing/purchaseorders'")
                router-link(tag="li", :to="{name: 'expenditures_list'}", active-class="is-active")
                  a Expenditures
                router-link(tag="li", :to="{name: 'opening_cash_list'}", active-class="is-active")
                  a Opening Cash
                router-link(tag="li", :to="{name: 'banking_cash_list'}", active-class="is-active")
                  a Banking Cash
                router-link(tag="li", :to="{name: 'profit_loss_report'}", active-class="is-active")
                  a Profit/Loss Report
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
    console.log('in here');
    next({ name: 'expenditures_list' });
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
  components: {
    SideBar,
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
