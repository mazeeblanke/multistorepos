<template lang="pug">
  div
    .EmployeeForm(v-loading="processing || processingTransaction")
      .level.toolbar
        .level-left
          .level-item
            .page-title.subtitle.is-5 {{ _employee? 'Edit employee' : 'New Employee' }}
          .level-item
            //- span.tag.is-warning.is-medium Sale ID: {{ salesid }}
            //- employees::addemployee2($_POST['address1'], $_POST['address2']);
        .level-right
          .level-item
            button.button.is-primary(
              :class="{'is-loading': processing}",
              :disabled="processing",
              @click="submit()"
            )
              b-icon(icon="save")
              span {{ _employee? 'Save employee edits' : 'Add Employee' }}
          .level-item
            //- button.button.is-primary(
            //-   @click="fullScreenActive = !fullScreenActive"
            //- ) Select employee
          .level-item
            a.button(@click="closeForm()")
              span.icon
                i.material-icons close
              span Close
      .columns.is-desktop.EmployeeFormMain
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Fullname
            .field-body
              .field
                el-input(
                  v-model="employee.fullname",
                  placeholder="Enter employee fullname",
                  @input="() => $v.employee.fullname.$touch()"
                  :class="{ 'is-error': $v.employee.fullname.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Username
            .field-body
              .field
                el-input(
                  v-model="employee.username",
                  placeholder="Enter employee's username",
                  :disabled="!!_employee"
                  @input="() => $v.employee.username.$touch()"
                  :class="{ 'is-error': $v.employee.username.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Password
            .field-body
              .field
                el-input(
                  v-model="employee.password",
                  placeholder="Enter password",
                  @input="() => $v.employee.password.$touch()"
                  :class="{ 'is-error': $v.employee.password.$error }",
                )
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Access Level
            .field-body
              .field
                el-select(
                  v-model="employee.access"
                  filterable
                  placeholder="Enter access level"
                  @input="() => $v.employee.access.$touch()"
                  :class="{ 'is-error': $v.employee.access.$error }",
                )
                  el-option(label="admin", value="admin")
                  el-option(label="clerk", value="clerk")
                  el-option(label="super admin", value="super-admin")
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Password Confirmation
            .field-body
              .field
                el-input(
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
                  v-model="employee.branch",
                  filterable,
                  placeholder="select branch",
                  remote,
                  :remote-method="_loadBranches",
                  :loading="loadingBranches",
                  no-data-text="No results!",
                  value-key="id",
                  @change="notifyFilterChange()"
                  :disabled="!$can('super-admin')",
                  @input="() => $v.employee.branch.$touch()"
                  :class="{ 'is-error': $v.employee.branch.$error }",
                )
                  el-option(
                    v-for="branch in branchSuggestions",
                    :value="branch",
                    :label="branch.name",
                  )
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapMutations } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required, sameAs } from 'vuelidate/lib/validators';
import { ObjectToFormData } from '@/utils/helper';
import EmptyState from '@/components/EmptyState';
import FullscreenDialog from '@/components/shared/FullscreenDialog';


