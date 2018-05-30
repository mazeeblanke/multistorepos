import { PROGRESS } from '../utils/constants'
const BranchManagement = () => import('@/components/branches/BranchManagement')
const BranchList = () => import('@/components/branches/BranchList')
const BranchView = () => import('@/components/branches/BranchView')

export default {
  path: 'branches',
  component: BranchManagement,
  children: [
    {
      path: 'branches_list',
      name: 'branches_list',
      component: BranchList,
      meta: {
        permission: 'superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: ':id',
      name: 'branch_view',
      component: BranchView,
      props: true,
      meta: {
        permission: 'superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    }
  ],
  meta: {
    permission: 'superadmin',
    fail: '/app/new-sale',
    progress: PROGRESS
  }
}
