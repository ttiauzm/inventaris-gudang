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
 * Build a map of userId -> latest login timestamp.
 * Sources (in priority order):
 *   1. GET /logs endpoint  – filters for action === 'LOGIN'
 *   2. localStorage        – saved by Login.tsx on each successful login (per-device fallback)
 */
const getLastLoginMap = async (): Promise<Record<string, string>> => {
  const map: Record<string, string> = {}

  // ── 1. localStorage: pick up any login that happened on this device ──────
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('sim_last_login_')) {
      const userId = key.replace('sim_last_login_', '')
      const ts = localStorage.getItem(key)
      if (ts) map[userId] = ts
    }
  }

  // ── 2. GET /logs  – overrides localStorage if backend has richer data ─────
  try {
    const response = await API.get<any>('/logs')
    // Paginated response: { data: { data: [...], current_page, ... } }
    const logList: any[] = response.data?.data?.data ?? response.data?.data ?? []
    for (const log of logList) {
      if (log.action !== 'LOGIN') continue
      const userId: string | undefined = log.user_id ?? log.user?.user_id
      const ts: string | undefined = log.created_at
      if (!userId || !ts) continue
      if (!map[userId] || new Date(ts) > new Date(map[userId])) {
        map[userId] = ts
      }
    }
  } catch {
    // /logs might require view_logs permission; silently skip if unavailable
  }

  return map
}

/**
 * Get all users
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    // Fetch users + last-login map in parallel
    const [response, lastLoginMap] = await Promise.all([
      API.get<any>(API_URL),
      getLastLoginMap(),
    ])
    // Backend returns: { success: true, data: [{user_id, username}] }
    const list: any[] = response.data?.data ?? response.data ?? []
    return list.map((item: any) => ({
      id: item.user_id,
      username: item.username,
      email: item.email || '',
      first_name: item.username,
      last_name: '',
      role: item.role?.role_name || item.role_name || 'Admin',
      roles: [],
      permissions: [],
      is_active: !item.is_deleted,
      created_at: item.created_at || '',
      // last_login: prefer backend field → logs endpoint → localStorage
      last_login: item.last_login || lastLoginMap[item.user_id] || undefined,
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return getDummyUsers()
  }
}

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await API.get<any>(`${API_URL}/${id}`)
    // Backend returns: { success: true, data: { username, email, password, role_name } }
    const item = response.data?.data ?? response.data
    return {
      id: item.user_id ?? id,
      username: item.username,
      email: item.email || '',
      first_name: item.username,
      last_name: '',
      role: item.role?.role_name || item.role_name || 'Admin',
      roles: [],
      permissions: [],
      is_active: !item.is_deleted,
      created_at: item.created_at || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    throw new Error('Failed to fetch user')
  }
}

/**
 * Create new admin user
 */
export const createUser = async (data: CreateUserRequest): Promise<User> => {
  try {
    const payload = {
      username: data.username,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation
    }
    const response = await API.post<any>(`${API_URL}/create-admin`, payload)
    return response.data.data
  } catch (error: any) {
    console.error('Error creating user:', error)
    throw new Error(error.response?.data?.message || 'Failed to create user')
  }
}

/**
 * Update user profile
 */
export const updateUser = async (id: string, data: UpdateUserRequest): Promise<User> => {
  try {
    const payload = {
      username: data.username,
      email: data.email,
      password: data.password
    }
    const response = await API.put<any>(`${API_URL}/${id}/update-profile`, payload)
    return response.data.data
  } catch (error: any) {
    console.error('Error updating user:', error)
    throw new Error(error.response?.data?.message || 'Failed to update user')
  }
}

/**
 * Delete user
 */
export const deleteUser = async (id: string): Promise<void> => {
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
export const toggleUserStatus = async (id: string, isActive: boolean): Promise<User> => {
  try {
    // Using update-profile as status endpoint might not exist
    const response = await API.put<any>(`${API_URL}/${id}/update-profile`, {
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
export const assignRole = async (id: string, roles: number[]): Promise<User> => {
  try {
    // Using update-profile as assign-role endpoint might not exist
    // Mapping 'roles' to 'role_ids' as per UpdateUserRequest
    const response = await API.put<UserResponse>(`${API_URL}/${id}/update-profile`, {
      role_ids: roles
    })
    return response.data.data
  } catch (error: any) {
    console.error('Error assigning role:', error)
    throw new Error(error.response?.data?.message || 'Failed to assign role')
  }
}

/**
 * Get all permissions
 */
export const getPermissions = async (): Promise<any[]> => {
  try {
    const response = await API.get('/permissions')
    return response.data.data
  } catch (error) {
    console.error('Error fetching permissions:', error)
    throw new Error('Failed to fetch permissions')
  }
}

/**
 * Toggle permission for a role
 */
export const toggleRolePermission = async (roleId: number, permissionId: number): Promise<void> => {
  try {
    await API.patch(`/roles/${roleId}/permissions`, {
      permission_id: permissionId
    })
  } catch (error: any) {
    console.error('Error toggling permission:', error)
    throw new Error(error.response?.data?.message || 'Failed to toggle permission')
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
export const resetPassword = async (id: string, newPassword: string): Promise<void> => {
  try {
    await API.put(`${API_URL}/${id}/update-profile`, {
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
      id: '1',
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
      // last_login: '2025-12-18T09:15:00Z', // DUMMY – dimatikan, diganti data real dari API/localStorage
    },
    {
      id: '2',
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
      // last_login: '2025-12-17T16:45:00Z', // DUMMY – dimatikan
    },
    {
      id: '3',
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
      // last_login: '2025-12-16T10:30:00Z', // DUMMY – dimatikan
    },
    {
      id: '4',
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
      // last_login: '2025-11-30T14:20:00Z', // DUMMY – dimatikan
    },
    {
      id: '5',
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
      // last_login: '2025-12-18T07:00:00Z', // DUMMY – dimatikan
    },
  ]
}
