import {Suspense} from 'react'
import {Outlet} from 'react-router-dom'
import {I18nProvider} from '../_metronic/i18n/i18nProvider'
import {LayoutProvider, LayoutSplashScreen} from '../_metronic/layout/core'
import {MasterInit} from '../_metronic/layout/MasterInit'
import {AuthProvider, AuthInit} from './modules/auth'
import {ThemeModeProvider} from '../_metronic/partials/layout/theme-mode/ThemeModeProvider'

const App = () => {
  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <I18nProvider>
        <LayoutProvider>
          <AuthProvider>
            <AuthInit>
              <Outlet />
              <MasterInit />
            </AuthInit>
          </AuthProvider>
        </LayoutProvider>
      </I18nProvider>
    </Suspense>
  )
}

export {App}