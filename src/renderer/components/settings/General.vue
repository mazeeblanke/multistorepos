<template lang="pug">
  div(v-loading="loading", :style="{'min-height': '600px'}")
    //- h5.title.is-5.has-text-centered.mt-30.mb-50 General settings
    div.appView(v-if="!loading" :style="{'height': '600px'}")
      div(v-show="$can('super-admin')")
        h4.title.is-4.mt-30.mb-25 General settings
        .columns
          //- .column.is-4.is-offset-2
          .column.is-5
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal Store Name
              .field-body
                .field
                  el-input(
                    size="small",
                    v-model="s.store",
                    placeholder="Enter Store name",
                  )
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal Email
              .field-body
                .field
                  el-input(
                    size="small",
                    v-model="s.email",
                    placeholder="Enter Store email",
                  )
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal Address
              .field-body
                .field
                  el-input(
                    size="small",
                    v-model="s.address",
                    placeholder="Enter Store address",
                  )
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal Loyalty Discount(%)
              .field-body
                .field
                  el-input(
                    size="small",
                    v-model="s.discount",
                    placeholder="Enter loyalty discount",
                  )
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal Currency
              .field-body
                .field
                  el-select.has-full-width(
                    size="small",
                    :value="s.currency.name",
                    :filterable="true",
                    placeholder="select currency",
                    @change="selectCurrency",
                  )
                    el-option(
                      v-for="(currency, key, index) in currencies",
                      :label="format(currency)",
                      :value="currency",
                      :key="index",
                    )
          .column.is-5
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal Phone Number
              .field-body
                .field
                  el-input(
                    size="small",
                    v-model="s.phone",
                    placeholder="Enter Store phone no.",
                  )
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal Receipt Info
              .field-body
                .field
                  el-input(
                    size="small",
                    v-model="s.receiptinfo",
                    placeholder="Enter receipt info",
                  )
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal {{ `Loyalty treshold(${this.currencySymbol})`}}
              .field-body
                .field
                  el-input(
                    size="small",
                    v-model="s.threshold",
                    placeholder="Enter loyalty treshold",
                  )
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal Invoice Type
              .field-body
                .field
                  el-select.has-full-width(
                    size="small",
                    v-model="s.printout",
                    :filterable="true",
                    placeholder="select invoice type",
                  )
                    el-option(label="Receipt (Small)", value="reciept")
                    el-option(label="Invoice (Big)", value="invoice")
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal Branch
              .field-body
                .field
                  el-select.has-full-width(
                    size="small",
                    v-model="branchSetting",
                    :filterable="true",
                    placeholder="select branch",
                    remote,
                    :remote-method="_loadBranches",
                    :loading="loadingBranches",
                    no-data-text="No results!",
                    value-key="id",
                    @change="selectBranch",
                  )
                    el-option(
                      v-for="branch in branch_suggestions",
                      :value="branch",
                      :label="branch.name",
                      :key="branch.id",
                    )
          .column.is-2
            div(class="store-logo")
              avatar(:fullname="store.store", :size="120", :image='avatarUrl', v-loading="uploadingAvatar")
              //- figure(class="image is-128x128")
              //-   img(class="is-rounded animated fadeIn", src="https://bulma.io/images/placeholders/96x96.png")
              vue-core-image-upload.mt-10(
                class="button is-primary"
                :crop="false"
                :max-file-size="5242880"
                :data="data"
                :url="uploadUrl"
                @imagechanged="imagechanged"
                @imageuploading="uploadingAvatar = true"
                @imageuploaded="imageUploaded"
              )
      h4.title.is-4.mt-30.mb-25 Branch settings
      .columns
        .column.is-5
          .field.is-horizontal.mb-30
            .field-label.has-text-left.is-v-centered
              label.label.has-text-weight-normal Branch Name
            .field-body
              .field
                el-input(
                  size="small",
                  v-model="branchSetting.name",
                  placeholder="Enter branch name",
                  disabled,
                )
        .column.is-5
          .field.is-horizontal.mb-30
            .field-label.has-text-left.is-v-centered
              label.label.has-text-weight-normal Branch Address
            .field-body
              .field
                el-input(
                  size="small",
                  v-model="branchSetting.address",
                  placeholder="Enter branch address",
                  disabled,
                )
      div.mt-30.taxes
        div.header
          h4.title.is-4 Tax
          button.button.ml-15(@click="addTax")
            span.icon
              i.material-icons add
        .columns
          .column.is-10
            el-table(
              ref="items-table",
              :data="s.taxes",
              max-height="250",
              :border="true",
              :stripe="true",
              @selection-change="handleSelectionChange",
            )
              div(slot="empty")
                EmptyState(empty-text="Add Taxes!", style="{height: '400px'}")
              el-table-column(type="selection")
              el-table-column(label="No", type="index", :index="1", width="50")
              el-table-column(prop="type", label="Tax Type", align="left", show-overflow-tooltip, :sortable="true")
                template(slot-scope="scope")
                  el-select(
                    size="small",      
                    v-model="scope.row.type",
                    :filterable="true",
                    placeholder="Enter tax type",
                    @change="stringifyTaxes",
                  )
                    el-option(
                      v-for="tax in taxes",
                      :label="tax.type",
                      :value="tax.type",
                      :key="tax.type",
                    )
              el-table-column(prop="value", label="Tax value (%)", align="left", show-overflow-tooltip, :sortable="true")
                template(slot-scope="scope")
                  el-select(
                    size="small",      
                    v-model.number="scope.row.value",
                    placeholder="Enter tax value",
                    allow-create
                    @change="stringifyTaxes"
                  )
                    el-option(label="5(%)", value="5")
                    el-option(label="10(%)", value="10")
                    el-option(label="20(%)", value="20")
                    el-option(label="50(%)", value="50")
              el-table-column(label="Actions", :render-header="renderDelete", width="70")
                template(slot-scope="scope")
                  button.button(:class="$style.trash" @click="removeTax(scope.row)")
                    i.material-icons delete
        button.button.is-primary.is-medium(
          :class="{'is-loading': processing}",
          @click="submit()"
        )
          span Save changes
