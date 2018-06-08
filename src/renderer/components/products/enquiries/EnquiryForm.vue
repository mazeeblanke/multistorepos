<template lang="pug">
  div 
    .EnquiryForm(v-loading="processing")
      .level.toolbar
        .level-left
          .level-item
            .page-title.subtitle.is-5 
              | {{ selectedEnquiry? 'Edit enquiry' : 'New Enquiry' }}
          .level-item
            template(v-if="enquiry.customer")
              span.tag.is-dark.is-medium 
                span.material-icons accessibility
                span {{ enquiry.customer.full_name }}     
        .level-right
          .level-item
            button.button.is-primary(
              :class="{'is-loading': processing}",
              @click="submit()"
            )
              span 
                | {{ selectedEnquiry? 'Save enquiry edits' : 'Create Enquiries' }}     
          .level-item(v-if="!!!selectedEnquiry")
            button.button.is-primary(@click="addNewItem")
              span.material-icons add
              span Add Item             
          .level-item(v-if="!!!selectedEnquiry")
            SelectCustomer(@selected:customer="selectCustomer")
          .level-item
            a.button.no-border(@click="closeForm()")
              span.icon
                i.material-icons close          
      .columns.is-desktop.EquiryFormMain.mb-10
        el-table(
          ref="enquiry-table",
          :data="enquiry.products",
          max-height="300",
          :border="false",
          @selection-change="handleSelectionChange"
        )
          el-table-column(type="selection")
          el-table-column(label="S/N", type="index", :index="1", width="70", fixed="left")
          el-table-column(show-overflow-tooltip, label="Product Name", :sortable="true", width="250", fixed="left")
            template(slot-scope="scope")
              el-select(
                clearable,
                :value="enquiry.products[scope.$index].name"
                @change="selectProduct($event, scope.$index, scope.row)"
                :remote="true"
                @clear="resetProduct(scope.$index, scope.row)"
                filterable
                placeholder="Enter product name"
                :remote-method="getProductSuggestions"
                :loading="loading"
                value-key="name"
                size="small"
                :disabled="!!selectedEnquiry"
                @input="() => $v.enquiry.products.$each[scope.$index].name.$touch()",
                :class="{ 'is-error': $v.enquiry.products.$each[scope.$index].name.$error }",
                allow-create
              )
                el-option(
                  v-for="(product, index) in productSuggestions"
                  :key="product.id"
                  :label="product.name"
                  :value="product"
                  :disabled="selectedProductId.includes(product.id)"
                )
          el-table-column(show-overflow-tooltip, label="Product ID", :sortable="true", width="150")
            template(slot-scope="scope")
              el-input(
                :value="selectedEnquiry ? (selectedEnquiry.product && selectedEnquiry.product.id) : enquiry.products[scope.$index].id",
                disabled
                size="small"
              ) 
          el-table-column(show-overflow-tooltip, label="Qty", :sortable="true", width="130")
            template(slot-scope="scope")
              el-input-number(
                v-model.number="enquiry.products[scope.$index].qty",
                size="small",
                type="number"
                :min="0"
                controls-position="right",
              ) 
          el-table-column(show-overflow-tooltip, label="Enquiry Note", :sortable="true", width="300")
            template(slot-scope="scope")
              el-input(
                v-model="enquiry.products[scope.$index].inquiry_note",
                clearable,
                placeholder="Enter inquiry note",
                size="small"
                @change="() => $v.enquiry.products.$each[scope.$index].inquiry_note.$touch()",
                :class="{ 'is-error': $v.enquiry.products.$each[scope.$index].inquiry_note.$error }",
              )
          el-table-column(show-overflow-tooltip, label="Actual Note", v-if="selectedEnquiry", :sortable="true", width="300")
            template(slot-scope="scope")
              el-input(
                v-model="enquiry.products[scope.$index].actual_note",
                clearable,
                placeholder="Enter actual note",
                size="small"
              )
          el-table-column(label="Status" show-overflow-tooltip, v-if="selectedEnquiry", :sortable="true", width="130")
            template(slot-scope="scope")
              el-select(
                clearable,      
                size="small",    
                v-model="enquiry.products[scope.$index].status",
                placeholder="Enter status",
              )
                el-option(label="Available", value="available")
                el-option(label="Not Available", value="not available")    
          el-table-column(show-overflow-tooltip, label="Expected Date", :sortable="true", width="180")
            template(slot-scope="scope")
              el-date-picker.has-full-width(
                v-model="enquiry.products[scope.$index].expected_date"
                type="datetime"
                clearable
                placeholder="Select expected date"
                value-format="yyyy-MM-dd HH:mm:ss"
                size="small"
                @input="() => $v.enquiry.products.$each[scope.$index].expected_date.$touch()",
                :class="{ 'is-error': $v.enquiry.products.$each[scope.$index].expected_date.$error }",
              )
          el-table-column(:render-header="renderDelete", width="70", fixed="right")
            template(slot-scope="scope")
              button.button(:class="$style.trash", :disabled="!!selectedEnquiry", @click.stop="removeRow(scope.$index)")
                span.el-icon-delete.font-size-23                   
</template>

<script>
/* eslint-disable */
import { mapState, mapActions, mapMutations } from 'vuex';
import { validationMixin } from 'vuelidate';
import deleteMixin from '@/mixins/DeleteMixin'
import { required } from 'vuelidate/lib/validators';
import EmptyState from '@/components/EmptyState';
import SelectCustomer from '@/components/products/enquiries/SelectCustomer'
import FullscreenDialog from '@/components/shared/FullscreenDialog';
import _ from 'lodash'

