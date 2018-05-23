<template lang="pug">
  div 
    .SupplierForm(v-loading="processing || processingTransaction")
      .level.toolbar
        .level-left
          .level-item
            .page-title.subtitle.is-5 {{ _supplier? 'Edit supplier' : 'New Supplier' }}
        .level-right
          .level-item
            button.button.is-primary(
              :class="{'is-loading': processing}",
              :disabled="processing",
              @click="submit()"
            )
              b-icon(icon="save")
              span {{ _supplier? 'Save supplier edits' : 'Add Supplier' }}
          .level-item
            //- button.button.is-primary(
            //-   @click="fullScreenActive = !fullScreenActive"
            //- ) Select supplier 
          .level-item
            a.button(@click="closeForm()")
              span.icon
                i.material-icons close
              span Close             
      .columns.is-desktop.SupplierFormMain
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Supplier Name
            .field-body
              .field 
                el-input(
                  v-model="supplier.suppliername",
                  placeholder="Enter supplier name",
                  @input="() => $v.supplier.suppliername.$touch()"
                  :class="{ 'is-error': $v.supplier.suppliername.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Supplier Phone
            .field-body
              .field 
                el-input(
                  v-model="supplier.supplierphone",
                  placeholder="Enter supplier's phone",
                  type="number"
                  @input="() => $v.supplier.supplierphone.$touch()"
                  :class="{ 'is-error': $v.supplier.supplierphone.$error }",
                )
        .column.is-6 
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Supplier Email
            .field-body
              .field 
                el-input(
                  v-model="supplier.supplieremail",
                  placeholder="Enter supplier's email"
                  @input="() => $v.supplier.supplieremail.$touch()"
                  :class="{ 'is-error': $v.supplier.supplieremail.$error }",
                )             
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Supplier Address
            .field-body
              .field 
                el-input(
                  v-model="supplier.supplieraddress",
                  placeholder="Enter supplier's address"
                  @input="() => $v.supplier.supplieraddress.$touch()"
                  :class="{ 'is-error': $v.supplier.supplieraddress.$error }",
                )             
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapMutations } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import { ObjectToFormData } from '@/utils/helper'
import EmptyState from '@/components/EmptyState'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import _ from 'lodash'

