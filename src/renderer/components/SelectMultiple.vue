<template lang="pug">
  .SelectMultiple
    b-field.is-expanded(
      v-for="(item, index) in selectedItems"
      :key="item.id"
    )
      b-select(
        v-model="selectedItems[index]",
        :placeholder="placeholderText",
        :disabled="!items.length",
        @change="selectItem(index)",
        expanded
      )
        option(v-for="option in items", :value="option.id") {{ renderOption(option) }}
      p.control
        button.button.is-danger(@click="removeItem(index)")
          b-icon(icon="clear")
    button.button(@click="addItem", :disabled="!selectedItems[0]")
      span.icon
        i.material-icons add
      span {{ buttonText }}
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true
    },
    field: String,
    multipleSelectError: String,
    minEntriesError: String,
    placeholderText: {
      type: String,
      default: 'Select Item...'
    },
    buttonText: {
      type: String,
      default: 'Add Item'
    }
  },
  data () {
    return {
      selectedItems: [null]
    }
  },
  methods: {
    addItem () {
      const lastIndex = this.selectedItems.length - 1
      if (this.selectedItems[lastIndex] != null) {
        this.selectedItems.push(null)
      }
      this.$emit('input', this.selectedItems)
    },
    removeItem (index) {
      if (this.selectedItems.length > 1) {
        this.selectedItems.splice(index, 1)
      } else {
        this.$snackbar.open({
          message: this.minEntriesError,
          type: 'is-danger'
        })
      }
      this.$emit('input', this.selectedItems)
    },
    countOccurences (ls, a) {
      return ls.filter(s => s === a).length
    },
    selectItem (index) {
      const selected = this.selectedItems[index]
      if (this.countOccurences(this.selectedItems, selected) > 1) {
        this.$snackbar.open({
          message: this.multipleSelectError,
          type: 'is-danger'
        })
        this.selectedItems[index] = ''
      }
      this.$emit('input', this.selectedItems)
    },
    renderOption (option) {
      return (!(option instanceof String)) ? option.name : option
    }
  }
}
</script>
