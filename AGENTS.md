# AGENTS.md

## Commands

```bash
npm install
npm run dev         # Vite dev server → http://localhost:5173
npm run build
npm run lint        # ESLint only — no typecheck step
npm run preview     # Preview production build
npx playwright test # E2E tests (auto-starts dev server; reuses existing)
```

## Environment

- Node.js >= 18
- Copy `.env.example` → `.env`:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxx
```

## Architecture Gotchas

- **No TypeScript** — plain `.js`/`.jsx` only. shadcn/ui components are also JS (`tsx: false` in `components.json`).
- **Tailwind CSS v4** — uses `@import "tailwindcss"`, `@theme inline {}`, `@plugin`, `@utility`. **No `tailwind.config.js`**.
- **Path alias** `@/` → `src/` — configured in `vite.config.js` via `fileURLToPath`.
- **Axios unwraps responses.** The interceptor in `src/lib/axios.js` returns `res.data`, so components access `.data`, `.status`, `.message` directly — never `res.data.data`.
- **React Router v7** (`react-router-dom@^7.14.0`), **not v6**.
- **Backend CORS is `AllowAllOrigins`.** No proxy needed in dev.
- **ESLint flat config** (`eslint.config.js`). shadcn/ui components (`src/components/ui/*.{js,jsx}`) are exempt from `react-refresh/only-export-components`.

## Routes

All routes in `src/App.jsx`:

| Path | Component | Notes |
|------|-----------|-------|
| `/` | Dashboard | Leaderboard + stats |
| `/admin` | Admin | Read-only monitoring: stats, rooms, tournaments |
| `/participants` | Participants | Participant list |
| `/register` | Register | Registration form |
| `/paywall/:uid` | Paywall | Midtrans payment gateway |
| `/analytics/:uid` | Analytics | Individual analytics + AI analysis |
| `/export` | Export | Excel/PDF downloads |
| `/duel` | Competitif | Duel management |
| `/tournaments` | Tournaments | Tournament list |
| `/tournament/:id` | TournamentDetail | Tournament bracket |
| `/match/:room_id` | MatchDashboard | **Outside Layout** — standalone full-page |

All routes except `/match/:room_id` are wrapped in `<Layout />` (header + sidebar + health banner).

## Key Behaviors

- **Admin Mode PIN:** Header has a shield button. PIN is hardcoded `7890`. When active, destructive buttons appear (delete participant, start cup, register participant, input results, create room). Without admin mode, pages are read-only.
- **`/admin` is read-only monitoring** — no delete buttons on this page regardless of admin mode.
- **Premium gate:** Non-premium participants have vital signs, emotions, and AI analysis blurred. Frontend relies on `participant.is_premium`.
- **Polling intervals:**
  - Dashboard (leaderboard, timeline): every 5 s, but **paused when viewing an old (non-active) session**.
  - Admin (stats, rooms, tournaments): 5 s or 3 s.
  - Tournaments list: 5 s; TournamentDetail bracket: 3 s.
  - Health check banner: 30 s against `/health`.
- **Session management:** Old sessions show amber banner (read-only, no auto-refresh). Active session badge in header.

## Testing

- **E2E with Playwright** — `npx playwright test`. Tests in `e2e/`. Playwright config auto-starts `npm run dev` and reuses an existing server if one is already running.
- Backend must be running for full E2E flows. Use `test.skip()` when backend is offline.
- No unit/component tests exist — only E2E smoke tests for navigation and tournament flows.

## Outdated Docs

- `CLAUDE.md` describes an earlier scaffolding state (Tailwind v3, React Router v6, incomplete pages). Do not rely on it.
