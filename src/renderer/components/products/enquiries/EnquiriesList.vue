<template lang="pug">
div
  FullscreenDialog( v-close="closeDialog", @closed="closeDialog", :active.sync="fullScreenActive")
    EnquiryForm.page-forms(
      ref="new-enquiry-form",
      @close-form="closeNewEnquiryForm",
      @action-complete="closeNewEnquiryForm",
      :_enquiry="selectedEnquiry"
      v-if="fullScreenActive"
    )
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      EnquiryForm.page-forms(
        ref="new-enquiry-form",
        @close-form="closeNewEnquiryForm",
        @action-complete="closeNewEnquiryForm",
        v-if="isCreatingEnquiry"
      )
    .level.toolbar(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 Product Enquiries ({{ filteredItemsData.length }})
      //- .level-item
      //-     div.search
      //-       el-input(placeholder="Search enquiries...", clearable v-model="searchQuery" @input="search('user')" class="input-with-select")
      //-         el-button(slot="append" icon="el-icon-search")
      .level-right
        .level-item
          a.button.is-primary(@click="createNewEmployee", :disabled="formPanelOpen")
            span.icon
              i.material-icons add
            span Create Enquiry
        //- .level-item
        //-   a.button
        //-     span Toggle search filters
        //-     span.icon
        //-       i.material-icons keyboard_arrow_down
    //- RequisitionListFilter(:filter-params.sync="filterParams", @change="filterItems", v-show="displaySearchFilters")
    EmptyState(empty-text="No Result" v-if="!filteredItemsData.length && !loading", :style="{ height: '400px' }")
    Loading(loading-text="Loading product enquiries" v-if="(loading && !filteredItemsData.length) || isSearching", :style="{ height: '400px' }")
    el-table.enquirieslist(
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
      el-table-column(prop="status", label="", :render-header="renderAvailability" align="left", show-overflow-tooltip, width="70", fixed="left")
        template(slot-scope="scope")
          //- span {{ parseColData(scope.row.status)}}
          span.dot.dot-lg.dot-warning(v-if="scope.row.product_details[0].quantity <= 0")
          span.dot.dot-lg.dot-success(v-else)
      //- el-table-column(type="selection")
      el-table-column(label="S/N", type="index", :index="1", fixed="left")
      //- el-table-column(prop="id", show-overflow-tooltip, label="ID", align="left", :sortable="true")
      //-    template(slot-scope="scope")
      //-     span {{ parseColData(scope.row.id) }}
      el-table-column(show-overflow-tooltip, label="Customer name", align="left", :sortable="true", fixed="left")
        template(slot-scope="scope")
          span {{ scope.row.customer_details.length ? parseColData(scope.row.customer_details[0].firstname || scope.row.customer_details[0].surname ) : '--' }}
      el-table-column(show-overflow-tooltip, label="Product name", align="left", :sortable="true")
        template(slot-scope="scope")
          span {{ parseColData(scope.row.product_details[0].name) }}
      el-table-column(prop="actualnote", label="Actual Note", align="left", show-overflow-tooltip, :sortable="true" )
        template(slot-scope="scope")
          span {{ parseColData(scope.row.actualnote) }}
      el-table-column(prop="inquirynote", label="Inquiry Note", align="left", show-overflow-tooltip, :sortable="true" )
        template(slot-scope="scope")
          span {{ parseColData(scope.row.inquirynote) }}
      el-table-column(prop="inquirydate", label="Enquiry date", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
            span {{ dateForHumans(scope.row.inquirydate) }}
      el-table-column(prop="expecteddate", label="Expected date", align="left", show-overflow-tooltip, :sortable="true", fixed="right")
        template(slot-scope="scope")
            span {{ dateForHumans(scope.row.expecteddate) }}
      //- el-table-column(prop="actualdate", label="Actual date", align="left", show-overflow-tooltip, :sortable="true")
      //-   template(slot-scope="scope")
      //-       span {{ dateForHumans(scope.row.actualdate) }}
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
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import { formatDate, formatStatus, dateForHumans } from '@/filters/format';
import Loading from '@/components/shared/Loading';
import EnquiryForm from '@/components/products/enquiries/EnquiryForm';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
// import RequisitionListFilter from '@/components/purchasing/RequisitionListFilter';
import EmptyState from '@/components/EmptyState';
import { ObjectToFormData, parseColData } from '@/utils/helper';

export default {
  mounted() {
    // this.clearSelectedEmployee();
    this.clearProductEnquiries();
    this.loading = true;
    this.preloadItemsList();
    this.handleBottomScroll(
      document.querySelector('.enquirieslist .el-table__body-wrapper')
    );
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
      isCreatingEnquiry: false,
      // isCreatingRFQ: false,
      filter: {
        allproductinquiry: 'allproductinquiry',
        page: 1,
      },
      displaySearchFilters: false,
      isEditingEnquiry: false,
      selectedEnquiry: {},
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
      fullScreenActive: false,
      items: {
        data: []
      }
    };
  },
  watch: {
    productEnquiries(newValue) {
      this.items = newValue;
      this.filter.page = newValue.nextPage;
    },
  },
  methods: {
    ...mapActions('products', [
      'loadProductEnquiries',
      // 'clearSelectedEmployee',
      // 'loadProductEnquiriesByPage',
      'clearProductEnquiries',
    ]),
    ...mapMutations('products', [
      'ADD_ENQUIRY',
    ]),
    parseColData(data) {
      if (data === 'null') {
        return '-';
      }
      return data;
    },
    ...mapActions('products', {
      searchItems: 'loadProductEnquiries',
    }),
    ...mapActions('products', {
      loadItems: 'loadProductEnquiriesByPage',
    }),
    deleteItems() {},
    handleCellClick(row, cell) {
      if (cell.type !== 'selection') {
        this.showEnquiry(row);
      }
    },
    renderAvailability(h) {
      return h('i', { class: 'material-icons' }, 'rss_feed');
    },
    createNewEmployee() {
      this.formPanelOpen = true;
      this.isCreatingEnquiry = true;
      this.$scrollTo(this.$refs['new-enquiry-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      });
    },
    closeNewEnquiryForm() {
      this.formPanelOpen = false;
      this.isCreatingEnquiry = false;
    },
    closeDialog() {
      this.fullScreenActive = false;
    },
    showEnquiry(row) {
      console.log(row);
      this.selectedEnquiry = row;
      this.fullScreenActive = true;
      // this.$router.push({ name: 'enquiry_view', params: { id: row.id } });
    },
    ...{ formatDate, formatStatus, dateForHumans, parseColData },
  },
  computed: {
    ...mapState('products', ['productEnquiries']),
    // ...mapState('employees', ['productEnquiries']),
  },
  components: {
    Loading,
    EnquiryForm,
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
