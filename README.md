# AURA — AI-Powered Makeup Recommendation Platform

> **AURA** adalah platform SaaS berbasis AI yang memberdayakan beauty affiliator & content creator untuk memberikan rekomendasi produk makeup yang dipersonalisasi secara otomatis kepada audiens mereka melalui analisis computer vision dan AI generatif.

---

## 🔗 Link Repository & Deployment

- **GitHub Repository**: [https://github.com/Capstone-Kada/Brand-Capstone-Aura.git](https://github.com/Capstone-Kada/Brand-Capstone-Aura.git)
- **Live Demo / Deployment Frontend**: *(Opsional / Masukkan URL Deployment di sini)*
- **Live API Endpoint**: *(Opsional / Masukkan URL API di sini)*

---

## 📌 Project Overview

### 1. Problem Statement (Latar Belakang & Masalah)
- **Tingginya Risiko Salah Beli Produk Makeup**: Konsumen sering kesulitan menentukan shade foundation, undertone, dan warna makeup yang tepat saat berbelanja secara daring tanpa mencoba langsung (swatch). Hal ini menyebabkan pemborosan biaya dan ketidakpuasan konsumen.
- **Keterbatasan Skalabilitas Rekomendasi Affiliator**: Beauty influencer / affiliator menerima ratusan pertanyaan terkait rekomendasi warna dan produk setiap hari, namun tidak memungkinkan untuk menganalisis dan membalas satu per satu secara manual dengan cepat.
- **Konversi Penjualan Afiliasi Belum Optimal**: Link afiliasi umum sering kali tidak relevan dengan karakteristik fisik pembeli, sehingga menurunkan conversion rate pembelian produk.

### 2. Goal (Tujuan Proyek)
Membangun platform all-in-one yang:
1. Menyediakan **AI Face Scanner & Recommendation Engine** instan dan akurat bagi konsumen untuk menemukan produk makeup yang paling cocok dengan skin tone, undertone, bentuk wajah, dan personal color season mereka.
2. Memberikan **SaaS Branded AI Page & Dashboard** bagi beauty affiliator untuk mengkurasi katalog produk, menyebarkan link scanner personal, mengumpulkan leads prospek, dan meningkatkan pendapatan komisi afiliasi.

### 3. Targeted User / Persona (Target Pengguna & Pasar)

| Persona | Deskripsi & Kebutuhan |
|---|---|
| **Beauty Affiliator / Creator** | Content creator kecantikan di TikTok/Instagram/YouTube yang ingin memonetisasi audiens melalui link afiliasi terpersonalisasi, memiliki halaman AI bermerek sendiri, dan melihat analitik audiens. |
| **Beauty Enthusiast / Consumer** | Pengguna akhir (follower) yang ingin mengetahui profil warna kulit (skin tone, undertone, personal color) dan bentuk wajah mereka secara instan tanpa perlu datang ke beauty counter fisik. |
| **Brand / Platform Admin** | Pengelola platform yang bertugas memverifikasi akun affiliator, mengelola master katalog produk, dan memantau kesehatan ekosistem platform. |

---

## 🧠 AI Usage & Implementation

AURA mengintegrasikan teknologi Computer Vision dan Large Language Model (LLM) dalam alur pemrosesan cerdas:

```
[Foto Wajah Pengguna]
         │
         ▼
[1. MediaPipe FaceLandmarker] ──▶ Ekstraksi 478 titik koordinat wajah 3D
         │
         ├──▶ [2. Color Analysis & ROI Extraction (OpenCV)]
         │        • Sampling warna kulit pada area pipi dan dahi (bebas bayangan)
         │        • Deteksi Skin Tone (skala kecerahan)
         │        • Deteksi Undertone (analisis ruang warna HSV & CIELAB: Warm/Cool/Neutral)
         │        • Klasifikasi 4-Season Personal Color (Spring / Summer / Autumn / Winter)
         │
         ├──▶ [3. Geometrical Face Shape Classifier]
         │        • Kalkulasi rasio jarak Euclidean (dahi, tulang pipi, rahang, panjang wajah)
         │        • Klasifikasi: Oval, Bulat, Persegi, Hati, Diamond, Lonjong
         │
         ▼
[4. Rule-Based Shade Matching Engine (Node.js)]
         • Pencocokan profil wajah terhadap master data & katalog listing affiliator
         │
         ▼
[5. Google Gemini AI Engine]
         • Menghasilkan narasi ringkasan personal, tips pengaplikasian makeup,
           dan insight kecantikan khusus dalam Bahasa Indonesia
```

---

## 🔑 Fitur Utama

### 🛍️ Untuk Affiliator
- 🌐 **Branded AI Page**: Halaman publik kustom (`/ai-pages/:slug`) dengan tema warna affiliator untuk media scan follower.
- 💄 **Katalog Listing Kustom**: Kurasi produk makeup pilihan affiliator yang dilengkapi link afiliasi kustom.
- 📊 **Lead & Analytics Dashboard**: Statistik total scan, estimasi klik afiliasi, dan grafik distribusi undertone follower.
- 🔐 **Keamanan & Verifikasi Email**: Alur registrasi aman dengan verifikasi email dan 2FA.

### 📸 Untuk Pengguna / Follower
- ⚡ **Instant Face Scan**: Upload foto wajah langsung dari kamera atau galeri.
- 🎨 **Analisis Profil Warna**: Mengetahui skin tone, undertone, dan personal color season secara objektif.
- 🔷 **Rekomendasi Kontur & Bentuk Wajah**: Panduan teknik makeup sesuai struktur wajah.
- 🛒 **Kurasi Produk Siap Beli**: Rekomendasi shade produk makeup yang langsung terhubung ke marketplace via link affiliator.

### 🛡️ Untuk Admin
- 👥 **Affiliator Management**: Approve, reject, atau suspend pendaftaran affiliator.
- 📦 **Master Product Management**: Pengelolaan basis data produk kecantikan (integrasi katalog SOCO).
- 🏷️ **Tier & Subscription Management**: Pengaturan paket langganan SaaS.

---

## 🏗️ Arsitektur Sistem

Proyek ini terbagi menjadi **3 layanan terpisah**:

```
Capstone/
├── Frontend-3.0/          → Web Application (React + TypeScript + Vite)
└── Backend-3.0/
    ├── api/               → Core Business Backend (Node.js + Express + Prisma)
    ├── ai-service/        → HTTP Microservice Wrapper (FastAPI + Python)
    └── ai-pipeline/       → Standalone CV Library (MediaPipe + OpenCV + NumPy)
```

---

## 🚀 Tech Stack

### Frontend (`Frontend-3.0/`)
- **Core**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS, Responsive Layouts
- **HTTP & State**: Axios (`services/api.ts`), React Hooks
- **Auth Flow**: JWT Authentication (Access + Refresh Token), Email Verification Handler

### Backend API (`Backend-3.0/api/`)
- **Runtime & Framework**: Node.js, Express.js, TypeScript
- **Database & ORM**: PostgreSQL (Supabase), Prisma ORM
- **Authentication**: JWT, bcrypt, 2FA, Email Verification
- **Storage**: Supabase Storage / Local File Storage fallback
- **Integrasi AI**: Google Gemini AI Client (RAG Narrative Generator)
- **Testing & Docs**: Vitest, Swagger / OpenAPI 3

### AI Service & Pipeline (`Backend-3.0/ai-service/` & `ai-pipeline/`)
- **Framework**: FastAPI, Uvicorn
- **Computer Vision**: MediaPipe FaceLandmarker Tasks API, OpenCV, NumPy
- **Format**: REST API Multipart Upload (`POST /analyze-face`)

---

## 👥 Role Assignment & Tim Pengembang

Proyek ini dikembangkan oleh **Tim KADA**:

| No | Nama | Role & Tanggung Jawab |
|:---:|---|---|
| 1 | **Bita Azizy Hamida** | **Project Manager (PM) / Machine Learning (ML)**<br>• Manajemen sprint dan requirement proyek<br>• Riset dan pengembangan AI computer vision pipeline (MediaPipe, face shape, color classification) |
| 2 | **Nur Alief Maulana** | **Frontend (FE) / Backend (BE)**<br>• Arsitektur UI/UX dashboard & AI scan page di React<br>• Integrasi REST API, state management, dan implementasi endpoint backend |
| 3 | **Muhamad Rifki Ardi Priadi** | **Backend (BE) / Machine Learning (ML)**<br>• Arsitektur database, sistem autentikasi, verifikasi email & 2FA<br>• Service integrasi AI microservice, Gemini LLM narrative, dan testing |

---

## 🔑 Akun Demo / Test Accounts

Gunakan akun berikut untuk menguji sistem (setelah menjalankan database seed):

| Role | Email | Password | Keterangan / Akses |
|---|---|---|---|
| **Admin** | `admin@auraai.local` | `Admin123!` | Akses dashboard manajemen admin, verifikasi affiliator & master produk |
| **Affiliator** | `kate@auraai.local` | `Affiliator123!` | Akses dashboard affiliator, katalog listing, dan AI Page (`/ai/kate-glow`) |

---

## ⚙️ Panduan Menjalankan Sistem (Local Development)

### Prasyarat
- **Node.js**: Versi ≥ 18.x
- **Python**: Versi ≥ 3.9.x
- **PostgreSQL**: PostgreSQL lokal atau akun Supabase
- **Model File**: Unduh [`face_landmarker.task`](https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task) dan letakkan di `Backend-3.0/ai-pipeline/models/`

---

### Langkah 1: Setup AI Service (Terminal 1)
```bash
cd Backend-3.0/ai-service
pip install -r requirements.txt
cp .env.example .env
# Sesuaikan isi .env jika path ai-pipeline berbeda

uvicorn api:app --reload --port 8000
# AI Service berjalan di: http://localhost:8000
```

### Langkah 2: Setup Backend API (Terminal 2)
```bash
cd Backend-3.0/api
npm install
cp .env.example .env
# Lengkapi DATABASE_URL, JWT_SECRET, AI_SERVICE_URL=http://localhost:8000 di .env

npm run prisma:generate
npm run prisma:migrate
npm run seed              # Seed kategori & admin
npm run seed:demo-affiliator # Seed akun demo affiliator & AI Page

npm run dev
# Backend API berjalan di: http://localhost:3000
# Dokumentasi Swagger API: http://localhost:3000/docs
```

### Langkah 3: Setup Frontend (Terminal 3)
```bash
cd Frontend-3.0
npm install
cp .env.example .env
# Pastikan VITE_API_BASE_URL=http://localhost:3000

npm run dev
# Frontend berjalan di: http://localhost:5173
```

---

## 🌐 Endpoints API Utama

| Method | Path | Deskripsi |
|---|---|---|
| `POST` | `/auth/register` | Pendaftaran akun baru |
| `POST` | `/auth/login` | Autentikasi user & penerbitan JWT |
| `POST` | `/auth/verify-email` | Verifikasi token email pendaftaran |
| `GET` | `/ai-pages/:slug` | Mengambil profil publik AI Page milik affiliator |
| `POST` | `/leads` | Mengirim foto selfie untuk diproses AI & mendapatkan rekomendasi produk |
| `GET` | `/affiliator/me` | Mengambil profil affiliator yang sedang login |
| `GET` | `/listings` | Mengambil daftar produk rekomendasi affiliator |
| `GET` | `/analytics/summary` | Mengambil data metrik analitik dashboard affiliator |
| `GET` | `/products` | Mengambil daftar master katalog produk |
| `GET` | `/health` | Pemeriksaan status ketersediaan backend |

---

## 📄 Lisensi

Proyek ini dikembangkan untuk keperluan akademik **Capstone Project**. Seluruh hak cipta dilindungi oleh tim pengembang **KADA**.