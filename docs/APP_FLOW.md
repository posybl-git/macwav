# APP_FLOW.md — macwav
**Project**: macwav – Artist Development & Client Portal
**Prepared by**: Hammad Khan, Posybl Business Solutions
**Last Updated**: April 2026
**Version**: 1.0

---

## 1. Entry Points

### Primary Entry Points
- **Direct URL** (`/`) → Public login/signup page. All unauthenticated users land here.
- **Password Reset Email** → `/auth/reset-password?token=xxx` → Set new password form
- **Invite/Magic Link Email** → `/auth/confirm?token=xxx` → Auto-authenticate → redirect to `/dashboard`
- **Notification Email** → Deep link to `/songs/[songId]` or `/dashboard` depending on event
- **Booking Confirmation Email** → Deep link to `/schedule/my-bookings`

### Authentication Gate
All routes except `/` and `/auth/*` require an active session. Unauthenticated requests to protected routes redirect to `/`.

**Role routing on login**:
- `role = 'artist'` → `/dashboard`
- `role = 'admin'` → `/admin`

---

## 2. Core User Flows

---

### Flow 1: Artist Registration

**Goal**: New artist creates account and lands on dashboard
**Entry Point**: `/` → "Create Account"

#### Happy Path

1. **Page: `/`**
   - User clicks "Create Account" → navigate to `/auth/signup`

2. **Page: `/auth/signup`**
   - Fields: first name, last name, email, password, confirm password
   - Client-side validation: email format, password min 8 chars + 1 uppercase + 1 number, passwords match
   - On submit: Supabase Auth creates user → DB trigger inserts `profiles` row (`role = 'artist'`, `credit_balance = 0`)
   - Navigate to `/dashboard`

3. **Page: `/dashboard` (first visit)**
   - Credit balance = 0
   - "Buy Credits" CTA prominent
   - "Start a Song" CTA visible but inactive (disabled until balance > 0)
   - Empty projects list with onboarding prompt

#### Error States
- Email already registered → "An account with this email already exists. Sign in instead."
- Weak password → inline strength indicator
- Network failure → toast: "Something went wrong. Please try again."

---

### Flow 2: Artist Login

**Goal**: Returning artist accesses their account
**Entry Point**: `/`

#### Happy Path
1. Artist enters email + password → "Sign In"
2. Supabase Auth validates → session created → role checked
   - `role = 'artist'` → `/dashboard`
   - `role = 'admin'` → `/admin`

#### Error States
- Wrong credentials → "Incorrect email or password."
- Too many attempts → "Too many attempts. Please wait 15 minutes."

---

### Flow 3: Artist Purchases Credits

**Goal**: Artist buys a credit bundle via Stripe
**Entry Point**: Dashboard "Buy Credits" CTA OR low-balance banner → `/credits/purchase`

#### Happy Path

1. **Page: `/credits/purchase`**
   - Credit bundle option cards (amounts + prices)
   - Current balance shown
   - User selects bundle → "Buy Now"
   - System calls `/api/stripe/create-checkout` → returns Stripe Checkout URL

2. **Stripe Checkout (hosted)**
   - Artist completes card payment
   - On success → Stripe fires `checkout.session.completed` to `/api/webhooks/stripe`

3. **Webhook handler**:
   - Verify Stripe signature
   - Add credits to `profiles.credit_balance` (atomic update)
   - Insert `credit_transactions` record (`type: 'purchase'`)
   - Send "Credits Added" email via Resend
   - Insert `notifications` record
   - Redirect to `/credits/success`

4. **Page: `/credits/success`**
   - Updated balance shown
   - "Start a Song" CTA

#### Error States
- Payment declined → Stripe redirects to `/credits/cancel` → no credits added
- Webhook failure → server retries 3x; admin alerted if all fail
- Duplicate webhook → idempotency key blocks double credit addition

#### Edge Cases
- Artist closes Stripe checkout → no balance change
- Credits processing while artist tries to buy more → UI disables Buy button during pending state

---

### Flow 4: Artist Selects a Song Package

**Goal**: Artist spends credits to start a tracked song project
**Entry Point**: Dashboard "Start a Song" CTA → `/songs/new`
**Prerequisite**: Sufficient credit balance

#### Happy Path

1. **Page: `/songs/new`**
   - Song name input
   - Three package cards: CREATE (3,000 pts) / BUILD (7,000 pts) / LAUNCH (15,000 pts)
   - Each card shows full deliverables list
   - "Select" button disabled if balance < package cost
   - User enters song name → selects package → "Confirm & Start"

2. **Route Handler: `/api/songs/create`**
   - Validate session
   - Atomic check: `balance >= package_cost`
   - Deduct credits from `profiles.credit_balance`
   - Insert `credit_transactions` record (`type: 'deduction'`)
   - Insert `songs` record (name, tier, stage, status)
   - Insert all `deliverables` rows for the selected tier
   - Send admin notification email
   - Return `songId` → redirect to `/songs/[songId]`

