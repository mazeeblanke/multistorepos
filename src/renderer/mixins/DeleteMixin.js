export default {
  data () {
    return {
      selectedItems: []
    }
  },
  computed: {
    hasSelectedItems () {
      return this.selectedItems.length
    }
  },
  methods: {
    renderDelete (h) {
      return h(
        'button',
        {
          attrs: {
            disabled: !this.hasSelectedItems
          },
          on: {
            click: this.deleteItems
          },
          class: 'button',
          style: 'background: transparent; border: none'
        },
        [h('i', { class: 'material-icons' }, 'delete')]
      )
    },
    handleSelectionChange (val) {
      this.selectedItems = val
      this.$emit('selected-item')
    },
    doNothing (e) {
      console.log(e.preventDefault())
    }
  }
}
