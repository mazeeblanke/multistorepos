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
        'i',
        {
          attrs: {
            disabled: !this.hasSelectedItems
          },
          on: {
            click: this.deleteItems
          },
          class: 'button',
          style: 'background: transparent; border: none; font-size: 23px; margin-left: -7px'
        },
        [h('i', { class: 'el-icon-delete' })]
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
