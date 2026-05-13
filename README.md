# ParkFlow Frontend - Phase 2B.1

Modern Next.js 15 + Tailwind CSS frontend with **light glassmorphism**, premium animations (Framer Motion), and role-based UI.

## What's in Phase 2B.1

✅ **Login page** — animated blobs, floating particles, glass card, shake-on-error
✅ **Dashboard** — animated stat cards (count-up effect), live active vehicles list, gradient hero
✅ **Sidebar navigation** — role-based menu items, animated active indicator
✅ **Mobile bottom nav** — for phones/tablets
✅ **Auth flow** — JWT token management, auto-redirect on 401
✅ **Glassmorphism design system** — frosted glass, mesh gradients, smooth hovers
✅ **Skeleton loaders** — shimmer effects while data loads
✅ **Toast notifications** — Sonner (premium look)
✅ **Live updates** — Dashboard auto-refreshes every 30 seconds

⏳ **Coming in 2B.2** (next sub-phase): Check-In, Check-Out, Active Vehicles, Search, Today's Sessions
⏳ **Coming in 2B.3**: Reports with animated charts, Vehicle Types & Rates admin, User Management

---

## Setup Instructions (Windows)

### Prerequisites
- ✅ Node.js v22+ (you have it)
- ✅ npm 11+ (you have it)
- ✅ Backend running at http://localhost:8000 (Phase 2A)

### Steps

#### 1. Open a NEW terminal in VS Code

You should have **2 terminals** running:
- **Terminal 1:** Backend (`uvicorn app.main:app --reload`)
- **Terminal 2:** Frontend (we'll start now)

To open new terminal: Click `+` in terminal panel, or press `Ctrl+Shift+\``

#### 2. Navigate to frontend folder

```powershell
cd C:\Users\QBS PC\Downloads\parkflow-frontend
```

(Adjust the path based on where you extract the zip)

#### 3. Install dependencies

```powershell
npm install
```

Takes 2-3 minutes. Will install Next.js, Tailwind, Framer Motion, etc.

#### 4. Start the dev server

```powershell
npm run dev
```

Should show:
```
▲ Next.js 15.0.3
- Local:        http://localhost:3000
✓ Ready in 1.2s
```

#### 5. Open in browser

**http://localhost:3000**

You'll see the login screen with floating animated blobs and glass card.

---

## How to Login

Use the **demo credential chips** at the bottom of the login screen, OR type manually:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Operator | `operator` | `operator123` |
| Viewer | `viewer` | `viewer123` |

Click **Sign in** → Welcome to the dashboard! 🎉

---

## What you'll see

### Login screen
- 3 floating gradient blobs animating in background
- Frosted glass card with blur
- Logo with subtle rotation animation
- Form fields with glass focus state
- Quick demo login buttons
- Shake animation on wrong credentials

### Dashboard
- Greeting based on time of day
- Live clock
- 4 animated stat cards with **count-up** numbers (Active Vehicles, Check-Ins, Check-Outs, Revenue)
- "Live" pulse indicator on active vehicles card
- Active vehicles list with stagger animation
- Quick links panel
- Auto-refresh every 30 seconds

### Sidebar
- Animated logo (rotates on hover)
- User profile card with role
- Role-based menu items (Admin sees more options than Operator/Viewer)
- Smooth animated active indicator that slides between items
- Logout button

---

## Important Notes

⚠️ **Backend MUST be running** — Frontend talks to http://localhost:8000

⚠️ **CORS is already configured** in backend for localhost:3000

⚠️ **First load might be slow** (3-5 seconds) — Next.js compiling. After that, it's fast.

---

## Common Issues

**"Cannot connect to API"**
→ Backend not running. Open Terminal 1, navigate to `parkflow/parkflow`, activate venv, run `uvicorn app.main:app --reload`.

**"Login failed" with correct credentials**
→ Check backend terminal for errors. Verify with `psql -U postgres -d parkflow -c "SELECT username, role FROM users;"`

**"npm install" fails**
→ Try `npm install --legacy-peer-deps`

**Port 3000 already in use**
→ Use `npm run dev -- --port 3001` and visit http://localhost:3001

**Page shows "Loading..." forever**
→ Open browser console (F12), check for errors. Usually CORS or backend down.

---

## Project Structure

```
parkflow-frontend/
├── src/
│   ├── app/
│   │   ├── login/page.tsx          ← Login screen
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          ← Dashboard layout (sidebar + nav)
│   │   │   ├── page.tsx            ← Dashboard home
│   │   │   ├── checkin/page.tsx    ← (coming)
│   │   │   ├── checkout/page.tsx   ← (coming)
│   │   │   └── ...
│   │   ├── layout.tsx              ← Root layout (toast, mesh bg)
│   │   └── globals.css             ← Design system
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   ├── TopBar.tsx
│   │   ├── StatCard.tsx
│   │   ├── AuthGuard.tsx
│   │   └── ...
│   └── lib/
│       ├── api.ts                  ← Axios client + endpoint helpers
│       ├── auth.ts                 ← Zustand auth store
│       └── utils.ts                ← Helpers (formatCurrency, etc.)
├── package.json
├── tailwind.config.js              ← Custom animations + colors
├── next.config.mjs
└── .env.local                      ← API URL config
```

---

## Next Phase: 2B.2

After you confirm 2B.1 is running, we'll build:
- **Check-In page** — vehicle type cards, plate input with live preview, slip generation animation
- **Check-Out page** — token/plate search, fee calculation animation, success celebration
- **Active Vehicles** — full list with filters
- **Today's Sessions** — table view with status badges
- **Search page** — advanced filters with date range picker

All with the same animation quality + glassmorphism style.

---

**Run the setup steps and tell me when you see the dashboard! 🎉**
