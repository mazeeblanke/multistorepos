<template lang="pug">
  div 
    .SupplierForm(v-loading="processing")
      .level.toolbar
        .level-left
          .level-item
            .page-title.subtitle.is-5 
              | {{ _supplier? 'Edit supplier' : 'New Supplier' }}
        .level-right
          .level-item
            button.button.is-primary(
              :class="{'is-loading': processing}",
              :disabled="processing",
              @click="submit()"
            )
              span {{ _supplier? 'Save supplier edits' : 'Add Supplier' }}
          .level-item
            a.button(@click="closeForm()")
              span.icon
                i.material-icons close
              span Close             
      .columns.is-desktop.SupplierFormMain
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Name
            .field-body
              .field 
                el-input(
                  v-model="supplier.name",
                  size="small"
                  placeholder="Enter supplier name",
                  @input="() => $v.supplier.name.$touch()"
                  :class="{ 'is-error': $v.supplier.name.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Phone
            .field-body
              .field 
                el-input(
                  v-model="supplier.phone",
                  placeholder="Enter supplier's phone",
                  size="small"
                  @input="() => $v.supplier.phone.$touch()"
                  :class="{ 'is-error': $v.supplier.phone.$error }",
                )
        .column.is-6 
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Email
            .field-body
              .field 
                el-input(
                  v-model="supplier.email",
                  placeholder="Enter supplier's email"
                  size="small"
                  @input="() => $v.supplier.email.$touch()"
                  :class="{ 'is-error': $v.supplier.email.$error }",
                )             
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Address
            .field-body
              .field 
                el-input(
                  v-model="supplier.address",
                  placeholder="Enter supplier's address"
                  size="small"
                  @input="() => $v.supplier.address.$touch()"
                  :class="{ 'is-error': $v.supplier.address.$error }",
                )             
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapMutations } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import _ from 'lodash'

export default {

  props: {
    _supplier: {
      type: Object
    }
  },

  mixins: [validationMixin],

  data () {

    return {
      supplier: {
        name: null,
        phone: null,
        email: null,
        address: null,
        id: null,
      },
      suggestions: [],
      loading: false,
      processing: false
    }

  },

  validations: {
    supplier: {
      name: { required },
      phone: { required },
      email: { required },
      address: { required }
    }
  },

  mounted () {
    if (this._supplier) {
      this.supplier = {
        ...this._supplier
      }
    }
  },

  computed: {
    ...mapState('users', ['currentUser']),

    ...mapState('settings', ['settings'])
  },

  methods: {

    ...mapActions('suppliers', ['loadSuppliers']),

    ...mapActions('suppliers', [
      'createSupplier',
      'updateSupplier'
    ]),

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

    closeForm () {
      this.$emit('close-form')
    },

    resetSupplier () {
      this.supplier = {
        name: null,
        phone: null,
        email: null,
        address: null,
        id: null
      }
    },

    submit () {

      this.$v.supplier.$touch()

      if (!this.$v.$invalid) {
        this.processing = true
        const doAction = this._supplier
          ? this.updateSupplier
          : this.createSupplier

        doAction({
          ...this.supplier,
          branch_id: this.settings.branch.id,
          store_id: this.settings.store.id
        })
        .then(res => {
          this.$snackbar.open(res.message)
          if (!this._supplier) {
            this.resetSupplier()
            this.$v.supplier.$reset()
          }
          this.processing = false
        })
        .catch((err) => {
          this.$snackbar.open({
            type: 'is-danger',
            message: err.message
          })
          this.processing = false
        })
      }
    }
  }

}
</script>

<style lang="sass">
  .SupplierFormHeader
    padding: 2rem
    padding-bottom: 0

  .SupplierFormMain
    padding: 2rem

  .SupplierForm
    height: 80%;
    .is-v-centered
      align-items: flex-start
    .el-select, .el-input-number, .el-input__inner
      width: 100% !important 
 
</style>
