# PolicyDesk Database Contract

This document records the planned Supabase schema for the Android app. The
stable base does not create migrations yet; it only fixes the contract that
future web and mobile work will target.

## `clients`

Stores one customer/person.

- `id`
- `name`
- `phone`
- `email`
- `notes`
- `created_at`

## `insurance_types`

Stores agent-defined policy categories.

- `id`
- `name`
- `created_at`

Examples: vehicle, life, health, travel, business.

## `policies`

Stores one insurance policy owned by one client.

- `id`
- `client_id`
- `insurance_type_id`
- `policy_number`
- `signed_on`
- `expires_on`
- `premium_amount`
- `due_date`
- `frequency`
- `status`
- `created_at`

Policy number, signing date, and expiry date belong here because one client can
hold multiple policies.

## `payments`

Stores payment tracking entries for a policy.

- `id`
- `policy_id`
- `amount_due`
- `amount_paid`
- `paid_on`
- `due_date`
- `status`
- `created_at`

Payment status values: `paid`, `pending`, `overdue`.

## Future `reminder_logs`

Phase 3 WhatsApp reminders should log every send attempt.

- `id`
- `payment_id`
- `destination_phone`
- `template_name`
- `status`
- `provider_message_id`
- `provider_response`
- `sent_at`
- `created_at`

WhatsApp API tokens must stay in backend-only configuration. Browser and mobile
clients must never contain those secrets.
