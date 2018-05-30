import { PROGRESS } from '../utils/constants'
const SalesManagement = () => import('@/components/Sales/SalesManagement')
const SalesList = () => import('@/components/sales/SalesList')
const ReceiptsList = () => import('@/components/sales/ReceiptsList')
const RefundsList = () => import('@/components/sales/RefundsList')
const ProductEnquiriesList = () => import('@/components/products/enquiries/EnquiriesList')

export default {
  path: 'sales',
  component: SalesManagement,
  children: [
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
      path: 'receipts',
      name: 'receipts_list',
      component: ReceiptsList,
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
