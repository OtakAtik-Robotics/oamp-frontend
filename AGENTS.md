# AGENTS.md

## Commands

```bash
npm install
npm run dev         # Vite dev server → http://localhost:5173
npm run build
npm run lint        # ESLint only — no typecheck step
npm run preview     # Preview production build
npx playwright test   # E2E tests (needs dev/preview running)
```

## Environment

Copy `.env.example` → `.env`. Only two vars:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxx
```

## Architecture Gotchas

- **Tailwind CSS v4** — uses `@import "tailwindcss"` (not `@tailwind` directives), `@theme inline {}` for design tokens, `@plugin` for typography, `@utility` for custom classes. **No `tailwind.config.js` exists.**
- **Path alias** `@/` → `src/` — configured in `vite.config.js` via `fileURLToPath`.
- **Axios unwraps responses.** The interceptor in `src/lib/axios.js` returns `res.data`, so components access `.data`, `.status`, `.message` directly — never `res.data.data`.
- **React Router v7** (`react-router-dom@^7.14.0`), **not v6**.
- **Backend CORS is `AllowAllOrigins`.** No proxy needed in dev.
- **ESLint only, no typecheck.** Lint uses flat config (`eslint.config.js`). shadcn/ui components (`src/components/ui/*.{js,jsx}`) are exempt from `react-refresh/only-export-components`.

## Routes

All routes in `src/App.jsx`:

| Path | Component | Notes |
|------|-----------|-------|
| `/` | Dashboard | Leaderboard + stats (auto-refresh every 5 s) |
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

- **Admin Mode PIN:** Header has a shield button (🔒). PIN is hardcoded `7890`. When active, destructive buttons appear (delete participant, start cup, register participant, input results, create room). Without admin mode, pages are read-only.
- **`/admin` is read-only monitoring** — no delete buttons on this page regardless of admin mode.
- **Premium gate:** Non-premium participants have vital signs, emotions, and AI analysis blurred. Frontend relies on `participant.is_premium`.
- **Polling:** Dashboard leaderboard every 5 s; health check banner every 30 s against `/health`.
- **Session management:** Old sessions show amber banner (read-only, no auto-refresh). Active session badge in header.

## Testing

- **E2E with Playwright** — `npx playwright test`. Tests in `e2e/`. Needs `npm run dev` or `npm run preview` running.
- Backend must be running for full E2E flows. Use `test.skip()` when backend is offline.
- No unit/component tests exist — only E2E smoke tests for navigation and tournament flows.

## Dependencies

React 19, Vite 8, Tailwind CSS v4, shadcn/ui (Radix UI), React Router v7, Axios, Recharts, TanStack Query, next-themes, sonner, react-markdown.
