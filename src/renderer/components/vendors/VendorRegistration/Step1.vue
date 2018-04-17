<template lang="pug">
    .columns.VendorForm
      .column.is-6
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left Vendor Name
          .field-body
            .field.is-expanded
              .control
                el-input(
                  v-model="vendor.name",
                  type='text',
                  placeholder="e.g Chidex and Sons",
                  :class="{ 'is-danger': $v.vendor.name.$error }",
                  @input="notifyChange('name')"
                )
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left Contact Person Name
          .field-body
            .field.is-expanded
              .control
                el-input(
                  v-model="vendor.contactName",
                  type='text',
                  placeholder="e.g Mark Luke",
                  :class="{ 'is-danger': $v.vendor.contactName.$error }",
                  @input="notifyChange('contactName')"
                )
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left E-mail Address
          .field-body
            .field.is-expanded
              .control
                el-input(
                  v-model="vendor.contactEmail",
                  type='email',
                  placeholder="e.g mark@lukhamventures.com",
                  :class="{ 'is-danger': $v.vendor.contactEmail.$error }",
                  @input="notifyChange('contactEmail')"
                )
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left Address
          .field-body
           .field.is-expanded
              .control
                el-input(
                  v-model="vendor.address",
                  type='text',
                  placeholder="e.g 7, Abraham Adesanya Close",
                )
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left City
          .field-body
            .field.is-expanded
              .control
                el-input(
                  v-model="vendor.city",
                  type='text',
                  placeholder="e.g Yaba",
                )
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left State
          .field-body
            .field.is-expanded
              .control
                el-input(
                  v-model="vendor.state",
                  type='email',
                  placeholder="e.g Lagos",
                )
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left Country
          .field-body
            .field.is-expanded
              el-select(
                :expanded="true"
                v-model="vendor.country",
                placeholder="Select Country...",
              )
                el-option(v-for="country in countries", :key="country.code", :value="country.code", :label="country.name")
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left Technical Doc Languages
          .field-body
           el-select(v-model="vendor.techDocLanguages" multiple placeholder="Select")
            el-option(
              v-for="item in languages"
              :key="item"
              :label="item"
              :value="item")        
      .column.is-6
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left Year established
          .field-body
            .field.is-expanded
              .control
                el-input(
                  v-model="vendor.yearEstablished",
                  type='text',
                  placeholder="e.g Chidex and Sons",
                  :class="{ 'is-danger': $v.vendor.yearEstablished.$error }",
                  @input="notifyChange('yearEstablished')"
                )
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left No of Full-time Employees
          .field-body
            .field.is-expanded
              .control
                el-input(
                  v-model="vendor.noOfEmployees",
                  type='text',
                  placeholder="e.g Mark Luke",
                  :class="{ 'is-danger': $v.vendor.noOfEmployees.$error }",
                  @input="notifyChange('noOfEmployees')"
                )
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left License No.
          .field-body
            .field.is-expanded
              .control
                el-input(
                  v-model="vendor.licenseNo",
                  type='email',
                  placeholder="e.g mark@lukhamventures.com",
                  :class="{ 'is-danger': $v.vendor.licenseNo.$error }",
                  @input="notifyChange('licenseNo')"
                )
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left Registered Business Address
          .field-body
           .field.is-expanded
              .control
                el-input(
                  v-model="vendor.address",
                  type='text',
                  placeholder="e.g 7, Abraham Adesanya Close",
                )
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left VAT No
          .field-body
            .field.is-expanded
              .control
                el-input(
                  v-model="vendor.vatNo",
                  type='text',
                  placeholder="e.g Yaba",
                )
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left Website
          .field-body
            .field.is-expanded
              .control
                el-input(
                  v-model="vendor.website",
                  type='email',
                  placeholder="e.g Lagos",
                )
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left Country
          .field-body
            .field.is-expanded
              el-select(
                :expanded="true"
                v-model="vendor.country",
                placeholder="Select Country...",
              )
                el-option(v-for="country in countries", :value="country.name", :key="country.name")
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left Working Languages
          .field-body
           el-select(v-model="vendor.workingLanguages" multiple placeholder="Select")
            el-option(
              v-for="item in languages"
              :key="item"
              :label="item"
              :value="item")
   
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'
import countries from '@/data/countries.json'

// import SelectMultiple from '@/components/SelectMultiple';
/* eslint-disable */
export default {
  mixins: [validationMixin],
  data() {
    return {
      countries,
      processing: false,
      languages: ['english', 'spanish', 'french', 'Arabic', 'chinese'],
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
    validate() {
      // this.$v.form.$touch();
      var isValid = !this.$v.$invalid
      this.$emit('on-validate', this.vendor, isValid)
      return isValid
    },
    notifyChange(field = null) {
      if (field) {
        this.$v.vendor[field].$touch();
      }
      this.$emit('update:vendor', this.vendor);
      this.$emit('change');
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
      set(value) { console.log(value); },
      get() { return this.newVendor; },
    },
  },
  components: {
    // SelectMultiple,
  },
};
</script>

<style lang="sass">
  .VendorForm
    padding: 2rem
    .el-select
      width: 100% !important
</style>
