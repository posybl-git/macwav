# Product Requirements Document (PRD)

## 1. Product Overview

- **Project Title**: macwav – Artist Development & Client Portal
- **Version**: 1.0
- **Last Updated**: April 2026
- **Owner**: Tyler (Client) / Posybl (Development Agency)

---

## 2. Problem Statement

Independent artists and musicians lack a structured, centralized system to manage their song development journey — from initial idea through to full commercial release. Currently, this process is fragmented: communication happens over email, progress is tracked manually, payments are handled separately, and there is no single source of truth for either the artist or the production team.

On the business side, the production company (Kycker) has no scalable way to manage multiple artists simultaneously, track which stage each artist is at, oversee credit purchases and deductions, or provide transparent progress visibility without relying on manual check-ins.

macwav solves this by providing a structured client portal that bridges the gap between artist and production team — giving artists a clear dashboard of their journey, a transparent credit system to control how far they take their song, and giving admins full operational oversight of every project and transaction.

---

## 3. Goals & Objectives

### Business Goals

- Onboard and manage multiple artist clients simultaneously without increasing operational overhead
- Replace manual tracking with an automated, scalable credit and project management system
- Reduce admin communication time by 60% by surfacing project status and credit activity directly on the platform
- Create a foundation for a long-term platform that can grow into analytics, royalty tracking, and subscription tiers in future phases

### User Goals

- Artists want to understand exactly where their song is in the development process at any given time
- Artists want full control over how much they invest in a song via a transparent credit system
- Artists want to be notified automatically when something changes on their project
- Admins want complete visibility and control over all projects, users, and credit balances from a single interface

---

## 4. Success Metrics

- **Artist onboarding time**: New artist completes registration and purchases first package in under 5 minutes
- **Admin overhead per project**: Admin time spent on manual status updates reduced by 60% within 3 months of launch
- **Credit transaction accuracy**: Zero discrepancies between credits purchased and credits reflected in user balances
- **Notification delivery rate**: 99%+ of credit and project status notifications delivered within 60 seconds
- **Platform stability**: Uptime of 99.5% or above after launch
- **User clarity**: 90%+ of test users can identify their current project stage without any guidance

---

## 5. Target Users & Personas

### Primary Persona: The Independent Artist (Client)

- **Demographics**: Age 18–40, aspiring or semi-professional musicians, based globally, comfortable with web apps but not technically advanced
- **Pain Points**:
  - No visibility into where their song is in the process
  - Unclear what they're paying for and when credits are being used
  - Communication scattered across emails with no structured progress trail
- **Goals**:
  - Understand their song's status at a glance
  - Purchase credits and choose a development package confidently
  - Know when action is needed on their end
- **Technical Proficiency**: Low to moderate — needs intuitive UX, no jargon, clear labels

---

### Secondary Persona: The Admin / Production Manager (Internal Team)

- **Demographics**: Internal staff at the production company, likely 2–5 people, highly familiar with the platform
- **Pain Points**:
  - Managing multiple artists manually across emails and spreadsheets
  - No consolidated view of all active projects, credit balances, and pending actions
  - Difficulty identifying priority clients quickly
- **Goals**:
  - See all active projects and their stages in one view
  - Adjust credit balances when needed (refunds, corrections, bonuses)
  - Update project milestones and trigger notifications to artists automatically
- **Technical Proficiency**: Moderate to high — power users of the admin panel

---

## 6. Features & Requirements

### Must-Have Features (P0)

---

**1. User Authentication & Account System**

- **Description**: Secure registration, login, and session management for artists and admins. Role-based access ensures artists only see their own projects while admins see everything.
- **User Story**: As an artist, I want to securely log in to my account so that I can access only my projects and credit balance.
- **Acceptance Criteria**:
  - [ ] Users can register with email and password
  - [ ] Login is protected with secure authentication (email/password minimum; optional social auth)
  - [ ] Artists cannot view or access any other artist's data
  - [ ] Admins have a separate login flow or role flag that unlocks the admin dashboard
  - [ ] Session tokens expire after inactivity
  - [ ] Password reset via email is functional
- **Success Metric**: Zero unauthorized data access incidents in QA testing

---

**2. Artist Dashboard**