export default {

  props: {

    selectedEnquiry: {
      type: Object,
    }

  },

  mixins: [validationMixin, deleteMixin],

  data() {
    return {
      enquiry: {
        customer: null,
        products: [{
          name: null,
          expected_date: null,
          inquiry_note: null,
          index: 0,
          qty: 0
        }]
      },
      // customerSuggestions: [],
      productSuggestions: [],
      loading: false,
      processing: false,
      fullScreenActive: false,
    };
  },

  validations: {
    enquiry: {
      products: {
        required,
        $each: {
          name: { required },
          expected_date: { required },
          inquiry_note: { required }
        }
      }
    }
  },

  computed: {

    selectedProductId () {
      if (this.enquiry.products) {
        return this.enquiry.products
          .filter(p => p.id)
          .map(p => p.id)
      }
      return []
    },

    ...mapState('settings', ['settings'])

  },

  mounted () {
    if (this.selectedEnquiry) {
      this.enquiry = {
        customer: this.selectedEnquiry.customer,
        products: [{
          ...this.selectedEnquiry,
          name: this.selectedEnquiry.product_name,
          qty: this.selectedEnquiry.quantity
        }]
      }
    }
  },

  methods: {

    ...mapActions('products', [
      'loadProducts', 
      'addEnquiry', 
      'updateProductEnquiry'
    ]),


    warnUser (msg) {
      return this.$swal({
        title: 'Are you sure?',
        text: msg,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      })
    },

    resetProduct (index, row) {
      this.$set(this.enquiry.products, index, {
        expected_date: row.expected_date,
        inquiry_note: row.inquiry_note,
        index: row.index,
        qty: row.qty,
        name: null
      })
    },

    removeRow (index) {
      let msg = 'Do you want to delete this product ?'
      this.warnUser(msg).then((res) => {
        if (res.value) {
          if (this.enquiry.products.length > 1) {
            this.enquiry.products.splice(index, 1)
          } else {
            this.$snackbar.open({
              message: 'You must have at least one product.',
              type: 'is-danger'
            })
          }
        }
      })
    },

    deleteItems () {

      const SELECTED_ALL_PRODUCTS = 
      this.selectedItems.length === this.enquiry.products.length

      let msg = 'Do you want to delete this product(s) ?'

      if (SELECTED_ALL_PRODUCTS) {
        this.$snackbar.open({
          type: 'is-danger',
          message: 'You must have at least one product!'
        })
        return
      }

      this.warnUser(msg).then((res) => {
        if (res.value) {
          this.enquiry.products = this.enquiry
          .products
          .filter((p, index) => !this.selectedItems.find(i => i.index === index))
          .map((p, i) => ({ ...p, index: i}))
          this.$v.enquiry.products.$reset()
        }
      })
      
    },

    selectCustomer (e) {
      this.enquiry.customer = e
    },

    selectProduct (product, index, row) {

      const payload = {
        expected_date: row.expected_date,
        inquiry_note: row.inquiry_note,
        qty: row.qty,
        index: row.index
      }

      if (typeof product === 'string') {
        this.$set(this.enquiry.products, index, {
          name: product,
          ...payload
        }) 
      } else {
        this.$set(this.enquiry.products, index, {
          ...product,
          ...payload
        })
      }

    },

    getProductSuggestions(query) {
      if (query) {
        this.loading = true;
        this.loadProducts({
          name: query,
          branch_id: this.settings.branch.id,
          store_id: this.settings.store.id
        })
        .then(({ data }) => {
          this.loading = false;
          this.productSuggestions =_.uniqBy([ 
            ...this.productSuggestions,
            ...data ], 
          'id')
        })
        .catch(() => {
          this.loading = false;
        });
      } else {
        this.productSuggestions = [];
      }  
    },

    closeDialog() {
      this.fullScreenActive = false;
    },

    addNewItem() {
      this.enquiry.products.push({
        index: this.enquiry.products.length
      })
    },

    closeForm() {
      this.$emit('close-form');
    },

    resetEnquiry() {
      this.enquiry = {
        customer: null,
        products: [{
          name: null,
          expected_date: null,
          inquiry_note: null,
          index: 0,
          qty: 0
        }]
      }
    },

    processEnquiryPayload () {

      const customer = this.enquiry.customer

      return this.enquiry.products.map(p => ({
        customer_id: (customer && customer.id) || null,
        product_id: (p && p.id) || null,
        product_name: p.name,
        qty: p.qty,
        status: p.status,
        actual_note: p.actual_note,
        inquiry_note: p.inquiry_note,
        expected_date: p.expected_date,
        branch_id: this.settings.branch.id,
        store_id: this.settings.store.id
      }))

    },

    submit() {

      this.$v.enquiry.$touch()

      if (!this.$v.$invalid) {
        this.processing = true;
        const doAction = this.selectedEnquiry
          ? this.updateProductEnquiry
          : this.addEnquiry;

        const payload = {
          ...this.enquiry
        };

        doAction({
          products: this.processEnquiryPayload()
        })
        .then(res => {
          this.$snackbar.open(res.message);
          if (!!!this.selectedEnquiry) {
            this.resetEnquiry()
            this.closeForm()
            this.$v.enquiry.products.$reset()
          }
          this.processing = false;
        })
        .catch((err) => {
          this.$snackbar.open({
            type: 'is-danger',
            message: err.message
          })
          this.processing = false;
        })

      }
    }
  },

  components: {
    FullscreenDialog,
    EmptyState,
    SelectCustomer
  }

};
</script>

<style lang="sass">

  .EnquiryFormHeader
    padding: 2rem
    padding-bottom: 0

  .EquiryFormMain
    padding: 0.8rem 2rem !important

  .EnquiryForm
    height: 80%;
    .is-v-centered
      align-items: flex-start
    .el-select, .el-input-number, .el-input__inner
      width: 100% !important 

</style>

<style lang="sass" module>
.trash
  border: none
  background: transparent
</style>
