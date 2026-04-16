# OAMP Web Admin Dashboard

Frontend dashboard untuk sistem **OAMP (Otak Atik Merah Putih)** — platform asesmen kognitif dan motorik anak menggunakan robotika. Mendukung leaderboard real-time, manajemen sesi kompetisi, konsultasi kesehatan berbasis AI, dan export laporan.

**Live Demo**: [https://projectidek.dev](https://projectidek.dev)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix UI) |
| HTTP Client | Axios |
| Charts | Recharts |
| Routing | React Router v7 |
| Data Fetching | TanStack React Query |
| Icons | Lucide React |
| Toast Notifications | Sonner |

## Prerequisites

- **Node.js** >= 18
- **OAMP Backend** — pastikan server backend berjalan dan CORS sudah dikonfigurasi

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start dev server
npm run dev
```

Buka `http://localhost:5173` di browser.

## Environment Variables

```env
VITE_API_URL=http://localhost:8080/api/v1    # Development
VITE_API_URL=https://your-server/api/v1       # Production
```

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | **Dashboard** — CTF-style leaderboard dengan podium visual, line chart live score timeline, stat cards, session selector, auto-refresh 5 detik |
| `/participants` | **All Participants** — Daftar lengkap peserta dengan search, sort, download rapor per orang |
| `/register` | **Registration Station** — Form registrasi peserta baru dengan dukungan RFID scanner (auto-focus + Enter key detection) |
| `/analytics/:uid` | **Participant Analytics** — Profil lengkap, ringkasan sesi, session bar chart, emotion pie chart, AI health consultant, download rapor PDF |
| `/export` | **Export** — Download laporan Excel (.xlsx) dan PDF leaderboard |

## Fitur Utama

### Session Management
- **Manajemen Sesi**: Buat sesi baru untuk me-reset leaderboard dan memulai kompetisi fresh via tombol "Manajemen Sesi" di Dashboard
- **Session Selector**: Dropdown untuk memilih sesi yang ingin dilihat (termasuk sesi lama)
- **READ ONLY Mode**: Banner peringatan amber saat melihat sesi lama; auto-refresh dinonaktifkan
- **API**: `POST /api/v1/batches` untuk membuat sesi, `GET /api/v1/batches` untuk daftar sesi

### AI Health Consultant
- Analisis kesehatan bertenaga AI untuk setiap peserta
- Mendukung response status: `success` dan `fallback`
- Graceful degradation jika server AI offline
- Toast notification untuk setiap state proses
- Disclaimer bahwa hasil AI bersifat edukasi, bukan diagnosis medis

### Leaderboard Real-Time
- CTF-style dengan podium visual untuk top 3 (crown/medal icons)
- Gradient row untuk rank 1/2/3
- Live score timeline graph (3-layer: area fill, glow, main line)
- Fire event overlay saat rank #1 berubah
- Auto-refresh setiap 5 detik

## API Endpoints (Backend)

| Method | Endpoint | Digunakan di |
|--------|----------|-------------|
| `GET` | `/health` | Health check (status banner), polling setiap 30 detik |
| `GET` | `/api/v1/leaderboard` | Dashboard leaderboard (top 10) |
| `GET` | `/api/v1/leaderboard/timeline` | Live score timeline graph |
| `POST` | `/api/v1/participants` | Registration form |
| `GET` | `/api/v1/robot/auth/{uid}` | RFID UID lookup |
| `GET` | `/api/v1/app/auth/{uid}` | Analytics — profil + semua sesi |
| `GET` | `/api/v1/participants/analysis/{uid}` | AI Health Consultant |
| `GET` | `/api/v1/batches` | Session selector (Dashboard) |
| `POST` | `/api/v1/batches` | Membuat sesi baru |
| `GET` | `/export/excel` | Download Excel report |
| `GET` | `/export/pdf` | Download PDF leaderboard |
| `GET` | `/export/rapor/{uid}` | Download rapor PDF per peserta |

## Score Formula

Leaderboard menggunakan formula composite score:

```
score = (level_reached × 10) + (visuo_spatial_fit × 50) + (dexterity_score × 0.2)
```

- **level_reached** (1–8): bobot tertinggi, kontribusi 10–80 poin
- **visuo_spatial_fit** (0–1): kontribusi 0–50 poin
- **dexterity_score** (0–100): kontribusi 0–20 poin

Range: 10–150 poin. Setiap pemain punya satu entry (best session-nya).

## Project Structure

```
src/
  lib/
    axios.js           # Axios instance + interceptors (unwrap { status, message, data })
    utils.js           # cn() utility (clsx + tailwind-merge)
  hooks/
    useHealthCheck.js  # Polling GET /health setiap 30 detik
  pages/
    Dashboard.jsx      # / — leaderboard + score graph + session management
    Participants.jsx   # /participants — semua peserta
    Register.jsx        # /register — RFID-aware form
    Analytics.jsx      # /analytics/:uid — analytics + AI consultant
    Export.jsx         # /export — download Excel/PDF
  components/
    Layout.jsx          # Navbar + header + Outlet
    LeaderboardTable.jsx # Tabel ranking + podium top 3
    ParticipantCard.jsx  # Profil card peserta
    EmotionPieChart.jsx  # Donut pie + emotion bars
    SessionBarChart.jsx  # Bar chart + level line
    StatusBanner.jsx    # Online/offline indicator
    ui/                # shadcn/ui components (Button, Card, Dialog, Select, etc.)
```

## Scripts

```bash
npm run dev       # Dev server (Vite)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Catatan Teknis

- **RFID Scanner**: Scanner USB berfungsi sebagai keyboard HID. Field UID di halaman Register auto-focus dan mendeteksi input scanner secara otomatis via Enter key.
- **Leaderboard**: CTF-style dengan podium visual untuk top 3, gradient row untuk rank 1/2/3, gap antar rank, crown/medal icons.
- **Graph**: Line chart dengan 3 layer (area fill, glow, main line), monotone curve, custom dark tooltip, sorted by score, glow effect untuk champion line.
- **Light/Dark Mode**: fully responsive — graph container, axis, tooltip, legend, dan card headers semua mengikuti tema sistem/browser via Tailwind `dark:` variant.
- **Emotion Data**: Pie chart emosi menggunakan sample data. Endpoint `GET /api/v1/analytics/{participant_id}/emotions` belum tersedia di backend.
- **Rapor**: Download PDF rapor per peserta tersedia di halaman Analytics dan di halaman Participants (tombol rapor per row).
- **CORS**: Backend dikonfigurasi `AllowAllOrigins`, tidak perlu proxy.
- **Session Management**: Sesi aktif ditampilkan sebagai badge di header Dashboard. Memilih sesi lama akan menonaktifkan auto-refresh dan menampilkan banner "READ ONLY".