3. **Page: `/songs/[songId]`**
   - Song name, package badge, stage indicator
   - All deliverables listed as Pending
   - Success state confirmed

#### Error States
- Insufficient credits → "You need [X] more credits. Buy more to continue." — confirm disabled
- No song name entered → "Please enter a song name."
- Race condition (balance changes between check and deduction) → "Unable to confirm. Your balance may have changed. Try again."

---

### Flow 5: Artist Tracks Song Progress

**Goal**: Artist monitors deliverable statuses in real time
**Entry Point**: Dashboard song card → `/songs/[songId]`

#### Happy Path

1. **Page: `/dashboard`**
   - Song cards: name, package badge, stage, % progress bar
   - Click card → `/songs/[songId]`

2. **Page: `/songs/[songId]`**
   - Deliverables checklist with status icons (Pending / In Progress / Completed)
   - Revision count (e.g. "Mix Revisions: 1 of 2")
   - Last updated timestamp
   - Supabase Realtime subscription → admin status changes appear without page refresh
   - Read-only for artist

#### Edge Cases
- Admin updates deliverable → artist sees change instantly via Realtime
- All deliverables completed → progress bar = 100%, stage badge updates

---

### Flow 6: Artist Views Credit History (P1)

**Goal**: Artist reviews full transaction log
**Entry Point**: Dashboard or profile menu → `/credits/history`

#### Happy Path
1. **Page: `/credits/history`**
   - Paginated table: date, type (Purchase / Deduction / Adjustment), amount, balance after, description
   - Most recent first, 20 rows per page

---

### Flow 7: Artist Books a Session (P1 — Scheduling)

**Goal**: Artist books a recording or meeting session
**Entry Point**: Dashboard → "Book a Session" → `/schedule/book`

#### Happy Path

1. **Page: `/schedule/book`**
   - Calendar with available slots
   - Slot visibility rule:
     - CREATE / BUILD artists → standard slots only
     - LAUNCH / priority-flagged → all slots (standard + premium)
   - Select date, time, session type → "Confirm Booking"

2. **Route Handler: `/api/bookings/create`**
   - Validate slot still available (race condition check)
   - Insert `bookings` record
   - Mark slot `is_available = false`
   - Send booking confirmation email to artist
   - Send admin notification
   - Redirect to `/schedule/confirmation`

3. **Page: `/schedule/confirmation`**
   - Booking details confirmed

#### Error States
- Slot taken concurrently → "This slot is no longer available. Choose another."
- No slots available → empty state with message

---

### Flow 8: Admin Login & Overview

**Goal**: Admin accesses the platform management dashboard
**Entry Point**: `/` → login with admin credentials

#### Happy Path
1. Admin credentials → `role = 'admin'` → redirect to `/admin`
2. **Page: `/admin`**
   - Total active artists
   - Total active projects
   - Recent credit purchases feed
   - Priority clients list
   - Recent milestone activity

---

### Flow 9: Admin Updates Deliverable Status

**Goal**: Mark a deliverable complete → artist notified in real time
**Entry Point**: `/admin/projects` → `/admin/projects/[songId]`

#### Happy Path

1. **Page: `/admin/projects`**
   - All projects across all artists
   - Filters: status, package tier, artist name
   - Click project → `/admin/projects/[songId]`

2. **Page: `/admin/projects/[songId]`**
   - Deliverables with status dropdowns (Pending / In Progress / Completed)
   - Stage selector, revision counter, admin notes field
   - Admin changes status → saves

3. **System Action**:
   - Update `deliverables` row
   - Supabase Realtime broadcasts to artist's open session
   - Send email notification to artist via Resend
   - Insert `notifications` record

---

### Flow 10: Admin Manually Adjusts Credit Balance

**Goal**: Issue credit correction (refund, bonus, error fix)
**Entry Point**: `/admin/users/[userId]`

#### Happy Path

1. Admin views artist account → sees balance + full transaction history
2. Clicks "Adjust Balance"
3. **Modal**: amount input, mandatory reason field, confirmation prompt for deductions
4. Submit:
   - Update `profiles.credit_balance`
   - Insert `credit_transactions` (`type: 'manual_adjustment'`, reason + admin ID logged)
   - Send email notification to artist if positive adjustment

#### Error States
- Reason field empty → "Please provide a reason for this adjustment."
- Adjustment would make balance negative → "This would result in a negative balance. Please review."
- Negative value entered → confirmation dialog: "This will deduct [X] credits from [Artist Name]. Are you sure?"

---

## 3. Navigation Map

### Artist Navigation
```
/ (Login / Signup)
├── /auth/signup
├── /auth/forgot-password
└── /auth/reset-password

/dashboard (Artist Home)
├── /credits
│   ├── /credits/purchase
│   ├── /credits/success
│   ├── /credits/cancel
│   └── /credits/history          ← P1
├── /songs
│   ├── /songs/new
│   └── /songs/[songId]
├── /schedule                      ← P1
│   ├── /schedule/book
│   ├── /schedule/confirmation
│   └── /schedule/my-bookings
└── /profile
```

