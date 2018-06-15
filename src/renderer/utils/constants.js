
import countries from '@/data/countries.json'

export const AUTOSAVE_INTERVAL = 2000

export const NEW_SALE = 'sale_cart'

export const PRODUCTS_API = 'forms/products.php'

export const SALES_API = 'forms/sales.php'

export const SEARCH_API = 'forms/search.php'

export const STORE_SETUP_API = 'forms/setup.php'

export const SUPPLIERS_API = 'forms/suppliers.php'

export const USERS_API = 'forms/users.php'

export const OPENING_CASH_API = 'forms/openingcash.php'

export const BANKING_CASH_API = 'forms/bankingcash.php'

export const EXPENDITURES_API = 'forms/expenditure.php'

export const CUSTOMERS_API = 'forms/customers.php'

export const BRANCHES_API = 'forms/branch.php'

export const DEBOUNCE_INTERVAL = 300

export const INIT_STATE = {
  data: [],
  nextPage: null
}

export const TAXES = [
  {
    type: 'Consumption Tax',
    value: 10
  },
  {
    type: 'Value Added Tax (VAT)',
    value: 5
  },
  {
    type: 'Petroleum Tax',
    value: 15
  },
  {
    type: 'Withholding Tax',
    value: 20
  }
]

export const HTTP_VERBS = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch'
}

export const PERMISSIONS = [
  'clerk',
  'superadmin',
  'admin'
]

export const COLOR_PALETTE = [
  '#05296b',
  '#14056b',
  '#055c6b',
  '#6b4705',
  '#031840',
  '#221702',
  '#020d22',
  '#042053',
  '#14056b',
  '#055c6b',
  '#6b4705',
  '#031840'
]

export const PROGRESS = {
  func: [
    { call: 'color', modifier: 'temp', argument: '#ffb000' },
    { call: 'fail', modifier: 'temp', argument: '#6e0000' },
    { call: 'location', modifier: 'temp', argument: 'top' },
    {
      call: 'transition',
      modifier: 'temp',
      argument: { speed: '1.5s', opacity: '0.9s', termination: 400 }
    }
  ]
}

export const COUNTRIES_OPTIONS = [
  ...countries.map(c => ({
    value: c.name,
    key: c.name
  }))
]
