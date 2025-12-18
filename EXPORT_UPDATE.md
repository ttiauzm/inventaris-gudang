# 📤 Export Feature Update

## 📝 Summary

Berhasil menambahkan dan memperbarui fitur export (Excel & PDF) pada halaman Log System, History, dan Master Data (Kategori & Material) agar seragam dengan halaman Inventory.

---

## 🔄 Changes

### 1. **Export Utilities** (`src/app/utils/exportUtils.ts`)
- Menambahkan fungsi `exportLogsToExcel` & `exportLogsToPDF`.
- Menambahkan fungsi `exportHistoryToExcel` & `exportHistoryToPDF`.
- Menambahkan fungsi `exportMasterDataToExcel` & `exportMasterDataToPDF`.
- Semua fungsi menggunakan format yang konsisten (Excel via `xlsx`, PDF via `jspdf-autotable`).

### 2. **Log System Page** (`src/app/pages/log-system/LogSystemPage.tsx`)
- Menambahkan tombol dropdown "Export" (Excel/PDF).
- Mengimplementasikan handler export menggunakan data yang difilter.

### 3. **History Page** (`src/app/pages/history/HistoryPage.tsx`)
- Menambahkan tombol dropdown "Export" (Excel/PDF).
- Mengimplementasikan handler export menggunakan data yang difilter.

### 4. **Master Data Page** (`src/app/pages/master-data/MasterDataPage.tsx`)
- Mengganti tombol export inline (icon only) dengan dropdown menu "Export" yang seragam.
- Mengupdate logic export untuk menggunakan `exportUtils` yang terpusat.
- Diterapkan pada kedua section: **List Kategori Barang** dan **List Jenis Material**.

---

## 🎨 UI Consistency

Sekarang semua halaman memiliki tampilan tombol export yang sama:
- Tombol **Export** dengan warna `btn-light-success`.
- Dropdown menu dengan pilihan **Export Excel** dan **Export PDF**.
- Icon yang konsisten (`file-down`, `file-sheet`, `file`).

## 🧪 Verification

Silakan cek halaman-halaman berikut:
1. **Log System**: Coba export log aktivitas.
2. **History**: Coba export histori pengambilan.
3. **Master Data**: Coba export Kategori dan Material.

Hasil export akan berupa file `.xlsx` atau `.pdf` dengan nama file yang mengandung tanggal hari ini (contoh: `SystemLogs_2025-12-18.pdf`).
