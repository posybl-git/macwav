# TECH_STACK.md — macwav
**Project**: macwav – Artist Development & Client Portal
**Prepared by**: Hammad Khan, Posybl Business Solutions
**Last Updated**: April 2026
**Version**: 1.0

---

## 1. Stack Overview

### Architecture Pattern
- **Type**: Full-Stack Monorepo (single Next.js application)
- **Pattern**: JAMstack + BaaS (Backend-as-a-Service)
- **Deployment**: Vercel (frontend + API) + Supabase (database + auth + realtime + storage)

### Why This Architecture
Next.js 15 handles the entire frontend and all server-side API logic via Route Handlers. Supabase replaces a standalone backend server entirely — providing PostgreSQL, authentication, row-level security, real-time subscriptions, and file storage from one managed platform. No separate Node.js server. No Prisma ORM. This gives macwav a lean, fast-to-build stack for the 5-week MVP with room to scale to 500+ artists without architectural changes.

---

## 2. Frontend Stack

### Core Framework
- **Framework**: Next.js
- **Version**: 15.1.0
- **Router**: App Router (server components by default, `'use client'` only where needed)
- **Reason**: Full-stack in one repo, file-based routing, server-side rendering, Route Handlers for API logic, first-class Vercel deployment
- **Documentation**: https://nextjs.org/docs
- **License**: MIT

### UI Library
- **Library**: React
- **Version**: 19.0.0
- **Reason**: Bundled with Next.js 15, component model, large ecosystem
- **Documentation**: https://react.dev
- **License**: MIT

### Language
- **Language**: TypeScript
- **Version**: 5.7.2
- **Config**: `strict: true` in `tsconfig.json`
- **Reason**: Type safety across frontend and Supabase auto-generated DB types, fewer runtime bugs
- **Documentation**: https://www.typescriptlang.org/docs

### Styling
- **Framework**: Tailwind CSS
- **Version**: 3.4.17
- **Config**: `tailwind.config.ts` — extended with macwav design tokens (see `macwav-frontend-guidelines.md`)
- **Reason**: Utility-first, consistent with design system, fast development, no separate CSS files
- **Documentation**: https://tailwindcss.com/docs
- **License**: MIT

