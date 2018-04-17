<template lang="pug">
  div.mt-25                                   
      button.button.is-primary.ml-25(@click="addReference")
        span.icon
          i.material-icons add
        span Add Reference           
      el-table(
        ref="pricing-table",
        :data="newVendor.servicesRendered",
        max-height="250"
        :highlight-current-row="true",
        empty-text="No Reference added yet",
        @selection-change="handleSelectionChange",
        :stripe="true",
        )
          div(slot="empty")   
            //- EmptyState(empty-text="Add Reference")
            button.button.is-primary(@click="addReference")
              span.icon
                i.material-icons add
              span Add Reference 
          el-table-column(type="selection") 
          el-table-column(type="index", :index="1", label="No")
          el-table-column(prop="nameOfCompany", show-overflow-tooltip, label="Name of company", :sortable="true")
            template(slot-scope="props")
              el-input(
                v-model="newVendor.servicesRendered[props.$index].name",
                type='text',
                placeholder="e.g lukhamventures",
              )
          el-table-column(prop="address", show-overflow-tooltip, label="Address", :sortable="true")
            template(slot-scope="props")
              el-input(
                v-model="newVendor.servicesRendered[props.$index].address",
                type='text',
                placeholder="e.g no 91 olonode street",
              )
          el-table-column(prop="phone", show-overflow-tooltip, label="Phone", :sortable="true")   
            template(slot-scope="props")
              el-input(
                v-model="newVendor.servicesRendered[props.$index].phone",
                type='text',
                placeholder="e.g 08034953322",
              ) 
          el-table-column(prop="fax", show-overflow-tooltip, label="Fax", :sortable="true") 
            template(slot-scope="props")
              el-input(
                v-model="newVendor.servicesRendered[props.$index].fax",
                type='text',
                placeholder="e.g +44 161 999 8888 ",
              )
          el-table-column(label="Delete", :render-header="renderDelete",  width="80")
            template(slot-scope="scope", scope="props")
              button.button.trash(:class="$style.trash" @click="deleteItem([props.row])")
                i.material-icons delete                
</template>

<script>
import { mapState, mapActions } from 'vuex'
import deleteMixin from '@/mixins/DeleteMixin'
import EmptyState from '@/components/EmptyState'

export default {
  computed: {
    ...mapState('vendors', ['newVendor'])
  },
  methods: {
    ...mapActions('vendors', ['addReference', 'clearReferences']),
    warnUser () {
      return this.$swal({
        title: 'Are you sure?',
        text: 'Do you want to remove selected file(s) ?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      })
    },
    deleteItem (item) {
      this.deleteItems(item)
    },
    deleteItems (item = null) {
      const itemsToDelete = (item instanceof Array && item) || this.selectedItems
      this.warnUser().then(() => {
        this.clearReferences(itemsToDelete)
        this.$snackbar.open('sucessfully removed file(s)!')
      })
    }
  },
  components: {
    EmptyState
  },
  mixins: [deleteMixin]
}
</script>

<style lang="sass" module>
.columns
  margin: 0px 50px
.trash
  border: none
  background: transparent
</style>
