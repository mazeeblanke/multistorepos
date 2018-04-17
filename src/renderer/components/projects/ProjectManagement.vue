<template lang="pug">
  section.section
    .container-fluid
      .columns
        .column
          .BaseAppCard.card
            header.card-header
              p.card-header-title Project Management
              a.card-header-icon
                span.icon
                  i.material-icons keyboard_arrow_down
            .tabs
              ul
                router-link(tag="li", :to="{name: 'purchasing_home'}", active-class="is-active")
                  a Projects
                router-link(tag="li", :to="{name: 'purchase_orders_list'}", active-class="is-active")
                  a Project Reporting
                router-link(tag="li", :to="{name: 'purchase_orders_list'}", active-class="is-active")
                  a Deliverables
            .tab-content
              router-view
</template>

<script>
export default {
  data () {
    return {
      activeTab: 0
    }
  }
}
</script>
