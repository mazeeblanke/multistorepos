<template lang="pug">
  .ContractsListFilter.filters-section
    .columns
      .column(v-for="field in fields", :class="field.class ? field.class : 'is-2' ")
        .field 
          strong 
            span.font-size-12 {{ field.displayKey }}
        .field
          .field-body.groupFilters
            .field
              el-select.has-full-width(
                v-model="filterParams[`${field.key}`]"
                :filterable="true"
                :remote="true"
                :clearable="true"
                :placeholder="field.placeholder"
                :remote-method="() => {}"
                popper-class="salesUserSelect"
                size="small"
                @change="notifyFilterChange()"
                v-if="field.component === 'el-select' && field.type === 'remote'"
              )
                el-option(
                  v-for="(item, index) in suggestions"
                  :key="index"
                  :label="item.username"
                  :value="item.username"
                )
              el-input(
                clearable,
                v-model="filterParams[`${field.key}`]"
                size="small"
                @input="notifyFilterChange()"
                :placeholder="field.placeholder"
                v-if="field.component === 'el-input'"
              )
              el-input-number.has-full-width(
                clearable,
                v-model="filterParams[`${field.key}`]"
                size="small"
                @change="notifyFilterChange()"
                :label="field.placeholder"
                v-if="field.component === 'el-input-number'"
                controls-position="right"
              )
              el-date-picker(
                size="small"
                v-model="range"
                type="datetimerange"
                :start-placeholder="field.startPlaceholder"
                :end-placeholder="field.endPlaceholder"
                :default-time="['12:00:00']"
                value-format="yyyy-MM-dd HH:mm:ss"
                @change="notifyFilterChange()"
                v-if="field.component === 'el-date-picker'"
                clearable,
                @clear="handleDateClear"
              )
              el-select(
                v-model="filterParams[`${field.key}`]", 
                clearable
                @change="notifyFilterChange()", 
                size="small", 
                :placeholder="field.placeholder"
                v-if="field.component === 'el-select' && field.options"
              )
                el-option(
                  v-for="option in field.options"
                  :label="option.label", 
                  :value="option.value"
                )
</template>

<script>
/* eslint-disable */
import { mapState, mapActions } from 'vuex';
import { parseColData } from '@/utils/helper';

export default {
  props: {
    filterParams: Object,
    fields: Array
  },
  data() {
    return {
      range: [],
      suggestions: [],
      // loading: false,
      // reportTimeRange: null,
      // branchSuggestions: [],
      // loadingBranches: false,
    };
  },
  watch: {
    // range() {
    //   this.notifyFilterChange();
    // },
    // currentBranch() {
    //   this.branchSuggestions = [ ...this.currentBranch ]
    // },
  },
  mounted() {
    // this.branchSuggestions = [ this.currentBranch ]
  },
  methods: {
    // ...mapActions('customers', [
    //   'loadCustomers',
    // ]),
    // ...mapActions('branch', [
    //   'loadBranches',
    // ]),
    // _loadBranches(query) {
    //   if (query !== '') {
    //     this.loadingBranches = true;
    //     this.loadBranches(ObjectToFormData({
    //       allbranches: 'allbranches',
    //     }))
    //     .then((res) => {
    //       this.branchSuggestions = res;
    //       this.loadingBranches = false;
    //     })
    //     .catch(() => {
    //       this.loadingBranches = false;
    //     });
    //   }
    // },
    // getSalesSuggestions(query) {
    //   if (query) {
    //     this.loading = true;
    //     let payload = {
    //       search: query,
    //       type: 'user',
    //     };
    //     this.loadCustomers(payload)
    //       .then(suggestions => {
    //         this.loading = false;
    //         this.suggestions = suggestions;
    //       })
    //       .catch(() => {
    //         this.loading = false;
    //       });
    //   } else {
    //     this.suggestions = [];
    //   }
    // },

    handleDateClear () {
      this.range = []
    },

    notifyFilterChange () {
      // if (this.range) {
      const filterParams = {
        ...this.filterParams,
        fromtime: this.range && this.range[0],
        totime: this.range && this.range[1]
      }
      // }
      this.$emit('update:filterParams', filterParams);
      this.$emit('change');
    },
    // removeFilter(name) {
    //   this.notifyFilterChange();
    // },
    // setTimeRange(value) {
    //   this.range = [
    //     this.$moment().startOf(value).format('YYYY-MM-DD HH:mm:ss'),
    //     this.$moment().endOf(value).format('YYYY-MM-DD HH:mm:ss'),
    //   ]
    // },
  }

};
</script>
