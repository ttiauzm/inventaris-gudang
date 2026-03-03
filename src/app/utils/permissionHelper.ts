import {isTestingMode} from './testingUtils'

export const ROLES = {
  SUPER_ADMIN: 999,
  ADMIN: 1
}

export const PERMISSIONS = {
  // Inventory
  INVENTORY_READ: 'inventory.read',
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_UPDATE: 'inventory.update',
  INVENTORY_DELETE: 'inventory.delete',
  
  // Supplier
  SUPPLIER_READ: 'supplier.read',
  SUPPLIER_MANAGE: 'supplier.manage',
  
  // User Management
  USER_MANAGE: 'user.manage',
  
  // History
  HISTORY_READ: 'history.read',
  
  // Logs
  LOGS_READ: 'logs.read'
}

// Helper: pastikan nilai selalu berupa string lowercase, aman untuk semua tipe
const toRoleString = (val: any): string => {
  if (val == null) return ''           // null & undefined
  if (typeof val === 'string') return val.toLowerCase().trim()
  if (typeof val === 'object' && val.role_name) return String(val.role_name).toLowerCase().trim()
  if (typeof val === 'object' && val.nama_role) return String(val.nama_role).toLowerCase().trim()
  return ''
}

export const isSuperAdmin = (user: any): boolean => {
  // Bypass permission check saat testing mode
  if (isTestingMode()) {
    return true
  }

  // Check roles array (dev-mode bypass tokens)
  if (user?.roles?.includes(ROLES.SUPER_ADMIN)) {
    return true
  }

  // Check email untuk dev mode
  if (user?.email === 'dev@example.com') {
    return true
  }

  // Backend mengembalikan role_name lowercase: 'superadmin'
  // toRoleString aman terhadap null/undefined/object
  const roleName =
    toRoleString(user?.role) ||
    toRoleString(user?.nama_role) ||
    toRoleString(user?.role_name)

  return roleName === 'superadmin'
}

export const isAdmin = (user: any): boolean => {
  // Bypass permission check saat testing mode
  if (isTestingMode()) return true

  // SuperAdmin juga memiliki akses admin
  if (isSuperAdmin(user)) return true

  // Check roles array (dev-mode)
  if (user?.roles?.includes(ROLES.ADMIN)) return true

  // Backend mengembalikan role_name lowercase: 'admin'
  const roleName =
    toRoleString(user?.role) ||
    toRoleString(user?.nama_role) ||
    toRoleString(user?.role_name)

  return roleName === 'admin'
}

export const hasPermission = (user: any, permission: string): boolean => {
  // Bypass permission check saat testing mode
  if (isTestingMode()) return true
  
  // SuperAdmin has all permissions
  if (isSuperAdmin(user)) return true
  
  // Check specific permissions
  return user?.permissions?.includes(permission) || false
}

export const canCreateInventory = (user: any): boolean => {
  return isSuperAdmin(user) || hasPermission(user, PERMISSIONS.INVENTORY_CREATE)
}

export const canUpdateInventory = (user: any): boolean => {
  return isSuperAdmin(user) || hasPermission(user, PERMISSIONS.INVENTORY_UPDATE)
}

export const canDeleteInventory = (user: any): boolean => {
  return isSuperAdmin(user) || hasPermission(user, PERMISSIONS.INVENTORY_DELETE)
}

export const canManageSuppliers = (user: any): boolean => {
  return isSuperAdmin(user) || hasPermission(user, PERMISSIONS.SUPPLIER_MANAGE)
}

export const canManageUsers = (user: any): boolean => {
  return isSuperAdmin(user) || hasPermission(user, PERMISSIONS.USER_MANAGE)
}

// Usage Example:
// const {currentUser} = useAuth()
// const canEdit = canUpdateInventory(currentUser)
// if (!canEdit) { alert('No permission'); return }