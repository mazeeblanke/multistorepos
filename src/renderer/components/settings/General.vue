<template lang="pug">
  div(v-loading="loading", :style="{'min-height': '600px'}")
    div.appView(v-if="!loading")
      div
        h4.title.is-4.mt-30.mb-25 General settings
        .columns
          .column.is-5
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Store Name
              .field-body
                .field
                  el-input(
                    clearable,
                    :disabled="!$can('superadmin')"
                    size="small",
                    v-model="storeSettings.store.name",
                    placeholder="Enter Store name",
                    @change="() => $v.storeSettings.store.name.$touch()",
                    :class="{ 'is-error': $v.storeSettings.store.name.$error }",
                  )
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Email
              .field-body
                .field
                  el-input(
                    clearable,
                    :disabled="!$can('superadmin')"
                    size="small",
                    v-model="storeSettings.store.email",
                    placeholder="Enter Store email",
                    @change="() => $v.storeSettings.store.email.$touch()",
                    :class="{ 'is-error': $v.storeSettings.store.email.$error }",
                  )
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Currency
              .field-body
                .field
                  el-select.has-full-width(
                    :disabled="!$can('superadmin')"
                    clearable,
                    size="small",
                    v-model="storeSettings.store.currency",
                    :filterable="true",
                    placeholder="select currency",
                    value-key="name",
                    @change="() => $v.storeSettings.store.currency.$touch()",
                    :class="{ 'is-error': $v.storeSettings.store.currency.$error }",
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
                label.label.has-text-weight-normal.font-size-13 Phone Number
              .field-body
                .field
                  el-input(
                    :disabled="!$can('superadmin')"
                    clearable,
                    size="small",
                    v-model="storeSettings.store.phone",
                    placeholder="Enter Store phone no.",
                  )

            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Branch
              .field-body
                .field
                  el-select.has-full-width(
                    :disabled="!$can('superadmin')"
                    size="small",
                    v-model="storeSettings.branch",
                    :filterable="true",
                    placeholder="select branch",
                    remote,
                    :remote-method="_loadBranches",
                    :loading="loadingBranches",
                    no-data-text="No results!",
                    value-key="id",
                    clearable,
                  )
                    el-option(
                      v-for="branch in branchSuggestions",
                      :value="branch",
                      :label="branch.name",
                      :key="branch.id",
                    )
          .column.is-2
            div
              // avatar(:fullname="storeSettings.store.name", :size="120", :image='avatarUrl', v-loading="uploadingAvatar")
              avatar(:fullname="_settings.store.name", :size="120")
              //- figure(class="image is-128x128")
              //-   img(class="is-rounded animated fadeIn", src="https://bulma.io/images/placeholders/96x96.png")
              // vue-core-image-upload.mt-10(
              //   class="button is-primary"
              //   :crop="false"
              //   :max-file-size="5242880"
              //   :data="data"
              //   :url="uploadUrl"
              //   @imagechanged="imagechanged"
              //   @imageuploading="uploadingAvatar = true"
              //   @imageuploaded="imageUploaded"
              // )
        h4.title.is-4.mt-30.mb-25 Branch settings
        .columns
          .column.is-5
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Branch Name
              .field-body
                .field
                  el-input(
                    :disabled="!$can('superadmin|admin')"
                    clearable,
                    size="small",
                    v-model="storeSettings.branch.name",
                    placeholder="Enter branch name",
                    @change="() => $v.storeSettings.branch.name.$touch()",
                    :class="{ 'is-error': $v.storeSettings.branch.name.$error }",
                  )
            .field.is-horizontal.mb-30
                .field-label.has-text-left.is-v-centered
                  label.label.has-text-weight-normal.font-size-13 Loyalty Discount(%)
                .field-body
                  .field
                    el-input(
                      :disabled="!$can('superadmin|admin')"
                      size="small",
                      type="number",
                      v-model.number="storeSettings.branch.discount",
                      placeholder="Enter loyalty discount"
                    )
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Currency
              .field-body
                .field
                  el-select.has-full-width(
                    clearable,
                    :disabled="!$can('superadmin|admin')"
                    size="small",
                    v-model="storeSettings.branch.currency",
                    :filterable="true",
                    placeholder="select currency",
                    value-key="name",
                    @change="() => $v.storeSettings.branch.currency.$touch()",
                    :class="{ 'is-error': $v.storeSettings.branch.currency.$error }",
                  )
                    el-option(
                      v-for="(currency, key, index) in currencies",
                      :label="format(currency)",
                      :value="currency",
                      :key="index",
                    )  
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Invoice Type
              .field-body
                .field
                  el-select.has-full-width(
                    clearable,
                    :disabled="!$can('superadmin|admin')"
                    size="small",
                    :value="storeSettings.branch.printout",
                    :filterable="true",
                    placeholder="select invoice type",
                    @change="() => $v.storeSettings.branch.printout.$touch()",
                    :class="{ 'is-error': $v.storeSettings.branch.printout.$error }",
                  )
                    el-option(label="Receipt (Small)", value="reciept")
                    el-option(label="Invoice (Big)", value="invoice")                      
          .column.is-5
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Branch Address
              .field-body
                .field
                  el-input(
                    clearable,
                    :disabled="!$can('superadmin|admin')"
                    size="small",
                    v-model="storeSettings.branch.address",
                    placeholder="Enter branch address",
                    @change="() => $v.storeSettings.branch.address.$touch()",
                    :class="{ 'is-error': $v.storeSettings.branch.address.$error }",
                  )   
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Receipt Info
              .field-body
                .field
                  el-input(
                    clearable,
                    :disabled="!$can('superadmin|admin')"
                    size="small",
                    v-model="storeSettings.branch.receiptinfo",
                    placeholder="Enter receipt info",
                  )
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 {{ `Loyalty treshold(${this.currencySymbol})`}}
              .field-body
                .field
                  el-input(
                    :disabled="!$can('superadmin|admin')"
                    size="small",
                    type="number",
                    v-model.number="storeSettings.branch.threshold",
                    placeholder="Enter loyalty threshold",
                  )                 
      div.mt-30.taxes
        div.header
          h4.title.is-4 Tax
          button.button.ml-15(
            @click="addTax",
            :disabled="!$can('superadmin|admin')"
          )
            span.icon
              i.material-icons add
            span Add Tax  
        .columns
          .column.is-10
            el-table(
              ref="items-table",
              :data="storeSettings.store.tax",
              max-height="250",
              :border="true",
              @selection-change="handleSelectionChange",
            )
              div(slot="empty")
                EmptyState(empty-text="Add Taxes!", style="{height: '400px'}")
              el-table-column(type="selection", :selectable="() => $can('superadmin|admin')")
              el-table-column(label="No", type="index", :index="1", width="50")
              el-table-column(prop="type", label="Tax type", align="left", show-overflow-tooltip, :sortable="true")
                template(slot-scope="scope")
                  el-select(
                    clearable,      
                    size="small",
                    :disabled="!$can('superadmin|admin')"     
                    v-model="scope.row.type",
                    :filterable="true",
                    placeholder="Enter tax type",
                    @change="() => $v.storeSettings.store.tax.$each[scope.$index].type.$touch()",
                    :class="{ 'is-error': $v.storeSettings.store.tax.$each[scope.$index].type.$error }",
                    allow-create
                  )
                    el-option(
                      v-for="tax in taxes",
                      :label="tax.type",
                      :value="tax.type",
                      :key="tax.type",
                      :disabled="selectedTaxTypes.includes(tax.type)"
                    )
              el-table-column(prop="value", label="Tax value (%)", align="left", show-overflow-tooltip, :sortable="true")
                template(slot-scope="scope")
                  el-select(
                    clearable,      
                    size="small",
                    :disabled="!$can('superadmin|admin')"     
                    v-model.number="scope.row.value",
                    placeholder="Enter tax value",
                    :filterable="true",
                    @change="() => $v.storeSettings.store.tax.$each[scope.$index].value.$touch()",
                    :class="{ 'is-error': $v.storeSettings.store.tax.$each[scope.$index].value.$error }",
                    allow-create
                  )
                    el-option(label="5(%)", value="5")
                    el-option(label="10(%)", value="10")
                    el-option(label="20(%)", value="20")
                    el-option(label="50(%)", value="50")
              el-table-column(label="Actions", :render-header="renderDelete", width="70")
                template(slot-scope="scope")
                  button.button(
                    :class="$style.trash", 
                    @click="removeTax(scope.$index)",
                    :disabled="!$can('superadmin|admin')"
                  )
                    span.el-icon-delete.font-size-23
    button.button.is-primary(
      v-if="!this.loading"
      :class="{'is-loading': processing}",
      @click="submit()",
      :disabled="!shouldSaveChanges"
    )
      span Save changes
</template>

<script>
/* eslint-disable */
import { mapActions, mapState, mapMutations } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, email } from 'vuelidate/lib/validators'
import { TAXES } from '@/utils/constants'
import deleteMixin from '@/mixins/DeleteMixin'
import MoneyMixin from '@/mixins/MoneyMixin'
import currencies from '@/data/Common-Currency.json'
import EmptyState from '@/components/EmptyState'
import VueCoreImageUpload from 'vue-core-image-upload/src/vue-core-image-upload.vue'
import { calculatePercentInCash, calculateDiscount } from '@/utils/helper'
import Avatar from 'vue-avatar-component'
import _ from 'lodash'

