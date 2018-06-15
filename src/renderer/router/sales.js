import { PROGRESS } from '../utils/constants'
const SalesManagement = () => import('@/components/Sales/SalesManagement')
const SalesList = () => import('@/components/sales/SalesList')
const SalesView = () => import('@/components/sales/SalesView')
const SaleDetailsList = () => import('@/components/sales/SaleDetailsList')
const RefundsList = () => import('@/components/sales/RefundsList')
const ProductEnquiriesList = () => import('@/components/products/enquiries/EnquiriesList')

export default {
  path: 'sales',
  component: SalesManagement,
  children: [
    {
      path: 'sale_details',
      name: 'sale_details_list',
      component: SaleDetailsList,
      meta: {
        progress: PROGRESS,
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: 'sales',
      name: 'sales_list',
      component: SalesList,
      meta: {
        progress: PROGRESS,
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: 'sale_history/:id',
      name: 'sales_view',
      component: SalesView,
      meta: {
        progress: PROGRESS,
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: 'refunds',
      name: 'refunds_list',
      component: RefundsList,
      meta: {
        progress: PROGRESS,
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: 'product-enquiry-list',
      name: 'product_enquiry_list',
      component: ProductEnquiriesList,
      meta: {
        progress: PROGRESS,
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    }
  ],
  meta: {
    progress: PROGRESS,
    permission: 'admin|superadmin',
    fail: '/app/new-sale'
  }
}
