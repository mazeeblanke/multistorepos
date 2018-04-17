<template lang="pug">
  div
    .BranchForm(v-loading="processing || processingTransaction")
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
            //- button.button.is-primary(
            //-   @click="fullScreenActive = !fullScreenActive"
            //- ) Select branch
          .level-item
            a.button(@click="closeForm()")
              span.icon
                i.material-icons close
              span Close
      .columns.is-desktop.BranchFormMain
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Branch name
            .field-body
              .field
                el-input(
                  v-model="branch.branchname",
                  placeholder="Enter branch name",
                  @input="() => $v.branch.branchname.$touch()"
                  :class="{ 'is-error': $v.branch.branchname.$error }",
                )
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Branch address
            .field-body
              .field
                el-input(
                  v-model="branch.branchaddress",
                  placeholder="Enter branch address",
                  @input="() => $v.branch.branchaddress.$touch()"
                  :class="{ 'is-error': $v.branch.branchaddress.$error }",
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
    _branch: {
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
      branch: {
        branchname: null,
        branchaddress: null,
        addbranch: 'addbranch',
        // branchid: null,
      },
      // branchId: null,
      suggestions: [],
      loading: false,
      // availableMaterials: [],
      processing: false,
      fullScreenActive: false,
    };
  },
  validations: {
    branch: {
      branchname: { required },
      branchaddress: { required },
    },
  },
  mounted() {
    if (this._branch) {
      this.branch = {
        ...this._branch,
        branchname: this._branch.name,
        branchaddress: this._branch.address,
        // passwordConfirmation: this._branch.password,
      };
      console.log(this.branch);
    }
  },
  watch: {
    _branch() {
      //  this.branch = this._branch;
      this.branch = {
        ...this._branch,
        branchname: this._branch.name,
        branchaddress: this._branch.address,
        // fullname: this._branch.name,
        // passwordConfirmation: this._branch.password,
      };
    },
  },
  computed: {
    ...mapState('users', ['currentUser']),
    ...mapState('branch', [
      'selectedBranch',
    ]),
  },
  methods: {
    ...mapActions('branch', ['loadBranches', 'getLoyaltyDiscount', 'createOASBranch', 'updateOASBranch']),
    ...mapMutations('branch', ['ADD_BRANCH']),
    warnUser() {
      return this.$swal({
        title: 'Are you sure?',
        text: 'Continue without creating branch?',
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
    getBranchSuggestions(query) {
      if (query !== '') {
        this.loading = true;
        let payload = {
          search: query,
          type: 'branch',
        };
        this.loadBranches(payload)
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
    updateBranchDetails() {
      this.branch = this.suggestions.find(
        s => s.id === this.branchId,
      );
    },
    addNewItem() {},
    handleChange() {},
    ...mapActions('branch', ['createBranch', 'updateBranch', 'clearSelectedBranch']),
    closeForm() {
      this.$emit('close-form');
    },
    resetBranch() {
      this.branch = {
        branchname: null,
        branchaddress: null,
        addbranch: 'addbranch',
      };
    },
    submit() {
      this.$v.branch.$touch()
      if (!this.$v.$invalid) {
        this.processing = true;
        const doAction = this._branch
          ? this.updateBranch
          : this.createBranch;
        this.branch = {
          ...this.branch,
          ...{
            [this._branch ? 'updatebranch' : 'addbranch']: 'value',
            // access2: this._branch ? this.branch.access : null,
            // name: this._branch ? this.branch.fullname : null,
            // user: this._branch ? this.branch.username : null,
            branchid: this._branch ? this._branch.id : null,
          },
        };


        /***
         * with OAS integration
         * 
         * 
         */
        doAction(ObjectToFormData(this.branch))
        .then((res) => {
          const _doAction = this._branch
          ? this.updateOASBranch
          : this.createOASBranch;
          console.log(this._branch);
          _doAction({
            branch: this.branch.branchname,
            pos_branch_id: res.branch_details[0].id,
          })
          return res;
        })
        .then(res => {
          if (res.status === 'Success') {
            this.$snackbar.open(res.status + ' !' + res.message);
            // this.$emit('action-complete');
            if (!this._branch) {
              // this.$emit('action-complete', { ...res.branch_details[0] });
              this.ADD_BRANCH(res.branch_details[0]);
              this.resetBranch();
              this.$v.branch.$reset()
            } else {
              this.$emit('updated-branch', { ...res.branch_details[0] });
            }
          } else {
            this.$snackbar.open(res.status);
          }
          this.processing = false;
        });



        /***
         * without OAS integration ==> working
         * 
         * 
         */
        // doAction(ObjectToFormData(this.branch)).then(res => {
        //   if (res.status === 'Success') {
        //     this.$snackbar.open(res.status + ' !' + res.message);
        //     // this.$emit('action-complete');
        //     if (!this._branch) {
        //       // this.$emit('action-complete', { ...res.branch_details[0] });
        //       this.ADD_BRANCH(res.branch_details[0]);
        //       this.resetBranch();
        //       this.$v.branch.$reset()
        //     } else {
        //       this.$emit('updated-branch', { ...res.branch_details[0] });
        //     }
        //   } else {
        //     this.$snackbar.open(res.status);
        //   }
        //   this.processing = false;
        // });
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
  .BranchFormHeader
    padding: 2rem
    padding-bottom: 0

  .BranchFormMain
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
  .BranchForm
    height: 80%;
    .is-v-centered
      align-items: flex-start
    .el-select, .el-input-number, .el-input__inner
      width: 100% !important
  .completeTransactionBtn
    margin-right: 25px !important
    height: 50px !important
</style>
