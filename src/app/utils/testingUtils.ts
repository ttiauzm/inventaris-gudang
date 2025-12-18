export const enableTestingMode = () => {
  localStorage.setItem('TESTING_MODE', 'true')
  console.log('✅ Testing mode enabled - All pages accessible')
}

export const disableTestingMode = () => {
  localStorage.removeItem('TESTING_MODE')
  console.log('❌ Testing mode disabled')
}

export const isTestingMode = () => {
  return localStorage.getItem('TESTING_MODE') === 'true'
}

// Quick login untuk testing
export const quickLoginAsSuperAdmin = () => {
  const superAdminUser = {
    id: 999,
    username: "superadmin",
    email: "dev@example.com",
    first_name: "Super",
    last_name: "Admin",
    fullname: "Super Admin",
    role: "SuperAdmin",
    roles: [999], // SuperAdmin role ID
    permissions: ['*'] // All permissions
  }
  
  localStorage.setItem('kt-auth-react-v', JSON.stringify({token: 'dev-token'}))
  localStorage.setItem('current-user', JSON.stringify(superAdminUser))
  
  console.log('✅ Logged in as SuperAdmin')
  window.location.href = '/dashboard'
}

export const quickLoginAsAdmin = () => {
  const adminUser = {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    first_name: "Regular",
    last_name: "Admin",
    fullname: "Regular Admin",
    role: "Admin",
    roles: [1], // Admin role ID
    permissions: ['inventory.read', 'inventory.create', 'inventory.update', 'supplier.read']
  }
  
  localStorage.setItem('kt-auth-react-v', JSON.stringify({token: 'admin-token'}))
  localStorage.setItem('current-user', JSON.stringify(adminUser))
  
  console.log('✅ Logged in as Admin (limited access)')
  console.log('📋 Available pages: Dashboard, Inventory, Supplier, Account')
  console.log('🚫 Restricted pages: History, Log System, User Management, Master Data')
  window.location.href = '/dashboard'
}

// List all routes
export const listAllRoutes = () => {
  const routes = [
    {path: '/dashboard', name: 'Dashboard', access: 'All'},
    {path: '/apps/inventory', name: 'Inventory', access: 'All'},
    {path: '/apps/history', name: 'History', access: 'All'},
    {path: '/apps/log-system', name: 'Log System', access: 'SuperAdmin'},
    {path: '/apps/supplier', name: 'Supplier', access: 'All'},
    {path: '/admin/users', name: 'User Management', access: 'SuperAdmin'},
    {path: '/admin/categories', name: 'Categories', access: 'SuperAdmin'},
    {path: '/admin/materials', name: 'Materials', access: 'SuperAdmin'},
    {path: '/crafted/account/overview', name: 'My Account', access: 'All'},
  ]
  
  console.table(routes)
  return routes
}

// Navigate to specific route
export const goTo = (path: string) => {
  window.location.href = path
}

// Reset all data
export const resetAllData = () => {
  if (confirm('Reset all localStorage data?')) {
    localStorage.clear()
    console.log('✅ All data cleared')
    window.location.href = '/auth/login'
  }
}

// Show current user info
export const whoAmI = () => {
  const auth = localStorage.getItem('kt-auth-react-v')
  const user = localStorage.getItem('current-user')
  
  console.log('=== Current Session ===')
  console.log('Auth:', auth ? JSON.parse(auth) : 'Not logged in')
  console.log('User:', user ? JSON.parse(user) : 'No user data')
  console.log('Testing Mode:', isTestingMode())
}

// Export ke window untuk akses dari console
if (typeof window !== 'undefined') {
  (window as any).testing = {
    enableTestingMode,
    disableTestingMode,
    isTestingMode,
    quickLoginAsSuperAdmin,
    quickLoginAsAdmin,
    listAllRoutes,
    goTo,
    resetAllData,
    whoAmI
  }
  
  console.log(`
  🧪 Testing Utils Available:
  
  testing.enableTestingMode()      - Enable testing mode
  testing.quickLoginAsSuperAdmin()  - Login as SuperAdmin
  testing.quickLoginAsAdmin()       - Login as Admin
  testing.listAllRoutes()           - List all routes
  testing.goTo('/path')             - Navigate to path
  testing.whoAmI()                  - Show current user
  testing.resetAllData()            - Clear all data
  `)
}