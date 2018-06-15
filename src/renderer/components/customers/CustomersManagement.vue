<template lang="pug">
  section.section
    .container-fluid
      .columns.is-gapless
        .column(v-show="$can('admin|superadmin')" :class="$can('admin|superadmin') ? 'is-2' : ''")
          SideBar
        .column(:class="$can('admin|superadmin') ? 'is-10' : ''")
          .BaseAppCard.card(ref='base-card')
            header.card-header
              p.card-header-title Customers Management
              p.level-item.page-title.subtitle.is-5
                span.tag.is-medium Branch: {{ settings.branch.name }}
              a.card-header-icon
                span.el-icon-more-outline.font-size-23  
            .tabs
              ul
                router-link(tag="li", :to="{name: 'customers_list'}", active-class="is-active")
                  a Customers
            .tab-content
              router-view(@formPanelClose='resetScroll')
</template>

<script>
/* eslint-disable */
import { mapState } from 'vuex';
import SideBar from '@/components/shared/SideBar';
import JsonExcel from 'vue-json-excel'

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
      json_fields: {
        Firstname: 'firstname',
        Surname: 'surname',
        Email: 'email',
        Gender:  'gender',
        'Marital status': 'marital_status',
        Phone: 'phone',
        'Created at': 'created',
      },
    };
  },
  computed: {

    ...mapState('customers', ['filteredCustomers']),

    ...mapState('branch', ['currentBranch']),

    ...mapState('settings', ['settings']),

    documentName() {
      return `Selected customers`
    },

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
    JsonExcel,
  }

};
</script>

<style lang="sass">
.BaseAppCard
  min-height: 698px
  // .el-input
  //   width: 300px
</style>
