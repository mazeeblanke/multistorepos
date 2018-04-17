<template lang="pug">
  .OrganizationSummary.card
    .card-header
      p.card-header-title Store Summary
    .card-content
      nav.level
        .level-item.has-text-centered
          div
            p.title {{ _metrics.customers_count || 0 }}
            p.heading Customers
        .level-item.has-text-centered
          div
            p.title {{ _metrics.products_count || 0 }}
            p.heading Products
        .level-item.has-text-centered
          div
            p.title {{ _metrics.users_count || 0 }}
            p.heading Employees
        .level-item.has-text-centered
          div
            p.title {{ _metrics.sales_count || 0 }}
            p.heading Sales
</template>

<script>
import Loading from '@/components/shared/Loading'

export default {
  props: {
    metrics: Object
  },
  components: {
    Loading
  },
  computed: {
    _metrics () {
      if (this.metrics) {
        return this.metrics
      }
      return {}
    }
  }
}
</script>
