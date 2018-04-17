<template lang="pug">
  section.section
    .container-fluid
      .columns.is-gapless
        .column(v-show="$can('admin|super-admin')" :class="$can('admin|super-admin') ? 'is-2' : ''")
          SideBar
        .column(v-show="$can('admin|super-admin')" :class="$can('admin|super-admin') ? 'is-10' : ''")
          .BaseAppCard.card(ref='base-card')
            header.card-header
              p.card-header-title Report Management
              p.level-item.page-title.subtitle.is-5
                span.tag.is-medium Branch: {{ currentBranch.name }}
              a.card-header-icon
                //- div
                //-   el-input(placeholder="Search..." class="input-with-select")
                //-     el-button(slot="append" icon="el-icon-search")
              //- a.card-header-icon
              //-   span.icon
              //-     i.material-icons keyboard_arrow_down
            //- .tabs
            //-   ul
            //-     //- template(v-if="$route.path === '/app/purchasing/requisitions' || $route.path === '/app/purchasing/purchaseorders'")
            //-     router-link(tag="li", :to="{name: 'purchase_orders_list'}", active-class="is-active")
            //-       a Employees
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
    console.log('in here');
    next({ name: 'customers_list' });
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
