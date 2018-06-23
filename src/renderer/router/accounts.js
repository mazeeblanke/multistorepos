import { PROGRESS } from '../utils/constants'
const AccountsManagement = () => import('@/components/accounts/AccountsManagement')
const ExpendituresList = () => import('@/components/accounts/ExpendituresList')
const OpeningCashList = () => import('@/components/accounts/OpeningCashList')
const BankingCashList = () => import('@/components/accounts/BankingCashList')
const Report = () => import('@/components/accounts/Report')
const AnnualReport = () => import('@/components/accounts/AnnualReport')

export default {
  path: 'accounts',
  component: AccountsManagement,
  children: [
    {
      path: 'expenditures-list',
      name: 'expenditures_list',
      component: ExpendituresList,
      meta: {
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: 'opening-cash-list',
      name: 'opening_cash_list',
      component: OpeningCashList,
      meta: {
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: 'banking-cash-list',
      name: 'banking_cash_list',
      component: BankingCashList,
      meta: {
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: 'profit-loss-report',
      name: 'profit_loss_report',
      component: Report,
      meta: {
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: 'annual-report',
      name: 'annual_report',
      component: AnnualReport,
      meta: {
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    }
  ],
  meta: {
    progress: PROGRESS
  }
}
