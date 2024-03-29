import { PROGRESS } from '../utils/constants'
const ReportView = () => import('@/components/Reports/ReportView')

export default {
  path: 'reports',
  name: 'reports',
  component: ReportView,
  meta: {
    permission: 'admin|superadmin|clerk',
    fail: '/app/new-sale',
    requiresAuth: true,
    progress: PROGRESS
  }
}
