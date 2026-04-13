# IMPLEMENTATION_PLAN.md — macwav
**Project**: macwav – Artist Development & Client Portal
**Prepared by**: Hammad Khan, Posybl Business Solutions
**Last Updated**: April 2026
**Version**: 1.0
**MVP Duration**: 5 Weeks

---

## Overview

Maps the 5-week build to concrete, ordered development steps. Each phase is one week. Every step has a goal, tasks, and a testable checklist.

**Stack**: Next.js 15 + Supabase (BaaS) + Tailwind CSS + shadcn/ui + Stripe + Resend → Vercel via GitHub

**P0 = MVP scope (Weeks 1–5). P1 = scheduling + credit history (V1.0 scope — built in Week 4 if P0 is ahead of schedule).**

---

## Phase 1 — Foundation & Core Infrastructure (Week 1)

**Goal**: Next.js project running, Supabase connected, database schema live, auth working, artist dashboard shell built. Everything else depends on this week being solid.

---

### Step 1.1: Initialize Project

**Duration**: 2–3 hours

```bash
npx create-next-app@latest macwav \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd macwav

npm install \
  @supabase/supabase-js @supabase/ssr \
  zustand react-hook-form zod \
  @tanstack/react-query @tanstack/react-query-devtools \
  stripe @stripe/stripe-js \
  resend @react-email/components \
  lucide-react sonner \
  @sentry/nextjs

npx shadcn@latest init

npm install -D husky lint-staged vitest @playwright/test supabase
```

Add macwav color tokens to `tailwind.config.ts` (see `TECH_STACK.md` Section 2).

Add CSS variables to `src/app/globals.css` (see `macwav-frontend-guidelines.md`).

**Success Criteria**:
- [ ] `npm run dev` runs without errors at `localhost:3000`
- [ ] TypeScript strict mode enabled in `tsconfig.json`
- [ ] Tailwind renders macwav colors (`bg-background`, `text-primary` etc.)
- [ ] ESLint passes with no errors

---

### Step 1.2: Supabase Project Setup

**Duration**: 1–2 hours

1. Create Supabase project at https://supabase.com (US East region)
2. Copy Project URL, anon key, and service_role key from Dashboard → Settings → API
3. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Create `/src/lib/supabase/client.ts` and `server.ts` (see `BACKEND_STRUCTURE.md` Section 7)
5. Run `supabase init` and `supabase link --project-ref [ref]`

**Success Criteria**:
- [ ] All 3 Supabase env vars set in `.env.local`
- [ ] `supabase link` succeeds
- [ ] Browser client and server client utilities created

---

### Step 1.3: Database Schema

**Duration**: 4–5 hours

```bash
supabase migration new initial_schema
```

Apply schema from `BACKEND_STRUCTURE.md` Section 2. In order:

1. `profiles` table + CHECK constraint on `credit_balance`
2. `songs` table
3. `deliverables` table
4. `credit_transactions` table
5. `bookings` table (stub — full build in Week 4)
6. `schedule_slots` table (stub)
7. `notifications` table
8. RLS policies on every table
9. `handle_new_user` trigger
10. `set_updated_at` trigger on profiles, songs, deliverables

```bash
supabase db reset
supabase db push
supabase gen types typescript --project-id [ref] > src/types/supabase.ts
```

**Success Criteria**:
- [ ] All tables visible in Supabase Dashboard
- [ ] RLS enabled on every table (verify in Dashboard → Database → RLS)
- [ ] `src/types/supabase.ts` generated with correct types
- [ ] Manual test: creating a user in auth.users auto-creates a `profiles` row via trigger
- [ ] Manual test: inserting a row with `credit_balance = -1` fails (CHECK constraint)

---

### Step 1.4: Authentication System

**Duration**: 4–5 hours

Build these pages:
- `src/app/page.tsx` → Login page (also houses "Create Account" link)
- `src/app/auth/signup/page.tsx` → Registration form
- `src/app/auth/forgot-password/page.tsx` → Request reset email
- `src/app/auth/reset-password/page.tsx` → Set new password (Supabase token from URL)

Build `src/middleware.ts` (see `BACKEND_STRUCTURE.md` Section 6):
- Protects `/dashboard/*`, `/songs/*`, `/credits/*`, `/schedule/*`, `/profile/*`, `/admin/*`
- Role check: admin routes require `role = 'admin'`
- Unauthenticated → redirect to `/`

