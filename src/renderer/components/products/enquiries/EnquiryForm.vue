<template lang="pug">
  div 
    .EmployeeForm(v-loading="processing")
      .level.toolbar
        .level-left
          .level-item
            .page-title.subtitle.is-5 {{ _enquiry? 'Edit enquiry' : 'New Enquiry' }}
        .level-right
          .level-item
            button.button.is-primary(
              :class="{'is-loading': processing}",
              :disabled="processing || $v.$invalid",
              @click="submit()"
            )
              b-icon(icon="save")
              span {{ _enquiry? 'Save enquiry edits' : 'Add Enquiry' }}
          .level-item(v-if="!!!_enquiry")
            a.button(@click="closeForm()")
              span.icon
                i.material-icons close
              span Close             
      .columns.is-desktop.EmployeeFormMain
        .column.is-6
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Product
            .field-body
              .field
                el-select(
                  :value="enquiry.product_details[0].name"
                  :remote="true"
                  filterable
                  :clearable="true"
                  placeholder="Enter product name"
                  :remote-method="getProductSuggestions"
                  :loading="loading"
                  @change="selectProduct"
                  :value-key="enquiry.product_details[0].id"
                  :disabled="!!_enquiry"
                )
                  el-option(
                    v-for="(item, index) in productSuggestions"
                    :key="item.id"
                    :label="item.name"
                    :value="item"
                    :disabled="item.name === enquiry.product_details[0].name"
                  )
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Customer
            .field-body
              .field 
                el-select(
                  v-model="enquiry.customer_details[0].firstname"
                  :filterable="true"
                  :clearable="true"
                  :remote="true"
                  placeholder="Enter customer name"
                  @change="selectCustomer"
                  :remote-method="getCustomerSuggestions"
                  :loading="loading"
                  :disabled="!!_enquiry"
                )
                  el-option(
                    v-for="(item, index) in customerSuggestions"
                    :key="index"
                    :label="item.firstname"
                    :value="item"
                  )
          .field.is-horizontal(v-if="_enquiry")
            .field-label.has-text-right.is-v-centered
              label.label Actual note
            .field-body
              .field 
                el-input(
                  v-model="enquiry.actualnote",
                  placeholder="Enter actual note",
                )         
        .column.is-6 
          .field.is-horizontal
            .field-label.has-text-right.is-v-centered
              label.label Enquiry note
            .field-body
              .field 
                el-input(
                  v-model="enquiry.inquirynote",
                  placeholder="Enter enquiry note",
                  :disabled="!!_enquiry"
                ) 
          .field.is-horizontal
              .field-label.has-text-right.is-v-centered
                label.label Date
              .field-body
                .field 
                  el-date-picker.has-full-width(
                    v-model="enquiry.expecteddate"
                    type="datetime"
                    placeholder="Select expected date"
                    :disabled="!!_enquiry"
                    value-format="yyyy-MM-dd HH:mm:ss"
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
import _ from 'lodash'

export default {
  props: {
    _enquiry: {
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
      enquiry: {
        actualnote: null,
        inquirynote: null,
        expecteddate: null,
        actualdate: null,
        customerid4: null,
        product7: null,
        customer_details: [{}],
        product_details: [{}],
        // addproductinquiry: 'addproductinquiry',
      },
      // enquiryId: null,
      customerSuggestions: [],
      productSuggestions: [],
      loading: false,
      // availableMaterials: [],
      processing: false,
      fullScreenActive: false,
    };
  },
  validations: {
    // enquiry: {
    //   fullname: { required },
    //   username: { required },
    //   password: { required },
    //   passwordConfirmation: { required },
    //   access: { required },
    // },
  },
  mounted() {
    if (this._enquiry) {
      this.enquiry = this._enquiry;
    }
  },
  watch: {
    _enquiry() {
       this.enquiry = this._enquiry;
    },
  },
  computed: {
    ...mapState('users', ['currentUser']),
    //  formatedValue() {
    //   return this.enquiry.product.name.length > 61 
    //   ? this.enquiry.product.name.substring(0, 61) + '...'
    //   : this.enquiry.product.name;
    // },
  },
  methods: {
    ...mapActions('employees', ['loadEmployees', 'getLoyaltyDiscount']),
    ...mapMutations('employees', ['ADD_EMPLOYEE']),
    ...mapMutations('products', ['ADD_ENQUIRY']),
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
    selectCustomer(item) {
      // this.customer = this.productSuggestions.find(
      //   s => s.id === this.customerId,
      // );
      this.enquiry = { 
        ...this.enquiry,
        customerid4: item.id,
        customer_details: [item],
      }
    },
    selectProduct(item) {
      console.log(item);
      // let { id, quantity: quantityInStock } = item;
      this.enquiry = { 
        ...this.enquiry,
        product7: item.id,
        product_details: [item],
      }
    },
    getProductSuggestions(query) {
      if (query !== '') {
        this.loading = true;
        let payload = {
          search: query,
          type: 'product',
        };
        this.loadProducts(payload)
        .then((productSuggestions) => {
          this.loading = false;
          this.productSuggestions = _.flatMap(productSuggestions).filter((i) => i.quantity > 0 );
        })
        .catch(() => {
          this.loading = false;
        });
      } else {
        this.productSuggestions = [];
      }  
    },
    getCustomerSuggestions(query) {
      if (query !== '') {
        this.loading = true;
        let payload = {
          search: query,
          type: 'customer',
        };
        this.loadCustomers(payload)
          .then(customerSuggestions => {
            this.loading = false;
            this.customerSuggestions = _.flatMap(customerSuggestions);
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        this.customerSuggestions = [];
      }
    },
    getEmployeeSuggestions(query) {
      if (query !== '') {
        this.loading = true;
        let payload = {
          search: query,
          type: 'employee',
        };
        this.loadEmployees(payload)
          .then(customerSuggestions => {
            this.loading = false;
            this.customerSuggestions = _.flatMap(customerSuggestions);
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        this.customerSuggestions = [];
      }
    },
    closeDialog() {
      this.fullScreenActive = false;
    },
    updateEmployeeDetails() {
      this.enquiry = this.customerSuggestions.find(
        s => s.id === this.enquiryId,
      );
    },
    addNewItem() {},
    handleChange() {},
    ...mapActions('employees', ['createEmployee', 'updateEmployee', 'clearSelectedEmployee']),
    ...mapActions('products', ['loadProducts', 'addEnquiry', 'updateProductEnquiry']),
    ...mapActions('customers', ['loadCustomers']),
    closeForm() {
      this.$emit('close-form');
    },
    resetEmployee() {
      this.enquiry = {
        actualnote: null,
        inquirynote: null,
        expecteddate: null,
        actualdate: null,
        customerid4: null,
        product7: null,
        customer_details: [{}],
        product_details: [{}],
        // addproductinquiry: 'addproductinquiry',
      };
    },
    submit() {
      this.$v.enquiry.$touch()
      if (!this.$v.$invalid) {
        this.processing = true;
        const doAction = this._enquiry
          ? this.updateProductEnquiry
          : this.addEnquiry;
        const payload = {
          ...this.enquiry,
          ...{
            [this._enquiry ? 'updateproductinquiry' : 'addproductinquiry']: 'value',
          },
        };
        doAction(ObjectToFormData(payload)).then(res => {
          if (res.status === 'Success') {
            this.$snackbar.open(res.status + ' !' + res.message);
            // this.$emit('action-complete');
            if (!this._enquiry) {
              // this.$emit('action-complete', { ...res.enquiry_details[0] });
              console.log(res.product_inquiry_details[0]);
              this.ADD_ENQUIRY({
                ...this.enquiry,
                ...res.product_inquiry_details[0],
              });
              this.resetEmployee();
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
