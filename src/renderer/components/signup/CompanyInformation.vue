<template lang="pug">
.CompanyInfo
  .container
    .columns
      .column.is-half.is-offset-one-quarter.p-30
        .card
          header.card-header
            p.card-header-title
              img(
                src="../../assets/img/logo-inverted.png", 
                alt="OAS logo"
              )
            i.material-icons.security security   
          el-steps(:active="active" finish-status="success" align-center)
            el-step(title="Step 1")
            el-step(title="Step 2")
            el-step(title="Step 3")  
          el-tabs.p-10(v-model="activeTab", @tab-click="setActiveTab")
            el-tab-pane.mt-10(label="Basic Information" name="0")
              .field.is-horizontal
                .field-label.has-text-left.is-v-centered
                  label.label  Company Name
                .field-body
                  .field 
                    el-input(
                      clearable,
                      size="small", 
                      v-model="signUpInformation.store.name", 
                      placeholder="e.g ABC & Co Limited",
                      @input="() => $v.signUpInformation.store.name.$touch()"
                      :class="{ 'is-error': $v.signUpInformation.store.name.$error }",
                    )
              .field.is-horizontal
                .field-label.has-text-left.is-v-centered
                  label.label  Company Email
                .field-body
                  .field  
                    el-input(
                      clearable,
                      size="small",
                      v-model="signUpInformation.store.email", 
                      @input="() => $v.signUpInformation.store.email.$touch()",
                      :class="{ 'is-error': $v.signUpInformation.store.email.$error }",
                      placeholder="e.g support@abc.com",
                    )
              .field.is-horizontal
                .field-label.has-text-left.is-v-centered
                  label.label  
                    span Username
                    span.tag.is-warning.ml-2 {{ signUpInformation.user.access_level.toUpperCase() }} 
                .field-body
                  .field  
                    el-input(
                      clearable,
                      size="small",
                      v-model="signUpInformation.user.username",
                      @input="() => $v.signUpInformation.user.username.$touch()",
                      :class="{ 'is-error': $v.signUpInformation.user.username.$error }",
                      placeholder="e.g xxxx-xxxx-xxx"
                    )
              .field.is-horizontal
                .field-label.has-text-left.is-v-centered
                  label.label  Full Name
                .field-body
                  .field  
                    el-input(
                      clearable,
                      size="small", 
                      v-model="signUpInformation.user.full_name", 
                      @input="() => $v.signUpInformation.user.full_name.$touch()",
                      :class="{ 'is-error': $v.signUpInformation.user.full_name.$error }",
                      placeholder="e.g john doe"
                    )
              .field.is-horizontal
                .field-label.has-text-left.is-v-centered
                  label.label  User email
                .field-body
                  .field  
                    el-input(
                      clearable,
                      size="small", 
                      v-model="signUpInformation.user.email", 
                      @input="() => $v.signUpInformation.user.email.$touch()",
                      :class="{ 'is-error': $v.signUpInformation.user.email.$error }",
                      placeholder="e.g peter doe"
                    )
              .field.is-horizontal
                .field-label.has-text-left.is-v-centered
                  label.label(
                    title="This is the default/base currency of the store. it cannot be changed"
                  ) Currency
                .field-body
                  .field 
                    el-select.has-full-width(
                      size="small",
                      v-model="signUpInformation.store.currency",
                      :filterable="true",
                      placeholder="select currency",
                      value-key="name",
                      clearable,
                      @change="() => $v.signUpInformation.store.currency.$touch()",
                      :class="{ 'is-error': $v.signUpInformation.store.currency.$error }",
                    )
                      el-option(
                        v-for="(currency, key, index) in currencies",
                        :label="currency.name",
                        :value="currency",
                        :key="index",
                      )
              .field.is-horizontal
                .field-label.has-text-left.is-v-centered
                  label.label  Password
                .field-body
                  .field  
                    el-input(
                      clearable,
                      type="password", 
                      size="small", 
                      v-model="signUpInformation.user.password",
                      @change="() => $v.signUpInformation.user.password.$touch()",
                      :class="{ 'is-error': $v.signUpInformation.user.password.$error }",
                      placeholder="password"
                    )    
              .field.is-horizontal
                .field-label.has-text-left.is-v-centered
                  label.label  Confirm Password
                .field-body
                  .field  
                    el-input(
                      clearable,
                      type="password", 
                      size="small", 
                      v-model="signUpInformation.user.confirmPassword",
                      @change="() => $v.signUpInformation.user.confirmPassword.$touch()",
                      :class="{ 'is-error': $v.signUpInformation.user.confirmPassword.$error }",
                      placeholder="password"
                    )    
            el-tab-pane(label="Branches" name="1")
              .level.toolbar
                .level-left
                  .level-item(:style="{width: '350px'}")
                    .field.is-horizontal
                      .field-body
                        .field
                          el-alert(
                            title="N.B. The first branch would be selected as the branch of the super-admin, this can be updated later.",
                            type="info",
                            :closable="false",
                          )
                .level-right
                  .level-item
                    button.button.is-primary(@click="addBranch")
                      b-icon(icon="add")
                      span Add Branch
              el-table(
                ref="branches",
                :data="signUpInformation.branches",
                :height="250",
                :border="false"
                :stripe="false"
              )
                el-table-column(type="selection")
                el-table-column(label="S/N", type="index", :index="1" width="50", fixed="left")
                el-table-column(prop="Name", show-overflow-tooltip, label="Name", width="150", align="left")
                  template(slot-scope="slot")
                    el-input(
                      clearable,
                      size="small", 
                      v-model="slot.row.name", 
                      @change="() => $v.signUpInformation.branches.$each[slot.$index].name.$touch()",
                      :class="{ 'is-error': $v.signUpInformation.branches.$each[slot.$index].name.$error }",
                      placeholder="Name"
                    )
                el-table-column(label="Email", width="150")
                  template(slot-scope="slot")
                    el-input(
                      clearable,
                      size="small", 
                      v-model="slot.row.email", 
                      placeholder="Email",
                      @change="() => $v.signUpInformation.branches.$each[slot.$index].email.$touch()",
                      :class="{ 'is-error': $v.signUpInformation.branches.$each[slot.$index].email.$error }",
                    )
                el-table-column(prop="Address", show-overflow-tooltip, label="Address", width="180")
                  template(slot-scope="slot")
                    el-input(
                      clearable,
                      size="small",
                      v-model="slot.row.address",
                      placeholder="Address",
                      @change="() => $v.signUpInformation.branches.$each[slot.$index].address.$touch()",
                      :class="{ 'is-error': $v.signUpInformation.branches.$each[slot.$index].address.$error }",
                    )  
                el-table-column(prop="currency", show-overflow-tooltip, label="curency", width="180")
                  template(slot-scope='slot')                
                    el-select.has-full-width(
                      size="small",
                      v-model="slot.row.currency",
                      :filterable="true",
                      placeholder="select currency",
                      value-key="name"
                      clearable,
                      @change="() => $v.signUpInformation.branches.$each[slot.$index].currency.$touch()",
                      :class="{ 'is-error': $v.signUpInformation.branches.$each[slot.$index].currency.$error }",
                    )
                      el-option(
                        v-for="(currency, key, index) in currencies",
                        :label="currency.name",
                        :value="currency",
                        :key="index",
                      )  
                el-table-column(label="Actions", :render-header="renderDelete", width="70")
                  template(slot-scope="scope")
                    button.button(:class="$style.trash", @click.stop="deleteRow(scope.$index)")
                      span.el-icon-delete.font-size-23  
            el-tab-pane(label="Complete Signup" name="2")
              h4.mt-25(class="title is-5") Payment Plan
              div
                el-radio(v-model="signUpInformation.paymentPlan" label="trial" border) 30 days Trial
                el-radio(v-model="signUpInformation.paymentPlan" label="paid" border) Pay $32,233
            div.processingIndicator(v-loading="processing", v-if="active === 3") 
          .signupBtn
            el-button.previousBtn(
              @click="previous", 
              size="small", 
              icon="el-icon-arrow-left",
              :disabled="active === 0"
            )   
            el-button.nextBtn(
              @click="next", 
              size="small", 
              icon="el-icon-arrow-right",
              :disabled="active === 2"
            )    
            el-button.submitBtn(@click="completeRegistration" size="small") SIGN UP 
          .card-footer
            .card-footer-item
              span 
                router-link(to="/" :style="{ color: '#4a4a4a'}") Login | &nbsp;
              span Forgot password?&nbsp;
              strong
                a Click here to recover 

