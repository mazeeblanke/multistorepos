<template lang="pug">
div
  FullscreenDialog(
    v-close="closeDialog", 
    @closed="closeDialog", 
    :active.sync="fullScreenActive"
  )
    EnquiryForm.page-forms(
      ref="new-enquiry-form",
      @close-form="closeNewEnquiryForm",
      @action-complete="closeNewEnquiryForm",
      :selected-enquiry="selectedEnquiry"
      v-if="fullScreenActive"
    )
  .EnquiriesList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      EnquiryForm.page-forms(
        ref="new-enquiry-form",
        @close-form="closeNewEnquiryForm",
        @action-complete="closeNewEnquiryForm",
        v-show="formPanelOpen"
      )
    .level.toolbar(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 
         | Product Enquiries ({{ filteredItemsData.length }})
      .level-item
        div.search
          el-input(
            placeholder="Search enquiries by product name...",
            clearable,
            v-model="filter.name",
            @input="search('name')",
            class="input-with-select"
          )   
      .level-right
        .level-item
          a.button.is-primary(@click="createNewEnquiry", :disabled="formPanelOpen")
            span.icon
              i.material-icons add
            span Create Enquiry
    EmptyState(
      empty-text="No Result", 
      v-if="!filteredItemsData.length && !loading",
      :style="{ height: '400px' }"
    )
    Loading(
      loading-text="Loading product enquiries", 
      v-if="loading && !filteredItemsData.length",
      :style="{ height: '400px' }"
    )
    el-table.enquirieslist(
      ref="items2-table",
      :data="filteredItemsData",
      :max-height="500",
      height="500",
      :border="false",
      :default-sort="{prop: 'created_at', order: 'descending'}",
      @cell-click="handleCellClick",
      v-show="filteredItemsData.length",
      @selection-change="handleSelectionChange"
    )
      el-table-column(
        prop="status", 
        label="", 
        :render-header="renderAvailability", 
        show-overflow-tooltip, 
        width="70"
      )
        template(slot-scope="scope")
          span.dot.dot-lg.dot-success(v-if="scope.row.status === 'available'")
          span.dot.dot-lg.dot-warning(v-else)
      el-table-column(type="selection")
      el-table-column(label="S/N", type="index", :index="1")
      el-table-column(show-overflow-tooltip, label="Customer name", :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ scope.row.customer ? scope.row.customer.full_name : '-' }}
      el-table-column(show-overflow-tooltip, label="Employee name", :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ scope.row.user ? scope.row.user.full_name : '-' }}
      el-table-column(label="Product", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ scope.row.product_name || scope.row.product.name }}   
      el-table-column(show-overflow-tooltip, label="Enquiry Note", :sortable="true")
        template(slot-scope="scope")
          span {{ parseColData(scope.row.inquiry_note) }}
      el-table-column(label="Expected date", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.el-icon-time.mr-5
          span {{ formatDate(scope.row.expected_date) }}
      el-table-column(label="Created At", show-overflow-tooltip, :sortable="true")
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
/* eslint-disable */
import { mapState, mapActions, mapMutations } from 'vuex';
import { formatDate, formatStatus, dateForHumans } from '@/filters/format';
import Loading from '@/components/shared/Loading';
import EnquiryForm from '@/components/products/enquiries/EnquiryForm';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
import EmptyState from '@/components/EmptyState';
import { ObjectToFormData, parseColData } from '@/utils/helper';

export default {

  mounted() {
    this.clearProductEnquiries();
    // this.loading = true;
    this.preloadItemsList()
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
      // formPanelOpen: false,
      // isCreatingEnquiry: false,
      // isCreatingRFQ: false,
      filter: {
        name: null
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
      // this.filter.page = newValue.nextPage;
    },
  },

  methods: {

    ...mapActions('products', [
      'clearProductEnquiries',
    ]),

    ...mapMutations('app', [
      'SET_FORM_STATE'
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
      loadItems: 'loadProductEnquiries',
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

    createNewEnquiry() {
      this.SET_FORM_STATE(true);
      this.$scrollTo(this.$refs['new-enquiry-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      });
    },

    closeNewEnquiryForm() {
      this.SET_FORM_STATE(false)
      this.closeDialog()
      // this.isCreatingEnquiry = false;
    },

    closeDialog() {
      this.fullScreenActive = false;
    },

    showEnquiry(row) {
      this.selectedEnquiry = row;
      this.fullScreenActive = true;
    },

    ...{ formatDate, formatStatus, dateForHumans, parseColData }

  },

  computed: {

    ...mapState('products', ['productEnquiries']),

    ...mapState('app', ['formPanelOpen'])

  },

  components: {
    Loading,
    EnquiryForm,
    FullscreenDialog,
    InfiniteLoading,
    EmptyState,
  }

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
