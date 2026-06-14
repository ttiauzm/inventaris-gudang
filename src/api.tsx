import axios from "axios"
import {getAuth} from './app/modules/auth/core/AuthHelpers'

// const API = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || {/*'http://localhost:8000/api'*/},
// const API_URL = import.meta.env.MODE === 'development' ? '/api' : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api')
const API_URL = import.meta.env.MODE === 'development' ? '/api' : (import.meta.env.VITE_API_URL || 'http://server1.delova.cloud')

const API = axios.create({
  baseURL: API_URL,
  withCredentials: false, // false karena pakai Bearer Token, bukan session/cookie auth
  timeout: 8000, // 8 detik - agar tidak hang selamanya jika backend tidak merespons
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// });

// // Auto kirim token jika ada -- Fixed dari jipit
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });


// Request interceptor - tambahkan token ke setiap request
API.interceptors.request.use(
  (config) => {
    const auth = getAuth()
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      const auth = getAuth()
      // Jika menggunakan bypass token (dev-token atau admin-token), jangan redirect ke login
      if (auth?.token?.includes('-token')) {
        console.warn(`⚠️ 401 Unauthorized detected with bypass token (${auth.token}). Skipping redirect to login.`)
        return Promise.reject(error)
      }

      // // Jika 401 berasal dari endpoint /login itu sendiri (kredensial salah),
      // // jangan redirect — biarkan catch di Login.tsx yang menampilkan pesan error
      // const requestUrl = error.config?.url || ''
      // if (requestUrl.includes('/login')) {
      //   return Promise.reject(error)
      // }

      console.warn('⚠️ 401 Unauthorized - clearing auth and redirecting')
      localStorage.removeItem('kt-auth-react-v')
      localStorage.removeItem('current-user')
      window.location.href = '/auth/login'
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data)
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data)
    }

    return Promise.reject(error)
  }
)

export default API

// Helper untuk upload file
export const uploadFile = async (endpoint: string, file: File, onProgress?: (progress: number) => void) => {
  const formData = new FormData()
  formData.append('file', file)

  return API.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  })
}

// export default API;
