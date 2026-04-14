# IMPLEMENTATION_PLAN.md — macwav
**Project**: macwav – Artist Development & Client Portal
**Prepared by**: Hammad Khan, Posybl Business Solutions
**Prepared for**: Tyler
**Last Updated**: April 2026
**Version**: 1.0
**Duration**: 5 Weeks (1 Milestone per Week)
**Evaluation Day**: Every Friday — milestone review and sign-off

---

## Overview

This plan maps each of the 5 milestones to concrete development steps in the correct build order. Every task has a goal, specific deliverables, and a testable Friday review checklist taken directly from the agreed milestone document.

**Stack**: Next.js 15 + Supabase (BaaS) + Tailwind CSS + shadcn/ui + Stripe + Resend → Deployed on Vercel via GitHub

**Important**:
- Development continues within Tyler's existing app — following his established design patterns and UI direction as defined in `macwav-frontend-guidelines.md`. We are **not** starting from scratch.
- No music file uploads through the platform. All file exchange happens via email. The platform handles project tracking, credits, scheduling, and status visibility only.
- Stripe is the sole payment processor for all credit purchases.
- Scheduling is built natively within the platform (not via Calendly or external tool) to support priority scheduling logic.
- Timely feedback from Tyler within 48 hours of each Friday review is required to maintain the weekly cadence.

---

## Milestone 1 — Foundation & Core Infrastructure
**Week 1 | Review: Friday End of Week 1**

**Objective**: Set up the foundational architecture of the platform — database structure, authentication, user roles, and the client-facing dashboard shell. This week establishes the skeleton that everything else builds on.

---

### Task 1.1 — Database Architecture

**Goal**: Design and build all core data types. Establish relationships. Set up option sets for statuses, package types, and user roles.

```bash
supabase migration new initial_schema
```

Tables to create (see `BACKEND_STRUCTURE.md` Section 2 for full column specs, constraints, and RLS policies):

1. `profiles` — user type, email, role flag, credit balance (CHECK ≥ 0)
2. `songs` — song name, package tier, current stage, status, revision count, admin notes
3. `deliverables` — individual checklist items per song, status, sort order
4. `credit_transactions` — immutable ledger of all credit movements
5. `schedule_slots` — available time slots with premium flag
6. `bookings` — session/meeting bookings per artist
7. `notifications` — event-driven notification log

Also create:
- `handle_new_user` DB trigger — auto-inserts `profiles` row on Supabase Auth user creation
- `set_updated_at` trigger on `profiles`, `songs`, `deliverables`
- RLS policies on all tables

```bash
supabase db reset
supabase db push
supabase gen types typescript --project-id [ref] > src/types/supabase.ts
```

**Success Criteria**:
- [ ] All 7 tables visible and correctly structured in Supabase Dashboard
- [ ] RLS enabled on every table
- [ ] TypeScript types auto-generated and in sync with schema
- [ ] Creating a user in `auth.users` auto-creates a `profiles` row via trigger
- [ ] `credit_balance = -1` insert attempt fails (CHECK constraint enforced)

---

### Task 1.2 — Authentication System

**Goal**: Secure signup/login flow for clients. Password reset functionality. Role-based routing (client vs admin landing pages).

Build:
- `src/app/page.tsx` — Login page with "Create Account" link
- `src/app/auth/signup/page.tsx` — Registration form (first name, last name, email, password, confirm password)
- `src/app/auth/forgot-password/page.tsx` — Request reset email
- `src/app/auth/reset-password/page.tsx` — Set new password from Supabase email token
- `src/middleware.ts` — Session validation + role-based routing on all protected routes (see `BACKEND_STRUCTURE.md` Section 6)

Role routing on login:
- `role = 'artist'` → `/dashboard`
- `role = 'admin'` → `/admin`

**Success Criteria**:
- [ ] New user can register → `profiles` row auto-created with `role = 'artist'`
- [ ] Artist logs in → `/dashboard`. Admin logs in → `/admin`
- [ ] Password reset email arrives and works end-to-end
- [ ] Unauthenticated access to `/dashboard` → redirect to `/`
- [ ] Artist accessing `/admin` → redirect to `/dashboard`
- [ ] Logout clears session and redirects to `/`

---

### Task 1.3 — User Profile Setup

**Goal**: Client profile page with editable personal info. Display of user role, account creation date, and status.

Build:
- `src/app/profile/page.tsx` — Editable first name, last name. Read-only: email, role, account creation date, status.
- Profile update writes to `profiles` table via Supabase client (RLS enforces own-row-only writes)

**Success Criteria**:
- [ ] Artist can edit and save their name
- [ ] Role, creation date, and status display correctly (read-only)
- [ ] Artist cannot edit another artist's profile via URL manipulation (RLS blocks)

---

### Task 1.4 — Client Dashboard Shell

**Goal**: Main dashboard layout following Tyler's existing design. Placeholder sections for credit balance, active songs/projects list, and quick-action buttons. Responsive layout for mobile and desktop.

