<template lang="pug">
  div
    FullscreenDialog(@closed="closeDialog", :active.sync="fullScreenActive")
      ImportExcel(
        :create-items="createEmployee", 
        :system-headers="systemHeaders",
        :close-form="_closeForm",
        :additional-payload="additionalImportPayload"
        model="user"
      )
    .EmployeeForm(v-loading="processing || processingTransaction")
      .level.toolbar
        .level-left
          .level-item
            .page-title.subtitle.is-5 {{ _employee? 'Edit employee' : 'New Employee' }}
        .level-right
          .level-item
            button.button.is-primary(
              :class="{'is-loading': processing}",
              :disabled="processing",
              @click="submit()"
            )
              b-icon(icon="save")
              span {{ _employee? 'Save employee edits' : 'Add Employee' }}
          .level-item(v-if="!_employee")      
            button.button.is-primary(
              @click="fullScreenActive = true"
            ) 
              span.el-icon-download.mr-5
              span Import Excel    
          .level-item
            a.button.no-border(@click="$emit('close-form')")
              span.icon
                i.material-icons close
      .columns.is-desktop.EmployeeFormMain
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Fullname
            .field-body
              .field
                el-input(
                  clearable,
                  size="small",
                  v-model="employee.full_name",
                  placeholder="Enter employee fullname",
                  @input="() => $v.employee.full_name.$touch()"
                  :class="{ 'is-error': $v.employee.full_name.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Username
            .field-body
              .field
                el-input(
                  clearable,
                  size="small",
                  v-model="employee.username",
                  placeholder="Enter employee's username",
                  @input="() => $v.employee.username.$touch()"
                  :class="{ 'is-error': $v.employee.username.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Password
            .field-body
              .field
                el-input(
                  clearable,
                  size="small",
                  v-model="employee.password",
                  placeholder="Enter password",
                  @input="() => $v.employee.password.$touch()"
                  :class="{ 'is-error': $v.employee.password.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Email
            .field-body
              .field
                el-input(
                  clearable,
                  size="small",
                  v-model="employee.email",
                  placeholder="Enter email",
                  @input="() => $v.employee.email.$touch()"
                  :class="{ 'is-error': $v.employee.email.$error }",
                )
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Access Level
            .field-body
              .field
                el-select(
                  size="small",
                  v-model="employee.access_level"
                  filterable
                  placeholder="Enter access level"
                  @input="() => $v.employee.access_level.$touch()"
                  :class="{ 'is-error': $v.employee.access_level.$error }",
                )
                  el-option(label="admin", value="admin")
                  el-option(label="clerk", value="clerk")
                  el-option(label="super admin", value="superadmin")
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Status
            .field-body
              .field
                el-select(
                  size="small",
                  v-model="employee.status"
                  filterable
                  placeholder="Enter access level"
                  @input="() => $v.employee.status.$touch()"
                  :class="{ 'is-error': $v.employee.status.$error }",
                )
                  el-option(label="Inactive", value="inactive")
                  el-option(label="Active", value="active")
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Password Confirmation
            .field-body
              .field
                el-input(
                  clearable,
                  size="small",
                  v-model="employee.passwordConfirmation",
                  placeholder="Enter password",
                  @input="() => $v.employee.passwordConfirmation.$touch()"
                  :class="{ 'is-error': $v.employee.passwordConfirmation.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Branch
            .field-body
              .field
                el-select.has-full-width(
                  size="small",
                  v-model="employee.branch",
                  filterable,
                  clearable,
                  placeholder="select branch",
                  remote,
                  :remote-method="_loadBranches",
                  :loading="loadingBranches",
                  no-data-text="No results!",
                  value-key="id",
                  @change="notifyFilterChange()"
                  :disabled="!$can('superadmin')",
                  @input="() => $v.employee.branch.$touch()"
                  :class="{ 'is-error': $v.employee.branch.$error }",
                )
                  el-option(
                    v-for="branch in branchSuggestions",
                    :value="branch",
                    :label="branch.name",
                    :key="branch.id",
                  )
</template>

<script>
/* eslint-disable */
import { mapState, mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, sameAs, email, minLength } from 'vuelidate/lib/validators'
import EmptyState from '@/components/EmptyState'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import ImportExcel from '@/components/shared/ImportExcel'

export default {

  props: {

    _employee: {
      type: Object
    },

    sellItems: {
      type: Function
    },

    processingTransaction: {
      required: false
    },

    closeForm: {
      required: false
    }

  },

  mixins: [validationMixin],

  data () {
    return {
      employee: {
        full_name: null,
        username: null,
        password: null,
        passwordConfirmation: null,
        access_level: null,
        branch_id: null,
        branch: null,
        status: null,
        email: null
      },
      suggestions: [],
      loading: false,
      branchSuggestions: [],
      loadingBranches: false,
      processing: false,
      systemHeaders: [
        'full_name',
        'email',
        'password',
        'access_level',
        'username',
        'status'
      ],
      fullScreenActive: false
    }
  },

  validations: function () {
    const employee = {
      full_name: { required },
      username: { required },
      access_level: { required },
      branch: { required },
      email: { required, email },
      status: { required }
    }

    if (this._employee) {
      return { employee: {
        ...employee,
        password: { minLength: minLength(8) },
        passwordConfirmation: { sameAsPassword: sameAs('password') }
      }}
    } else {
      return { employee: {
        ...employee,
        password: { required },
        passwordConfirmation: {
          required,
          sameAsPassword: sameAs('password')
        }
      }}
    }
  },

  mounted () {
    this.branchSuggestions = [this.settings.branch]
    this.employee = {
      ...this.employee,
      ...this._employee,
      branch: this.settings.branch
    }
  },

  watch: {

    _employee () {
      this.employee = { ...this._employee }
      this.branchSuggestions = [this.employee.branch]
    }

  },

  computed: {

    ...mapState('settings', ['settings']),

    additionalImportPayload () {
      return {
        store_id: this.settings.store.id,
        branch_id: this.settings.branch.id
      }
    }

  },

  methods: {

    ...mapActions('employees', ['loadEmployees']),

    ...mapActions('branch', ['loadBranches']),

    _closeForm () {
      this.closeForm()
      this.closeDialog()
    },

    _loadBranches (query) {
      if (query) {
        this.loadingBranches = true
        this.loadBranches({
          name: query,
          store_id: this.settings.store.id
        }).then(({ data }) => {
          console.log(data)
          this.branchSuggestions = data
          this.loadingBranches = false
        }).catch(() => {
          this.loadingBranches = false
        })
      }
    },

    warnUser () {
      return this.$swal({
        title: 'Are you sure?',
        text: 'Continue without creating employee?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      })
    },

    handleClick () {
      this.warnUser().then((res) => {
        if (res.value) {
          this.sellItems()
        }
      })
    },

    closeDialog () {
      this.fullScreenActive = false
    },

    ...mapActions('employees', ['createEmployee', 'updateEmployee']),

    resetEmployee () {
      this.employee = {
        full_name: null,
        username: null,
        password: null,
        passwordConfirmation: null,
        access_level: null,
        email: null
      }
    },

    validateForm () {
      this.$v.employee.$touch()
      if (this.$v.$invalid) {
        this.$snackbar.open({
          type: 'is-danger',
          message: 'Validation errors exist!!'
        })
      }
    },

    processEmployeeData () {
      const {
        full_name,
        username,
        password,
        passwordConfirmation,
        access_level,
        email,
        status,
        branch
      } = this.employee

      return {
        full_name,
        username,
        email,
        status,
        password,
        passwordConfirmation,
        branch_id: branch.id,
        access_level,
        id: this._employee && this._employee.id
      }
    },

    submit () {
      this.validateForm()

      if (!this.$v.$invalid) {
        this.processing = true

        const doAction = this._employee
          ? this.updateEmployee
          : this.createEmployee

        const PAYLOAD = this.processEmployeeData()

        doAction(PAYLOAD).then(res => {
          this.$snackbar.open(res.message)
          if (!this._employee) {
            this.resetEmployee()
            this.closeForm()
            this.$v.employee.$reset()
          }
          this.processing = false
        }).catch((err) => {
          console.log(err.data)
          this.processing = false
          this.$snackbar.open({
            type: 'is-danger',
            message: `Error occurred ${err}`
          })
        })
      }
    }
  },

  components: {

    FullscreenDialog,

    ImportExcel,

    EmptyState
  }

}
</script>

<style lang="sass">
  .EmployeeFormHeader
    padding: 2rem
    padding-bottom: 0

  .EmployeeFormMain
    padding: 2rem

  .EmployeeForm
    height: 80%;
    .is-v-centered
      align-items: flex-start
    .el-select, .el-input-number, .el-input__inner
      width: 100% !important
  .completeTransactionBtn
    margin-right: 25px !important
    height: 50px !important
</style>