**Success Criteria**:
- [ ] New artist can register → profile auto-created → lands on `/dashboard`
- [ ] Artist logs in → `/dashboard`. Admin logs in → `/admin`
- [ ] Password reset email received and works end-to-end
- [ ] Unauthenticated access to `/dashboard` → redirect to `/`
- [ ] Artist accessing `/admin` → redirect to `/dashboard`
- [ ] Logout clears session and redirects to `/`

---

### Step 1.5: Artist Dashboard Shell & Navigation

**Duration**: 3–4 hours

Build:
- `src/app/dashboard/layout.tsx` → Persistent sidebar (desktop) + hamburger (mobile)
- `src/app/dashboard/page.tsx` → Dashboard home (placeholder sections: credit balance widget, song cards list, quick action buttons)
- `src/components/layout/Sidebar.tsx` → Nav links per role
- `src/components/layout/MobileNav.tsx` → Mobile hamburger + bottom nav

Design system: `background: #101014`, `surface: #19191F`, `primary: #905AF6`, `accent: #13DAC6`. Follow `macwav-frontend-guidelines.md` exactly.

**Success Criteria**:
- [ ] Dashboard renders at `/dashboard` with correct macwav dark theme
- [ ] Sidebar shows correct nav links
- [ ] Mobile nav works at 375px viewport
- [ ] Placeholder sections visible with loading skeletons
- [ ] Admin `/admin` page renders (basic empty layout for now)

---

### ✅ Week 1 / Milestone 1 — Friday Review Checklist
- [ ] New artist can sign up, log in, and reset password
- [ ] Artist sees their dashboard (shell) with correct dark theme layout
- [ ] Admin login routes to `/admin` area
- [ ] All 7 database tables confirmed in Supabase Dashboard
- [ ] RLS enabled on all tables
- [ ] Mobile responsive at 375px on dashboard
- [ ] TypeScript compiles with zero errors

---

## Phase 2 — Credit System & Song Packages (Week 2)

**Goal**: Full credit purchase flow via Stripe, credit balance management, song package selection, song + deliverables creation.

---

### Step 2.1: Stripe Integration Setup

**Duration**: 2 hours

1. Add Stripe keys to `.env.local` and Vercel environment
2. Register webhook in Stripe Dashboard → `/api/webhooks/stripe`
3. Event to listen for: `checkout.session.completed`

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Local testing:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Success Criteria**:
- [ ] Stripe test keys configured
- [ ] Stripe CLI webhook listener running locally

---

### Step 2.2: Credit Purchase Flow

**Duration**: 5–6 hours

Build:
- `src/app/credits/purchase/page.tsx` → Bundle option cards (3,000 / 7,000 / 15,000 pts) with prices, current balance shown
- `src/app/api/stripe/create-checkout/route.ts` → Creates Stripe Checkout session with `metadata: { user_id, credit_amount }`
- `src/app/api/webhooks/stripe/route.ts` → Handles `checkout.session.completed` (see `BACKEND_STRUCTURE.md` Section 4)
- `src/app/credits/success/page.tsx` → Success confirmation
- `src/app/credits/cancel/page.tsx` → Cancelled payment page

Webhook handler (Step 3 — most critical logic):
1. Verify Stripe signature — reject if invalid
2. Atomic credit update on `profiles`
3. Insert `credit_transactions` (`type: 'purchase'`)
4. Send "Credits Added" email via Resend
5. Insert `notifications` record

**Success Criteria**:
- [ ] Clicking "Buy Credits" → Stripe Checkout (test mode)
- [ ] Test payment succeeds → balance updates by correct amount
- [ ] `credit_transactions` row created with `type: 'purchase'`
- [ ] Success page shows updated balance
- [ ] Cancelled payment → no balance change, lands on cancel page
- [ ] Duplicate webhook delivery handled by idempotency (test by replaying event)

---

### Step 2.3: Credit Balance Display & Low-Balance Warning

**Duration**: 2 hours

Build:
- `CreditBalanceWidget` component (header/dashboard) — shows current balance with coin icon in `accent` color
- Low-balance banner component — shown when `credit_balance < 3000`, links to `/credits/purchase`
- TanStack Query refetch after successful purchase

**Success Criteria**:
- [ ] Balance shown accurately on dashboard
- [ ] Balance updates within 5 seconds after webhook fires (PRD requirement)
- [ ] Low-balance banner appears at correct threshold
- [ ] Banner disappears after artist purchases more credits