Build:
- `src/app/dashboard/layout.tsx` — Persistent sidebar (desktop), hamburger (mobile)
- `src/app/dashboard/page.tsx` — Dashboard home with placeholder sections:
  - Credit balance widget (shows 0 with "Buy Credits" CTA)
  - Active songs list (empty state with "Start a Song" CTA)
  - Quick-action buttons
- `src/components/layout/Sidebar.tsx` — Nav links (artist view)
- `src/components/layout/MobileNav.tsx` — Mobile hamburger + bottom nav

Design: follow Tyler's existing design patterns and `macwav-frontend-guidelines.md`. This is a continuation of Tyler's existing work — match his established typography, spacing, and component style exactly.

**Success Criteria**:
- [ ] Dashboard renders at `/dashboard` matching Tyler's design direction
- [ ] Credit balance placeholder and "Buy Credits" CTA visible
- [ ] Active songs section present (empty state)
- [ ] Quick-action buttons present (non-functional placeholders this week)
- [ ] Responsive on mobile at 375px and desktop at 1280px

---

### Task 1.5 — Navigation Structure

**Goal**: Build the main navigation for both client and admin views. Sidebar or top-nav based on Tyler's existing design direction.

Build:
- Client sidebar — links: Dashboard, My Songs, Credits, Schedule, Profile
- Admin sidebar — links: Overview, Users, Projects, Credits Log, Schedule
- Active state styling per `macwav-frontend-guidelines.md`
- Admin `/admin/page.tsx` — basic empty admin layout (full build in Milestone 3)

**Success Criteria**:
- [ ] Client navigation renders correctly with all links
- [ ] Admin navigation renders separately with its own link set
- [ ] Active route is visually highlighted
- [ ] Navigation collapses to hamburger on mobile

---

### ✅ Milestone 1 — Friday Review Checklist
- [ ] A new user can sign up, log in, and reset password
- [ ] Client sees their personal dashboard (shell) with correct layout
- [ ] Admin login routes to a separate admin area
- [ ] Database tables are built and relational structure is confirmed
- [ ] Mobile responsive on client dashboard

---

## Milestone 2 — Credit System & Song Packages
**Week 2 | Review: Friday End of Week 2**

**Objective**: Build the full credit purchase and management system, integrate Stripe payment processing, and implement the song development package selection flow (CREATE / BUILD / LAUNCH). This is the commercial engine of the platform.

---

### Task 2.1 — Credit Purchase Flow

**Goal**: Credit purchase page with package/amount options. Stripe integration. On successful payment: credits automatically added to balance. Transaction record created.

Add Stripe keys to `.env.local`:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Register Stripe webhook → event: `checkout.session.completed` → endpoint: `/api/webhooks/stripe`

Local testing:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Build:
- `src/app/credits/purchase/page.tsx` — Credit bundle option cards with point amounts and prices
- `src/app/api/stripe/create-checkout/route.ts` — Creates Stripe Checkout session with `metadata: { user_id, credit_amount }`
- `src/app/api/webhooks/stripe/route.ts` — Handles `checkout.session.completed`:
  1. Verify Stripe signature (reject if invalid)
  2. Atomic credit update on `profiles.credit_balance`
  3. Insert `credit_transactions` record (`type: 'purchase'`, `stripe_payment_id`, `amount`, `balance_after`)
  4. Send "Credits Added" email notification via Resend
  5. Insert `notifications` record
- `src/app/credits/success/page.tsx` — Payment success confirmation
- `src/app/credits/cancel/page.tsx` — Payment cancelled/failed

**Success Criteria**:
- [ ] "Buy Credits" → Stripe Checkout (test mode)
- [ ] Test payment success → balance increases by correct amount
- [ ] `credit_transactions` row created with `type: 'purchase'`
- [ ] Confirmation page shows updated balance
- [ ] Cancelled payment → no balance change
- [ ] Duplicate webhook replay → idempotency prevents double credit addition

---

### Task 2.2 — Credit Balance Display

**Goal**: Real-time credit balance shown on client dashboard. Prompt/banner shown when balance is low or insufficient for a package.

Build:
- `CreditBalanceWidget` component — shown in dashboard header with coin icon styled per `macwav-frontend-guidelines.md`
- Low-balance warning banner — shown when `credit_balance < 3000` (below minimum package cost), with direct "Buy Credits" link
- TanStack Query auto-refetch after successful webhook fires (balance updates within 5 seconds per PRD requirement)

**Success Criteria**:
- [ ] Credit balance shown accurately at all times on dashboard
- [ ] Balance updates within 5 seconds after Stripe webhook fires
- [ ] Low-balance banner appears when balance drops below 3,000
- [ ] Banner disappears after artist buys more credits

---

### Task 2.3 — Credit Transaction History

**Goal**: Client-visible log showing all credit additions (purchases) and deductions (package selections). Each entry shows date, type, amount, and running balance.