- **Description**: A personalized home screen for each artist showing their current journey stage, active project, credit balance, and recent activity.
- **User Story**: As an artist, I want to see my current project status and credit balance on one screen so that I always know where I stand.
- **Acceptance Criteria**:
  - [ ] Dashboard displays current journey stage (IDEA / CREATE / BUILD / LAUNCH)
  - [ ] Current credit balance is visible and always up to date
  - [ ] Active project deliverables and their statuses are listed (pending, in progress, completed)
  - [ ] Recent credit activity (purchases and deductions) is visible
  - [ ] Low credit balance triggers a prompt to purchase more
  - [ ] Dashboard is mobile responsive
- **Success Metric**: 90%+ of test artists identify their project stage without prompting

---

**3. Credit System**

- **Description**: A virtual currency system where artists purchase credits via Stripe or PayPal, use them to select song development packages, and can always view their balance. Admins can manually adjust balances.
- **User Story**: As an artist, I want to purchase credits and use them to choose how far I develop my song so that I stay in control of my investment.
- **Acceptance Criteria**:
  - [ ] Artists can purchase credit bundles via Stripe or PayPal
  - [ ] Credits are automatically added to the account upon successful payment
  - [ ] Artists can view their current balance at all times (header/dashboard)
  - [ ] Credit deduction occurs when a package is selected and confirmed
  - [ ] Admins can manually add, deduct, or adjust any user's credit balance with a note/reason
  - [ ] All credit transactions (purchases, deductions, manual adjustments) are logged with timestamps
  - [ ] Artists receive a notification when credits are added or deducted
  - [ ] Artists receive a low-balance warning notification when balance drops below a defined threshold
- **Success Metric**: 100% of credit transactions logged with no discrepancy between payment and balance

---

**4. Song Development Packages (CREATE / BUILD / LAUNCH)**

- **Description**: Artists choose one of three tiered development packages for their song. Each package has a defined credit cost and set of deliverables. Credits are deducted upon selection.
- **User Story**: As an artist, I want to choose how far I want to develop my song and have the right credits deducted automatically so that I can commit to a package with confidence.
- **Acceptance Criteria**:
  - [ ] Three packages are clearly presented: CREATE (3,000 pts), BUILD (7,000 pts), LAUNCH (15,000 pts)
  - [ ] Each package displays its full list of deliverables before purchase
  - [ ] System checks if the artist has sufficient credits before allowing selection
  - [ ] If balance is insufficient, artist is prompted to purchase more credits
  - [ ] Credits are deducted immediately upon package confirmation
  - [ ] A new project is created upon package selection, tied to that artist's account
  - [ ] Artists cannot select a package they cannot afford
- **Package Details**:

  | Package | Cost | Key Deliverables |
  |---|---|---|
  | CREATE | 3,000 pts | Production & Arrangement, 2 Recording Sessions, Rough Mix (2 revisions) |
  | BUILD | 7,000 pts | Everything in CREATE + Full Production, 4 Recording Sessions, Professional Mix & Master, 3–4 Marketing Video Clips |
  | LAUNCH | 15,000 pts | Everything in BUILD + Priority Scheduling, 10–16 Marketing Video Clips, Distribution to 150 streaming sites, Spotify Discovery Mode, Publishing & Royalty Collection, Neighbouring Rights, Chart Registration, Sync Opportunities, Royalty Splits, 100% Streaming Revenue, Editorial Pitching, Detailed Analytics |

- **Success Metric**: Zero cases of incorrect credit deduction or package assignment

---

**5. Project & Milestone Tracking**

- **Description**: Each artist's active project moves through defined milestones. Admins update milestone statuses; artists see real-time progress.
- **User Story**: As an artist, I want to see the status of every deliverable in my package so that I know what's been completed and what's next.
- **Acceptance Criteria**:
  - [ ] Each project displays all deliverables mapped to the purchased package
  - [ ] Each deliverable has a status: Pending / In Progress / Completed
  - [ ] Admins can update any deliverable's status from the admin panel
  - [ ] Revision count is tracked per deliverable where applicable (e.g., mix revisions capped at 2 for CREATE)
  - [ ] Artist receives a notification when any deliverable status changes
  - [ ] Completed milestones are visually distinguished from pending ones