const numeral = require('numeral')

/* eslint-disable */

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
      branchSuggestions: [],
      storeSettings: {
        store: {},
        branch: {
          currency: {}
        },
        loggedInUser: {}
      },
      currencies,
      taxes: TAXES,
      processing: false,
      loading: false
    }
  },

  mixins: [
    validationMixin, 
    deleteMixin, 
    MoneyMixin
  ],

  validations: {
    storeSettings: {
      store: {
        name: { required },
        email: { required, email },
        currency: { required },
        tax: {
          // required,
          $each: {
            type: { required },
            value: { required }
          }
        }
      },
      branch: {
        required,
        name: { required },
        currency: { required },
        printout: { required },
        address: { required }
      }
    }
  },

  mounted () {
    if (
      !this._settings || 
      this.currentUser.store_id !== this._settings.store.id
    ) {
      this.loading = true
      this.preloadSettings()
    } else {
      this.storeSettings = JSON.parse(JSON.stringify(this._settings))
      this.init_branch_suggestions()
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

    init_branch_suggestions () {
      this.branchSuggestions = [this._settings.branch]
    },

    preloadSettings () {
      this.loadSettings()
      .then(({ payload }) => {
        this.storeSettings = JSON.parse(JSON.stringify(payload))
        this.SET_STORE_SETTINGS({ 
          data: this.storeSettings
        })
        this.loading = false
        this.init_branch_suggestions()
      })
      .catch((err) => {
        this.loading = false
      })
    },

    imageUploaded () {
      // this.avatarUrl = `${window.baseUrl}/assets/img/logo.jpg?time=${Date.now()}`
      this.avatarUrl = ''
      this.uploadingAvatar = false
      this.$snackbar.open('Company logo updated')
    },
    
    ...mapMutations('settings', ['SET_STORE_SETTINGS']),

    ...mapActions('branch', ['loadBranches']),

    ...mapMutations('sales', ['SET_CART']),

    ...mapActions('settings', [
      'loadSettings',
      'updateSettings'
    ]),

    format (currency) {
      return `${currency.name} - ${currency.symbol}`
    },

    _loadBranches(query) {
      if (query) {
        this.loadingBranches = true;
        this.loadBranches({
          name: query,
          store_id: this._settings.store.id
        }).then((res) => {
          this.branchSuggestions = res.data;
          this.loadingBranches = false;
        }).catch(() => {
          this.loadingBranches = false;
        });
      }
    },

    addTax () {
      this.storeSettings.store.tax.push({})
    },

    warnUser (msg) {
      return this.$swal({
        title: 'Are you sure?',
        text: msg || 'Do you want to delete this Tax(es) ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      })
    },

    deleteItems () {
      this.warnUser()
      .then((res) => {
        if (res.value) {
          this.storeSettings.store.tax = this.storeSettings.store.tax.filter((i) => {
            return this.selectedItems.indexOf(i) === -1
          })
          this.$snackbar.open('Tax(es) removed!')
        }
      })
    },

    removeTax (taxIndex) {
      this.warnUser()
        .then((res) => {
          if (res.value) {
            this.storeSettings.store.tax.splice(taxIndex, 1)
            this.$snackbar.open('Tax removed!')
          }
        })
    },
    
    submit () {
      this.$v.storeSettings.$touch()
      if (!this.$v.$invalid) {
        const payload = {
          ...this.storeSettings,
        }
        this.processing = true
        this.updateSettings(payload)
        .then((res) => {
          
          this.$snackbar.open(res.message)
          this.storeSettings = JSON.parse(JSON.stringify(this._settings))

          const branch = this._settings.branch
          const store = this._settings.store
          const subTotal = this.cart.subTotal
          const discount = calculateDiscount(subTotal, branch.threshold, branch.discount)
          const discountTotal = calculatePercentInCash(discount, subTotal)
          const taxTotal = calculatePercentInCash(this.tax, subTotal)
          const total = Math.max((subTotal - discountTotal) + taxTotal, 0)
          const discount_per_threshold = branch.discount
          const tax = this.tax
          const threshold = branch.threshold
          
          this.SET_CART({
            ...this.cart,
            subTotal,
            discount,
            discountTotal,
            discount_per_threshold,
            taxTotal,
            total,
            tax,
            threshold
          })

          this.processing = false

        })
        .catch((err) => {
          console.log(err)
          this.processing = false
          this.$snackbar.open({
            type: 'is-danger',
            message: err.message
          })
        })
      } else {
        this.$snackbar.open({
          type: 'is-danger',
          message: 'validation errors exist!!'
        })
      }
    }
  },

  computed: {

    ...mapState('settings', {
      _settings: 'settings'
    }),

    ...mapState('sales', ['cart']),

    ...mapState('users', ['currentUser']),

    ...mapState('branch', ['branches']),

    selectedTaxTypes () {
      const TAX = this.storeSettings.store.tax
      if (TAX && TAX instanceof Array) {
        return _.map(TAX, t => t.type)
      }
      return []
    },

    tax () {
      return this._settings.store.tax.reduce((agg, tax) => {
        return agg + parseInt(tax.value)
      }, 0)
    },

    shouldSaveChanges () {
      return !_.isEqual(
        _.pick(this.storeSettings, ['branch', 'store']),
        _.pick(this._settings, ['branch', 'store'])
      )
    }
  },

  beforeRouteLeave(to, from, next) {
    if (this.shouldSaveChanges) {
      this.warnUser('You have unsaved changes!')
      .then((res) => {
        if (res.value) {
          next()
        } else {
          next(false)
        }
      })
    } else {
      next()
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
