<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      BranchForm.page-forms(
        ref="new-branch-form",
        @close-form="closeNewBranchForm",
        @action-complete="closeNewBranchForm",
        v-if="formPanelOpen"
      )
    .level.toolbar(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 
          span.el-icon-news.mr-5.font-size-23
          span Listing Branches ({{ filteredItemsData.length }})
      .level-item
          div.search
            el-input(
              placeholder="Search branches by name...", 
              clearable, 
              v-model="filter.name", 
              @input="search('name')", 
              class="input-with-select"
            )
              el-button(slot="append" icon="el-icon-search")
      .level-right
        .level-item
          button.button.is-primary(
            @click="createNewBranch", 
            :disabled="formPanelOpen"
          )
            span.icon
              i.material-icons add
            span Create Branch
    EmptyState(
      empty-text="No Result", 
      v-if="!filteredItemsData.length && !loading", 
      :style="{ height: '400px' }"
    )
    Loading(
      loading-text="Loading branches", 
      v-if="(loading && !filteredItemsData.length)", 
      :style="{ height: '400px' }"
    )
    el-table(
      ref="items-table",
      :data="filteredItemsData",
      :max-height="500",
      :border="false"
      :highlight-current-row="true",
      @cell-click="handleCellClick"
      v-show="filteredItemsData.length",
      @selection-change="handleSelectionChange",
    )
      el-table-column(type="selection")
      el-table-column(label="No", type="index", :index="1")
      el-table-column(prop="id", show-overflow-tooltip, label="ID", :sortable="true")
         template(slot-scope="scope")
          span.is-capitalized {{ parseColData(scope.row.id) }}
      el-table-column(label="Name", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ parseColData(scope.row.name) }}
      el-table-column(label="Address", show-overflow-tooltip, :sortable="true" )
        template(slot-scope="scope")
          span.is-capitalized {{ parseColData(scope.row.address) }}
      el-table-column(label="Created at", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.el-icon-time.mr-5
          span.is-capitalized {{ formatDate(scope.row.created_at) }}
      el-table-column(label="Actions", :render-header="renderDelete", width="70")
        template(slot-scope="scope")
          button.button(:class="$style.trash", @click.stop="removeRow(scope.row)")
            span.el-icon-delete.font-size-23
      div(slot="append" v-show="showLoading")
       div(ref='loader' style="height: 45px")
         infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import { formatDate, formatStatus, dateForHumans } from '@/filters/format'
import Loading from '@/components/shared/Loading'
import BranchForm from '@/components/branches/BranchForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import InfiniteLoading from 'vue-infinite-loading'
import deleteMixin from '@/mixins/DeleteMixin'
import filterMixin from '@/mixins/FilterMixin'
// import RequisitionListFilter from '@/components/purchasing/RequisitionListFilter'
import EmptyState from '@/components/EmptyState'
import { ObjectToFormData, parseColData } from '@/utils/helper'

export default {

  mounted() {
    this.clearSelectedBranch()
    this.clearBranches()
    this.loading = true
    this.preloadItemsList()
    this.handleBottomScroll()
  },

  mixins: [deleteMixin, filterMixin],
  // watch: {
  //   branches(newValue) {
  //     this.items.data = _.flatMap(newValue)
  //   },
  // }, 
  data() {
    return {
      filter: {
        name: null
      },
      displaySearchFilters: false,
      // searchQuery: null,
      // filteredRequisitions: [],
      // filterParams: {
      //   status: null,
      //   issuedBefore: null,
      //   issuedAfter: null,
      //   buyer: null,
      //   requisitionType: null,
      //   requisitionCode: null,
      // },
      loading: false,
      items: {
        data: []
      }
    }
  },

  watch: {
    branches(newValue) {
      this.items = newValue
    }
  },

  methods: {

    ...mapActions('branch', [
      'loadBranches',
      'clearSelectedBranch',
      'clearBranches',
      'deleteBranch',
    ]),

    ...mapMutations('app', [
      'SET_FORM_STATE'
    ]),

    // parseColData(data) {
    //   if (data === 'null') {
    //     return '-'
    //   }
    //   return data
    // },

    ...mapActions('branch', {
      searchItems: 'loadBranches',
    }),

    ...mapActions('branch', {
      loadItems: 'loadBranches',
    }),

    deleteItems() {},

    warnUser(warning) {
      return this.$swal({
        title: 'Are you sure?',
        text: warning,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      })
    },

    removeRow(row) {
      const MSG = 'Do you want to delete this branch(s) ?'
      this.warnUser(MSG).then((res) => {
        if (res.value) {
          this.deleteBranch(
          {
            formData: ObjectToFormData({ userid: row.id, userdel: "userdel" }),
            employee: row,
          })
          .then((res) => {
            this.$snackbar.open('successfully deleted')
          })
        }
      })
    },

    handleCellClick(row, cell) {
      if (cell.type !== 'selection') {
        this.showBranch(row)
      }
    },

    createNewBranch() {
      this.SET_FORM_STATE(true)
      this.$scrollTo(this.$refs['new-branch-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      })
    },

    closeNewBranchForm() {
      this.SET_FORM_STATE(false)
    },

    showBranch(row) {
      this.$router.push({ 
        name: 'branch_view', 
        params: { id: row.id } 
      })
    },

    ...{ formatDate, formatStatus, dateForHumans, parseColData }

  },

  computed: {

    ...mapState('branch', ['branches']),

    ...mapState('app', ['formPanelOpen'])

  },

  components: {
    Loading,
    BranchForm,
    FullscreenDialog,
    InfiniteLoading,
    // RequisitionListFilter,
    EmptyState,
  },
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
