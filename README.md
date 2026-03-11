# NairaTracker — Next.js

Track every naira. Hit your goal.

## Stack
- **Next.js 14** (App Router)
- **TypeScript** with strict mode
- **Supabase** — auth + postgres + realtime
- **DDD architecture** — domain / infrastructure / application / ui

## Architecture

```
naira-next/
├── app/
│   ├── layout.tsx              # Root layout, fonts, global styles
│   ├── page.tsx                # Redirects based on auth state (server)
│   ├── (auth)/login/page.tsx   # Login/signup page
│   ├── (app)/                  # Protected route group
│   │   ├── layout.tsx          # Auth guard + header + BottomNav
│   │   ├── dashboard/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── add/page.tsx
│   │   └── settings/page.tsx
│   └── api/webhook/route.ts    # n8n POST endpoint (server-side only)
│
├── domain/                     # Pure TypeScript — zero dependencies
│   ├── transaction/            # Types, categories, business logic
│   ├── goal/                   # Goal type + progress calculations
│   └── user/                   # AppUser type + mapper
│
├── infrastructure/supabase/
│   ├── server.ts               # Server client (cookies) + service client
│   ├── client.ts               # Browser client (singleton)
│   └── repositories/           # All DB calls isolated here
│
├── application/                # React hooks — bridge domain ↔ UI
│   ├── useAuth.ts
│   ├── useTransactions.ts      # Includes Supabase realtime subscription
│   ├── useGoal.ts
│   ├── useToast.ts
│   └── useExport.ts
│
├── ui/
│   ├── tokens.ts               # Design system (colors, spacing, radius, font)
│   ├── utils.ts                # fmt(), fmtFull(), todayISO(), monthLabel()
│   ├── types.ts                # FormState, shared types
│   ├── components/             # Atomic, reusable, prop-driven
│   └── screens/                # Page-level views (receive props only)
│
└── middleware.ts               # Route protection — unauthenticated → /login
```

## Setup

### 1. Supabase SQL
Run `supabase-schema.sql` in your Supabase project → SQL Editor.

Then in Supabase dashboard:
- **Authentication → Settings → Disable Sign Ups** (invite users manually)
- **Authentication → Rate Limits** → tighten login attempt limits

### 2. Environment variables
```bash
cp .env.example .env.local
```
Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase → Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from same page
- `SUPABASE_SERVICE_ROLE_KEY` — from same page (keep this secret!)
- `WEBHOOK_SECRET` — any random string, e.g. `openssl rand -hex 32`

### 3. Local dev
```bash
npm install
npm run dev
# → http://localhost:3000
```

### 4. Deploy to Vercel
```bash
# Push to GitHub (. env.local is gitignored)
git init && git add . && git commit -m "initial"
gh repo create naira-tracker --private --push
```
Then:
1. vercel.com → New Project → import repo
2. Add all 4 env vars in Vercel dashboard
3. Deploy → get your URL

---

## n8n Auto-Import

Your bank sends an SMS/email alert → n8n parses it → POSTs to your webhook.

### Webhook endpoint
```
POST https://your-domain.com/api/webhook
```

### Payload
```json
{
  "secret":   "your_WEBHOOK_SECRET_value",
  "user_id":  "your-user-uuid-from-settings-page",
  "amount":   50000,
  "type":     "out",
  "category": "Food",
  "note":     "GTBank debit alert",
  "date":     "2026-03-11"
}
```

### n8n workflow
1. **Trigger**: Gmail node — watch for emails matching "debit alert" or "credit alert"
2. **Function node**: parse amount + type from email body
3. **HTTP Request node**: POST to webhook URL with above payload
4. Transaction appears in the app instantly with an **AUTO** badge

### Test the webhook
```bash
curl -X POST https://your-domain.com/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your_secret",
    "user_id": "your_user_id",
    "amount": 500000,
    "type": "in",
    "category": "Client Payment",
    "note": "Test from curl"
  }'
```

### Security
- `WEBHOOK_SECRET` never reaches the browser — server-only env var
- `SUPABASE_SERVICE_ROLE_KEY` never reaches the browser — server-only
- The webhook route bypasses RLS deliberately (it's a trusted server-to-server call)
- Every other DB operation goes through the anon key + RLS

---

## Inviting users
Since public signup is disabled:
Supabase → Authentication → Users → **Invite User** → enter their email.
They'll receive a magic link to set their password.
