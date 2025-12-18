# Setup API Connection - Frontend ke Backend

## 📋 Daftar Isi
1. [Konfigurasi Backend (Laravel)](#konfigurasi-backend-laravel)
2. [Konfigurasi Frontend (React)](#konfigurasi-frontend-react)
3. [Development Mode](#development-mode)
4. [Testing API Connection](#testing-api-connection)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Konfigurasi Backend (Laravel)

### 1. Setup CORS di Laravel Backend

Pastikan backend Anda (BE-client) sudah dikonfigurasi untuk menerima request dari frontend.

**File: `BE-client/config/cors.php`**
```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3011', 'http://localhost:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### 2. Install Laravel Sanctum (Jika belum)

```bash
cd path/to/BE-client
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 3. Update .env Backend

**File: `BE-client/.env`**
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3011

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fashion_industry
DB_USERNAME=root
DB_PASSWORD=

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:3011,localhost:3000
SESSION_DOMAIN=localhost
```

### 4. Jalankan Backend Server

```bash
cd path/to/BE-client
php artisan serve
# Backend akan berjalan di http://localhost:8000
```

---

## ⚛️ Konfigurasi Frontend (React)

### 1. Update .env Frontend

**File: `.env`** (sudah dikonfigurasi)
```env
# API Configuration
VITE_API_URL=http://localhost:8000/api

# Development Mode (untuk bypass permission check)
VITE_DEV_MODE=true
VITE_DEV_USERNAME=dev
VITE_DEV_PASSWORD=1234
```

### 2. Struktur API Sudah Siap

File [`src/api.tsx`](src/api.tsx) sudah dikonfigurasi dengan:
- ✅ Auto-attach Authorization token
- ✅ Handle 401 Unauthorized (auto logout)
- ✅ Handle 403 Forbidden
- ✅ Handle 500 Server Error
- ✅ Support file upload

### 3. Jalankan Frontend

```bash
npm install  # Jika belum install dependencies
npm run dev
# Frontend akan berjalan di http://localhost:3011
```

---

## 🧪 Development Mode

### Cara Enable Dev Mode

Dev mode sudah **ENABLED** di `.env`:
```env
VITE_DEV_MODE=true
```

### Fitur Dev Mode:

1. **Bypass Permission Check**
   - Semua user bisa akses semua halaman
   - Tidak perlu role superadmin untuk akses fitur tertentu
   - Berguna untuk testing tanpa setup user & permission

2. **Quick Login via Console**

   Buka browser console (F12) dan ketik:
   
   ```javascript
   // Login sebagai Super Admin
   quickLoginAsSuperAdmin()
   
   // Login sebagai Admin biasa
   quickLoginAsAdmin()
   
   // Enable testing mode manual
   enableTestingMode()
   
   // Disable testing mode
   disableTestingMode()
   
   // Check apakah testing mode aktif
   isTestingMode()
   ```

3. **Cara Kerja Dev Mode**

   Ketika `VITE_DEV_MODE=true`, maka:
   - `isTestingMode()` akan return `true`
   - Semua permission check akan di-bypass
   - `isSuperAdmin()` return `true` untuk semua user
   - `hasPermission()` return `true` untuk semua permission

### Disable Dev Mode untuk Production

```env
# Comment atau hapus baris ini:
# VITE_DEV_MODE=true
```

---

## 🔗 Testing API Connection

### 1. Test Backend Status

```bash
curl http://localhost:8000/api/health
# atau buka di browser
```

### 2. Test Login API

Buat endpoint di Laravel:

**File: `BE-client/routes/api.php`**
```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'message' => 'API is running']);
});

// Login
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Inventory endpoints
    Route::apiResource('inventory', InventoryController::class);
    
    // Supplier endpoints
    Route::apiResource('suppliers', SupplierController::class);
    
    // User management
    Route::apiResource('users', UserController::class);
});
```

### 3. Test dari Frontend Console

```javascript
// Test API connection
fetch('http://localhost:8000/api/health')
  .then(r => r.json())
  .then(console.log)

// Test login (sesuaikan dengan endpoint Anda)
fetch('http://localhost:8000/api/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({username: 'admin', password: '1234'})
})
  .then(r => r.json())
  .then(console.log)
```

---

## 🐛 Troubleshooting

### Error: CORS Issue

**Gejala:**
```
Access to XMLHttpRequest at 'http://localhost:8000/api' from origin 'http://localhost:3011' 
has been blocked by CORS policy
```

**Solusi:**
1. Install Laravel CORS package:
   ```bash
   composer require fruitcake/laravel-cors
   ```

2. Update `config/cors.php` seperti di atas

3. Tambahkan middleware di `app/Http/Kernel.php`:
   ```php
   protected $middleware = [
       // ...
       \Fruitcake\Cors\HandleCors::class,
   ];
   ```

### Error: 401 Unauthorized

**Gejala:** Semua API request return 401

**Solusi:**
1. Check token tersimpan di localStorage:
   ```javascript
   localStorage.getItem('kt-auth-react-v')
   ```

2. Check backend menerima token:
   - Pastikan header `Authorization: Bearer <token>` terkirim
   - Check di [`src/api.tsx`](src/api.tsx) interceptor

### Error: Connection Refused

**Gejala:** `ERR_CONNECTION_REFUSED`

**Solusi:**
1. Pastikan backend Laravel running:
   ```bash
   php artisan serve
   ```

2. Check port backend (default 8000)

3. Update `VITE_API_URL` di `.env` sesuai port backend

### Dev Mode Tidak Berfungsi

**Solusi:**
1. Pastikan `VITE_DEV_MODE=true` di `.env`
2. Restart Vite dev server:
   ```bash
   # Ctrl+C untuk stop
   npm run dev
   ```
3. Clear browser cache & localStorage
4. Reload halaman

---

## 📝 Catatan Penting

### Untuk Development:
- ✅ Dev mode ENABLED (`VITE_DEV_MODE=true`)
- ✅ Bisa login dengan user biasa tapi akses semua halaman
- ✅ Permission check di-bypass

### Untuk Production:
- ❌ Dev mode DISABLED (comment `VITE_DEV_MODE`)
- ✅ Permission check aktif
- ✅ Hanya user dengan role yang sesuai bisa akses halaman tertentu

### Environment Variables yang Perlu Disesuaikan:

1. **Backend URL** - Sesuaikan dengan lokasi backend:
   ```env
   # Local development
   VITE_API_URL=http://localhost:8000/api
   
   # Production
   VITE_API_URL=https://api.yourdomain.com/api
   ```

2. **Port** - Jika backend menggunakan port berbeda:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

---

## 📞 Butuh Bantuan?

Jika masih ada error, silakan check:
1. Console browser (F12) untuk error JavaScript
2. Network tab untuk melihat request/response API
3. Terminal Laravel untuk error backend
4. File log Laravel: `storage/logs/laravel.log`

---

**Last Updated:** 18 Desember 2025
