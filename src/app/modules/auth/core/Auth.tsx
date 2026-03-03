/* eslint-disable react-refresh/only-export-components */
import {
  FC,
  useState,
  useEffect,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
} from 'react'
import {AuthModel, UserModel} from './_models'
import * as authHelper from './AuthHelpers'
import {WithChildren} from '../../../../_metronic/helpers'

type AuthContextProps = {
  auth: AuthModel | undefined
  saveAuth: (auth: AuthModel | undefined) => void
  currentUser: UserModel | undefined
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>
  logout: () => void
}

const initAuthContextPropsState = {
  auth: authHelper.getAuth(),
  saveAuth: () => {},
  currentUser: undefined,
  setCurrentUser: () => {},
  logout: () => {},
}

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState)

const useAuth = () => {
  return useContext(AuthContext)
}

const AuthProvider: FC<WithChildren> = ({children}) => {
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth())
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>(() => {
    // Load currentUser dari localStorage saat inisialisasi
    const storedUser = localStorage.getItem('current-user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        console.log('🔄 AuthProvider - Loaded user from localStorage:', userData.email, '- Role:', userData.role)
        return userData
      } catch (e) {
        console.error('Failed to parse stored user:', e)
        return undefined
      }
    }
    console.log('⚠️ AuthProvider - No stored user found')
    return undefined
  })
  
  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth)
    if (auth) {
      authHelper.setAuth(auth)
    } else {
      authHelper.removeAuth()
    }
  }

  const logout = () => {
    saveAuth(undefined)
    setCurrentUser(undefined)
    localStorage.removeItem('current-user')
  }

  // Simpan currentUser ke localStorage setiap kali berubah
  useEffect(() => {
    if (currentUser) {
      console.log('💾 Saving currentUser to localStorage:', currentUser.email)
      localStorage.setItem('current-user', JSON.stringify(currentUser))
    } else {
      console.log('🗑️ Removing currentUser from localStorage')
      localStorage.removeItem('current-user')
    }
  }, [currentUser])

  return (
    <AuthContext.Provider value={{auth, saveAuth, currentUser, setCurrentUser, logout}}>
      {children}
    </AuthContext.Provider>
  )
}

export {AuthProvider, useAuth}
export {AuthInit} from './AuthInit'