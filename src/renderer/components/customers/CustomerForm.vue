<template lang="pug">
  div 
    .CustomerForm(v-loading="processing || processingTransaction")
      .level.toolbar
        .level-left
          .level-item
            .page-title.subtitle.is-5 {{ _customer? 'Edit customer' : 'New Customer' }}
          .level-item
            //- span.tag.is-warning.is-medium Sale ID: {{ salesid }}
            //- customers::addcustomer2($_POST['address1'], $_POST['address2']);
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
            //- button.button.is-primary(
            //-   @click="fullScreenActive = !fullScreenActive"
            //- ) Select customer 
          .level-item
            a.button(@click="closeForm()")
              span.icon
                i.material-icons close
              span Close              
      .columns.is-desktop.CustomerFormMain
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Firstname
            .field-body
              .field 
                el-input(
                  clearable,
                  v-model="customer.firstname",
                  placeholder="Enter customer firstname",
                  @input="() => $v.customer.firstname.$touch()"
                  :class="{ 'is-error': $v.customer.firstname.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Title
            .field-body
              .field 
                el-input(
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
                  clearable,
                  v-model="customer.address1",
                  placeholder="Enter customer address",
                  @input="() => $v.customer.address1.$touch()"
                  :class="{ 'is-error': $v.customer.address1.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Address2
            .field-body
              .field 
                el-input(
                  clearable,
                  v-model="customer.address2",
                  placeholder="Enter customer address",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Email
            .field-body
              .field 
                el-input(
                  clearable,
                  v-model="customer.email",
                  placeholder="Enter email address",
                  @input="() => $v.customer.email.$touch()"
                  :class="{ 'is-error': $v.customer.email.$error }",
                )
          //- .field.is-horizontal
          //-   .field-label.has-text-right.is-v-centered
          //-     label.label Country
          //-   .field-body
          //-     .field 
          //-       el-input(
          //-         v-model="customer.country",
          //-         placeholder="Enter country",
          //-       )      
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Card number
            .field-body
              .field 
                el-input(
                  disabled
                  v-model="customer.cardnumber",
                  placeholder="Enter card number",
                )
        .column.is-6 
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Surname
            .field-body
              .field 
                el-input(
                  clearable,
                  v-model="customer.surname",
                  placeholder="Enter customer surname",
                  @input="() => $v.customer.surname.$touch()"
                  :class="{ 'is-error': $v.customer.surname.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Date of birth
            .field-body
              .field 
                //- el-input(
                //-   v-model="customer.dateofbirth",
                //-   placeholder="Enter customer dateofbirth",
                //- )
                el-date-picker.has-full-width(
                  v-model="customer.dateofbirth"
                  type="date"
                  placeholder="Enter customer dateofbirth"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  @input="() => $v.customer.dateofbirth.$touch()"
                  :class="{ 'is-error': $v.customer.dateofbirth.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Town
            .field-body
              .field 
                el-input(
                  clearable,
                  v-model="customer.town",
                  placeholder="Enter customer town",
                  @input="() => $v.customer.town.$touch()"
                  :class="{ 'is-error': $v.customer.town.$error }",
                )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Phone
            .field-body
              .field 
                el-input(
                  clearable,
                  v-model="customer.phone",
                  placeholder="Enter phone number",
                  @input="() => $v.customer.phone.$touch()"
                  :class="{ 'is-error': $v.customer.phone.$error }",
                ) 
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Gender
            .field-body
              .field 
                el-select(
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
                  disabled
                  v-model="customer.confirmation",
                  placeholder="Enter confirmation number",
                ) 
      //- .columns
      //-   .column.is-12
      //-     button.button.is-primary.is-pulled-right.mb-25.mb-45.completeTransactionBtn(@click="handleClick") Skip & Complete transaction                       
</template>

<script>
/* eslint-disable */
import { mapState, mapActions } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import { ObjectToFormData } from '@/utils/helper';
import EmptyState from '@/components/EmptyState';
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import countries from '@/data/countries.json';

// const ucFirst = s => s.charAt(0).toUpperCase() + s.slice(1);

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
  data() {
    return {
      customer: {
        address1: null,
        address2: null,
        address3: null,
        firstname: null,
        surname: null,
        gender: null,
        email: null,
        phone: null,
        marital_status: null,
        title: null,
        dateofbirth: '1970-01-01 00:00:01',
        town: null,
        confirmation: null,
        cardnumber: null,
        country: null,
      },
      countries,
      customerId: null,
      suggestions: [],
      loading: false,
      availableMaterials: [],
      processing: false,
      fullScreenActive: false,
    };
  },
  validations: {
    customer: {
      address1: { required },
      firstname: { required },
      surname: { required },
      gender: { required },
      email: { required },
      title: { required },
      phone: { required },
      town: { required },
      dateofbirth: { required },
      marital_status: { required },
    },
  },
  mounted() {
    if (this._customer) {
      this.customer = this._customer;
    }
  },
  watch: {
    _customer() {
       this.customer = this._customer;
    },
  },
  computed: {
    ...mapState('users', ['currentUser']),
  },
  methods: {
    ...mapActions('customers', ['loadCustomers', 'getLoyaltyDiscount']),
    warnUser() {
      return this.$swal({
        title: 'Are you sure?',
        text: 'Continue without creating customer?',
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
    getCustomerSuggestions(query) {
      if (query !== '') {
        this.loading = true;
        let payload = {
          search: query,
          type: 'customer',
        };
        this.loadCustomers(payload)
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
    updateCustomerDetails() {
      this.customer = this.suggestions.find(
        s => s.id === this.customerId,
      );
    },
    addNewItem() {},
    handleChange() {},
    ...mapActions('customers', ['createCustomer', 'updateCustomer', 'clearSelectedCustomer']),
    closeForm() {
      this.$emit('close-form');
    },
    resetCustomer() {
      this.customer = {
        address1: null,
        address2: null,
        address3: null,
        firstname: null,
        surname: null,
        gender: null,
        email: null,
        phone: null,
        marital_status: null,
        title: null,
        dateofbirth: null,
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
          ...{
            [this._customer ? 'customerupdate' : 'customerreg']: 'value',
            customerid2: this._customer ? this._customer.id : null,
            fullname2: this._customer ? this._customer.fullname : null,
          },
        };
        doAction(ObjectToFormData(this.customer)).then(res => {
          if (res.status === 'Success') {
            this.$snackbar.open(res.status + ' !' + res.message);
            // this.$emit('action-complete');
            if (!this._customer) {
              this.$emit('action-complete', { ...res.customer_details[0] });
              this.resetCustomer();
              this.$v.customer.$reset()
            } else {
              this.$emit('action-complete', { ...this.customer });
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
  .CustomerFormHeader
    padding: 2rem
    padding-bottom: 0

  .CustomerFormMain
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
  .CustomerForm
    height: 80%;
    .is-v-centered
      align-items: flex-start
    .el-select, .el-input-number, .el-input__inner
      width: 100% !important 
  .completeTransactionBtn
    margin-right: 25px !important
    height: 50px !important  
</style>