### Admin Navigation
```
/admin (Overview Dashboard)
├── /admin/users
│   └── /admin/users/[userId]
├── /admin/projects
│   └── /admin/projects/[songId]
├── /admin/credits
└── /admin/schedule                ← P1
    ├── /admin/schedule/slots
    └── /admin/schedule/bookings
```

---

## 4. Screen Inventory

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Login + signup |
| `/auth/signup` | Public | Artist registration |
| `/auth/forgot-password` | Public | Request password reset |
| `/auth/reset-password` | Public (token) | Set new password |
| `/dashboard` | Artist | Home — credits, projects, quick actions |
| `/credits/purchase` | Artist | Buy credit bundles |
| `/credits/success` | Artist | Payment confirmation |
| `/credits/cancel` | Artist | Payment failed/cancelled |
| `/credits/history` | Artist | Credit transaction log (P1) |
| `/songs/new` | Artist | Name song + choose package |
| `/songs/[songId]` | Artist (own only) | Song detail — deliverables, stage, revisions |
| `/schedule/book` | Artist | Book a session (P1) |
| `/schedule/my-bookings` | Artist | View bookings (P1) |
| `/profile` | Artist | Edit personal info |
| `/admin` | Admin only | Platform overview |
| `/admin/users` | Admin only | All artists |
| `/admin/users/[userId]` | Admin only | Artist profile + credits + projects |
| `/admin/projects` | Admin only | All song projects |
| `/admin/projects/[songId]` | Admin only | Edit deliverables, stage, notes |
| `/admin/credits` | Admin only | Platform-wide transaction log |
| `/admin/schedule/slots` | Admin only | Manage time slots (P1) |
| `/admin/schedule/bookings` | Admin only | All bookings (P1) |

---

## 5. Decision Points

```
// Auth gate (middleware on every protected route)
IF session exists AND role = 'artist'
  THEN allow /dashboard/*, /songs/*, /credits/*, /schedule/*, /profile
ELSE IF session exists AND role = 'admin'
  THEN allow /admin/*
ELSE
  THEN redirect to /

// Package selection — credit check
IF artist.credit_balance >= selected_package.cost
  THEN enable "Confirm & Start"
ELSE
  THEN disable, show "You need [X] more credits"

// Schedule slot visibility
IF artist.package_tier = 'LAUNCH' OR artist.is_priority = true
  THEN show all available slots (standard + premium)
ELSE
  THEN show standard slots only

// Dashboard low-balance banner
IF artist.credit_balance < 3000
  THEN show low-balance warning banner with "Buy Credits" CTA
ELSE
  THEN hide banner

// Credit deduction guard
IF (credit_balance - deduction) < 0
  THEN block transaction, return error
ELSE
  THEN process atomically

// Artist data isolation
IF artist requests /songs/[songId] where song.user_id != artist.id
  THEN Supabase RLS returns empty → 404
```

---

## 6. Error Handling

| Error | Display | Recovery |
|---|---|---|
| 404 Not Found | macwav-branded 404 page | Back to Dashboard |
| 500 Server Error | "Something went wrong" friendly page | Retry + contact support |
| Auth session expired | Toast: "Session expired. Please sign in again." | Auto-redirect to `/` |
| Stripe webhook failure | Silent retry x3; admin email alert | Admin manual credit adjustment |
| Realtime dropped | Subtle banner: "Live updates paused — reconnecting..." | Auto-reconnects |
| Artist accesses another artist's song | RLS blocks — returns 404 | Redirect to `/dashboard` |
| Admin route accessed by artist | Middleware blocks → redirect to `/dashboard` | N/A |

---

## 7. Responsive Behavior

| Breakpoint | Navigation | Layout |
|---|---|---|
| Mobile < 640px | Hamburger menu + bottom nav bar | Single column, stacked cards |
| Tablet 640–1024px | Collapsible sidebar | Two-column where useful |
| Desktop > 1024px | Persistent left sidebar | Sidebar + main content area |

Full functionality required on iOS Safari and Chrome for Android (web, not native app per PRD).

---

## 8. Animations & Transitions

| Element | Animation | Duration |
|---|---|---|
| Page navigation | Fade in/out | 200ms |
| Modal open/close | Scale + fade | 200ms |
| Sidebar (mobile) | Slide from left | 250ms |
| Toast notifications | Slide in top-right, auto-dismiss | 300ms in / 4s hold |
| Deliverable status change | Glow flash + icon swap | 400ms |
| Credit balance update | Count-up animation | 600ms |
| Loading skeleton | `animate-pulse` | Continuous |
| Package card hover | Primary color border glow (#905AF6) | 150ms |