Build:
- `src/app/credits/history/page.tsx` — Paginated table (20 rows/page), most recent first
- Columns: Date, Type badge (Purchase / Deduction / Adjustment), Amount, Balance After, Description
- Accessible from dashboard sidebar and profile area

**Success Criteria**:
- [ ] All transaction types display correctly
- [ ] Running balance column is accurate for every row
- [ ] Pagination works on histories with many entries
- [ ] Most recent transaction shown first

---

### Task 2.4 — Song Package Selection Flow

**Goal**: Artist selects CREATE (3,000 pts), BUILD (7,000 pts), or LAUNCH (15,000 pts) for a new song. System checks sufficient credits before allowing selection. On confirmation: credits deducted, new song/project record created, deliverables checklist auto-populated based on package tier.

Build:
- `src/app/songs/new/page.tsx` — Song name input + three package cards
  - Each card shows: credit cost, full deliverables list for that tier, "Select" button
  - Current balance shown prominently
  - "Confirm & Start" disabled if `credit_balance < package_cost`
- `src/app/api/songs/create/route.ts` — Atomic song creation (see `BACKEND_STRUCTURE.md` Section 4):
  1. Validate session
  2. Atomic check: `balance >= package_cost` (race condition safe)
  3. Deduct credits from `profiles.credit_balance`
  4. Insert `credit_transactions` (`type: 'deduction'`)
  5. Insert `songs` record
  6. Insert all `deliverables` rows for selected tier (from seed data in `BACKEND_STRUCTURE.md`)
  7. Send admin notification email
  8. Return `songId` → redirect to `/songs/[songId]`

**Success Criteria**:
- [ ] All three packages clearly displayed with correct credit costs and deliverables
- [ ] "Confirm & Start" disabled when balance is insufficient — artist sees exact shortfall amount
- [ ] Credits deducted immediately on confirmation
- [ ] New song record created with correct package tier and stage
- [ ] Deliverables checklist auto-populated with correct items for selected tier
- [ ] Race condition: concurrent requests cannot cause double deduction

---

### Task 2.5 — Song / Project Record Creation

**Goal**: Each song gets a project record with song name, selected package, current stage, deliverables checklist, status (pending/in-progress/completed), revision tracking fields, and timestamps.

This is handled server-side in Task 2.4's Route Handler. Verify the created record contains:
- `song_name`, `package_tier`, `current_stage`, `status = 'active'`
- `revision_count = 0`
- All `deliverables` rows with `status = 'pending'` and correct `sort_order`
- `created_at` and `updated_at` timestamps

**Success Criteria**:
- [ ] Song record confirms all fields populated correctly in Supabase Dashboard
- [ ] All deliverables for the selected tier are present with Pending status
- [ ] Revision count starts at 0
- [ ] Timestamps set correctly

---

### Task 2.6 — Client Song Dashboard

**Goal**: List of all artist's songs with status indicators. Ability to click into each song to see deliverables progress, current stage, and revision count.

Build:
- Song cards on `/dashboard` showing: song name, tier badge (CREATE/BUILD/LAUNCH), current stage, % progress bar (deliverables completed)
- `src/app/songs/[songId]/page.tsx` — Song detail view:
  - Deliverables checklist with status icons (Pending / In Progress / Completed)
  - Revision count (e.g. "Mix Revisions: 1 of 2")
  - Current stage indicator
  - Last updated timestamp
  - Supabase Realtime subscription on `deliverables` for this `songId` — admin changes appear live without page refresh
  - Read-only for artist

**Success Criteria**:
- [ ] All artist songs visible on dashboard with correct badge and stage
- [ ] Clicking a song opens correct detail page
- [ ] Progress bar reflects accurate % of completed deliverables
- [ ] Deliverables display in correct order
- [ ] Realtime: admin status change in another tab reflects on artist's page instantly

---

### ✅ Milestone 2 — Friday Review Checklist
- [ ] Client can purchase credits via Stripe and see balance update instantly
- [ ] Client can select a song package and credits are deducted correctly
- [ ] Song project is created with correct deliverables based on package tier
- [ ] Transaction history is accurate and visible to client
- [ ] Insufficient credit scenario handled gracefully (prompted to buy more)
- [ ] Client can view all their songs and click into each one for details

---

## Milestone 3 — Admin Dashboard & Project Management
**Week 3 | Review: Friday End of Week 3**

**Objective**: Build the complete admin dashboard — the internal operational layer Tyler and his team use to manage all users, projects, credits, and deliverables. Also implement the project management workflows that drive song progression through stages.

---

### Task 3.1 — Admin Dashboard Overview

**Goal**: Summary view showing total active users, total active projects, recent credit transactions, flagged/priority clients. Quick-access links to key management areas.

Build:
- `src/app/admin/page.tsx` — Overview with:
  - Stats cards: total active artists, total active projects
  - Recent credit transactions feed (last 10)
  - Priority/flagged clients list
  - Quick-access nav cards to: Users, Projects, Credits Log, Schedule

**Success Criteria**:
- [ ] All stats cards show real data from Supabase
- [ ] Recent transactions feed populated
- [ ] Priority clients list visible
- [ ] All quick-access links route correctly

