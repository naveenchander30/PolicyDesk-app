# PolicyDesk App (Mobile) — Project Status & Context

**Last Updated:** May 26, 2026  
**Phase:** 1 Stable Base — ✅ COMPLETE  
**Next Phase:** Phase 2 CRUD Implementation

---

## Quick Summary

**PolicyDesk** is a cross-platform insurance payment tracking app for independent insurance agents. This repository (`PolicyDesk-app`) contains the **React Native Android app** built with Expo, TypeScript, and Supabase.

**Current state:** The stable foundation is complete. All authentication scaffolding, environment wiring, and basic app shell are tested and production-ready. Ready to implement Phase 2 business logic (client CRUD, payment tracking, mobile UX optimizations).

---

## What We're Building

### The Problem

Independent insurance agents need to track premium payments on the go. They need:
- Quick access to pending/overdue payments while in the field
- Ability to update payment status without returning to office
- Same data as the web app, synced in real-time
- Fast, responsive mobile UI for one-handed use

### The Solution

**PolicyDesk Android App** provides field-friendly access to:
- Dashboard: pending/overdue at a glance
- Client list: quick search and filter
- Policy details: all policies for a client
- Payment updates: mark as paid directly from mobile

**Shared ecosystem:**
- **Web App** (separate repo): Desktop for detailed management
- **Android App** (this repo): Mobile for field access
- **Shared Database**: Supabase Postgres accessed by both
- **Synchronized data**: Both apps read/write same Supabase project

### User Flow

```
Agent logs in (same credentials as web) 
  → Views dashboard (quick overview of payments due)
  → Taps client card to see policies
  → Marks payment as paid
  → Changes sync to web (same Supabase project)
```

---

## Architecture Overview

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Expo + React Native | Cross-platform mobile app |
| **Language** | TypeScript | Type-safe development |
| **Database** | Supabase (Postgres) | Same as web app |
| **Auth** | Supabase Auth | Same login as web app |
| **Testing** | Jest + React Native Testing Library | Unit/component tests |
| **Packaging** | Expo | Build APK or publish to Play Store |

### How It Works

```
React Native UI (Expo)
  ↓ (renders with Supabase client)
Supabase JS Client (@supabase/supabase-js)
  ↓ (REST API / Realtime)
Supabase Cloud (Postgres + Auth)
  ↑ (shared with web app)

Same database = automatic sync between web and mobile
```

**Key principle:** Android app is a **lightweight frontend** that connects directly to Supabase. No backend server required for Phase 2. Backend code (WhatsApp, cron) comes in Phase 3.

---

## Database Schema

Identical to `PolicyDesk-web`. Documented in `docs/database-contract.md`. High-level:

```
clients
├── id, name, phone, email, notes, created_at

insurance_types
├── id, name (e.g., Vehicle, Life, Health), created_at

policies
├── id, client_id, insurance_type_id
├── policy_number, signed_on, expires_on
├── premium_amount, due_date, frequency
├── status (active/inactive), created_at

payments
├── id, policy_id
├── amount_due, amount_paid, paid_on, due_date
├── status (paid/pending/overdue), created_at

(future) reminder_logs
├── id, payment_id, destination_phone, template_name
├── status, provider_message_id, sent_at, created_at
```

**Synchronization:** Both web and mobile apps query and update the same tables. Changes on one app appear on the other within seconds (via Supabase Realtime).

---

## Project Phases

### Phase 1: Web Foundation (Complete)

**Objective:** Build complete web app for desktop management.

**Status:** ✅ Stable base complete in `PolicyDesk-web` repo. Phase 1 CRUD in progress.

---

### Phase 2: Mobile App (Current Phase)

**Objective:** Build Android app with same core functionality as web Phase 1. Optimized for field use.

**Subphases:**
- **2.0 Stable Base** (✅ COMPLETE) — Auth, Supabase wiring, protected shell
- **2.1 CRUD & Dashboard** (🔄 IN PROGRESS) — Client/policy/payment screens optimized for mobile
- **2.2 Review** — Pause and validate web↔mobile sync before Phase 3

#### 2.0 Stable Base — ✅ COMPLETE

