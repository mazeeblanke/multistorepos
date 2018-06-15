import _ from 'lodash'
import { mapState } from 'vuex'
/* eslint-disable */
export default {

  data () {
    return {
      displaySearchFilters: false,
      filteredItems: {
        data: []
      },
      filter: {
        limit: 10,
        page: 1,
        persist: true
      },
      loading: false,
      isSearching: false,
      searchQuery: null,
      items: {
        data: []
      },
    }
  },

  mounted () {
    this.filter = {
      ...this.filter,
      branch_id: this.settings.branch.id,
      store_id: this.settings.store.id
    }
  },

  methods: {

    preloadItemsList () {
      this.loading = true
      this.$Progress.start()
      return this.loadItems(this.filter)
        .then((res) => {
          this.loading = false
          this.$Progress.finish()
          // this.setLoadedItems(res)
          return res
        })
        .catch(() => {
          this.loading = false
          this.$Progress.fail()
        })
    },

    setLoadedItems (res) {
      if (this.setItems) {
        this.setItems(res)
      }
    },

    search (key) {
      if (this.filter[key]) {
        this.isSearching = true
        this.loading = true
        let filter = {
          ...this.filter,
          persist: false
        }
        this.searchItems(filter)
          .then(res => {
            this.filteredItems = res
            this.loading = false;
            // this.isSearching = false;
          })
          .catch(() => {
            // this.isSearching = false;
            this.loading = false;
          });
      } else {
        this.isSearching = false
      }
    },

    handleBottomScroll (containerElem = null) {
      const containerElement = containerElem || document.querySelector('.el-table__body-wrapper')
      containerElement.addEventListener('scroll', (e) => {
        const atBottom = e.target.clientHeight === e.target.scrollHeight - e.target.scrollTop

        if (atBottom && !this.loading) {
          if ((this.displaySearchFilters || this.isSearching)) {
            if ((this.filteredItems.lastPage - +this.filteredItems.page) >= 0) {
              this.loadMore()
            }
            return
          }

          if (!this.displaySearchFilters && (this.items.lastPage - +this.items.page) > 0) {
            this.loadMore()
            return
          }
        }
      })
    },

    loadMore () {
      let filter = this.filter
      this.loading = true
      if (this.displaySearchFilters || this.isSearching) {
        filter = { 
          ...this.filter, 
          page: this.filteredItems.page,
          persist: false 
        }
      } else {
        filter = { 
          ...filter, 
          persist: true,
          page: +this.items.page + 1
        }
      }
      console.log(filter)
      this.loadItems(filter)
        .then((res) => {
          this.loading = false
          this.appendSearchResults(res)
        })
        .catch(() => {
          this.loading = false
        })
    },

    appendLoadedFilteredResults (res) {
      this.appendSearchResults(res)
    },

    appendSearchResults (res) {
      if (this.displaySearchFilters || this.isSearching) {
        this.filteredItems = {
          ...res,
          data: _.uniqBy(this.filteredItems.data.concat(res.data),'id'),
          page: +this.filteredItems.page + 1
        }
      } else {
        this.setLoadedItems(res)
      }
    },

    filterItems () {
      this.displaySearchFilters = true
      this.filteredItems.page = 1
      this.filteredItems.data = []
      this.loadMore()
    },

    // pipeThroughfilter (key) {
    //   this.filteredItems.data = this.filteredItems.data.filter((r) => {
    //     if (key in r) {
    //       return String(r[key])
    //         .toLowerCase()
    //         .trim()
    //         .includes(this.filterParams[key])
    //     }
    //     return true
    //   })
    // },

    toggleFilteringState () {
      this.displaySearchFilters = !this.displaySearchFilters
      this.$scrollTo(this.$refs['items-table'], 0, {
        container: '.el-table__body-wrapper',
        offset: 20
      })
    }

  },

  computed: {
    ...mapState('settings', ['settings']),

    filteredItemsData () {
      if (this.displaySearchFilters || this.isSearching) {
        return this.filteredItems.data
      }
      return this.items.data || []
    },

    showLoading () {
      return this.filteredItemsData.length >= this.filter.limit
    }

  }
}
