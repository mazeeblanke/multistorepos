<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      BranchForm.page-forms(
        ref="new-branch-form",
        @close-form="closeNewBranchForm",
        @action-complete="closeNewBranchForm",
        v-show="formPanelOpen"
      )
    .level.toolbar(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 
          span.el-icon-news.mr-5.font-size-23
          span Listing Branches ({{ filteredItemsData.length }})
        .level-item 
          JsonExcel(
            ref="export"
            class="btn btn-default",
            :data="filteredItemsData",
            :fields="exportableFields",
            type="xlsx",
            v-if="filteredItemsData.length",
            v-show="false"
          )  
      .level-item
        div.search
          el-input(
            placeholder="Search branches by name...", 
            clearable, 
            v-model="filter.name", 
            @input="search('name')", 
            class="input-with-select",
            v-if="!displaySearchFilters"
          )
      .level-right
        .level-item
          button.button.is-primary(
            @click="createNewBranch", 
            :disabled="formPanelOpen"
          )
            span.icon
              i.material-icons add
            span Create Branch
    ListFilter.shadow-divider(
      v-if="displaySearchFilters",
      :fields="searchFields",
      @change="filterItems",
      :filter-params.sync="filter",
      @contextmenu.native.stop="showContextMenu"
    )        
    EmptyState.h400(
      empty-text="No Result", 
      v-if="!filteredItemsData.length && !loading",
      @contextmenu.native.stop="showContextMenu"
    )
    Loading.h400(loading-text="Loading branches", v-if="(loading && !filteredItemsData.length)")
    el-table(
      @contextmenu.native.stop="showContextMenu",
      ref="items-table",
      :data="filteredItemsData",
      :max-height="displaySearchFilters? 485 : 550",
      :border="false"
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
import { mapState, mapActions, mapMutations } from 'vuex'
import { formatDate, formatStatus, dateForHumans } from '@/filters/format'
import { parseColData } from '@/utils/helper'
import Loading from '@/components/shared/Loading'
import BranchForm from '@/components/branches/BranchForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import InfiniteLoading from 'vue-infinite-loading'
import deleteMixin from '@/mixins/DeleteMixin'
import filterMixin from '@/mixins/FilterMixin'
import ContextMenuMixin from '@/mixins/ContextMenuMixin'
import EmptyState from '@/components/EmptyState'
import ListFilter from '@/components/shared/ListFilter'
import JsonExcel from 'vue-json-excel'

export default {

  mounted() {
    this.clearSelectedBranch()
    this.clearBranches()
    this.loading = true
    this.preloadItemsList()
    this.handleBottomScroll()
  },

  mixins: [deleteMixin, filterMixin, ContextMenuMixin],

  data() {
    return {
      filter: {
        name: null
      },
      displaySearchFilters: false,
      loading: false,
      items: {
        data: []
      },
      exportableFields: {
        ID: 'id',
        Name: 'name',
        Address: 'address',
        'Created At': 'created_at'
      },
      searchFields: [
        {
          component: 'el-input',
          placeholder: 'Name',
          key: 'name',
          displayKey: 'Name'
        },
        {
          component: 'el-input',
          placeholder: 'Address',
          key: 'address',
          displayKey: 'Address'
        },
        {
          component: 'el-input',
          placeholder: 'Email',
          key: 'email',
          displayKey: 'Email'
        },
        {
          component: 'el-date-picker',
          startPlaceholder: 'Start Date',
          endPlaceholder: 'End Date',
          defaultTime: "['12:00:00']",
          valueFormat: 'yyyy-MM-dd HH:mm:ss',
          displayKey: 'Created At'
        }
      ]
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

    ...mapActions('branch', {
      searchItems: 'loadBranches',
    }),

    ...mapActions('branch', {
      loadItems: 'loadBranches',
    }),

    deleteItems() {},

    showContextMenu () {
      this.$electron.ipcRenderer.send('contextmenu')
    },

    handleAdvancedSearchToggle () {
      this.displaySearchFilters = !this.displaySearchFilters
      this.filter = {
        ...this.filter,
        ...{
          name: null
        }
      }
    },

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

    // removeRow(row) {
    //   const MSG = 'Do you want to delete this branch(s) ?'
    //   this.warnUser(MSG).then((res) => {
    //     if (res.value) {
    //       this.deleteBranch(
    //       {
    //         formData: ObjectToFormData({ userid: row.id, userdel: "userdel" }),
    //         employee: row,
    //       })
    //       .then((res) => {
    //         this.$snackbar.open('successfully deleted')
    //       })
    //     }
    //   })
    // },

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
    ListFilter,
    EmptyState,
    JsonExcel
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