---

### Step 2.4: Song Package Selection & Song Creation

**Duration**: 5–6 hours

Build:
- `src/app/songs/new/page.tsx` → Song name input + three package cards with full deliverables list per tier, balance shown, "Confirm & Start" button
- `src/app/api/songs/create/route.ts` → Atomic song creation (see `BACKEND_STRUCTURE.md` Section 4)

Package card: shows credit cost, full deliverables list, disabled state if balance insufficient.

Route Handler steps (all atomic):
1. Validate session
2. Check `balance >= package_cost` with lock
3. Deduct credits from `profiles.credit_balance`
4. Insert `credit_transactions` (`type: 'deduction'`)
5. Insert `songs` record
6. Insert all `deliverables` rows for the tier (from seed data in `BACKEND_STRUCTURE.md`)
7. Send admin notification email
8. Return `songId` → redirect to `/songs/[songId]`

**Success Criteria**:
- [ ] Package cards show correct deliverables per tier
- [ ] "Confirm & Start" disabled when balance < package cost
- [ ] Song created with correct deliverables checklist for selected tier
- [ ] Credits deducted correctly on confirmation
- [ ] Artist redirected to song detail page
- [ ] Race condition test: concurrent requests don't allow double deduction

---

### Step 2.5: Song List & Song Detail Page

**Duration**: 3 hours

Build:
- Song cards on `/dashboard` showing name, tier badge, stage, progress bar
- `src/app/songs/[songId]/page.tsx` → Full deliverables checklist with status icons, revision count, last updated timestamp
- Supabase Realtime subscription on `deliverables` for this `songId` (client component)

**Success Criteria**:
- [ ] All artist songs visible on dashboard with correct badge/stage
- [ ] Song detail shows all deliverables in correct order
- [ ] Progress bar reflects % completed deliverables
- [ ] Status updates from admin appear live (test in two tabs)

---

### ✅ Week 2 / Milestone 2 — Friday Review Checklist
- [ ] Artist can purchase credits via Stripe and balance updates within 5 seconds
- [ ] Artist can select a song package — credits deducted correctly
- [ ] Song created with correct deliverables for selected tier
- [ ] Insufficient credit scenario handled (button disabled, message shown)
- [ ] Artist can view all songs and click into each for deliverable detail
- [ ] Low-balance banner shows and dismisses correctly

---

## Phase 3 — Admin Dashboard & Project Management (Week 3)

**Goal**: Full admin interface for Tyler — manage all artists, projects, credits, and deliverables.

---

### Step 3.1: Admin Layout & Overview Dashboard

**Duration**: 3 hours

Build:
- `src/app/admin/layout.tsx` → Admin-specific sidebar (different nav from artist)
- `src/app/admin/page.tsx` → Overview stats: total artists, total active projects, recent credit purchases feed, priority artists list

**Success Criteria**:
- [ ] Admin overview shows real data
- [ ] Admin sidebar has correct links

---

### Step 3.2: User Management

**Duration**: 4 hours

Build:
- `src/app/admin/users/page.tsx` → All artists — searchable, filterable table
- `src/app/admin/users/[userId]/page.tsx` → Artist profile: current balance, all songs (with status), full transaction history

**Success Criteria**:
- [ ] Admin can search and filter artist accounts
- [ ] Admin can view any artist's full profile, balance, and history

---

### Step 3.3: Project Management & Deliverable Updates

**Duration**: 5–6 hours

Build:
- `src/app/admin/projects/page.tsx` → All songs across all artists, filterable by status / tier / artist name
- `src/app/admin/projects/[songId]/page.tsx` → Full project edit view: deliverable status dropdowns, stage selector, revision counter, admin notes

Real-time: Supabase Realtime enabled on `deliverables` — artist's open song page updates live when admin changes status.

**Success Criteria**:
- [ ] Admin can filter all projects
- [ ] Admin can change any deliverable status
- [ ] Artist dashboard reflects admin changes in real time (confirm with two browser tabs simultaneously)
- [ ] Admin can update stage and add internal notes
- [ ] Email notification fires to artist when deliverable status changes

---

### Step 3.4: Manual Credit Adjustment

**Duration**: 2–3 hours

Build:
- "Adjust Balance" button on `/admin/users/[userId]`
- Modal: amount input + mandatory reason textarea + confirmation dialog for negative values
- `src/app/api/admin/credits/adjust/route.ts` (see `BACKEND_STRUCTURE.md` Section 4)

