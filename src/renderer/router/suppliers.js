import { PROGRESS } from '../utils/constants'
const SuppliersManagement = () => import('@/components/suppliers/SuppliersManagement')
const SuppliersList = () => import('@/components/suppliers/SuppliersList')
const SupplierView = () => import('@/components/suppliers/SupplierView')

export default {
  path: 'suppliers',
  component: SuppliersManagement,
  children: [
    {
      path: 'suppliers-list',
      name: 'suppliers_list',
      component: SuppliersList,
      meta: {
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: ':id',
      name: 'supplier_view',
      component: SupplierView,
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
