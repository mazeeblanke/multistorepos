import { PROGRESS } from '../utils/constants'
const EmployeesManagement = () => import('@/components/employees/EmployeesManagement')
const EmployeesList = () => import('@/components/employees/EmployeesList')
const EmployeeView = () => import('@/components/employees/EmployeeView')

export default {
  path: 'employees',
  component: EmployeesManagement,
  children: [
    {
      path: 'employees-list',
      name: 'employees_list',
      component: EmployeesList,
      meta: {
        permission: 'admin|superadmin',
        fail: '/app/new-sale',
        requiresAuth: true
      }
    },
    {
      path: ':id',
      name: 'employee_view',
      component: EmployeeView,
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
