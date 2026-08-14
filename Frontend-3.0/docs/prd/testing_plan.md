# Comprehensive Bug-Hunting & Testing Plan

Mengecek keseluruhan aplikasi ("test everything") adalah tugas yang masif. Agar prosesnya terstruktur, efisien, dan tidak mengganggu data penting, saya membaginya menjadi beberapa fase audit. 

## ⚠️ User Review Required
Pengecekan ini akan memakan waktu dan melibatkan banyak pembacaan kode. Mohon periksa rencana di bawah ini. Apakah kamu ingin saya menjalankan **semua fase secara berurutan**, atau ada **fase tertentu** yang ingin kamu prioritaskan?

## 📝 Proposed Testing Phases

### Phase 1: Backend Security & Stability Audit (Static Analysis)
Fokus mencari celah keamanan fatal dan potensi *crash* pada server Node.js/Express kamu.
*   **Authentication & Authorization:** Memastikan endpoint krusial (seperti CRUD user/affiliator) tidak bisa diakses oleh pihak yang tidak memiliki akses (Bypass Authorization).
*   **Input Validation:** Mengecek apakah Zod validator sudah menangkap semua kemungkinan *bad request* (misal: payload injeksi, tipe data tidak terduga).
*   **Error Handling:** Mencari potensi *unhandled promise rejections* atau memori *leak* di dalam struktur `asyncHandler`.
*   **Business Logic Flaws:** Memastikan alur data (seperti proses kalkulasi *clicks*, validasi *scan*, dan manipulasi produk) tidak memiliki celah logika.

### Phase 2: Frontend Stability & Edge Cases Review
Fokus memastikan UI tidak mengalami *blank screen* atau *crash* akibat state yang tidak sinkron.
*   **State Management:** Mengecek `useBeautyStore.ts` dan logika *React hooks* untuk mencegah *race conditions* atau *infinite loops*.
*   **Error Boundaries & Fallbacks:** Memeriksa apakah aplikasi dapat menangani *API timeout* atau respon yang tidak sesuai ekspektasi dari backend.
*   **UI/UX Edge Cases:** Mengecek logika *render* kondisional pada komponen (seperti Modal dan Tabel) jika data kosong (*null/undefined*).

### Phase 3: Simulated Integration Testing
Mensimulasikan alur end-to-end (E2E) utama secara logis untuk memastikan kedua sistem (FE & BE) terhubung dengan baik.
*   Alur Registrasi dan Login Affiliator/User.
*   Alur pengajuan (*Request*) dan persetujuan (*Approve/Reject*) produk oleh Admin.
*   Sinkronisasi data *Analytics* dan perhitungan skor/clicks.

## ❓ Open Questions
1. Apakah kamu ingin saya menulis dan meng-install **Automated Test Scripts** (misalnya menggunakan Jest/Supertest untuk API), atau kamu hanya ingin saya melakukan **Static/Manual Code Review** dan langsung memperbaiki bug yang ditemukan?
2. Apakah ada fitur spesifik (misal: fitur Scanner AI atau Analytics) yang paling kamu khawatirkan dan ingin diutamakan terlebih dahulu?
