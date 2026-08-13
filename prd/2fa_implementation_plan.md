# Implementation Plan: Two-Factor Authentication (2FA)

Tujuan dari rencana ini adalah untuk menambahkan dukungan keamanan **Two-Factor Authentication (2FA)** menggunakan aplikasi Authenticator (seperti Google Authenticator) pada aplikasi KADA Capstone. 

## ⚠️ User Review Required
Silakan cek rencana di bawah ini. Fitur ini akan merubah alur *Login* dan menuntut adanya kolom baru di *Database*. Jika disetujui, klik **Proceed** dan saya akan mengeksekusi semua perubahan ini. *Catatan: Rencana ini juga akan disalin ke folder `prd/2fa_implementation_plan.md` sesuai permintaan.*

## 1. Perubahan Database (Prisma)
Kita perlu menyimpan rahasia 2FA (Secret Key) pengguna dan melacak apakah mereka sudah mengaktifkannya.
- **`schema.prisma`**:
  - Tambahkan `twoFactorSecret String?` pada tabel `User`.
  - Tambahkan `isTwoFactorEnabled Boolean @default(false)` pada tabel `User`.
- Jalankan perintah `npx prisma db push` (atau `migrate dev`) untuk memperbarui database.

## 2. Perubahan Backend (Express / Node.js)
Kita akan menginstal paket `otplib` (untuk generate dan verifikasi kode OTP) dan `qrcode` (untuk membuat QR Code).

### Endpoint Baru di `auth.controller.ts`:
- **`POST /auth/2fa/generate`**: Menghasilkan *Secret Key* baru (disimpan sementara/permanen) dan mengembalikan URL *QR Code* (format Data URL) agar bisa di-*scan* oleh pengguna di UI.
- **`POST /auth/2fa/enable`**: Menerima kode 6-digit pertama dari pengguna untuk memverifikasi bahwa *setup* berhasil, lalu mengubah `isTwoFactorEnabled` menjadi `true`.
- **`POST /auth/2fa/verify`**: Menerima `userId` dan `token` 6-digit untuk proses *Login* tahap 2, mengembalikan `accessToken` dan `refreshToken`.

### Modifikasi Alur Login Saat Ini (`login` di `auth.service.ts`):
- Saat pengguna melakukan login dengan `email` dan `password`:
  - Jika `isTwoFactorEnabled` == `false`, langsung kembalikan *tokens* (seperti biasa).
  - Jika `isTwoFactorEnabled` == `true`, kembalikan respon `{ requires2FA: true, userId }` alih-alih *tokens*, memaksa *frontend* untuk lanjut ke tahap verifikasi 2FA.

## 3. Perubahan Frontend (React)
- **Halaman Login (`LoginView.tsx`)**:
  - Tambahkan *state* untuk mode 2FA (e.g., `is2FAStep`).
  - Setelah memasukkan email & password, jika server merespon dengan `requires2FA: true`, sembunyikan form email/password dan tampilkan input kode OTP 6-digit.
- **Halaman Settings (`SettingsView.tsx`)**:
  - Tambahkan seksi khusus "Two-Factor Authentication" di tab Keamanan.
  - Tampilkan tombol "Enable 2FA" -> panggil `/auth/2fa/generate` -> Tampilkan QR Code.
  - Sediakan form input untuk memverifikasi OTP dan mengunci pengaturan.

## 4. Verification Plan
- **Manual Verification:**
  - Login dengan akun lama (tanpa 2FA), harus bisa masuk secara normal.
  - Buka *Settings* -> Aktifkan 2FA -> *Scan* QR menggunakan HP/Simulator -> Masukkan OTP -> Sukses aktif.
  - *Logout* -> *Login* ulang -> Pastikan tertahan di *form* 2FA -> Masukkan kode OTP -> Sukses login.
