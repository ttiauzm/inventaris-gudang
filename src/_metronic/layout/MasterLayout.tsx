import {useEffect} from 'react'
import {Outlet, useLocation} from 'react-router-dom'
import {AsideDefault} from './components/aside/AsideDefault'
import {Footer} from './components/Footer'
import {HeaderWrapper, HEADER_ENABLED} from './components/header/HeaderWrapper'
import {RightToolbar} from '../partials/layout/RightToolbar'
import {ScrollTop} from './components/ScrollTop'
import {PageDataProvider} from './core'
import {MenuComponent} from '../assets/ts/components'
import { Header } from './components/header/Header'
import {Content} from './components/Content'
import {Sidebar} from './components/Sidebar'
import {
  DrawerMessenger,
  ActivityDrawer,
  InboxCompose,
  InviteUsers,
  UpgradePlan,
} from '../partials'
import { main } from '@popperjs/core'
import { themeModeSwitchHelper } from '../partials/layout/theme-mode/ThemeModeProvider'
import { useThemeMode } from '../partials/layout/theme-mode/ThemeModeProvider'
import {reInitMenu} from '../helpers'

const MasterLayout = () => {
  const location = useLocation()
  const {mode} = useThemeMode()

  useEffect(() => {
    setTimeout(() => {
      MenuComponent.reinitialization()
    }, 500)
  }, [location.key])
  
  // useEffect(() => {
  //   reInitMenu()
  // }, [location.key])

  // useEffect(() => {
  //   themeModeSwitchHelper(mode)
  // }, [mode])

  return (
    <PageDataProvider>
      <div className='d-flex flex-column flex-root'>
        {/* begin::Page */}
        <div className='page d-flex flex-row flex-column-fluid'>
          <AsideDefault />
          {/* begin::Wrapper */}
          {HEADER_ENABLED && <Header />}
          <div className='wrapper d-flex flex-column flex-row-fluid' id='kt_wrapper'>
            <HeaderWrapper />
            {/* begin::Content */}
            <Outlet />
            {/* end::Content */}
            <Footer />
          </div>
          {/* end::Wrapper */}
        </div>
        {/* end::Page */}
      </div>

      {/* begin:: Drawers */}
      <ActivityDrawer />
      <RightToolbar />
      <DrawerMessenger />
      {/* end:: Drawers */}

      {/* begin:: Modals */}
      <InviteUsers />
      <UpgradePlan />
      {/* end:: Modals */}
      <ScrollTop />
    </PageDataProvider>
  )
}

export {MasterLayout}