- **Success Metric**: Artists can identify the next action or pending deliverable without contacting the admin

---

**6. Admin Dashboard**

- **Description**: A comprehensive internal interface for the production team to manage all artists, projects, credit balances, and platform activity.
- **User Story**: As an admin, I want a single dashboard to oversee all active projects, credit transactions, and user accounts so that I can operate efficiently without switching tools.
- **Acceptance Criteria**:
  - [ ] Admins can view all registered users and their current project/stage
  - [ ] Admins can update any project's milestone statuses
  - [ ] Admins can view, add, deduct, or manually adjust any user's credit balance
  - [ ] All credit transactions across all users are visible in a log with filters (date, user, type)
  - [ ] Admins can flag priority clients (LAUNCH tier)
  - [ ] Admins receive notifications for all new credit purchases and project activity
  - [ ] Admin panel is not accessible to artist-role users
- **Success Metric**: Admin can complete a credit adjustment and status update for any project in under 2 minutes

---

**7. Notification System**

- **Description**: Automated notifications sent to artists and admins for key platform events — credit activity, project progress, and low balance alerts.
- **User Story**: As an artist, I want to be notified automatically when my project moves forward or my credits change so that I don't have to manually check the platform.
- **Acceptance Criteria**:
  - [ ] Notifications triggered for: credit purchase confirmed, credits deducted, balance low, milestone status changed
  - [ ] Admin notifications triggered for: new credit purchase by any user, new project created, any milestone completed
  - [ ] Notifications delivered via email (minimum); in-app notifications are a bonus
  - [ ] Notifications are sent within 60 seconds of the triggering event
  - [ ] Notification content includes relevant context (amount, project name, new status)
- **Success Metric**: 99%+ of triggered notifications delivered successfully in testing

---

### Should-Have Features (P1)

---

**1. Scheduling System**

- **Description**: Artists can book recording sessions or meetings directly through the platform. LAUNCH tier clients receive priority access to premium time slots.
- **User Story**: As an artist, I want to book a session through the platform so that scheduling is integrated with my project.
- **Acceptance Criteria**:
  - [ ] Available time slots are displayed on a calendar interface
  - [ ] LAUNCH tier artists see priority slots not available to lower tiers
  - [ ] Booking confirmation is sent via notification
  - [ ] Admin can manage and block time slots from the admin panel
- **Success Metric**: 80%+ of session bookings completed without admin intervention

---

**2. Credit Purchase History**

- **Description**: Artists can view a full transaction log of their credit activity — purchases, deductions, and manual adjustments.
- **User Story**: As an artist, I want to see a full history of my credit activity so that I can track exactly where my credits went.
- **Acceptance Criteria**:
  - [ ] Transaction log is visible to the artist in their account settings or dedicated page
  - [ ] Each entry shows: date, type (purchase/deduction/adjustment), amount, balance after
  - [ ] Log is paginated for long histories
- **Success Metric**: Artists can find any specific transaction within 30 seconds

---

### Nice-to-Have Features (P2)

---

**1. Analytics Dashboard for Artists (LAUNCH tier)**

- **Description**: Artists on the LAUNCH package can view streaming performance and detailed analytics within the platform.
- **User Story**: As a LAUNCH artist, I want to see my streaming and royalty analytics in one place so that I can track my commercial performance.
- **Acceptance Criteria**:
  - [ ] Analytics are only visible to LAUNCH tier users
  - [ ] Basic metrics displayed: streams, royalty earnings, distribution status
- **Success Metric**: Available for future phase scoping

---

**2. In-App Messaging / Announcements**

- **Description**: Admins can post project-specific updates or announcements directly inside the platform (currently handled via email).
- **Note**: Out of scope for MVP. Communication defaults to email per client specification.

---

**3. Royalty Tracking Integration**

- **Description**: Integration with royalty collection services to surface earnings data for LAUNCH artists.
- **Note**: Future phase — flagged for scalability planning only.

---

## 7. Explicitly OUT OF SCOPE