export default {
  props: {
    _supplier: {
      type: Object
    },
    sellItems: {
      type: Function
    },
    processingTransaction: {
      require: false
    }
  },
  mixins: [validationMixin],
  data () {
    return {
      supplier: {
        suppliername: null,
        supplierphone: null,
        supplieremail: null,
        supplieraddress: null,
        id: null,
      },
      suggestions: [],
      loading: false,
      processing: false,
      fullScreenActive: false
    }
  },
  validations: {
    supplier: {
      suppliername: { required },
      supplierphone: { required },
      supplieremail: { required },
      supplieraddress: { required }
    }
  },
  mounted () {
    if (this._supplier) {
      this.supplier = {
        ...this._supplier,
        suppliername: this._supplier.name,
        supplierphone: this._supplier.phone,
        supplieremail: this._supplier.email,
        supplieraddress: this._supplier.address,
        id: this._supplier.id
      }
    }
  },
  watch: {
    _supplier () {
      this.supplier = {
        ...this._supplier,
        suppliername: this._supplier.name,
        supplierphone: this._supplier.phone,
        supplieremail: this._supplier.email,
        supplieraddress: this._supplier.address,
        id: this._supplier.id
      }
    }
  },
  computed: {
    ...mapState('users', ['currentUser'])
  },
  methods: {
    ...mapActions('suppliers', ['loadSuppliers', 'getLoyaltyDiscount']),
    ...mapMutations('suppliers', ['ADD_SUPPLIER']),
    warnUser () {
      return this.$swal({
        title: 'Are you sure?',
        text: 'Continue without creating supplier?',
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
    getSupplierSuggestions (query) {
      if (query !== '') {
        this.loading = true
        let payload = {
          search: query,
          type: 'supplier'
        }
        this.loadSuppliers(payload)
          .then(suggestions => {
            this.loading = false
            this.suggestions = _.flatMap(suggestions)
          })
          .catch(() => {
            this.loading = false
          })
      } else {
        this.suggestions = []
      }
    },
    closeDialog () {
      this.fullScreenActive = false
    },
    updateSupplierDetails () {
      this.supplier = this.suggestions.find(
        s => s.id === this.supplierId
      )
    },
    addNewItem () {},
    handleChange () {},
    ...mapActions('suppliers', [
      'createSupplier',
      'updateSupplier',
      'clearSelectedSupplier',
      'createOASSupplier',
      'updateOASSupplier',
    ]),
    closeForm () {
      this.$emit('close-form')
    },
    resetSupplier () {
      this.supplier = {
        suppliername: null,
        supplierphone: null,
        supplieremail: null,
        supplieraddress: null,
        id: null,
      }
    },
    submit () {
      this.$v.supplier.$touch()
      console.log(this.$v.supplier)
      if (!this.$v.$invalid) {
        this.processing = true
        const doAction = this._supplier
          ? this.updateSupplier
          : this.createSupplier
        this.supplier = {
          ...this.supplier,
          ...{
            [this._supplier ? 'updatesupplier' : 'addsupplier']: 'value',
            supplierid2: this._supplier ? this._supplier.id : null,
            suppliername2: this._supplier ? this.supplier.suppliername : null,
            supplierphone2: this._supplier ? this.supplier.supplierphone : null,
            supplieremail2: this._supplier ? this.supplier.supplieremail : null,
            supplieraddress2: this._supplier ? this.supplier.supplieraddress : null
          }
        }


        /***
         * with OAS integration
         * 
         * 
         */
        // doAction(ObjectToFormData(this.branch))
        // .then((res) => {
        //   const _doAction = this._branch
        //   ? this.updateOASBranch
        //   : this.createOASBranch;
        //   console.log(this._branch);
        //   _doAction({
        //     branch: this.branch.branchname,
        //     pos_branch_id: res.branch_details[0].id,
        //   })
        //   return res;
        // })
        // .then(res => {
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

        // const { 
        //   suppliername: name, 
        //   supplieraddress: address,
        //   supplieremail: email,
        //   supplierphone: phone,
        //   id,
        // } = this.supplier;
        // doAction(ObjectToFormData(this.supplier))
        // .then((res) => {
        //   const _doAction = this._supplier
        //   ? this.updateOASSupplier
        //   : this.createOASSupplier;
        //   console.log(this.supplier);
        //   _doAction({
        //     name,
        //     address,
        //     contactEmail: email,
        //     contactPhone: phone,
        //     pos_vendor_id: id || res.supplier_details[0].id,
        //   })
        //   return res;
        // })
        // .then(res => {
        //   if (res.status === 'Success') {
        //     this.$snackbar.open(res.status + ' !' + res.message)
        //     if (!this._supplier) {
        //       // this.$emit('action-complete', { ...res.supplier_details[0] });
        //       this.ADD_SUPPLIER(res.supplier_details[0])
        //       this.resetSupplier()
        //       this.$v.supplier.$reset()
        //     } else {
        //       this.$emit('action-complete', {
        //         name: this.supplier.suppliername,
        //         address: this.supplier.supplieraddress,
        //         email: this.supplier.supplieremail,
        //         phone: this.supplier.supplierphone,
        //         id: this.supplier.id
        //       })
        //     }
        //   } else {
        //     this.$snackbar.open(res.status)
        //   }
        //   this.processing = false
        // })



        /**
         * 
         * 
         *  Without OAS integration => working perfectly
         */
        doAction(ObjectToFormData(this.supplier)).then(res => {
          if (res.status === 'Success') {
            this.$snackbar.open(res.status + ' !' + res.message)
            if (!this._supplier) {
              // this.$emit('action-complete', { ...res.supplier_details[0] });
              this.ADD_SUPPLIER(res.supplier_details[0])
              this.resetSupplier()
              this.$v.supplier.$reset()
            } else {
              this.$emit('action-complete', {
                name: this.supplier.suppliername,
                address: this.supplier.supplieraddress,
                email: this.supplier.supplieremail,
                phone: this.supplier.supplierphone,
                id: this.supplier.id
              })
            }
          } else {
            this.$snackbar.open(res.status)
          }
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
  .SupplierFormHeader
    padding: 2rem
    padding-bottom: 0

  .SupplierFormMain
    padding: 2rem

  // .MaterialsForm
  //   border-top: 1px solid #EAEAEA

  // .multiselect
  //   font-size: 1rem
  //   min-height: 2.25em

  // .multiselect__tags
  //   display: flex
  //   align-items: center
  //   min-height: 2.25em
  //   padding-left: calc(0.375em - 1px)
  //   padding-right: calc(0.375em - 1px)
  //   padding-top: calc(0.375em - 1px)
  //   border-color: #dbdbdb

  // .multiselect__input
  //   font-size: 1rem
  //   width: auto
  //   margin-bottom: calc(0.375em - 1px)

  // .multiselect__tags
  //   border-bottom-left-radius: 3px !important
  //   border-bottom-right-radius: 3px !important

  // .custom__tag
  //   display: inline-block
  //   padding: 0px 7px
  //   background: #EFEFEF
  //   margin-right: 5px
  //   border-radius: 3px
  //   cursor: pointer
  //   margin-bottom: calc(0.375em - 1px)

  // .custom__remove
  //   padding: 0
  //   font-size: 10px
  //   margin-left: 8px

  // .vendors-select
  //   width: 400px
  .SupplierForm
    height: 80%;
    .is-v-centered
      align-items: flex-start
    .el-select, .el-input-number, .el-input__inner
      width: 100% !important 
  .completeTransactionBtn
    margin-right: 25px !important
    height: 50px !important  
</style>
