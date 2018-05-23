<template lang="pug">
.Auth
  .container
    .columns
      .column.is-half.is-offset-one-quarter
        .card
          header.card-header
            p.card-header-title
              img(
                src="../assets/img/logo-inverted.png", 
                alt="OAS logo"
              )
            i.material-icons.security security  
          .card-content
            b-notification(
              type="is-danger",
              :active.sync="displayError"
            ) There was an error while trying to log you in: {{ errorMessage }}
            form(@submit.prevent="loginUser")
              b-field(label="Email")
                b-input(
                  v-model="form.email",
                  required
                  type="email"
                  @input="clearErrors()"
                )
              p.help.is-danger.mb-10(v-if="") {{ getErrorByField('email').message }} 
              b-field(label="Password")
                b-input(
                  type="password",
                  v-model="form.password",
                  password-reveal="",
                  required
                  @input="clearErrors()"
                )
              p.help.is-danger.mb-10(v-if="") {{ getErrorByField('password').message }}   
              b-field
                p.control.is-expanded
                  button.button.is-primary.is-padded.is-fullwidth(
                    type="submit",
                    :class="{'is-loading': processing}",
                    :disabled="processing || $v.$invalid"
                  ) Login
          .card-footer
            .card-footer-item
              span 
              router-link(to="/signup/company_information" :style="{ color: '#4a4a4a'}") Sign up | &nbsp;
              span Forgot password?&nbsp;
              strong
                a Click here to recover
</template>

<script>
/* eslint-disable */
import { mapActions, mapGetters, mapState } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import { isLoggedIn } from '@/utils/helper'

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
    ]),
  },
  mixins: [validationMixin],
  validations: {
    form: {
      email: { required },
      password: { required },
      signin: { required }
    }
  },
  data () {
    return {
      processing: false,
      displayError: false,
      errorMessage: '',
      errors: [],
      form: {
        email: '',
        password: '',
        signin: 'signin'
      }
    }
  },
  methods: {
    ...mapActions('users', [
      'login'
    ]),
    getErrorByField(field) {
      if (this.errors.length) {
        return this.errors.find(error => error.field === field) || {}
      }
      return {}
    },
    clearErrors() {
      this.errors = []
    },
    loginUser () {
      if (!this.$v.$invalid) {
        this.displayError = false
        this.processing = true
        this.login(this.form)
          .then((res) => {
            this.$access(res.user.access_level)
            this.processing = false
            this.$snackbar.open('Successfully logged you in')
            if (this.$can('admin|superadmin')) {
              this.$router.push({ name: 'dashboard' })
            } else {
              this.$router.push({ name: 'new_sale' })
            }
          })
          .catch((err) => {
            console.log(err)
            console.log(err.response)
            this.processing = false
            this.displayError = true
            this.errorMessage = err.message
            this.errors = err.response.data
          })
      }
    }
  }
}
</script>

<style lang="sass">
.Auth
  background-image: url('../../../static/img/patterns.png')
  animation: slow-slide 70s infinite
  animation-timing-function: linear
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
