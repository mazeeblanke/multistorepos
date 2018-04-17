import { ObjectToFormData } from '@/utils/helper'

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
        page: 1
      },
      loading: false,
      isSearching: false,
      searchQuery: null
    }
  },
  methods: {
    preloadItemsList () {
      // if (this.items.data && this.items.data.length) return;
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
          .then((res) => {
            // console.log(res);
            if (res instanceof Array) {
              this.filteredItems.data = res
            } else if (res instanceof Object) {
              this.filteredItems.data = res.message
              console.log(this.filteredItems.data)
            } else {
              this.filteredItems.data = []
            }
            // this.filteredItems.data = res instanceof Array ? res : [];
            // console.log('wjewkekek');
            // this.SET_FILTERED_ITEMS(this.filterItems.data);
            this.loading = false
            this.isSearching = false
            // return res;
          })
          .catch(() => {
            this.isSearching = false
            this.loading = false
          })
      } else {
        this.isSearching = false
      }
    },
    handleBottomScroll (containerElem = null) {
      // console.log(containerElem);
      const containerElement = containerElem || document.querySelector('.el-table__body-wrapper')
      containerElement.addEventListener('scroll', (e) => {
        const atBottom = e.target.clientHeight === e.target.scrollHeight - e.target.scrollTop
        // console.log(atBottom);
        if (atBottom && !this.loading && this.items.nextPage) {
          if (!this.displaySearchFilters && this.items.nextPage) {
            this.loadMore()
          }
          if (this.displaySearchFilters && this.filteredItems.nextPage) {
            this.loadMore()
          }
        }
      })
    },
    loadMore () {
      let filter = this.filter
      // let persist = true;
      this.loading = true
      if (this.displaySearchFilters) {
        this.filterParams.page = this.filterParams.page + 1
        filter = { ...this.filter, ...this.filterParams }
        // persist = false;
      } else {
        // const page = { page: parseInt(this.items.page, 10) + 1 };
        // filter = { ...filter, ...page };
      }
      this.loadItems(ObjectToFormData(filter))
        .then((res) => {
          this.loading = false
          this.setLoadedItems(res)
          // if (this.displaySearchFilters) {
          //   this.appendLoadedFilteredResults(res);
          // }
        })
        .catch(() => {
          this.loading = false
        })
    },
    searchMore () {
      this.loading = true
      this.loadItems({
        filter: ObjectToFormData({
          // ...this.filter,
          ...this.filterParams
        }),
        persist: false
      })
        .then((res) => {
          this.loading = false
          // console.log(res);
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
      // console.log(res);
      this.filteredItems.data = this.filteredItems.data.concat(res.message)
      // if (this.SET_FILTERED_ITEMS) {
      //   this.SET_FILTERED_ITEMS(this.filterItems.data);
      // }
      // this.filteredItems.meta = res.meta;
      // if (!res.data.length) {
      //   this.filteredItems.meta.nextPage = false;
      // }
      this.processFiltering()
    },
    filterItems () {
      this.filterParams.page = 1
      this.filteredItems.meta.nextPage = true
      this.filteredItems.data = []
      this.processFiltering()
      this.searchMore()
    },
    processFiltering () {
      // Object.keys(this.filterParams).forEach((key) => {
      //   if (this.filterParams[key]) {
      //     this.pipeThroughfilter(key);
      //   }
      // });
      // this.filteredItems.data = _.uniqBy(this.filteredItems.data, f => f.id);
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
      // return this.items;
    },
    showLoading () {
      return this.filteredItemsData.length >= this.filter.limit
    }
  }
}
