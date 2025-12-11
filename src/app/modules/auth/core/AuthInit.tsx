import {FC, useEffect, useState} from 'react'
import {LayoutSplashScreen} from '../../../../_metronic/layout/core'
import {WithChildren} from '../../../../_metronic/helpers'
import {useAuth} from './Auth'

export const AuthInit: FC<WithChildren> = ({children}) => {
  const {auth, setCurrentUser, logout} = useAuth()
  const [showSplashScreen, setShowSplashScreen] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (auth && auth.token) {
          // Jika token adalah dev-token, skip API request
          if (auth.token === 'dev-token') {
            console.log('✅ Dev token detected, skipping API request')
            setShowSplashScreen(false)
            return
          }

          // Untuk token normal dari API
          // Uncomment jika ingin fetch user dari API
          /*
          try {
            const response = await API.get('/profile')
            setCurrentUser(response.data)
          } catch (error) {
            console.error('Failed to fetch user:', error)
            logout()
          }
          */
        } else {
          // Tidak ada token, clear auth
          logout()
        }
      } catch (error) {
        console.error('Auth init error:', error)
        logout()
      } finally {
        setShowSplashScreen(false)
      }
    }

    initAuth()
  }, [auth?.token]) // Dependency pada auth.token

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>
}