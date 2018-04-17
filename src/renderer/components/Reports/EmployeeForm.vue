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
              :disabled="processing || $v.$invalid",
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
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Password
            .field-body
              .field 
                el-input(
                  v-model="employee.password",
                  placeholder="Enter password",
                )
        .column.is-6 
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Access level
            .field-body
              .field 
                el-select(
                  v-model="employee.access"
                  filterable
                  placeholder="Enter access level"
                )
                  el-option(label="admin", value="admin")
                  el-option(label="clerk", value="clerk")
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Password confirmation
            .field-body
              .field 
                el-input(
                  v-model="employee.passwordConfirmation",
                  placeholder="Enter password",
                )                 
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapMutations } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import { ObjectToFormData } from '@/utils/helper';
import EmptyState from '@/components/EmptyState';
import FullscreenDialog from '@/components/shared/FullscreenDialog';

// const ucFirst = s => s.charAt(0).toUpperCase() + s.slice(1);

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
      },
      // employeeId: null,
      suggestions: [],
      loading: false,
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
      passwordConfirmation: { required },
      access: { required },
    },
  },
  mounted() {
    if (this._employee) {
      this.employee = { 
        ...this._employee,
        fullname: this._employee.name,
        passwordConfirmation: this._employee.password,
      };
      console.log(this.employee);
    }
  },
  watch: {
    _employee() {
      //  this.employee = this._employee;
      this.employee = { 
        ...this._employee,
        fullname: this._employee.name,
        passwordConfirmation: this._employee.password,
      };
    },
  },
  computed: {
    ...mapState('users', ['currentUser']),
  },
  methods: {
    ...mapActions('employees', ['loadEmployees', 'getLoyaltyDiscount']),
    ...mapMutations('employees', ['ADD_EMPLOYEE']),
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
        fullname: null,
        username: null,
        password: null,
        passwordConfirmation: null,
        access: null,
        userreg: 'userreg',
      };
    },
    submit() {
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
          },
        };
        doAction(ObjectToFormData(this.employee)).then(res => {
          if (res.status === 'Success') {
            this.$snackbar.open(res.status + ' !' + res.message);
            // this.$emit('action-complete');
            if (!this._employee) {
              // this.$emit('action-complete', { ...res.employee_details[0] });
              this.ADD_EMPLOYEE(res.user_details[0]);
              this.resetEmployee();
            } else {
              this.$emit('updated-employee', { ...res.user_details[0] });
            }
          } else {
            this.$snackbar.open(res.status);
          }
          this.processing = false;
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
