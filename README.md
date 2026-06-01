# OAMP Web Admin Dashboard

Frontend dashboard for the OAMP cognitive and motoric assessment platform using robotics. Supports real-time leaderboard, competition session management, AI health analysis, tournament brackets, 1v1 duel match spectating, and report exports.

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
| Toast | Sonner |
| Payment | Midtrans Snap |

## Prerequisites

- **Node.js** >= 18
- **OAMP Backend** running (CORS configured `AllowAllOrigins`)

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173` in browser.

## Environment Variables

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxx
```

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | CTF-style leaderboard, podium, timeline graph, session selector |
| `/admin` | Admin | Read-only monitoring: stat cards, active rooms, tournaments, registrations |
| `/participants` | Participants | All participants, search, sort, download rapor |
| `/register` | Register | Registration form + RFID scanner -> redirect to Paywall |
| `/paywall/:uid` | Paywall | Payment via Midtrans Snap popup |
| `/analytics/:uid` | Analytics | Profile, sessions, charts, AI analysis (premium gate) |
| `/export` | Export | Download Excel + PDF reports |
| `/duel` | Competitif | 1v1 duel match overview |
| `/tournaments` | Tournaments | Tournament list, create tournament |
| `/tournament/:id` | TournamentDetail | Bracket view, match management |
| `/match/:room_id` | MatchDashboard | Live match spectator (outside Layout) |

## User Flow

```
Register -> /paywall/:uid -> Pay (Midtrans/simulate) -> LUNAS -> Dashboard / Analytics
```

Non-premium: data blurred (vital signs, emotions, AI analysis). Premium: full access.

## Features

### Paywall
- `POST /api/v1/payment/checkout/:uid` -> `snap_token` -> `window.snap.pay()`
- Fallback: `POST /api/v1/payment/simulate-success/:uid` if `VITE_MIDTRANS_CLIENT_KEY` not set
- `participant.is_premium` gates premium data display

### Session Management
- Session Selector on Dashboard: choose active or past session
- Read-only mode (amber banner) when viewing old sessions; auto-refresh disabled
- API: `GET/POST /api/v1/batches`

### AI Health Consultant
- AI analysis per participant via `GET /api/v1/participants/analysis/:uid`
- Supports `success` and `fallback` response statuses
- Toast notifications for each state; disclaimer shown

### Leaderboard
- CTF-style with podium visuals for top 3
- Gradient rows for rank 1/2/3
- Live score timeline graph (3-layer: area fill, glow, main line)
- Auto-refresh every 5 seconds

### Tournament
- Single-elimination bracket view
- Create tournament, register players, start cup, manage matches

### Admin Mode
- PIN-protected (hardcoded `7890`)
- Destructive actions (delete participant, start cup, create room, register players) hidden until unlocked
- `/admin` page is read-only monitoring regardless of admin mode

## API Endpoints Used

| Method | Endpoint | Used In |
|--------|----------|---------|
| GET | `/health` | Health check banner (30s polling) |
| GET | `/api/v1/leaderboard` | Dashboard leaderboard |
| GET | `/api/v1/leaderboard/timeline` | Score timeline graph |
| POST | `/api/v1/participants` | Registration form |
| GET | `/api/v1/participants/uid/:uid` | RFID UID lookup |
| GET | `/api/v1/participants/uid/:uid/sessions` | Analytics — sessions |
| GET | `/api/v1/participants/analysis/:uid` | AI Health Consultant |
| GET | `/api/v1/participants/lookup/:nickname` | Participant search |
| DELETE | `/api/v1/participants/:id` | Delete participant (admin) |
| POST | `/api/v1/payment/checkout/:uid` | Midtrans checkout |
| POST | `/api/v1/payment/simulate-success/:uid` | Test payment |
| GET | `/api/v1/batches` | Session selector |
| POST | `/api/v1/batches` | Create session |
| GET | `/api/v1/rooms` | Active room list |
| POST | `/api/v1/rooms` | Create room |
| GET | `/api/v1/tournaments` | Tournament list |
| POST | `/api/v1/tournaments` | Create tournament |
| GET | `/api/v1/tournaments/:id` | Tournament detail |
| DELETE | `/api/v1/tournaments/:id` | Delete tournament |
| POST | `/api/v1/tournaments/:id/start` | Start cup |
| POST | `/api/v1/tournaments/:id/matches/:mid/result` | Submit match result |
| GET | `/api/v1/export/excel` | Download Excel |
| GET | `/api/v1/export/pdf` | Download PDF leaderboard |
| GET | `/api/v1/export/rapor/:uid` | Download rapor PDF |

## Score Formula

```
score = (level_reached x 10) + (visuo_spatial_fit x 50) + (dexterity_score x 0.2)
```

- **level_reached** (1-8): 10-80 points
- **visuo_spatial_fit** (0-1): 0-50 points
- **dexterity_score** (0-100): 0-20 points

Range: 10-150. One entry per participant (best session).

## Project Structure

```
src/
  lib/
    axios.js                  # Axios instance, unwraps { status, message, data }
    utils.js                  # cn() utility (clsx + tailwind-merge)
  hooks/
    useHealthCheck.js         # Polling GET /health every 30s
  contexts/                   # React context providers
  pages/
    Dashboard.jsx             # / — leaderboard + score graph + session management
    Admin.jsx                 # /admin — read-only monitoring
    Participants.jsx          # /participants — all participants
    Register.jsx              # /register — RFID-aware form -> paywall redirect
    Paywall.jsx               # /paywall/:uid — Midtrans payment gate
    Analytics.jsx             # /analytics/:uid — analytics + AI (premium blur)
    Export.jsx                # /export — download Excel/PDF
    Competitif.jsx            # /duel — 1v1 duel overview
    Tournaments.jsx           # /tournaments — tournament list
    TournamentDetail.jsx      # /tournament/:id — bracket + match management
    MatchDashboard.jsx        # /match/:room_id — live match spectator
  components/
    Layout.jsx                # Navbar + header + Outlet
    ErrorBoundary.jsx         # Error boundary wrapper
    LeaderboardTable.jsx      # Ranking table + podium top 3
    ParticipantCard.jsx       # Participant profile card
    SessionBarChart.jsx       # Bar chart + level line
    StatusBanner.jsx          # Online/offline indicator
    ui/                       # shadcn/ui components
```

## Scripts

```bash
npm run dev       # Dev server (Vite)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
npx playwright test  # E2E tests (needs dev server running)
```

## Notes

- **Axios interceptor** unwraps responses: components access `.data`, `.status`, `.message` directly (not `res.data.data`).
- **RFID Scanner**: USB scanner acts as keyboard HID. UID field auto-focuses, detects scanner input via Enter key.
- **Dark mode**: responsive via Tailwind `dark:` variant; uses `next-themes`.
- **Emotion chart**: uses sample data until backend endpoint is available.
- **CORS**: backend is `AllowAllOrigins`, no proxy needed.
- **Path alias**: `@/` resolves to `src/`.
- **Tailwind v4**: no `tailwind.config.js`; uses `@import "tailwindcss"` in `src/index.css`.
- **E2E tests**: Playwright in `e2e/`. Backend must be running for full E2E flows; `test.skip()` when offline.
