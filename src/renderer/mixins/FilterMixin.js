import { ObjectToFormData } from '@/utils/helper'
import _ from 'lodash'
/* eslint-disable */
export default {

  data () {
    return {
      displaySearchFilters: false,
      filteredItems: {
        data: [],
        meta: {
          nextPage: true
        }
      },
      filter: {
        limit: 7,
        page: 1,
        persist: true
      },
      loading: false,
      isSearching: false,
      searchQuery: null
    }
  },

  methods: {

    preloadItemsList () {
      this.loading = true
      this.loadItems(ObjectToFormData(this.filter))
        .then((res) => {
          this.loading = false
          this.setLoadedItems(res)
        })
        .catch(() => {
          this.loading = false
        })
    },

    setLoadedItems (res) {
      if (this.setItems) {
        this.setItems(res)
      }
    },

    getSearchPayload (type) {
      if (type instanceof Object) {
        return type
      }
      return {
        type,
        search: this.searchQuery
      }
    },

    search (type, requestType) {
      if (this.searchQuery) {
        let payload = this.getSearchPayload(type)
        this.isSearching = true
        this.loading = true
        if (requestType === 'POST') {
          payload = { filter: ObjectToFormData(payload) }
        }
        this.searchItems(payload)
          .then(res => {
            if (res instanceof Array) {
              this.filteredItems.data = res;
            } else if (res instanceof Object) {
              this.filteredItems.data = res.message;
            } else {
              this.filteredItems.data = [];
            }
            this.loading = false;
            this.isSearching = false;
          })
          .catch(() => {
            this.isSearching = false;
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
        console.log(atBottom)
        if (atBottom && !this.loading) {
          console.log('in here');
          if (!this.displaySearchFilters && this.items.nextPage) {
            this.loadMore()
          }
          if (this.displaySearchFilters && this.filteredItems.meta.nextPage) {
            console.log('herw 2')
            this.loadMore()
          }
        }
      })
    },

    loadMore () {
      let filter = this.filter
      this.loading = true
      if (this.displaySearchFilters) {
        this.filterParams.page = this.filterParams.page + 1
        filter = { ...this.filter, ...this.filterParams, persist: false }
      } else {
        filter = { ...filter, persist: true }
      }
      this.loadItems(ObjectToFormData(filter))
        .then((res) => {
          this.loading = false
          this.setLoadedItems(res)
          this.appendSearchResults(res)
        })
        .catch(() => {
          this.loading = false
        })
    },

    searchMore () {
      this.loading = true
      this.loadItems({
        filter: ObjectToFormData({
          ...this.filterParams
        }),
        persist: false
      })
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
      this.filteredItems.data = _.uniqBy(this.filteredItems.data.concat(res.message),'id')
    },

    filterItems () {
      this.displaySearchFilters = true
      this.filterParams.page = 1
      this.filteredItems.meta.nextPage = true
      this.filteredItems.data = []
      this.searchMore()
    },

    pipeThroughfilter (key) {
      this.filteredItems.data = this.filteredItems.data.filter((r) => {
        if (key in r) {
          return String(r[key])
            .toLowerCase()
            .trim()
            .includes(this.filterParams[key])
        }
        return true
      })
    },

    toggleFilteringState () {
      this.displaySearchFilters = !this.displaySearchFilters
      this.$scrollTo(this.$refs['items-table'], 0, {
        container: '.el-table__body-wrapper',
        offset: 20
      })
    }

  },

  computed: {
    filteredItemsData () {
      if (this.displaySearchFilters) {
        return this.filteredItems.data
      }
      if (this.searchQuery) {
        return this.filteredItems.data
      }
      return this.items.data || []
    },
    showLoading () {
      return this.filteredItemsData.length >= this.filter.limit
    }
  }
}
