<template lang="pug">
  .ContractsListFilter.filters-section
    .columns
      .column
        .field
          label.label Employee (From)
          .field-body.groupFilters
            .field
              el-select.has-full-width(
                v-model="filterParams.fromuser2"
                :filterable="true"
                :remote="true"
                :clearable="true"
                placeholder="e.g John Doe"
                :remote-method="getSalesSuggestions"
                popper-class="salesUserSelect"
                size="small"
                @change="notifyFilterChange()"
              )
                el-option(
                  v-for="(item, index) in suggestions"
                  :key="index"
                  :label="item.username"
                  :value="item.username"
                )
      .column
        .field
          label.label Employee (To)
          .field.has-addons
            el-select.has-full-width(
              v-model="filterParams.touser2"
              :filterable="true"
              :remote="true"
              :clearable="true"
              placeholder="e.g John Doe"
              :remote-method="getSalesSuggestions"
              popper-class="salesUserSelect"
              size="small"
              @change="notifyFilterChange()"
            )
              el-option(
                v-for="(item, index) in suggestions"
                :key="index"
                :label="item.username"
                :value="item.username"
              )
      .column(v-show="$can('super-admin')")
        .field
          label.label Branch
          .field.has-addons
            el-select.has-full-width(
              v-model="filterParams.branchid",
              filterable,
              placeholder="select branch",
              remote,
              :remote-method="_loadBranches",
              :loading="loadingBranches",
              no-data-text="No results!",
              value-key="id",
              @change="notifyFilterChange()"
              size="small"
            )
              el-option(
                v-for="branch in branchSuggestions",
                :value="branch.id",
                :label="branch.name",
              )
      .column
        .field
          label.label Duration
          .field
            p.control.is-expanded
              el-date-picker(
                size="small"
                v-model="range"
                type="datetimerange"
                start-placeholder="Start Date"
                end-placeholder="End Date"
                :default-time="['12:00:00']"
                value-format="yyyy-MM-dd HH:mm:ss"
                @change="notifyFilterChange()"
              )
      .column
        .field
          label.label Period
          .field
            p.control.is-expanded
              el-select(v-model="reportTimeRange", @change="setTimeRange", size="small", placeholder="Time range/period")
                el-option(label="Hourly" value="hourly")
                el-option(label="Daily" value="daily")
                el-option(label="Weekly" value="weekly")
                el-option(label="Monthly" value="monthly")
                el-option(label="Quarterly" value="quarterly")
                el-option(label="Anually" value="anually")
      //- .column
      //-   .field
      //-     label.label Start Date
      //-     .field.has-addons
      //-       p.control.is-expanded
      //-         input.input(
      //-           v-model="filterParams.fromtime5",
      //-           type="date",
      //-           @change="notifyFilterChange()"
      //-         )
      //-       p.control
      //-         button.button(v-if="!filterParams.fromtime5")
      //-           b-icon(icon="filter_list")
      //-         button.button(
      //-           v-if="filterParams.fromtime5",
      //-           @click="removeFilter('fromtime5')"
      //-         )
      //-           b-icon(icon="clear" type="is-info")
      //- .column
      //-   .field
      //-     label.label End Date
      //-     .field.has-addons
      //-       p.control.is-expanded
      //-         input.input(
      //-           v-model="filterParams.totime5",
      //-           type="date",
      //-           @change="notifyFilterChange()"
      //-         )
      //-       p.control
      //-         button.button(v-if="!filterParams.totime5")
      //-           b-icon(icon="filter_list")
      //-         button.button(
      //-           v-if="filterParams.totime5",
      //-           @click="removeFilter('totime5')"
      //-         )
      //-           b-icon(icon="clear" type="is-info")
      //- .column.is-2
      //-   .field
      //-     label.label Filter by Approval Status
      //-     b-field.is-expanded
      //-       b-select(
      //-         v-model="filterParams.status",
      //-         placeholder="Select approval status...",
      //-         @input="notifyFilterChange()"
      //-       )
      //-         option(value="approved") Approved
      //-         option(value="pending") Pending Approval
      //-       p.control
      //-         button.button(v-if="!filterParams.status")
      //-           b-icon(icon="filter_list")
      //-         button.button(
      //-           v-if="filterParams.status",
      //-           @click="removeFilter('status')"
      //-         )
      //-           b-icon(icon="clear" type="is-info")
      //- .column.is-2
      //-   .field
      //-     label.label Filter by Req Type
      //-     b-field.is-expanded
      //-       b-select(
      //-         v-model="filterParams.requisitionType",
      //-         placeholder="Select Requisition type",
      //-         @input="notifyFilterChange()"
      //-       )
      //-         option(value="RFP") RFP
      //-         option(value="RFQ") RFQ
      //-       p.control
      //-         button.button(v-if="!filterParams.requisitionType")
      //-           b-icon(icon="filter_list")
      //-         button.button(
      //-           v-if="filterParams.requisitionType",
      //-           @click="removeFilter('requisitionType')"
      //-         )
      //-           b-icon(icon="clear" type="is-info")
