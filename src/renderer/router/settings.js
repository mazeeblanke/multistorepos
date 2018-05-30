import { PROGRESS } from '../utils/constants'
const SettingsManagement = () => import('@/components/settings/SettingsManagement')
const SettingsView = () => import('@/components/settings/SettingsView')
const General = () => import('@/components/settings/General')

export default {
  path: 'settings',
  component: SettingsManagement,
  name: 'settings',
  children: [
    {
      path: 'v',
      name: 'SettingsView',
      component: SettingsView,
      meta: {
        permission: 'admin|superadmin|clerk',
        fail: '/app/new-sale',
        requiresAuth: true
      },
      children: [
        {
          path: 'general',
          name: 'general',
          component: General,
          meta: {
            permission: 'admin|superadmin|clerk',
            fail: '/app/new-sale',
            requiresAuth: true
          }
        }
      ]
    }
  ],
  meta: {
    progress: PROGRESS,
    permission: 'admin|superadmin|clerk',
    fail: '/app/new-sale',
    requiresAuth: true
  }
}
