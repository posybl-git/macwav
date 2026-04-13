# BACKEND_STRUCTURE.md — macwav
**Project**: macwav – Artist Development & Client Portal
**Prepared by**: Hammad Khan, Posybl Business Solutions
**Last Updated**: April 2026
**Version**: 1.0

---

## 1. Architecture Overview

macwav uses **Supabase as the complete backend platform** — no separate Node.js server, no Express, no Prisma. All backend logic runs through:

- **Supabase PostgreSQL** → All data (tables, relationships, constraints, indexes)
- **Supabase Auth** → Authentication, session management, JWT tokens
- **Supabase RLS** → Authorization at the database layer (row-level security policies)
- **Supabase Realtime** → Live updates pushed to client browsers
- **Supabase Storage** → Avatar and asset storage
- **Next.js Route Handlers** (`/app/api/`) → Custom server-side logic only where Supabase client alone is insufficient (Stripe webhooks, atomic credit operations, email sends)

---

## 2. Database Schema

---

### Table: `profiles`

Auto-created via DB trigger when a new Supabase Auth user registers.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users.id` | Matches Supabase Auth user ID |
| `email` | `text` | NOT NULL, UNIQUE | |
| `first_name` | `text` | NOT NULL | |
| `last_name` | `text` | NOT NULL | |
| `role` | `text` | NOT NULL, DEFAULT `'artist'` | `'artist'` or `'admin'` |
| `is_priority` | `boolean` | DEFAULT `false` | Admin-flagged priority artist (unlocks premium scheduling) |
| `credit_balance` | `integer` | NOT NULL, DEFAULT `0`, CHECK `>= 0` | Current credit balance in points |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Auto-updated via trigger |

**RLS Policies**:
- `SELECT`: Artist reads own row. Admin reads all rows.
- `UPDATE`: Artist updates own `first_name`, `last_name` only. Admin updates any field.
- `INSERT`: Server-side only via trigger — artists cannot self-insert.
- `DELETE`: Disabled.

---

### Table: `songs`

Created when an artist selects a package and confirms a new song project.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → `profiles.id` ON DELETE CASCADE | Owner (artist) |
| `song_name` | `text` | NOT NULL | |
| `package_tier` | `text` | NOT NULL | `'CREATE'` / `'BUILD'` / `'LAUNCH'` |
| `current_stage` | `text` | NOT NULL, DEFAULT `'CREATE'` | `'CREATE'` / `'BUILD'` / `'LAUNCH'` |
| `status` | `text` | NOT NULL, DEFAULT `'active'` | `'active'` / `'completed'` / `'paused'` |
| `revision_count` | `integer` | DEFAULT `0` | Mix revision counter |
| `admin_notes` | `text` | NULLABLE | Internal notes by Tyler's team |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**RLS Policies**:
- `SELECT`: Artist reads own songs. Admin reads all.
- `INSERT`: Server-side Route Handler only (after credit deduction confirmed).
- `UPDATE`: Admin only (status, stage, revision_count, admin_notes). Artist cannot self-edit.
- `DELETE`: Disabled.

---

### Table: `deliverables`

Auto-populated on song creation based on package tier. Individual checklist items per song.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `song_id` | `uuid` | NOT NULL, FK → `songs.id` ON DELETE CASCADE | |
| `title` | `text` | NOT NULL | e.g. "Production & Arrangement", "Rough Mix" |
| `status` | `text` | NOT NULL, DEFAULT `'pending'` | `'pending'` / `'in_progress'` / `'completed'` |
| `tier_required` | `text` | NOT NULL | Which tier this deliverable belongs to: `'CREATE'` / `'BUILD'` / `'LAUNCH'` |
| `sort_order` | `integer` | NOT NULL | Display order within the checklist |
| `completed_at` | `timestamptz` | NULLABLE | Set when status → `'completed'` |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

**RLS Policies**:
- `SELECT`: Artist reads deliverables for own songs only. Admin reads all.
- `UPDATE`: Admin only (status changes). Artist cannot edit.
- `INSERT` / `DELETE`: Service role only (Route Handler during song creation).

**Deliverables by Package Tier**:

```
CREATE (3,000 pts):
  sort 1  — Production & Arrangement (1 Song)
  sort 2  — Recording Session 1
  sort 3  — Recording Session 2
  sort 4  — Rough Mix (Revision 1)
  sort 5  — Rough Mix (Revision 2)

