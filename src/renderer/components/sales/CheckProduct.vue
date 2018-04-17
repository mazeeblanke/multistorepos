<template lang="pug">
  el-dialog.checkProduct(
    :visible="checkProductVisible"
    width="800px"
    :before-close="handleCheckProductClose"
  )
    div(v-loading="loading")
      .level.toolbar
        .level-left
        .level-item
          div.search
            el-input(
              placeholder="Search products by branch name...",
              clearable,
              class="input-with-select"
            )
              el-button(slot="append" icon="el-icon-search")
        .level-right
      el-table(
        ref="items-table",
        :data="filteredItemsData",
        :max-height="300",
        :height="300",
        :border="false"
        :default-sort="{prop: 'created_at', order: 'descending'}",
        :highlight-current-row="true",
        :stripe="true"
      )
        el-table-column(type="selection" fixed="left")
        el-table-column(label="No", type="index", :index="1" width="50" fixed="left")
        el-table-column(prop="id", show-overflow-tooltip, label="ID", align="left", width="70" :sortable="true")
          template(slot-scope="scope")
            span {{ scope.row[0].id || '-'}}
        el-table-column(prop="name", show-overflow-tooltip, label="Name", align="left", :min-width="200" :sortable="true")
          template(slot-scope="scope")
            span {{ scope.row[0].name || '-'}}
        el-table-column(prop="quantity", label="Quantity", align="left", show-overflow-tooltip, width="120" :sortable="true")
          template(slot-scope="scope")
            span {{ scope.row[0].quantity || 0 }}
        el-table-column(prop="branch", show-overflow-tooltip, label="branch", align="left", width="150" :sortable="true" )
          template(slot-scope="scope")
            span {{ scope.row.branch_details.name || '-' }}
        //- el-table-column(prop="costprice", show-overflow-tooltip, label="Cost price", align="left", :sortable="true")
        //- el-table-column(prop="exptime", show-overflow-tooltip, label="Expiry date", align="left", :sortable="true")
          template(slot-scope="scope")
            span {{ dateForHumans(scope.row.exptime) }}
    div(slot="footer")
</template>

<script>
/* eslint-disable */
import { mapActions } from 'vuex';
import { ObjectToFormData } from '@/utils/helper';

export default {
  props: {
    checkProductVisible: {
      required: true,
      type: Boolean,
    },
    product: {
      required: true,
      // type: Number,
    },
    handleCheckProductClose: {
      required: true,
      type: Function,
    },
  },
  mounted() {
    // console.log('nice stuff nice suff');
  },
  data() {
    return {
      // dialogVisible: false
      filteredItemsData: [],
      loading: false,
    };
  },
  methods: {
    ...mapActions('products', [
      'loadProductInBranches',
    ]),
    findProductInBranches() {
      this.loading = true;
      this.loadProductInBranches(
        ObjectToFormData({
          'checkproduct': 'checkproduct',
          'product': this.product,
        })
      )
      .then((res) => {
        this.filteredItemsData = res.message;
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
      })
    },
    // handleClose(done) {

    // }
  }
}
</script>

<style lang="sass">
.checkProduct
  .el-dialog__header
    border-bottom: none !important

</style>