---

### Task 3.2 — User Management

**Goal**: List of all registered users with search and filter. View individual user profiles including credit balance, songs, and transaction history. Ability to manually adjust a user's credit balance with reason logging.

Build:
- `src/app/admin/users/page.tsx` — All artists table: name, email, credit balance, active projects count, priority flag, registration date. Searchable by name/email, filterable by priority flag.
- `src/app/admin/users/[userId]/page.tsx` — Artist profile:
  - Personal info, current credit balance
  - All songs with status
  - Full credit transaction history
  - "Adjust Balance" button
- Adjust Balance modal: amount input (positive = add, negative = deduct), mandatory reason textarea, confirmation dialog for negative values
- `src/app/api/admin/credits/adjust/route.ts` (see `BACKEND_STRUCTURE.md` Section 4):
  1. Validate `role = 'admin'` server-side
  2. Validate reason field is not empty
  3. Guard: final balance cannot go below 0
  4. Update `profiles.credit_balance`
  5. Insert `credit_transactions` (`type: 'manual_adjustment'`, `admin_id`, `reason`)
  6. Send email to artist if positive adjustment

**Success Criteria**:
- [ ] Admin can search/filter all artists
- [ ] Admin can view any artist's full profile, balance, and history
- [ ] Admin can add credits with a reason → balance updates immediately
- [ ] Admin cannot deduct more credits than the artist has (balance floor = 0)
- [ ] Reason field required — submit blocked if empty
- [ ] Confirmation dialog shows for negative adjustments
- [ ] Transaction logged with admin ID, reason, and timestamp

---

### Task 3.3 — Project / Song Management

**Goal**: View all songs/projects across all users. Filter by status, package tier, or user. Click into any project to update status of individual deliverables, overall project stage, revision counts, and admin notes.

Build:
- `src/app/admin/projects/page.tsx` — All songs across all artists:
  - Table: artist name, song name, tier badge, current stage, % progress, status, last updated
  - Filters: status (active/completed/paused), package tier, artist name
- `src/app/admin/projects/[songId]/page.tsx` — Project edit view:
  - All deliverables with status dropdowns (Pending / In Progress / Completed)
  - Stage selector (CREATE / BUILD / LAUNCH)
  - Revision counter (increment/decrement)
  - Admin notes textarea
  - "Save Changes" button

**Success Criteria**:
- [ ] Admin can see all projects across all artists
- [ ] Filters work correctly (by status, tier, artist)
- [ ] Admin can change any deliverable status and save
- [ ] Stage and revision count are editable
- [ ] Admin notes save correctly

---

### Task 3.4 — Deliverables Workflow

**Goal**: Admin marks individual deliverables as pending, in-progress, or completed. Progress bar shows completion %. When admin updates a deliverable status, the change is reflected on the client's dashboard in real time.

Implementation notes:
- Status updates in Task 3.3's admin project page trigger Supabase Realtime events
- Realtime enabled on `deliverables` table (UPDATE events) — artist's `/songs/[songId]` page subscribes and updates without refresh
- On each admin status save: insert `notifications` record + send email to artist via Resend

Build the notification send from the deliverable update Route Handler:
- `src/app/api/admin/projects/update-deliverable/route.ts`:
  1. Validate `role = 'admin'`
  2. Update `deliverables.status` (and `completed_at` if → completed)
  3. Supabase Realtime broadcasts automatically
  4. Send "Project Update" email to artist
  5. Insert `notifications` record

**Success Criteria**:
- [ ] Admin changes deliverable status → artist sees change in real time (verify with two simultaneous browser tabs)
- [ ] Progress bar on artist dashboard updates to reflect new completion %
- [ ] Artist receives email notification when a deliverable status changes
- [ ] `completed_at` timestamp set when status changes to Completed

---

### Task 3.5 — Priority Client Flagging

**Goal**: Admin can flag specific clients as priority (e.g., LAUNCH-tier clients). Flagged clients appear highlighted in admin views. Priority flag feeds into scheduling logic (used in Milestone 4).

Build:
- Priority flag toggle on `/admin/users/[userId]` — updates `profiles.is_priority` (boolean)
- Flagged artists visually highlighted in `/admin/users` table (accent color badge or row highlight)
- `is_priority = true` is used in Milestone 4 to control premium slot visibility

**Success Criteria**:
- [ ] Admin can toggle priority flag on/off for any artist
- [ ] Flagged artists visually distinguished in admin user list
- [ ] Flag persists in database and survives page refresh

---

### Task 3.6 — Admin Credit Oversight

**Goal**: Full log of all credit transactions across the platform. Filterable by user, date range, and transaction type. Export-ready view for record keeping.

Build:
- `src/app/admin/credits/page.tsx` — Platform-wide transaction log:
  - Table: artist name, date, type badge (Purchase / Deduction / Adjustment), amount, balance after, description/reason
  - Filters: artist name, date range picker, transaction type
  - Export: copy-to-clipboard or CSV download of filtered results

