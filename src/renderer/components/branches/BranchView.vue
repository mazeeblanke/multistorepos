<template lang="pug">
  .MaterialView.shadow-divider
    FullscreenDialog(
      v-close="closeDialog", 
      @closed="closeDialog", 
      :active.sync="fullScreenActive"
    )
      BranchForm.page-forms(
        ref="branch-form",
        :class="$style.pageForms",
        @close-form="closeDialog",
        :_branch="selectedBranch"
      )
    .level.toolbar
      .level-left
        .level-item
          router-link.button(:to="{name: 'branches_list'}")
            span.icon.is-medium
              i.material-icons keyboard_arrow_left
        .level-item(v-if="selectedBranch")
          .page-title.subtitle.is-6
            span.mr-5 Viewing Branch
            span.tag.is-medium.is-warning {{ selectedBranch.name }}
      .level-right
        .level-item
          .field.has-addons
            p.control
              JsonExcel(
                class="btn btn-default",
                :data="selectedBranchSales.data",
                :fields="json_fields",
                :name="documentName",
                type="xlsx",
                v-if="selectedBranch"
              )
                button.button.is-primary(:disabled="!selectedBranchSales.data.length")
                  span.el-icon-download.mr-5
                  span Download Purchase history
        .level-item
          .field.has-addons
            p.control
              button.button(@click="fullScreenActive = !fullScreenActive")
                span.icon
                  i.material-icons edit
                span Edit Information
    Loading(loading-text="Loading branch information" v-if="isLoading", :style="{ height: '400px' }")
    el-tabs(v-model="currentTab", value='summary', type="card", v-if="!isLoading")
      el-tab-pane(name="details", label='Branch Details')
        .columns.mt-10(:class="$style.columns" v-if="selectedBranch")
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Name:
              .field-label.is-normal
                label.label.is-pulled-left.is-capitalized  
                  | {{ selectedBranch.name }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Created At:
              .field-label.is-normal
                label.label.is-pulled-left 
                  | {{ parseColData(formatDate(selectedBranch.created_at)) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Email:
              .field-label.is-normal
                label.label.is-pulled-left  
                  | {{ parseColData(selectedBranch.email) }}
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Address:
              .field-label.is-normal
                label.label.is-pulled-left
                  | {{ selectedBranch.address }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Threshold:
              .field-label.is-normal
                label.label.is-pulled-left
                  | {{ parseColData(selectedBranch.threshold) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Currency:
              .field-label.is-normal
                label.label.is-pulled-left 
                  | {{ parseColData(selectedBranch.currency.name) }}
        .mt-30
          h5.title.is-5.has-text-centered Sales history
          el-table(
            v-loading="isLoadingSales"
            :data="filteredItemsData",
            :empty-text="emptyText",
            :max-height="250"
          )
            el-table-column(label="No", type="index", :index="1")
            el-table-column(prop="sales_id", show-overflow-tooltip, label="Sales ID", sortable)
            el-table-column(prop="product.name", show-overflow-tooltip, label="Product", sortable)
            el-table-column(prop="sub_total", show-overflow-tooltip, label="Total", sortable)
            el-table-column(prop="payment_type", show-overflow-tooltip, label="Payment Method")
            el-table-column(prop="quantity", show-overflow-tooltip, label="Qty Bought")
            el-table-column(prop="unit_price", show-overflow-tooltip, label="Sold By", sortable)
            el-table-column(prop="user.full_name", show-overflow-tooltip, label="Sold by", sortable)
            el-table-column(prop="created_at", show-overflow-tooltip, label="Sold At", sortable)  
              template(slot-scope="props")
                span {{ formatDate(props.row.created_at)}}
            div(slot="append" v-show="showLoading")
              div(ref='loader' style="height: 45px")
                infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>

import EmptyState from '@/components/EmptyState'
import { formatDate, dateForHumans } from '@/filters/format'
import { mapActions, mapState } from 'vuex'
import BranchForm from '@/components/branches/BranchForm'
import filterMixin from '@/mixins/FilterMixin'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import InfiniteLoading from 'vue-infinite-loading'
import Loading from '@/components/shared/Loading'
import JsonExcel from 'vue-json-excel'
import { parseColData } from '@/utils/helper'

export default {

  mixins: [filterMixin],

  data () {
    return {
      isEditing: false,
      editMat: false,
      isSavingAssessment: false,
      previewingDoc: false,
      selectedMaterials: [],
      isLoading: false,
      editRemarks: false,
      fullScreenActive: false,
      currentTab: 'details',
      isLoadingSales: false,
      filter: {
        aggregate: 0,
        limit: 4,
        with_user: 1
      },
      json_fields: {
        Total: 'sub_total',
        Product: 'product.name',
        Quantity: 'quantity',
        'Unit Price': 'unit_price',
        'Sales ID': 'sales_id',
        'Sold By': 'user.full_name',
        'Payment Method': 'payment_type',
        'Sold At': 'created_at'
      }
    }
  },

  mounted () {
    this.clearSelectedBranch()

    this.isLoading = true

    this.loadBranch({
      id: this.$route.params.id
    })
      .then(() => {
        this.isLoading = false
        this.isLoadingSales = true
        this.filter = {
          ...this.filter,
          branch_id: this.selectedBranch.id
        }
        return this.preloadItemsList()
      })
      .then((res) => {
        console.log(res)
        this.isLoadingSales = false
        this.handleBottomScroll()
        this.setSelectedBranchSales(res.body)
      })
      .catch((err) => {
        console.log(err)
        this.$snackbar.open({
          message: 'Could not find a Branch with that ID',
          type: 'is-danger'
        })
        this.isLoading = false
        this.isLoadingSales = false
      // this.$router.push({ name: 'branches_list'});
      })
  },

  components: {

    EmptyState,

    Loading,

    BranchForm,

    FullscreenDialog,

    JsonExcel,

    InfiniteLoading

  },

  methods: {

    ...{ formatDate, dateForHumans },

    setItems (res) {
      const { data } = res.body
      const salesHistory = {
        ...res.body,
        data: this.items.data.concat(data)
      }
      this.setSelectedBranchSales(salesHistory)
    },

    ...mapActions('branch', [
      'loadBranch',
      'clearSelectedBranch',
      'setSelectedBranchSales'
    ]),

    ...mapActions('sales', {
      loadItems: 'loadSales'
    }),

    closeDialog () {
      this.fullScreenActive = false
    },

    ...{ parseColData }

  },

  computed: {

    ...mapState('branch', [
      'selectedBranch'
    ]),

    selectedBranchSales () {
      return this.selectedBranch
        ? this.selectedBranch.sales
        : { data: [] }
    },

    documentName () {
      if (this.selectedBranch) {
        return `${this.selectedBranch.name}'s_purchase_history`
      }
      return null
    },

    emptyText () {
      return `${this.selectedBranch.name} has not sold anything yet`
    }

  },

  watch: {

    selectedBranchSales (newValue) {
      this.items = newValue
    }

  }

}
</script>

<style lang="sass" scoped>
.label
  font-weight: 100
.shadow-divider
  box-shadow: 0px 0px 4px 0 rgba(0, 0, 0, 0.08) inset !important;
  min-height: 560px !important;
</style>

<style lang="sass" module>
.columns
  margin: 0px 50px
.trash
  border: none
  background: transparent
</style>
