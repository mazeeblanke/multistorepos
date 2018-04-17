<template lang="pug">
  .MaterialView.shadow-divider
    FullscreenDialog( v-close="closeDialog", @closed="closeDialog", :active.sync="fullScreenActive")
      BranchForm.page-forms(
        ref="branch-form",
        :class="$style.pageForms",
        @close-form="closeDialog",
        @updated-branch="updatedBranchDetails"
        :_branch="selectedBranch",
      )
    .level.toolbar
      .level-left
        .level-item
          router-link.button(:to="{name: 'branches_list'}")
            span.icon.is-medium
              i.material-icons keyboard_arrow_left
        .level-item(v-if="selectedBranch")
          .page-title.subtitle.is-6
            span.mr-5 Viewing Branch
            span.tag.is-medium.is-warning {{ selectedBranch.name }}
      .level-right
        .level-item
          .field.has-addons
            p.control
              JsonExcel(
                class="btn btn-default",
                :data="selectedBranch.sales",
                :fields="json_fields",
                :name="documentName",
                type="xlsx",
                v-if="selectedBranch"
              )
                button.button.is-primary(:disabled="!selectedBranch || !selectedBranch.sales.length")
                  span Download Purchase history
        .level-item
          .field.has-addons
            p.control
              button.button(@click="fullScreenActive = !fullScreenActive")
                span.icon
                  i.material-icons edit
                span Edit Information
    Loading(loading-text="Loading branch information" v-if="isLoading", :style="{ height: '400px' }")
    el-tabs(v-model="currentTab", value='summary', type="card", v-if="!isLoading")
      el-tab-pane(name="details", label='Branch Details')
        .columns(:class="$style.columns" v-if="selectedBranch")
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong  Name:
              .field-label.is-normal
                label.label.is-pulled-left  {{ selectedBranch.name }}
            //- .field.is-horizontal
            //-   .field-label.is-normal
            //-     label.label
            //-       strong  Username:
            //-   .field-label.is-normal
            //-     label.label.is-pulled-left  {{ parseColData(selectedBranch.username) }}
            //- .field.is-horizontal
            //-   .field-label.is-normal
            //-     label.label
            //-       strong  Registration date:
            //-   .field-label.is-normal
            //-     label.label.is-pulled-left {{ parseColData(selectedBranch.reg_time) }}
          .column.is-6
            .field.is-horizontal
              .field-label.is-normal
                label.label
                  strong Address:
              .field-label.is-normal
                label.label.is-pulled-left {{ selectedBranch.address }}
            //- .field.is-horizontal
            //-   .field-label.is-normal
            //-     label.label
            //-       strong Access:
            //-   .field-label.is-normal
            //-     label.label.is-pulled-left  {{ parseColData(selectedBranch.access) }}
        .mt-70
          h5.title.is-5.has-text-centered Sales history
          el-table(
            v-loading="isLoadingSales"
            :data="selectedBranch.sales",
            :empty-text="emptyText",
            :max-height="300"
          )
            el-table-column(label="No", type="index", :index="1")
            el-table-column(prop="customer", show-overflow-tooltip, label="Customer name", align="center" sortable)
            el-table-column(prop="salesid", show-overflow-tooltip, label="Sales ID", align="center" sortable)
            el-table-column(prop="total", show-overflow-tooltip, label="Total", align="center" sortable)
            el-table-column(prop="discount", show-overflow-tooltip, label="Discount", align="center" sortable)
            el-table-column(prop="paid", show-overflow-tooltip, label="Paid", align="center" sortable)
            el-table-column(prop="user", show-overflow-tooltip, label="Sold by", align="center" sortable)
            el-table-column(prop="salestime", show-overflow-tooltip, label="Sold at", align="center" sortable)
</template>

<script>
/* eslint-disable */
import EmptyState from '@/components/EmptyState';
import { formatDate, formatMoney, dateForHumans } from '@/filters/format';
import { mapActions, mapState, mapMutations } from 'vuex';
import BranchForm from '@/components/branches/BranchForm';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import Loading from '@/components/shared/Loading';
import JsonExcel from 'vue-json-excel';
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
      isLoadingSales: false,
      json_fields : {
        Customer: 'customer',
        Total: 'total',
        Discount: 'discount',
        profit:  'profit',
        Tax: 'tax',
        'Sales ID': 'salesid',
        'Sold by': 'user',
        'Payment method': 'payment',
        'Sold at': 'salestime',
      },
    }
  },
  mounted() {
    this.clearSelectedBranch();
    this.isLoading = true;
    this.loadBranch(
      ObjectToFormData({
        branchid: this.$route.params.id,
        getbranch: 'getbranch',
      })
    )
    .then(() => {
      this.isLoading = false;
      this.isLoadingSales = true;
      return this.loadSales(
        ObjectToFormData({
          salessearch: 'salessearch',
          fromtime: '0000-00-01 00:00:00',
          totime: '7018-02-07 00:00:00',
          branchid: this.selectedBranch.id,
        })
      )
    })
    .then((res) => {
      this.isLoadingSales = false;
      if (res.status === 'Success') {
        this.setSelectedBranchSales(res.message);
      }
    })
    .catch((err) => {
      console.log(err);
      this.$snackbar.open({
        message: 'Could not find a Branch with that ID',
        type: 'is-danger',
      });
      this.isLoading = false;
      this.isLoadingSales = false;
      this.$router.push({ name: 'branches_list'});
    });
  },
  components:{
    EmptyState,
    Loading,
    BranchForm,
    FullscreenDialog,
    JsonExcel,
  },
  methods: {
    ...{ formatDate, dateForHumans },
    ...mapActions('branch', [
      'loadBranch',
      'clearSelectedBranch',
      'setSelectedBranchSales',
    ]),
    ...mapActions('sales', [
      'loadSales',
    ]),
    ...mapMutations('branch', [
      'SET_SELECTED_BRANCH',
    ]),
    updatedBranchDetails(branch) {
      this.SET_SELECTED_BRANCH({
        ...this.selectedBranch,
        ...branch,
      });
    },
    closeDialog() {
      this.fullScreenActive = false;
    },
    ...{ parseColData },
  },
  computed: {
    ...mapState('branch', [
      'selectedBranch',
    ]),
    fullname() {
      if (this.selectedBranch.name) {
        return `${this.selectedBranch.name}`;
      }
      return '-';
    },
    documentName() {
      if (this.selectedBranch) {
        return `${this.selectedBranch.name}'s purchase history`;
      }
      return null;
    },
    emptyText() {
      return `${this.selectedBranch.name} has not sold anything yet`;
    }
  },
};
</script>

<style lang="sass" scoped>
// .field-label
//   text-align: left !important
.label
  font-weight: 100
.shadow-divider
  box-shadow: 0px 0px 4px 0 rgba(0, 0, 0, 0.08) inset !important;
  min-height: 560px !important;
</style>

<style lang="sass">
// .el-table__body-wrapper
//   overflow-x: hidden
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
