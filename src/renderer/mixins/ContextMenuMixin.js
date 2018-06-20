import ListFilter from '@/components/shared/ListFilter'

export default {

  data () {
    return {
      defaultSearchKey: 'name'
    }
  },

  components: {
    ListFilter
  },

  mounted () {
    this.$electron.ipcRenderer.on(
      'advancedSearch',
      () => this.handleAdvancedSearchToggle()
    )

    this.$electron.ipcRenderer.on(
      'exportListToCsv',
      () => this.exportListToCsv()
    )
  },

  methods: {
    showContextMenu () {
      this.$electron.ipcRenderer.send('contextmenu')
    },

    exportListToCsv () {
      if (this.$refs.export) {
        this.$refs.export.$el.click()
      }
    },

    handleAdvancedSearchToggle () {
      this.displaySearchFilters = !this.displaySearchFilters
      this.filter = {
        ...this.filter,
        ...{
          [this.defaultSearchKey]: null
        }
      }
    }
  }

}