BUILD adds (on top of CREATE):
  sort 6  — Full Production (1 Song)
  sort 7  — Recording Session 3
  sort 8  — Recording Session 4
  sort 9  — Professional Mixing
  sort 10 — Professional Mastering
  sort 11 — Marketing Video Clip 1
  sort 12 — Marketing Video Clip 2
  sort 13 — Marketing Video Clip 3 (or 4th if applicable)

LAUNCH adds (on top of BUILD):
  sort 14 — Priority Scheduling Access
  sort 15 — Marketing Video Clips 4–16
  sort 16 — Distribution to 150+ Streaming Platforms
  sort 17 — Spotify Discovery Mode Submission
  sort 18 — Music Publishing Setup
  sort 19 — Royalty Collection Registration
  sort 20 — Neighbouring Rights Registration
  sort 21 — Official Chart Registration
  sort 22 — Sync Opportunities (Kycker)
  sort 23 — Royalty Splits Setup
  sort 24 — 100% Streaming Revenue Enabled
  sort 25 — Editorial Pitching
  sort 26 — Detailed Analytics Report
```

---

### Table: `credit_transactions`

Immutable ledger. Every credit movement is logged. Never updated or deleted.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → `profiles.id` | Artist account |
| `type` | `text` | NOT NULL | `'purchase'` / `'deduction'` / `'manual_adjustment'` |
| `amount` | `integer` | NOT NULL | Positive = credits added. Negative = credits deducted. |
| `balance_after` | `integer` | NOT NULL | Snapshot of `credit_balance` after this transaction |
| `description` | `text` | NOT NULL | e.g. "Package: CREATE – My Song", "Manual refund – session cancellation" |
| `song_id` | `uuid` | NULLABLE, FK → `songs.id` | Populated for `'deduction'` type |
| `stripe_payment_id` | `text` | NULLABLE | Stripe PaymentIntent or Checkout Session ID |
| `paypal_order_id` | `text` | NULLABLE | PayPal order ID (for PayPal purchases) |
| `admin_id` | `uuid` | NULLABLE, FK → `profiles.id` | Admin who performed `manual_adjustment` |
| `reason` | `text` | NULLABLE | Required for `manual_adjustment` type |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**RLS Policies**:
- `SELECT`: Artist reads own transactions. Admin reads all.
- `INSERT`: Service role only (Route Handlers).
- `UPDATE` / `DELETE`: Never allowed (immutable ledger).

---

### Table: `bookings` (P1 — Scheduling)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → `profiles.id` | Artist |
| `slot_id` | `uuid` | NOT NULL, FK → `schedule_slots.id` | |
| `session_type` | `text` | NOT NULL | `'recording'` / `'meeting'` / `'review'` |
| `status` | `text` | NOT NULL, DEFAULT `'confirmed'` | `'confirmed'` / `'cancelled'` / `'rescheduled'` |
| `notes` | `text` | NULLABLE | Artist notes on the booking |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**RLS Policies**:
- `SELECT`: Artist reads own bookings. Admin reads all.
- `INSERT`: Server-side only (validates slot availability atomically).
- `UPDATE`: Admin only.

---

### Table: `schedule_slots` (P1 — Scheduling)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `start_time` | `timestamptz` | NOT NULL | |
| `end_time` | `timestamptz` | NOT NULL | |
| `is_available` | `boolean` | DEFAULT `true` | Set to false when booked |
| `is_premium` | `boolean` | DEFAULT `false` | Premium slots — visible to LAUNCH/priority artists only |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**RLS Policies**:
- `SELECT`:
  - Standard artists (CREATE/BUILD): `is_available = true AND is_premium = false`
  - LAUNCH / priority-flagged artists: all `is_available = true` rows
  - Admin: all rows
- `INSERT` / `UPDATE` / `DELETE`: Admin only

---

### Table: `notifications`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | NOT NULL, FK → `profiles.id` | Recipient |
| `type` | `text` | NOT NULL | `'credit_added'` / `'credit_deducted'` / `'credit_low'` / `'song_update'` / `'booking_confirmed'` / `'new_registration'` / `'new_purchase'` / `'new_song'` |
| `title` | `text` | NOT NULL | Short notification title |
| `message` | `text` | NOT NULL | Full notification body |
| `is_read` | `boolean` | DEFAULT `false` | |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

**RLS Policies**:
- `SELECT`: Artist reads own notifications. Admin reads all.
- `INSERT`: Service role only.
- `UPDATE`: Artist can update own `is_read`. Admin can update any.

---

## 3. Database Triggers

### Trigger: Auto-create profile on signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    'artist'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Trigger: Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Repeat for: songs, deliverables
```