</template>

<script>
/* eslint-disable */
import { mapActions, mapGetters, mapState } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required, email, minLength, sameAs } from 'vuelidate/lib/validators'
import { isLoggedIn } from '@/utils/helper'
import deleteMixin from '@/mixins/DeleteMixin'
import currencies from '@/data/Common-Currency.json'

export default {
  beforeRouteEnter (to, from, next) {
    if (isLoggedIn()) {
      next({ name: 'new_sale' })
    } else {
      next()
    }
  },
  computed: {
    ...mapGetters('users', [
      'isLoggedIn'
    ]),
    ...mapState('users', [
      'currentUser'
    ])
  },
  mixins: [validationMixin, deleteMixin],
  validations: {
    signUpInformation: {
      user: { 
        email: {
          required,
          email
        },
        full_name: { required },
        username: { required },
        password: {
          required,
          minLength: minLength(8)
        },
        confirmPassword: {
          required,
          sameAsPassword: sameAs('password') 
        }
      },
      branches: { 
        required,
        minLength: minLength(1),
        $each: {
          name: { required },
          address: { required },
          currency: { required },
          email: {
            required,
            email
          }
        }
      },
      paymentPlan: { required },
      store: {
        name: { required },
        email: {
          required,
          email
        },
        currency: { required }
      }
    }
  },
  data () {
    return {
      processing: false,
      displayError: false,
      errorMessage: '',
      activeTab: '0',
      active: 0,
      currencies,
      signUpInformation: {
        user: {
          email: '',
          password: null,
          full_name: null,
          access_level: 'superadmin',
          status: 'active',
          username: null,
          confirmPassword: null
        },
        branches: [
          {
            name: null,
            email: null,
            address: null,
            currency: null
          }
        ],
        paymentPlan: 'trial',
        store: {
          name: null,
          email: null,
          currency: null,
          // tax: null
        }
      },
      form: {
        username: '',
        password: '',
        signin: 'signin'
      }
    }
  },
  methods: {
    ...mapActions('users', [
      'login',
      'signUp'
    ]),
    completeRegistration () {
      this.$v.signUpInformation.$touch();
      if (!this.$v.$invalid) {
        this.active = 3
        this.activeTab = '3'
        this.processing = true
        this.signUp(this.signUpInformation)
        .then((res) => {
          this.processing = false
          this.$access(res.data.user.access_level)
          if (this.$can('admin|superadmin')) {
            this.$router.push({ name: 'general' })
          } else {
            this.$router.push({ name: 'new_sale' })
          }
          this.$snackbar.open('Signup/Registration complete')
          this.$snackbar.open('Successfully logged you in')
        })
        .catch((err) => {
          console.log(err)
          this.processing = false
          this.$snackbar.open({
            type: 'is-danger',
            message: `An error occured ${err}`
          })
        })
      } else {
        this.$snackbar.open({
          type: 'is-danger',
          message: 'Validation Errors exist!!'
        })
      }
    },
    addBranch () {
      this.signUpInformation.branches.push({})
    },
    next () {
      let activeTab = this.active++
      if (activeTab > 2) this.active = 2
      this.activeTab = String(this.active)
    },
    previous () {
      let activeTab = this.active--
      if (activeTab <= 0) this.active = 0
      this.activeTab = String(this.active)
    },
    setActiveTab (tab) {
      this.active = Number(tab.name)
    },
    warnUser (message) {
      return this.$swal({
        title: 'Are you sure?',
        text: message,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      })
    },
    deleteItems () {},
    deleteRow (row) {
      this.warnUser('Delete branch ?')
        .then((res) => {
          if (res.value) {
            if (this.signUpInformation.branches.length === 1) {
              this.$snackbar.open({
                type: 'is-danger',
                message: 'There must be at least one(1) branch'
              })
              return
            }
            this.signUpInformation.branches.splice(row)
          }
        })
    },
    loginUser () {
      if (!this.$v.$invalid) {
        this.displayError = false
        this.processing = true
        this.login(this.form)
          .then((res) => {
            if (res.data.status === 'Failure') {
              return Promise.reject(new Error(res.data.message))
            }
            this.$access(res.data.user_details[0].access)
            console.log(this.$access())
            this.processing = false
            this.$snackbar.open('Successfully logged you in')
            if (this.$can('admin|super-admin')) {
              this.$router.push({ name: 'dashboard' })
            } else {
              this.$router.push({ name: 'new_sale' })
            }
          })
          .catch((err) => {
            this.processing = false
            this.displayError = true
            this.errorMessage = err.message
          })
      }
    }
  }
}
</script>

