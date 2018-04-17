<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      OpeningcashForm.page-forms(
        ref="new-openingcash-form",
        @close-form="closeNewOpeningcashForm",
        @action-complete="closeNewOpeningcashForm",
        v-if="isCreatingOpeningcash"
      )
    .level.toolbar.shadow-divider(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 Listing Opening cash ({{ filteredItemsData.length }})
      .level-right
        .level-item
          a.button.is-primary(@click="createNewOpeningcash", :disabled="formPanelOpen")
            span.icon
              i.material-icons add
            span Create Openingcash
        .level-item
          a.button(@click="displaySearchFilters = !displaySearchFilters")
            span Toggle search filters
            span.icon
              i.material-icons keyboard_arrow_down
    OpeningCashListFilter(:filter-params.sync="filterParams", @change="filterItems", v-show="displaySearchFilters")
    EmptyState(empty-text="No Results :(" v-if="!filteredItemsData.length && !loading", :style="{ height: '400px' }")
    Loading(loading-text="Loading openingcashs" v-if="(loading && !filteredItemsData.length) || isSearching", :style="{ height: '400px' }")
    el-table.ocl(
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
      el-table-column(prop="user", show-overflow-tooltip, label="User (from)", align="left", :sortable="true", fixed="left")
        template(slot-scope="scope")
          span {{ parseColData(scope.row.fromuser) }}
      el-table-column(prop="user", show-overflow-tooltip, label="User (to)", align="left", :sortable="true")
        template(slot-scope="scope")
          span {{ parseColData(scope.row.touser) }}
      el-table-column(prop="amount", label="Amount", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span {{ money(parseColData(scope.row.amount)) }}
      el-table-column(prop="details", label="Details", align="left", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span {{ parseColData(scope.row.details) }}
      el-table-column(prop="openingcashtime", label="Created at", align="left", show-overflow-tooltip, :sortable="true", fixed="right")
        template(slot-scope="scope")
            span {{ dateForHumans(scope.row.openingcashtime) }}
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
import OpeningcashForm from '@/components/accounts/OpeningcashForm';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
import MoneyMixin from '@/mixins/MoneyMixin';
import OpeningCashListFilter from '@/components/accounts/filters/OpeningCashListFilter';
import EmptyState from '@/components/EmptyState';
import { ObjectToFormData, parseColData } from '@/utils/helper';

export default {
  mounted() {
    this.clearSelectedOpeningcash();
    this.clearOpeningcashs();
    this.loading = true;
    this.filter = { ...this.filter, branchid: this.currentBranch.id }
    this.preloadItemsList();
    this.handleBottomScroll(
      document.querySelector('.ocl .el-table__body-wrapper')
    );
  },
  mixins: [deleteMixin, filterMixin, MoneyMixin],
  data() {
    return {
      formPanelOpen: false,
      isCreatingOpeningcash: false,
      filter: {
        searchopeningcash: 'searchopeningcash',
        page: 1,
        fromtime5: '1970-01-01 00:00:01',
        totime5: '8000-00-00 00:00:00',
        branchid: null,
      },
      displaySearchFilters: false,
      filterParams: {
        searchopeningcash: 'searchopeningcash',
        page: 1,
        fromtime5: '',
        totime5: '',
        fromuser2: '',
        touser2: '',
      },
      loading: false,
      items: {
        data: []
      }
    };
  },
  watch: {
    openingcashs(newValue) {
      this.items = newValue;
      this.filter.page = newValue.nextPage;
    },
  },
  methods: {
    ...mapActions('openingcash', [
      'clearSelectedOpeningcash',
      'clearOpeningcashs',
    ]),
    parseColData(data) {
      if (data === 'null') {
        return '-';
      }
      return data;
    },
    searchOpeningcashs() {
      this.search({
        ...this.filter,
        type: this.searchQuery,
      }, 'POST');
    },
    ...mapActions('openingcash', {
      searchItems: 'loadOpeningcashsByPage',
    }),
    ...mapActions('openingcash', {
      loadItems: 'loadOpeningcashsByPage',
    }),
    deleteItems() {},
    createNewOpeningcash() {
      this.formPanelOpen = true;
      this.isCreatingOpeningcash= true;
      this.$scrollTo(this.$refs['new-openingcash-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      });
    },
    closeNewOpeningcashForm() {
      this.formPanelOpen = false;
      this.isCreatingOpeningcash= false;
    },
    showOpeningcash(row) {
      this.$router.push({ name: 'openingcash_view', params: { id: row.id } });
    },
    ...{ formatDate, formatStatus, dateForHumans, parseColData },
  },
  computed: {
    ...mapState('openingcash', ['openingcashs']),
    ...mapState('branch', ['currentBranch']),
  },
  components: {
    Loading,
    OpeningcashForm,
    FullscreenDialog,
    InfiniteLoading,
    OpeningCashListFilter,
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