---

## 4. Next.js Route Handlers

All Route Handlers live in `/app/api/`. They use the Supabase **service role client** (bypasses RLS) for operations that require admin-level database access.

### `POST /api/stripe/create-checkout`
- Validates artist session
- Creates Stripe Checkout session with:
  - `metadata: { user_id, credit_amount }`
  - `success_url`, `cancel_url`
- Returns `{ url: checkoutUrl }`

### `POST /api/webhooks/stripe`
- Receives Stripe events
- Verifies webhook signature using `STRIPE_WEBHOOK_SECRET`
- On `checkout.session.completed`:
  1. Extract `user_id` + `credit_amount` from `session.metadata`
  2. Atomic update: `profiles.credit_balance += credit_amount`
  3. Insert `credit_transactions` (`type: 'purchase'`, `stripe_payment_id`)
  4. Check if balance was previously low → send "Credits Added" email via Resend
  5. Insert `notifications` record
- Returns `{ received: true }`

### `POST /api/songs/create`
- Requires authenticated artist session
- Steps (all in one atomic database transaction):
  1. Validate `credit_balance >= package_cost`
  2. Deduct credits: `profiles.credit_balance -= package_cost`
  3. Insert `credit_transactions` (`type: 'deduction'`)
  4. Insert `songs` record
  5. Insert all `deliverables` rows for the selected tier
  6. Send admin notification email (new song started)
  7. Insert `notifications` record for artist (deduction confirmation)
- Returns `{ songId }`

### `POST /api/admin/credits/adjust`
- Requires `role = 'admin'` (validated server-side — never trust client)
- Validates `reason` field is not empty
- For negative adjustments: confirms final balance would not go below 0
- Steps:
  1. Update `profiles.credit_balance`
  2. Insert `credit_transactions` (`type: 'manual_adjustment'`, `admin_id`, `reason`)
  3. If positive: send "Credits Added" email to artist + `notifications` record
- Returns `{ success: true, new_balance }`

### `POST /api/bookings/create` (P1)
- Requires authenticated artist session
- Atomic slot availability check (prevents race conditions)
- Steps:
  1. Verify `schedule_slots.is_available = true` for chosen slot
  2. Verify slot tier visibility matches artist's package
  3. Set `schedule_slots.is_available = false`
  4. Insert `bookings` record
  5. Send booking confirmation email to artist
  6. Send admin notification email
- Returns `{ bookingId }`

### `POST /api/email/send` (internal utility)
- Internal only — called by other Route Handlers
- Not publicly accessible
- Sends transactional emails via Resend

---

## 5. Supabase Realtime Configuration

Enable Realtime on these tables in the Supabase Dashboard:

| Table | Events | Used By |
|---|---|---|
| `deliverables` | `UPDATE` | Artist song detail page — live status changes |
| `songs` | `UPDATE` | Artist dashboard — live stage/status badge |
| `notifications` | `INSERT` | Admin dashboard — live notification feed |

