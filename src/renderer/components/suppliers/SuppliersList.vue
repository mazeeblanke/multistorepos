<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      SupplierForm.page-forms(
        ref="new-supplier-form",
        @close-form="closeNewSupplierForm",
        @action-complete="closeNewSupplierForm",
        v-if="isCreatingSupplier"
      )
    .level.toolbar(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 Listing Suppliers ({{ filteredItemsData.length }})
      .level-item
          div.search
            el-input(placeholder="Search suppliers by name...", clearable v-model="searchQuery" @input="search('supplier')" class="input-with-select")
              el-button(slot="append" icon="el-icon-search")
      .level-right
        .level-item
          a.button.is-primary(@click="createNewSupplier", :disabled="formPanelOpen")
            span.icon
              i.material-icons add
            span Create Supplier
        //- .level-item
        //-   a.button
        //-     span Toggle search filters
        //-     span.icon
        //-       i.material-icons keyboard_arrow_down
    //- RequisitionListFilter(:filter-params.sync="filterParams", @change="filterItems", v-show="displaySearchFilters")
    EmptyState(empty-text="No Result" v-if="!filteredItemsData.length && !loading", :style="{ height: '400px' }")
    Loading(loading-text="Loading suppliers" v-if="(loading && !filteredItemsData.length) || isSearching", :style="{ height: '400px' }")
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
      el-table-column(label="S/N", type="index", :index="1", fixed="left" )
      el-table-column(prop="id", width="80" show-overflow-tooltip, label="ID", align="left", :sortable="true", fixed="left")
         template(slot-scope="scope")
          span {{ parseColData(scope.row.id) }}
      el-table-column(prop="name", label="Name", align="left", show-overflow-tooltip, :sortable="true", fixed="left")
        template(slot-scope="scope")
          span {{ parseColData(scope.row.name) || parseColData(scope.row.fullname) }}
      el-table-column(prop="email", label="Email", align="left", show-overflow-tooltip, :sortable="true" )
        template(slot-scope="scope")
          span {{ parseColData(scope.row.email) }}
      el-table-column(prop="address", label="Address", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span {{ parseColData(scope.row.address) }}
      el-table-column(prop="phone", label="Phone", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span {{ parseColData(scope.row.phone) }}
      el-table-column(prop="created", label="Created at", align="left", show-overflow-tooltip, :sortable="true", fixed="right")
        template(slot-scope="scope")
            span {{ dateForHumans(scope.row.reg_time) }}
      //- el-table-column(label="Actions", :render-header="renderDelete", width="70")
      //-   template(slot-scope="scope", scope="props")
      //-     button.button(:class="$style.trash")
      //-       i.material-icons delete
      //- div(slot="append" v-show="showLoading")
      //-  div(ref='loader' style="height: 45px;")
      //-    infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters } from 'vuex';
import { formatDate, formatStatus, dateForHumans } from '@/filters/format';
import Loading from '@/components/shared/Loading';
import SupplierForm from '@/components/suppliers/SupplierForm';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
// import RequisitionListFilter from '@/components/purchasing/RequisitionListFilter';
import EmptyState from '@/components/EmptyState';
import { ObjectToFormData, parseColData } from '@/utils/helper';

export default {
  mounted() {
    this.clearSelectedSupplier();
    this.clearSuppliers();
    this.loading = true;
    this.preloadItemsList();
    this.handleBottomScroll();
  },
  mixins: [deleteMixin, filterMixin],
  // watch: {
  //   suppliers(newValue) {
  //     this.items.data = _.flatMap(newValue);
  //   },
  // },
  data() {
    return {
      formPanelOpen: false,
      isCreatingSupplier: false,
      // isCreatingRFQ: false,
      filter: {
        allsuppliers: 'allsuppliers',
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
    suppliers(newValue) {
      this.items = newValue;
      this.filter.page = newValue.nextPage;
    },
  },
  methods: {
    ...mapActions('suppliers', [
      'loadSuppliers',
      'clearSelectedSupplier',
      // 'loadSuppliersByPage',
      'clearSuppliers',
    ]),
    parseColData(data) {
      if (data === 'null') {
        return '-';
      }
      return data;
    },
    ...mapActions('suppliers', {
      searchItems: 'loadSuppliers',
    }),
    ...mapActions('suppliers', {
      loadItems: 'loadSuppliersByPage',
    }),
    deleteItems() {},
    handleCellClick(row, cell) {
      if (cell.type !== 'selection') {
        this.showSupplier(row);
      }
    },
    createNewSupplier() {
      this.formPanelOpen = true;
      this.isCreatingSupplier = true;
      this.$scrollTo(this.$refs['new-supplier-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      });
    },
    closeNewSupplierForm() {
      this.formPanelOpen = false;
      this.isCreatingSupplier = false;
    },
    showSupplier(row) {
      this.$router.push({ name: 'supplier_view', params: { id: row.id } });
    },
    ...{ formatDate, formatStatus, dateForHumans, parseColData },
  },
  computed: {
    ...mapState('suppliers', ['suppliers']),
  },
  components: {
    Loading,
    SupplierForm,
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
