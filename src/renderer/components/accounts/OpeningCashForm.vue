<template lang="pug">
  div
    .OpeningcashForm(v-loading="processing")
      .level.toolbar
        .level-left
          .level-item
            .page-title.subtitle.is-5 
              | {{ _openingcash? 'Edit Openingcash' : 'New Openingcash' }}
        .level-right
          .level-item
            button.button.is-primary(
              :class="{'is-loading': processing}",
              :disabled="processing",
              @click="submit()"
            )
              b-icon(icon="save")
              span {{ _openingcash? 'Save openingcash edits' : 'Add Openingcash' }}
          .level-item
            a.button(@click="closeForm()")
              span.icon
                i.material-icons close
              span Close
      .columns.is-desktop.OpeningcashFormMain
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Name (FROM)
            .field-body
              .field
                el-select(
                  size="small",
                  v-model="openingcash.fromuser"
                  :filterable="true"
                  :remote="true"
                  :clearable="true"
                  placeholder="e.g John Doe"
                  :remote-method="getEmployeeSuggestions"
                  popper-class="salesUserSelect"
                  @change="() => $v.openingcash.fromuser.$touch()",
                  :class="{ 'is-error': $v.openingcash.fromuser.$error }"
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
                  v-model="openingcash.amount",
                  placeholder="Enter openingcash's amount",
                  @input="() => $v.openingcash.amount.$touch()",
                  :class="{ 'is-error': $v.openingcash.amount.$error }"
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Branch
            .field-body
              .field
                el-select.has-full-width(
                  size="small",
                  v-model="openingcash.branch",
                  :filterable="true",
                  placeholder="select branch",
                  remote,
                  :remote-method="_loadBranches",
                  :loading="loadingBranches",
                  no-data-text="No results!",
                  value-key="id"
                  @input="() => $v.openingcash.branch.$touch()",
                  :class="{ 'is-error': $v.openingcash.branch.$error }"
                )
                  el-option(
                    v-for="branch in branchSuggestions",
                    :value="branch",
                    :label="branch.name",
                    :key="branch.id"
                  )
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Name (TO)
            .field-body
              .field
                el-select(
                  size="small",
                  v-model="openingcash.touser"
                  :filterable="true"
                  :remote="true"
                  :clearable="true"
                  placeholder="e.g Jane Doe"
                  :remote-method="getEmployeeSuggestions"
                  popper-class="salesUserSelect"
                  @change="() => $v.openingcash.touser.$touch()",
                  :class="{ 'is-error': $v.openingcash.touser.$error }"
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
                  v-model="openingcash.details",
                  placeholder="Enter details",
                )
</template>

<script>

import { mapState, mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'

export default {

  props: {
    _openingcash: {
      type: Object
    }
  },

  mixins: [validationMixin],

  data () {
    return {
      openingcash: {
        fromuser: null,
        details: null,
        touser: null,
        amount: null,
        branch: {}
      },
      employeeSuggestions: [],
      loading: false,
      processing: false,
      fullScreenActive: false,
      loadingBranches: false,
      branchSuggestions: []
    }
  },

  validations: {
    openingcash: {
      fromuser: { required },
      touser: { required },
      amount: { required },
      branch: { required }
    }
  },

  mounted () {
    // if (this._openingcash) {
    //   this.openingcash = {
    //     ...this._openingcash,
    //     fullname: this._openingcash.name,
    //     passwordConfirmation: this._openingcash.password,
    //   };
    // }
    this.openingcash = {
      ...this.openingcash,
      branch: this.settings.branch
    }

    this.branchSuggestions = [this.settings.branch]
  },

  // watch: {

  //   _openingcash() {
  //     this.openingcash = {
  //       ...this._openingcash,
  //       fullname: this._openingcash.name,
  //       passwordConfirmation: this._openingcash.password,
  //     };
  //   }

  // },

  computed: {

    ...mapState('settings', ['settings'])

  },

  methods: {

    ...mapActions('openingcash', [
      'createOpeningcash',
      'updateOpeningcash'
    ]),

    ...mapActions('branch', [
      'loadBranches'
    ]),

    ...mapActions('employees', [
      'loadEmployees'
    ]),

    _loadBranches (query) {
      if (query) {
        this.loadingBranches = true
        this.loadBranches({
          name: query,
          store_id: this.settings.store.id
        }).then((res) => {
          this.branchSuggestions = res.data
          this.loadingBranches = false
        }).catch(() => {
          this.loadingBranches = false
        })
      }
    },

    getEmployeeSuggestions (query) {
      if (query) {
        this.loadingEmployees = true
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
          })
      } else {
        this.employeeSuggestions = []
      }
    },

    closeForm () {
      this.$emit('close-form')
    },

    resetOpeningcash () {
      this.openingcash = {
        fromuser: null,
        details: null,
        touser: null,
        amount: null,
        branch: this.settings.branch
      }
    },

    processPayload () {
      const {
        fromuser,
        details,
        touser,
        amount,
        branch
      } = this.openingcash

      return {
        from_user: fromuser,
        details,
        to_user: touser,
        amount,
        branch_id: branch.id,
        store_id: this.settings.store.id
      }
    },

    submit () {
      this.$v.openingcash.$touch()

      if (!this.$v.$invalid) {
        this.processing = true

        const doAction = this._openingcash
          ? this.updateOpeningcash
          : this.createOpeningcash

        doAction({
          openingcash: [this.processPayload()],
          branch_id: this.openingcash.branch.id
        })
          .then(res => {
            this.$snackbar.open(res.message)

            if (!this._openingcash) {
              this.resetOpeningcash()
              this.$v.openingcash.$reset()
              this.$emit('action-complete', res.data)
            } else {
              this.$emit('updated-openingcash', res.data)
            }

            this.processing = false
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
    }
  }

}
</script>

<style lang="sass">
  .OpeningcashFormHeader
    padding: 2rem
    padding-bottom: 0

  .OpeningcashFormMain
    padding: 2rem

  .OpeningcashForm
    height: 80%;
    .is-v-centered
      align-items: flex-start
    .el-select, .el-input-number, .el-input__inner
      width: 100% !important
</style>
