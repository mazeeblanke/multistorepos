<template lang="pug">
  div
    .ExpenditureForm(v-loading="processing || processingTransaction")
      .level.toolbar
        .level-left
          .level-item
            .page-title.subtitle.is-5 {{ _expenditure? 'Edit Expenditure' : 'New Expenditure' }}
          .level-item
            //- span.tag.is-warning.is-medium Sale ID: {{ salesid }}
            //- expenditures::addexpenditure2($_POST['address1'], $_POST['address2']);
        .level-right
          .level-item
            button.button.is-primary(
              :class="{'is-loading': processing}",
              :disabled="processing || $v.$invalid",
              @click="submit()"
            )
              b-icon(icon="save")
              span {{ _expenditure? 'Save expenditure edits' : 'Add Expenditure' }}
          .level-item
            //- button.button.is-primary(
            //-   @click="fullScreenActive = !fullScreenActive"
            //- ) Select expenditure
          .level-item
            a.button(@click="closeForm()")
              span.icon
                i.material-icons close
              span Close
      .columns.is-desktop.ExpenditureFormMain
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Employee name
            .field-body
              .field
                el-select(
                  size="small",
                  v-model="expenditure.usersalary"
                  :filterable="true"
                  :remote="true"
                  :clearable="true"
                  @change="filteredItems.data = []"
                  placeholder="Search sales by user..."
                  :remote-method="getSalesSuggestions"
                  popper-class="salesUserSelect"
                )
                  el-option(
                    v-for="(item, index) in suggestions"
                    :key="index"
                    :label="item.username"
                    :value="item.username"
                  )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Amount
            .field-body
              .field
                el-input-number(
                  size="small",
                  v-model="expenditure.amount",
                  placeholder="Enter expenditure's amount",
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
                  :allow-create="true"
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
                  @change="selectBranch"
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
import { mapState, mapActions, mapMutations } from "vuex";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import { ObjectToFormData } from "@/utils/helper";
import EmptyState from "@/components/EmptyState";
import FullscreenDialog from "@/components/shared/FullscreenDialog";

// const ucFirst = s => s.charAt(0).toUpperCase() + s.slice(1);

export default {
  props: {
    _expenditure: {
      type: Object,
    },
    sellItems: {
      type: Function,
    },
    processingTransaction: {
      require: false,
    },
  },
  mixins: [validationMixin],
  data() {
    return {
      expenditure: {
        usersalary: null,
        details: null,
        title: null,
        amount: null,
        type: null,
        addexpenditure: "addexpenditure",
        branchid: null,
        branch: null,
      },
      // expenditureId: null,
      suggestions: [],
      loading: false,
      // availableMaterials: [],
      processing: false,
      fullScreenActive: false,
      loadingBranches: false,
      branchSuggestions: [],
    };
  },
  validations: {
    expenditure: {
      usersalary: { required },
      title: { required },
      amount: { required },
      type: { required },
      // access: { required },
    },
  },
  mounted() {
    if (this._expenditure) {
      this.expenditure = {
        ...this._expenditure,
        fullname: this._expenditure.name,
        passwordConfirmation: this._expenditure.password,
      };
      // console.log(this.expenditure);
    }
    this.expenditure = {
      ...this.expenditure,
      branchid: this.currentBranch.id,
      branch: this.currentBranch,
    }
    this.branchSuggestions = [this.currentBranch];
  },
  watch: {
    _expenditure() {
      //  this.expenditure = this._expenditure;
      this.expenditure = {
        ...this._expenditure,
        fullname: this._expenditure.name,
        passwordConfirmation: this._expenditure.password,
      };
    },
    // searchQuery(newValue) {
    //   // console.log('ajjaskjdhasjdsk');
    //   this.searchSales();
    // },
  },
  computed: {
    ...mapState("users", ["currentUser"]),
    ...mapState("branch", ["currentBranch", "branches"]),
  },
  methods: {
    ...mapActions("expenditures", ["loadExpenditures", "getLoyaltyDiscount"]),
    ...mapMutations("expenditures", ["ADD_EXPENDITURE"]),
    ...mapActions("customers", ["loadCustomers"]),
    ...mapActions('branch', [
      'loadBranches',
    ]),
    selectBranch(branch) {
      this.expenditure.branchid = branch.id;
    },
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
          type: "user",
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
    warnUser() {
      return this.$swal({
        title: "Are you sure?",
        text: "Continue without creating expenditure?",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      });
    },
    handleClick() {
      this.warnUser().then((res) => {
        if (res.value) {
          this.sellItems();
        }
      });
    },
    getEmployeeSuggestions(query) {
      if (query !== "") {
        this.loading = true;
        let payload = {
          search: query,
          type: "expenditure",
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
      this.expenditure = this.suggestions.find(
        s => s.id === this.expenditureId,
      );
    },
    addNewItem() {},
    handleChange() {},
    ...mapActions("expenditures", [
      "createExpenditure",
      "updateExpenditure",
      "clearSelectedExpenditure",
    ]),
    closeForm() {
      this.$emit("close-form");
    },
    resetExpenditure() {
      this.expenditure = {
        ...this.expenditure,
        usersalary: null,
        details: null,
        title: null,
        amount: null,
        type: null,
        addexpenditure: "addexpenditure",
        // branchid: null,
        // branch: null,
      };
    },
    submit() {
      if (!this.$v.$invalid) {
        this.processing = true;
        const doAction = this._expenditure
          ? this.updateExpenditure
          : this.createExpenditure;
        // this.expenditure = {
        //   ...this.expenditure,
        //   // ...{
        //   //   [this._expenditure ? 'updateuser' : 'userreg']: 'value',
        //   //   access2: this._expenditure ? this.expenditure.access : null,
        //   //   name: this._expenditure ? this.expenditure.fullname : null,
        //   //   user: this._expenditure ? this.expenditure.username : null,
        //   // },
        // };
        doAction(
          ObjectToFormData({
            ...this.expenditure,
          }),
        ).then(res => {
          if (res.status === "Success") {
            this.$snackbar.open(res.status + " !" + res.message);
            // this.$emit('action-complete');
            if (!this._expenditure) {
              // this.$emit('action-complete', { ...res.expenditure_details[0] });
              if (this.currentBranch.id === this.expenditure.branchid ) {
                this.ADD_EXPENDITURE(res.expenditure_details[0]);
              }
              this.resetExpenditure();
            } else {
              this.$emit("updated-expenditure", {
                ...res.expenditure_details[0],
              });
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
  .ExpenditureFormHeader
    padding: 2rem
    padding-bottom: 0

  .ExpenditureFormMain
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