**macwav Tailwind config extension**:
```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#101014',
        surface:    '#19191F',
        popover:    '#1E1E24',
        muted:      '#26262C',
        input:      '#212127',
        border:     '#2A2A32',
        primary:    '#905AF6',
        accent:     '#13DAC6',
        text:       '#F1F1F4',
        'muted-foreground': '#858593',
        destructive: '#E44444',
        success:    '#22C380',
        alert:      '#FAA22E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

### Component Library
- **Library**: shadcn/ui
- **Version**: Latest (components copied into `/components/ui/` — not a versioned package)
- **Reason**: Accessible, unstyled Radix UI primitives styled with Tailwind. Maps perfectly to macwav design tokens. No version lock-in.
- **Documentation**: https://ui.shadcn.com
- **License**: MIT

### State Management
- **Library**: Zustand
- **Version**: 5.0.2
- **Reason**: Lightweight, TypeScript-first, minimal boilerplate. Handles UI state (modals, sidebar, credit balance cache) without the overhead of Redux.
- **Documentation**: https://github.com/pmndrs/zustand
- **Alternatives Considered**: Redux Toolkit (rejected: overkill for MVP), React Context (rejected: performance issues on frequent updates like real-time credit balance)

### Form Handling
- **Library**: React Hook Form
- **Version**: 7.54.1
- **Validation**: Zod
- **Zod Version**: 3.24.1
- **Reason**: Minimal re-renders, TypeScript-native, compatible with shadcn/ui form components
- **Documentation**: https://react-hook-form.com

### Server State / Data Fetching
- **Library**: TanStack Query (React Query)
- **Version**: 5.62.3
- **Reason**: Handles caching, background refetching, loading/error states automatically. Pairs cleanly with Supabase client calls.
- **Documentation**: https://tanstack.com/query/latest

### Icons
- **Library**: Lucide React
- **Version**: 0.468.0
- **Reason**: Clean, consistent, tree-shakable, TypeScript support
- **Documentation**: https://lucide.dev
- **License**: ISC

### Toast Notifications
- **Library**: Sonner
- **Version**: 1.7.1
- **Reason**: Minimal, works with dark themes out of the box, simple API
- **Documentation**: https://sonner.emilkowal.ski

---

## 3. Backend Stack (Supabase BaaS — No Separate Server)

> **No standalone Node.js server. No Prisma. No Express.**
> All backend logic runs through:
> 1. **Supabase** → database, auth, RLS, realtime, storage
> 2. **Next.js Route Handlers** (`/app/api/`) → custom server-side logic (Stripe webhooks, credit operations, email triggers)

### Backend-as-a-Service
- **Platform**: Supabase
- **Reason**: Managed PostgreSQL + Auth + RLS + Realtime + Storage from one platform. Eliminates the need for a separate backend server entirely. Scales to the 500+ artist / 10,000+ transaction requirement in the PRD without architectural changes.
- **Documentation**: https://supabase.com/docs

### Database
- **Type**: PostgreSQL (Supabase-managed)
- **Version**: PostgreSQL 15
- **Client**: `@supabase/supabase-js` 2.47.3 — typed query builder, no separate ORM needed
- **Migrations**: Supabase CLI (`supabase migration new` + `supabase db push`)
- **Type Generation**: `supabase gen types typescript` → auto-generates `src/types/supabase.ts`
- **Documentation**: https://supabase.com/docs/reference/javascript

### Authentication
- **Provider**: Supabase Auth
- **Strategy**: Email + Password (primary). Magic link optional for future phase.
- **Session Management**: Supabase JWT + refresh tokens, managed via `@supabase/ssr` for Next.js App Router
- **Package**: `@supabase/ssr` 0.5.2
- **Role-Based Access**: Custom `role` field in `profiles` table (`'artist'` | `'admin'`), enforced via RLS policies and Next.js middleware
- **Documentation**: https://supabase.com/docs/guides/auth

### Row Level Security (RLS)
- RLS enabled on ALL tables
- Artists can only read/write their own rows
- Admins use Supabase **service role key** (bypasses RLS) — server-side Route Handlers only, never exposed to the browser
- Policies defined in migration files for version control

### Real-Time
- **Provider**: Supabase Realtime
- **Use Cases**:
  - `deliverables` table UPDATE → artist's song detail page updates live when admin changes status
  - `notifications` table INSERT → admin dashboard notification feed
- **Documentation**: https://supabase.com/docs/guides/realtime

### File Storage
- **Provider**: Supabase Storage
- **Use Case**: Profile avatars and admin-uploaded assets only
- **Note**: No music, audio, or video file uploads — per PRD scope (file exchange via email)
- **Documentation**: https://supabase.com/docs/guides/storage

### Payments (Primary)
- **Provider**: Stripe
- **Server SDK**: `stripe` 17.3.1
- **Client SDK**: `@stripe/stripe-js` 5.2.0
- **Method**: Stripe Checkout (hosted) for simplicity and PCI compliance
- **Webhook Handler**: `/app/api/webhooks/stripe/route.ts`
- **Documentation**: https://stripe.com/docs

### Payments (Secondary — may defer to V1.0)
- **Provider**: PayPal
- **SDK**: `@paypal/paypal-js` 8.1.3 (client), PayPal REST API (server)
- **Note**: PRD specifies PayPal as secondary. Assess integration complexity in Week 2. Defer to V1.0 if adds significant scope.
- **Documentation**: https://developer.paypal.com/sdk/js

### Email Notifications
- **Provider**: Resend
- **Version**: `resend` 4.0.1
- **Templates**: React Email — `@react-email/components` 0.0.26
- **Trigger**: Sent server-side from Next.js Route Handlers on key events
- **Reason**: Developer-friendly, reliable delivery, React-based email templates
- **Documentation**: https://resend.com/docs
- **Alternatives Considered**: SendGrid (rejected: more complex setup), Mailgun (rejected: less ergonomic API), Bubble native email (N/A — not Bubble)

---

## 4. DevOps & Infrastructure

### Version Control
- **System**: Git
- **Platform**: GitHub
- **Branch Strategy**:
  - `main` → Production (auto-deploys to Vercel on push)
  - `dev` → Staging / active development
  - `feature/[name]` → Feature branches (PR into `dev`)
  - `hotfix/[name]` → Urgent production fixes (PR into `main`)

### Deployment
- **Platform**: Vercel
- **Trigger**: Push to `main` → auto-deploy production. Push to `dev` → auto-deploy preview.
- **Env Variables**: Configured per environment in Vercel Dashboard
- **Reason**: Best-in-class Next.js support, zero-config, automatic edge network, free preview deploys per PR
- **Documentation**: https://vercel.com/docs

### Database Hosting
- **Platform**: Supabase (managed)
- **Region**: US East (closest to primary user base)
- **Backups**: Daily automated backups (Supabase Pro plan)

### CI/CD
- **Primary**: Vercel (built-in — builds on every push + PR)
- **Optional GitHub Action**: TypeScript type-check + ESLint on every PR before merge

### Monitoring
- **Error Tracking**: Sentry (`@sentry/nextjs` 8.46.0)
- **Analytics**: Vercel Analytics (built-in, zero config)
- **Logging**: Vercel function logs (visible in Vercel dashboard)

### Testing
- **Unit / Component**: Vitest 2.1.8
- **E2E**: Playwright 1.49.1
- **Coverage Target**: 70% for MVP (focus on: auth flows, credit purchase, package selection, webhook handler)

---

## 5. Development Tools

### Code Quality
- **Linter**: ESLint 9.16.0 (with `eslint-config-next`)
- **Formatter**: Prettier 3.4.2 (`.prettierrc.json`)
- **Git Hooks**: Husky 9.1.7
  - Pre-commit: `lint-staged` → ESLint + Prettier on staged files
  - Pre-push: TypeScript type-check (`tsc --noEmit`)

### IDE Recommendation
- **Editor**: VS Code
- **Extensions**:
  - ESLint
  - Prettier — Code Formatter
  - Tailwind CSS IntelliSense
  - Supabase (official extension)

---

## 6. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."         # Public — safe in browser
SUPABASE_SERVICE_ROLE_KEY="eyJ..."             # PRIVATE — server-side only

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."                # PRIVATE — server-side only
STRIPE_WEBHOOK_SECRET="whsec_..."             # PRIVATE — webhook verification

# PayPal (P1 — add when implementing)
NEXT_PUBLIC_PAYPAL_CLIENT_ID="..."
PAYPAL_SECRET="..."                            # PRIVATE — server-side only

# Email (Resend)
RESEND_API_KEY="re_..."                        # PRIVATE — server-side only
RESEND_FROM_EMAIL="noreply@macwav.com"

# App
NEXT_PUBLIC_APP_URL="https://macwav.vercel.app"
NODE_ENV="production"
```

