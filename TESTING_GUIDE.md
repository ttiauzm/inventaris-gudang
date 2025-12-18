# 🧪 Testing Guide - Role-Based Access Control

## Quick Login Functions

### Login Tanpa Backend API

Buka **Browser Console** (F12), lalu paste salah satu command berikut:

#### 1. Login sebagai SuperAdmin
```javascript
// Manual setup SuperAdmin
const superAdmin = {
  id: 999,
  username: "superadmin",
  email: "dev@example.com",
  first_name: "Super",
  last_name: "Admin",
  fullname: "Super Admin",
  role: "SuperAdmin",
  roles: [999],
  permissions: ['*']
}
localStorage.setItem('kt-auth-react-v', JSON.stringify({token: 'dev-token'}))
localStorage.setItem('current-user', JSON.stringify(superAdmin))
window.location.href = '/dashboard'
```

#### 2. Login sebagai Admin (Limited)
```javascript
// Manual setup Admin
const admin = {
  id: 1,
  username: "admin",
  email: "admin@example.com",
  first_name: "Regular",
  last_name: "Admin",
  fullname: "Regular Admin",
  role: "Admin",
  roles: [1],
  permissions: ['inventory.read', 'inventory.create', 'supplier.read']
}
localStorage.setItem('kt-auth-react-v', JSON.stringify({token: 'admin-token'}))
localStorage.setItem('current-user', JSON.stringify(admin))
window.location.href = '/dashboard'
```

## Access Control Matrix

| Halaman | SuperAdmin (999) | Admin (1) |
|---------|-----------------|-----------|
| Dashboard | ✅ | ✅ |
| Account | ✅ | ✅ |
| Inventory | ✅ | ✅ |
| Supplier | ✅ | ✅ |
| History | ✅ | ❌ |
| Log System | ✅ | ❌ |
| User Management | ✅ | ❌ |
| Master Data | ✅ | ❌ |

## Testing Steps

1. **Clear Previous Session**
   ```javascript
   localStorage.clear()
   window.location.reload()
   ```

2. **Login dengan role yang ingin ditest** (gunakan script di atas)

3. **Verifikasi Menu Visibility**
   - SuperAdmin: Harus lihat 8 menu items
   - Admin: Hanya lihat 4 menu items

4. **Test Direct URL Access**
   - SuperAdmin: Bisa akses semua URL
   - Admin: Diredirect dari `/apps/users`, `/apps/history`, dll

5. **Test Page Refresh**
   - User tetap login setelah refresh
   - Menu tetap sesuai role

## Login via Form (Tanpa API)

Email: `dev@example.com`
Password: `1234`

**Note:** Ini akan otomatis set SuperAdmin role via DEV_USER constant

## Troubleshooting

### Masih redirect ke login setelah refresh?
```javascript
// Check apakah data tersimpan
console.log('Auth:', localStorage.getItem('kt-auth-react-v'))
console.log('User:', localStorage.getItem('current-user'))
```

### Menu tidak sesuai role?
```javascript
// Check permission helper
const user = JSON.parse(localStorage.getItem('current-user'))
console.log('User data:', user)
console.log('Is SuperAdmin:', user?.roles?.includes(999) || user?.role === 'SuperAdmin')
```

### Clear everything dan start fresh
```javascript
localStorage.clear()
sessionStorage.clear()
window.location.href = '/auth/login'
```
