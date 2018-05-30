const Auth = () => import('@/components/Auth')

export default {
  path: '/',
  name: 'home',
  component: Auth,
  meta: {
    permission: 'clerk|superadmin|admin',
    fail: '/',
    requiresAuth: false
  }
}
