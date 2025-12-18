// User Management API Requests
import API from '../../../../api'
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  UsersResponse,
} from './_models'

const API_URL = '/users'

/**
 * Get all users
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await API.get<UsersResponse>(API_URL)
    return response.data.data
  } catch (error) {
    console.error('Error fetching users:', error)
    // Return dummy data for development
    return getDummyUsers()
  }
}

/**
 * Get user by ID
 */
export const getUserById = async (id: number): Promise<User> => {
  try {
    const response = await API.get<UserResponse>(`${API_URL}/${id}`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw new Error('Failed to fetch user')
  }
}

/**
 * Create new user
 */
export const createUser = async (data: CreateUserRequest): Promise<User> => {
  try {
    const response = await API.post<UserResponse>(API_URL, data)
    return response.data.data
  } catch (error: any) {
    console.error('Error creating user:', error)
    throw new Error(error.response?.data?.message || 'Failed to create user')
  }
}

/**
 * Update user
 */
export const updateUser = async (id: number, data: UpdateUserRequest): Promise<User> => {
  try {
    const response = await API.put<UserResponse>(`${API_URL}/${id}`, data)
    return response.data.data
  } catch (error: any) {
    console.error('Error updating user:', error)
    throw new Error(error.response?.data?.message || 'Failed to update user')
  }
}

/**
 * Delete user
 */
export const deleteUser = async (id: number): Promise<void> => {
  try {
    await API.delete(`${API_URL}/${id}`)
  } catch (error: any) {
    console.error('Error deleting user:', error)
    throw new Error(error.response?.data?.message || 'Failed to delete user')
  }
}

/**
 * Activate/Deactivate user
 */
export const toggleUserStatus = async (id: number, isActive: boolean): Promise<User> => {
  try {
    const response = await API.patch<UserResponse>(`${API_URL}/${id}/status`, {
      is_active: isActive
    })
    return response.data.data
  } catch (error: any) {
    console.error('Error toggling user status:', error)
    throw new Error(error.response?.data?.message || 'Failed to update user status')
  }
}

/**
 * Assign role to user
 */
export const assignRole = async (id: number, roles: number[]): Promise<User> => {
  try {
    const response = await API.post<UserResponse>(`${API_URL}/${id}/assign-role`, {
      roles
    })
    return response.data.data
  } catch (error: any) {
    console.error('Error assigning role:', error)
    throw new Error(error.response?.data?.message || 'Failed to assign role')
  }
}

/**
 * Assign permissions to user
 */
export const assignPermissions = async (id: number, permissions: string[]): Promise<User> => {
  try {
    const response = await API.post<UserResponse>(`${API_URL}/${id}/permissions`, {
      permissions
    })
    return response.data.data
  } catch (error: any) {
    console.error('Error assigning permissions:', error)
    throw new Error(error.response?.data?.message || 'Failed to assign permissions')
  }
}

/**
 * Reset user password
 */
export const resetPassword = async (id: number, newPassword: string): Promise<void> => {
  try {
    await API.post(`${API_URL}/${id}/reset-password`, {
      password: newPassword
    })
  } catch (error: any) {
    console.error('Error resetting password:', error)
    throw new Error(error.response?.data?.message || 'Failed to reset password')
  }
}

/**
 * Search users
 */
export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const response = await API.get<UsersResponse>(`${API_URL}/search`, {
      params: { q: query }
    })
    return response.data.data
  } catch (error) {
    console.error('Error searching users:', error)
    throw new Error('Failed to search users')
  }
}

// ==========================================
// DUMMY DATA (for development/testing)
// ==========================================

const getDummyUsers = (): User[] => {
  return [
    {
      id: 1,
      username: 'superadmin',
      email: 'superadmin@fashion.com',
      first_name: 'Super',
      last_name: 'Admin',
      fullname: 'Super Admin',
      phone: '081234567890',
      role: 'SuperAdmin',
      roles: [999],
      permissions: [
        // '*'
      ], // All permissions
      is_active: true,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-12-18T08:30:00Z',
      last_login: '2025-12-18T09:15:00Z',
    },
    {
      id: 2,
      username: 'admin1',
      email: 'admin@fashion.com',
      first_name: 'Ahmad',
      last_name: 'Wijaya',
      fullname: 'Ahmad Wijaya',
      phone: '081234567891',
      role: 'Admin',
      roles: [1],
      permissions: [
        // 'inventory.read',
        // 'inventory.create',
        // 'inventory.update',
        // 'supplier.read',
        // 'history.read'
      ],
      is_active: true,
      created_at: '2024-03-20T14:30:00Z',
      updated_at: '2024-12-10T11:20:00Z',
      last_login: '2025-12-17T16:45:00Z',
    },
    {
      id: 3,
      username: 'staff1',
      email: 'staff@fashion.com',
      first_name: 'Siti',
      last_name: 'Nurhaliza',
      fullname: 'Siti Nurhaliza',
      phone: '081234567892',
      role: 'Staff',
      roles: [2],
      permissions: [
        // 'inventory.read',
        // 'history.read'
      ],
      is_active: true,
      created_at: '2024-06-10T09:00:00Z',
      updated_at: '2024-11-25T15:10:00Z',
      last_login: '2025-12-16T10:30:00Z',
    },
    {
      id: 4,
      username: 'admin2',
      email: 'budi@fashion.com',
      first_name: 'Budi',
      last_name: 'Santoso',
      fullname: 'Budi Santoso',
      phone: '081234567893',
      role: 'Admin',
      roles: [1],
      permissions: [
        // 'inventory.read',
        // 'inventory.update',
        // 'supplier.read',
        // 'supplier.manage',
        // 'history.read'
      ],
      is_active: false,
      created_at: '2024-08-05T13:15:00Z',
      updated_at: '2024-12-01T10:00:00Z',
      last_login: '2025-11-30T14:20:00Z',
    },
    {
      id: 5,
      username: 'manager1',
      email: 'rina@fashion.com',
      first_name: 'Rina',
      last_name: 'Kusuma',
      fullname: 'Rina Kusuma',
      phone: '081234567894',
      role: 'Admin',
      roles: [1],
      permissions: [
        // 'inventory.read',
        // 'inventory.create',
        // 'inventory.update',
        // 'inventory.delete',
        // 'supplier.read',
        // 'supplier.manage',
        // 'category.manage',
        // 'material.manage',
        // 'history.read'
      ],
      is_active: true,
      created_at: '2024-02-28T11:30:00Z',
      updated_at: '2024-12-15T09:45:00Z',
      last_login: '2025-12-18T07:00:00Z',
    },
  ]
}
