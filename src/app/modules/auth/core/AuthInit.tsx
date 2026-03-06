import {FC, useEffect, useState} from 'react'
import {LayoutSplashScreen} from '../../../../_metronic/layout/core'
import {WithChildren} from '../../../../_metronic/helpers'
import {useAuth} from './Auth'
import API from '../../../../api'

export const AuthInit: FC<WithChildren> = ({children}) => {
  const {auth, logout, setCurrentUser, currentUser} = useAuth()
  const [showSplashScreen, setShowSplashScreen] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      // Tidak ada token sama sekali → langsung ke login
      if (!auth?.token) {
        console.log('⚠️ AuthInit - No token, redirecting to login')
        logout()
        setShowSplashScreen(false)
        return
      }

      // Token dev/admin bypass → skip validasi backend
      if (auth.token === 'dev-token' || auth.token === 'admin-token') {
        console.log('🔑 AuthInit - Bypass token detected, skipping validation')
        setShowSplashScreen(false)
        return
      }

      // Sudah ada data user dari localStorage → tampilkan app langsung,
      // refresh profil di background tanpa menahan loading screen
      if (currentUser?.id || currentUser?.email) {
        console.log('⚡ AuthInit - User already cached, showing app immediately')
        setShowSplashScreen(false)
        // Background refresh (tidak menahan render)
        API.get('/profile').then(res => {
          const userData = res.data
          const extractRole = (u: any) => {
            const raw = u?.role
            if (raw && typeof raw === 'object') return String(raw.role_name ?? '').toLowerCase()
            if (typeof raw === 'string') return raw.toLowerCase()
            return (u?.nama_role ?? u?.role_name ?? '').toLowerCase()
          }
          setCurrentUser(prev => ({
            ...prev,
            id: userData.user_id ?? userData.id ?? prev?.id ?? '',
            username: userData.username ?? prev?.username ?? '',
            email: userData.email ?? prev?.email ?? '',
            first_name: userData.first_name ?? userData.username ?? prev?.first_name ?? '',
            role: extractRole(userData) || prev?.role || '',
            nama_role: extractRole(userData) || prev?.nama_role || '',
          } as any))
        }).catch((err: any) => {
          console.warn('⚠️ Background profile refresh failed:', err?.response?.status)
          if (err?.response?.status === 401) logout()
        })
        return
      }

      // Token nyata, tidak ada cache user → validasi ke backend (/profile)
      // Batas waktu 5 detik agar tidak stuck jika backend tidak merespons
      try {
        console.log('🔍 AuthInit - Validating token with backend...')
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Auth init timeout')), 5000)
        )
        const res = await Promise.race([API.get('/profile'), timeoutPromise]) as any
        const userData = res.data

        // Ekstrak nama role dari relasi role object atau langsung dari field
        const extractRole = (u: any) => {
          const raw = u?.role
          if (raw && typeof raw === 'object') return String(raw.role_name ?? '').toLowerCase()
          if (typeof raw === 'string') return raw.toLowerCase()
          return (u?.nama_role ?? u?.role_name ?? '').toLowerCase()
        }

        setCurrentUser(prev => ({
          ...prev,
          id: userData.user_id ?? userData.id ?? prev?.id ?? '',
          username: userData.username ?? prev?.username ?? '',
          email: userData.email ?? prev?.email ?? '',
          first_name: userData.first_name ?? userData.username ?? prev?.first_name ?? '',
          last_name: userData.last_name ?? prev?.last_name ?? '',
          fullname: userData.fullname ?? userData.username ?? prev?.fullname ?? '',
          password: undefined,
          role: extractRole(userData) || prev?.role || '',
          nama_role: extractRole(userData) || prev?.nama_role || '',
          role_id: userData.role_id ?? prev?.role_id ?? '',
          pic: userData.pic ?? userData.avatar ?? prev?.pic ?? '',
          roles: userData.roles ?? prev?.roles ?? [],
          language: prev?.language ?? 'en',
          timeZone: prev?.timeZone ?? 'Asia/Jakarta',
        } as any))

        console.log('✅ AuthInit - Token valid, user:', userData.email, '- Role:', extractRole(userData))
      } catch (err: any) {
        console.warn('❌ AuthInit - Token invalid or expired, forcing logout:', err?.response?.status)
        logout()
      } finally {
        setShowSplashScreen(false)
      }
    }

    initAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>
}