**What's done:**
- ✅ Expo scaffold with TypeScript
- ✅ Login/signup screens with email/password auth
- ✅ Protected app shell (AuthGate) + dashboard placeholder
- ✅ Supabase client wiring (`@supabase/supabase-js`)
- ✅ Environment contract (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`)
- ✅ Test suite (8 tests, all passing)
- ✅ Database schema documented

#### 2.1 CRUD & Dashboard — IN PROGRESS

**What's next:**
- [ ] Client list screen (searchable, filterable)
- [ ] Client detail screen (all policies for this client)
- [ ] Policy detail screen (payment history, mark as paid)
- [ ] Dashboard refine (quick stats, pending count badge)
- [ ] Payment update UI (one-tap mark as paid)
- [ ] Sync feedback (show when last synced)

**Mobile-specific UX considerations:**
- One-handed navigation (bottom tab bar or drawer)
- Large tap targets (48dp minimum)
- Quick actions (swipe to mark paid, quick filters)
- Offline fallback (query local cache, sync when online)
- Push notifications (optional Phase 2.2+)

**Files structure for Phase 2.1:**
```
src/
├── screens/
│   ├── auth-screen.tsx         (existing: login/signup)
│   ├── dashboard-screen.tsx    (existing: refine with widgets)
│   ├── clients-screen.tsx      (new: list clients)
│   ├── client-detail-screen.tsx (new: policies for one client)
│   ├── policy-detail-screen.tsx (new: payment tracking)
│   └── settings-screen.tsx     (new: logout, about)
├── components/
│   ├── auth-gate.tsx           (existing: auth check)
│   ├── payment-card.tsx        (new: reusable payment item)
│   ├── client-card.tsx         (new: quick client preview)
│   └── tab-navigation.tsx      (new: bottom tabs)
├── lib/
│   ├── env.ts                  (existing: config)
│   ├── supabase.ts             (existing: client factory)
│   └── (new: CRUD helpers, types, hooks)
└── hooks/
    └── (new: useClients, usePayments, useSync, etc.)
```

### Phase 3: WhatsApp Reminders (Planned)

**Status:** Design complete, implementation blocked on Phase 1 & 2 completion.

**Backend work** (not in mobile app):
- Vercel Cron queries Supabase for due payments
- Backend sends WhatsApp Cloud API templates
- Logs all reminder attempts

**Mobile UI additions:**
- Show "Reminder sent" status on payment
- See reminder history
- Manual "Send Reminder" button (future)

### Phase 4: Polish & Enhancements (Planned)

**Candidate features:**
- Offline mode (query local SQLite cache)
- Push notifications (payment reminders, due alerts)
- Bulk operations (mark multiple as paid)
- Document scanning (photo of payment proof)
- Export reports (PDF on device)
- Biometric auth (fingerprint unlock)

---

## What's Been Accomplished (Phase 2.0)

### ✅ Completed Tasks

**Task 1: Project Scaffold**
- Files: `package.json`, `app.json`, `babel.config.js`, `tsconfig.json`, `jest.config.js`, `App.tsx`
- Dependencies: Expo, React Native, TypeScript, Jest, React Native Testing Library, ESLint
- Scripts: `npm run start`, `npm test`, `npm run typecheck`, `npm run lint`
- Build: APK generation via Expo ready
- Status: ✅ Verified and committed

**Task 2: Environment Contract**
- Files: `src/lib/env.ts`, `src/lib/env.test.ts`, `.env.example`
- Contract: Validates `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` at startup
- Tests: Failing env tests → implementation → all passing
- Status: ✅ 3 tests passing (env contract)

**Task 3: Supabase Client**
- File: `src/lib/supabase.ts`
- Features: Factory function returns authenticated Supabase client for React Native
- Dependencies: `@supabase/supabase-js`
- Usage: Direct JS client (no SSR issues like web app)
- Status: ✅ TypeCheck passing, ready for use

**Task 4: Auth Screen**
- Files: `src/screens/auth-screen.tsx`, `src/screens/auth-screen.test.tsx`
- Features:
  - Email/password inputs optimized for mobile (large tap targets)
  - Login and signup modes
  - Form validation (email format, password requirements)
  - Ready for Supabase auth integration
- Tests: 3 tests covering rendering, mode switching, validation
- Status: ✅ All tests passing, ready for auth integration

**Task 5: Protected App Placeholder**
- Files: `src/components/auth-gate.tsx`, `src/screens/dashboard-screen.tsx`, `App.tsx`
- Features:
  - AuthGate component checks Supabase session
  - Routes to auth-screen if logged out
  - Routes to dashboard if logged in
  - Dashboard placeholder (confirms protected shell works)
- Tests: 2 tests for auth-gate logic
- Status: ✅ Tests passing, structure ready for Phase 2.1 screens

**Task 6: Database Contract**
- File: `docs/database-contract.md`
- Content: Documents planned `clients`, `insurance_types`, `policies`, `payments` tables
- Alignment: **Identical to `PolicyDesk-web/docs/database-contract.md`**
- Status: ✅ Committed, validated across repos

**Task 7: Final Verification**
- Tests: `npm test` → 8 tests passing
- TypeCheck: `npm run typecheck` → No errors
- Lint: `npm run lint` → No errors
- Expo: `npm run start` → App opens in Expo, auth screen renders
- Status: ✅ All checks passing

### Current Implementation Status

| Component | Status | Details |
|-----------|--------|---------|
| **Scaffold** | ✅ Complete | Expo, React Native, TypeScript, ESLint, Jest |
| **Auth UI** | ✅ Complete | Login/signup screens, mobile-optimized inputs |
| **Auth Logic** | 🟡 Partial | Form structure ready, Supabase.auth calls TBD |
| **Supabase Wiring** | ✅ Complete | Direct client ready for queries |
| **Protected Routes** | ✅ Complete | AuthGate logic, app/auth navigation |
| **Dashboard** | 🟡 Placeholder | Shell exists, widgets TBD in Phase 2.1 |
| **CRUD Operations** | ❌ Not started | Screens, forms, database calls in Phase 2.1 |
| **Testing** | ✅ Complete (base) | 8 tests for foundation, Phase 2.1 will add more |
| **Database Migrations** | ❌ Not started | Schema documented, migrations TBD with web app |

### Test Summary

```
PASS src/lib/env.test.ts (3 tests)
  - Missing URL throws clear error
  - Missing anon key throws clear error
  - Valid config returns typed SupabaseEnv

PASS src/components/auth-gate.test.tsx (2 tests)
  - Logged out state renders auth screen
  - Logged in state renders dashboard

PASS src/screens/auth-screen.test.tsx (3 tests)
  - Login mode renders email, password, submit
  - Signup mode renders email, password, submit
  - Empty submit shows validation errors

Total: 8 tests, 0 failures, 100% pass rate
```

---

## How to Get Started

### Setup (First Time)

```bash
cd /home/neo/Projects/policydesk/PolicyDesk-app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your Supabase credentials to .env.local
# EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Run tests
npm test

# Start Expo dev server
npm run start
# Press 'a' for Android emulator, 'i' for iOS simulator, or scan QR code with Expo Go app
```

### Daily Commands

```bash
# Development
npm run start              # Start Expo dev server

# Testing
npm test                   # Run all tests
npm test -- --watch       # Watch mode
npm test -- src/components/auth-gate.test.tsx  # Specific file

# Quality checks
npm run typecheck         # TypeScript check
npm run lint              # ESLint check
npm run lint -- --fix     # Auto-fix lint issues

# Build
npm run build             # Build APK via Expo (requires EAS account)
npm run prebuild          # Generate native directories (optional)
```

### Running on Device

```bash
# Scan QR code from Expo dev server with Expo Go app (fastest way to test)
npm run start
# (QR code appears in terminal)
# Open Expo Go app on phone, scan QR code

# Or build APK for direct installation
eas build --platform android --local
# APK installs to: dist/
```

---

## Key Design Decisions

1. **Standalone Expo App**
   - Uses Expo bare workflow for maximum customization
   - Can generate native APK files
   - Faster iteration than React Native CLI

2. **Direct Supabase Connection**
   - Mobile app connects directly to Supabase (no backend proxy required in Phase 2)
   - Backend (Phase 3) only needed for WhatsApp/cron operations
   - Reduces latency and complexity

3. **Shared Database with Web App**
   - Same Supabase project accessed by both web and mobile
   - Changes on one platform immediately visible on the other
   - Database contract must stay synchronized between repos

4. **Test-First Approach**
   - Failing tests written before implementation
   - All new features require tests
   - Target: 80%+ coverage on business logic

5. **Environment Contract**
   - Required env vars validated at startup
   - Missing config raises clear error (not silent failures)
   - `.env.example` documents all required variables

6. **Backend Secrets Stay Backend**
   - WhatsApp Cloud API tokens never in mobile app
   - Mobile client uses anon key only
   - Backend-only operations (Phase 3) handle sensitive work

7. **Mobile-First UX**
   - Large tap targets (48dp minimum)
   - Bottom tab navigation (not top nav)
   - Quick actions for common workflows
   - Minimal scrolling on dashboard

---

## Common Tasks for Agents

### Adding a New Screen

1. Create `src/screens/{feature}-screen.tsx`
2. Create `src/screens/{feature}-screen.test.tsx` with failing tests
3. Implement screen component
4. Update `App.tsx` or navigation to include new screen
5. Run `npm test` to verify tests pass
6. Run `npm run typecheck` and `npm run lint`
7. Test on simulator: `npm run start` → press 'a' for Android

### Adding a New Component

```tsx
// src/components/payment-card.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export interface PaymentCardProps {
  clientName: string;
  amountDue: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  onPress: () => void;
}

