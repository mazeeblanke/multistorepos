<template lang="pug">
  .MaterialView.shadow-divider
    FullscreenDialog( v-close="closeDialog", @closed="closeDialog", :active.sync="fullScreenActive")
      SupplierForm.page-forms(
        ref="supplier-form",
        :class="$style.pageForms",
        @close-form="closeDialog",
        :_supplier="selectedSupplier",
        v-if="fullScreenActive"
      )
    .level.toolbar
      .level-left
        .level-item
          router-link.button(:to="{name: 'suppliers_list'}")
            span.icon.is-medium
              i.material-icons keyboard_arrow_left
        .level-item(v-if="selectedSupplier")
          .page-title.subtitle.is-6
            span.mr-5 Viewing Supplier
            span.tag.is-medium.is-warning 
              | {{ selectedSupplier.name }}
      .level-right
        .level-item
          .field.has-addons
            p.control
              button.button(@click="fullScreenActive = !fullScreenActive")
                span.icon
                  i.material-icons edit
                span Edit Information
    Loading(
      loading-text="Loading supplier information", 
      v-if="isLoading", 
      :style="{ height: '400px' }"
    )
    el-tabs(v-model="currentTab", value='summary', type="card", v-if="!isLoading")
      el-tab-pane(name="details", label='Supplier Details')
        .columns(:class="$style.columns" v-if="selectedSupplier")
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-right
                  strong  ID:
              .field-label.is-normal
                label.label.is-pulled-left  
                  | {{ selectedSupplier.id }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-right
                  strong  Name:
              .field-label.is-normal
                label.label.is-pulled-left  
                  | {{ selectedSupplier.name }} 
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-right
                  strong  Email: 
              .field-label.is-normal
                label.label.is-pulled-left  
                  | {{ parseColData(selectedSupplier.email) }}
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-right
                  strong  Address: 
              .field-label.is-normal
                label.label.is-pulled-left 
                  | {{ parseColData(selectedSupplier.address) }}
            .field.is-horizontal
              .field-label.is-normal
                label.label.has-text-right
                  strong  Phone No.:
              .field-label.is-normal
                label.label.is-pulled-left 
                  | {{ parseColData(selectedSupplier.phone) }} 
        .mt-56
          h5.title.is-5.has-text-centered Supply history
          el-table(
            v-loading="isLoadingSuppliedProducts"
            :data="sales",
            :empty-text="emptyText",
            :max-height="200",
            :height="200",
          )
            el-table-column(label="No", type="index", :index="1")
            el-table-column(prop="supplier", show-overflow-tooltip, label="Supplier name", align="center")
            el-table-column(prop="salesid", show-overflow-tooltip, label="Product name", align="center")
            el-table-column(prop="total", show-overflow-tooltip, label="Qty", align="center")    
            el-table-column(prop="salestime", show-overflow-tooltip, label="Sold at", align="center")     
</template>

<script>
/* eslint-disable */
import { formatDate, formatMoney, dateForHumans } from '@/filters/format';
import { mapActions, mapState, mapMutations } from 'vuex';
import SupplierForm from '@/components/suppliers/SupplierForm';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import Loading from '@/components/shared/Loading';
import { ObjectToFormData, parseColData } from '@/utils/helper';

export default {
  data() {
    return {
      isEditing: false,
      editMat: false,
      isSavingAssessment: false,
      previewingDoc: false,
      selectedMaterials: [],
      isLoading: false,
      editRemarks: false,
      fullScreenActive: false,
      currentTab: 'details',
      isLoadingSuppliedProducts: false
    }
  },

  mounted() {
    this.clearSelectedSupplier();
    this.isLoading = true;
    this.loadSupplier({
      id: this.$route.params.id
    })
    .then(() => {
      this.isLoading = false;
      // this.isLoadingSuppliedProducts = true;
    })
    .catch((err) => {
      console.log(err);
      this.$snackbar.open({
        message: 'Could not find a Supplier with that ID',
        type: 'is-danger',
      });
      this.isLoading = false;
      // this.isLoadingSuppliedProducts = false;
      this.$router.push({ name: 'suppliers_list'});
    });
  },

  components:{
    Loading,
    SupplierForm,
    FullscreenDialog
  },

  methods: {

    ...{ formatDate, dateForHumans },

    ...mapActions('suppliers', [
      'loadSupplier',
      'clearSelectedSupplier'
    ]),

    ...mapActions('products', [
      'getSupplierProducts',
    ]),

    ...mapActions('sales', [
      'loadSales',
    ]),

    closeDialog() {
      this.fullScreenActive = false;
    },

    ...{ parseColData },
  },

  computed: {

    ...mapState('suppliers', [
      'selectedSupplier',
    ]),
  
    // sales() {
    //   if (this.selectedSupplier && this.selectedSupplier.sales) {
    //     return this.selectedSupplier.sales;
    //   }
    //   return [];
    // },

    // documentName() {
    //   if (this.selectedSupplier) {
    //     return `${this.selectedSupplier.firstname}'s purchase history`;
    //   }
    //   return null;
    // },

    emptyText() {
      return `${this.selectedSupplier.name} has not supplied anything yet`;
    }

  }
};
</script>

<style lang="sass" scoped>
.field-label
  text-align: left !important
.label  
  font-weight: 100
.shadow-divider
  box-shadow: 0px 0px 4px 0 rgba(0, 0, 0, 0.08) inset !important;
  min-height: 560px !important;  
</style>

<style lang="sass">
.el-progress
  padding: 25px
  position: absolute
  top: 5%
  z-index: 23
  width: 100%  
</style>

<style lang="sass" module> 
.columns
  margin: 20px 50px 10px 50px
.trash
  border: none
  background: transparent    
</style>