> ⚠️ Variables prefixed `NEXT_PUBLIC_` are exposed to the browser. Never prefix secret keys with `NEXT_PUBLIC_`.

---

## 7. Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "db:types": "supabase gen types typescript --project-id [ref] > src/types/supabase.ts",
    "db:push": "supabase db push",
    "db:reset": "supabase db reset",
    "db:migrate": "supabase migration new"
  }
}
```

---

## 8. Dependencies Lock

### Production

```json
{
  "next": "15.1.0",
  "react": "19.0.0",
  "react-dom": "19.0.0",
  "typescript": "5.7.2",
  "tailwindcss": "3.4.17",
  "@supabase/supabase-js": "2.47.3",
  "@supabase/ssr": "0.5.2",
  "zustand": "5.0.2",
  "react-hook-form": "7.54.1",
  "zod": "3.24.1",
  "@tanstack/react-query": "5.62.3",
  "@tanstack/react-query-devtools": "5.62.3",
  "stripe": "17.3.1",
  "@stripe/stripe-js": "5.2.0",
  "@paypal/paypal-js": "8.1.3",
  "resend": "4.0.1",
  "@react-email/components": "0.0.26",
  "lucide-react": "0.468.0",
  "sonner": "1.7.1",
  "@sentry/nextjs": "8.46.0"
}
```

### Dev

```json
{
  "eslint": "9.16.0",
  "eslint-config-next": "15.1.0",
  "prettier": "3.4.2",
  "husky": "9.1.7",
  "lint-staged": "15.2.11",
  "vitest": "2.1.8",
  "@playwright/test": "1.49.1",
  "supabase": "2.2.1"
}
```

---

## 9. Security Considerations

### Authentication
- Supabase Auth handles JWT generation, rotation, and expiry automatically
- Server-side session validation via `@supabase/ssr` on every protected route
- Admin operations always use `SUPABASE_SERVICE_ROLE_KEY` (server-side Route Handlers only — never in browser)
- Next.js middleware checks `role` on every admin route request

### Database Security
- RLS enabled on every table — artists cannot read another artist's data even if they know the row ID
- Admins bypass RLS via service role key on server only
- `credit_balance` has a CHECK constraint (`>= 0`) — enforced at DB level

### Payment Security
- Stripe secret key never in client-side code
- Webhook signature verified with `STRIPE_WEBHOOK_SECRET` before any credit update
- Credits only updated via verified webhook — never via client-side calls
- No card data stored on macwav platform (Stripe handles all PCI compliance)

### Data Protection
- HTTPS enforced by Vercel (automatic SSL/TLS)
- All secrets stored in Vercel environment settings — never in `.env` committed to Git
- `.env.local` added to `.gitignore`

### Rate Limiting
- Supabase Auth: built-in rate limiting on login attempts (5/15 min)
- Stripe Checkout: rate limiting handled by Stripe natively
- Custom Route Handlers: add `@upstash/ratelimit` if needed (post-MVP)

---

## 10. Version Upgrade Policy

### Major Versions
- Quarterly review
- Test in `dev` branch before merging to `main`
- Check official changelogs for breaking changes

### Security Patches
- Apply immediately on CVE disclosure
- `npm audit` run weekly in CI

### Supabase Schema Changes
- Always `supabase migration new [description]` — never edit existing migrations
- Test locally before `supabase db push` to production
- Re-run `db:types` after every schema change to keep TypeScript types in sync
