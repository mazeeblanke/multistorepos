<template lang="pug">
  section.section
    .container-fluid
      .columns.is-gapless
        .column(v-show="$can('admin|super-admin')" :class="$can('admin|super-admin') ? 'is-2' : ''")
          SideBar
        .column(:class="$can('admin|super-admin') ? 'is-10' : ''")
          .BaseAppCard.card(ref='base-card')
            header.card-header
              p.card-header-title Customers Management
              p.level-item.page-title.subtitle.is-5
                span.tag.is-medium Branch: {{ currentBranch.name }}
              a.card-header-icon
                el-dropdown
                  span(class="el-dropdown-link")
                    span.icon
                      i.material-icons keyboard_arrow_down
                  el-dropdown-menu(slot="dropdown")
                    el-dropdown-item(:disabled="!filteredCustomers.length")
                      JsonExcel(
                        :data="filteredCustomers",
                        :fields="json_fields",
                        :name="documentName",
                        type="xlsx",
                        v-if="filteredCustomers.length"
                      ) Export customers list to excel ({{filteredCustomers.length}})
                    el-dropdown-item Advanced excel export (Customers)
                    el-dropdown-item Action 2
                    el-dropdown-item Action 2
                    el-dropdown-item Action 2
                //- div
                //-   el-input(placeholder="Search..." class="input-with-select")
                //-     el-button(slot="append" icon="el-icon-search")
              //- a.card-header-icon
              //-   span.icon
              //-     i.material-icons keyboard_arrow_down
            .tabs
              ul
                //- template(v-if="$route.path === '/app/purchasing/requisitions' || $route.path === '/app/purchasing/purchaseorders'")
                router-link(tag="li", :to="{name: 'purchase_orders_list'}", active-class="is-active")
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
        // 'Payment method': 'payment',
        // 'Sold at': 'salestime',
      },
    };
  },
  computed: {
    ...mapState('customers', [
      'filteredCustomers'
    ]),
    documentName() {
      return `Selected customers`
    },
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
    JsonExcel,
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
