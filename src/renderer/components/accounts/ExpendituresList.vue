<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      ExpenditureForm.page-forms(
        ref="new-expenditure-form",
        @close-form="closeNewExpenditureForm",
        @action-complete="closeNewExpenditureForm",
        v-if="formPanelOpen"
      )
    .level.toolbar.shadow-divider(
      :class="{ 'shadow-divider': formPanelOpen }"
    )
      .level-left
        .level-item.page-title.subtitle.is-5 
          | Listing Expenditures ({{ filteredItemsData.length }})
      .level-item
          div.search
            el-input(
              placeholder="Search expenditures by type...",
              clearable,
              v-model="filter.type", 
              @input="search('type')", 
              class="input-with-select"
            )
              el-button(slot="append" icon="el-icon-search")
      .level-right
        .level-item
          a.button.is-primary(
            @click="createNewExpenditure",
            :disabled="formPanelOpen"
          )
            span.icon
              i.material-icons add
            span Create Expenditure
        .level-item
          span.is-clickable(@click="displaySearchFilters = !displaySearchFilters")
            span.icon
              i.material-icons youtube_searched_for
    // ExpenditureListFilter(
    //   :filter-params.sync="filterParams", 
    //   @change="filterItems",
    //   v-show="displaySearchFilters"
    // )
    EmptyState(
      empty-text="No Result", 
      v-if="!filteredItemsData.length && !loading", 
      :style="{ height: '400px' }"
    )
    Loading(
      loading-text="Loading expenditures", 
      v-if="(loading && !filteredItemsData.length)",
      :style="{ height: '400px' }"
    )
    el-table(
      ref="items-table",
      :data="filteredItemsData",
      :max-height="500",
      :border="false",
      :default-sort="{prop: 'created_at', order: 'descending'}",
      :highlight-current-row="true",
      v-show="filteredItemsData.length",
      @selection-change="handleSelectionChange",
    )
      el-table-column(type="selection")
      el-table-column(label="S/N", type="index", :index="1")
      el-table-column(show-overflow-tooltip, label="Employee Name", :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ parseColData(scope.row.user.full_name) }}
      el-table-column(label="Amount", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ money(parseColData(scope.row.amount)) }}
      el-table-column(label="Type", show-overflow-tooltip, :sortable="true" )
        template(slot-scope="scope")
          span.is-capitalized {{ parseColData(scope.row.type) }}
      el-table-column(label="Title", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ parseColData(scope.row.title) }}
      el-table-column(label="Details", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ parseColData(scope.row.details) }}
      el-table-column(label="Created at", show-overflow-tooltip, :sortable="true", :width="130")
        template(slot-scope="scope")
          span.el-icon-time.mr-5
          span {{ formatDate(scope.row.created_at) }}
      el-table-column(label="Actions", :render-header="renderDelete", width="70")
        template(slot-scope="scope")
          button.button(:class="$style.trash")
            span.el-icon-delete.font-size-23    
      div(slot="append" v-show="showLoading")
       div(ref='loader' style="height: 45px;")
         infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>

import { mapState, mapActions, mapMutations } from 'vuex'
import { formatDate, formatStatus, dateForHumans } from '@/filters/format'
import Loading from '@/components/shared/Loading'
import ExpenditureForm from '@/components/accounts/ExpenditureForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import InfiniteLoading from 'vue-infinite-loading'
import deleteMixin from '@/mixins/DeleteMixin'
import filterMixin from '@/mixins/FilterMixin'
import MoneyMixin from '@/mixins/MoneyMixin'
// import ExpenditureListFilter from '@/components/accounts/filters/ExpenditureListFilter'
import EmptyState from '@/components/EmptyState'
import { parseColData } from '@/utils/helper'
// import moment from 'moment'

export default {
  mounted () {
    this.clearSelectedExpenditure()
    this.clearExpenditures()
    this.preloadItemsList()
    this.handleBottomScroll()
  },
  mixins: [deleteMixin, filterMixin, MoneyMixin],
  data () {
    return {
      isCreatingExpenditure: false,
      filter: {
      },
      loading: false,
      loadingBranches: false,
      items: {
        data: []
      }
    }
  },

  watch: {
    expenditures (newValue) {
      this.items = newValue
    }
  },

  methods: {

    ...mapActions('expenditures', [
      'loadExpenditures',
      'clearSelectedExpenditure',
      'clearExpenditures'
    ]),

    ...mapActions('expenditures', {
      searchItems: 'loadExpenditures'
    }),

    ...mapActions('expenditures', {
      loadItems: 'loadExpenditures'
    }),

    ...mapMutations('app', [
      'SET_FORM_STATE'
    ]),

    createNewExpenditure () {
      this.SET_FORM_STATE(true)
      this.$scrollTo(this.$refs['new-expenditure-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20
      })
    },

    deleteItems () {},

    closeNewExpenditureForm () {
      this.SET_FORM_STATE(false)
    },

    ...{ formatDate, formatStatus, dateForHumans, parseColData }

  },
  computed: {

    ...mapState('expenditures', ['expenditures']),

    ...mapState('app', ['formPanelOpen']),

    ...mapState('branch', ['currentBranch'])

  },
  components: {
    Loading,
    ExpenditureForm,
    FullscreenDialog,
    InfiniteLoading,
    // ExpenditureListFilter,
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
