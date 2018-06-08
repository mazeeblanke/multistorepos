<template lang="pug">
  div(v-loading="loading", :style="{'min-height': '600px'}")
    div.appView(v-if="!loading")
      div
        h4.title.is-4.mt-30.mb-50 Profile settings
        div(class="store-logo")
          // avatar(:fullname="storeSettings.store.name", :size="120", :image='avatarUrl', v-loading="uploadingAvatar")
          avatar(:fullname="settings.loggedInUser.full_name", :size="120", :image="settings.loggedInUser.gravatar" v-loading="uploadingAvatar")
        .columns.mt-50
          .column.is-6
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Fullname
              .field-body
                .field
                  el-input(
                    clearable,
                    size="small",
                    v-model="user.full_name",
                    placeholder="Enter full name",
                    @change="() => $v.user.full_name.$touch()",
                    :class="{ 'is-error': $v.user.full_name.$error }",
                  )
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Username
              .field-body
                .field
                  el-input(
                    clearable,
                    size="small",
                    v-model="user.username",
                    placeholder="Enter username",
                    @change="() => $v.user.username.$touch()",
                    :class="{ 'is-error': $v.user.username.$error }",
                  )
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Email
              .field-body
                .field
                  el-input(
                    clearable,
                    size="small",
                    v-model="user.email",
                    placeholder="Enter User email",
                    @change="() => $v.user.email.$touch()",
                    :class="{ 'is-error': $v.user.email.$error }",
                  )      
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Store
              .field-body
                .field
                  el-input(
                    size="small",
                    :value="settings.store.name",
                    disabled
                  )      
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Branch
              .field-body
                .field
                  el-input(
                    size="small",
                    :value="settings.branch.name",
                    disabled
                  )
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Password
              .field-body
                .field
                  el-input(
                    clearable,
                    size="small",
                    v-model="user.password",
                    placeholder="Enter User Password",
                    @change="() => $v.user.password.$touch()",
                    :class="{ 'is-error': $v.user.password.$error }",
                  )      
            .field.is-horizontal.mb-30
              .field-label.has-text-left.is-v-centered
                label.label.has-text-weight-normal.font-size-13 Confirm Password
              .field-body
                .field
                  el-input(
                    clearable,
                    size="small",
                    v-model="user.confirmPassword",
                    placeholder="Enter user name",
                    @change="() => $v.user.confirmPassword.$touch()",
                    :class="{ 'is-error': $v.user.confirmPassword.$error }",
                  )
    button.button.is-primary(
      v-if="!this.loading"
      :class="{'is-loading': processing}",
      @click="submit()",
      :disabled="!shouldSaveChanges || processing"
    )
      span Save changes        
</template>

<script>
  /* eslint-disable */
  import { mapState, mapActions, mapMutations } from 'vuex'
  import Avatar from 'vue-avatar-component'
  import { validationMixin } from 'vuelidate'
  import { required, email, sameAs, minLength } from 'vuelidate/lib/validators'
  import _ from 'lodash'

  export default {

    mounted () {
      this.setUserProfile()
    },

    data () {
      return {
        user: {
          full_name: null,
          email: null,
          username: null,
          password: null,
          confirmPassword: null
        },
        loading: false,
        processing: false,
        uploadingAvatar: false
      }
    },

    mixins: [
      validationMixin
    ],

    methods: {

      ...mapMutations('settings', ['SET_STORE_SETTINGS']),

      ...mapActions('employees', ['updateEmployee']),

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

      setUserProfile () {
        const { 
          full_name,
          email,
          id,
          username 
        } = this.settings.loggedInUser

        this.user = {
          full_name,
          email,
          id,
          username,
          password: null,
          confirmPassword: null
        }
      },

      submit () {
        this.$v.user.$touch()
        if (!this.$v.invalid) {
          this.processing = true
          this.updateEmployee(this.user)
          .then((res) => {
            this.processing = false
            const { branch, store, loggedInUser } = this.settings
            this.SET_STORE_SETTINGS({
              branch,
              store,
              loggedInUser: {
                ...loggedInUser,
                ...res.data
              }
            })
            this.setUserProfile()
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
            message: 'Fixed Valiation errors'
          })
        }
      }
    },

    validations: {
      user: {
        full_name: { required },
        username: { required },
        email: {
          required,
          email
        },
        password: {
          minLength: minLength(8)
        },
        confirmPassword: {
          sameAsPassword: sameAs('password') 
        }
      }
    },

    computed: {

      ...mapState('settings', ['settings']),

      shouldSaveChanges () {
        const loggedInUser = this.settings.loggedInUser

        const A = {
          full_name: loggedInUser.full_name,
          username: loggedInUser.username,
          email: loggedInUser.email
        }

        const B = {
          full_name: this.user.full_name,
          username: this.user.username,
          email: this.user.email
        }

        return !_.isEqual(A, B) || this.user.password
      }

    },

    components: {
      Avatar
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

<style lang="sass">
  
</style>

<style lang="sass" scoped>
  .store-logo
    // display: flex
    // flex-direction: column
    // align-content: center
    // align-items: center
  .avatar
    background-color: rgb(5, 41, 107) !important
</style>
