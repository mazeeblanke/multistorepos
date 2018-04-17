<template lang="pug">
  div
    .columns.VendorForm
      .column.is-4
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left Bank name
          .field-body
            .field.is-expanded
              .control
                el-input(
                  v-model="vendor.bankName",
                  type='text',
                  placeholder="e.g Ecobank",
                  :class="{ 'is-danger': $v.vendor.name.$error }",
                  @input="notifyChange('bankName')"
                )
      .column.is-4          
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left Bank account
          .field-body
            .field.is-expanded
              .control
                el-input(
                  v-model="vendor.bankAccount",
                  type='text',
                  placeholder="e.g 002343223",
                  :class="{ 'is-danger': $v.vendor.contactName.$error }",
                  @input="notifyChange('bankAccount')"
                )
      .column.is-4          
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left Bank address
          .field-body
            .field.is-expanded
              .control
                el-input(
                  v-model="vendor.bankAddress",
                  type='text',
                  placeholder="e.g no 91 olonode street",
                  :class="{ 'is-danger': $v.vendor.contactEmail.$error }",
                  @input="notifyChange('bankAddress')"
                )
    annual-sales
    reference
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'
import countries from '@/data/countries.json'
import AnnualSales from '@/components/vendors/VendorRegistration/AnnualSales'
import Reference from '@/components/vendors/VendorRegistration/Reference'

// import SelectMultiple from '@/components/SelectMultiple';
/* eslint-disable */
export default {
  mixins: [validationMixin],
  data() {
    return {
      countries,
      processing: false,
      languages: ['english', 'spanish', 'french', 'Arabic', 'chinese'],
      input5: '',
      select: '',
    };
  },
  validations: {
    vendor: {
      name: { required },
      contactName: { required },
      contactEmail: { required, email },
      yearEstablished: { required },
      noOfEmployees: { required },
      licenseNo: { required },
    },
  },
  mounted() {
    // this.loadCommodities();
    // if (this.id) {
    //   this.loadVendor({ id: this.id })
    //   .then(() => {
    //     this.vendor = Object.assign(this.vendor, this.selectedVendor);
    //   });
    // }
  },
  methods: {
    ...mapActions('commodities', [
      'loadCommodities',
    ]),
    ...mapActions('vendors', [
      'createVendor',
      'editVendor',
      'loadVendor',
    ]),
    // addReference() {
    //   this.vendor.servicesRendered.push({});
    // },
    validate() {
      // this.$v.form.$touch();
      var isValid = !this.$v.$invalid
      this.$emit('on-validate', this.vendor, isValid)
      return isValid
    },
    notifyChange(field = null) {
      // if (field) {
      //   this.$v.vendor[field].$touch();
      // }
      // this.$emit('update:vendor', this.vendor);
      // this.$emit('change');
    },
  },
  computed: {
    ...mapState('commodities', [
      'commodities',
    ]),
    ...mapState('vendors', [
      'selectedVendor',
    ]),
    ...mapState('vendors', ['newVendor']),
    vendor: {
      set(value) {},
      get() { return this.newVendor; },
    },
  },
  components: {
    // SelectMultiple,
    AnnualSales,
    Reference,
  },
};
</script>

<style lang="sass">
  .VendorForm
    padding: 2rem
    .el-select
      width: 100% !important  
  .vendorSales
    padding: 0px !important  
    margin-left: 15px
    // .el-input
    //   margin-bottom: 15px
    // .el-select .el-input 
    //   width: 110px
    // .input-with-select .el-input-group__prepend 
    //   background-color: #fff   
</style>
