import { PROGRESS } from '../utils/constants'
const Dashboard = () => import('@/components/dashboard/Dashboard')

export default {
  path: 'dashboard',
  name: 'dashboard',
  component: Dashboard,
  meta: {
    permission: 'admin|superadmin',
    fail: '/app/new_sale',
    progress: PROGRESS,
    requiresAuth: true
  }
}
