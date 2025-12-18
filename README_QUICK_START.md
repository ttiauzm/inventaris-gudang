# 🚀 Quick Start Guide - Fashion Industry Management System

## ✅ Status Perbaikan

### Error yang Sudah Diperbaiki:
- ✅ **Duplicate function declaration** di `permissionHelper.ts` - FIXED
- ✅ **Dev mode configuration** - ENABLED
- ✅ **API connection setup** - CONFIGURED
- ✅ **Permission bypass untuk development** - IMPLEMENTED

---

## 📦 Cara Menjalankan Aplikasi

### 1. Setup Backend (Laravel - BE-client)

```bash
# Navigasi ke folder backend
cd path/to/BE-client

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Setup database
php artisan migrate --seed

# Jalankan server
php artisan serve
# Backend berjalan di http://localhost:8000
```

### 2. Setup Frontend (React - Current Project)

```bash
# Install dependencies (jika belum)
npm install

# Jalankan development server
npm run dev
# Frontend berjalan di http://localhost:3011
```

---

## 🔑 Login & Development Mode

### Login Normal (Production Mode)

Jika `VITE_DEV_MODE` dicomment/disabled di `.env`:
```env
# VITE_DEV_MODE=true  # <- commented
```

Maka:
- Login menggunakan credentials dari database
- Permission check aktif
- User hanya bisa akses sesuai role mereka

### Development Mode (SUDAH ENABLED)

Saat ini **Dev Mode SUDAH AKTIF** di `.env`:
```env
VITE_DEV_MODE=true
```

**Cara Login di Dev Mode:**

**Opsi 1: Quick Login via Browser Console**

Setelah buka halaman login, tekan **F12** (Browser Console), lalu ketik:

```javascript
// Login as Super Admin (recommended untuk testing)
quickLoginAsSuperAdmin()

// Login as Regular Admin
quickLoginAsAdmin()
```

**Opsi 2: Enable Testing Mode Manual**

```javascript
// Enable testing mode
enableTestingMode()

// Lalu login dengan user apa saja, semua akan punya akses superadmin
```

**Opsi 3: Login Normal dengan Bypass**

- Login dengan user apa saja (bahkan admin biasa)
- Dev mode akan otomatis bypass semua permission check
- User akan bisa akses SEMUA halaman (inventory, supplier, user management, dll)

---

## 🎯 Fitur Development Mode

Ketika Dev Mode aktif (`VITE_DEV_MODE=true`):

✅ **Bypass Permission Check**
- Semua user dianggap sebagai Super Admin
- Bisa akses semua menu (Inventory, Supplier, User Management, History, Logs)
- Tidak perlu setup role & permission

✅ **Quick Testing**
- Login cepat tanpa database
- Bisa langsung testing UI/UX
- Tidak perlu khawatir permission

✅ **Helper Functions di Console**

Buka Console Browser (F12), available commands:
```javascript
// Quick logins
quickLoginAsSuperAdmin()  // Login as Super Admin
quickLoginAsAdmin()       // Login as Regular Admin

// Testing mode control
enableTestingMode()       // Enable testing mode
disableTestingMode()      // Disable testing mode
isTestingMode()          // Check if testing mode active
```

---

## 🔗 API Configuration

### Current Setup:

File: [`.env`](.env)
```env
# Backend API URL
VITE_API_URL=http://localhost:8000/api

# Development Mode - SUDAH ENABLED
VITE_DEV_MODE=true
```

### Jika Backend di Port Berbeda:

Ubah `VITE_API_URL` di `.env`:
```env
# Contoh jika backend di port 8080
VITE_API_URL=http://localhost:8080/api

# Contoh jika backend di subdomain
VITE_API_URL=https://api.yourdomain.com/api
```

**⚠️ PENTING:** Setelah ubah `.env`, restart dev server:
```bash
# Stop: Ctrl+C
# Start:
npm run dev
```

---

## 📋 Panduan UAT (User Acceptance Testing)

### Persiapan UAT:

1. **Setup Environment**
   ```bash
   # Backend
   cd BE-client && php artisan serve
   
   # Frontend (terminal berbeda)
   cd metronic_react_v8.2.3_demo4 && npm run dev
   ```

2. **Enable Dev Mode untuk Testing**
   - Sudah enabled di `.env`
   - Semua tester bisa login dan akses semua fitur

