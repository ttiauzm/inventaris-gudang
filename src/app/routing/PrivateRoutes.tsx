import {FC, lazy, Suspense} from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import {DashboardWrapper} from '../pages/dashboard/DashboardWrapper'
import {MenuTestPage} from '../pages/MenuTestPage'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'
import BuilderPageWrapper from '../pages/layout-builder/BuilderPageWrapper'
import {useAuth} from '../modules/auth'
import {InventoryPage} from '../pages/inventory/InventoryPage'
import {HistoryPage} from '../pages/history/HistoryPage'
import {LogSystemPage} from '../pages/log-system/LogSystemPage'
import { SupplierPage } from '../pages/supplier/SupplierPage'
import {UserManagementPage} from '../pages/user-management/UserManagementPage'
import {CategoryPage} from '../pages/category/CategoryPage'
import {MaterialPage} from '../pages/material/MaterialPage'

const PrivateRoutes = () => {
  const {currentUser} = useAuth()
  const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'))
  const WizardsPage = lazy(() => import('../modules/wizards/WizardsPage'))
  const AccountPage = lazy(() => import('../modules/accounts/AccountPage'))
  const WidgetsPage = lazy(() => import('../modules/widgets/WidgetsPage'))
  const ChatPage = lazy(() => import('../modules/apps/chat/ChatPage'))
  const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))

  // AUTH CHECK: Redirect ke login jika tidak ada user
  if (!currentUser) {
    console.log(' No currentUser, redirecting to login')
    return <Navigate to='/auth/login' replace />
  }

  console.log('✅ CurrentUser exists:', currentUser.username)

  return (
    <Routes>
      <Route element={<MasterLayout/>}>
        {/* Redirect to Dashboard after success login/registration */}
        <Route path='auth/*' element={<Navigate to='/dashboard' />} />
        
        {/* Pages */}
        <Route path='dashboard' element={<DashboardWrapper />} />
        <Route path='builder' element={<BuilderPageWrapper />} />
        <Route path='menu-test' element={<MenuTestPage />} />
        {/*core pages*/}
        <Route path='apps/inventory' element={<InventoryPage />} />
        <Route path='apps/history' element={<HistoryPage />} />
        <Route path='apps/log-system' element={<LogSystemPage />} />
        <Route path='apps/supplier' element={<SupplierPage/>} />
        <Route path='admin/users' element={<UserManagementPage />} />
        <Route path='admin/categories' element={<CategoryPage />} />
        <Route path='admin/materials' element={<MaterialPage />} />

        {/* Lazy Modules */}
        <Route
          path='crafted/pages/profile/*'
          element={
            <SuspensedView>
              <ProfilePage />
            </SuspensedView>
          }
        />
        <Route
          path='crafted/pages/wizards/*'
          element={
            <SuspensedView>
              <WizardsPage />
            </SuspensedView>
          }
        />
        <Route
          path='crafted/widgets/*'
          element={
            <SuspensedView>
              <WidgetsPage />
            </SuspensedView>
          }
        />
        <Route
          path='crafted/account/*'
          element={
            <SuspensedView>
              <AccountPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/chat/*'
          element={
            <SuspensedView>
              <ChatPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/user-management/*'
          element={
            <SuspensedView>
              <UsersPage />
            </SuspensedView>
          }
        />
        
        {/* Page Not Found */}
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({children}) => {
  const baseColor = getCSSVariableValue('--bs-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export {PrivateRoutes}