</template>

<script>
/* eslint-disable */
import _ from 'lodash';
import { mapState, mapActions } from 'vuex';
import { ObjectToFormData, parseColData } from '@/utils/helper';
const DAILY = 'daily';
const WEEKLY = 'weekly';
const HOURLY = 'hourly';
const MONTHLY = 'monthly';
const QUARTERLY = 'quarterly';
const ANUALLY = 'anually';

export default {
  props: {
    filterParams: Object,
  },
  data() {
    return {
      range: [],
      suggestions: [],
      loading: false,
      reportTimeRange: null,
      branchSuggestions: [],
      loadingBranches: false,
    };
  },
  watch: {
    range() {
      this.notifyFilterChange();
    },
  },
  methods: {
    ...mapActions('customers', [
      'loadCustomers',
    ]),
    ...mapActions('branch', [
      'loadBranches',
    ]),
    _loadBranches(query) {
      if (query !== '') {
        this.loadingBranches = true;
        this.loadBranches(ObjectToFormData({
          allbranches: 'allbranches',
        }))
        .then((res) => {
          this.branchSuggestions = res;
          this.loadingBranches = false;
        })
        .catch(() => {
          this.loadingBranches = false;
        });
      }
    },
    getSalesSuggestions(query) {
      if (query) {
        this.loading = true;
        let payload = {
          search: query,
          type: 'user',
        };
        this.loadCustomers(payload)
          .then(suggestions => {
            this.loading = false;
            this.suggestions = suggestions;
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        this.suggestions = [];
      }
    },
    notifyFilterChange() {
      const filterParams = {
        ...this.filterParams,
        fromtime5: this.range[0],
        totime5: this.range[1],
      };
      this.$emit('update:filterParams', filterParams);
      this.$emit('change');
    },
    removeFilter(name) {
      // _.set(this.filterParams, name, null);
      this.notifyFilterChange();
    },
    setTimeRange(value) {
      if (value === DAILY) {
        this.range = [
          this.$moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          this.$moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        ]
      }

      if (value === WEEKLY) {
        this.range = [
          this.$moment().startOf('week').format('YYYY-MM-DD HH:mm:ss'),
          this.$moment().endOf('week').format('YYYY-MM-DD HH:mm:ss'),
        ]
      }

      if (value === MONTHLY) {
        this.range = [
          this.$moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
          this.$moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'),
        ]
      }

      if (value === QUARTERLY) {
        this.range = [
          this.$moment().startOf('quarter').format('YYYY-MM-DD HH:mm:ss'),
          this.$moment().endOf('quarter').format('YYYY-MM-DD HH:mm:ss'),
        ]
      }

      if (value === ANUALLY) {
        this.range = [
          this.$moment().startOf('year').format('YYYY-MM-DD HH:mm:ss'),
          this.$moment().endOf('year').format('YYYY-MM-DD HH:mm:ss'),
        ]
      }

      if (value === HOURLY) {
        this.range = [
          this.$moment().startOf('hour').format('YYYY-MM-DD HH:mm:ss'),
          this.$moment().endOf('hour').format('YYYY-MM-DD HH:mm:ss'),
        ]
      }

    },
  },
  // computed: {
  //   ...mapState('organizations', ['organizationUsers']),
  //   ...mapState('users', ['currentUser']),
  // },
};
</script>

<style lang="sass">
  .groupFilters
    // .field
    //   margin: 0px !important
    // button
    //   height: 32px !important
    //   border-bottom-left-radius: 0px !important
    //   border-top-left-radius: 0px !important
    //   border-left: 0px !important
    // input
      // border-bottom-right-radius: 0px !important
      // border-top-right-radius: 0px !important
      // box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.1) !important
  </style>