export default {
  props: {
    _employee: {
      type: Object,
    },
    sellItems: {
      type: Function,
    },
    processingTransaction: {
      require: false,
    }
  },
  mixins: [validationMixin],
  data() {
    return {
      employee: {
        fullname: null,
        username: null,
        password: null,
        passwordConfirmation: null,
        access: null,
        userreg: 'userreg',
        branchid: null,
        branch: null,
      },
      // employeeId: null,
      suggestions: [],
      loading: false,
      branchSuggestions: [],
      loadingBranches: false,
      // availableMaterials: [],
      processing: false,
      fullScreenActive: false,
    };
  },
  validations: {
    employee: {
      fullname: { required },
      username: { required },
      password: { required },
      passwordConfirmation: { 
        required,
        sameAsPassword: sameAs('password')
      },
      access: { required },
      branch: { required },
    },
  },
  mounted() {

    // if (this._employee) {
    //   this.employee = {
    //     ...this._employee,
    //     branch: this._employee.branch_details,
    //     fullname: this._employee.name,
    //     passwordConfirmation: this._employee.password,
    //   };
    // }
    // console.log(this.employee);
    // this.branchSuggestions = [this.employee.branch];
    // console.log(this.branchSuggestions)
    // this.employee = {
    //   ...this.employee,
    //   branch: this.currentBranch,
    // }
  },
  watch: {
    _employee() {
      this.employee = {
        ...this._employee,
        branch: this._employee.branch_details,
        fullname: this._employee.name,
        passwordConfirmation: this._employee.password,
      };
      this.branchSuggestions = [this.employee.branch];
    },
  },
  computed: {
    ...mapState('users', ['currentUser']),
    ...mapState('branch', [
      'selectedBranch',
      'currentBranch',
    ]),
  },
  methods: {
    ...mapActions('employees', ['loadEmployees', 'getLoyaltyDiscount']),
    ...mapMutations('employees', ['ADD_EMPLOYEE']),
    ...mapActions('branch', [
      'loadBranches',
      'searchBranches',
    ]),
    _loadBranches(query) {
      if (query !== '') {
        this.loadingBranches = true;
        this.searchBranches({
          search: query,
          type: 'branch',
        })
        .then((res) => {
          this.branchSuggestions = res;
          this.loadingBranches = false;
        })
        .catch(() => {
          this.loadingBranches = false;
        });
      }
    },
    warnUser() {
      return this.$swal({
        title: 'Are you sure?',
        text: 'Continue without creating employee?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      });
    },
    handleClick() {
      this.warnUser().then((res) => {
        if (res.value) {
          this.sellItems();
        }
      })
    },
    getEmployeeSuggestions(query) {
      if (query !== '') {
        this.loading = true;
        let payload = {
          search: query,
          type: 'employee',
        };
        this.loadEmployees(payload)
          .then(suggestions => {
            this.loading = false;
            this.suggestions = _.flatMap(suggestions);
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        this.suggestions = [];
      }
    },
    closeDialog() {
      this.fullScreenActive = false;
    },
    updateEmployeeDetails() {
      this.employee = this.suggestions.find(
        s => s.id === this.employeeId,
      );
    },
    addNewItem() {},
    handleChange() {},
    ...mapActions('employees', ['createEmployee', 'updateEmployee', 'clearSelectedEmployee']),
    closeForm() {
      this.$emit('close-form');
    },
    resetEmployee() {
      this.employee = {
        ...this.employee,
        fullname: null,
        username: null,
        password: null,
        passwordConfirmation: null,
        access: null,
        userreg: 'userreg',
        // branchid: null,
      };
    },
    submit() {
      this.$v.employee.$touch()
      if (this.$v.employee.passwordConfirmation.$error) {
        this.$snackbar.open({
          type: 'is-danger',
          message: 'Passwords must match!!'
        });
      }
      if (!this.$v.$invalid) {
        this.processing = true;
        const doAction = this._employee
          ? this.updateEmployee
          : this.createEmployee;
        this.employee = {
          ...this.employee,
          ...{
            [this._employee ? 'updateuser' : 'userreg']: 'value',
            access2: this._employee ? this.employee.access : null,
            name: this._employee ? this.employee.fullname : null,
            user: this._employee ? this.employee.username : null,
            branchid: this.employee.branch.id || this.currentBranch.id,
          },
        };
        doAction(ObjectToFormData(this.employee)).then(res => {
          if (res.status === 'Success') {
            this.$snackbar.open(res.status + ' !' + res.message);
            // this.$emit('action-complete');
            if (!this._employee) {
              // this.$emit('action-complete', { ...res.employee_details[0] });
              if (this.currentBranch.id === this.employee.branch.id ) {
                this.ADD_EMPLOYEE(res.user_details[0]);
              }
              this.resetEmployee();
              this.$v.employee.$reset()
            } else {
              this.$emit('updated-employee', { 
                ...res.user_details[0],
                branch_details: this.employee.branch,
                branch: this.employee.branch,
              });
            }
          } else {
            this.$snackbar.open(res.status);
          }
          this.processing = false;
        }).catch((err) => {
          console.log(err.data);
          this.processing = false;
          this.$snackbar.open({
            type: 'is-danger',
            message: `Internal server error ${err}`,
          });
        });
      }
    },
  },
  components: {
    FullscreenDialog,
    EmptyState,
  },
};
</script>

<style lang="sass">
  .EmployeeFormHeader
    padding: 2rem
    padding-bottom: 0

  .EmployeeFormMain
    padding: 2rem

  .MaterialsForm
    border-top: 1px solid #EAEAEA

  .multiselect
    font-size: 1rem
    min-height: 2.25em

  .multiselect__tags
    display: flex
    align-items: center
    min-height: 2.25em
    padding-left: calc(0.375em - 1px)
    padding-right: calc(0.375em - 1px)
    padding-top: calc(0.375em - 1px)
    border-color: #dbdbdb

  .multiselect__input
    font-size: 1rem
    width: auto
    margin-bottom: calc(0.375em - 1px)

  .multiselect__tags
    border-bottom-left-radius: 3px !important
    border-bottom-right-radius: 3px !important

  .custom__tag
    display: inline-block
    padding: 0px 7px
    background: #EFEFEF
    margin-right: 5px
    border-radius: 3px
    cursor: pointer
    margin-bottom: calc(0.375em - 1px)

  .custom__remove
    padding: 0
    font-size: 10px
    margin-left: 8px

  .vendors-select
    width: 400px
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
