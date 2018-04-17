<template lang="pug">
  .VendorList
    .form-panel.page-scroller
      VendorForm.page-forms
    .level.toolbar.shadow-divider
      .level-left
        .level-item.page-title.subtitle.is-5 Listing {{filterParams.vendorType}} Vendors ({{ filteredItemsData.length }})
      .level-right
        .level-item
          b-dropdown
            button.button(slot="trigger")
              b-icon(icon="import_export")
              span Import Vendor List
              b-icon(icon="arrow_drop_down")
            b-dropdown-item Import CSV
            b-dropdown-item Import XLS
        .level-item
          button.button(
            @click="toggleSearchFilters",
            :class="{'is-dark': displaySearchFilters }"
          )
            span Toggle Search Filters
            b-icon(v-if="!displaySearchFilters" icon="keyboard_arrow_down")
            b-icon(v-if="displaySearchFilters" icon="keyboard_arrow_up")
        .level-item
          router-link.button.is-primary(:to="{name: 'vendor_create'}")
            span.icon
              i.material-icons add
            span Create Vendor
    //- VendorsListFilter(:filter-params.sync="filterParams", @change="filterVendors", v-show="displaySearchFilters")
    VendorsListFilter(:filter-params.sync="filterParams", @change="filterItems", v-show="displaySearchFilters")
    Loading(loading-text="Loading vendors" v-if="loading && !filteredItemsData.length")
    EmptyState(empty-text="No filter result!" v-if="!filteredItemsData.length && !loading")
    el-table.vendor_table_list(
      ref="vendors-table",
      :data="filteredItemsData",
      :max-height="450",
      :border="false",
      :highlight-current-row="true",
      @current-change="showVendor",
      v-show="filteredItemsData.length"
    )
      el-table-column(type="selection")
      el-table-column(label="No", type="index", :index="1", fixed="left", align="center", width="50")
      el-table-column(prop="id", label="Vendor ID", width="200", align="center", :sortable="true", fixed="left")
      el-table-column(prop="name", label="Vendor Name", width="200", show-overflow-tooltip, align="center", :sortable="true", fixed="left")
      el-table-column(prop="contactName", align="center", width="250", show-overflow-tooltip, label="Vendor's Contact Person", :sortable="true")
       template(scope="props")
          //- span {{ props.row.contactName || '-' }}
          span {{ props.row.contactName || 'Maud Figueroa' }}
      el-table-column(prop="contactEmail", align="center", width="300", show-overflow-tooltip, label="Vendor's Contact Person email", :sortable="true")
       template(scope="props")
          //- span {{ props.row.contactEmail || '-' }}
          span {{ props.row.contactEmail || 'chidiebere.nnadi@gmail.com' }}
      el-table-column(align="center", width="150", label="City", show-overflow-tooltip, :sortable="true")
       template(scope="props")
          //- span {{ props.row.city || '-' }}
          span {{ props.row.city || 'Cityville' }}
      el-table-column(align="center", width="150", label="State", show-overflow-tooltip, :sortable="true")
       template(scope="props")
          //- span {{ props.row.state || '-' }}
          span {{ props.row.state || 'Kaduna' }}
      el-table-column(align="center", width="150", label="Country", show-overflow-tooltip, :sortable="true")
       template(scope="props")
          //- span {{ props.row.country || '-' }}
          span {{ props.row.country || 'UK' }}
      el-table-column(align="center", width="150", label="Address", show-overflow-tooltip, :sortable="true")
       template(scope="props")
          //- span {{ props.row.address || '-' }}
          span {{ props.row.address || '10, james street' }}
      el-table-column(align="center", width="150", label="Contact phone", show-overflow-tooltip, :sortable="true")
       template(scope="props")
          span {{ props.row.contactPhone || '0803232433' }}
      el-table-column(prop="date", label="Date Added", width="200", show-overflow-tooltip, align="center", :sortable="true")
        template(scope="props")
          span(v-html="formatDate(props.row.created_at)")
      el-table-column(label="Actions", :render-header="renderDelete", width="70", fixed="right", v-if="filterParams.vendorType === 'Catalogued'")
        template(slot-scope="scope", scope="props")
          button.button(:class="$style.trash")
            i.material-icons delete    
      el-table-column(:render-header="renderAddVendor", width="70", fixed="right", v-if="filterParams.vendorType !== 'Catalogued'")
        template(slot-scope="scope", scope="props")
          button.button(:class="$style.trash")
            i.material-icons add
      div(slot="append" v-show="filteredItemsData.length >= filter.limit")
        div(ref='loader' style="height: 45px;")
          infinite-loading(spinner="waveDots" v-if="loading")
      