**Client-side subscription example** (artist song detail page):

```ts
// In a 'use client' component
useEffect(() => {
  const channel = supabase
    .channel(`deliverables-song-${songId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'deliverables',
        filter: `song_id=eq.${songId}`,
      },
      (payload) => {
        updateDeliverableInState(payload.new)
      }
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [songId])
```

---

## 6. Authentication & Middleware

### Auth Flow

```
1. Artist fills signup form
2. Supabase Auth creates auth.users record
3. DB trigger fires → inserts profiles row (role = 'artist', balance = 0)
4. Supabase returns session (access_token + refresh_token)
5. @supabase/ssr stores in HTTP-only cookies

6. On every request → src/middleware.ts reads cookie → validates session
7. If valid + role = 'artist' → allow /dashboard/* routes
8. If valid + role = 'admin'  → allow /admin/* routes
9. If expired/invalid → redirect to /
```

### Middleware (`/src/middleware.ts`)

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* getAll / setAll handlers */ } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAdminRoute = path.startsWith('/admin')
  const isArtistRoute = path.startsWith('/dashboard') ||
    path.startsWith('/songs') || path.startsWith('/credits') ||
    path.startsWith('/schedule') || path.startsWith('/profile')

  if (!user && (isAdminRoute || isArtistRoute)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*', '/admin/:path*', '/songs/:path*',
    '/credits/:path*', '/schedule/:path*', '/profile/:path*'
  ]
}
```

---

## 7. Supabase Client Setup

### Browser Client (Client Components)

```ts
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server Client (Server Components + Route Handlers)

```ts
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
}

// Admin client — bypasses RLS. Server-side Route Handlers ONLY.
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}
```

---

## 8. Email Notification Events

All emails are triggered server-side via Resend from Route Handlers. Templates use React Email.

| Event | Recipient | Template File |
|---|---|---|
| Credit purchase successful | Artist | `credit-added.tsx` |
| Credits deducted (package selected) | Artist | `credit-deducted.tsx` |
| Low credit balance | Artist | `credit-low.tsx` |
| Song package started | Admin | `new-song-admin.tsx` |
| Deliverable status updated | Artist | `song-updated.tsx` |
| Booking confirmed (P1) | Artist | `booking-confirmed.tsx` |
| New booking request (P1) | Admin | `new-booking-admin.tsx` |
| New artist registered | Admin | `new-user-admin.tsx` |
| Manual credit adjustment (positive) | Artist | `credit-added.tsx` |

Templates live in `/src/lib/email/templates/`.

---

## 9. Migration Strategy

```bash
# Create new migration
supabase migration new [descriptive_name]

# Apply migrations locally
supabase db reset

# Push to production Supabase
supabase db push

# Regenerate TypeScript types after schema changes
supabase gen types typescript --project-id [ref] > src/types/supabase.ts
```

**Rules**:
- Never edit existing migration files after they have been pushed
- Every schema change = new migration file
- Always test on local Supabase instance before pushing to production
- Run `db:types` immediately after any schema change to keep TypeScript in sync

---

## 10. Security Rules Summary

| Rule | Implementation |
|---|---|
| Artists only see own data | RLS policies on all tables |
| Admin bypasses RLS | Service role key, server-side only |
| Admin role not self-assignable | `role` field only updated via service role key |
| Payments handled by Stripe | No card data touches macwav servers |
| Webhook integrity | Stripe signature verified before processing |
| Service role key never in browser | Only in Route Handlers — no `NEXT_PUBLIC_` prefix |
| All protected routes validated | Next.js middleware on every request |
| Credit balance can't go negative | `CHECK >= 0` constraint at DB level + server-side guard |
| Credit transactions immutable | No UPDATE/DELETE RLS policy on `credit_transactions` |
| Concurrent booking race condition | Atomic slot availability check in Route Handler |
