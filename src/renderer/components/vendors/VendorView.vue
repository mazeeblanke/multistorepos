<template lang="pug">
  .VendorView.shadow-divider
    .level.toolbar
      .level-left
        .level-item
          router-link.button(:to="{name: 'vendors_list'}")
            span.icon.is-medium
              i.material-icons keyboard_arrow_left
        .level-item(v-if="selectedVendor")
          .page-title.subtitle.is-5 Viewing Vendor 
             span.tag.is-warning.is-medium {{ selectedVendor.name }}
      .level-right
        .level-item
          .field.has-addons
            p.control
              a.button
                span.icon
                  i.material-icons edit
                span Edit Vendor Information
            p.control
              a.button
                span.icon
                  i.material-icons close
    Loading(loading-text="Loading vendor information" v-if="loading")
    el-tabs(v-model='activeTab', type="card", v-if="!loading")
      el-tab-pane(name="details", label='Vendor Contact Information')
        .columns
          .column.is-4
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong Contact Person Name
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.contactName || '-'}}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong E-mail Address
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.contactEmail || '-'}}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong Address
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.address || '-'}}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong City
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.city || '-'}}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong State
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.state || '-'}}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong Country
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.country || '-'}}
          .column.is-4
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong Number of fulltime employees
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.numberOfFullTimeEmployees || '-'}}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong Contact phone
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.contactPhone || '-'}}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong Status
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.status || '-'}}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong Year established
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.yearEstablished || '-'}}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong Bank name
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.bankName || '-'}}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong Bank address
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.bankAddress || '-'}}
      el-tab-pane(name="purchase_orders", label='Purchase Orders')
        .columns
          .column
            EmptyState(empty-message="Nothing here yet")
      el-tab-pane(name="receipts", label='Receipts') 
        .columns
          .column
            EmptyState(empty-message="Nothing here yet")
      el-tab-pane(name="invoices", label='Invoices')
        .columns
          .column
            EmptyState(empty-message="Nothing here yet")
      el-tab-pane(name="Vendor_360_view", label='Vendor 360 view')   
        .columns
          .column.is-6
            h6.title.is-5.has-text-weight-normal Vendor profile 
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong Contact Person Name
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.contactName || '-'}}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong E-mail Address
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.contactEmail || '-'}} 
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong Address
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.address || '-'}}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong City
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.city || '-'}}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong State
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.state || '-'}}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-left
                  strong Country
              .field-label.is-normal
                label.label.has-text-left.has-text-weight-normal {{selectedVendor.country || '-'}}    
          .column.is-6
            h6.title.is-5.has-text-weight-normal Listing Supplied Items 
             el-table(
              ref="pricing-table",
              :data="selectedVendor.items",
              max-height="250"
              height="250"
              :highlight-current-row="true",
              empty-text="No Reference added yet",
             )
              div(slot="empty")   
                EmptyState(empty-text="Not suppling any item") 
              el-table-column(type="index", :index="1", width="80" label="No")
              el-table-column(prop="id", align="center" show-overflow-tooltip, width="150" label="ID", :sortable="true")
              el-table-column(prop="name", align="center" show-overflow-tooltip, label="Name", width="150" :sortable="true")
              el-table-column(prop="description", align="center" show-overflow-tooltip, label="Description", width="300" :sortable="true")
        .columns
           .column.is-12
            h6.title.is-5.has-text-weight-normal Listing Contracts 
             el-table(
              ref="pricing-table",
              :data="selectedVendor.contracts",
              max-height="350"
              height="350"
              :highlight-current-row="true",
              empty-text="No Reference added yet",
             )
              div(slot="empty")   
                EmptyState(empty-text="No contracts yet") 
              el-table-column(type="index", :index="1", label="No")
              el-table-column(prop="id", align="center" show-overflow-tooltip, label="ID", :sortable="true")
              el-table-column(prop="name", align="center" show-overflow-tooltip, label="Name", :sortable="true")
              el-table-column(prop="value", align="center" show-overflow-tooltip, label="Value", :sortable="true")
              el-table-column(prop="date", align="center" show-overflow-tooltip, label="Date", :sortable="true")
              el-table-column(prop="expiry date", align="center" show-overflow-tooltip, label="Expiry date", :sortable="true")
        .columns.mt-30
           .column.is-12
            h6.title.is-5.has-text-weight-normal Events Attended 
             el-table(
              ref="pricing-table",
              :data="selectedVendor.events",
              max-height="350"
              height="350"
              :highlight-current-row="true",
              empty-text="No Reference added yet",
             )
              div(slot="empty")   
                EmptyState(empty-text="No events") 
              el-table-column(type="index", :index="1", label="No")
              el-table-column(prop="name", align="center" show-overflow-tooltip, label="Name", :sortable="true")
              el-table-column(prop="date", align="center" show-overflow-tooltip, label="Date", :sortable="true")
              el-table-column(prop="remarks", align="center" show-overflow-tooltip, label="Remarks", :sortable="true")

</template>

<script>
import { mapState, mapActions } from 'vuex'
import Loading from '@/components/shared/Loading'
import EmptyState from '@/components/EmptyState'

export default {
  props: ['id'],
  mounted () {
    this.preloadVendorInformation()
  },
  data () {
    return {
      activeTab: 'details',
      loading: false
    }
  },
  methods: {
    ...mapActions('vendors', [
      'loadVendor',
      'clearSelectedVendor'
    ]),
    isSelectedRoute (hash) {
      if (!this.$route.hash) {
        return hash === '#contact'
      }
      return hash === this.$route.hash
    },
    preloadVendorInformation () {
      this.loading = true
      const vendorId = parseInt(this.id, 10)
      this.loadVendor({ id: vendorId })
        .then(() => {
          this.loading = false
          if (this.selectedVendor.items.length < 6) {
            this.selectedVendor.items = this.selectedVendor.items.concat([{}, {}, {}])
          }
        })
        .catch(() => {
          this.loading = false
          this.$snackbar.open({
            message: 'Could not find a vendor with that ID',
            type: 'is-danger'
          })
          this.$router.push({ name: 'vendors_list' })
        })
    }
  },
  computed: {
    ...mapState('vendors', [
      'selectedVendor'
    ])
  },
  components: {
    Loading,
    EmptyState
  },
  watch: {
    id () {
      this.clearSelectedVendor()
        .then(() => {
          this.preloadVendorInformation()
        })
    }
  }
}
</script>
