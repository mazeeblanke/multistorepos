<template lang="pug">
  div
    .columns.VendorForm
      .column.is-12
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left For Goods only, do those offered for Supply conform to National and International Quality Standards?			
          .field-body
            .field.is-expanded
              el-radio(v-model="vendor.qualityStandard" label="yes") Yes
              el-radio(v-model="vendor.qualityStandard" label="no") No
    div.mt-10.annualSales           
      button.button.is-primary.ml-25(@click="addItem")
        span.icon
          i.material-icons add
        span Add Items/Sevices offered            
      el-table(
        ref="pricing-table",
        :data="vendor.items",
        max-height="250"
        height="400"
        empty-text="No item added yet"
        @selection-change="handleSelectionChange",
        )
          el-table-column(type="selection") 
          el-table-column(type="index", align="center", :index="1", width="100", label="Line item")
          el-table-column(show-overflow-tooltip, label="Name", :sortable="true")
            template(slot-scope="props")
              el-autocomplete(
                v-model="vendor.items[props.$index].name",
                valueKey="name"
                :fetch-suggestions="fetchItem"
                placeholder="Enter item name"
                @input="clearSelectedItem(props.$index)"
                @select="selectItem($event, props.$index)")
          el-table-column(show-overflow-tooltip, label="Description", :sortable="true")
            template(slot-scope="props")
              el-input(
                v-model="vendor.items[props.$index].description",
                type='text',
                placeholder="e.g $233,434",
                @input="notifyChange('name')"
                :disabled="!!vendor.items[props.$index].id"
              )
          el-table-column(:show-overflow-tooltip="true", label="Quality Standard", :sortable="true")
            template(slot-scope="props")
              el-input(
                v-model="vendor.items[props.$index].qualityStandard",
                type='text',
                placeholder="e.g $123,304",
                @input="notifyChange('address')"
            ) 
          el-table-column(label="Delete", :render-header="renderDelete",  width="80")
            template(slot-scope="scope", scope="props")
              button.button.trash(:class="$style.trash" @click="deleteItem([props.row])")
                i.material-icons delete      
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import deleteMixin from '@/mixins/DeleteMixin'
import { required, email } from 'vuelidate/lib/validators'
import countries from '@/data/countries.json'
import AnnualSales from '@/components/vendors/VendorRegistration/AnnualSales'
import Reference from '@/components/vendors/VendorRegistration/Reference'

// import SelectMultiple from '@/components/SelectMultiple';
/* eslint-disable */
export default {
  mixins: [validationMixin],
   props: {
    // vendor: {
    //   required: true,
    //   type: Object,
    // },
  },
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
  mixins: [deleteMixin],
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
      'addItem',
      'clearItems',
    ]),
    ...mapActions('materials', ['loadItems']),
    // addReference() {
    //   this.vendor.servicesRendered.push({});
    // },
    validate() {
      // this.$v.form.$touch();
      var isValid = !this.$v.$invalid
      this.$emit('on-validate', this.newVendor, isValid)
      return isValid
    },
    warnUser() {
      return this.$swal({
        title: 'Are you sure?',
        text: 'Do you want to remove selected file(s) ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      });
    },
    deleteItem(item) {
      this.deleteItems(item);
    },
    deleteItems(item = null) {
      const itemsToDelete = (item instanceof Array && item) || this.selectedItems;
      this.warnUser().then(() => {
        this.clearItems(itemsToDelete);
        this.$snackbar.open('sucessfully removed file(s)!');
      });
    },
    notifyChange(field = null) {
      // if (field) {
      //   this.$v.newVendor[field].$touch();
      // }
      // this.$emit('update:vendor', this.newVendor);
      // this.$emit('change');
    },
    selectItem(m, index) {
      this.addItem({ m, index });
    },
    clearSelectedItem(index) {
      this.addItem({ m: { name: this.newVendor.items[index].name, description: '' }, index });
    },
    fetchItem(queryString, cb) {
      this.loadItems().then(res => {
        res = res.filter(i => {
          return !this.newVendor.items.find(vi => vi.id === i.id);
        });
        cb(res);
      });
    },
  },
  computed: {
    ...mapState('vendors', ['newVendor']),
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

<style lang="sass" module>
.columns
  margin: 0px 50px
.trash
  border: none
  background: transparent
</style>