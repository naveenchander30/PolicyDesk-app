# PolicyDesk App

Mobile companion to PolicyDesk Web — manage clients, policies, and payments on the go.

Built with **Expo 56**, **React Native Paper** (Material Design 3), and **Supabase Auth**.

## Features

- **Auth** — Supabase email/password login
- **Dashboard** — Stats overview (clients, policies, pending/paid payments)
- **Clients** — CRUD with search, detail view, linked policies, payment summary
- **Policies** — CRUD with client + insurance-type dropdowns, status filter chips
- **Payments** — CRUD with pending/paid filter chips, mark-as-paid action

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Expo 56 (React Native) |
| Auth | Supabase (email/password) |
| Database | Supabase (PostgreSQL) |
| UI Kit | React Native Paper (MD3) |
| Navigation | React Navigation (bottom tabs + native stacks) |
| Testing | Jest + React Native Testing Library |

## Theme

Custom dark theme (`src/theme.ts`) extending `MD3DarkTheme` with Stitch tokens: background `#0b1326`, surface `#171f33`, primary `#adc6ff`, tertiary `#ffb786`. All screens dynamically consume theme via `useTheme()`.

## Getting Started

```bash
# Install
npm install

# Environment
cp .env.example .env.local
# Fill in: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY

# Start Expo dev server
npm start

# Test / typecheck / lint
npm test
npm run typecheck
npm run lint
```

## Project Structure

```
src/
  screens/           — Auth screen
  features/          — Feature modules
    dashboard/       — Dashboard with stat cards + reminders
    clients/         — List, detail, form screens + queries + types
    policies/        — List, detail, form screens + queries + types
    payments/        — List, form screens + queries + types
  components/        — Shared components (auth-gate)
  navigation/        — Bottom tab navigator + stack navigators
  lib/               — Supabase client
  theme.ts           — Stitch dark theme tokens
```

## Notes

- The mobile app and web app share the same Supabase project
- WhatsApp reminders are available on the web dashboard only
