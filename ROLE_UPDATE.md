# 🔐 Role Configuration Update

## 📝 Summary

Berhasil mengupdate konfigurasi role agar sesuai dengan backend yang menggunakan field `nama_role`.

---

## 🔄 Changes

### 1. **Model Update** (`src/app/modules/auth/core/_models.ts`)
- Menambahkan field `nama_role` ke interface `UserModel`.
- Sekarang frontend mengenali properti `nama_role` dari response backend.

### 2. **Permission Helper** (`src/app/utils/permissionHelper.ts`)
- **isSuperAdmin**: Menambahkan pengecekan `user?.nama_role === 'superadmin'`.
- **isAdmin**: Menambahkan pengecekan `user?.nama_role === 'admin'`.

### 3. **Private Routes** (`src/app/routing/PrivateRoutes.tsx`)
- Menambahkan log `userNamaRole` ke console untuk memudahkan debugging.

---

## 🧪 Verification

Sekarang sistem akan mengenali role user berdasarkan field `nama_role`:
- Jika `nama_role` = `'superadmin'`, user dianggap sebagai **SuperAdmin**.
- Jika `nama_role` = `'admin'`, user dianggap sebagai **Admin**.

Silakan cek console browser saat login untuk memastikan `userNamaRole` terbaca dengan benar.
