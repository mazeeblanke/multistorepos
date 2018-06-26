<template lang="pug">
  .RequisitionList
    .form-panel(:class="{ 'is-active': formPanelOpen }")
      SupplierForm.page-forms(
        ref="new-supplier-form",
        @close-form="closeNewSupplierForm",
        @action-complete="closeNewSupplierForm",
        v-if="formPanelOpen"
      )
    .level.toolbar(:class="{ 'shadow-divider': formPanelOpen }")
      .level-left
        .level-item.page-title.subtitle.is-5 
          | Listing Suppliers ({{ filteredItemsData.length }})
      .level-item
          div.search
            el-input(
              placeholder="Search suppliers by name...", 
              clearable,
              v-model="filter.name", 
              @input="search('name')", 
              class="input-with-select"
            )
      .level-right
        .level-item
          a.button.is-primary(@click="createNewSupplier", :disabled="formPanelOpen")
            span.icon
              i.material-icons add
            span Create Supplier 
    EmptyState(
      empty-text="No Result", 
      v-if="!filteredItemsData.length && !loading", 
      :style="{ height: '400px' }"
    )
    Loading(
      loading-text="Loading suppliers", 
      v-if="(loading && !filteredItemsData.length)",
      :style="{ height: '400px' }"
    )
    el-table(
      ref="items-table",
      :data="filteredItemsData",
      :max-height="500",
      :border="false"
      @cell-click="handleCellClick"
      v-show="filteredItemsData.length",
      :default-sort="{prop: 'created_at', order: 'descending'}",
      @selection-change="handleSelectionChange"
    )
      el-table-column(type="selection")
      el-table-column(label="S/N", type="index", :index="1" )
      el-table-column(prop="id", width="150" show-overflow-tooltip, label="Supplier ID", :sortable="true")
         template(slot-scope="scope")
          span {{ parseColData(scope.row.id) }}
      el-table-column(prop="name", label="Name", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span {{ parseColData(scope.row.name) }}
      el-table-column(prop="email", label="Email", show-overflow-tooltip, :sortable="true" )
        template(slot-scope="scope")
          span {{ parseColData(scope.row.email) }}
      el-table-column(prop="address", label="Address", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span {{ parseColData(scope.row.address) }}
      el-table-column(prop="phone", label="Phone", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span {{ parseColData(scope.row.phone) }}
      el-table-column(prop="created", label="Created at", show-overflow-tooltip, :sortable="true")
        template(slot-scope="scope")
          span.el-icon-time.mr-5
          span {{ formatDate(scope.row.created_at) }}
      el-table-column(:render-header="renderDelete", width="70")
        template(slot-scope="scope")
          button.button(:class="$style.trash")
            span.el-icon-delete.font-size-23
      div(slot="append" v-show="showLoading")
       div(ref='loader' style="height: 45px;")
         infinite-loading(spinner="waveDots" v-if="loading")
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import { formatDate, formatStatus, dateForHumans } from '@/filters/format';
import Loading from '@/components/shared/Loading';
import SupplierForm from '@/components/suppliers/SupplierForm';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import InfiniteLoading from 'vue-infinite-loading';
import deleteMixin from '@/mixins/DeleteMixin';
import filterMixin from '@/mixins/FilterMixin';
import EmptyState from '@/components/EmptyState';
import { parseColData } from '@/utils/helper';

export default {

  mounted() {
    this.clearSelectedSupplier();
    this.clearSuppliers();
    this.preloadItemsList();
    this.handleBottomScroll();
  },

  mixins: [deleteMixin, filterMixin],

  data() {
    return {
      filter: {
        name: null
      },
      displaySearchFilters: false,
      loading: false,
      items: {
        data: []
      }
    };
  },

  watch: {

    suppliers(newValue) {
      this.items = newValue
    }

  },

  methods: {

    ...mapMutations('app', ['SET_FORM_STATE']),

    ...mapActions('suppliers', [
      'loadSuppliers',
      'clearSelectedSupplier',
      'clearSuppliers',
    ]),

    ...mapActions('suppliers', {
      searchItems: 'loadSuppliers',
    }),

    ...mapActions('suppliers', {
      loadItems: 'loadSuppliers',
    }),

    deleteItems() {},

    handleCellClick(row, cell) {
      if (cell.type !== 'selection') {
        this.showSupplier(row);
      }
    },

    createNewSupplier() {
      this.SET_FORM_STATE(true)
      this.$scrollTo(this.$refs['new-supplier-form'].$el, 1000, {
        container: '#snap-screen',
        easing: 'ease',
        offset: 20,
      });
    },

    closeNewSupplierForm() {
      this.SET_FORM_STATE(false)
    },

    showSupplier(row) {
      this.$router.push({ 
        name: 'supplier_view', 
        params: { id: row.id } 
      })
    },

    ...{ formatDate, formatStatus, dateForHumans, parseColData }
    
  },

  computed: {
    ...mapState('suppliers', ['suppliers']),
    ...mapState('app', ['formPanelOpen']),
  },

  components: {
    Loading,
    SupplierForm,
    FullscreenDialog,
    InfiniteLoading,
    EmptyState
  }

}
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
