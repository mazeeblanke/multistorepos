<template lang="pug">
  .YourAccount.card
    //- header.card-header
    //-   p.card-header-title Your Store
    .card-content
      .content
        EmptyState(empty-text="Setup your store" v-if="!store", :style="{height: '200px', width: '200px'}")
        div.has-text-centered(v-else)
          avatar(:fullname="store.store", :image="avatarUrl", :size="120")
          div.has-text-centered
            h2.title.is-3.has-text-weight-bold.is-lowercase.m-0.text-header {{ store.store }}
            h5.title.is-5.has-text-weight-normal.is-lowercase.m-0.email {{ store.email }}
            h6.title.is-6.has-text-weight-normal.is-lowercase.m-0 {{ store.address }}      
            h6.title.is-6.has-text-weight-normal.is-lowercase.m-0 {{ store.phone }}      
</template>


<script>
/* eslint-disable */
import { mapActions, mapState, mapMutations } from 'vuex';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';
import { ObjectToFormData, money } from '@/utils/helper';
import EmptyState from '@/components/EmptyState';
import Avatar from 'vue-avatar-component';

export default {
  components: {
    EmptyState,
    Avatar,
  },
  mounted() {
    let storeDetails = null;
    this.loading = true;
    this.getStoreDetails(
      ObjectToFormData({
        getloyaltysetting: 'getloyaltysetting',
      }
    ))
    .then((res) => {
      storeDetails = res.message[0];
      return this.getStoreDetails(
        ObjectToFormData({
          getsetup: 'getsetup',
        }
      ))
    })
    .then((_res) => {
      storeDetails = {
        ...storeDetails,
        ..._res.message[0],
      }
      this.SET_STORE_DETAILS(storeDetails);
      this.loading = false;
    })
  },
  methods: {
    ...mapActions('store', [
      'getStoreDetails',
      'setStoreDetails',
    ]),
    ...mapMutations('store', [
      'SET_STORE_DETAILS',
    ]),
  },
  // watch: {
  //   store(value) {
  //     if (!value) {
  //       this.getStoreDetails();
  //     }
  //   },
  // },
  computed: {
    ...mapState('store', [
      'store',
    ]),
    avatarUrl() {
      return `${baseUrl}/assets/img/logo.jpg?time=${Date.now()}`;
    },
  },
};
</script>

<style lang="sass" scoped>
  .label
    font-size: 15px !important
    text-shadow: 0px 0px black !important
  .field
    font-size: 15px    
</style>

<style lang="sass">
.YourAccount
  .text-header
    text-transform: uppercase !important
    font-size: 20px !important
  .email  
    font-style: italic  
  background: url('../../assets/img/world.png')
  background-size: contain
  background-repeat: no-repeat
  .card-content
    // background: #ffffffba !important
    background: white
  .content table td, .content table th
    border: none !important  
  .content table tr:hover
    background: transparent !important
  .avatar
    background-color: rgb(5, 41, 107) !important  
</style>