**Success Criteria**:
- [ ] All platform transactions visible in one view
- [ ] Filters work correctly
- [ ] Export/copy functionality works

---

### ✅ Milestone 3 — Friday Review Checklist
- [ ] Admin can log in and see overview dashboard with real data
- [ ] Admin can search/filter users and view any user's profile and credit history
- [ ] Admin can manually adjust a user's credit balance with a reason
- [ ] Admin can view all projects, filter them, and update deliverable statuses
- [ ] Client dashboard reflects status changes made by admin in real time
- [ ] Priority client flagging works and is visible in admin views

---

## Milestone 4 — Scheduling, Notifications & Polish
**Week 4 | Review: Friday End of Week 4**

**Objective**: Implement the scheduling system with priority access logic, build the notification engine, and refine the overall UI/UX for a polished, premium experience.

---

### Task 4.1 — Scheduling System — Client Side

**Goal**: Session and meeting booking interface for clients. Calendar view showing available time slots. Booking confirmation flow with date, time, and session type.

Build:
- `src/app/schedule/book/page.tsx` — Calendar with available slots:
  - Slot visibility enforced by Supabase RLS on `schedule_slots` (see `BACKEND_STRUCTURE.md`):
    - Standard artists (CREATE/BUILD): standard slots only (`is_premium = false`)
    - LAUNCH tier / priority-flagged artists: all available slots
  - Session type selector (Recording / Meeting / Review)
  - "Confirm Booking" button
- `src/app/api/bookings/create/route.ts`:
  1. Atomic slot availability check (race condition safe)
  2. Validate slot visibility matches artist's tier
  3. Insert `bookings` record
  4. Set `schedule_slots.is_available = false`
  5. Send booking confirmation email to artist
  6. Send admin notification
- `src/app/schedule/confirmation/page.tsx` — Booking details confirmed
- `src/app/schedule/my-bookings/page.tsx` — Artist's upcoming and past bookings

**Success Criteria**:
- [ ] Artist can view available slots and select date + time + session type
- [ ] Standard artist cannot see premium slots
- [ ] Booking confirmed and slot marked unavailable instantly
- [ ] Confirmation shown on screen and emailed to artist

---

### Task 4.2 — Scheduling — Admin Side

**Goal**: Admin interface to manage available time slots (add, edit, remove). View all upcoming bookings across all clients. Ability to cancel or reschedule bookings.

Build:
- `src/app/admin/schedule/slots/page.tsx` — Slot management:
  - Add new slot: date/time picker, duration, `is_premium` toggle
  - Edit existing slots
  - Delete/remove slots
- `src/app/admin/schedule/bookings/page.tsx` — All bookings across all artists:
  - Table: artist name, date, time, session type, status
  - Cancel or reschedule actions

**Success Criteria**:
- [ ] Admin can create standard and premium slots
- [ ] Admin can view all bookings and cancel/reschedule any

---

### Task 4.3 — Priority Scheduling Logic

**Goal**: LAUNCH-tier and admin-flagged priority clients get access to premium/exclusive time slots and faster booking workflows. Standard clients do not see priority-only slots.

Implementation:
- Premium slot visibility controlled by RLS policy on `schedule_slots` (already defined in `BACKEND_STRUCTURE.md`)
- Slot query in `/schedule/book` automatically filters based on artist's tier and `is_priority` flag — no client-side logic needed
- Verify end-to-end: log in as a standard artist and as a LAUNCH artist simultaneously to confirm slot visibility difference

**Success Criteria**:
- [ ] Standard artist sees only `is_premium = false` slots
- [ ] LAUNCH / priority artist sees all `is_available = true` slots
- [ ] Slot visibility is enforced at the database level (RLS) — not just UI

---

### Task 4.4 — Notification System — Client

**Goal**: Email notifications for: credit purchases, credit deductions (package selection), song/project status updates (deliverable completed, stage change), low credit balance alerts, booking confirmations and reminders.

Build React Email templates in `/src/lib/email/templates/`:
- `credit-added.tsx` — Triggered by: Stripe webhook + admin manual adjustment (positive)
- `credit-deducted.tsx` — Triggered by: package selection
- `credit-low.tsx` — Triggered by: balance falling below 3,000 after any deduction
- `song-updated.tsx` — Triggered by: admin deliverable status change
- `booking-confirmed.tsx` — Triggered by: successful booking creation

Wire Resend sends from all relevant Route Handlers. All templates must match macwav brand styling per `macwav-frontend-guidelines.md`.

Add to `.env.local`:
```bash
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@macwav.com"
```

**Success Criteria**:
- [ ] Artist receives "Credits Added" email after Stripe payment
- [ ] Artist receives "Credits Deducted" email after package selection
- [ ] Artist receives low-balance warning email when credits drop below 3,000
- [ ] Artist receives "Project Updated" email when admin changes a deliverable status
- [ ] Artist receives booking confirmation email
- [ ] All email templates render correctly on Gmail + Apple Mail + mobile

