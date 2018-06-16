import { PROGRESS } from '../utils/constants'
const SettingsManagement = () => import('@/components/settings/SettingsManagement')
const SettingsView = () => import('@/components/settings/SettingsView')
const General = () => import('@/components/settings/General')
const About = () => import('@/components/settings/About')
const Profile = () => import('@/components/settings/Profile')
const Template = () => import('@/components/settings/Templates')
const PrinterSettings = () => import('@/components/settings/PrinterSettings')

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
        },
        {
          path: 'about',
          name: 'about',
          component: About,
          meta: {
            permission: 'admin|superadmin|clerk',
            fail: '/app/new-sale',
            requiresAuth: true
          }
        },
        {
          path: 'profile',
          name: 'profile',
          component: Profile,
          meta: {
            permission: 'admin|superadmin|clerk',
            fail: '/app/new-sale',
            requiresAuth: true
          }
        },
        {
          path: 'templates',
          name: 'templates',
          component: Template,
          meta: {
            permission: 'admin|superadmin|clerk',
            fail: '/app/new-sale',
            requiresAuth: true
          }
        },
        {
          path: 'printer_settings',
          name: 'printer_settings',
          component: PrinterSettings,
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
