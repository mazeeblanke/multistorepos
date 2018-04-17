import { formatMoney } from '@/filters/format'
import { mapState } from 'vuex'

const DEFAULT_CURRENCY = '₦'

export default {
  computed: {
    ...mapState('store', ['store']),
    currencySymbol () {
      if (this.store && this.store.currency) {
        return this.store.currency.symbol
      }
      return DEFAULT_CURRENCY
    }
  },
  methods: {
    ...{ formatMoney },
    money (amount) {
      return this.formatMoney(
        amount,
        (this.store && this.store.currency.symbol) || DEFAULT_CURRENCY)
    }
  }
}
