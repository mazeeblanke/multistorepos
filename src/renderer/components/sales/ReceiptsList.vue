<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
    .level.toolbar.shadow-divider(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 Listing Receipts ({{ filteredItemsData.length }})
      .level-right
        .level-item
          a.button.is-primary(@click="createNewRequisition", :disabled="formPanelOpen")
            span.icon
              i.material-icons add
            span Create Requisition
        .level-item
          a.button(@click="toggleFilteringState")
            span Toggle search filters
            span.icon
              i.material-icons keyboard_arrow_down
    EmptyState(empty-message="Nothing here yet" v-if="!filteredItemsData.length && !loading")
    Loading(loading-text="Loading requisitions" v-if="loading && !filteredItemsData.length")
    el-table(
      ref="items-table",
      :data="filteredItemsData",
      :max-height="400",
      :border="false"
      :default-sort="{prop: 'created_at', order: 'descending'}",
      :highlight-current-row="true",
      @cell-click="handleCellClick"
      v-show="filteredItemsData.length",
      @selection-change="handleSelectionChange",
    )
      el-table-column(type="selection", fixed="left")
      el-table-column(label="No", type="index", :index="1" fixed="left", width="50")
      el-table-column(prop="requisitionCode", show-overflow-tooltip, label="Requisition Code", fixed="left", :sortable="true", width="200")
      el-table-column(prop="buyer", label="Buyer", show-overflow-tooltip, :sortable="true" width="150")
      el-table-column(prop="total_materials", label="Material No.", align="center", :sortable="true" width="156")
        template(scope="props")
          span {{ props.row.materials.length }}
      el-table-column(prop="deliverySite", label="Delivery Site", align="center", show-overflow-tooltip, :sortable="true", width="190")
      el-table-column(prop="issueDate", label="Issue Date", show-overflow-tooltip, :sortable="true", width="230")
        template(scope="props")
          span(v-html="dateForHumans(props.row.issueDate)")
      el-table-column(prop="created_at", label="Date Created", show-overflow-tooltip, :sortable="true", width="230")
        template(scope="props")
          span(v-html="dateForHumans(props.row.created_at)")
      el-table-column(prop="status", label="Status", width="100")
        template(scope="props")
          span.humanize-display(v-html="formatStatus(props.row.status)")
      el-table-column(label="Actions", :render-header="renderDelete", width="70", fixed="right")
        template(slot-scope="scope", scope="props")
          button.button(:class="$style.trash")
            i.material-icons delete
      //- div(slot="append" v-show="showLoading")
      //-  div(ref='loader' style="height: 45px;")
      //-    infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
/* eslint-disable */
import { formatDate, formatStatus, dateForHumans } from '@/filters/format';
import Loading from '@/components/shared/Loading';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
import EmptyState from '@/components/EmptyState';

export default {
  mounted() {},
  mixins: [deleteMixin, filterMixin],
  data() {
    return {
      formPanelOpen: false,
      isCreatingRFP: false,
      isCreatingRFQ: false,
      filter: {
        limit: 7,
        page: 1,
      },
      displaySearchFilters: false,
      filteredRequisitions: [],
      filterParams: {
        status: null,
        issuedBefore: null,
        issuedAfter: null,
        buyer: null,
        requisitionType: null,
        requisitionCode: null,
      },
      loading: false,
    };
  },
  methods: {
    ...mapActions('requisitions', [
      'clearSelectedRequisition',
      'clearCommercialEvaluation',
      'loadRequisitions',
    ]),
    ...mapActions('requisitions', {
      loadItems: 'loadRequisitions',
    }),
    deleteItems() {},
    handleCellClick(row, cell) {
      if (cell.type !== 'selection') {
        this.showRequisition(row);
      }
    },
    ...{ formatDate, formatStatus, dateForHumans },
  },
  computed: {},
  components: {
    Loading,
    FullscreenDialog,
    InfiniteLoading,
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
