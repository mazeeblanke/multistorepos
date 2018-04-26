<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      EmployeeForm.page-forms(
        ref="new-employee-form",
        @close-form="closeNewEmployeeForm",
        @action-complete="closeNewEmployeeForm",
        v-if="isCreatingEmployee"
      )
    .level.toolbar(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 Listing Employees ({{ filteredItemsData.length }})
      .level-item
          div.search
            el-input(placeholder="Search employees by name...", clearable v-model="searchQuery" @input="search('user')" class="input-with-select")
              el-button(slot="append" icon="el-icon-search")  
      .level-right
        .level-item
          a.button.is-primary(@click="createNewEmployee", :disabled="formPanelOpen")
            span.icon
              i.material-icons add
            span Create Employee
        //- .level-item
        //-   a.button
        //-     span Toggle search filters
        //-     span.icon
        //-       i.material-icons keyboard_arrow_down
    //- RequisitionListFilter(:filter-params.sync="filterParams", @change="filterItems", v-show="displaySearchFilters")
    EmptyState(empty-text="No Result" v-if="!filteredItemsData.length && !loading", :style="{ height: '400px' }")
    Loading(loading-text="Loading employees" v-if="(loading && !filteredItemsData.length) || isSearching", :style="{ height: '400px' }")
    el-table(
      ref="items-table",
      :data="filteredItemsData",
      :max-height="400",
      :border="false"
      :default-sort="{prop: 'created_at', order: 'descending'}",
      :highlight-current-row="true",
      @cell-click="handleCellClick"
      v-show="filteredItemsData.length && !isSearching",
      @selection-change="handleSelectionChange",
      :stripe="true"
    )
      el-table-column(type="selection", fixed="left")
      el-table-column(label="S/N", type="index", :index="1", fixed="left")
      el-table-column(prop="id", show-overflow-tooltip, label="ID", width="80" align="left", :sortable="true", fixed="left")
         template(slot-scope="scope") 
          span {{ parseColData(scope.row.id) }}
      el-table-column(prop="username", show-overflow-tooltip, label="Username", align="left", :sortable="true", fixed="left")
        template(slot-scope="scope") 
          span {{ parseColData(scope.row.username) }}
      el-table-column(prop="name", label="Name", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope") 
          span {{ parseColData(scope.row.name) || parseColData(scope.row.fullname) }}
      el-table-column(prop="name", label="Branch Name", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope") 
          span {{ scope.row.branch_details && scope.row.branch_details.length? scope.row.branch_details[0].name : '-' }}
      el-table-column(prop="access", label="Access level", align="left", show-overflow-tooltip, :sortable="true" )
        template(slot-scope="scope") 
          span {{ parseColData(scope.row.access) }}
      el-table-column(prop="status", label="Status", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope") 
          span {{ parseColData(scope.row.status) || parseColData(scope.row.access) }}
      el-table-column(prop="created", label="Created at", align="left", show-overflow-tooltip, :sortable="true", fixed="right")
        template(slot-scope="scope") 
            span {{ dateForHumans(scope.row.reg_time) }}
      el-table-column(label="Actions", :render-header="renderDelete", width="70", fixed="right")
        template(slot-scope="scope")
          button.button(:class="$style.trash", @click.stop="removeRow(scope.row)")
            i.material-icons delete
      //- div(slot="append" v-show="showLoading")
      //-  div(ref='loader' style="height: 45px;")
      //-    infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters } from 'vuex';
import { formatDate, formatStatus, dateForHumans } from '@/filters/format';
import Loading from '@/components/shared/Loading';
import EmployeeForm from '@/components/employees/EmployeeForm';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
// import RequisitionListFilter from '@/components/purchasing/RequisitionListFilter';
import EmptyState from '@/components/EmptyState';
import { ObjectToFormData, parseColData } from '@/utils/helper';

export default {
  mounted() {
    this.clearSelectedEmployee();
    this.clearEmployees();
    this.loading = true;
    this.preloadItemsList();
    this.handleBottomScroll();
  },
  mixins: [deleteMixin, filterMixin],
  // watch: {
  //   employees(newValue) {
  //     this.items.data = _.flatMap(newValue);
  //   },
  // },
  data() {
    return {
      formPanelOpen: false,
      isCreatingEmployee: false,
      // isCreatingRFQ: false,
      filter: {
        allusers: 'allusers',
        page: 1,
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
    };
  },
  watch: {
    employees(newValue) {
      this.items = newValue;
      this.filter.page = newValue.nextPage;
    },
  },
  methods: {
    ...mapActions('employees', [
      'loadEmployees',
      'clearSelectedEmployee',
      // 'loadEmployeesByPage',
      'clearEmployees',
      'deleteEmployee',
    ]),
    parseColData(data) {
      if (data === 'null') {
        return '-';
      }
      return data;
    },
    ...mapActions('employees', {
      searchItems: 'loadEmployees',
    }),
    ...mapActions('employees', {
      loadItems: 'loadEmployeesByPage',
    }),
    deleteItems() {},
    warnUser(warning) {
      return this.$swal({
        title: 'Are you sure?',
        text: warning || 'Do you want to delete this employee(s) ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      });
    },
    removeRow(row) {
      this.warnUser().then((res) => {
        if (res.value) {
          this.deleteEmployee(
          {
            formData: ObjectToFormData({ userid: row.id, userdel: "userdel" }),
            employee: row,
          })
          .then((res) => {
            this.$snackbar.open('successfully deleted');
          })
        }
      })
    },
    handleCellClick(row, cell) {
      if (cell.type !== 'selection') {
        this.showEmployee(row);
      }
    },
    createNewEmployee() {
      this.formPanelOpen = true;
      this.isCreatingEmployee = true;
      this.$scrollTo(this.$refs['new-employee-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      });
    },
    closeNewEmployeeForm() {
      this.formPanelOpen = false;
      this.isCreatingEmployee = false;
    },
    showEmployee(row) {
      this.$router.push({ name: 'employee_view', params: { id: row.id } });
    },
    ...{ formatDate, formatStatus, dateForHumans, parseColData },
  },
  computed: {
    ...mapState('employees', ['employees']),
  },
  components: {
    Loading,
    EmployeeForm,
    FullscreenDialog,
    InfiniteLoading,
    // RequisitionListFilter,
    EmptyState,
  },
};
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
