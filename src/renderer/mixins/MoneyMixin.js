import { formatMoney } from '@/filters/format'
import { mapState } from 'vuex'

const DEFAULT_CURRENCY = '₦'

export default {
  computed: {
    ...mapState('settings', ['settings']),
    currencySymbol () {
      if (this.settings && this.settings.branch.currency) {
        return this.settings.branch.currency.symbol || DEFAULT_CURRENCY
      }
      return DEFAULT_CURRENCY
    }
  },
  methods: {
    ...{ formatMoney },
    money (amount) {
      return this.formatMoney(
        amount,
        (this.settings && this.settings.branch.currency.symbol) || DEFAULT_CURRENCY)
    }
  }
}