---

### Task 4.5 — Notification System — Admin

**Goal**: Email notifications for: new user registrations, new credit purchases, new song/project creations, booking requests. In-app notification feed on admin dashboard.

Build:
- `new-user-admin.tsx` — Triggered by: new artist registration
- `new-purchase-admin.tsx` — Triggered by: Stripe webhook (new credit purchase)
- `new-song-admin.tsx` — Triggered by: new song/project creation
- `new-booking-admin.tsx` — Triggered by: new booking created
- In-app notification feed on `/admin` overview dashboard — Supabase Realtime subscription on `notifications` table (INSERT events for admin-targeted records)

**Success Criteria**:
- [ ] Admin receives email on new registration, credit purchase, song creation, and booking
- [ ] In-app notification feed on admin dashboard updates in real time
- [ ] Notification content includes relevant context (artist name, amount, project name, new status)
- [ ] Notifications delivered within 60 seconds of triggering event (PRD requirement)

---

### Task 4.6 — UI/UX Polish & Responsiveness

**Goal**: Full pass on all client and admin pages for visual consistency with Tyler's design direction, mobile responsiveness, loading states, empty states, error handling, and micro-interactions.

Audit every page against `macwav-frontend-guidelines.md`:

- [ ] Design matches `macwav-frontend-guidelines.md` on every page
- [ ] Loading skeletons (`animate-pulse`) on every data-fetching component
- [ ] Empty states with helpful CTAs on every list, table, and feed
- [ ] Inline validation errors on all forms
- [ ] Error states with retry options on all async operations
- [ ] Focus rings visible on all interactive elements (per guidelines)
- [ ] Hover and active states on all buttons, cards, and nav items
- [ ] Mobile responsive verified at 375px, 768px, and 1280px
- [ ] No layout breaks at any breakpoint
- [ ] All toast notifications (Sonner) styled per `macwav-frontend-guidelines.md`
- [ ] Page transitions and micro-interactions feel premium (see `APP_FLOW.md` Section 8)
- [ ] Deliverable status changes animate correctly (glow + icon swap)
- [ ] Credit balance update uses count-up animation

---

### ✅ Milestone 4 — Friday Review Checklist
- [ ] Client can book a session and see confirmation
- [ ] Admin can manage time slots and view all bookings
- [ ] Priority clients see exclusive slots that standard clients cannot
- [ ] Email notifications fire correctly for all key events (both client and admin)
- [ ] Full mobile responsive check on all pages
- [ ] UI matches Tyler's design direction — clean, modern, premium

---

## Milestone 5 — Testing, QA & Launch Prep
**Week 5 | Review: Friday End of Week 5**

**Objective**: Comprehensive testing of the entire platform, bug fixing, performance optimization, and final handover preparation. By the end of this week, the platform should be ready for real users.

---

### Task 5.1 — End-to-End Testing — Client Flow

**Goal**: Full user journey test: sign up → purchase credits → select package → track song progress → book session. Test across multiple browsers and devices. Verify edge cases.

Test on: Chrome, Safari, Firefox — desktop, tablet, and mobile (iOS Safari + Chrome Android).

Full client journey:
1. Register → profile auto-created, credit balance = 0 ✓
2. Buy credits via Stripe (test mode) → balance updates within 5 seconds ✓
3. Select CREATE package → song created, deliverables populated, credits deducted ✓
4. View song detail → all deliverables at Pending ✓
5. Book a session → confirmation shown and emailed ✓

Edge cases to verify:
- Insufficient credits → "Confirm & Start" disabled, shortfall message shown
- Double-submit prevention on all forms
- Expired session → redirect to login
- Artist tries to access another artist's song via URL → 404

**Success Criteria**:
- [ ] Complete client journey works end-to-end without errors on Chrome + Safari
- [ ] Works fully on mobile at 375px (iOS Safari + Chrome Android)
- [ ] All edge cases handled gracefully

---

### Task 5.2 — End-to-End Testing — Admin Flow

**Goal**: Full admin journey: manage users → adjust credits → update project statuses → manage scheduling → verify notifications. Confirm all admin actions reflect correctly on client side.

Full admin journey:
1. Admin login → overview dashboard with real data ✓
2. Search/filter artists, view profile + transaction history ✓
3. Adjust a credit balance (reason required) → balance updates, transaction logged ✓
4. Update a deliverable status → artist sees real-time change (two-tab simultaneous test) ✓
5. Create a schedule slot → artist books it → slot becomes unavailable ✓
6. Verify priority slot hidden from standard artist (confirm in separate session) ✓
7. Verify admin receives email notifications for all triggered events ✓

**Success Criteria**:
- [ ] All admin actions complete without errors
- [ ] Real-time deliverable update confirmed in simultaneous two-tab test
- [ ] All admin email notifications received correctly

---

### Task 5.3 — Payment Testing

**Goal**: Test Stripe in both sandbox and live mode. Verify successful payments, failed payments, credit additions, and transaction logging accuracy.

