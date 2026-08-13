# AURA — AI-Powered Makeup Recommendation Platform

> Platform SaaS berbasis AI yang membantu affiliator kecantikan merekomendasikan produk makeup secara personal melalui analisis wajah dan skin tone secara real-time.

---

## 📌 Deskripsi Proyek

**AURA** adalah capstone project yang membangun ekosistem rekomendasi makeup berbasis kecerdasan buatan. Sistem ini memungkinkan affiliator kecantikan untuk memiliki halaman publik bermerek sendiri, di mana follower mereka bisa **scan foto wajah** dan mendapatkan rekomendasi produk makeup yang dipersonalisasi sesuai:

- 🟤 **Skin tone** (skala kecerahan kulit)
- 🌡️ **Undertone** (warm / cool / neutral)
- 💎 **Personal color season** (Spring / Summer / Autumn / Winter)
- 🔷 **Bentuk wajah** (Oval, Bulat, Persegi, Hati, Diamond, Lonjong)

---

## 🏗️ Arsitektur Sistem

Proyek ini terdiri dari **3 layanan terpisah** yang bekerja sama:

```
Capstone/
├── Frontend-3.0/          → Aplikasi web React + TypeScript (Vite)
└── Backend-3.0/
    ├── api/               → Backend bisnis utama (Node.js / Express / TypeScript)
    ├── ai-service/        → Web service HTTP tipis pembungkus AI (FastAPI / Python)
    └── ai-pipeline/       → Logika computer vision murni (MediaPipe / OpenCV)
```

### Alur Request Scan Foto

```
Pengguna (Browser)
    │
    └─ POST /leads (foto + slug affiliator)
              │
         [api/ — Node.js]
              │
              └─ POST /analyze-face (foto)
                        │
                   [ai-service/ — FastAPI]
                        │
                        └─ import Python langsung
                                  │
                             [ai-pipeline/ — FaceAnalysisPipeline]
                                  │
                             ← Hasil analisis (JSON)
                        ←─────────────────────
              ←──────────────────────────────
    │
    └─ Tampilkan rekomendasi produk affiliator
```

---

## 🚀 Tech Stack

### Frontend (`Frontend-3.0/`)
| Layer | Teknologi |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | CSS Modules / Vanilla CSS |
| State | React Hooks |
| HTTP Client | Axios (via `services/api.ts`) |
| Auth | JWT (access + refresh token) |

### Backend API (`Backend-3.0/api/`)
| Layer | Teknologi |
|---|---|
| Runtime | Node.js |
| Framework | Express.js + TypeScript |
| Database | PostgreSQL (via Supabase) |
| ORM | Prisma |
| Auth | JWT (access + refresh token) |
| Storage | Supabase Storage / Local fallback |
| AI Client | Gemini API (narasi hasil scan) |
| Testing | Vitest |
| Docs | Swagger / OpenAPI 3 |

### AI Service (`Backend-3.0/ai-service/`)
| Layer | Teknologi |
|---|---|
| Framework | FastAPI |
| Runtime | Python 3.x |
| Endpoint | `POST /analyze-face` |

### AI Pipeline (`Backend-3.0/ai-pipeline/`)
| Layer | Teknologi |
|---|---|
| Face Landmark | MediaPipe FaceLandmarker (Tasks API) |
| Image Processing | OpenCV |
| Numerik | NumPy |
| Output | JSON (face shape, skin tone, undertone, personal color) |

---

## 🔑 Fitur Utama

### Untuk Affiliator
- 📊 **Dashboard** — statistik lead, klik afiliasi, distribusi undertone pelanggan
- 🛍️ **Manajemen Listing** — kurasi katalog produk dengan harga & link afiliasi custom
- 🌐 **AI Page** — halaman publik bermerek untuk follower scan foto
- 🔗 **Sistem Lead** — setiap scan tercatat sebagai prospek/lead

### Untuk Pengguna / Follower
- 📸 **Scan Wajah** — upload foto, analisis AI real-time
- 💄 **Rekomendasi Personal** — produk makeup sesuai skin tone & undertone
- 🎨 **Personal Color Season** — kategori warna terbaik untukmu
- 🔷 **Analisis Bentuk Wajah** — saran makeup sesuai kontur wajah

### Untuk Admin
- ✅ **Approve / Suspend Affiliator**
- 📦 **Kelola Katalog Produk Master**
- 🏷️ **Manajemen Tier Langganan**

