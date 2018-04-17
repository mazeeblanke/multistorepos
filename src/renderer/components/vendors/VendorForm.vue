<template lang="pug">
  .RequisitionCreate
    .level.toolbar
      .level-left
        .level-item
          router-link.button(:to="{name: 'vendors_list'}")
            span.icon.is-medium
              i.material-icons keyboard_arrow_left
        .level-item
          .page-title.subtitle.is-5.tag {{ this.id ? 'Edit Vendor' : 'New Vendor' }}
      .level-right
        .level-item
          button.button.is-primary(
            :class="{'is-loading': processing}",
            :disabled="processing || $v.$invalid",
            @click="submit()"
          )
            span.icon
              i.material-icons check
            span {{ this.id ? 'Save Vendor Information' : 'Create Vendor' }}
        .level-item
          button.button(@click="cancelVendorReg")
            span.icon
              i.material-icons close
            span Cancel
    el-tabs(type="card", value="general_information", @tab-click="setTabIndex", ref="tabs")
      el-tab-pane(name="general_information", label='General information')
        step1
      el-tab-pane.p-0(name="Financial_information", label="Financial information")  
        step2
      el-tab-pane.p-0(name="Technical_capability", label="Technical Capability")  
        step3  
      el-tab-pane.p-0(name="Experience", label="Experience")  
        step4
      button.button.is-primary.is-pulled-left.is-medium.mb-25.mt-30.ml-15(@click="previousTab", :disabled="this.tabIndex == 0") 
        span.icon
          i.material-icons navigate_before
        span Back  
      button.button.is-primary.is-pulled-right.is-medium.mb-25.mt-30.mr-15(@click="nextTab", :disabled="disableNextButton") 
        span Next
        span.icon
          i.material-icons navigate_next             
     
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { validationMixin } from 'vuelidate'
import { required } from 'vuelidate/lib/validators'
import step1 from './VendorRegistration/Step1'
import step2 from './VendorRegistration/Step2'
import step3 from './VendorRegistration/Step3'
import step4 from './VendorRegistration/Step4'

// import SelectMultiple from '@/components/SelectMultiple';
/* eslint-disable */
export default {
  mixins: [validationMixin],
  props: ['id'],
  data() {
    return {
      processing: false,
      tabIndex: 0,
    };
  },
  validations: {
    vendor: {
      name: { required },
      contactEmail: { required },
      contactName: { required },
    },
  },
  mounted() {},
  methods: {
    ...mapActions('commodities', [
      'loadCommodities',
    ]),
    ...mapActions('vendors', [
      'createVendor',
      'editVendor',
      'loadVendor',
      'resetNewVendor',
    ]),
    nextTab() {
      const tabPanes = this.$refs.tabs.panes;
      if (this.tabIndex < tabPanes.length) {
        this.tabIndex++;
        this.$refs.tabs.currentName = tabPanes[this.tabIndex].paneName;
      }
    },
    previousTab() {
      const tabPanes = this.$refs.tabs.panes;
      if (this.tabIndex <= tabPanes.length && this.tabIndex >= 0) {
        this.tabIndex--;
        this.$refs.tabs.currentName = tabPanes[this.tabIndex].paneName;
      }
    },
    setTabIndex(tab) {
      this.tabIndex = parseInt(tab.index);
    },
    cancelVendorReg() {
      this.resetNewVendor();
      this.$router.push({
        name: 'vendors_list'
      });
    },
    submit() {
      if (!this.$v.$invalid) {
        this.processing = true;
        const doAction = this.id ? this.editVendor : this.createVendor;
        doAction(this.vendor)
        .then(() => {
          const message = this.id ? 'Vendor edited successfully' : 'Vendor created successfully';
          this.$snackbar.open(message);
          if (this.id) {
            this.$router.push({ name: 'vendor_view', params: { id: this.id } });
          } else {
            this.$router.push({ name: 'vendors_list' });
          }
        }).catch((err) => {
          this.processing = false;
          let errorMessage;
          if (err.response.data instanceof Array) {
            errorMessage = err.response.data.map(e => e.msg).join('. ');
          } else {
            errorMessage = err.response.data.msg;
          }
          this.$snackbar.open({
            type: 'is-danger',
            message: errorMessage,
          });
        });
      }
    },
  },
  computed: {
    ...mapState('commodities', [
      'commodities',
    ]),
    ...mapState('vendors', [
      'selectedVendor',
    ]),
    ...mapState('vendors', ['newVendor']),
    vendor: {
      set(value) { console.log(value); },
      get() { return this.newVendor; },
    },
    disableNextButton() {
      // if (this.$refs.tabs) {
        return this.tabIndex === 3;
      // }
      // return this.$refs;
    }, 
  },
  components: {
    // SelectMultiple,
    step1,
    step2,
    step3,
    step4,
  },
};
</script>

<style lang="sass">
  .VendorForm
    padding: 2rem
    .el-select
      width: 100% !important
</style>