Steps:
1. Run full Stripe test suite in sandbox mode — success, decline, expired card scenarios
2. Switch Stripe keys from test to live in Vercel environment variables
3. Update webhook endpoint in Stripe Dashboard to production URL
4. Process one real transaction (smallest credit bundle) end-to-end
5. Confirm: credits added via webhook (not client-side), transaction logged, email received, balance updated within 5 seconds

**Success Criteria**:
- [ ] Successful payment → credits added correctly
- [ ] Failed/declined payment → no credits added, artist sees error
- [ ] Credits are never added via client-side calls — only via verified webhook
- [ ] Transaction log entry accurate for every test case
- [ ] Live mode payment processes end-to-end without error

---

### Task 5.4 — Security Audit

**Goal**: Confirm admin-only pages are inaccessible to client accounts. Verify clients cannot access other users' data via URL manipulation or API calls. Review password security and session management.

Verify each item:
- [ ] Artist accessing `/admin/*` → middleware redirects to `/dashboard`
- [ ] Artist accessing `/songs/[another-artist-song-id]` → RLS returns empty, 404 shown
- [ ] `SUPABASE_SERVICE_ROLE_KEY` not visible in browser network tab on any page load
- [ ] Stripe secret key not in any client-side bundle (inspect browser network tab)
- [ ] Stripe webhook rejects requests without valid signature (test with tampered payload — expect 400)
- [ ] `credit_balance` cannot go negative: attempt direct insert via Supabase SQL Editor as anon user (expect failure)
- [ ] `credit_transactions` rows cannot be updated or deleted: test via Supabase client (expect RLS block)
- [ ] Password reset link expires after single use (Supabase default)
- [ ] Session tokens expire on inactivity (verify Supabase Auth settings)

---

### Task 5.5 — Performance Optimization

**Goal**: Optimize page load times on dashboard and project list pages. Review and optimize database queries. Fix slow-loading elements or redundant workflows.

Steps:
- Run Lighthouse audit on `/dashboard` and `/songs/[songId]`
- Target: Performance ≥ 85, LCP < 3 seconds (per PRD non-functional requirements)
- Identify and fix N+1 query patterns (use Supabase `.select()` with joins instead of multiple sequential calls)
- Verify all images use `next/image` (handles WebP, lazy loading, size optimization)
- Check Vercel build output for oversized client bundles
- Heavy components (calendar, charts) use `dynamic()` import with `ssr: false`
- Confirm Supabase indexes on frequently queried columns: `songs.user_id`, `deliverables.song_id`, `credit_transactions.user_id`

**Success Criteria**:
- [ ] Lighthouse Performance ≥ 85 on dashboard
- [ ] LCP < 3 seconds on standard broadband
- [ ] No N+1 query patterns
- [ ] Build completes without oversized bundle warnings

---

### Task 5.6 — Bug Fixing & Final Polish

**Goal**: Address all bugs found during testing. Final UI alignment pass. Ensure all empty states, error messages, and loading indicators are in place.

Steps:
- Fix all bugs surfaced in Tasks 5.1–5.5
- Final visual consistency pass — spacing, typography alignment, design adherence
- Confirm every list/table has an empty state
- Confirm every async action has a loading state
- Confirm every error has a user-facing message (no raw error objects shown)
- Verify Sentry is capturing production errors (trigger a test error, confirm it appears in Sentry dashboard)

**Success Criteria**:
- [ ] Zero known bugs remaining
- [ ] Every page has loading + empty + error states
- [ ] Sentry capturing production errors
- [ ] UI consistent across all pages with no visual regressions

---

### Task 5.7 — Documentation & Handover

**Goal**: Admin guide covering how to manage users, adjust credits, update projects, and manage schedule. Platform walkthrough document or recorded video. Login credentials and full access details handed over to Tyler.

Deliverables:

1. **Admin Guide** (PDF or Notion doc) covering:
   - How to log in as admin
   - How to manage artist accounts and credit balances (including manual adjustments)
   - How to update deliverable and project statuses
   - How to add, edit, and remove schedule slots
   - How to manage bookings (cancel/reschedule)
   - How to read and export the credit transaction log
   - How to flag/unflag priority clients

2. **Platform Walkthrough** — Loom video recording (10–15 min) of all admin actions performed live

3. **Full Platform Access Handover**:
   - Tyler's admin login credentials (email + password)
   - Vercel project — add Tyler as project collaborator
   - Supabase project — transfer project ownership to Tyler
   - GitHub repository — add Tyler as collaborator with write access
   - Stripe account — use Tyler's account from day one (no transfer needed)
   - Resend — ensure sending domain (`macwav.com`) is verified and ownership passed to Tyler

**Success Criteria**:
- [ ] Admin guide delivered and reviewed with Tyler
- [ ] Loom walkthrough video recorded and shared
- [ ] Tyler can log in to admin dashboard independently
- [ ] Tyler has owner/collaborator access on Vercel, Supabase, GitHub
- [ ] All platform credentials documented and securely handed over

