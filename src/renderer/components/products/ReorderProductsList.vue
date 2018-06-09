<template lang="pug">
div
  .ExpiredProductList
    EmptyState(
      empty-text="No products below reorder point !", 
      v-if="!filteredItemsData.length && !loading", 
      :style="{ height: '400px' }"
    )
    Loading(
      loading-text="Loading products to reorder", 
      v-if="(loading && !filteredItemsData.length)", 
      :style="{ height: '400px' }"
    )
    el-table.p-0.reorderproductlist(
      ref="items-table",
      :data="filteredItemsData",
      max-height="400",
      :border="false"
      :highlight-current-row="true",
      :stripe="true",
       v-show="filteredItemsData.length",
    )
      el-table-column(label="No", type="index", :index="1" width="50")
      el-table-column(prop="id", show-overflow-tooltip, label="ID", width="70", :sortable="true")
      el-table-column(prop="name", show-overflow-tooltip, label="Description", :sortable="true")
      el-table-column(prop="barcode", show-overflow-tooltip, label="Barcode", :sortable="true")
      el-table-column(prop="costprice", show-overflow-tooltip, label="Cost price", :sortable="true")
        template(slot-scope="scope")
          span {{ money(scope.row.costprice) }}
      el-table-column(prop="quantity", show-overflow-tooltip, label="Quantity", :sortable="true")
      el-table-column(label="Created At", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.el-icon-time.mr-5
          span {{ formatDate(scope.row.created_at) }}
      div(slot="append" v-show="showLoading")
       div(ref='loader' style="height: 45px;")
         infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import { formatDate, formatStatus, dateForHumans } from '@/filters/format';
import Loading from '@/components/shared/Loading';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
import MoneyMixin from '@/mixins/MoneyMixin';
import EmptyState from '@/components/EmptyState';
import { parseColData, money } from '@/utils/helper';

export default {

  mounted() {
    this.loading = true
    this.clearReorderProducts()
    this.preloadItemsList()
    this.handleBottomScroll(
      document.querySelector('.reorderproductlist .el-table__body-wrapper')
    )
  },

  mixins: [deleteMixin, filterMixin, MoneyMixin],

  data() {
    return {
      formPanelOpen: false,
      filter: {
        isReorderProducts: true,
        below_reorder: 1
      },
      displaySearchFilters: false,
      isEditingEnquiry: false,
      selectedEnquiry: {},
      loading: false,
      fullScreenActive: false,
      items: {
        data: []
      }
    };
  },
  
  watch: {
    reorderProducts (newValue) {
      this.items = newValue
    },
  },

  methods: {

    ...{ money },
    
    ...mapActions('products', [
      'loadProducts',
      'clearReorderProducts'
    ]),

    ...mapActions('products', {
      searchItems: 'loadProducts',
    }),

    ...mapActions('products', {
      loadItems: 'loadProducts',
    }),

    deleteItems() {},

    ...{ formatDate, formatStatus, dateForHumans, parseColData }

  },

  computed: {

    ...mapState('products', ['reorderProducts']),

  },

  components: {
    Loading,
    InfiniteLoading,
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
