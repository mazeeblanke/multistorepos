<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      ExpenditureForm.page-forms(
        ref="new-expenditure-form",
        @close-form="closeNewExpenditureForm",
        @action-complete="closeNewExpenditureForm",
        v-if="isCreatingExpenditure"
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
              v-model="searchQuery", 
              @input="searchExpeditures", 
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
          a.button(@click="displaySearchFilters = !displaySearchFilters")
            span Toggle search filters
            span.icon
              i.material-icons keyboard_arrow_down
    ExpenditureListFilter(
      :filter-params.sync="filterParams", 
      @change="filterItems",
      v-show="displaySearchFilters"
    )
    EmptyState(
      empty-text="No Result", 
      v-if="!filteredItemsData.length && !loading", 
      :style="{ height: '400px' }"
    )
    Loading(
      loading-text="Loading expenditures", 
      v-if="(loading && !filteredItemsData.length) || isSearching",
      :style="{ height: '400px' }"
    )
    el-table(
      ref="items-table",
      :data="filteredItemsData",
      :max-height="400",
      :border="false"
      :default-sort="{prop: 'created_at', order: 'descending'}",
      :highlight-current-row="true",
      v-show="filteredItemsData.length && !isSearching",
      @selection-change="handleSelectionChange",
      :stripe="true"
    )
      el-table-column(type="selection", fixed="left")
      el-table-column(label="No", type="index", :index="1", fixed="left")
      el-table-column(prop="user", show-overflow-tooltip, label="Username", align="left", :sortable="true", fixed="left")
        template(slot-scope="scope")
          span {{ parseColData(scope.row.user) }}
      el-table-column(prop="amount", label="Amount", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span {{ money(parseColData(scope.row.amount)) }}
      el-table-column(prop="type", label="Type", align="left", show-overflow-tooltip, :sortable="true" )
        template(slot-scope="scope")
          span {{ parseColData(scope.row.type) }}
      el-table-column(prop="title", label="Title", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span {{ parseColData(scope.row.title) }}
      el-table-column(prop="details", label="Details", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span {{ parseColData(scope.row.details) }}
      el-table-column(prop="expendituretime", label="Created at", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
            span {{ dateForHumans(scope.row.expendituretime) }}
      //- div(slot="append" v-show="showLoading")
      //-  div(ref='loader' style="height: 45px;")
      //-    infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>

import { mapState, mapActions } from 'vuex'
import { formatDate, formatStatus, dateForHumans } from '@/filters/format'
import Loading from '@/components/shared/Loading'
import ExpenditureForm from '@/components/accounts/ExpenditureForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import InfiniteLoading from 'vue-infinite-loading'
import deleteMixin from '@/mixins/DeleteMixin'
import filterMixin from '@/mixins/FilterMixin'
import MoneyMixin from '@/mixins/MoneyMixin'
import ExpenditureListFilter from '@/components/accounts/filters/ExpenditureListFilter'
import EmptyState from '@/components/EmptyState'
import { parseColData } from '@/utils/helper'
import moment from 'moment'

export default {
  mounted () {
    this.clearSelectedExpenditure()
    this.clearExpenditures()
    this.loading = true
    this.filter = { ...this.filter, branchid: this.currentBranch.id }
    this.filterParams = { ...this.filterParams, branchid: this.currentBranch.id }
    this.preloadItemsList()
    this.handleBottomScroll()
  },
  mixins: [deleteMixin, filterMixin, MoneyMixin],
  data () {
    return {
      formPanelOpen: false,
      isCreatingExpenditure: false,
      filter: {
        searchexpenditure: 'searchexpenditure',
        page: 1,
        fromtime4: '1970-01-01 00:00:01',
        totime4: moment().format('YYYY-MM-DD HH:mm:ss'),
        branchid: null
      },
      filterParams: {
        usersalary2: '',
        searchexpenditure: 'searchexpenditure',
        page: 1,
        type: '',
        title: '',
        fromtime4: '',
        totime4: '',
        branchid: null
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
      this.filter.page = newValue.nextPage
    }
  },
  methods: {
    ...mapActions('expenditures', [
      'loadExpenditures',
      'clearSelectedExpenditure',
      'clearExpenditures'
    ]),
    parseColData (data) {
      if (data === 'null') {
        return '-'
      }
      return data
    },
    searchExpeditures () {
      if (this.searchQuery) {
        this.search({
          ...this.filter,
          type: this.searchQuery,
          page: 1
        }, 'POST')
      }
    },
    ...mapActions('expenditures', {
      searchItems: 'loadExpendituresByPage'
    }),
    ...mapActions('expenditures', {
      loadItems: 'loadExpendituresByPage'
    }),
    deleteItems () {},
    createNewExpenditure () {
      this.formPanelOpen = true
      this.isCreatingExpenditure = true
      this.$scrollTo(this.$refs['new-expenditure-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20
      })
    },
    closeNewExpenditureForm () {
      this.formPanelOpen = false
      this.isCreatingExpenditure = false
    },
    showExpenditure (row) {
      this.$router.push({ name: 'expenditure_view', params: { id: row.id } })
    },
    ...{ formatDate, formatStatus, dateForHumans, parseColData }
  },
  computed: {
    ...mapState('expenditures', ['expenditures']),
    ...mapState('branch', ['currentBranch'])
  },
  components: {
    Loading,
    ExpenditureForm,
    FullscreenDialog,
    InfiniteLoading,
    ExpenditureListFilter,
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