- **File uploads by artists**: No music, audio, or video files are uploaded through the platform. All file exchange happens via email.
- **In-app messaging or chat**: All project communication occurs via email, not through the platform.
- **Song streaming or audio playback**: The platform does not play, preview, or host audio content.
- **Subscription billing or recurring payments**: Credits are purchased as one-time bundles only. No subscriptions in this phase.
- **Social features**: No public profiles, artist discovery, or community features.
- **Mobile native apps**: Web platform only (mobile responsive, not a native iOS/Android app).
- **Royalty tracking integrations**: Scoped for a future phase — not in MVP.
- **Expanded analytics**: Basic credit history only in MVP. Full analytics dashboard is a future phase feature.

---

## 8. User Scenarios

### Scenario 1: Artist Purchases Credits and Selects a Package

- **Context**: A new artist has registered, logged in for the first time, and wants to start their song.
- **Steps**:
  1. Artist lands on dashboard — sees zero credit balance and a prompt to purchase credits
  2. Artist clicks "Buy Credits," selects a bundle, and completes payment via Stripe or PayPal
  3. Credits are added to account automatically; artist receives a confirmation notification
  4. Artist navigates to "Start a Song" and reviews the three package options
  5. Artist selects CREATE (3,000 pts), reviews deliverables, and confirms
  6. System deducts 3,000 credits, creates a new project, and sends a deduction notification
  7. Artist is redirected to their project dashboard showing all CREATE deliverables at "Pending" status
- **Expected Outcome**: Project is live, credits correctly deducted, deliverables visible
- **Edge Cases**: Payment fails → credits not added, artist shown error; insufficient credits → artist blocked from confirming package and prompted to top up

---

### Scenario 2: Admin Updates a Milestone Status

- **Context**: The production team has completed the Rough Mix for an artist's song and needs to update the platform.
- **Steps**:
  1. Admin logs into admin dashboard and locates the artist's project
  2. Admin navigates to project milestones and updates "Rough Mix" from "In Progress" to "Completed"
  3. System triggers a notification to the artist: "Your Rough Mix has been completed"
  4. Artist logs in and sees the updated status on their dashboard
- **Expected Outcome**: Status updated, artist notified, project progress reflected accurately
- **Edge Cases**: Admin accidentally marks wrong milestone → admin can revert status; artist receives duplicate notification if status toggled twice → implement state guard

---

### Scenario 3: Admin Manually Adjusts Credit Balance

- **Context**: An artist contacts the team requesting a refund for a cancelled session. Admin needs to issue a credit correction.
- **Steps**:
  1. Admin locates the artist's account in the admin panel
  2. Admin selects "Adjust Balance," enters the credit amount to add, and adds a reason note ("Session cancellation refund")
  3. System updates the artist's balance and logs the transaction with the admin's note and timestamp
  4. Artist receives a notification: "Credits added to your account"
- **Expected Outcome**: Balance corrected, transaction logged, artist notified
- **Edge Cases**: Admin enters a negative value incorrectly → system should confirm intent before processing deductions

---

### Scenario 4: Artist Has Insufficient Credits

- **Context**: An artist tries to select the BUILD package but only has 2,000 credits.
- **Steps**:
  1. Artist navigates to song packages and selects BUILD (7,000 pts)
  2. System detects insufficient balance and blocks confirmation
  3. Artist sees a message: "You need 5,000 more credits to unlock this package"
  4. Artist is prompted with a direct link to purchase more credits
- **Expected Outcome**: Package not activated, no credits deducted, artist guided to purchase
- **Edge Cases**: Race condition if credits are being processed simultaneously → transaction should be atomic

---

## 9. Dependencies & Constraints

### Technical Constraints

- Platform is built on **Bubble.io** — all architecture, database design, and logic must work within Bubble's constraints
- No file storage or audio/video upload is required, simplifying infrastructure significantly
- Bubble's native API connector will be used for payment integrations
- Scheduling system may use a native Bubble solution or a calendar API integration (e.g., Calendly API) — to be confirmed during build

### Business Constraints

- MVP must be functional enough to onboard real paying artists from day one
- Client communication (files, feedback, deliveries) remains via email — the platform supplements but does not replace it
- Admin team is small (likely 2–5 people) — interface must be efficient, not complex
- Budget and timeline to be confirmed between client and Posybl

