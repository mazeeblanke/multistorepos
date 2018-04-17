<template lang="pug">
  div
    .columns.VendorForm
      .column.is-12
        .field.is-horizontal
          .field-label.is-normal.is-v-centered
            label.label.has-text-left To which Countries has your company exported and/or managed Projects over the last 3 Years			
          .field-body
            .field.is-expanded
              el-select(v-model="newVendor.countriesDoneBBusinessWith" auto-complete="on" :filterable="true" multiple placeholder="Select")
                el-option(
                  v-for="country in countries"
                  :key="country.code"
                  :label="country.name"
                  :value="country.name")
    div.mt-10.annualSales           
      button.button.is-primary.ml-25(@click="addRecentContract")
        span.icon
          i.material-icons add
        span Add Recent Contracts with the UN and /or national government								
           
      el-table(
        ref="pricing-table",
        :data="newVendor.recentContracts",
        max-height="250"
        height="400"
        empty-text="No item added yet"
        @selection-change="handleSelectionChange",
        )
          el-table-column(type="selection") 
          el-table-column(type="index", align="center", :index="1", width="100", label="Line item")
          el-table-column(show-overflow-tooltip, label="Organization", :sortable="true")
            template(slot-scope="props")
              el-input(
                v-model="props.row.description",
                type='text',
                placeholder="e.g $233,434",
                @input="notifyChange('name')"
              )
          el-table-column(:show-overflow-tooltip="true", label="Value", :sortable="true")
            template(slot-scope="props")
              el-input(
                v-model="props.row.value",
                type='text',
                placeholder="e.g $123,304",
                @input="notifyChange('address')"
            ) 
          el-table-column(:show-overflow-tooltip="true", label="Year", :sortable="true")
            template(slot-scope="props")
              el-input(
                v-model="props.row.year",
                type='text',
                placeholder="e.g $123,304",
                @input="notifyChange('address')"
            ) 
          el-table-column(:show-overflow-tooltip="true", label="Goods/Services supplied", :sortable="true")
            template(slot-scope="props")
              el-input(
                v-model="props.row.year",
                type='text',
                placeholder="e.g $123,304",
                @input="notifyChange('address')"
            ) 
          el-table-column(:show-overflow-tooltip="true", label="Destination", :sortable="true")
            template(slot-scope="props")
              el-input(
                v-model="props.row.destination",
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
    newVendor: {
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
      'addRecentContract',
      'clearItems',
      'clearRecentContracts',
    ]),
    ...mapActions('materials', ['loadItems']),
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
        this.clearRecentContracts(itemsToDelete);
        this.$snackbar.open('sucessfully removed contract(s)!');
      });
    },
    notifyChange(field = null) {
      if (field) {
        this.$v.newVendor[field].$touch();
      }
      this.$emit('update:vendor', this.newVendor);
      this.$emit('change');
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