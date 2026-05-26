# PolicyDesk App Stable Base Design

## Goal

Build a stable, testable foundation for the PolicyDesk Android app before any
client, policy, payment, or WhatsApp reminder workflows are implemented.

## Repository Boundary

`PolicyDesk-app` is an independent git repository. It must not import files from
`PolicyDesk-web` or from the parent `policydesk` directory. Any shared product
contracts, such as database table names or environment variable names, are
documented locally in this repository.

Commits for app work are made from this folder only.

## Scope

Included in the stable base:

- Expo app scaffold with TypeScript.
- Login and signup screen prepared for Supabase email/password auth.
- Protected application shell placeholder after authentication.
- Supabase client setup.
- Environment variable example for Supabase configuration.
- Unit/component test setup.
- Lint and typecheck scripts.
- Local documentation for database contracts and phase boundaries.

Not included in the stable base:

- Client CRUD.
- Insurance type CRUD.
- Policy CRUD.
- Payment status workflows.
- WhatsApp reminder sending.
- Cron jobs.
- Multi-agent support.
- Payment gateway integration.

## Architecture

The Android app uses Expo and React Native as an independent frontend connected
to the same Supabase project as the web app. The stable base will prepare the
navigation, configuration, and tests needed for Phase 2, without implementing
business workflows yet.

Expected screen groups:

- Public auth screens for login and signup.
- Protected app screens for authenticated agent workflows.
- A dashboard placeholder that confirms the protected shell works.

The app may use the Supabase anon key, but it must never contain server-only
secrets such as WhatsApp Cloud API tokens.

## Data Contract

The first implementation will document, but not yet migrate, the high-level
tables from the PRD and the agent's current Excel-style records.

- `clients`: client name, phone number, optional email, optional notes.
- `insurance_types`: agent-defined categories such as vehicle, life, health,
  and other insurance lines.
- `policies`: linked client, linked insurance type, policy number, signing date,
  expiry date, premium amount, payment frequency, due date, and active/inactive
  status.
- `payments`: linked policy, amount due, amount paid, paid date, due date, and
  paid/pending/overdue status.

Policy number, signing date, and expiry date belong to `policies`, not
`clients`, because one client can hold multiple policies.

If the source Excel sheet contains extra fields that are not yet modeled, the
Phase 2 import/manual-entry design should either map them to `notes` or defer
them until the exact column list is available. The stable base should not add a
generic custom-field system yet.

The eventual Phase 3 WhatsApp work will add reminder logging. The design should
leave room for a future `reminder_logs` table linked to payment records.

## WhatsApp Reminder Direction

WhatsApp premium reminders are Phase 3 work. They should be implemented from a
backend boundary, not directly from the Android app.

Recommended future flow:

1. A backend schedule or API endpoint queries Supabase for pending or overdue
   premiums.
2. The backend sends approved WhatsApp Cloud API template messages.
3. Each attempt is written to reminder logs.
4. The Android app can later request reminder sending through the backend, but
   it must never hold the WhatsApp API token.

## Testing

The base should include tests for:

- Auth screen rendering and validation behavior.
- Protected shell behavior at the component or navigation-helper level.
- Supabase environment/configuration helper behavior where practical.

No production behavior should be added without a failing test first.

## Review Checkpoint

After this base is implemented and verified, development pauses before adding
Phase 2 mobile CRUD and payment tracking workflows.
