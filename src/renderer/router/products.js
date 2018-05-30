import { PROGRESS } from '../utils/constants'
const ProductsManagement = () => import('@/components/products/ProductsManagement')
const ProductsList = () => import('@/components/products/ProductsList')
const ProductsTransferList = () => import('@/components/products/ProductsTransferList')
const ProductsHistoryList = () => import('@/components/products/ProductsHistoryList')
const ProductView = () => import('@/components/products/ProductView')
const ProductsTransfer = () => import('@/components/products/ProductsTransfer')
const EnquiryView = () => import('@/components/products/enquiries/EnquiryView')

export default {
  path: 'products',
  component: ProductsManagement,
  children: [
    {
      path: 'products-list',
      name: 'products_list',
      component: ProductsList,
      meta: {
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: 'product-history-list',
      name: 'products_history_list',
      component: ProductsHistoryList,
      meta: {
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: 'products-transfer',
      name: 'products_transfer',
      component: ProductsTransfer,
      meta: {
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: 'products-transfer-list',
      name: 'products_transfer_list',
      component: ProductsTransferList,
      meta: {
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: ':id',
      name: 'product_view',
      component: ProductView,
      props: true,
      meta: {
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: 'enquiries/:id',
      name: 'enquiry_view',
      component: EnquiryView,
      props: true,
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
