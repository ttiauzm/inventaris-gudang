import {FC, lazy, Suspense, useState, useEffect} from 'react'
import {Navigate, Route, Routes, useLocation} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import {DashboardWrapper} from '../pages/dashboard/DashboardWrapper'
import {MenuTestPage} from '../pages/MenuTestPage'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'
import BuilderPageWrapper from '../pages/layout-builder/BuilderPageWrapper'
import {useAuth} from '../modules/auth'
import {LayoutSplashScreen} from '../../_metronic/layout/core'
import {InventoryPage} from '../pages/inventory/InventoryPage'
import {ItemDetailPage} from '../pages/inventory/ItemDetailPage'
import {HistoryPage} from '../pages/history/HistoryPage'
import {LogSystemPage} from '../pages/log-system/LogSystemPage'
import { SupplierPage } from '../pages/supplier/SupplierPage'
import {UserManagementPage} from '../pages/user-management/UserManagementPage'
import {CategoryPage} from '../pages/category/CategoryPage'
import {MaterialPage} from '../pages/material/MaterialPage'
import {MasterDataPage} from '../pages/master-data/MasterDataPage'
import {FaultyListPage} from '../pages/faulty-items/FaultyListPage'

const FallbackRoute = () => {
  const loc = useLocation()
  console.log('🚨 404 hit inside PrivateRoutes! Unmatched URL:', loc.pathname + loc.search)
  useEffect(() => {
    // If it's a valid inventory item but router failed to match it, try to recover
    if (loc.pathname.match(/^\/apps\/inventory\/\d+/)) {
      console.log('Recovery attempt for inventory detail page');
    }
  }, [loc.pathname])
  return <Navigate to='/error/404' />
}

const PrivateRoutes = () => {
  const {currentUser, auth} = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const location = useLocation()
  
  const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'))
  const WizardsPage = lazy(() => import('../modules/wizards/WizardsPage'))
  // const AccountPage = lazy(() => import('../modules/accounts/AccountPage')) // dinonaktifkan sementara
  const WidgetsPage = lazy(() => import('../modules/widgets/WidgetsPage'))
  const ChatPage = lazy(() => import('../modules/apps/chat/ChatPage'))
  const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))

  useEffect(() => {
    // Give AuthProvider time to load currentUser from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  console.log('🔐 PrivateRoutes Check:', {
    isChecking,
    hasAuthToken: !!auth?.token,
    hasCurrentUser: !!currentUser,
    userEmail: currentUser?.email,
    userRole: currentUser?.role,
    userNamaRole: currentUser?.nama_role,
    userRoles: currentUser?.roles,
    willRedirect: !isChecking && (!auth?.token || !currentUser)
  })

  // Wait for auth check to complete
  if (isChecking) {
    console.log('⏳ Waiting for auth initialization...')
    return <LayoutSplashScreen />
  }

  // AUTH CHECK: Redirect ke login jika tidak ada auth token ATAU tidak ada user
  if (!auth?.token || !currentUser) {
    console.log('❌ Authentication failed - redirecting to login')
    
    // Simpan target URL kalau user masuk dari link spesifik (contoh: scan QR)
    const currentPath = location.pathname + location.search;
    if (currentPath && currentPath !== '/' && !currentPath.startsWith('/auth') && !currentPath.startsWith('/error')) {
      localStorage.setItem('sim_pending_redirect', currentPath);
    }

    return <Navigate to='/auth/login' replace />
  }

  console.log('✅ Authenticated as:', currentUser.email, '| Role:', currentUser.role, '| Roles:', currentUser.roles)
  console.log('🔗 Current Location in PrivateRoutes:', location.pathname + location.search)

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
        <Route path='apps/inventory'>
          <Route index element={<InventoryPage />} />
          <Route path=':id' element={<ItemDetailPage />} />
        </Route>
        <Route path='apps/faulty-items' element={<FaultyListPage />} />
        <Route path='apps/history' element={<HistoryPage />} />
        <Route path='apps/log-system' element={<LogSystemPage />} />
        <Route path='apps/supplier' element={<SupplierPage/>} />
        <Route path='apps/users' element={<UserManagementPage />} />
        <Route path='apps/categories' element={<MasterDataPage />} />
        <Route path='apps/materials' element={<MasterDataPage />} />
        <Route path='apps/master-data' element={<MasterDataPage />} />

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
        {/* Route account dinonaktifkan sementara
        <Route
          path='crafted/account/*'
          element={
            <SuspensedView>
              <AccountPage />
            </SuspensedView>
          }
        />
        */}
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
        
        {/* Fallback route - instead of failing silently to 404, we catch it */}
        <Route path='*' element={<FallbackRoute />} />
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