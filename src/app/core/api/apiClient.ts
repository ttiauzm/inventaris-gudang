import axios, {AxiosInstance, AxiosRequestConfig} from 'axios'
import {getAuth} from '../../modules/auth/core/AuthHelpers'

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const auth = getAuth()
        if (auth?.token) {
          config.headers.Authorization = `Bearer ${auth.token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('kt-auth-react-v')
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

export const apiClient = new ApiClient()

// ===== API ENDPOINTS =====

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', {email, password}),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  getProfile: () =>
    apiClient.get('/auth/profile'),
}

// Inventory API
export const inventoryAPI = {
  getAll: (params?: any) =>
    apiClient.get('/inventory', {params}),
  
  getById: (id: number) =>
    apiClient.get(`/inventory/${id}`),
  
  create: (data: any) =>
    apiClient.post('/inventory', data),
  
  update: (id: number, data: any) =>
    apiClient.put(`/inventory/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/inventory/${id}`),
  
  take: (id: number, quantity: number, description: string) =>
    apiClient.post(`/inventory/${id}/take`, {quantity, description}),
}

// History API
export const historyAPI = {
  getAll: (params?: any) =>
    apiClient.get('/history', {params}),
  
  getById: (id: number) =>
    apiClient.get(`/history/${id}`),
}

// User Management API
export const userAPI = {
  getAll: (params?: any) =>
    apiClient.get('/users', {params}),
  
  getById: (id: number) =>
    apiClient.get(`/users/${id}`),
  
  create: (data: any) =>
    apiClient.post('/users', data),
  
  update: (id: number, data: any) =>
    apiClient.put(`/users/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/users/${id}`),
}

// Supplier API
export const supplierAPI = {
  getAll: (params?: any) =>
    apiClient.get('/suppliers', {params}),
  
  create: (data: any) =>
    apiClient.post('/suppliers', data),
  
  update: (id: number, data: any) =>
    apiClient.put(`/suppliers/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/suppliers/${id}`),
}

// Category API
export const categoryAPI = {
  getAll: () =>
    apiClient.get('/categories'),
  
  create: (data: any) =>
    apiClient.post('/categories', data),
  
  update: (id: number, data: any) =>
    apiClient.put(`/categories/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/categories/${id}`),
}

// Material API
export const materialAPI = {
  getAll: () =>
    apiClient.get('/materials'),
  
  create: (data: any) =>
    apiClient.post('/materials', data),
  
  update: (id: number, data: any) =>
    apiClient.put(`/materials/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/materials/${id}`),
}

// Log System API
export const logAPI = {
  getAll: (params?: any) =>
    apiClient.get('/logs', {params}),
}