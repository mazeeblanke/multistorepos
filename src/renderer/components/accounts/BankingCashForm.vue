<template lang="pug">
  div
    .BankingcashForm(v-loading="processing")
      .level.toolbar
        .level-left
          .level-item
            .page-title.subtitle.is-5 
              | {{ _bankingcash? 'Edit Entry' : 'New Entry' }}
        .level-right
          .level-item
            button.button.is-primary(
              :class="{'is-loading': processing}",
              :disabled="processing",
              @click="submit()"
            )
              b-icon(icon="save")
              span {{ _bankingcash? 'Save Entry edits' : 'Add Entry' }}
          .level-item
            a.button(@click="closeForm()")
              span.icon
                i.material-icons close
              span Close
      .columns.is-desktop.BankingcashFormMain
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Name (from)
            .field-body
              .field
                el-select(
                  size="small",
                  v-model="bankingcash.fromuser"
                  :filterable="true"
                  :remote="true"
                  :clearable="true"
                  placeholder="e.g john doe"
                  :remote-method="getEmployeeSuggestions"
                  @change="() => $v.bankingcash.fromuser.$touch()",
                  :class="{ 'is-error': $v.bankingcash.fromuser.$error }"
                )
                  el-option(
                    v-for="(employee, index) in employeeSuggestions"
                    :key="employee.id"
                    :label="employee.full_name"
                    :value="employee.id"
                  )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Amount
            .field-body
              .field
                el-input-number(
                  controls-position="right",
                  size="small",
                  v-model="bankingcash.amount",
                  placeholder="Enter bankingcash's amount",
                  @input="() => $v.bankingcash.amount.$touch()",
                  :class="{ 'is-error': $v.bankingcash.amount.$error }"
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Bank
            .field-body
              .field
                el-input(
                  size="small",
                  v-model="bankingcash.bank",
                  placeholder="e.g fidelity bank",
                  @input="() => $v.bankingcash.bank.$touch()",
                  :class="{ 'is-error': $v.bankingcash.bank.$error }"
                )
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Name (to)
            .field-body
              .field
                el-select(
                  size="small",
                  v-model="bankingcash.touser"
                  :filterable="true"
                  :remote="true"
                  :clearable="true"
                  placeholder="e.g jane doe"
                  :remote-method="getEmployeeSuggestions"
                  @change="() => $v.bankingcash.touser.$touch()",
                  :class="{ 'is-error': $v.bankingcash.touser.$error }"
                )
                  el-option(
                    v-for="(employee, index) in employeeSuggestions"
                    :key="employee.id"
                    :label="employee.full_name"
                    :value="employee.id"
                  )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Details
            .field-body
              .field
                el-input(
                  size="small",
                  v-model="bankingcash.details",
                  placeholder="Enter details",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Branch
            .field-body
              .field
                el-select(
                  size="small",
                  v-model="bankingcash.branch",
                  :filterable="true",
                  placeholder="select branch",
                  remote,
                  :remote-method="_loadBranches",
                  :loading="loadingBranches",
                  no-data-text="No results!",
                  value-key="id",
                  @change="() => $v.bankingcash.branch.$touch()",
                  :class="{ 'is-error': $v.bankingcash.branch.$error }"
                )
                  el-option(
                    v-for="branch in branchSuggestions",
                    :value="branch",
                    :label="branch.name",
                    :key="branch.id"
                  )
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapMutations } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

export default {

  props: {
    _bankingcash: {
      type: Object,
    }
  },

  mixins: [validationMixin],

  data() {
    return {
      bankingcash: {
        fromuser: null,
        touser: null,
        details: null,
        amount: null,
        bank: null,
        branch: null,
      },
      employeeSuggestions: [],
      loading: false,
      processing: false,
      fullScreenActive: false,
      loadingBranches: false,
      branchSuggestions: [],
    };
  },

  validations: {
    bankingcash: {
      fromuser: { required },
      touser: { required },
      bank: { required },
      amount: { required },
      bank: { required },
      branch: { required }
    },
  },

  mounted() {

    // if (this._bankingcash) {
    //   this.bankingcash = {
    //     ...this._bankingcash,
    //     fullname: this._bankingcash.name,
    //     passwordConfirmation: this._bankingcash.password,
    //   };
    // }
    this.bankingcash = {
      ...this.bankingcash,
      branch: this.settings.branch
    }

    this.branchSuggestions = [this.settings.branch];
  },

  // watch: {
  //   _bankingcash() {
  //     this.bankingcash = {
  //       ...this._bankingcash,
  //     };
  //   },
  // },

  computed: {

    ...mapState('settings', ['settings'])

  },

  methods: {

    ...mapActions('branch', [
      'loadBranches',
    ]),

    ...mapActions("employees", [
      "loadEmployees"
    ]),

    _loadBranches(query) {
      if (query) {
        this.loadingBranches = true;
        this.loadBranches({
          name: query,
          store_id: this.settings.store.id
        }).then((res) => {
          this.branchSuggestions = res.data;
          this.loadingBranches = false;
        }).catch(() => {
          this.loadingBranches = false;
        });
      }
    },

    ...mapActions('bankingcash', [
      'createBankingcash',
      'updateBankingcash',
      'clearSelectedBankingcash'
    ]),

    closeForm() {
      this.$emit('close-form');
    },

    getEmployeeSuggestions (query) {
      if (query) {
        this.loadingEmployees = true;
        this.loadEmployees({
          username: query,
          store_id: this.settings.store.id,
          branch_id: this.settings.branch.id
        })
          .then(({ data }) => {
            this.loadingEmployees = false
            this.employeeSuggestions = data
          })
          .catch(() => {
            this.loadingEmployees = false
          });
      } else {
        this.employeeSuggestions = []
      }
    },

    resetBankingcash() {
      this.bankingcash = {
        fromuser: null,
        touser: null,
        details: null,
        amount: null,
        bank: null,
        branch: null
      };
    },

    processPayload () {
      const {
        fromuser,
        details,
        touser,
        amount,
        branch,
        bank
      } = this.bankingcash

      return {
        from_user: fromuser,
        details,
        to_user: touser,
        amount,
        bank,
        branch_id: branch.id,
        store_id: this.settings.store.id
      }
    },

    submit() {
      this.$v.bankingcash.$touch()
      if (!this.$v.$invalid) {

        this.processing = true

        const doAction = this._bankingcash
          ? this.updateBankingcash
          : this.createBankingcash;

        doAction({
          bankingcash: [this.processPayload()],
          branch_id: this.bankingcash.branch.id
        })
        .then(res => {
          this.$snackbar.open(res.message);
          if (!this._bankingcash) {
            this.$emit('action-complete', res.data);
            this.$v.bankingcash.$reset()
            this.resetBankingcash()
          } else {
            this.$emit('updated-bankingcash', res.data)
          }

          this.processing = false;
        })
        .catch((err) => {
          this.processing = false
          this.$snackbar.open({
            type: 'is-danger',
            message: err.message
          })
        })

      } else {
        this.processing = false

        this.$snackbar.open({
          type: 'is-danger',
          message: 'validation errors exist !'
        })
      }
    },
  }

}
</script>

<style lang="sass">
  .BankingcashFormHeader
    padding: 2rem
    padding-bottom: 0

  .BankingcashFormMain
    padding: 2rem

  .BankingcashForm
    height: 80%;
    .is-v-centered
      align-items: flex-start
    .el-select, .el-input-number, .el-input__inner
      width: 100% !important

</style>