**Success Criteria**:
- [ ] Admin can add credits with a reason → balance updates immediately
- [ ] Admin can deduct credits — confirmation dialog shown before processing
- [ ] Reason field required — submit blocked if empty
- [ ] Balance cannot go below 0 (server-side guard + DB CHECK constraint)
- [ ] Transaction logged with admin ID, reason, and timestamp

---

### Step 3.5: Priority Flagging & Admin Credit Oversight

**Duration**: 2 hours

Build:
- Priority flag toggle on `/admin/users/[userId]` (updates `profiles.is_priority`)
- Priority clients visually highlighted in `/admin/users` list
- `src/app/admin/credits/page.tsx` → Platform-wide transaction log, filterable by user, date range, type

**Success Criteria**:
- [ ] Admin can toggle priority flag on any artist
- [ ] Flagged artists highlighted in the user list
- [ ] Credit log filterable and accurate

---

### ✅ Week 3 / Milestone 3 — Friday Review Checklist
- [ ] Admin sees overview dashboard with real data
- [ ] Admin can search/filter all artists
- [ ] Admin can view any artist's profile, credits, and songs
- [ ] Admin can manually adjust credit balance with mandatory reason
- [ ] Admin can update deliverable statuses — client sees changes in real time
- [ ] Email notification triggers on deliverable status change
- [ ] Priority flagging works and is visible in user list

---

## Phase 4 — Scheduling, Notifications & UI Polish (Week 4)

**Goal**: Session booking system (P1), email notification wiring, and full UI polish pass.

---

### Step 4.1: Email Notification System

**Duration**: 4–5 hours

Build React Email templates in `/src/lib/email/templates/`:
- `credit-added.tsx`
- `credit-deducted.tsx`
- `credit-low.tsx`
- `song-updated.tsx`
- `new-song-admin.tsx`
- `new-user-admin.tsx`

Add to `.env.local`:
```bash
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@macwav.com"
```

Wire sends from existing Route Handlers (webhook, song creation, deliverable update, manual credit adjust).

All templates must match macwav dark theme (`#101014` background, `#905AF6` primary).

**Success Criteria**:
- [ ] Artist receives "Credits Added" email after successful Stripe payment
- [ ] Artist receives "Project Updated" email when admin changes a deliverable status
- [ ] Admin receives "New Song Started" email when artist creates a project
- [ ] Admin receives "New Artist Registered" email on new signup
- [ ] All emails render correctly on Gmail, Apple Mail, and mobile

---

### Step 4.2: Scheduling System — Admin Side (P1)

**Duration**: 3 hours

Build:
- `src/app/admin/schedule/slots/page.tsx` → Add / edit / delete time slots. Toggle `is_premium` flag per slot.
- `src/app/admin/schedule/bookings/page.tsx` → All bookings across all artists (cancel, reschedule)

**Success Criteria**:
- [ ] Admin can create standard and premium slots
- [ ] Admin can view and manage all bookings

---

### Step 4.3: Scheduling System — Artist Side (P1)

**Duration**: 4 hours

Build:
- `src/app/schedule/book/page.tsx` → Calendar with available slots
  - Slot visibility enforced by Supabase RLS (see `BACKEND_STRUCTURE.md` — `schedule_slots` RLS)
  - Standard artists: standard slots. LAUNCH/priority: all slots.
- `src/app/api/bookings/create/route.ts` → Atomic booking creation (see `BACKEND_STRUCTURE.md` Section 4)
- `src/app/schedule/confirmation/page.tsx` → Booking confirmed
- `src/app/schedule/my-bookings/page.tsx` → Artist's booking history

**Success Criteria**:
- [ ] Standard artist cannot see premium slots
- [ ] LAUNCH / priority artist sees all available slots
- [ ] Booking confirmed, slot marked unavailable immediately
- [ ] Confirmation email sent to artist
- [ ] Admin notified of new booking

---

### Step 4.4: Credit History Page (P1)

**Duration**: 2 hours

Build:
- `src/app/credits/history/page.tsx` → Paginated transaction log (20/page), most recent first
- Columns: date, type badge, amount, balance after, description

**Success Criteria**:
- [ ] All transaction types show correctly (Purchase / Deduction / Adjustment)
- [ ] Pagination works on long histories

---

### Step 4.5: Full UI/UX Polish Pass

**Duration**: 4–5 hours

