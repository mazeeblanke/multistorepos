<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      BankingcashForm.page-forms(
        ref="new-bankingcash-form",
        @close-form="closeNewBankingcashForm",
        @action-complete="closeNewBankingcashForm",
        v-if="formPanelOpen"
      )
    .level.toolbar.shadow-divider(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 
          | Listing Banking cash ({{ filteredItemsData.length }})
      .level-right
        .level-item
          a.button.is-primary(@click="createNewBankingcash", :disabled="formPanelOpen")
            span.icon
              i.material-icons add
            span Create Bankingcash
        .level-item
          span.is-clickable(@click="displaySearchFilters = !displaySearchFilters")
            span.icon
              i.material-icons youtube_searched_for
    // BankingCashListFilter(
    //   :filter-params.sync="filterParams", 
    //   @change="filterItems", 
    //   v-show="displaySearchFilters"
    // )
    EmptyState(
      empty-text="No Result", 
      v-if="!filteredItemsData.length && !loading", 
      :style="{ height: '400px' }"
    )
    Loading(
      loading-text="Loading bankingcashs", 
      v-if="(loading && !filteredItemsData.length)", 
      :style="{ height: '400px' }"
    )
    el-table.bcl(
      ref="items-table",
      :data="filteredItemsData",
      :max-height="500",
      :border="false"
      :default-sort="{prop: 'created_at', order: 'descending'}",
      :highlight-current-row="true",
      v-show="filteredItemsData.length",
      @selection-change="handleSelectionChange",
    )
      el-table-column(type="selection")
      el-table-column(label="No", type="index", :index="1")
      el-table-column(show-overflow-tooltip, label="User (from)", :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ parseColData(scope.row.fromuser.full_name) }}
      el-table-column(show-overflow-tooltip, label="User (to)", :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ parseColData(scope.row.touser.full_name) }}
      el-table-column(label="Amount", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ money(parseColData(scope.row.amount)) }}
      el-table-column(label="Details", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ parseColData(scope.row.details) }}
      el-table-column(label="Created at", show-overflow-tooltip, :sortable="true", :width="130")
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
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import { formatDate, formatStatus, dateForHumans } from '@/filters/format'
import Loading from '@/components/shared/Loading'
import BankingcashForm from '@/components/accounts/BankingCashForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import InfiniteLoading from 'vue-infinite-loading'
import deleteMixin from '@/mixins/DeleteMixin'
import filterMixin from '@/mixins/FilterMixin'
import MoneyMixin from '@/mixins/MoneyMixin'
import BankingCashListFilter from '@/components/accounts/filters/BankingCashListFilter'
import EmptyState from '@/components/EmptyState'
import { parseColData } from '@/utils/helper'
import moment from 'moment'

export default {

  mounted() {
    this.clearSelectedBankingcash();
    this.clearBankingcashs();
    this.preloadItemsList();
    this.handleBottomScroll(
      document.querySelector('.bcl .el-table__body-wrapper')
    );
  },

  mixins: [deleteMixin, filterMixin, MoneyMixin],

  data() {
    return {
      filter: {
      },
      displaySearchFilters: false,
      loading: false
    };
  },

  watch: {

    bankingcashs(newValue) {
      this.items = newValue
    }

  },

  methods: {

    ...mapActions('bankingcash', [
      'clearSelectedBankingcash',
      'clearBankingcashs',
    ]),

    ...mapMutations('app', ['SET_FORM_STATE']),

    ...mapActions('bankingcash', {
      searchItems: 'loadBankingcashs',
    }),

    ...mapActions('bankingcash', {
      loadItems: 'loadBankingcashs',
    }),

    deleteItems() {},

    createNewBankingcash() {
      this.SET_FORM_STATE(true);
      this.$scrollTo(this.$refs['new-bankingcash-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      });
    },

    closeNewBankingcashForm() {
      this.SET_FORM_STATE(false);
    },

    ...{ formatDate, formatStatus, dateForHumans, parseColData },

  },

  computed: {

    ...mapState('bankingcash', ['bankingcashs']),

    ...mapState('app', ['formPanelOpen'])

  },

  components: {
    Loading,
    BankingcashForm,
    FullscreenDialog,
    InfiniteLoading,
    BankingCashListFilter,
    EmptyState,
  }

};
</script>

<style lang="sass" module>
.columns
  margin: 0px 50px
.trash
  border: none
  background: transparent
</style>
