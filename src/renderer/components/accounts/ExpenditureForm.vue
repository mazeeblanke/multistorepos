<template lang="pug">
  div
    .ExpenditureForm(v-loading="processing")
      .level.toolbar
        .level-left
          .level-item
            .page-title.subtitle.is-5 
              | {{ _expenditure? 'Edit Expenditure' : 'New Expenditure' }}
        .level-right
          .level-item
            button.button.is-primary(
              :class="{'is-loading': processing}",
              :disabled="processing",
              @click="submit()"
            )
              b-icon(icon="save")
              span {{ _expenditure? 'Save expenditure edits' : 'Add Expenditure' }}
          .level-item
            a.button(@click="closeForm()")
              span.icon
                i.material-icons close
              span Close
      .columns.is-desktop.ExpenditureFormMain
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Name
            .field-body
              .field
                el-select(
                  size="small",
                  v-model="expenditure.user_id"
                  :filterable="true"
                  :remote="true"
                  :clearable="true"
                  placeholder="Select User"
                  :remote-method="getEmployeeSuggestions"
                  @change="() => $v.expenditure.user_id.$touch()",
                  :class="{ 'is-error': $v.expenditure.user_id.$error }"
                )
                  el-option(
                    v-for="(employee, index) in employeeSuggestions"
                    :key="index"
                    :label="employee.username"
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
                  v-model="expenditure.amount",
                  placeholder="Enter expenditure's amount",
                  @input="() => $v.expenditure.amount.$touch()",
                  :class="{ 'is-error': $v.expenditure.amount.$error }"
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Title
            .field-body
              .field
                el-input(
                  size="small",
                  v-model="expenditure.title",
                  placeholder="Enter expenditure's title",
                  @input="() => $v.expenditure.title.$touch()",
                  :class="{ 'is-error': $v.expenditure.title.$error }"
                )
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Type
            .field-body
              .field
                el-select(
                  size="small",
                  v-model="expenditure.type"
                  filterable
                  placeholder="Enter expenditure type"
                  allow-create
                  @change="() => $v.expenditure.type.$touch()",
                  :class="{ 'is-error': $v.expenditure.type.$error }"
                )
                  el-option(label="Salary", value="salary")
                  el-option(label="Office supplies", value="office supplies")
                  el-option(label="Procurement", value="procurement")
                  el-option(label="Other", value="other")
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Details
            .field-body
              .field
                el-input(
                  size="small",
                  v-model="expenditure.details",
                  placeholder="Enter details",
                  
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Branch
            .field-body
              .field
                el-select(
                  size="small",
                  v-model="expenditure.branch",
                  :filterable="true",
                  placeholder="select branch",
                  remote,
                  :remote-method="_loadBranches",
                  :loading="loadingBranches",
                  no-data-text="No results!",
                  value-key="id",
                  @change="() => $v.expenditure.branch.$touch()",
                  :class="{ 'is-error': $v.expenditure.branch.$error }"
                )
                  el-option(
                    v-for="(branch, index) in branchSuggestions",
                    :value="branch",
                    :label="branch.name",
                    :key="branch.id",
                  )
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapMutations } from "vuex";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
// import { ObjectToFormData } from "@/utils/helper";
import EmptyState from "@/components/EmptyState";
import FullscreenDialog from "@/components/shared/FullscreenDialog";

export default {
  props: {
    _expenditure: {
      type: Object,
    }
  },
  mixins: [validationMixin],
  data() {
    return {
      expenditure: {
        details: null,
        title: null,
        amount: null,
        type: null,
        user_id: null,
        branch: null
      },
      employeeSuggestions: [],
      loading: false,
      processing: false,
      fullScreenActive: false,
      loadingBranches: false,
      loadingEmployees: false,
      branchSuggestions: [],
    };
  },

  validations: {
    expenditure: {
      title: { required },
      amount: { required },
      type: { required },
      user_id: { required },
      branch: { required }
    },
  },

  mounted() {
    // if (this._expenditure) {
    //   this.expenditure = {
    //     ...this._expenditure,
    //     fullname: this._expenditure.name,
    //     passwordConfirmation: this._expenditure.password,
    //   };
    //   // console.log(this.expenditure);
    // }
    this.expenditure = {
      ...this.expenditure,
      branch: this.settings.branch,
    }
    this.branchSuggestions = [this.settings.branch];
  },

  watch: {
    // _expenditure() {
    //   //  this.expenditure = this._expenditure;
    //   this.expenditure = {
    //     ...this._expenditure,
    //     fullname: this._expenditure.name,
    //     passwordConfirmation: this._expenditure.password,
    //   };
    // }
  },

  computed: {

    ...mapState("settings", ["settings"]),

    ...mapState("branch", ["currentBranch", "branches"]),

  },
  
  methods: {

    ...mapActions("employees", [
      "loadEmployees"
    ]),

    ...mapActions('branch', [
      'loadBranches',
    ]),

    ...mapActions("expenditures", [
      "createExpenditure",
      "updateExpenditure",
      "clearSelectedExpenditure",
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
    
    getEmployeeSuggestions (query) {
      if (query) {
        this.loadingEmployees = true;
        this.loadEmployees({
          username: query,
          store_id: this.settings.store.id
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

    closeForm() {
      this.$emit("close-form");
    },

    resetExpenditure() {
      this.expenditure = {
        user_id: null,
        details: null,
        title: null,
        amount: null,
        type: null,
        branch: this.settings.branch
      }
    },

    processPayload () {

      const { 
        user_id,
        details,
        title,
        amount,
        type,
        branch
      } = this.expenditure

      return {
        user_id,
        details,
        title,
        amount,
        type,
        branch_id: branch.id,
        store_id: this.settings.store.id
      }

    },

    submit() {
      this.$v.expenditure.$touch()

      if (!this.$v.$invalid) {

        this.processing = true;

        const doAction = this._expenditure
          ? this.updateExpenditure
          : this.createExpenditure

        doAction({
          expenditure: [this.processPayload()],
          branch_id: this.expenditure.branch.id
        })
        .then(res => {
          this.$snackbar.open(res.message);
          this.processing = false;
          this.resetExpenditure()
          this.$v.expenditure.$reset()
          this.$emit('action-complete', res.data)
        })
        .catch((err) => {
          this.processing = false;
          this.$snackbar.open({
            type: 'is-danger',
            message: err
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
  },
  components: {
    FullscreenDialog,
    EmptyState,
  },
};
</script>

<style lang="sass">
  .ExpenditureFormHeader
    padding: 2rem
    padding-bottom: 0

  .ExpenditureFormMain
    padding: 2rem

  .ExpenditureForm
    height: 80%;
    .is-v-centered
      align-items: flex-start
    .el-select, .el-input-number, .el-input__inner
      width: 100% !important
  .completeTransactionBtn
    margin-right: 25px !important
    height: 50px !important
</style>
