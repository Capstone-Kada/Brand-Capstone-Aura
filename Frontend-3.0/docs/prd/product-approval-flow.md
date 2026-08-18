# PRD: Product Approval Flow

## Overview
Saat ini, affiliator dapat menambahkan produk secara bebas ke halaman AI rekomendasi mereka. Fitur ini menambahkan alur persetujuan (*approval flow*) di mana jika affiliator menambahkan produk secara **manual** (bukan dari *master catalog*), produk tersebut tidak akan langsung aktif — melainkan berstatus **Pending** dan harus disetujui oleh Admin.

---

## Problem Statement
Tanpa mekanisme kontrol, affiliator dapat memasukkan produk dengan informasi yang tidak akurat atau tidak relevan. Fitur approval memastikan semua produk custom melewati verifikasi Admin sebelum tampil di halaman publik AI rekomendasi.

---

## Proposed Changes

### `src/types/index.ts`
- **[MODIFY]** Tambahkan properti `approvalStatus?: 'Approved' | 'Pending' | 'Rejected'` ke interface `Product`.
  - Produk dari *master catalog* → otomatis `Approved`.
  - Produk input manual affiliator → `Pending`.

### `src/hooks/useBeautyStore.ts`
- **[MODIFY]** `addProduct`: Deteksi apakah produk berasal dari master catalog (`productId` ada) atau manual (`productId` kosong). Jika manual, set `approvalStatus: 'Pending'`.
- **[NEW]** `updateProductApproval(id, status)`: Fungsi eksklusif untuk Admin mengubah status approval produk.

### `src/features/dashboard/ProductsView.tsx` (Affiliator)
- **[MODIFY]** Tambahkan badge status approval di kolom Status tabel produk:
  - ⏳ **Pending Approval** (amber)
  - ✗ **Rejected** (merah)

### `src/features/dashboard/AdminDashboardView.tsx` (Admin)
- **[MODIFY]** Tab Overview: Tambahkan *alert card* kuning jika ada produk pending, dengan tombol "Review Now →".
- **[MODIFY]** Tab Products: Tambahkan seksi **"Pending Approvals"** di bagian atas yang menampilkan daftar produk pending lengkap dengan tombol **✓ Approve** dan **✗ Reject**.

---

## Implementation Status
| Task | Status |
|------|--------|
| `types/index.ts` — tambah `approvalStatus` | ✅ Done |
| `useBeautyStore.ts` — update `addProduct` & `updateProductApproval` | ✅ Done |
| `ProductsView.tsx` — badge status approval | ✅ Done |
| `AdminDashboardView.tsx` — Pending Approvals section & alert | ✅ Done |
| `App.tsx` — wire up `updateProductApproval` prop | ✅ Done |

---

## Verification Steps
1. Login sebagai **affiliator** → buka menu Products → tambahkan produk manual (tanpa memilih dari master catalog).
2. Pastikan muncul badge **"⏳ Pending Approval"** pada produk tersebut di tabel Products affiliator.
3. Login sebagai **Admin** → buka tab Overview → pastikan muncul *alert card* "Products Awaiting Approval".
4. Buka tab Products → lihat seksi "Pending Approvals" di bagian atas.
5. Klik **✓ Approve** atau **✗ Reject** → pastikan badge produk berubah sesuai tindakan.
