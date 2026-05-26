# PolicyDesk App Stable Base Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the stable Expo foundation for PolicyDesk Android with auth screens, Supabase wiring, tests, and documentation.

**Architecture:** Use a standalone Expo React Native project in this repository only. Keep business workflows out of the base; create focused modules for environment parsing, Supabase client setup, auth UI, and authenticated app placeholders.

**Tech Stack:** Expo, React Native, TypeScript, Supabase JS, Jest, React Native Testing Library, ESLint, npm.

---

## File Structure

- `package.json`: npm scripts and dependencies.
- `app.json`: Expo app configuration.
- `babel.config.js`: Expo Babel configuration.
- `tsconfig.json`: TypeScript configuration.
- `jest.config.js`: Jest configuration.
- `App.tsx`: root app entry.
- `src/screens/auth-screen.tsx`: login/signup screen.
- `src/screens/auth-screen.test.tsx`: auth screen tests.
- `src/screens/dashboard-screen.tsx`: protected dashboard placeholder.
- `src/components/auth-gate.tsx`: chooses auth or app shell state.
- `src/lib/env.ts`: Supabase environment parsing.
- `src/lib/env.test.ts`: environment tests.
- `src/lib/supabase.ts`: Supabase client factory.
- `.env.example`: required public Expo environment variables.
- `docs/database-contract.md`: local database contract copied into this repo.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `app.json`
- Create: `babel.config.js`
- Create: `tsconfig.json`
- Create: `jest.config.js`
- Create: `App.tsx`

- [ ] **Step 1: Create scaffold files**

Add minimal Expo, TypeScript, Jest, React Native Testing Library, and lint
scripts.

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 3: Verify scaffold**

Run: `npm run typecheck`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: scaffold mobile app"
```

## Task 2: Environment Contract

**Files:**
- Create: `src/lib/env.test.ts`
- Create: `src/lib/env.ts`
- Create: `.env.example`

- [ ] **Step 1: Write failing env tests**

Test that missing `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_ANON_KEY` produce a clear configuration error, and valid
values return a typed config.

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- src/lib/env.test.ts`

Expected: FAIL because `src/lib/env.ts` does not exist yet.

- [ ] **Step 3: Implement env helper**

Create `getSupabaseEnv()` returning:

```ts
type SupabaseEnv = {
  url: string;
  anonKey: string;
};
```

- [ ] **Step 4: Add `.env.example`**

Include:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 5: Run tests**

Run: `npm test -- src/lib/env.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add .env.example src/lib/env.ts src/lib/env.test.ts
git commit -m "chore: add mobile environment contract"
```

## Task 3: Supabase Client

**Files:**
- Create: `src/lib/supabase.ts`
- Modify: `package.json`

- [ ] **Step 1: Add Supabase dependency**

Run: `npm install @supabase/supabase-js`

- [ ] **Step 2: Implement Supabase client**

Use `createClient` and the validated env helper. Do not include service-role or
WhatsApp secrets in the mobile app.

- [ ] **Step 3: Run verification**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/supabase.ts
git commit -m "chore: add mobile supabase client"
```

## Task 4: Auth Screen

**Files:**
- Create: `src/screens/auth-screen.test.tsx`
- Create: `src/screens/auth-screen.tsx`

- [ ] **Step 1: Write failing auth screen tests**

Cover:

- login mode renders email, password, and submit controls.
- signup mode renders email, password, and submit controls.
- empty submit shows validation errors.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/screens/auth-screen.test.tsx`

Expected: FAIL because screen does not exist yet.

- [ ] **Step 3: Implement minimal auth screen**

Create a React Native screen with controlled email/password inputs and a submit
handler prepared for Supabase auth calls. The first base version may stop at
validation and UI wiring.

- [ ] **Step 4: Run tests**

Run: `npm test -- src/screens/auth-screen.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/auth-screen.tsx src/screens/auth-screen.test.tsx
git commit -m "feat: add mobile auth screen"
```

## Task 5: Protected App Placeholder

**Files:**
- Create: `src/screens/dashboard-screen.tsx`
- Create: `src/components/auth-gate.tsx`
- Modify: `App.tsx`

- [ ] **Step 1: Write a small auth gate test if practical**

If React Native Testing Library setup supports it cleanly, assert that signed-out
state renders auth and signed-in state renders dashboard placeholder. If not,
verify through typecheck and manual Expo render.

- [ ] **Step 2: Implement auth gate and dashboard placeholder**

Add a simple authenticated app placeholder. Do not add CRUD controls yet.

- [ ] **Step 3: Run verification**

Run: `npm test`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add App.tsx src/components src/screens
git commit -m "feat: add mobile app shell"
```

## Task 6: Database Contract Documentation

**Files:**
- Create: `docs/database-contract.md`

- [ ] **Step 1: Write local contract doc**

Document the planned tables and Excel-derived fields:

- `clients`: name, phone, email, notes.
- `insurance_types`: agent-defined policy categories.
- `policies`: client, type, policy number, signing date, expiry date, premium
  amount, due date, payment frequency, status.
- `payments`: policy, amount due, amount paid, paid date, due date, status.
- future `reminder_logs`: payment, destination phone, template, status,
  provider response, sent timestamp.

- [ ] **Step 2: Commit**

```bash
git add docs/database-contract.md
git commit -m "docs: add mobile database contract"
```

## Task 7: Final Verification

**Files:**
- Modify only if verification exposes a defect.

- [ ] **Step 1: Run all checks**

Run: `npm test`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 2: Start Expo**

Run: `npm run start`

Expected: Expo starts and the app renders the auth screen.

- [ ] **Step 3: Commit any fixes**

Only commit if verification required changes.

- [ ] **Step 4: Pause**

Stop before CRUD, payment tracking, WhatsApp, or cron work.
