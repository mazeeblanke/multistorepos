<template lang="pug">
  .ContractsListFilter.filters-section
    .columns
      .column
        .field
          label.label Employee (From)
          .field-body.groupFilters
            .field 
              el-select.has-full-width(
                v-model="filterParams.fromuser4"
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
              v-model="filterParams.touser4"
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
          label.label Bank
          .field.has-addons
            el-input(
              v-model="filterParams.bank"
              size="small"
              @change="notifyFilterChange()"
              placeholder="e.g Ecobank"
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
</template>

<script>
/* eslint-disable */
import _ from 'lodash';
import { mapState, mapActions } from 'vuex';
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
    };
  },
  watch: {
    range() {
      this.notifyFilterChange();
    },
  },
  methods: {
    // ...mapActions('organizations', ['loadOrganizationUsers']),
    ...mapActions('customers', [
      'loadCustomers',
    ]),
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
        fromtime6: this.range[0],
        totime6: this.range[1],
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