</template>

<script>

import { mapActions, mapState, mapMutations } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import { ObjectToFormData } from '@/utils/helper'
import deleteMixin from '@/mixins/DeleteMixin'
import MoneyMixin from '@/mixins/MoneyMixin'
import currencies from '@/data/Common-Currency.json'
import EmptyState from '@/components/EmptyState'
import VueCoreImageUpload from 'vue-core-image-upload/src/vue-core-image-upload.vue'
import Avatar from 'vue-avatar-component'

const numeral = require('numeral')

export default {
  data () {
    return {
      uploadUrl: `${window.baseUrl}/forms/setup.php`,
      avatarUrl: `${window.baseUrl}/assets/img/logo.jpg?time=${Date.now()}`,
      uploadingAvatar: false,
      data: {
        logoupload: 'logoupload',
        logopicture: null
      },
      loadingBranches: false,
      branch_suggestions: [],
      // branchSetting: {
      //   branchid: null,
      //   branchname: null,
      //   branchaddress: null,
      // },
      s: {
        store: null,
        email: null,
        address: null,
        phone: null,
        receiptinfo: null,
        threshold: null,
        currency: null,
        branchid: null,
        discount: null,
        selectedBranch: null,
        taxes: [
          {
            type: 'Consumption Tax',
            value: 10
          },
          {
            type: 'Value Added Tax (VAT)',
            value: 5
          }
        ],
        setuployaltysetting: 'setuployaltysetting'
      },
      currencies,
      taxes: [
        {
          type: 'Consumption Tax',
          value: 10
        },
        {
          type: 'Value Added Tax (VAT)',
          value: 5
        },
        {
          type: 'Petroleum Tax',
          value: 15
        },
        {
          type: 'Withholding Tax',
          value: 20
        }
      ],
      processing: false,
      loading: false
    }
  },
  mixins: [validationMixin, deleteMixin, MoneyMixin],
  validations: {
    s: {
      store: { required },
      email: { required },
      address: { required },
      phone: { required },
      receiptinfo: { required }
    }
  },
  mounted () {
    // fetch from api
    // this.s = this.store;
    let storeDetails = null
    this.loading = true
    this.getStoreDetails(
      ObjectToFormData({
        getloyaltysetting: 'getloyaltysetting'
      }
      ))
      .then((res) => {
        storeDetails = res.message[0]
        return this.getStoreDetails(
          ObjectToFormData({
            getsetup: 'getsetup'
          }
          ))
      })
      .then((_res) => {
        storeDetails = {
          ...storeDetails,
          ..._res.message[0]
        }
        console.log(storeDetails)
        this.SET_STORE_DETAILS(storeDetails)
        this.loading = false
      })
      .catch((err) => {
        this.loading = false
        this.$snackbar.open({
          type: 'is-danger',
          message: `An Error occurred ! ${err}`
        })
      })
    this.branch_suggestions = this.branchSuggestions
    console.log(this.branchSuggestions)
  },
  watch: {
    store (newVal) {
      this.s = {
        ...newVal,
        setuployaltysetting: 'setuployaltysetting'
        // taxes: newVal.tax ? JSON.parse(newVal.tax) : [],
      }
    },
    branchSuggestions (newValue) {
      this.branch_suggestions = newValue
    }
  },
  computed: {
    ...mapState('store', ['store']),
    ...mapState('branch', ['selectedBranch', 'branches', 'branchSuggestions', 'currentBranch']),
    branchSetting: {
      get () {
        return this.currentBranch
      },
      set (value) {}
    },
    selectedTaxes () {
      return this.taxes.filter(t => {
        return this.s.taxes.find(v => t.type === v.type)
      })
    }
  },
  components: {
    EmptyState,
    VueCoreImageUpload,
    Avatar
  },
  methods: {
    imagechanged (img) {
      this.data.logopicture = img
    },
    imageUploaded () {
      this.avatarUrl = `${window.baseUrl}/assets/img/logo.jpg?time=${Date.now()}`
      this.uploadingAvatar = false
      this.$snackbar.open('Company logo updated')
    },
    ...mapMutations('branch', [
      'SET_CURRENT_BRANCH'
    ]),
    ...mapActions('store', [
      'setStoreDetails',
      'getStoreDetails'
    ]),
    ...mapActions('branch', [
      'loadBranches',
      'searchBranches'
      // 'getStoreDetails',
    ]),
    format (currency) {
      return `${currency.name} - ${currency.symbol}`
    },
    selectBranch (branch) {
      // console.log(branch);
      // this.branchSetting = branch;
      this.SET_CURRENT_BRANCH(branch)
    },
    _loadBranches (query) {
      if (query !== '') {
        this.loadingBranches = true
        this.searchBranches({
          search: query,
          type: 'branch'
        })
          .then((res) => {
            this.branch_suggestions = res
            this.loadingBranches = false
          })
          .catch(() => {
            this.loadingBranches = false
          })
      }
    },
    // updateTaxes(newVal) {
    //   let taxes;
    //   // taxes = newVal.tax ? JSON.parse(newVal.tax) : [];
    //   if (newVal.tax) {
    //     taxes = JSON.parse(newVal.tax);
    //   }
    // },
    addTax () {
      this.s.taxes.push({})
    },
    stringifyTaxes () {
      this.s = {
        ...this.s,
        tax: JSON.stringify(this.s.taxes)
      }
    },
    selectCurrency (item) {
      this.s = {
        ...this.s,
        currency: item
      }
    },
    stringifyCurrency () {
      this.s = {
        ...this.s,
        currency: JSON.stringify(this.s.currency)
      }
    },
    warnUser () {
      return this.$swal({
        title: 'Are you sure?',
        text: 'Do you want to delete this Tax(es) ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      })
    },
    ...mapMutations('store', [
      'SET_STORE_DETAILS'
    ]),
    deleteItems () {
      this.warnUser()
        .then((res) => {
          if (res.value) {
            this.s.taxes = this.s.taxes.filter((i) => {
              return this.selectedItems.indexOf(i) === -1
            })
            this.$snackbar.open('Tax(es) removed!')
          }
        })
        .catch(() => {

        })
    },
    removeTax (tax) {
      this.warnUser()
        .then((res) => {
          if (res.value) {
            this.s.taxes.splice(tax, 1)
            this.$snackbar.open('Tax removed!')
          }
        })
        .catch(() => {

        })
    },
    submit () {
      if (!this.$v.$invalid) {
        const payload = {
          ...this.s,
          tax: JSON.stringify(this.s.taxes),
          currency: JSON.stringify(this.s.currency)
        }
        this.processing = true
        this.setStoreDetails(
          ObjectToFormData(payload)
        ).then((res) => {
          if (res.status === 'Success') {
            this.$snackbar.open(res.status + ' !' + res.message)
            this.SET_STORE_DETAILS(payload)
            numeral.defaultFormat(`${this.s.currency && this.s.currency.symbol}0,0.00`)
            this.$emit('action-complete')
            // if (!this._product) {
            //   this.resetproduct();
            // }
          } else {
            this.$snackbar.open(res.status)
          }
          this.processing = false
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
  .store-logo
    display: flex
    flex-direction: column
    align-content: center
    align-items: center
  .avatar
    background-color: rgb(5, 41, 107) !important
</style>


<style lang="sass">
  .taxes
    .el-table__body-wrapper
      overflow-x: hidden !important
    .header
      display: flex
      align-content: center
</style>

<style lang="sass" module>
// .columns
//   margin: 0px 50px
.trash
  border: none
  background: transparent
</style>
