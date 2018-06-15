<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      EmployeeForm.page-forms(
        ref="new-employee-form",
        @close-form="closeNewEmployeeForm",
        @action-complete="closeNewEmployeeForm",
        v-if="isCreatingEmployee"
        :close-form="closeNewEmployeeForm"
      )
    .level.toolbar(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 
          span.el-icon-news.mr-5.font-size-23
          span Listing Employees ({{ filteredItemsData.length }})
      .level-item
          div.search
            el-input(
              placeholder="Search employees by username...", 
              clearable,
              v-model="filter.username", 
              @input="search('username')", 
              class="input-with-select",
              v-if="!displaySearchFilters"
            )  
      .level-right
        .level-item
          a.button.is-primary(
            @click="createNewEmployee",
            :disabled="formPanelOpen"
          )
            span.icon
              i.material-icons add
            span Create Employee
    ListFilter.shadow-divider(
      v-if="displaySearchFilters",
      :fields="searchFields",
      @change="filterItems",
      :filter-params.sync="filter"
    )        
    EmptyState.h400(
      empty-text="No Result",
      v-if="!filteredItemsData.length && !loading",
      @contextmenu.native.stop="showContextMenu"
    )
    Loading.h400(loading-text="Loading employees", v-if="(loading && !filteredItemsData.length)")
    el-table(
      @contextmenu.native.stop="showContextMenu",
      ref="items-table",
      :data="filteredItemsData",
      :max-height="displaySearchFilters? 459 : 550",
      :border="false",
      :default-sort="{prop: 'created_at', order: 'descending'}",
      @cell-click="handleCellClick"
      v-show="filteredItemsData.length",
      @selection-change="handleSelectionChange",
    )
      el-table-column(type="selection")
      el-table-column(label="S/N", type="index", :index="1")
      el-table-column(prop="id", show-overflow-tooltip, label="ID", width="80", sortable)
        template(slot-scope="scope") 
          span.is-capitalized {{ parseColData(scope.row.id) }}
      el-table-column(show-overflow-tooltip, label="Username", sortable)
        template(slot-scope="scope") 
          span.is-capitalized {{ parseColData(scope.row.username) }}
      el-table-column(label="Full Name", show-overflow-tooltip, sortable)
        template(slot-scope="scope") 
          span.is-capitalized {{ parseColData(scope.row.full_name) }}
      el-table-column(label="Branch Name", show-overflow-tooltip, sortable)
        template(slot-scope="scope") 
          span.is-capitalized {{ scope.row.branch ? scope.row.branch.name : '-' }}
      el-table-column(label="Access Level", show-overflow-tooltip, sortable )
        template(slot-scope="scope") 
          span.is-capitalized {{ parseColData(scope.row.access_level) }}
      el-table-column(label="Created At", show-overflow-tooltip, sortable)
        template(slot-scope="scope") 
          span.el-icon-time.mr-5
          span.is-capitalized {{ formatDate(scope.row.created_at) }}
      el-table-column(:render-header="renderDelete", width="70")
        template(slot-scope="scope")
          button.button(:class="$style.trash", @click.stop="removeRow(scope.row)")
            span.el-icon-delete.font-size-23
      div(slot="append" v-show="showLoading")
        div(ref='loader' style="height: 45px")
          infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>

import { mapState, mapActions, mapMutations } from 'vuex'
import { formatDate, formatStatus, dateForHumans } from '@/filters/format'
import Loading from '@/components/shared/Loading'
import EmployeeForm from '@/components/employees/EmployeeForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import InfiniteLoading from 'vue-infinite-loading'
import deleteMixin from '@/mixins/DeleteMixin'
import filterMixin from '@/mixins/FilterMixin'
import ContextMenuMixin from '@/mixins/ContextMenuMixin'
import EmptyState from '@/components/EmptyState'
import { parseColData } from '@/utils/helper'

export default {

  mounted () {
    this.clearSelectedEmployee()
    this.clearEmployees()
    this.preloadItemsList()
    this.handleBottomScroll()
  },

  mixins: [deleteMixin, filterMixin, ContextMenuMixin],

  data () {
    return {
      defaultSearchKey: 'username',
      isCreatingEmployee: false,
      filter: {
        username: null,
        email: null,
        access_level: null,
        status: null,
        full_name: null
      },
      displaySearchFilters: false,
      loading: false,
      items: {
        data: []
      },
      searchFields: [
        {
          component: 'el-input',
          placeholder: 'Fullname',
          key: 'full_name',
          displayKey: 'Fullname'
        },
        {
          component: 'el-input',
          placeholder: 'Username',
          key: 'username',
          displayKey: 'Username'
        },
        {
          component: 'el-select',
          placeholder: 'status',
          key: 'status',
          displayKey: 'Status',
          options: [
            { value: 'active', key: 'active' },
            { value: 'inactive', key: 'inactive' }
          ]
        },
        {
          component: 'el-select',
          placeholder: 'Access Level',
          key: 'access_level',
          displayKey: 'Access Level',
          options: [
            { value: 'clerk', key: 'clerk' },
            { value: 'admin', key: 'admin' },
            { value: 'superadmin', key: 'superadmin' }
          ]
        },
        {
          component: 'el-date-picker',
          class: 'is-4',
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
    employees (newValue) {
      this.items = newValue
    }
  },

  methods: {

    ...mapActions('employees', [
      'loadEmployees',
      'clearSelectedEmployee',
      'clearEmployees',
      'deleteEmployee'
    ]),

    ...mapMutations('app', [
      'SET_FORM_STATE'
    ]),

    ...mapActions('employees', {
      searchItems: 'loadEmployees'
    }),

    ...mapActions('employees', {
      loadItems: 'loadEmployees'
    }),

    deleteItems () {},

    warnUser (warning) {
      return this.$swal({
        title: 'Are you sure?',
        text: warning || 'Do you want to delete this employee(s) ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      })
    },

    // removeRow(row) {
    //   this.warnUser().then((res) => {
    //     if (res.value) {
    //       this.deleteEmployee(
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

    handleCellClick (row, cell) {
      if (cell.type !== 'selection') {
        this.showEmployee(row)
      }
    },

    createNewEmployee () {
      this.SET_FORM_STATE(true)
      this.isCreatingEmployee = true
      this.$scrollTo(this.$refs['new-employee-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20
      })
    },

    closeNewEmployeeForm () {
      this.SET_FORM_STATE(false)
      this.isCreatingEmployee = false
    },

    showEmployee (row) {
      this.$router.push({ name: 'employee_view', params: { id: row.id } })
    },

    ...{ formatDate, formatStatus, dateForHumans, parseColData }

  },

  computed: {

    ...mapState('employees', ['employees']),

    ...mapState('app', ['formPanelOpen'])

  },

  components: {
    Loading,
    EmployeeForm,
    FullscreenDialog,
    InfiniteLoading,
    EmptyState
  }

}
</script>

<style lang="sass" module>
.columns
  margin: 0px 50px
.trash
  border: none
  background: transparent
</style>