<style lang="sass">
.CompanyInfo
  background-image: url('../../../../static/img/patterns.png')
  animation: slow-slide 70s infinite
  animation-timing-function: linear
  overflow-y: scroll !important
  .toolbar
    height: 100px !important
  .processingIndicator
    height: 300px
    width: 100%
  .level-left
    .field-label
      flex-grow: 0 !important
      margin-right: 5px !important
  .signupBtn
    .submitBtn, .nextBtn, .previousBtn
      margin-left: 0px !important
      margin-bottom: 12px
      margin-top: 12px
    .previousBtn
      border-top-right-radius: 0px
      border-bottom-right-radius: 0px  
    .submitBtn
      height: 33px
      border-top-left-radius: 0px
      border-bottom-left-radius: 0px 
    .nextBtn
      border-left: 0px  
      border-right: 0px 
      border-radius: 0px
    margin-left: 35px  
  .is-flex
    display: block !important
  .el-steps--horizontal
    padding: 30px 35px 0px 35px
  .el-tabs__header
    // margin-bottom: 40px !important
    margin-bottom: 1px !important
    margin-top: 10px !important
  .el-tabs
    padding-left: 35px
    padding-right: 35px
    padding-top: 0px
  .el-tab-pane
    padding: 0rem !important
  .el-tabs__content 
    min-height: 300px !important 
  display: flex
  flex-direction: column
  height: 100%
  background-color: white
  justify-content: center
  .label
    font-weight: 700
  .is-padded
    height: 3rem
    margin-top: 1rem
  .card-header-title
    padding: 2.5em 3em
    img
      width: 15em
  .card-content
    padding: 3em
  .card-footer-item
    padding: 1.2rem
</style>

<style lang="sass" module>
.columns
  margin: 0px 50px
.trash
  border: none
  background: transparent
</style>