# 👤 Account Page Update

## 📝 Summary

Berhasil mengubah tampilan dan logic pada menu **Account** (`/crafted/account/overview`) sesuai dengan screenshot yang diberikan.

---

## 🎨 UI Changes

Halaman Account sekarang menampilkan 4 section utama:

1.  **Edit Detail Admin**
    - Foto profil (150x150px)
    - Input Nama
    - Input Email
    - Tombol "Save Changes"

2.  **Password**
    - Input Password Baru
    - Input Konfirmasi Password
    - Tombol "Reset Password"

3.  **Permission**
    - Grid checkbox permission (dummy data "Edit Detail Barang")
    - Tombol "Reset Password" (sesuai screenshot, meskipun fungsinya save permission)

4.  **Hapus Akun**
    - Peringatan "Sorry, but we cannot delete this Superadmin account."
    - Checkbox konfirmasi penghapusan
    - Tombol "Deactivate Instead" dan "Delete Account"

---

## 🔐 Role-Based Logic

Logic akses telah diterapkan sesuai permintaan:

- **Admin** (`nama_role: 'admin'`):
    - Semua input **disabled** (read-only).
    - Semua tombol aksi **disembunyikan**.
    - Hanya bisa melihat data profil.

- **SuperAdmin** (`nama_role: 'superadmin'`):
    - Semua input **enabled** (bisa diedit).
    - Semua tombol aksi **muncul**.
    - Bisa mengubah data diri, password, permission, dan menghapus akun.

---

## 📂 Modified Files

- `src/app/modules/accounts/components/Overview.tsx`: Mengganti seluruh konten komponen ini dengan implementasi baru yang sesuai screenshot.

## 🧪 Verification

Silakan login sebagai:
1.  **SuperAdmin**: Cek menu Account, pastikan bisa edit dan tombol muncul.
2.  **Admin**: Cek menu Account, pastikan semua field terkunci dan tidak ada tombol save/delete.
