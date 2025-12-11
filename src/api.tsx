import axios from "axios"
import {getAuth} from './app/modules/auth/core/AuthHelpers'

// const API = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || {/*'http://localhost:8000/api'*/},
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const API = axios.create({
  baseURL: API_URL,
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
      localStorage.removeItem('kt-auth-react-v')
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
