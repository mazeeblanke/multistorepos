import ListFilter from '@/components/Shared/ListFilter'

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
  },

  methods: {
    showContextMenu () {
      this.$electron.ipcRenderer.send('contextmenu')
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
