<template lang="pug">
  .VendorsListFilter.filters-section
    .columns
      .column
        h5.title.is-6.has-text-centered Vendor Data
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Vendor ID number
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.id",
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.id")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.id",
                @click="removeFilter('id')"
              )
                b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Vendor's Name
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.name", 
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.name")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.name",
                @click="removeFilter('name')"
              )
                b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Qual Date
          b-field
            p.control.is-expanded
              input.input(

                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Vendor's TAX Code
          b-field
            p.control.is-expanded
              input.input(
               
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Vendor's Contact
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.contactName",
                
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.contactName")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.contactName",
                @click="removeFilter('contactName')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left ISO Certification No
          b-field
            p.control.is-expanded
              input.input(
               
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
      .column
        h5.title.is-6.has-text-centered Personal Info
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Phone Number
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.contactPhone",
               
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.contactPhone")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.contactPhone",
                @click="removeFilter('contactPhone')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left eMail
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.contactEmail"
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.contactEmail")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.contactEmail",
                @click="removeFilter('contactEmail')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Website
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.vendor",
               
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Vendor's contact
          b-field
            p.control.is-expanded
              input.input(
               
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Vendor type
          b-field
            b-select.vendorType(
              v-model.trim="filterParams.vendorType",
              @input="notifyFilterChange()"
            )
              option(value="Catalogued") Catalogued
              option(value="Non catalogued") non catalogued
            //- p.control
            //-   button.button(v-if="!filterParams")
            //-     b-icon(icon="filter_list")
            //-   button.button(
            //-     v-if="filterParams",
            //-     @click="removeFilter('')"
            //-   )
            //-     b-icon(icon="clear" type="is-info")  
      .column
        h5.title.is-6.has-text-centered ZIP
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Region
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.vendor",
              
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Country
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.country",
               
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.country")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.country",
                @click="removeFilter('country')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Continent
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.vendor",
               
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Phone Number
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.vendor",
              
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Fax Number
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.vendor",
               
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left State
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.state",
               
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.state")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.state",
                @click="removeFilter('state')"
              )      
                 b-icon(icon="clear" type="is-info")
      .column
        h5.title.is-6.has-text-centered Transaction volume and data
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Weekly Qty
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.vendor",
              
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Weekly Value
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.vendor",
              
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Monthly Qty
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.vendor",
               
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Monthly Value
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.vendor",
               
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Annual Qty
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.vendor",
              
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
        .field.is-horizontal
          .field-label.is-normal
            label.label.has-text-left Annual Value
          b-field
            p.control.is-expanded
              input.input(
                v-model.trim="filterParams.vendor",
               
                @input="notifyFilterChange"
              )
            p.control
              button.button(v-if="!filterParams.vendor")
                b-icon(icon="filter_list")
              button.button(
                v-if="filterParams.vendor",
                @click="removeFilter('vendor')"
              )
                 b-icon(icon="clear" type="is-info")
</template>

<script>
import _ from 'lodash'
import { mapState, mapActions } from 'vuex'

import SelectMultiple from '@/components/SelectMultiple'

export default {
  props: {
    filterParams: Object
  },
  // mounted() {
  //   this.loadCommodities();
  // },
  methods: {
    ...mapActions('commodities', [
      'loadCommodities'
    ]),
    removeFilter (name) {
      _.set(this.filterParams, name, null)
      this.notifyFilterChange()
    },
    notifyFilterChange () {
      this.$emit('update:filterParams', this.filterParams)
      this.$emit('change')
    }
  },
  computed: {
    ...mapState('commodities', [
      'commodities'
    ])
  },
  components: {
    SelectMultiple
  }
}
</script>

<style lang="sass">
.vendorType
  select, .select
    width: 195px
</style>