Audit every page against `macwav-frontend-guidelines.md`:

- [ ] Color system correct: `#101014` base, `#19191F` surface, `#905AF6` primary, `#13DAC6` accent
- [ ] Loading skeletons on every data-fetching component (`animate-pulse`)
- [ ] Empty states on every list/table with helpful CTAs
- [ ] Error states with retry options
- [ ] All forms show inline validation errors
- [ ] Focus rings use `primary` color (`#905AF6`)
- [ ] Hover states on all interactive elements
- [ ] Mobile responsive verified at 375px, 768px, 1280px
- [ ] No layout breaks at any breakpoint
- [ ] Spacing consistent per guidelines
- [ ] All toast notifications (sonner) themed dark with correct colors

---

### ✅ Week 4 / Milestone 4 — Friday Review Checklist
- [ ] Email notifications fire correctly for all key events (both artist and admin)
- [ ] Artist can book a session (P1) — confirmation shown and emailed
- [ ] Admin can manage time slots and bookings
- [ ] Priority slots hidden from standard artists (verified)
- [ ] Credit history page shows all transactions correctly
- [ ] Full mobile responsive check passed on all pages
- [ ] UI matches macwav design system throughout

---

## Phase 5 — Testing, QA & Launch Prep (Week 5)

**Goal**: Full end-to-end testing, security audit, performance optimization, handover to Tyler.

---

### Step 5.1: End-to-End Testing — Artist Flow

**Duration**: 3–4 hours

Test full artist journey on Chrome, Safari, Firefox + mobile (iOS Safari + Chrome Android):

1. Register → profile auto-created ✓
2. Buy credits via Stripe (test mode) → balance updates ✓
3. Select CREATE package → song + deliverables created, credits deducted ✓
4. Track song → deliverables visible ✓
5. Book a session (if P1 built) → confirmation ✓

Edge cases to verify:
- Insufficient credits → button disabled, message shown correctly
- Double-submit prevention on all forms
- Session expiry → redirect to login

**Success Criteria**:
- [ ] Complete artist journey error-free on Chrome + Safari
- [ ] Works fully on mobile at 375px (iOS Safari + Chrome Android)

---

### Step 5.2: End-to-End Testing — Admin Flow

**Duration**: 3 hours

1. Admin login → overview dashboard with real data ✓
2. View and search artists ✓
3. Adjust a credit balance (reason required) → balance updates, transaction logged ✓
4. Update a deliverable status → artist sees change in real time ✓
5. Flag an artist as priority → verify scheduling slot visibility change ✓

**Success Criteria**:
- [ ] All admin actions complete without errors
- [ ] Real-time deliverable update confirmed (simultaneous two-tab test)

---

### Step 5.3: Payment Testing — Live Mode

**Duration**: 2 hours

1. Switch Stripe keys from test to live in Vercel environment variables
2. Update webhook endpoint in Stripe Dashboard to production URL
3. Process one real transaction (smallest credit bundle) to verify full flow end-to-end
4. Confirm: credits added, transaction logged, email received, balance updated

**Success Criteria**:
- [ ] Real payment processed and webhook fires correctly
- [ ] Credits added to account (not via client-side call — only via webhook)
- [ ] Confirmation email delivered to inbox

---

### Step 5.4: Security Audit

**Duration**: 2–3 hours

Verify each item:
- [ ] Artist cannot access `/admin/*` — middleware redirects to `/dashboard`
- [ ] Artist cannot access another artist's `/songs/[otherId]` — RLS returns empty, 404 shown
- [ ] `SUPABASE_SERVICE_ROLE_KEY` not visible in browser network tab on any page
- [ ] Stripe secret key not in any client-side bundle (check browser network tab)
- [ ] Stripe webhook request without valid signature returns 400 (test manually)
- [ ] Confirm `credit_balance` cannot go negative: attempt via SQL Editor as anon user
- [ ] `credit_transactions` rows cannot be updated or deleted: test via Supabase client

---

### Step 5.5: Performance Optimization

**Duration**: 2–3 hours

- Run Lighthouse on `/dashboard` and `/songs/[songId]`
- Target: Performance ≥ 85, LCP < 3 seconds (per PRD non-functional requirements)
- Check for N+1 queries (use `.select()` with joins rather than multiple sequential calls)
- Verify all images use `next/image`
- Check Vercel build output for oversized bundles
- Ensure heavy components use `dynamic()` import where applicable

