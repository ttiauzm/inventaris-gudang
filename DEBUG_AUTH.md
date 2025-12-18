# 🔍 Debug Authentication Issues

## Common Problem: Redirect ke Login Terus-Menerus

### Penyebab Umum:
1. ❌ localStorage kosong atau data corrupt
2. ❌ Race condition antara AuthProvider dan PrivateRoutes
3. ❌ API interceptor menghapus auth saat 401 error
4. ❌ Browser cache atau incognito mode

---

## ✅ Solusi Step-by-Step

### Step 1: Clear Everything
Buka **Browser Console (F12)**, paste dan enter:

```javascript
// Clear all storage
localStorage.clear()
sessionStorage.clear()

// Verify it's empty
console.log('localStorage:', localStorage.length)
console.log('sessionStorage:', sessionStorage.length)

// Reload page
window.location.href = '/auth/login'
```

### Step 2: Manual Login Test
Paste kode ini di console untuk login manual:

```javascript
// SuperAdmin Login
const auth = {token: 'dev-token'}
const user = {
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

localStorage.setItem('kt-auth-react-v', JSON.stringify(auth))
localStorage.setItem('current-user', JSON.stringify(user))

console.log('✅ Auth saved:', localStorage.getItem('kt-auth-react-v'))
console.log('✅ User saved:', localStorage.getItem('current-user'))

window.location.href = '/'
```

### Step 3: Verify Data Tersimpan
Setelah login, check apakah data masih ada:

```javascript
// Check auth
const auth = localStorage.getItem('kt-auth-react-v')
console.log('Auth:', auth)

// Check user
const user = localStorage.getItem('current-user')
console.log('User:', user)

// Parse and display
if (auth && user) {
    console.log('✅ Auth data:', JSON.parse(auth))
    console.log('✅ User data:', JSON.parse(user))
} else {
    console.log('❌ Data hilang!')
}
```

### Step 4: Monitor Redirect
Tambahkan ini sebelum navigate ke page lain:

```javascript
// Intercept navigation
window.addEventListener('beforeunload', () => {
    console.log('🔄 Page unload - checking localStorage...')
    console.log('Auth:', localStorage.getItem('kt-auth-react-v'))
    console.log('User:', localStorage.getItem('current-user'))
})
```

---

## 🧪 Test Page

Gunakan test page yang sudah disediakan:

**URL:** http://localhost:5174/test-login.html

Klik "Login as SuperAdmin" atau "Login as Admin", lalu check console log.

---

## 🔍 Debug Console Logs

Setelah login, cek console logs berikut:

### Expected Logs (✅ Success):
```
🔄 AuthProvider - Loaded user from localStorage: dev@example.com - Role: SuperAdmin
🔧 AuthInit - Initialization check: {hasAuth: true, hasCurrentUser: true, ...}
🔐 PrivateRoutes Check: {isChecking: false, hasAuthToken: true, hasCurrentUser: true, ...}
✅ Authenticated as: dev@example.com | Role: SuperAdmin | Roles: [999]
```

### Problem Logs (❌ Redirect):
```
⚠️ AuthProvider - No stored user found
❌ Authentication failed - redirecting to login
  - Auth token: MISSING
  - Current user: MISSING
```

---

## 🛠️ Manual Fix untuk Persistent Redirect

Jika masih redirect terus, coba ini:

### Option 1: Hard Refresh
```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

### Option 2: Clear Site Data
1. Buka DevTools (F12)
2. Tab **Application**
3. Klik **Clear site data**
4. Reload page

### Option 3: Incognito/Private Mode
Test di incognito window - jika berhasil, masalahnya ada di browser cache.

### Option 4: Different Browser
Test di browser lain untuk rule out browser-specific issue.

---

## 📊 Check Auth Flow

Paste ini untuk monitor full auth flow:

```javascript
// Monitor localStorage changes
const originalSetItem = localStorage.setItem
localStorage.setItem = function(key, value) {
    console.log(`📝 localStorage.setItem("${key}")`, value)
    originalSetItem.apply(this, arguments)
}

const originalRemoveItem = localStorage.removeItem
localStorage.removeItem = function(key) {
    console.log(`🗑️ localStorage.removeItem("${key}")`)
    originalRemoveItem.apply(this, arguments)
}

console.log('✅ localStorage monitoring enabled')
```

---

## 🚨 Emergency Reset

Jika semua gagal, force reset dengan refresh total:

```javascript
// Nuclear option - delete everything and reload
indexedDB.deleteDatabase('firebaseLocalStorageDb')
localStorage.clear()
sessionStorage.clear()
document.cookie.split(";").forEach(c => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
})
window.location.href = '/auth/login?fresh=1'
```

---

## 📞 Still Not Working?

Check these files for issues:

1. **Auth.tsx** - Apakah `currentUser` di-load dari localStorage?
2. **AuthInit.tsx** - Apakah tidak ada `logout()` yang dipanggil?
3. **PrivateRoutes.tsx** - Apakah ada delay sebelum check auth?
4. **api.tsx** - Apakah interceptor tidak menghapus localStorage?

Run this diagnostic:

```javascript
// Full diagnostic
console.log('=== AUTH DIAGNOSTIC ===')
console.log('1. localStorage auth:', localStorage.getItem('kt-auth-react-v'))
console.log('2. localStorage user:', localStorage.getItem('current-user'))
console.log('3. Current URL:', window.location.href)
console.log('4. User Agent:', navigator.userAgent)
console.log('5. Cookies:', document.cookie)
```

Send output ke developer untuk analysis.
