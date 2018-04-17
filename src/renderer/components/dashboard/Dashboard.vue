<template lang="pug">
  section.section
    .columns
      .column.is-one-quarter
        YourAccount
        CompanyStatistics
      .column.is-three-quarters
        OrganizationSummary(:metrics="metrics")
        Notifications

</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapMutations } from 'vuex';
import OrganizationSummary from '@/components/dashboard/OrganizationSummary';
import Notifications from '@/components/dashboard/Notifications';
import YourAccount from '@/components/dashboard/YourAccount';
import CompanyStatistics from '@/components/dashboard/CompanyStatistics';
import { ObjectToFormData } from '@/utils/helper';

export default {
  data() {
    return {
      // metrics: null,
    };
  },
  mounted() {
    // Notifications API needs to be paginated
    // this.loadNotifications();
    // this.getProductsStats(ObjectToFormData({
    //   closetoexpiredproducts: 'closetoexpiredproducts',
    // }))
    // .then((res) => {
    //   this.SET_CLOSE_TO_EXPIRED_PRODUCTS(res);
    // });
    this.access = this.currentUser.access;
    this.loadDashboardMetrics({
      type: 'lightanalytics',
      search: 'search',
    });
    this.loadProductStats({
      type: 'lightnotifications',
      search: 'search',
    });
  },
  computed: {
    ...mapState('products', [
      'closeToExpiredProducts',
    ]),
    ...mapState('dashboard', [
      'metrics',
    ]),
    ...mapState('users', [
      'currentUser',
    ]),
  },
  methods: {
    // ...mapActions('notifications', [
    //   'loadNotifications',
    // ]),
    // ...mapMutations('products', [
    //   'SET_CLOSE_TO_EXPIRED_PRODUCTS',
    // ]),
  //  ...mapActions('products', [
  //     'getProductsStats',
  //   ]),
    loadProducts() {

    },
    ...mapActions('dashboard', [
      'loadDashboardMetrics',
      'loadProductStats',
    ]),
  },
  components: {
    OrganizationSummary,
    Notifications,
    YourAccount,
    CompanyStatistics,
  },
};
</script>

<style lang="sass">
  .card:not(:last-child)
    margin-bottom: 1.5rem
</style>

<style lang="sass" scoped>
 .section
   padding: 3rem 1.5rem !important
</style>
