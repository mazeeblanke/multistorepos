<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      BankingcashForm.page-forms(
        ref="new-bankingcash-form",
        @close-form="closeNewBankingcashForm",
        @action-complete="closeNewBankingcashForm",
        v-if="isCreatingBankingcash"
      )
    .level.toolbar.shadow-divider(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 Listing Banking cash ({{ filteredItemsData.length }})
      .level-right
        .level-item
          a.button.is-primary(@click="createNewBankingcash", :disabled="formPanelOpen")
            span.icon
              i.material-icons add
            span Create Bankingcash
        .level-item
          a.button(@click="displaySearchFilters = !displaySearchFilters")
            span Toggle search filters
            span.icon
              i.material-icons keyboard_arrow_down
    BankingCashListFilter(:filter-params.sync="filterParams", @change="filterItems", v-show="displaySearchFilters")
    EmptyState(empty-text="No Result" v-if="!filteredItemsData.length && !loading", :style="{ height: '400px' }")
    Loading(loading-text="Loading bankingcashs" v-if="(loading && !filteredItemsData.length) || isSearching", :style="{ height: '400px' }")
    el-table.bcl(
      ref="items-table",
      :data="filteredItemsData",
      :max-height="400",
      :border="false"
      :default-sort="{prop: 'created_at', order: 'descending'}",
      :highlight-current-row="true",
      v-show="filteredItemsData.length && !isSearching",
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
      el-table-column(prop="bankingcashtime", label="Created at", align="left", show-overflow-tooltip, :sortable="true", fixed="right")
        template(slot-scope="scope")
            span {{ dateForHumans(scope.row.bankingcashtime) }}
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
import BankingcashForm from '@/components/accounts/BankingcashForm';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
import MoneyMixin from '@/mixins/MoneyMixin';
import BankingCashListFilter from '@/components/accounts/filters/BankingCashListFilter';
import EmptyState from '@/components/EmptyState';
import { ObjectToFormData, parseColData } from '@/utils/helper';

export default {
  mounted() {
    this.clearSelectedBankingcash();
    this.clearBankingcashs();
    this.loading = true;
    this.filter = { ...this.filter, branchid: this.currentBranch.id }
    this.preloadItemsList();
    this.handleBottomScroll(
      document.querySelector('.bcl .el-table__body-wrapper')
    );
  },
  mixins: [deleteMixin, filterMixin, MoneyMixin],
  data() {
    return {
      formPanelOpen: false,
      isCreatingBankingcash: false,
      filter: {
        searchbankingcash: 'searchbankingcash',
        page: 1,
        fromtime6: '1970-01-01 00:00:01',
        totime6: '8000-00-00 00:00:00',
        branchid: null,
      },
      displaySearchFilters: false,
      filterParams: {
        searchbankingcash: 'searchbankingcash',
        page: 1,
        fromtime6: '',
        totime6: '',
        fromuser4: '',
        touser4: '',
        bank: '',
      },
      loading: false,
      items: {
        data: []
      }
    };
  },
  watch: {
    bankingcashs(newValue) {
      this.items = newValue;
      this.filter.page = newValue.nextPage;
    },
  },
  methods: {
    ...mapActions('bankingcash', [
      'clearSelectedBankingcash',
      'clearBankingcashs',
    ]),
    parseColData(data) {
      if (data === 'null') {
        return '-';
      }
      return data;
    },
    searchBankingcashs() {
      this.search({
        ...this.filter,
        type: this.searchQuery,
      }, 'POST');
    },
    ...mapActions('bankingcash', {
      searchItems: 'loadBankingcashsByPage',
    }),
    ...mapActions('bankingcash', {
      loadItems: 'loadBankingcashsByPage',
    }),
    deleteItems() {},
    createNewBankingcash() {
      this.formPanelOpen = true;
      this.isCreatingBankingcash= true;
      this.$scrollTo(this.$refs['new-bankingcash-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      });
    },
    closeNewBankingcashForm() {
      this.formPanelOpen = false;
      this.isCreatingBankingcash= false;
    },
    showBankingcash(row) {
      this.$router.push({ name: 'bankingcash_view', params: { id: row.id } });
    },
    ...{ formatDate, formatStatus, dateForHumans, parseColData },
  },
  computed: {
    ...mapState('bankingcash', ['bankingcashs']),
    ...mapState('branch', ['currentBranch']),
  },
  components: {
    Loading,
    BankingcashForm,
    FullscreenDialog,
    InfiniteLoading,
    BankingCashListFilter,
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
