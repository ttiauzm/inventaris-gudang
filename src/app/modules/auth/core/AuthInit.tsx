import {FC, useEffect, useState} from 'react'
import {LayoutSplashScreen} from '../../../../_metronic/layout/core'
import {WithChildren} from '../../../../_metronic/helpers'
import {useAuth} from './Auth'

export const AuthInit: FC<WithChildren> = ({children}) => {
  const {auth, currentUser} = useAuth()
  const [showSplashScreen, setShowSplashScreen] = useState(true)

  useEffect(() => {
    console.log('🔧 AuthInit - Initialization check:', {
      hasAuth: !!auth?.token,
      hasCurrentUser: !!currentUser,
      authToken: auth?.token,
      userEmail: currentUser?.email
    })
    
    // Sudah ada auth dan user dari AuthProvider (loaded dari localStorage)
    // Langsung hide splash screen, tidak perlu init ulang
    setShowSplashScreen(false)
  }, [])

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>
}