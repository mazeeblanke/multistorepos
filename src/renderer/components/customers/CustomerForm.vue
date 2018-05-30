<template lang="pug">
  div 
    .CustomerForm(v-loading="processing || processingTransaction")
      .level.toolbar
        .level-left
          .level-item
            .page-title.subtitle.is-5 {{ _customer? 'Edit customer' : 'New Customer' }}
        .level-right
          .level-item
            button.button.is-primary(
              :class="{'is-loading': processing}",
              :disabled="processing ",
              @click="submit()"
            )
              b-icon(icon="save")
              span {{ _customer? 'Save customer edits' : 'Add Customer' }}
          .level-item
            a.button.no-border(@click="closeForm()")
              span.icon
                i.material-icons close            
      .columns.is-desktop.CustomerFormMain
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Full Name
            .field-body
              .field 
                el-input(
                  size="small",
                  clearable,
                  v-model="customer.full_name",
                  placeholder="Enter customer fullname",
                  @input="() => $v.customer.full_name.$touch()"
                  :class="{ 'is-error': $v.customer.full_name.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Title
            .field-body
              .field 
                el-input(
                  size="small",
                  clearable,
                  v-model="customer.title",
                  placeholder="Enter customer title",
                  @input="() => $v.customer.title.$touch()"
                  :class="{ 'is-error': $v.customer.title.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Country
            .field-body
              .field 
                el-select(
                  size="small",
                  :expanded="true"
                  v-model="customer.country",
                  placeholder="Enter customer country",
                )
                  el-option(v-for="country in countries", :value="country.name", :key="country.name")
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Address
            .field-body
              .field 
                el-input(
                  size="small",
                  clearable,
                  v-model="customer.address",
                  placeholder="Enter customer address",
                  @input="() => $v.customer.address.$touch()"
                  :class="{ 'is-error': $v.customer.address.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Phone
            .field-body
              .field 
                el-input(
                  size="small",
                  clearable,
                  v-model="customer.phone",
                  placeholder="Enter phone number",
                  @input="() => $v.customer.phone.$touch()"
                  :class="{ 'is-error': $v.customer.phone.$error }",
                )       
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Card number
            .field-body
              .field 
                el-input(
                  size="small",
                  disabled
                  v-model="customer.cardnumber",
                  placeholder="Enter card number",
                )
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Date of birth
            .field-body
              .field 
                el-date-picker.has-full-width(
                  size="small",
                  v-model="customer.date_of_birth"
                  type="date"
                  placeholder="Enter customer dateofbirth"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  @input="() => $v.customer.date_of_birth.$touch()"
                  :class="{ 'is-error': $v.customer.date_of_birth.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Town
            .field-body
              .field 
                el-input(
                  size="small",
                  clearable,
                  v-model="customer.town",
                  placeholder="Enter customer town",
                  @input="() => $v.customer.town.$touch()"
                  :class="{ 'is-error': $v.customer.town.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Email
            .field-body
              .field 
                el-input(
                  size="small",
                  clearable,
                  v-model="customer.email",
                  placeholder="Enter email address",
                  @input="() => $v.customer.email.$touch()"
                  :class="{ 'is-error': $v.customer.email.$error }",
                )      
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Gender
            .field-body
              .field 
                el-select(
                  size="small",
                  v-model="customer.gender"
                  :filterable="true"
                  placeholder="Enter gender"
                  @input="() => $v.customer.gender.$touch()"
                  :class="{ 'is-error': $v.customer.gender.$error }",
                )
                  el-option(value="male", label="male")              
                  el-option(value="female", label="female")              
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Marital status
            .field-body
              .field 
                el-select(
                  size="small",
                  v-model="customer.marital_status"
                  :filterable="true"
                  placeholder="Enter marital status"
                  @input="() => $v.customer.marital_status.$touch()"
                  :class="{ 'is-error': $v.customer.marital_status.$error }",
                )
                  el-option(value="single", label="single")              
                  el-option(value="married", label="married") 
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Confirmation number
            .field-body
              .field 
                el-input(
                  size="small",
                  disabled
                  v-model="customer.confirmation",
                  placeholder="Enter confirmation number",
                )                     
</template>

<script>
/* eslint-disable */
import { mapState, mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import { ucFirst } from '@/utils/helper'
import EmptyState from '@/components/EmptyState'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import countries from '@/data/countries.json'

const chance = require('chance').Chance();

export default {

  props: {
    _customer: {
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

  data () {
    return {
      customer: {
        address: null,
        full_name: null,
        gender: null,
        email: null,
        phone: null,
        marital_status: null,
        title: null,
        date_of_birth: '1970-01-01 00:00:01',
        town: null,
        confirmation: chance.hash(),
        cardnumber: chance.fbid(),
        country: null,
      },
      countries,
      customerId: null,
      processing: false,
      fullScreenActive: false,
    }
  },

  validations: {
    customer: {
      address: { required },
      full_name: { required },
      gender: { required },
      email: { required },
      title: { required },
      phone: { required },
      town: { required },
      date_of_birth: { required },
      marital_status: { required },
    },
  },

  mounted () {
    if (this._customer) {
      this.customer = this._customer
    }
  },

  watch: {
    _customer() {
       this.customer = this._customer;
    },
  },

  computed: {

    ...mapState('users', ['currentUser']),

    ...mapState('settings', ['settings'])
  
  },

  methods: {

    ...mapActions('customers', [
      'loadCustomers',
      'createCustomer',
      'updateCustomer',
      'getLoyaltyDiscount'
    ]),

    closeForm () {
      this.$emit('close-form');
    },

    resetCustomer() {
      this.customer = {
        address: null,
        full_name: null,
        gender: null,
        email: null,
        phone: null,
        marital_status: null,
        title: null,
        date_of_birth: null,
        town: null,
        confirmation: null,
        cardnumber: null,
        country: null,
      };
    },

    submit() {
      this.$v.customer.$touch()
      if (!this.$v.$invalid) {
        this.processing = true;
        const doAction = this._customer
          ? this.updateCustomer
          : this.createCustomer;
        this.customer = {
          ...this.customer,
          store_id: this.settings.store.id
        };
        doAction(this.customer)
        .then(res => {
          this.$snackbar.open(res.message);
          if (!this._customer) {
            this.$emit('action-complete', res.data);
            this.resetCustomer();
            this.$v.customer.$reset()
          } else {
            this.$emit('action-complete')
          }
          this.processing = false;
        })
        .catch((err) => {
          this.processing = false;
          this.$snackbar.open({
            type: 'is-danger',
            message: `Error Occured ${err.message}`
          })
        })
      }
    }

  },

  components: {
    FullscreenDialog,
    EmptyState,
  }

}
</script>

<style lang="sass">

  .CustomerFormHeader
    padding: 2rem
    padding-bottom: 0

  .CustomerFormMain
    padding: 2rem

  .CustomerForm
    height: 80%;
    .is-v-centered
      align-items: flex-start
    .el-select, .el-input-number, .el-input__inner
      width: 100% !important 

</style>
