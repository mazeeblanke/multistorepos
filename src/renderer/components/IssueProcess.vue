<template lang="pug">
  div
    .card#select-vendors(v-if="selectVendors && !isIssuingRfp")
      .content-container 
        Multiselect(
            v-model="vendorsToIssueRfp",
            :options="vendors",
            :multiple="true",
            :close-on-select="false",
            :clear-on-select="false",
            :hide-selected="false",
            :preserve-search="true",
            placeholder="Select vendors...",
            track-by="name",
            label="name",
        )
        template(slot="tag", scope="props")
          span.custom__tag
            span {{ props.option.name }}
            span.custom__remove(@click="props.remove(props.option)") ❌
        p.field.is-centered
          button.button.is-primary.mt-25(:disabled="!vendorsToIssueRfp.length" @click="showIssueForm")
            span Next
            span.icon
              i.material-icons arrow_right
    .card#issue-form(v-if="issueForm || isIssuingRfp")
      .content-container
        .field.is-horizontal.mt-10
          .field-label.is-normal
            .label From
          .field-body
            .field
              p.control
                Multiselect(
                    v-model="vendorsEmail",
                    :disabled="true",
                    :options="vendorsEmailOptions",
                    :multiple="false",
                    :close-on-select="false",
                    :clear-on-select="false",
                    :hide-selected="false",
                    :preserve-search="true",
                    placeholder="Select vendors...",
                    track-by="name",
                    label="name",
                )
                template(slot="tag", scope="props")
                  span.custom__tag
                    span {{ props.option.name }}
                    span.custom__remove(@click="props.remove(props.option)") ❌
              //-  input.input(type="email" value="me@example.com" disabled)
        .field.is-horizontal.mt-10
          .label.mr-5 Subject
          .control.has-full-width
            input.input(v-if="selectedRequisition.requisitionType === 'RFP'", v-model="RFPSubject" type="text" disabled)
            input.input(v-else, v-model="RFQSubject", type="text" disabled)
        .field.is-horizontal.mt-10
          .field-label.is-normal
            .label To
          .field-body
            .field
              p.control
                Multiselect(
                    v-model="vendorsEmail",
                    :disabled="true",
                    :options="vendorsEmailOptions",
                    :multiple="true",
                    :close-on-select="false",
                    :clear-on-select="false",
                    :hide-selected="false",
                    :preserve-search="true",
                    placeholder="Select vendors to send RFP",
                    track-by="name",
                    label="name",
                )
                template(slot="tag", scope="props")
                  span.custom__tag
                    span {{ props.option.name }}
                    span.custom__remove(@click="props.remove(props.option)") ❌
        .field.is-horizontal.mt-10
          .field-label.is-normal
            .label CC
          .field-body
            .field
              p.control
                Multiselect(
                    v-model="approvalUsers",
                    :disabled="true",
                    :options="approvalUsersOptions",
                    :multiple="true",
                    :close-on-select="false",
                    :clear-on-select="false",
                    :hide-selected="false",
                    :preserve-search="true",
                    placeholder="Select vendors...",
                    track-by="name",
                    label="name",
                  )
                template(slot="tag", scope="props")
                  span.custom__tag
                    span {{ props.option.name }}
                    span.custom__remove(@click="props.remove(props.option)") ❌
        .field.is-horizontal.mt-10
          .field-label.is-normal
            .label
          .field-body
            b-field
              b-input(type="textarea"
                  minlength="10"
                  :disabled="isIssuingRfp"
                  maxlength="600"
                  v-model="additionalMessage"
                  placeholder="Additional Message")
        p.field.is-h-centered.mt-25
          button.button.is-primary.mr-15(@click="showSelectVendors" :disabled="isIssuingRfp")
            span.icon
              i.material-icons arrow_left
            span Back
          button.button.is-primary(@click="issueRfp" :class="{ 'is-loading' : isIssuingRfp  }")
            span Issue RFP
</template>

<script>
import Multiselect from 'vue-multiselect'
// import FullscreenDialog from '@/components/shared/FullscreenDialog';

export default {
  data () {
    return {
      selectVendors: true,
      isIssuingRfp: false,
      vendorsToIssueRfp: [],
      issueForm: false,
      issueRfpModalActive: false,
      RFPSubject: 'Request for Proposal',
      RFQSubject: 'Request for Quotation',
      approvalUsersOptions: [{ name: 'John smith' }, { name: 'Brandon soto' }],
      approvalUsers: [{ name: 'John smith' }, { name: 'Brandon soto' }],
      additionalMessage: '',
      vendorsEmail: [
        { name: 'ewomaukah@yahoo.com' },
        { name: 'john@outlook.com' },
        { name: 'boola@gmail.com' }
      ],
      vendorsEmailOptions: [
        { name: 'ewomaukah@yahoo.com' },
        { name: 'john@outlook.com' },
        { name: 'boola@gmail.com' }
      ],
      vendors: [
        {
          id: 1,
          vendorName: 'Slot',
          justification: '',
          rank: [0, 0, 0, 0, 0],
          rankTotal: 0
        },
        {
          id: 2,
          vendorName: 'Micro-station',
          justification: '',
          rank: [0, 0, 0, 0, 0],
          rankTotal: 0
        },
        {
          id: 3,
          vendorName: 'Konga',
          justification: '',
          rank: [0, 0, 0, 0, 0],
          rankTotal: 0
        },
        {
          id: 4,
          vendorName: 'Jumia',
          justification: '',
          rank: [0, 0, 0, 0, 0],
          rankTotal: 0
        }
      ]
    }
  },
  methods: {
    // showIssueRfpModal() {
    //   this.issueRfshowIssueRfpModalpModalActive = true;
    // },
    showIssueRfpModal () {
      this.issueRfpModalActive = true
    },
    showIssueForm () {
      this.selectVendors = false
      this.issueForm = true
    },
    showSelectVendors () {
      this.selectVendors = true
      this.issueForm = false
    },
    issueRfp () {
      this.isIssuingRfp = true
    }
  },
  components: {
    Multiselect
  }
}
</script>

<style lang="sass" scoped>

</style>
