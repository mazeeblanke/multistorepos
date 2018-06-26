<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      OpeningcashForm.page-forms(
        ref="new-openingcash-form",
        @close-form="closeNewOpeningcashForm",
        @action-complete="closeNewOpeningcashForm",
        v-if="formPanelOpen"
      )
    .level.toolbar.shadow-divider(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 
          | Listing Opening cash ({{ filteredItemsData.length }})
      .level-right
        .level-item
          a.button.is-primary(@click="createNewOpeningcash", :disabled="formPanelOpen")
            span.icon
              i.material-icons add
            span Create Openingcash
        .level-item
          span.is-clickable(@click="displaySearchFilters = !displaySearchFilters")
            span.icon
              i.material-icons youtube_searched_for
    // OpeningCashListFilter(:filter-params.sync="filterParams", @change="filterItems", v-show="displaySearchFilters")
    EmptyState(
      empty-text="No Results :(", 
      v-if="!filteredItemsData.length && !loading", 
      :style="{ height: '400px' }"
    )
    Loading(
      loading-text="Loading openingcashs", 
      v-if="(loading && !filteredItemsData.length)", 
      :style="{ height: '400px' }"
    )
    el-table.ocl(
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
      el-table-column(prop="user", show-overflow-tooltip, label="User (From)", :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ parseColData(scope.row.fromuser.full_name) }}
      el-table-column(prop="user", show-overflow-tooltip, label="User (To)", :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ parseColData(scope.row.touser.full_name) }}
      el-table-column(prop="amount", label="Amount", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ money(parseColData(scope.row.amount)) }}
      el-table-column(prop="details", label="Details", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.is-capitalized {{ parseColData(scope.row.details) }}
      el-table-column(prop="openingcashtime", label="Created at", show-overflow-tooltip, :sortable="true", :width="130")
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
import OpeningcashForm from '@/components/accounts/OpeningCashForm'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import InfiniteLoading from 'vue-infinite-loading'
import deleteMixin from '@/mixins/DeleteMixin'
import filterMixin from '@/mixins/FilterMixin'
import MoneyMixin from '@/mixins/MoneyMixin'
import OpeningCashListFilter from '@/components/accounts/filters/OpeningCashListFilter'
import EmptyState from '@/components/EmptyState'
import { ObjectToFormData, parseColData } from '@/utils/helper'
import moment from 'moment'

export default {

  mounted() {
    this.clearSelectedOpeningcash()
    this.clearOpeningcashs()
    this.preloadItemsList()
    this.handleBottomScroll(
      document.querySelector('.ocl .el-table__body-wrapper')
    )
  },

  mixins: [deleteMixin, filterMixin, MoneyMixin],

  data() {
    return {
      isCreatingOpeningcash: false,
      filter: {
      },
      displaySearchFilters: false,
      filterParams: {
      },
      loading: false,
    }
  },

  watch: {

    openingcashs(newValue) {
      this.items = newValue
    }

  },

  methods: {

    ...mapActions('openingcash', [
      'clearSelectedOpeningcash',
      'clearOpeningcashs',
    ]),

    ...mapMutations('app', [
      'SET_FORM_STATE'
    ]),

    ...mapActions('openingcash', {
      searchItems: 'loadOpeningcashs',
    }),

    ...mapActions('openingcash', {
      loadItems: 'loadOpeningcashs',
    }),

    deleteItems() {},

    createNewOpeningcash() {
      this.SET_FORM_STATE(true);
      this.$scrollTo(this.$refs['new-openingcash-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      });
    },

    closeNewOpeningcashForm() {
      this.SET_FORM_STATE(false);
    },

    ...{ formatDate, formatStatus, dateForHumans, parseColData },

  },

  computed: {

    ...mapState('openingcash', ['openingcashs']),

    ...mapState('app', ['formPanelOpen'])

  },

  components: {
    Loading,
    OpeningcashForm,
    FullscreenDialog,
    InfiniteLoading,
    OpeningCashListFilter,
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
