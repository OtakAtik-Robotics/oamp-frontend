# OAMP Frontend — API & Component Reference

## Base URL

```
VITE_API_URL=https://api.projectidek.dev/api/v1
```

All HTTP calls via Axios instance (`src/lib/axios.js`). Response interceptor unwraps `res.data` → components access `{ status, message, data }` directly.

## Axios Config

- Timeout: 60s (global default)
- AI Analysis endpoint: 60s (explicit override)
- Response interceptor: `(res) => res.data`
- Error interceptor: rejects with raw axios error

---

## Paywall Component

**File**: `src/pages/Paywall.jsx`
**Route**: `/paywall/:uid`

### Flow

```
1. User registers → redirect /paywall/:uid
2. Paywall loads participant via GET /app/auth/{uid}
3. If participant.is_premium === true → skip paywall, show "LUNAS"
4. User clicks "Bayar Sekarang"
5. POST /payment/checkout/{uid} → snap_token
6. window.snap.pay(snap_token, callbacks)
7. onSuccess → setPaid(true) + toast + user redirected
8. [TEST] Simulasi Lunas → POST /payment/simulate-success/{uid} (fallback when no MIDTRANS_CLIENT_KEY)
```

### Midtrans Snap Integration

Script injected via `useEffect` on Paywall mount:

```js
const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;
const script = document.createElement("script");
script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
script.setAttribute("data-client-key", clientKey);
```

### Snap Callbacks

| Callback | Action |
|----------|--------|
| `onSuccess` | `setPaid(true)` → toast "Pembayaran berhasil" → navigate to Dashboard/Profile |
| `onPending` | Toast "Pembayaran pending" |
| `onError` | Toast "Pembayaran gagal" |

### Fallback (No Midtrans Key)

When `VITE_MIDTRANS_CLIENT_KEY` not set or `window.snap` unavailable → direct `POST /payment/simulate-success/{uid}`.

---

## Premium Gate (Analytics)

**File**: `src/pages/Analytics.jsx`

`isPremium` derived from `participant.is_premium` (from `GET /app/auth/{uid}`).

| Component | Locked when `!isPremium` |
|-----------|-------------------------|
| MiniStat vital signs (Best Score, Total Points, Max Level, Avg Time) | Blur + Lock overlay |
| EmotionPieChart | Blur + Lock overlay |
| AI Health Consultant analysis | Paywall UI with "Buka Rapor" button |
| Session count | Visible (not sensitive) |
| Session table | Visible |

`PremiumLock` wrapper component:

```jsx
<PremiumLock locked={!isPremium}>
  <MiniStat ... />
</PremiumLock>
```

### AI Analysis Status Handling

`GET /participants/analysis/{uid}` returns:

| status | Action |
|--------|--------|
| `success` | Show analysis, `setAiAnalysis(res.data.analysis)` |
| `fallback` | Show analysis, toast warning |
| `payment_required` | Show paywall lock UI, `setAiPaymentRequired(true)` |

---

## Payment API Endpoints

### POST /payment/checkout/{uid}

Initiate Midtrans checkout.

**Response (200)**:
```json
{
  "status": "success",
  "data": {
    "transaction_id": "TX1234567890",
    "uid": "RFID-001",
    "amount": 50000,
    "currency": "IDR",
    "status": "pending",
    "snap_token": "snap_xxx..."
  }
}
```

### POST /payment/simulate-success/{uid}

Test endpoint. Sets `is_premium = true`.

**Response (200)**:
```json
{
  "status": "success",
  "data": {
    "transaction_id": "TX1234567890",
    "uid": "RFID-001",
    "amount": 50000,
    "currency": "IDR",
    "status": "success",
    "is_premium": true,
    "paid_at": "2026-04-19T00:00:00Z"
  }
}
```

### GET /participants/analysis/{uid}

AI Health Analysis — payment-gated.

**Non-premium (200, status=payment_required)**:
```json
{
  "status": "payment_required",
  "message": "Premium subscription required",
  "data": { "locked": true }
}
```

**Premium (200, status=success)**:
```json
{
  "status": "success",
  "message": "Analysis generated",
  "data": { "analysis": "# markdown content..." }
}
```
