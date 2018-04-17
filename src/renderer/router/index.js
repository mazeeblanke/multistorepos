import Vue from 'vue'
import Router from 'vue-router'

/* eslint-disable  */
const AppBase = resolve => require(['@/components/AppBase'], resolve)
const Auth = resolve => require(['@/components/Auth'], resolve)
const Dashboard = resolve => require(['@/components/dashboard/Dashboard'], resolve)
const SalesManagement = resolve => require(['@/components/Sales/SalesManagement'], resolve)
const NewSale = resolve => require(['@/components/Sales/NewSale'], resolve)
const SalesList = resolve => require(['@/components/sales/SalesList'], resolve)
const ReceiptsList = resolve => require(['@/components/sales/ReceiptsList'], resolve)
const RefundsList = resolve => require(['@/components/sales/RefundsList'], resolve)

const CustomersManagement = resolve =>
  require(['@/components/customers/CustomersManagement'], resolve)
const CustomersList = resolve => require(['@/components/customers/CustomersList'], resolve)
const CustomerView = resolve => require(['@/components/customers/CustomerView'], resolve)

const EmployeesManagement = resolve =>
  require(['@/components/employees/EmployeesManagement'], resolve)
const EmployeesList = resolve => require(['@/components/employees/EmployeesList'], resolve)
const EmployeeView = resolve => require(['@/components/employees/EmployeeView'], resolve)

const BranchManagement = resolve =>
  require(['@/components/branches/BranchManagement'], resolve)
const BranchList = resolve => require(['@/components/branches/BranchList'], resolve)
const BranchView = resolve => require(['@/components/branches/BranchView'], resolve)

const SuppliersManagement = resolve =>
  require(['@/components/suppliers/SuppliersManagement'], resolve)
const SuppliersList = resolve => require(['@/components/suppliers/SuppliersList'], resolve)
const SupplierView = resolve => require(['@/components/suppliers/SupplierView'], resolve)

const AccountsManagement = resolve =>
  require(['@/components/accounts/AccountsManagement'], resolve)
const ExpendituresList = resolve => require(['@/components/accounts/ExpendituresList'], resolve)
const OpeningCashList = resolve => require(['@/components/accounts/OpeningCashList'], resolve)
const BankingCashList = resolve => require(['@/components/accounts/BankingCashList'], resolve)
const Report = resolve => require(['@/components/accounts/Report'], resolve)
// const SupplierView = resolve => require(['@/components/suppliers/SupplierView'], resolve);

// const EmployeesManagement = resolve =>
//   require(['@/components/employees/EmployeesManagement'], resolve);
const ProductEnquiriesList = resolve =>
  require(['@/components/products/enquiries/EnquiriesList'], resolve)
const EnquiryView = resolve => require(['@/components/products/enquiries/EnquiryView'], resolve)

// const ReportsManagement = resolve =>
//   require(['@/components/reports/enquiries/EnquiriesList'], resolve);
const ReportView = resolve => require(['@/components/reports/ReportView'], resolve)

const ProductsManagement = resolve =>
  require(['@/components/products/ProductsManagement'], resolve)
const ProductsList = resolve => require(['@/components/products/ProductsList'], resolve)
const ProductsTransferList = resolve => require(['@/components/products/ProductsTransferList'], resolve)
const ProductsHistoryList = resolve =>
  require(['@/components/products/ProductsHistoryList'], resolve)
const ProductView = resolve => require(['@/components/products/ProductView'], resolve)
const ProductsTransfer = resolve => require(['@/components/products/ProductsTransfer'], resolve)

