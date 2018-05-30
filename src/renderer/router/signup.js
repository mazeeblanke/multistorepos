const CompanyInformation = () => import('@/components/signup/CompanyInformation')
const SignupBase = () => import('@/components/signup/SignupBase')

export default {
  path: '/signup',
  name: 'signup',
  component: SignupBase,
  children: [
    {
      path: 'company_information',
      name: 'company_information',
      component: CompanyInformation,
      meta: {
        permission: 'clerk|superadmin|admin',
        fail: '/',
        requiresAuth: false
      }
    }
  ]
}
