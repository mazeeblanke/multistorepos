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
  mounted() {
    // Notifications API needs to be paginated
    // console.log(this.$ws.subscribe('dashboard'))
    this.loadMetrics()
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
    loadProducts() {

    },
    ...mapActions('dashboard', [
      'loadMetrics',
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
//  .section
//    padding: 3rem 1.5rem !important
</style>