const Settings = resolve => require(['@/components/settings/Settings'], resolve)
const SettingsView = resolve => require(['@/components/settings/SettingsView'], resolve)
const General = resolve => require(['@/components/settings/General'], resolve)
// const Users = resolve => require(['@/components/settings/Users'], resolve)

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Auth,
      meta: {
        permission: 'clerk|super-admin|admin',
        fail: '/'
      }
    },
    {
      path: '/app',
      component: AppBase,
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: Dashboard,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        },
        {
          path: 'new-sale',
          name: 'new_sale',
          component: NewSale,
          meta: {
            permission: 'clerk|admin|super-admin',
            fail: '/app/new-sale'
          }
        },
        {
          path: 'sales',
          component: SalesManagement,
          children: [
            // {
            //   path: 'new-sale',
            //   name: 'new_sale',
            //   component: NewSale,
            // },
            {
              path: 'sales',
              name: 'sales_list',
              component: SalesList,
              meta: {
                permission: 'admin|super-admin',
                fail: '/app/new-sale'
              }
            },
            {
              path: 'receipts',
              name: 'receipts_list',
              component: ReceiptsList,
              meta: {
                permission: 'admin|super-admin',
                fail: '/app/new-sale'
              }
            },
            {
              path: 'refunds',
              name: 'refunds_list',
              component: RefundsList,
              meta: {
                permission: 'admin|super-admin',
                fail: '/app/new-sale'
              }
            },
            {
              path: 'product-enquiry-list',
              name: 'product_enquiry_list',
              component: ProductEnquiriesList,
              meta: {
                permission: 'admin|super-admin',
                fail: '/app/new-sale'
              }
            }
          ],
      meta: {
        progress: {
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
        },
        permission: 'admin|super-admin',
        fail: '/app/new-sale'
      }
    },
    {
      path: 'customers',
      component: CustomersManagement,
      children: [
        {
          path: 'customers-list',
          name: 'customers_list',
          component: CustomersList,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        },
        {
          path: ':id',
          name: 'customer_view',
          component: CustomerView,
          props: true,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        }
      ],
      meta: {
        // permission: 'clerk',
        // fail: '/app/new-sale',
        progress: {
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
      }
    },
    {
      path: 'reports',
      name: 'reports',
      component: ReportView,
      children: [
        // {
        //   path: 'reports-list',
        //   name: 'reports_list',
        //   component: ReportsView,
        // },
        // {
        //   path: ':id',
        //   name: 'customer_view',
        //   component: CustomerView,
        //   props: true,
        // },
      ],
      meta: {
        permission: 'admin|super-admin|clerk',
        fail: '/app/new-sale',
        progress: {
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
      }
    },
    {
      path: 'employees',
      component: EmployeesManagement,
      children: [
        {
          path: 'employees-list',
          name: 'employees_list',
          component: EmployeesList,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        },
        {
          path: ':id',
          name: 'employee_view',
          component: EmployeeView,
          props: true,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        }
      ],
      meta: {
        // permission: 'clerk',
        // fail: '/app/new-sale',
        progress: {
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
      }
    },
    {
      path: 'branches',
      component: BranchManagement,
      children: [
        {
          path: 'branches_list',
          name: 'branches_list',
          component: BranchList,
          meta: {
            permission: 'super-admin',
            fail: '/app/new-sale'
          }
        },
        {
          path: ':id',
          name: 'branch_view',
          component: BranchView,
          props: true,
          meta: {
            permission: 'super-admin',
            fail: '/app/new-sale'
          }
        }
      ],
      meta: {
        permission: 'super-admin',
        fail: '/app/new-sale',
        progress: {
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
      }
    },
    {
      path: 'accounts',
      component: AccountsManagement,
      children: [
        {
          path: 'expenditures-list',
          name: 'expenditures_list',
          component: ExpendituresList,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        },
        {
          path: 'opening-cash-list',
          name: 'opening_cash_list',
          component: OpeningCashList,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        },
        {
          path: 'banking-cash-list',
          name: 'banking_cash_list',
          component: BankingCashList,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        },
        {
          path: 'profit-loss-report',
          name: 'profit_loss_report',
          component: Report,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        }
        // {
        //   path: ':id',
        //   name: 'employee_view',
        //   component: EmployeeView,
        //   props: true,
        // },
      ],
      meta: {
        // permission: 'clerk',
        // fail: '/app/new-sale',
        progress: {
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
      }
    },
    {
      path: 'suppliers',
      component: SuppliersManagement,
      children: [
        {
          path: 'suppliers-list',
          name: 'suppliers_list',
          component: SuppliersList,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        },
        {
          path: ':id',
          name: 'supplier_view',
          component: SupplierView,
          props: true,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        }
      ],
      meta: {
        // permission: 'clerk',
        // fail: '/app/new-sale',
        progress: {
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
      }
    },
    {
      path: 'products',
      component: ProductsManagement,
      children: [
        {
          path: 'products-list',
          name: 'products_list',
          component: ProductsList,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        },
        {
          path: 'product-history-list',
          name: 'products_history_list',
          component: ProductsHistoryList,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        },
        {
          path: 'products-transfer',
          name: 'products_transfer',
          component: ProductsTransfer,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        },
        {
          path: 'products-transfer-list',
          name: 'products_transfer_list',
          component: ProductsTransferList,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        },
        {
          path: ':id',
          name: 'product_view',
          component: ProductView,
          props: true,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        },
        {
          path: 'enquiries/:id',
          name: 'enquiry_view',
          component: EnquiryView,
          props: true,
          meta: {
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        }
      ],
      meta: {
        // permission: 'clerk',
        // fail: '/app/new-sale',
        progress: {
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
      }
    },
        {
          path: 'settings',
          component: Settings,
          name: 'settings',
          children: [
            {
              path: 'v',
              name: 'SettingsView',
              component: SettingsView,
              meta: {
                permission: 'admin|super-admin',
                fail: '/app/new-sale'
              },
              children: [
                {
                  path: 'general',
                  name: 'general',
                  component: General,
                  meta: {
                    permission: 'admin|super-admin',
                    fail: '/app/new-sale'
                  }
                },
                // {
                //   path: 'users',
                //   name: 'users',
                //   component: Users,
                //   meta: {
                //     permission: 'admin|super-admin',
                //     fail: '/app/new-sale'
                //   }
                // }
              ]
            }
          ],
          meta: {
            progress: {
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
            },
            permission: 'admin|super-admin',
            fail: '/app/new-sale'
          }
        }
      ]
    }
  ]
})