export function PaymentCard({ clientName, amountDue, dueDate, status, onPress }: PaymentCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View>
        <Text>{clientName}</Text>
        <Text>${amountDue} due on {dueDate}</Text>
        <Text>{status}</Text>
      </View>
    </TouchableOpacity>
  );
}
```

### Testing a Component

```bash
# Run specific test in watch mode
npm test -- src/screens/auth-screen.test.tsx --watch

# Run all tests with verbose output
npm test -- --verbose
```

### Connecting to Supabase

```tsx
import { getSupabaseClient } from '@/lib/supabase';

// In a screen or hook
const supabase = getSupabaseClient();

// Fetch clients
const { data: clients, error } = await supabase
  .from('clients')
  .select('*');

// Update payment status
const { data, error } = await supabase
  .from('payments')
  .update({ status: 'paid', paid_on: new Date().toISOString() })
  .eq('id', paymentId);
```

---

## Differences from Web App

| Aspect | Web App | Mobile App |
|--------|---------|-----------|
| **Framework** | Next.js (React) | Expo (React Native) |
| **Supabase Client** | `@supabase/supabase-js` + SSR helpers | `@supabase/supabase-js` (direct) |
| **Server Components** | Yes (Next.js server components) | No (all client-side) |
| **Testing** | Vitest + Testing Library | Jest + React Native Testing Library |
| **Styling** | CSS modules / Tailwind | React Native styles (no CSS) |
| **Navigation** | File-based routes (App Router) | Manual with React Navigation (planned) |
| **Build/Deploy** | Vercel (automatic) | Expo / Play Store / APK |

---

## Related Documentation

- **PRD (Product Requirements):** See `/home/neo/Projects/policydesk/PRD.md` (parent folder)
- **Database Contract:** `docs/database-contract.md` (this repo)
- **Stable Base Design:** `docs/superpowers/specs/2026-05-25-stable-base-design.md`
- **Stable Base Plan:** `docs/superpowers/plans/2026-05-26-stable-base.md`
- **Web App Status:** See `PolicyDesk-web/PROJECT_STATUS.md` (parallel repo)

---

## Next Steps for Phase 2.1

The team should prioritize the following **in order**:

1. **Database Migrations** — Create actual tables (clients, insurance_types, policies, payments) in Supabase
2. **Auth Integration** — Wire up login/signup to Supabase auth (same account can log into web or mobile)
3. **Client List Screen** — Query and display all clients from Supabase
4. **Client Detail Screen** — Show all policies for one client
5. **Policy Detail Screen** — Show payment history, allow mark-as-paid action
6. **Dashboard Widgets** — Count badges, quick stats, pending/overdue overview

Each feature should:
- ✅ Start with failing tests (test-first)
- ✅ Follow mobile UX guidelines (large taps, quick actions)
- ✅ Be tested on Android emulator before merge
- ✅ Pause for review/validation before next feature

---

## Deployment Path

### Local Testing (Now)
```bash
npm run start → Scan QR code → Test in Expo Go
```

### Android Emulator
```bash
# Requires Android Studio + emulator
npm run start → Press 'a' for Android
```

### APK Distribution (Phase 2.2+)
```bash
# Via Expo EAS (recommended)
eas build --platform android --local

# Or manual with React Native CLI
npm run prebuild → npx react-native run-android --release
```

### Play Store (Phase 2.3+)
- Requires Google Play account, app signing, store listing
- Use EAS (Expo Application Services) for streamlined process

---

## Questions or Blockers?

- **For design questions:** Refer to `docs/superpowers/specs/`
- **For implementation details:** Check the corresponding plan file
- **For Supabase issues:** Verify `.env.local` has correct credentials and project is active
- **For Expo issues:** Run `npm run start --clear` to reset cache
- **For test failures:** Run `npm test -- --verbose` for details

---

**Updated:** May 26, 2026  
**Maintained by:** PolicyDesk Development Team
