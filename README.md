# OAMP Web Admin Dashboard

Frontend web dashboard untuk sistem **OAMP (Otak Atik Merah Putih)** permainam platform asesmen kognitif dan motorik anak menggunakan robotika. Dashboard ini menampilkan leaderboard, registrasi peserta via RFID, analitik per peserta, dan export laporan.

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

## Prerequisites

- **Node.js** >= 18
- **OAMP Backend** running on `http://localhost:8080` (see `oamp-backend` repo)

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
VITE_API_URL=http://localhost:8080/api/v1
```

Untuk production, ganti ke URL server backend yang sesuai.

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | **Dashboard** — Leaderboard top 10 peserta, stat cards, auto-refresh 15 detik |
| `/register` | **Registration Station** — Form registrasi peserta baru dengan dukungan RFID scanner |
| `/analytics/:uid` | **Participant Analytics** — Profil, riwayat sesi, chart skor, distribusi emosi |
| `/export` | **Export** — Download laporan Excel (.xlsx) dan PDF |

## API Endpoints (Backend)

Dashboard ini berkomunikasi dengan backend melalui endpoint berikut:

| Method | Endpoint | Digunakan di |
|--------|----------|-------------|
| `GET` | `/health` | Health check (status banner) |
| `GET` | `/api/v1/leaderboard` | Dashboard leaderboard |
| `POST` | `/api/v1/participants` | Registration form |
| `GET` | `/api/v1/robot/auth/{uid}` | RFID UID lookup |
| `GET` | `/api/v1/app/auth/{uid}` | Analytics — profil + semua sesi |
| `GET` | `/api/v1/export/excel` | Download Excel |
| `GET` | `/api/v1/export/pdf` | Download PDF |

## Project Structure

```
src/
  lib/
    axios.js           # Axios instance + interceptors
    utils.js           # cn() utility (clsx + tailwind-merge)
  hooks/
    useHealthCheck.js  # Polling GET /health setiap 30 detik
  pages/
    Dashboard.jsx      # / (leaderboard + stats)
    Register.jsx       # /register (RFID-aware form)
    Analytics.jsx      # /analytics/:uid
    Export.jsx         # /export (blob download)
  components/
    Layout.jsx         # Navbar + header + Outlet
    LeaderboardTable.jsx
    ParticipantCard.jsx
    EmotionPieChart.jsx
    SessionBarChart.jsx
    StatusBanner.jsx
    ui/                # shadcn/ui components
```

## Scripts

```bash
npm run dev       # Dev server (Vite)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Notes

- **RFID Scanner**: Scanner USB berfungsi sebagai keyboard HID. Field UID di halaman Register auto-focus dan mendeteksi input scanner secara otomatis.
- **Emotion Data**: Pie chart emosi saat ini menggunakan sample data. Endpoint backend `GET /api/v1/analytics/{participant_id}/emotions` belum tersedia.
- **CORS**: Backend sudah dikonfigurasi `AllowAllOrigins`, tidak perlu proxy.
