<template lang="pug">
  div
    .BranchForm(v-loading="processing")
      .level.toolbar
        .level-left
          .level-item
            .page-title.subtitle.is-5 {{ _branch? 'Edit branch' : 'New Branch' }}
          .level-item
        .level-right
          .level-item
            button.button.is-primary(
              :class="{'is-loading': processing}",
              :disabled="processing",
              @click="submit()"
            )
              b-icon(icon="save")
              span {{ _branch? 'Save branch edits' : 'Add Branch' }}
          .level-item
            a.button.no-border(@click="closeForm()")
              span.icon
                i.material-icons close
      .columns.is-desktop.BranchFormMain
        .column.is-4
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Branch Name
            .field-body
              .field
                el-input(
                  size="small",
                  v-model="branch.name",
                  placeholder="Enter branch name",
                  @input="() => $v.branch.name.$touch()"
                  :class="{ 'is-error': $v.branch.name.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Receipt Info
            .field-body
              .field
                el-input(
                  size="small",
                  v-model="branch.receiptinfo",
                  placeholder="Enter Receipt info"
                )
          .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label(title="The loyalty threshold for this branch") 
                  | {{ `Treshold (${this.currencySymbol})`}}
              .field-body
                .field
                  el-input(
                    size="small",
                    type="number",
                    v-model.number="branch.threshold",
                    placeholder="Enter loyalty threshold"
                  )      
        .column.is-4
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Branch Address
            .field-body
              .field
                el-input(
                  size="small",
                  v-model="branch.address",
                  placeholder="Enter branch address",
                  @input="() => $v.branch.address.$touch()"
                  :class="{ 'is-error': $v.branch.address.$error }",
                )
          .field.is-horizontal.mb-30
            .field-label.has-text-left.is-v-centered
              label.label Currency
            .field-body
              .field
                el-select.has-full-width(
                  clearable,
                  size="small",
                  v-model="branch.currency",
                  :filterable="true",
                  placeholder="select currency",
                  value-key="name",
                  @change="() => $v.branch.currency.$touch()",
                  :class="{ 'is-error': $v.branch.currency.$error }",
                )
                  el-option(
                    v-for="(currency, key, index) in currencies",
                    :label="format(currency)",
                    :value="currency",
                    :key="index",
                  )
          .field.is-horizontal.mb-30
            .field-label.has-text-left.is-v-centered
              label.label(title="The Loyalty discount for this branch") Discount (%)
            .field-body
              .field
                el-input(
                  type="number"
                  size="small",
                  v-model.number="branch.discount",
                  placeholder="Enter loyalty discount"
                )              
        .column.is-4        
          .field.is-horizontal
            .field-label.has-text-left.is-v-centered
              label.label Store
            .field-body
              .field 
                el-input(
                  clearable,
                  size="small",
                  :value="settings.store.name",
                  disabled
                ) 
          .field.is-horizontal
            .field-label.has-text-left.is-v-centered
              label.label Printout
            .field-body
              .field     
                el-select(
                  clearable,      
                  size="small", 
                  v-model.number="branch.printout",
                  placeholder="Enter receipt type",
                  :filterable="true",
                  @change="() => $v.branch.printout.$touch()",
                  :class="{ 'is-error': $v.branch.printout.$error }",
                )
                  el-option(label="Receipt", value="receipt")
                  el-option(label="Invoice", value="invoice")
          .field.is-horizontal
            .field-label.has-text-left.is-v-centered
              label.label Email
            .field-body
              .field
                el-input(
                  clearable,
                  size="small",
                  v-model="branch.email",
                  placeholder="Enter Branch email",
                  @change="() => $v.branch.email.$touch()",
                  :class="{ 'is-error': $v.branch.email.$error }",
                )                 
</template>

<script>

import { mapState, mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import MoneyMixin from '@/mixins/MoneyMixin'
import { required } from 'vuelidate/lib/validators'
import EmptyState from '@/components/EmptyState'
import currencies from '@/data/Common-Currency.json'
import FullscreenDialog from '@/components/shared/FullscreenDialog'

export default {

  props: {
    _branch: {
      type: Object
    },
    sellItems: {
      type: Function
    }
  },

  mixins: [validationMixin, MoneyMixin],

  data () {
    return {
      branch: {
        name: null,
        address: null,
        currency: null,
        printout: null,
        threshold: null,
        discount: null,
        email: null,
        receiptinfo: null
      },
      suggestions: [],
      loading: false,
      processing: false,
      fullScreenActive: false,
      currencies
    }
  },

  validations: {

    branch: {
      name: { required },
      address: { required },
      printout: { required },
      email: { required },
      currency: { required }
    }

  },

  mounted () {
    if (this._branch) {
      this.branch = {
        ...this._branch,
        branchname: this._branch.name,
        branchaddress: this._branch.address
      }
      console.log(this.branch)
    }
  },

  watch: {

    _branch () {
      this.branch = {
        ...this._branch,
        branchname: this._branch.name,
        branchaddress: this._branch.address
      }
    }

  },

  computed: {

    ...mapState('users', ['currentUser']),

    ...mapState('settings', ['settings']),

    ...mapState('branch', [
      'selectedBranch'
    ])

  },

  methods: {

    ...mapActions('branch', ['loadBranches']),

    ...mapActions('branch', [
      'createBranch',
      'updateBranch',
      'clearSelectedBranch'
    ]),

    format (currency) {
      return `${currency.name} - ${currency.symbol}`
    },

    closeDialog () {
      this.fullScreenActive = false
    },

    closeForm () {
      this.$emit('close-form')
    },

    resetBranch () {
      this.branch = {
        name: null,
        address: null,
        currency: null,
        printout: null,
        threshold: null,
        discount: null,
        email: null,
        receiptinfo: null
      }
    },

    submit () {
      this.$v.branch.$touch()
      if (!this.$v.$invalid) {
        this.processing = true
        const doAction = this._branch
          ? this.updateBranch
          : this.createBranch
        // this.branch = {
        //   ...this.branch,
        //   ...{
        //     [this._branch ? 'updatebranch' : 'addbranch']: 'value',
        //     // access2: this._branch ? this.branch.access : null,
        //     // name: this._branch ? this.branch.fullname : null,
        //     // user: this._branch ? this.branch.username : null,
        //     branchid: this._branch ? this._branch.id : null
        //   }
        // }

        doAction(this.branch).then(res => {
          this.$snackbar.open(res.message)
          if (!this._branch) {
            this.resetBranch()
            this.$v.branch.$reset()
          } else {
            this.$emit('updated-branch', { ...res.data })
          }
          this.processing = false
        }).catch((err) => {
          console.log(err)
          this.$snackbar.open({
            type: 'is-danger',
            message: err.message
          })
          this.processing = false
        })
      }
    }
  },

  components: {
    FullscreenDialog,
    EmptyState
  }

}
</script>

<style lang="sass">
  .BranchFormHeader
    padding: 2rem
    padding-bottom: 0

  .BranchFormMain
    padding: 2rem

  .BranchForm
    height: 80%;
    .is-v-centered
      align-items: flex-start
    .el-select, .el-input-number, .el-input__inner
      width: 100% !important
</style>