---

### ✅ Milestone 5 — Friday Review Checklist
- [ ] Complete client journey works end-to-end without errors
- [ ] Complete admin journey works end-to-end without errors
- [ ] Payments work in live mode with real transactions
- [ ] No security holes — client data isolation verified
- [ ] Pages load within acceptable performance thresholds
- [ ] All known bugs resolved
- [ ] Tyler has admin guide and full platform access

---

## Payment & Milestone Schedule

| Milestone | Week | Review Date | Status |
|---|---|---|---|
| M1: Foundation & Core Infrastructure | Week 1 | Friday, End of Week 1 | Pending |
| M2: Credit System & Song Packages | Week 2 | Friday, End of Week 2 | Pending |
| M3: Admin Dashboard & Project Management | Week 3 | Friday, End of Week 3 | Pending |
| M4: Scheduling, Notifications & Polish | Week 4 | Friday, End of Week 4 | Pending |
| M5: Testing, QA & Launch Prep | Week 5 | Friday, End of Week 5 | Pending |

**Payment Terms**: Each milestone payment is due upon successful Friday review and mutual sign-off that the deliverables for that week have been completed as specified.

---

## Assumptions & Clarifications

- **Existing Work**: Development continues within Tyler's existing app, following his established design patterns and UI direction. We are not starting from scratch.
- **No File Uploads**: As confirmed by Tyler, no music files are uploaded through the platform. All file exchange happens via email. The platform handles project tracking, credits, and status only.
- **Payment Gateway**: Stripe is the sole payment processor for all credit purchases on the platform.
- **Email Notifications**: Sent via Resend. Custom branded templates included. Complex automation sequences (drip campaigns, etc.) are out of scope.
- **Calendar/Scheduling**: Built natively within the platform (not Calendly). Native build is required to support the priority scheduling logic correctly.
- **Scope Boundary**: Features listed under Future-Phase Considerations below are NOT included in this scope but the architecture is designed to accommodate them.
- **Feedback Turnaround**: Timely feedback from Tyler within 48 hours of each Friday review is essential to maintain the weekly cadence. Delays will shift subsequent milestone dates.

---

## Future-Phase Considerations

The following features are NOT included in the current 5-week scope. However, database architecture and platform structure are designed to accommodate these as future additions:

| Feature | Notes |
|---|---|
| Points/Credit Rewards System | Loyalty or bonus credit system beyond direct purchases |
| Analytics Dashboard for Artists | Streaming stats, engagement metrics, revenue tracking |
| Royalty Tracking Integrations | Integration with distribution platforms for royalty data |
| SMS Notifications | In addition to email — requires SMS provider integration |
| Expanded Automation & Reporting | Advanced workflow automations, scheduled reports |
| Subscription/Membership Tiers | Recurring membership model alongside credit system |
| In-Platform Messaging | Direct messaging between clients and admin within the platform |

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Supabase RLS policy bug exposing artist data | Critical | Test with anon role via SQL Editor before launch (Task 5.4) |
| Stripe webhook missing or delayed | High | Idempotency key + 3x retry logic + admin manual credit adjustment as fallback |
| Credit double-deduction (race condition) | High | Atomic server-side operation in Route Handler — never allow client-side deduction |
| Realtime subscription dropping | Medium | Auto-reconnect logic; subtle banner if disconnected; auto-reconnects on restore |
| Schema change mid-sprint | High | New migration file only — never edit existing migrations |
| Scheduling race condition (slot double-booked) | High | Atomic slot availability check in Route Handler before any insert |

### Timeline Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Scope creep during build | High | Milestone scope is locked — all additions go through a change request process |
| Tyler feedback delay on Friday reviews | Medium | Requires response within 48h; delays shift subsequent milestone dates accordingly |
| Stripe live mode approval delay | Medium | Submit Stripe account for live mode activation at start of Week 4 |
| Tyler's existing design/DB requires significant rework | Medium | Audit Tyler's existing structure in Week 1 before building — surface any blockers early |

---

## Success Criteria (Overall)

MVP is production-ready when:

1. ✅ All milestone deliverables (M1–M5) completed and signed off by Tyler
2. ✅ All user flows from `APP_FLOW.md` tested end-to-end without errors
3. ✅ UI matches Tyler's design direction and `macwav-frontend-guidelines.md` throughout
4. ✅ Backend matches `BACKEND_STRUCTURE.md` — Supabase BaaS, no separate server
5. ✅ Stripe live payments processing correctly via webhook
6. ✅ Real-time deliverable updates working (admin action → artist sees instantly)
7. ✅ Zero security holes — RLS verified, no secrets exposed in browser
8. ✅ LCP < 3 seconds, Lighthouse ≥ 85 on dashboard (per PRD NFR)
9. ✅ Full mobile functionality on iOS Safari + Chrome Android
10. ✅ Platform supports 50+ simultaneous users without degradation (per PRD NFR)
11. ✅ Tyler has admin guide, walkthrough video, and full platform ownership