</template>

<script>
import _ from 'lodash'
import { mapState, mapActions } from 'vuex'
import filterMixin from '@/mixins/FilterMixin'
import deleteMixin from '@/mixins/DeleteMixin'
import { formatDate } from '@/filters/format'
import Loading from '@/components/shared/Loading'
import VendorForm from '@/components/vendors/VendorForm'
import VendorsListFilter from '@/components/vendors/VendorsListFilter'
import InfiniteLoading from 'vue-infinite-loading'
import EmptyState from '@/components/EmptyState'

export default {
  data () {
    return {
      detailPaneOpen: false,
      displaySearchFilters: false,
      filteredVendors: null,
      isLoadingVendors: false,
      filterParams: {
        vendor: null,
        id: null,
        contactName: null,
        name: null,
        country: null,
        contactPhone: null,
        contactEmail: null,
        vendorType: 'Catalogued',
        state: null,
        commodities: null
      },
      filter: {
      }
    }
  },
  mounted () {
    // this.clearSelectedVendor();
    this.preloadItemsList()
    this.handleBottomScroll(
      document.querySelector('.vendor_table_list .el-table__body-wrapper')
    )
  },
  methods: {
    ...mapActions('vendors', [
      'loadVendors',
      'clearSelectedVendor'
    ]),
    ...mapActions('vendors', ['loadVendors']),
    ...mapActions('suppliers', ['loadSuppliers']),
    showVendor (row) {
      this.detailPaneOpen = true
      this.$router.push({ name: 'vendor_view', params: { id: row.id } })
      this.$scrollTo(this.$refs['vendors-table'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        cancelable: false
      })
    },
    deleteItems () {},
    toggleSearchFilters () {
      this.displaySearchFilters = !this.displaySearchFilters
      this.resetFilterParams()
    },
    resetFilterParams () {
      this.filterParams = {
        vendor: null,
        id: null,
        contactName: null,
        name: null,
        country: null,
        contactPhone: null,
        contactEmail: null,
        vendorType: 'Catalogued',
        state: null,
        commodities: null
      }
      this.filteredVendors = _.map(this.vendors, _.clone)
    },
    renderAddVendor (h) {
      return h(
        'button',
        {
          attrs: {
            disabled: !this.hasSelectedItems
          },
          // on: {
          //   click: this.deleteItems,
          // },
          class: 'button',
          style: 'background: transparent; border: none'
        },
        [h('i', { class: 'material-icons' }, 'add')]
      )
    },
    ...{ formatDate }
  },
  mixins: [filterMixin, deleteMixin],
  computed: {
    ...mapState('vendors', [
      'vendors'
    ]),
    ...mapState('vendors', { items: 'vendors' }),
    loadItems () {
      if (this.filterParams.vendorType === 'Catalogued') {
        return this.loadVendors
      }
      return this.loadSuppliers
    }
  },
  components: {
    Loading,
    VendorsListFilter,
    VendorForm,
    InfiniteLoading,
    EmptyState
  }
}
</script>

<style lang="sass">
  .humanize-display
    text-transform: capitalize
    
    i
      margin-right: 5px
</style>

<style lang="sass" module>
.columns
  margin: 0px 50px
.trash
  border: none
  background: transparent
</style>