### External Dependencies

- **Stripe** – credit purchase payment processing (primary)
- **PayPal** – credit purchase payment processing (secondary)
- **Email delivery service** – for transactional notifications (e.g., SendGrid, Mailgun, or Bubble's native email)
- **Calendar/scheduling tool** – for session booking (TBD: native Bubble or external API)

---

## 10. Timeline & Milestones

### MVP (Phase 1)

**Target**: 4–6 weeks from project kickoff

**Includes**:
- User authentication (artist + admin roles)
- Artist dashboard with stage, balance, and project status
- Credit system (Stripe + PayPal purchase, auto-credit, deduction on package selection)
- Three song development packages (CREATE / BUILD / LAUNCH)
- Project and milestone tracking with admin status updates
- Admin dashboard (user management, credit adjustment, milestone control)
- Notification system (email-based, key events)

---

### V1.0 (Phase 2)

**Target**: 8–12 weeks from project kickoff

**Adds**:
- Scheduling system with tier-based priority access
- Full credit transaction history for artists
- Admin activity log and reporting view
- UI/UX polish pass
- Mobile responsiveness QA

---

### Future Phases (Scoped, Not Scheduled)

- Analytics dashboard for LAUNCH tier artists
- Royalty tracking integrations
- SMS notifications
- Expanded admin reporting and automation
- Potential subscription/membership model

---

## 11. Risks & Assumptions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Bubble workflow complexity for credit atomicity | Medium | High | Design credit transactions as single Bubble backend workflows with error handling |
| Payment webhook reliability (Stripe/PayPal) | Low | High | Implement webhook verification and manual retry fallback in admin |
| Scope creep from client during build | High | Medium | Lock MVP scope in this PRD; all additions go through a change request process |
| Admin missing notifications on high-volume activity | Low | Medium | Group/digest notifications for bulk activity; configurable thresholds |
| Scheduling system complexity | Medium | Medium | Assess early — use Calendly integration if native Bubble solution proves insufficient |

---

### Assumptions

- All file exchange (audio, video, feedback) continues to happen via email — the platform does not replace this
- The client (Tyler/Kycker) will provide final copywriting for package descriptions, terms, and notification messages
- Stripe is the primary payment gateway; PayPal is secondary and may be deferred to V1.0 if integration complexity is high
- The admin team will be trained on the admin dashboard before go-live
- Artists will be onboarded manually or via invitation link, not through a public-facing signup page (to be confirmed)
- "Detailed Analytics" in the LAUNCH package refers to streaming/distribution data provided by third-party distribution partners, not built-in platform analytics in MVP

---

## 12. Non-Functional Requirements

- **Performance**: Pages must load within 3 seconds on standard broadband; dashboard must reflect credit balance updates within 5 seconds of a transaction completing
- **Concurrent Users**: MVP must support at least 50 simultaneous users without performance degradation
- **Security**: Role-based access control strictly enforced — no artist can access another artist's data or the admin panel; payment data handled entirely by Stripe/PayPal (no card data stored on platform)
- **Accessibility**: WCAG 2.1 AA compliance minimum; sufficient color contrast, keyboard navigability, screen reader compatibility for core flows
- **Scalability**: Database structure must support growth to 500+ artist accounts and 10,000+ credit transactions without requiring architectural rework
- **Reliability**: Target uptime of 99.5%; Bubble hosting infrastructure applies
- **Mobile Responsiveness**: Full functionality on mobile browsers (iOS Safari, Chrome Android) — not a native app, but fully usable on mobile web

---

## 13. References & Resources

- Client brief: Tyler / Kycker – Artist Development Platform (April 2026)
- Credit system and package specification: Direct client communication
- Platform: Bubble.io — https://bubble.io
- Payment integration: Stripe — https://stripe.com/docs | PayPal — https://developer.paypal.com
- Notification delivery: To be confirmed (SendGrid / Mailgun / Bubble native email)
- Design direction: Clean, modern, premium UI — music/creative industry aesthetic, dark-mode preferred
- macwav Design System: See `macwav-frontend-guidelines.md`

---

*Document prepared by Posybl for Project macwav. Internal use only. Version 1.0 — April 2026.*
