<template lang="pug">
  .Auth
    .container
      .columns
        .column.is-half.is-offset-one-quarter
          .card
            header.card-header
              p.card-header-title
                //- img(src="../assets/img/logo-inverted.png", alt="OAS logo")
                //- <h4>POS</h4>
            .card-content
              b-notification(type="is-danger", :active.sync="displayError") There was an error while trying to log you in: {{ errorMessage }}
              form(@submit.prevent="loginUser")
                b-field(label="Username")
                  b-input(

                    v-model="form.username",
                    required
                  )
                b-field(label="Password")
                  b-input(
                    type="password",
                    v-model="form.password",
                    password-reveal="",
                    required
                  )
                b-field
                  p.control.is-expanded
                    button.button.is-primary.is-padded.is-fullwidth(
                      type="submit",
                      :class="{'is-loading': processing}",
                      :disabled="processing || $v.$invalid"
                    ) Login
            .card-footer
              .card-footer-item
                | Forgot password?&nbsp;
                strong
                  a Click here to recover
</template>

<script>

import { mapActions, mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'
// import { username, required } from 'vuelidate/lib/validators';
// import { ObjectToFormData } from '@/utils/helper'

export default {
  mixins: [validationMixin],
  computed: {
    ...mapGetters('users', [
      'isLoggedIn'
    ])
  },
  data () {
    return {
      processing: false,
      displayError: false,
      errorMessage: '',
      form: {
        username: '',
        password: '',
        signin: 'signin'
      }
    }
  },
  validations: {
    // form: {
    //   username: { username, required },
    //   password: { required },
    //   signin: 'signin',
    // },
  },
  methods: {
    ...mapActions('users', [
      'login'
    ]),
    loginUser () {
      if (!this.$v.$invalid) {
        this.displayError = false
        this.processing = true
        this.login(this.form)
          .then((res) => {
            if (res.data.status === 'Failure') {
              return Promise.reject(new Error(res.data.message))
            }
            this.access = res.data.user_details[0].access
            this.processing = false
            this.$snackbar.open('Successfully logged you in')
            this.$router.push({
              name: 'dashboard'
            })
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
  .Auth
    display: flex
    flex-direction: column
    height: 100%
    background-color: whitesmoke
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