**Success Criteria**:
- [ ] Lighthouse score ≥ 85 on dashboard
- [ ] LCP < 3 seconds on standard broadband
- [ ] No N+1 database query patterns

---

### Step 5.6: Bug Fixing & Final Polish

**Duration**: 3–4 hours

- Fix all bugs found during Steps 5.1–5.5
- Final UI consistency pass — spacing, typography, color
- Verify all empty states, error messages, and loading indicators are in place
- Confirm Sentry capturing errors in production (trigger a test error)

---

### Step 5.7: Documentation & Handover

**Duration**: 2–3 hours

Deliver to Tyler:

1. **Admin Guide** (Notion doc or PDF) covering:
   - How to log in as admin
   - How to manage artist accounts + credit balances
   - How to update deliverable statuses
   - How to add/manage schedule slots
   - How to read the credit transaction log
   - How to flag priority clients

2. **Loom walkthrough video** (10–15 min) — screen recording of all admin actions

3. **Platform access handover**:
   - Tyler's admin login credentials
   - Vercel project — add Tyler as collaborator
   - Supabase project — transfer ownership to Tyler
   - GitHub repository — add Tyler as collaborator
   - Stripe account — use Tyler's Stripe account from day one (no transfer needed)

---

### ✅ Week 5 / Milestone 5 — Friday Review Checklist
- [ ] Complete artist journey error-free end-to-end
- [ ] Complete admin journey error-free end-to-end
- [ ] Payments work in live mode
- [ ] Security audit passed — no data leaks between artists
- [ ] Lighthouse ≥ 85, LCP < 3s on dashboard
- [ ] All known bugs resolved
- [ ] Tyler has admin guide + Loom video
- [ ] Tyler has access to Vercel, Supabase, GitHub, and Stripe

---

## Milestones Summary

| Milestone | Week | Focus | Review Day |
|---|---|---|---|
| M1: Foundation | Week 1 | Setup, DB schema, Auth, Dashboard shell | Friday EOW1 |
| M2: Credit + Songs | Week 2 | Stripe, Credits, Package selection, Song creation | Friday EOW2 |
| M3: Admin | Week 3 | Admin dashboard, Project management, Credit oversight | Friday EOW3 |
| M4: Scheduling + Notifications + Polish | Week 4 | Email notifications, Booking system (P1), UI polish | Friday EOW4 |
| M5: Testing + Launch | Week 5 | QA, Security, Performance, Handover | Friday EOW5 |

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Supabase RLS policy bug exposing artist data | Critical | Test with anon role via SQL Editor before launch (Step 5.4) |
| Stripe webhook missing or delayed | High | Idempotency key + retry logic + admin manual credit adjustment fallback |
| Credit double-deduction (race condition) | High | Atomic server-side operation in Route Handler — never allow client-side deduction |
| Realtime subscription dropping | Medium | Auto-reconnect logic; fallback to manual refresh with subtle banner |
| Schema change mid-sprint | High | New migration file only — never edit existing migrations |
| PayPal integration complexity (PRD secondary) | Medium | Defer to V1.0 if Stripe alone covers MVP; reassess end of Week 2 |

### Timeline Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Scope creep during build | High | PRD is locked — all new requests go through change request process |
| Tyler feedback delay (Friday reviews) | Medium | Requires feedback within 48h; delays shift subsequent milestone dates |
| Stripe live mode approval delay | Medium | Submit Stripe account for activation at start of Week 4 |
| P1 features (scheduling) running over | Medium | P1 builds after P0 is confirmed working each week; do not start P1 if P0 is incomplete |

---

## Success Criteria (Overall)

MVP is production-ready when:

1. ✅ All P0 features from PRD Section 6 implemented and working
2. ✅ All flows from `APP_FLOW.md` tested end-to-end
3. ✅ UI matches `macwav-frontend-guidelines.md` throughout
4. ✅ Backend matches `BACKEND_STRUCTURE.md` — Supabase BaaS, no separate server
5. ✅ Stripe live payments processing correctly
6. ✅ Real-time deliverable updates working (admin → artist)
7. ✅ Zero security holes — RLS verified, no secrets exposed
8. ✅ LCP < 3 seconds, Lighthouse ≥ 85 on dashboard
9. ✅ Full mobile functionality on iOS Safari + Chrome Android
10. ✅ Tyler has full access and handover documentation
11. ✅ Platform supports 50+ simultaneous users (PRD NFR requirement)
