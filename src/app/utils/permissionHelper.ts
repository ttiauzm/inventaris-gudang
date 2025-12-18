// export const ROLES = {
//   SUPER_ADMIN: 999,
//   ADMIN: 1
// }

// export const PERMISSIONS = {
//   // Inventory
//   INVENTORY_READ: 'inventory.read',
//   INVENTORY_CREATE: 'inventory.create',
//   INVENTORY_UPDATE: 'inventory.update',
//   INVENTORY_DELETE: 'inventory.delete',
  
//   // Supplier
//   SUPPLIER_READ: 'supplier.read',
//   SUPPLIER_MANAGE: 'supplier.manage',
  
//   // User Management
//   USER_MANAGE: 'user.manage',
  
//   // History
//   HISTORY_READ: 'history.read',
  
//   // Logs
//   LOGS_READ: 'logs.read'
// }

// export const isSuperAdmin = (user: any): boolean => {
//   return user?.roles?.includes(ROLES.SUPER_ADMIN)
// }

// export const isAdmin = (user: any): boolean => {
//   return user?.roles?.includes(ROLES.ADMIN) || isSuperAdmin(user)
// }

// export const hasPermission = (user: any, permission: string): boolean => {
//   // SuperAdmin has all permissions
//   if (isSuperAdmin(user)) return true
  
//   // Check specific permissions
//   return user?.permissions?.includes(permission) || false
// }

// export const canCreateInventory = (user: any): boolean => {
//   return isSuperAdmin(user) || hasPermission(user, PERMISSIONS.INVENTORY_CREATE)
// }

// export const canUpdateInventory = (user: any): boolean => {
//   return isSuperAdmin(user) || hasPermission(user, PERMISSIONS.INVENTORY_UPDATE)
// }

// export const canDeleteInventory = (user: any): boolean => {
//   return isSuperAdmin(user) || hasPermission(user, PERMISSIONS.INVENTORY_DELETE)
// }

// export const canManageSuppliers = (user: any): boolean => {
//   return isSuperAdmin(user) || hasPermission(user, PERMISSIONS.SUPPLIER_MANAGE)
// }

// export const canManageUsers = (user: any): boolean => {
//   return isSuperAdmin(user) || hasPermission(user, PERMISSIONS.USER_MANAGE)
// }

// // Usage Example:
// // const {currentUser} = useAuth()
// // const canEdit = canUpdateInventory(currentUser)
// // if (!canEdit) { alert('No permission'); return }