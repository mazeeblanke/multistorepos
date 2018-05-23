<template lang="pug">
  .ContractsListFilter.filters-section
    .columns
      .column
        .field
          label.label Employee Name
          .field-body.groupFilters
            .field
              el-select.has-full-width(
                v-model="filterParams.usersalary2"
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
          label.label Title
          .field.has-addons
            el-input(
              v-model="filterParams.title"
              size="small"
              @input="notifyFilterChange()"
              placeholder="e.g Salary for the month"
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
                :key="branch.id",
              )
      .column
        .field
          label.label Type
          .field.has-addons
            el-input(
              v-model="filterParams.type"
              size="small"
              @input="notifyFilterChange()"
              placeholder="e.g Office supply"
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
                el-option(label="Hourly" value="hour")
                el-option(label="Daily" value="day")
                el-option(label="Weekly" value="week")
                el-option(label="Monthly" value="month")
                el-option(label="Quarterly" value="quarter")
                el-option(label="Anually" value="year")
</template>

<script>
/* eslint-disable */
import _ from 'lodash';
import { mapState, mapActions } from 'vuex';
import { ObjectToFormData, parseColData } from '@/utils/helper';

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
    currentBranch() {
      this.branchSuggestions = [ ...this.currentBranch ]
    },
  },
  mounted() {
    this.branchSuggestions = [ this.currentBranch ]
  },
  computed: {
    ...mapState('branch', ['currentBranch']),
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
        fromtime4: this.range[0],
        totime4: this.range[1],
      };
      this.$emit('update:filterParams', filterParams);
      this.$emit('change');
    },
    removeFilter(name) {
      this.notifyFilterChange();
    },
    setTimeRange(value) {
      this.range = [
        this.$moment().startOf(value).format('YYYY-MM-DD HH:mm:ss'),
        this.$moment().endOf(value).format('YYYY-MM-DD HH:mm:ss'),
      ]
    },
  },
};
</script>
