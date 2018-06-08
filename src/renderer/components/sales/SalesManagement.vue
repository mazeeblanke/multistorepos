<template lang="pug">
  section.section
    .container-fluid
      .columns.is-gapless
        .column(v-show="$can('admin|superadmin')" :class="$can('admin|superadmin') ? 'is-2' : ''")
          SideBar
        .column(:class="$can('admin|superadmin') ? 'is-10' : ''")
          .BaseAppCard.card(ref='base-card')
            header.card-header
              p.card-header-title Sales Management
              p.level-item.page-title.subtitle.is-5
                span.tag.is-medium Branch: {{ settings.branch.name }}
              a.card-header-icon
                span.el-icon-more-outline.font-size-23 
            .tabs
              ul
                router-link(tag="li", :to="{name: 'sale_details_list'}", active-class="is-active")
                  a Sales history
                router-link(tag="li", :to="{name: 'refunds_list'}", active-class="is-active")
                  a Refunds history
                router-link(tag="li", :to="{name: 'product_enquiry_list'}", active-class="is-active")
                  a Products Enquiries
            .tab-content
              router-view(@formPanelClose='resetScroll' ref="child")
</template>

<script>
/* eslint-disable */
const BASE_PATH = '/app/sales';
import JsonExcel from 'vue-json-excel';
import { mapState } from 'vuex';
import SideBar from '@/components/shared/SideBar';

const redirectIfBase = (to, next) => {
  if (to.path === BASE_PATH) {
    next({ name: 'sale_details' });
  } else {
    next();
  }
};

export default {
  data() {
    return {
      activeTab: 0,
      json_fields : {
        Customer: 'customer',
        Total: 'total',
        Discount: 'discount',
        profit:  'profit',
        Tax: 'tax',
        'Sales ID': 'salesid',
        'Sold by': 'user',
        'Payment method': 'payment',
        'Sold at': 'salestime',
      },
    };
  },
  components: {
    JsonExcel,
    SideBar,
  },
  computed: {
    ...mapState('sales', [
      'filteredSales',
    ]),
    documentName() {
      return `Sales history`
    },
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
};
</script>

<style lang="sass">
.BaseAppCard
  min-height: 670px
</style>
