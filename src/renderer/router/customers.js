import { PROGRESS } from '../utils/constants'
const CustomersManagement = () => import('@/components/customers/CustomersManagement')
const CustomersList = () => import('@/components/customers/CustomersList')
const CustomerView = () => import('@/components/customers/CustomerView')

export default {
  path: 'customers',
  component: CustomersManagement,
  children: [
    {
      path: 'customers-list',
      name: 'customers_list',
      component: CustomersList,
      meta: {
        PROGRESS,
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: ':id',
      name: 'customer_view',
      component: CustomerView,
      props: true,
      meta: {
        PROGRESS,
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
