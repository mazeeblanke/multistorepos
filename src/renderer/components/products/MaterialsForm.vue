<template lang="pug">
  .branchsForm
      .level.toolbar
        .level-left
          .level-item
            button.button(@click="addBranch")
              span.icon
                i.branch.material-icons add
              span Add Branch
          .level-item
            button.button
              span.icon
                i.branch.material-icons search
              span Browse Branch Database
      b-table(
        :data="product.branches",
        :striped="true",
        :paginated="false",
      )
        template(scope="props")
          b-table-column(label="Branch Name", width="300", sortable=true)
            el-select.has-full-width(
              ref="el-select_branch",
              v-model="product.branches[props.index]",
              size="small",
              @input="() => validation && validation.$each[props.index].name.$touch()"
              :class="{ 'is-error': validation && validation.$each[props.index].name.$error }",
              remote,
              filterable,
              :remote-method="_loadBranches",
              placeholder="Select Branch",
              clearable,
              value-key="name",
              no-data-text="No more results!",
              :loading="fetchingItems",
              @focus="itemsSuggestions = []"
            )
              el-option(
                v-for="(branch, index) in branchSuggestions",
                :value="branch",
                :label="branch.name",
                :key="index",
                :disabled="selectedbranchId.includes(branch.id)",
              )
          b-table-column(field="email", label="Email")
            .field
              .control
                el-input(
                  :value="props.row.email",
                  :disabled="true"
                  size="small"
                  placeholder="-"
                )
          b-table-column(field="address", label="Address")
            .field
              .control
                el-input(
                  :value="props.row.address",
                  :disabled="true"
                  size="small"
                  placeholder="-"
                )
          b-table-column(width="150", field="quantity", label="Quantity")
            .field
              .control
                el-input(
                  type="number",
                  min=0,
                  v-model.number="props.row.quantity",
                  size="small"
                )
          b-table-column(width="40", label="Actions")
            button.button(@click="deletebranchRow(props.index)", :class="$style.trash")
              span.icon
                i.branch.material-icons delete
</template>



<script>
/* eslint-disable */
import { mapState, mapActions } from 'vuex'
import EmptyState from '@/components/EmptyState'
import _ from 'lodash'

export default {
  props: {
    product: {
      required: true,
    },
    validation: {
      required: false,
    },
    resetbranches: {
      required: false,
      type: Function,
    },
    addBranch: {
      required: false,
      type: Function,
    },
    resetVendor: {
      required: false,
      type: Function,
    },
  },

  components: {
    EmptyState,
  },

  data() {
    return {
      availablebranchs: [],
      branchSuggestions: [],
      fetchingItems: false,
    };
  },

  computed: {
    selectedbranchId() {
      if (this.product && this.product.branches) {
        return this.product.branches
        .filter(m => m.id)
        .map(m => m.id);
      }
      return []
    },
  },

  methods: {

    ...mapActions ('branch', [
      'loadBranches',
    ]),

    _loadBranches (query) {
      if (query) {
        this.fetchingItems = true;
        this.loadBranches({
          name: query,
        }).then((res) => {
          console.log(res)
          this.branchSuggestions = _.uniqBy([
            ...res.branches.data,
            ...this.branchSuggestions
          ], s => s.id)
          this.fetchingItems = false
        }).catch(() => {
          this.fetchingItems = false
        });
      }
    },

    resetbranch (index = null) {
      this.resetbranchs(index)
    },

    deletebranchRow (index) {
      this.$swal({
        title: 'Are you sure?',
        text: 'Do you want to delete this branch from the product ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      }).then(() => {
        const branch = this.product.branches[index];
        if (this.product.branches.length > 1) {
          if (this.product.id && branch.code) {
            this.deleteproductbranch({
              reqId: this.product.id,
              branchId: branch.item_id,
            }).then(() => {
              this.product.branches.splice(index, 1);
            });
          } else {
            this.product.branches.splice(index, 1);
          }
        } else {
          this.$snackbar.open({
            message: 'You must have at least one item in this product.',
            type: 'is-danger',
          })
        }
      })
    }

  }
};
</script>


<style lang="sass" scoped>
  select
   width: 300px
</style>

<style lang="sass" module>
.columns
  margin: 0px 50px
.trash
  border: none
  background: transparent
</style>