---

## ⚙️ Cara Menjalankan (Development)

### Prasyarat
- Node.js ≥ 18
- Python ≥ 3.9
- PostgreSQL (atau akun Supabase)
- Model MediaPipe: `face_landmarker.task` ([unduh di sini](https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task))

---

### 1. AI Pipeline (Python — tidak perlu dijalankan terpisah)

```bash
cd Backend-3.0/ai-pipeline
pip install -r requirements.txt
# Letakkan face_landmarker.task di folder models/
```

---

### 2. AI Service (FastAPI — Terminal 1)

```bash
cd Backend-3.0/ai-service
pip install -r requirements.txt
cp .env.example .env
# Edit .env: isi ML_PROJECT_PATH ke path ai-pipeline kamu

uvicorn api:app --reload --port 8000
# Berjalan di http://localhost:8000
```

---

### 3. Backend API (Node.js — Terminal 2)

```bash
cd Backend-3.0/api
npm install
cp .env.example .env
# Edit .env: isi DATABASE_URL, JWT secrets, Supabase credentials, AI_SERVICE_URL=http://localhost:8000

npm run prisma:generate
npm run prisma:migrate
npm run seed          # seed data awal (kategori, produk, admin)
npm run seed:affiliator  # seed demo affiliator + AI Page

npm run dev
# Berjalan di http://localhost:3000
# Dokumentasi API: http://localhost:3000/docs
```

---

### 4. Frontend (React — Terminal 3)

```bash
cd Frontend-3.0
npm install
cp .env.example .env
# Edit .env: isi VITE_API_BASE_URL=http://localhost:3000

npm run dev
# Berjalan di http://localhost:5173
```

---

## 📁 Struktur Direktori

```
Capstone/
│
├── README.md                   ← Kamu di sini
│
├── Frontend-3.0/               ← Aplikasi web (React + Vite)
│   ├── src/
│   │   ├── features/           ← Fitur per domain (auth, dashboard, ai-recommendation, landing)
│   │   ├── components/         ← Komponen UI yang dapat digunakan ulang
│   │   ├── services/           ← HTTP client (api.ts)
│   │   ├── hooks/              ← Custom React hooks
│   │   └── types/              ← Definisi tipe TypeScript
│   └── ...
│
└── Backend-3.0/
    ├── README.md               ← Dokumentasi teknis detail backend
    │
    ├── ai-pipeline/            ← Computer vision (Python murni)
    │   ├── src/                ← Pipeline: landmark, face shape, skin tone, personal color
    │   └── models/             ← Model MediaPipe (unduh manual)
    │
    ├── ai-service/             ← HTTP wrapper AI pipeline (FastAPI)
    │   └── api.py              ← Endpoint POST /analyze-face
    │
    └── api/                    ← Backend bisnis utama (Express + TypeScript)
        ├── prisma/             ← Skema database & migrasi
        ├── src/
        │   ├── modules/        ← Domain: auth, affiliator, listing, ai-page, lead, analytics
        │   ├── middlewares/    ← Auth, validasi, rate limit, upload
        │   └── shared/         ← Error classes, utils, storage service
        └── tests/              ← Unit & integration tests (Vitest)
```

---

## 🌐 Endpoints API Utama

| Method | Path | Deskripsi |
|---|---|---|
| `POST` | `/auth/register` | Daftar akun baru |
| `POST` | `/auth/login` | Login & dapatkan JWT |
| `GET` | `/ai-pages/:slug` | Ambil data halaman publik affiliator |
| `POST` | `/leads` | Submit scan foto (inti fitur AI) |
| `GET` | `/affiliator/me` | Profil affiliator yang login |
| `GET` | `/listings` | Katalog listing affiliator |
| `GET` | `/analytics/summary` | Statistik dashboard |
| `GET` | `/products` | Katalog produk master (admin) |
| `GET` | `/health` | Health check |

> 📖 Dokumentasi lengkap tersedia di `/docs` (Swagger UI) saat backend berjalan.

---

## 👥 Tim

Proyek ini dikembangkan sebagai **Capstone Project** oleh tim **KADA**.

Bita Azizy Hamida
Nur Alief Maulana
Muhamad Rifki Ardi Priadi

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik / capstone. Seluruh hak cipta milik tim pengembang.

## 📄 Link Github Repository

https://github.com/Capstone-Kada/Capstone-BRAND.git