3. **Login untuk Tester**
   
   Berikan instruksi ke tester:
   - Buka http://localhost:3011
   - Tekan F12, buka Console
   - Ketik: `quickLoginAsSuperAdmin()`
   - Atau login dengan credentials apa saja (dev mode akan bypass)

### Skenario Testing:

#### 1. **Dashboard**
- [ ] Tampilan dashboard loading dengan benar
- [ ] Widget statistics menampilkan data
- [ ] Chart/grafik berfungsi

#### 2. **Inventory Management**
- [ ] List inventory tampil
- [ ] Create new item
- [ ] Edit item
- [ ] Delete item
- [ ] Search & filter
- [ ] Pagination

#### 3. **Supplier Management**
- [ ] List supplier tampil
- [ ] Add supplier
- [ ] Edit supplier
- [ ] Delete supplier
- [ ] Supplier detail

#### 4. **User Management** (Khusus Super Admin)
- [ ] List users
- [ ] Create user
- [ ] Edit user & assign roles
- [ ] Delete user
- [ ] User permissions

#### 5. **History**
- [ ] Transaction history tampil
- [ ] Filter by date
- [ ] Search history
- [ ] Export data

#### 6. **Log System** (Khusus Super Admin)
- [ ] System logs tampil
- [ ] Filter logs
- [ ] Log detail view

#### 7. **Categories & Materials**
- [ ] Manage categories
- [ ] Manage materials
- [ ] CRUD operations

---

## 🐛 Troubleshooting

### Frontend tidak bisa connect ke Backend

**Cek:**
1. Backend running? `php artisan serve`
2. URL di `.env` benar? `VITE_API_URL=http://localhost:8000/api`
3. Restart frontend after .env change
4. Check browser console (F12) untuk error CORS

**Fix CORS di Backend:**
```bash
cd BE-client
composer require fruitcake/laravel-cors
```

Lihat detail di [SETUP_API.md](SETUP_API.md)

### Login tidak berfungsi

**Solusi:**
1. Clear browser localStorage:
   ```javascript
   localStorage.clear()
   ```
2. Reload halaman
3. Use quick login: `quickLoginAsSuperAdmin()`

### Dev Mode tidak bypass permission

**Cek:**
1. File `.env` ada `VITE_DEV_MODE=true`
2. Restart dev server (Ctrl+C, npm run dev)
3. Clear cache browser (Ctrl+Shift+Delete)

### Error "Cannot redeclare..."

**Status:** ✅ **SUDAH DIPERBAIKI**

File yang diperbaiki:
- [`src/app/utils/permissionHelper.ts`](src/app/utils/permissionHelper.ts)

---

## 📝 Catatan untuk Production

Sebelum deploy ke production:

### 1. Disable Dev Mode

File: `.env`
```env
# Comment atau hapus baris ini:
# VITE_DEV_MODE=true
```

### 2. Update API URL

```env
# Ganti dengan URL production
VITE_API_URL=https://api.production-domain.com/api
```

### 3. Build untuk Production

```bash
npm run build
# Output ada di folder: dist/
```

### 4. Setup Permission Real di Backend

- Setup roles di database (Super Admin, Admin, Staff)
- Assign permissions ke setiap role
- Test login dengan berbagai role

---

## 📞 Support

### File Dokumentasi:
- [SETUP_API.md](SETUP_API.md) - Panduan lengkap setup API & troubleshooting
- Current file - Quick start & UAT guide

### Check Errors:
```bash
# Browser Console (F12) - untuk JavaScript errors
# Terminal Backend - untuk Laravel errors
# File: BE-client/storage/logs/laravel.log
```

---

## ✨ Summary

**Yang Sudah Dikerjakan:**

1. ✅ Fix duplicate function di `permissionHelper.ts`
2. ✅ Enable dev mode di `.env` 
3. ✅ Configure API connection
4. ✅ Setup permission bypass untuk development
5. ✅ Add quick login helpers
6. ✅ Dokumentasi lengkap

**Yang Perlu Dilakukan:**

1. ⏳ Setup & jalankan backend (BE-client)
2. ⏳ Configure CORS di backend
3. ⏳ Test API endpoints
4. ⏳ Lakukan UAT sesuai checklist
5. ⏳ Kirim file UAT untuk dokumentasi

---

**Last Updated:** 18 Desember 2025

**Status:** ✅ Ready for Testing
