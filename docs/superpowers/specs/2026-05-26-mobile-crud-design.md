# Mobile CRUD Implementation — Phase 2.1 Design Spec

## Overview

Add full CRUD screens + dashboard + navigation to the PolicyDesk mobile app using React Navigation and React Native Paper. Mirrors the Phase 1.1 web CRUD capabilities.

## New Dependencies

- `@react-navigation/native` — core navigation
- `@react-navigation/bottom-tabs` — bottom tab navigator
- `@react-navigation/native-stack` — stack navigator for each tab
- `react-native-screens` — native screen containers
- `react-native-safe-area-context` — safe area handling
- `react-native-paper` — Material Design component library
- `react-native-vector-icons` — icons for Paper

## Navigation Structure

```
NavigationContainer
└── BottomTabNavigator (4 tabs)
    ├── "Dashboard" tab → Stack
    │   └── DashboardScreen
    ├── "Clients" tab → Stack
    │   ├── ClientListScreen
    │   ├── ClientDetailScreen (shows client info + policies list)
    │   ├── ClientCreateScreen
    │   └── ClientEditScreen
    ├── "Policies" tab → Stack
    │   ├── PolicyListScreen
    │   ├── PolicyDetailScreen (shows policy info + payments list)
    │   ├── PolicyCreateScreen
    │   └── PolicyEditScreen
    └── "Payments" tab → Stack
        ├── PaymentListScreen
        └── PaymentCreateScreen (inline paid toggle)
```

Tab icons: `view-dashboard`, `account-group`, `file-document`, `currency-usd` (Material Community Icons via Paper).

## Auth Wiring

- `AuthGate` calls `supabase.auth.getSession()` on mount → shows BottomTabNavigator or AuthScreen
- `AuthScreen` submits to `supabase.auth.signInWithPassword()` / `supabase.auth.signUp()`
- Auth state listener via `supabase.auth.onAuthStateChange()` to react to session changes
- Sign out via a header button or settings row

## Data Layer

### Custom Hooks

Each hook follows the same pattern:

```typescript
function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useFocusEffect(useCallback(() => {
    fetchClients();
  }, []));

  return { clients, loading, error, refetch };
}
```

Hooks: `useClients`, `useClient(id)`, `usePolicies`, `usePolicy(id)`, `usePayments`, `usePayment(id)`, `useDashboardStats`.

### Supabase Queries

Inline in hooks (same queries as web app, using the mobile Supabase client from `@/lib/supabase`):

- clients: `select *` / `insert` / `update` / `select by id`
- policies: `select *, insurance_types(name), clients(name)` / `insert` / `update`
- payments: `select *` with optional `policy_id` filter / `insert` / `update status`
- dashboard: aggregate counts via `.select('*', { count: 'exact', head: true })`

Query files at `src/features/*/queries.ts` (no server/client split needed — mobile Supabase client is universal).

## Screens

### Dashboard
- 4 stat cards (Paper `Card`): Total Clients, Active Policies, Pending Payments, Payments This Month
- `useDashboardStats` hook runs on focus
- `ScrollView` with cards in a 2-column grid layout

### ClientList
- `FlatList` with `Searchbar` at top
- Each row: `List.Item` with avatar initials, name, email
- `FAB` for create
- Pull-to-refresh
- Empty state message

### ClientDetail
- `Card` with client info (name, email, phone, notes)
- Section: "Policies" with `FlatList` below
- "Add Policy" button navigating to PolicyCreate with pre-filled client
- Edit button in header

### ClientForm (Create + Edit)
- `TextInput` fields: name, email, phone, notes
- Validation: name required, email format optional
- Submit button in Paper `Button`
- Success → navigate back and refetch list

### PolicyList
- `FlatList` with status filter chips (All, Active, Expired)
- Each row: `Card` with client name, insurance type, premium, status badge
- `FAB` for create
- Pull-to-refresh

### PolicyDetail
- `Card` with policy info (client, insurance type, premium, dates, status)
- Section: "Payments" with `FlatList`
- "Add Payment" button
- Edit button in header

### PolicyForm (Create + Edit)
- `TextInput` for premium amount
- `TextInput` for policy number (auto-generated placeholder)
- `TextInput` with `YYYY-MM-DD` format hint for start/end dates (no date picker library — plain text input with validation)
- Dropdown for client selection (Paper `Menu` or `Dialog` with list)
- Dropdown for insurance type selection
- Validation: premium, start_date, client required

### PaymentList
- `FlatList` with all payments across policies
- Each row: `Card` with policy info, amount, date, paid/unpaid badge
- `FAB` for create
- Button to mark as paid (not swipe — simpler and more reliable)
- Pull-to-refresh

### PaymentForm
- `TextInput` for amount
- `TextInput` for date
- `TextInput` for notes
- Dropdown for policy selection
- Toggle switch for "Mark as paid"
- Validation: amount required

## Error & Loading Handling

- Each screen shows a `ActivityIndicator` (Paper) during loading
- Errors shown as `Snackbar` or inline `HelperText`
- Empty states with icon + message + optional CTA button
- Network errors caught and surfaced as user-friendly messages

## Testing

- Continue using Jest + React Native Testing Library
- Test: auth flow (sign in navigates to tabs, sign out returns to auth)
- Test: each list screen renders items or empty state
- Test: form validation (required fields, email format)
- Mock `@supabase/supabase-js` for all tests
- ~15-20 new tests expected

## File Structure

```
src/
├── navigation/
│   └── app-navigator.tsx          # NavigationContainer + BottomTabNavigator + stacks
├── features/
│   ├── dashboard/
│   │   ├── use-dashboard-stats.ts
│   │   └── dashboard-screen.tsx
│   ├── clients/
│   │   ├── client.types.ts
│   │   ├── client.queries.ts
│   │   ├── client-list-screen.tsx
│   │   ├── client-detail-screen.tsx
│   │   ├── client-form-screen.tsx
│   │   └── client.test.tsx
│   ├── policies/
│   │   ├── policy.types.ts
│   │   ├── policy.queries.ts
│   │   ├── policy-list-screen.tsx
│   │   ├── policy-detail-screen.tsx
│   │   ├── policy-form-screen.tsx
│   │   └── policy.test.tsx
│   └── payments/
│       ├── payment.types.ts
│       ├── payment.queries.ts
│       ├── payment-list-screen.tsx
│       ├── payment-form-screen.tsx
│       └── payment.test.tsx
├── screens/                       # Existing auth/dashboard screens remain
│   ├── auth-screen.tsx
│   └── dashboard-screen.tsx       # Becomes empty shell → logic moves to features/
└── components/
    └── auth-gate.tsx              # Updated with real session check
```

Existing `auth-screen.tsx` and `auth-gate.tsx` will be updated with real Supabase calls. The placeholder `dashboard-screen.tsx` will be replaced by the feature-based dashboard.

## Implementation Order

1. Install new dependencies
2. Wire real Supabase auth (AuthGate session check, AuthScreen API calls)
3. Build navigation structure (app-navigator with tabs + stacks)
4. Create shared types and query files for clients, policies, payments
5. Build Dashboard screen (stats)
6. Build Clients feature (list, detail, form)
7. Build Policies feature (list, detail, form)
8. Build Payments feature (list, form)
9. Wire payments mark-as-paid into policy detail
10. Write tests for each feature
11. Run full test suite and verify
