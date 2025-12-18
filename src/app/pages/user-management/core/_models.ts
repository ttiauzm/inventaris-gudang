// User Management Models

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  fullname?: string
  phone?: string
  role: string
  roles: number[]
  permissions: number[]
  is_active: boolean
  created_at: string
  updated_at?: string
  last_login?: string
  avatar?: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
  role_ids: number[]
  permission_ids?: number[]
  is_active?: boolean
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  password?: string
  first_name?: string
  last_name?: string
  phone?: string
  role_ids?: number[]
  permission_ids?: number[]
  is_active?: boolean
}

export interface UserResponse {
  success: boolean
  message: string
  data: User
}

export interface UsersResponse {
  success: boolean
  message: string
  data: User[]
  pagination?: {
    current_page: number
    total_pages: number
    total_items: number
    per_page: number
  }
}

export const ROLES = {
  SUPER_ADMIN: 999,
  ADMIN: 1,
  STAFF: 2,
} as const

export const ROLE_NAMES = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.STAFF]: 'Staff',
} as const

export const ROLE_OPTIONS = [
  { id: ROLES.SUPER_ADMIN, name: 'Super Admin' },
  { id: ROLES.ADMIN, name: 'Admin' },
  { id: ROLES.STAFF, name: 'Staff' },
]

export const PERMISSIONS = {
  // Inventory
  INVENTORY_READ: 1,
  INVENTORY_CREATE: 2,
  INVENTORY_UPDATE: 3,
  INVENTORY_DELETE: 4,
  
  // Supplier
  SUPPLIER_READ: 5,
  SUPPLIER_MANAGE: 6,
  
  // User Management
  USER_MANAGE: 7,
  
  // History
  HISTORY_READ: 8,
  
  // Logs
  LOGS_READ: 9,
  
  // Category & Material
  CATEGORY_MANAGE: 10,
  MATERIAL_MANAGE: 11,
} as const

export const PERMISSION_LABELS = {
  [PERMISSIONS.INVENTORY_READ]: 'Lihat Inventory',
  [PERMISSIONS.INVENTORY_CREATE]: 'Tambah Barang',
  [PERMISSIONS.INVENTORY_UPDATE]: 'Edit Barang',
  [PERMISSIONS.INVENTORY_DELETE]: 'Hapus Barang',
  [PERMISSIONS.SUPPLIER_READ]: 'Lihat Supplier',
  [PERMISSIONS.SUPPLIER_MANAGE]: 'Kelola Supplier',
  [PERMISSIONS.USER_MANAGE]: 'Kelola User',
  [PERMISSIONS.HISTORY_READ]: 'Lihat History',
  [PERMISSIONS.LOGS_READ]: 'Lihat Log System',
  [PERMISSIONS.CATEGORY_MANAGE]: 'Kelola Kategori',
  [PERMISSIONS.MATERIAL_MANAGE]: 'Kelola Material',
} as const

export const PERMISSION_GROUPS = [
  {
    label: 'Inventory',
    permissions: [
      { id: PERMISSIONS.INVENTORY_READ, name: PERMISSION_LABELS[PERMISSIONS.INVENTORY_READ] },
      { id: PERMISSIONS.INVENTORY_CREATE, name: PERMISSION_LABELS[PERMISSIONS.INVENTORY_CREATE] },
      { id: PERMISSIONS.INVENTORY_UPDATE, name: PERMISSION_LABELS[PERMISSIONS.INVENTORY_UPDATE] },
      { id: PERMISSIONS.INVENTORY_DELETE, name: PERMISSION_LABELS[PERMISSIONS.INVENTORY_DELETE] },
    ]
  },
  {
    label: 'Supplier',
    permissions: [
      { id: PERMISSIONS.SUPPLIER_READ, name: PERMISSION_LABELS[PERMISSIONS.SUPPLIER_READ] },
      { id: PERMISSIONS.SUPPLIER_MANAGE, name: PERMISSION_LABELS[PERMISSIONS.SUPPLIER_MANAGE] },
    ]
  },
  {
    label: 'Master Data',
    permissions: [
      { id: PERMISSIONS.CATEGORY_MANAGE, name: PERMISSION_LABELS[PERMISSIONS.CATEGORY_MANAGE] },
      { id: PERMISSIONS.MATERIAL_MANAGE, name: PERMISSION_LABELS[PERMISSIONS.MATERIAL_MANAGE] },
    ]
  },
  {
    label: 'System',
    permissions: [
      { id: PERMISSIONS.USER_MANAGE, name: PERMISSION_LABELS[PERMISSIONS.USER_MANAGE] },
      { id: PERMISSIONS.HISTORY_READ, name: PERMISSION_LABELS[PERMISSIONS.HISTORY_READ] },
      { id: PERMISSIONS.LOGS_READ, name: PERMISSION_LABELS[PERMISSIONS.LOGS_READ] },
    ]
  },
]
