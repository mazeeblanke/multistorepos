import { PROGRESS } from '../utils/constants'
const NewSale = () => import('@/components/Sales/NewSale')

export default {
  path: 'new-sale',
  name: 'new_sale',
  component: NewSale,
  meta: {
    progress: PROGRESS,
    requiresAuth: true,
    permission: 'clerk|admin|superadmin',
    fail: '/app/new-sale'
  }
}
