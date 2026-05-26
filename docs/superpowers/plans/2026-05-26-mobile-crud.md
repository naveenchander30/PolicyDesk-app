# Mobile CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full CRUD screens, dashboard, and navigation to the PolicyDesk mobile app.

**Architecture:** React Navigation bottom tabs (Dashboard, Clients, Policies, Payments) with stack navigators per tab. React Native Paper for UI components. Supabase direct queries via custom hooks. Real auth session check via `supabase.auth.getSession()`.

**Tech Stack:** Expo 56, React Native Paper, @react-navigation (bottom-tabs + native-stack), Supabase JS client, Jest + React Native Testing Library.

---

## File Structure

```
src/
├── navigation/
│   └── app-navigator.tsx          CREATE — NavigationContainer + BottomTabNavigator + stacks
├── features/
│   ├── dashboard/
│   │   ├── use-dashboard-stats.ts  CREATE — aggregate stats hook
│   │   └── dashboard-screen.tsx    CREATE — stat cards
│   ├── clients/
│   │   ├── client.types.ts         CREATE — Client type
│   │   ├── client.queries.ts       CREATE — Supabase queries + useClients hook
│   │   ├── client-list-screen.tsx  CREATE — FlatList with search
│   │   ├── client-detail-screen.tsxCREATE — info card + policies
│   │   ├── client-form-screen.tsx  CREATE — create/edit form
│   │   └── client.test.tsx         CREATE — tests
│   ├── policies/
│   │   ├── policy.types.ts         CREATE — Policy + PolicyWithDetails types
│   │   ├── policy.queries.ts       CREATE — Supabase queries + hooks
│   │   ├── policy-list-screen.tsx  CREATE — FlatList with filter
│   │   ├── policy-detail-screen.tsxCREATE — info + payments
│   │   ├── policy-form-screen.tsx  CREATE — create/edit form
│   │   └── policy.test.tsx         CREATE — tests
│       ├── insurance-types/
│       │   ├── insurance-type.types.ts  CREATE — InsuranceType type
│       │   └── insurance-type.queries.ts CREATE — fetchInsuranceTypes
│       └── payments/
│       ├── payment.types.ts        CREATE — Payment type
│       ├── payment.queries.ts      CREATE — Supabase queries + hooks
│       ├── payment-list-screen.tsx CREATE — FlatList with paid badge
│       ├── payment-form-screen.tsx CREATE — form with paid toggle
│       └── payment.test.tsx        CREATE — tests
├── screens/
│   ├── auth-screen.tsx             MODIFY — wire Supabase API calls
│   └── auth-screen.test.tsx        MODIFY — add real auth tests
├── components/
│   └── auth-gate.tsx               MODIFY — real session check via supabase.auth
├── lib/
│   └── supabase.ts                 MODIFY — ensure singleton export
├── App.tsx                         MODIFY — wrap with PaperProvider + NavigationContainer
```

### Task 1: Install New Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install React Navigation and React Native Paper deps**

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack react-native-screens react-native-safe-area-context react-native-paper react-native-vector-icons
npm install --save-dev @types/react-native-vector-icons
```

- [ ] **Step 2: Verify install**

```bash
npx expo install --check
```

Expected: No missing or incompatible dependencies.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add react-navigation and react-native-paper deps"
```

### Task 2: Create Shared Types

**Files:**
- Create: `src/features/clients/client.types.ts`
- Create: `src/features/policies/policy.types.ts`
- Create: `src/features/payments/payment.types.ts`

- [ ] **Step 1: Create client types**

```typescript
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ClientInput = Pick<Client, "name"> & Partial<Pick<Client, "email" | "phone" | "notes">>;
```

- [ ] **Step 2: Create policy types**

```typescript
import { tables } from "../../../../PolicyDesk-web/src/features/policies/policy.types";
import type { Tables } from "./database.types";

// Simplified for mobile - no generated types needed, use inline
export interface Policy {
  id: string;
  client_id: string;
  insurance_type_id: string;
  policy_number?: string;
  premium: number;
  start_date: string;
  end_date?: string;
  status: "active" | "expired" | "cancelled";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PolicyWithDetails extends Policy {
  insurance_types?: { name: string } | { name: string }[];
  clients?: { name: string } | { name: string }[];
}

export type PolicyInput = Pick<Policy, "client_id" | "insurance_type_id" | "premium" | "start_date"> & Partial<Pick<Policy, "policy_number" | "end_date" | "status" | "notes">>;
```

- [ ] **Step 3: Create payment types**

```typescript
export interface Payment {
  id: string;
  policy_id: string;
  amount: number;
  payment_date: string;
  status: "pending" | "paid";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type PaymentInput = Pick<Payment, "policy_id" | "amount"> & Partial<Pick<Payment, "payment_date" | "status" | "notes">>;
```

- [ ] **Step 4: Commit**

```bash
git add src/features/clients/client.types.ts src/features/policies/policy.types.ts src/features/payments/payment.types.ts
git commit -m "feat: add mobile CRUD type definitions"
```

### Task 2a: Create Insurance Types Query Module

**Files:**
- Create: `src/features/insurance-types/insurance-type.types.ts`
- Create: `src/features/insurance-types/insurance-type.queries.ts`

- [ ] **Step 1: Create insurance type types**

```typescript
export interface InsuranceType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export type InsuranceTypeInput = Pick<InsuranceType, "name"> & Partial<Pick<InsuranceType, "description">>;
```

- [ ] **Step 2: Create insurance type queries**

```typescript
import { createSupabaseClient } from "@/lib/supabase";
import { InsuranceType } from "./insurance-type.types";

const supabase = createSupabaseClient();

export async function fetchInsuranceTypes(): Promise<InsuranceType[]> {
  const { data, error } = await supabase.from("insurance_types").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/insurance-types/insurance-type.types.ts src/features/insurance-types/insurance-type.queries.ts
git commit -m "feat: add insurance types query module"
```

### Task 3: Create Query Modules with Hooks

**Files:**
- Create: `src/features/clients/client.queries.ts`
- Create: `src/features/policies/policy.queries.ts`
- Create: `src/features/payments/payment.queries.ts`
- Create: `src/features/dashboard/use-dashboard-stats.ts`

- [ ] **Step 1: Create client queries with `useClients` hook**

```typescript
import { useState, useCallback } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { Client, ClientInput } from "./client.types";

const supabase = createSupabaseClient();

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchClient(id: string): Promise<Client> {
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createClient(input: ClientInput): Promise<Client> {
  const { data, error } = await supabase.from("clients").insert([input]).select().single();
  if (error) throw error;
  return data;
}

export async function updateClient(id: string, input: Partial<ClientInput>): Promise<Client> {
  const { data, error } = await supabase.from("clients").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Create policy queries**

```typescript
import { createSupabaseClient } from "@/lib/supabase";
import { Policy, PolicyInput, PolicyWithDetails } from "./policy.types";

const supabase = createSupabaseClient();

export async function fetchPolicies(): Promise<PolicyWithDetails[]> {
  const { data, error } = await supabase
    .from("policies")
    .select("*, insurance_types(name), clients(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPolicy(id: string): Promise<PolicyWithDetails> {
  const { data, error } = await supabase
    .from("policies")
    .select("*, insurance_types(name), clients(name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createPolicy(input: PolicyInput): Promise<Policy> {
  const { data, error } = await supabase.from("policies").insert([input]).select().single();
  if (error) throw error;
  return data;
}

export async function updatePolicy(id: string, input: Partial<PolicyInput>): Promise<Policy> {
  const { data, error } = await supabase.from("policies").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 3: Create payment queries**

```typescript
import { createSupabaseClient } from "@/lib/supabase";
import { Payment, PaymentInput } from "./payment.types";

const supabase = createSupabaseClient();

export async function fetchPayments(): Promise<Payment[]> {
  const { data, error } = await supabase.from("payments").select("*").order("payment_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPaymentsByPolicy(policyId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("policy_id", policyId)
    .order("payment_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPayment(input: PaymentInput): Promise<Payment> {
  const { data, error } = await supabase.from("payments").insert([input]).select().single();
  if (error) throw error;
  return data;
}

export async function markPaymentAsPaid(id: string): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .update({ status: "paid" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 4: Create dashboard stats hook**

```typescript
import { useState, useCallback } from "react";
import { createSupabaseClient } from "@/lib/supabase";

const supabase = createSupabaseClient();

export interface DashboardStats {
  totalClients: number;
  totalPolicies: number;
  pendingPayments: number;
  overduePayments: number;
  paidThisMonth: number;
  loading: boolean;
  error: Error | null;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalPolicies: 0,
    pendingPayments: 0,
    overduePayments: 0,
    paidThisMonth: 0,
    loading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));
      const [clientRes, policyRes, pendingRes] = await Promise.all([
        supabase.from("clients").select("*", { count: "exact", head: true }),
        supabase.from("policies").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const paidRes = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "paid")
        .gte("payment_date", firstOfMonth);

      setStats({
        totalClients: clientRes.count ?? 0,
        totalPolicies: policyRes.count ?? 0,
        pendingPayments: pendingRes.count ?? 0,
        overduePayments: pendingRes.count ?? 0,
        paidThisMonth: paidRes.count ?? 0,
        loading: false,
        error: null,
      });
    } catch (e) {
      setStats((prev) => ({ ...prev, loading: false, error: e as Error }));
    }
  }, []);

  return { ...stats, refetch: fetchStats };
}
```

- [ ] **Step 5: Commit**

```bash
git add src/features/clients/client.queries.ts src/features/policies/policy.queries.ts src/features/payments/payment.queries.ts src/features/dashboard/use-dashboard-stats.ts
git commit -m "feat: add mobile query modules with types"
```

### Task 4: Wire Real Supabase Auth

**Files:**
- Modify: `src/screens/auth-screen.tsx`
- Modify: `src/components/auth-gate.tsx`
- Modify: `src/screens/auth-screen.test.tsx`

- [ ] **Step 1: Update AuthGate with real session check**

```typescript
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Session } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/supabase";
import AuthScreen from "@/screens/auth-screen";
import AppNavigator from "@/navigation/app-navigator";

const supabase = createSupabaseClient();

export default function AuthGate() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <ActivityIndicator />;
  }

  if (session) {
    return <AppNavigator />;
  }

  return <AuthScreen />;
}
```

- [ ] **Step 2: Update AuthScreen with Supabase API calls**

In `auth-screen.tsx`, add Supabase client import and wire the submit handler:

```typescript
import { useState } from "react";
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from "react-native";
import { createSupabaseClient } from "@/lib/supabase";

const supabase = createSupabaseClient();

// Inside the component, replace the submitEmpty validation with real calls:
const handleSubmit = async () => {
  if (!email.trim() || !password.trim()) {
    setErrors({ email: !email.trim() ? "Email is required" : "", password: !password.trim() ? "Password is required" : "" });
    return;
  }

  setSubmitting(true);
  try {
    const { error } = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      Alert.alert("Error", error.message);
    }
  } catch (err) {
    Alert.alert("Error", (err as Error).message);
  } finally {
    setSubmitting(false);
  }
};
```

Also add `submitting` state: `const [submitting, setSubmitting] = useState(false);` and disable the submit button while submitting.

- [ ] **Step 3: Update auth-screen.test.tsx to mock Supabase**

```typescript
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AuthScreen from "./auth-screen";

// Mock Supabase
jest.mock("@/lib/supabase", () => ({
  createSupabaseClient: () => ({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      signUp: jest.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

describe("AuthScreen", () => {
  it("calls signIn on login submit with valid inputs", async () => {
    const { getByPlaceholderText, getByText } = render(<AuthScreen />);
    fireEvent.changeText(getByPlaceholderText(/email/i), "test@example.com");
    fireEvent.changeText(getByPlaceholderText(/password/i), "password123");
    fireEvent.press(getByText(/sign in/i));

    await waitFor(() => {
      // No alert means successful call
    });
  });

  it("shows validation errors for empty fields", async () => {
    const { getByText, findByText } = render(<AuthScreen />);
    fireEvent.press(getByText(/sign in/i));
    expect(await findByText(/email is required/i)).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run tests**

```bash
npx jest --no-cache
```

Expected: All existing + new auth tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/screens/auth-screen.tsx src/components/auth-gate.tsx src/screens/auth-screen.test.tsx
git commit -m "feat: wire real supabase auth into auth gate and screen"
```

### Task 5: Build Navigation Structure

**Files:**
- Create: `src/navigation/app-navigator.tsx`
- Modify: `App.tsx`

- [ ] **Step 1: Create the navigator with 4 bottom tabs and stack navigators**

```typescript
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DashboardScreen from "@/features/dashboard/dashboard-screen";
import ClientListScreen from "@/features/clients/client-list-screen";
import ClientDetailScreen from "@/features/clients/client-detail-screen";
import ClientFormScreen from "@/features/clients/client-form-screen";
import PolicyListScreen from "@/features/policies/policy-list-screen";
import PolicyDetailScreen from "@/features/policies/policy-detail-screen";
import PolicyFormScreen from "@/features/policies/policy-form-screen";
import PaymentListScreen from "@/features/payments/payment-list-screen";
import PaymentFormScreen from "@/features/payments/payment-form-screen";

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const ClientsStack = createNativeStackNavigator();
const PoliciesStack = createNativeStackNavigator();
const PaymentsStack = createNativeStackNavigator();

function DashboardStackScreen() {
  return (
    <DashboardStack.Navigator>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} options={{ title: "Dashboard" }} />
    </DashboardStack.Navigator>
  );
}

function ClientsStackScreen() {
  return (
    <ClientsStack.Navigator>
      <ClientsStack.Screen name="ClientList" component={ClientListScreen} options={{ title: "Clients" }} />
      <ClientsStack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: "Client" }} />
      <ClientsStack.Screen name="ClientCreate" component={ClientFormScreen} options={{ title: "New Client" }} />
      <ClientsStack.Screen name="ClientEdit" component={ClientFormScreen} options={{ title: "Edit Client" }} />
    </ClientsStack.Navigator>
  );
}

function PoliciesStackScreen() {
  return (
    <PoliciesStack.Navigator>
      <PoliciesStack.Screen name="PolicyList" component={PolicyListScreen} options={{ title: "Policies" }} />
      <PoliciesStack.Screen name="PolicyDetail" component={PolicyDetailScreen} options={{ title: "Policy" }} />
      <PoliciesStack.Screen name="PolicyCreate" component={PolicyFormScreen} options={{ title: "New Policy" }} />
      <PoliciesStack.Screen name="PolicyEdit" component={PolicyFormScreen} options={{ title: "Edit Policy" }} />
    </PoliciesStack.Navigator>
  );
}

function PaymentsStackScreen() {
  return (
    <PaymentsStack.Navigator>
      <PaymentsStack.Screen name="PaymentList" component={PaymentListScreen} options={{ title: "Payments" }} />
      <PaymentsStack.Screen name="PaymentCreate" component={PaymentFormScreen} options={{ title: "New Payment" }} />
    </PaymentsStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            const icons: Record<string, string> = {
              Dashboard: "view-dashboard",
              Clients: "account-group",
              Policies: "file-document",
              Payments: "currency-usd",
            };
            return <MaterialCommunityIcons name={icons[route.name]} size={size} color={color} />;
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardStackScreen} />
        <Tab.Screen name="Clients" component={ClientsStackScreen} />
        <Tab.Screen name="Policies" component={PoliciesStackScreen} />
        <Tab.Screen name="Payments" component={PaymentsStackScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

- [ ] **Step 2: Update App.tsx to wrap with PaperProvider**

```typescript
import { PaperProvider } from "react-native-paper";
import AuthGate from "@/components/auth-gate";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <PaperProvider>
      <AuthGate />
      <StatusBar style="auto" />
    </PaperProvider>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/navigation/app-navigator.tsx App.tsx
git commit -m "feat: add bottom tab navigation with react-navigation"
```

### Task 6: Build Dashboard Screen

**Files:**
- Create: `src/features/dashboard/dashboard-screen.tsx`

- [ ] **Step 1: Create dashboard screen with stat cards**

```typescript
import { useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Card, Text, ActivityIndicator, useTheme } from "react-native-paper";
import { useDashboardStats } from "./use-dashboard-stats";

export default function DashboardScreen() {
  const { totalClients, totalPolicies, pendingPayments, paidThisMonth, loading, error, refetch } = useDashboardStats();
  const theme = useTheme();

  useEffect(() => {
    refetch();
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  const cards = [
    { label: "Total Clients", value: totalClients, icon: "account-group", color: theme.colors.primary },
    { label: "Active Policies", value: totalPolicies, icon: "file-document", color: theme.colors.secondary },
    { label: "Pending Payments", value: pendingPayments, icon: "clock-outline", color: "#FF9800" },
    { label: "Paid This Month", value: paidThisMonth, icon: "currency-usd", color: "#4CAF50" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Dashboard</Text>
      <View style={styles.grid}>
        {cards.map((card) => (
          <Card key={card.label} style={[styles.card, { borderLeftColor: card.color }]}>
            <Card.Content>
              <Text variant="titleLarge">{card.value}</Text>
              <Text variant="bodyMedium">{card.label}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { marginBottom: 16 },
  grid: { gap: 12 },
  card: { borderLeftWidth: 4 },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/features/dashboard/dashboard-screen.tsx
git commit -m "feat: add dashboard screen with stat cards"
```

### Task 7: Build Client Screens

**Files:**
- Create: `src/features/clients/client-list-screen.tsx`
- Create: `src/features/clients/client-detail-screen.tsx`
- Create: `src/features/clients/client-form-screen.tsx`

- [ ] **Step 1: Create client list screen**

```typescript
import { useState, useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Searchbar, List, FAB, Text, ActivityIndicator, Snackbar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { fetchClients } from "./client.queries";
import { Client } from "./client.types";

export default function ClientListScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [])
  );

  async function loadClients() {
    try {
      setLoading(true);
      const data = await fetchClients();
      setClients(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = search
    ? clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()))
    : clients;

  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <Searchbar placeholder="Search clients" value={search} onChangeText={setSearch} style={styles.search} />
      {filtered.length === 0 ? (
        <Text style={styles.empty}>No clients found</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={item.email || item.phone || ""}
              left={(props) => <List.Icon {...props} icon="account" />}
              onPress={() => navigation.navigate("ClientDetail", { id: item.id })}
            />
          )}
        />
      )}
      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate("ClientCreate")} />
      <Snackbar visible={!!error} onDismiss={() => setError(null)}>{error}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 16 },
  empty: { textAlign: "center", marginTop: 40 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
```

- [ ] **Step 2: Create client detail screen**

```typescript
import { useState, useCallback } from "react";
import { View, ScrollView, FlatList, StyleSheet } from "react-native";
import { Card, Text, Button, List, ActivityIndicator, Snackbar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchClient } from "./client.queries";
import { fetchPolicies } from "@/features/policies/policy.queries";
import { Client } from "./client.types";
import { PolicyWithDetails } from "@/features/policies/policy.types";

export default function ClientDetailScreen() {
  const [client, setClient] = useState<Client | null>(null);
  const [policies, setPolicies] = useState<PolicyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  async function loadData() {
    try {
      setLoading(true);
      const [clientData, allPolicies] = await Promise.all([fetchClient(id), fetchPolicies()]);
      setClient(clientData);
      setPolicies(allPolicies.filter((p) => p.client_id === id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !client) return <ActivityIndicator />;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={client.name} subtitle={client.email || client.phone || "No contact"} />
        <Card.Content>
          {client.phone ? <Text>Phone: {client.phone}</Text> : null}
          {client.notes ? <Text>Notes: {client.notes}</Text> : null}
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate("ClientEdit", { id: client.id })}>Edit</Button>
          <Button onPress={() => navigation.navigate("PolicyCreate", { clientId: client.id })}>Add Policy</Button>
        </Card.Actions>
      </Card>
      <Text variant="titleMedium" style={styles.sectionTitle}>Policies</Text>
      {policies.length === 0 ? (
        <Text style={styles.empty}>No policies for this client</Text>
      ) : (
        policies.map((p) => (
          <List.Item
            key={p.id}
            title={`${p.insurance_types?.name || "Insurance"} — $${p.premium}`}
            description={`Status: ${p.status}`}
            onPress={() => navigation.navigate("PolicyDetail", { id: p.id })}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 16 },
  sectionTitle: { marginBottom: 8 },
  empty: { textAlign: "center", marginTop: 20 },
});
```

- [ ] **Step 3: Create client form screen (shared for create/edit)**

```typescript
import { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { TextInput, Button, Text, Snackbar } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { createClient, updateClient, fetchClient } from "./client.queries";

export default function ClientFormScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const editId = (route.params as { id?: string })?.id;
  const isEdit = !!editId;

  useEffect(() => {
    if (editId) {
      fetchClient(editId).then((client) => {
        setName(client.name);
        setEmail(client.email || "");
        setPhone(client.phone || "");
        setNotes(client.notes || "");
      });
    }
  }, [editId]);

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateClient(editId, { name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined, notes: notes.trim() || undefined });
      } else {
        await createClient({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined, notes: notes.trim() || undefined });
      }
      navigation.goBack();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <TextInput label="Name *" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
      <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" style={styles.input} />
      <TextInput label="Phone" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" style={styles.input} />
      <TextInput label="Notes" value={notes} onChangeText={setNotes} mode="outlined" multiline numberOfLines={3} style={styles.input} />
      <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting}>
        {isEdit ? "Update" : "Create"}
      </Button>
      <Snackbar visible={!!error} onDismiss={() => setError(null)}>{error}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { marginBottom: 12 },
});
```

- [ ] **Step 4: Commit**

```bash
git add src/features/clients/client-list-screen.tsx src/features/clients/client-detail-screen.tsx src/features/clients/client-form-screen.tsx
git commit -m "feat: add client CRUD screens"
```

### Task 8: Build Policy Screens

**Files:**
- Create: `src/features/policies/policy-list-screen.tsx`
- Create: `src/features/policies/policy-detail-screen.tsx`
- Create: `src/features/policies/policy-form-screen.tsx`

- [ ] **Step 1: Create policy list screen**

```typescript
import { useState, useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Searchbar, Card, Text, Chip, FAB, ActivityIndicator, Snackbar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { fetchPolicies } from "./policy.queries";
import { PolicyWithDetails } from "./policy.types";
import { useTheme } from "react-native-paper";

const STATUSES = ["all", "active", "expired", "cancelled"];

export default function PolicyListScreen() {
  const [policies, setPolicies] = useState<PolicyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const navigation = useNavigation();
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadPolicies();
    }, [])
  );

  async function loadPolicies() {
    try {
      setLoading(true);
      const data = await fetchPolicies();
      setPolicies(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === "all" ? policies : policies.filter((p) => p.status === filter);

  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {STATUSES.map((s) => (
          <Chip key={s} selected={filter === s} onPress={() => setFilter(s)} style={styles.chip}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Chip>
        ))}
      </View>
      {filtered.length === 0 ? (
        <Text style={styles.empty}>No policies found</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card} onPress={() => navigation.navigate("PolicyDetail", { id: item.id })}>
              <Card.Content>
                <Text variant="titleMedium">{item.clients?.name || "Unknown Client"}</Text>
                <Text variant="bodyMedium">{item.insurance_types?.name || "Unknown Type"} — ${item.premium}</Text>
                <Text variant="bodySmall" style={{ color: item.status === "active" ? "#4CAF50" : item.status === "expired" ? "#FF9800" : "#F44336" }}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
      )}
      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate("PolicyCreate")} />
      <Snackbar visible={!!error} onDismiss={() => setError(null)}>{error}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { flexDirection: "row", padding: 8, gap: 8 },
  chip: { marginRight: 4 },
  card: { margin: 8 },
  empty: { textAlign: "center", marginTop: 40 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
```

- [ ] **Step 2: Create policy detail screen**

```typescript
import { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Card, Text, Button, List, ActivityIndicator, Snackbar, Divider } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { fetchPolicy } from "./policy.queries";
import { fetchPaymentsByPolicy, markPaymentAsPaid } from "@/features/payments/payment.queries";
import { PolicyWithDetails } from "./policy.types";
import { Payment } from "@/features/payments/payment.types";

export default function PolicyDetailScreen() {
  const [policy, setPolicy] = useState<PolicyWithDetails | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  async function loadData() {
    try {
      setLoading(true);
      const [policyData, paymentsData] = await Promise.all([fetchPolicy(id), fetchPaymentsByPolicy(id)]);
      setPolicy(policyData);
      setPayments(paymentsData);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkPaid(paymentId: string) {
    try {
      await markPaymentAsPaid(paymentId);
      loadData();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (loading || !policy) return <ActivityIndicator />;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={`Policy #${policy.policy_number || policy.id.slice(0, 8)}`} />
        <Card.Content>
          <Text>Client: {policy.clients?.name || "Unknown"}</Text>
          <Text>Insurance Type: {policy.insurance_types?.name || "Unknown"}</Text>
          <Text>Premium: ${policy.premium}</Text>
          <Text>Start: {policy.start_date}</Text>
          {policy.end_date ? <Text>End: {policy.end_date}</Text> : null}
          <Text>Status: {policy.status}</Text>
          {policy.notes ? <Text>Notes: {policy.notes}</Text> : null}
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => navigation.navigate("PolicyEdit", { id: policy.id })}>Edit</Button>
          <Button onPress={() => navigation.navigate("PaymentCreate", { policyId: policy.id })}>Add Payment</Button>
        </Card.Actions>
      </Card>
      <Divider />
      <Text variant="titleMedium" style={styles.sectionTitle}>Payments</Text>
      {payments.length === 0 ? (
        <Text style={styles.empty}>No payments yet</Text>
      ) : (
        payments.map((p) => (
          <List.Item
            key={p.id}
            title={`$${p.amount} — ${p.payment_date}`}
            description={p.status === "paid" ? "Paid" : "Pending"}
            right={(props) =>
              p.status === "pending" ? (
                <Button mode="text" onPress={() => handleMarkPaid(p.id)}>Mark Paid</Button>
              ) : null
            }
          />
        ))
      )}
      <Snackbar visible={!!error} onDismiss={() => setError(null)}>{error}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 16 },
  sectionTitle: { marginTop: 16, marginBottom: 8 },
  empty: { textAlign: "center", marginTop: 20 },
});
```

- [ ] **Step 3: Create policy form screen**

```typescript
import { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { TextInput, Button, Text, Snackbar, Menu, Divider } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { createPolicy, updatePolicy, fetchPolicy } from "./policy.queries";
import { fetchClients } from "@/features/clients/client.queries";
import { fetchInsuranceTypes } from "@/features/insurance-types/insurance-type.queries";
import { Client } from "@/features/clients/client.types";
import { InsuranceType } from "@/features/insurance-types/insurance-type.types";

export default function PolicyFormScreen() {
  const [clientId, setClientId] = useState("");
  const [insuranceTypeId, setInsuranceTypeId] = useState("");
  const [premium, setPremium] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [insuranceTypes, setInsuranceTypes] = useState<InsuranceType[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const editId = (route.params as { id?: string })?.id;
  const prefillClientId = (route.params as { clientId?: string })?.clientId;
  const isEdit = !!editId;

  useEffect(() => {
    loadFormData();
  }, []);

  async function loadFormData() {
    const [clientsData, typesData] = await Promise.all([fetchClients(), fetchInsuranceTypes()]);
    setClients(clientsData);
    setInsuranceTypes(typesData);
    if (prefillClientId) setClientId(prefillClientId);
    if (editId) {
      const policy = await fetchPolicy(editId);
      setClientId(policy.client_id);
      setInsuranceTypeId(policy.insurance_type_id);
      setPremium(String(policy.premium));
      setStartDate(policy.start_date);
      setEndDate(policy.end_date || "");
      setStatus(policy.status);
      setNotes(policy.notes || "");
    }
  }

  async function handleSubmit() {
    if (!clientId || !insuranceTypeId || !premium || !startDate) {
      setError("Client, Insurance Type, Premium, and Start Date are required");
      return;
    }

    setSubmitting(true);
    try {
      const input = {
        client_id: clientId,
        insurance_type_id: insuranceTypeId,
        premium: parseFloat(premium),
        start_date: startDate,
        end_date: endDate || undefined,
        notes: notes.trim() || undefined,
      };
      if (isEdit) {
        await updatePolicy(editId, input);
      } else {
        await createPolicy(input);
      }
      navigation.goBack();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>Client</Text>
      <Menu anchor={<Button mode="outlined">{clients.find((c) => c.id === clientId)?.name || "Select Client"}</Button>}>
        {clients.map((c) => (
          <Menu.Item key={c.id} title={c.name} onPress={() => setClientId(c.id)} />
        ))}
      </Menu>
      <Text variant="titleMedium" style={styles.label}>Insurance Type</Text>
      <Menu anchor={<Button mode="outlined">{insuranceTypes.find((t) => t.id === insuranceTypeId)?.name || "Select Type"}</Button>}>
        {insuranceTypes.map((t) => (
          <Menu.Item key={t.id} title={t.name} onPress={() => setInsuranceTypeId(t.id)} />
        ))}
      </Menu>
      <TextInput label="Premium *" value={premium} onChangeText={setPremium} mode="outlined" keyboardType="decimal-pad" style={styles.input} />
      <TextInput label="Start Date (YYYY-MM-DD) *" value={startDate} onChangeText={setStartDate} mode="outlined" style={styles.input} placeholder="2024-01-15" />
      <TextInput label="End Date (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} mode="outlined" style={styles.input} placeholder="2025-01-15" />
      <TextInput label="Notes" value={notes} onChangeText={setNotes} mode="outlined" multiline style={styles.input} />
      <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting}>
        {isEdit ? "Update" : "Create"}
      </Button>
      <Snackbar visible={!!error} onDismiss={() => setError(null)}>{error}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { marginTop: 12, marginBottom: 4 },
  input: { marginBottom: 12 },
});
```

- [ ] **Step 4: Commit**

```bash
git add src/features/policies/policy-list-screen.tsx src/features/policies/policy-detail-screen.tsx src/features/policies/policy-form-screen.tsx
git commit -m "feat: add policy CRUD screens"
```

### Task 9: Build Payment Screens

**Files:**
- Create: `src/features/payments/payment-list-screen.tsx`
- Create: `src/features/payments/payment-form-screen.tsx`

- [ ] **Step 1: Create payment list screen**

```typescript
import { useState, useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Card, Text, Chip, Divider, FAB, Button, ActivityIndicator, Snackbar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { fetchPayments, markPaymentAsPaid } from "./payment.queries";
import { Payment } from "./payment.types";

const FILTERS = ["all", "pending", "paid"];

export default function PaymentListScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [])
  );

  async function loadPayments() {
    try {
      setLoading(true);
      const data = await fetchPayments();
      setPayments(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkPaid(id: string) {
    try {
      await markPaymentAsPaid(id);
      loadPayments();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const filtered = filter === "all" ? payments : payments.filter((p) => p.status === filter);

  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Chip key={f} selected={filter === f} onPress={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </View>
      {filtered.length === 0 ? (
        <Text style={styles.empty}>No payments found</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">${item.amount}</Text>
                <Text variant="bodyMedium">{item.payment_date}</Text>
                <Chip icon={item.status === "paid" ? "check-circle" : "clock-outline"} style={item.status === "paid" ? styles.paid : styles.pending}>
                  {item.status}
                </Chip>
              </Card.Content>
              {item.status === "pending" ? (
                <Card.Actions>
                  <Button onPress={() => handleMarkPaid(item.id)}>Mark Paid</Button>
                </Card.Actions>
              ) : null}
            </Card>
          )}
        />
      )}
      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate("PaymentCreate")} />
      <Snackbar visible={!!error} onDismiss={() => setError(null)}>{error}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { flexDirection: "row", padding: 8, gap: 8 },
  card: { margin: 8 },
  paid: { backgroundColor: "#E8F5E9" },
  pending: { backgroundColor: "#FFF3E0" },
  empty: { textAlign: "center", marginTop: 40 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
```

- [ ] **Step 2: Create payment form screen**

```typescript
import { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { TextInput, Button, Text, Switch, Snackbar, Menu } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { createPayment } from "./payment.queries";
import { fetchPolicies } from "@/features/policies/policy.queries";
import { PolicyWithDetails } from "@/features/policies/policy.types";

export default function PaymentFormScreen() {
  const [policyId, setPolicyId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [markPaid, setMarkPaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [policies, setPolicies] = useState<PolicyWithDetails[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const prefillPolicyId = (route.params as { policyId?: string })?.policyId;

  useEffect(() => {
    fetchPolicies().then(setPolicies);
    if (prefillPolicyId) setPolicyId(prefillPolicyId);
  }, []);

  async function handleSubmit() {
    if (!policyId || !amount) {
      setError("Policy and Amount are required");
      return;
    }

    setSubmitting(true);
    try {
      await createPayment({
        policy_id: policyId,
        amount: parseFloat(amount),
        payment_date: paymentDate,
        status: markPaid ? "paid" : "pending",
        notes: notes.trim() || undefined,
      });
      navigation.goBack();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>Policy</Text>
      <Menu anchor={<Button mode="outlined">{policies.find((p) => p.id === policyId)?.clients?.name || "Select Policy"}</Button>}>
        {policies.map((p) => (
          <Menu.Item key={p.id} title={`${p.clients?.name || "Unknown"} — $${p.premium}`} onPress={() => setPolicyId(p.id)} />
        ))}
      </Menu>
      <TextInput label="Amount *" value={amount} onChangeText={setAmount} mode="outlined" keyboardType="decimal-pad" style={styles.input} />
      <TextInput label="Date (YYYY-MM-DD)" value={paymentDate} onChangeText={setPaymentDate} mode="outlined" style={styles.input} placeholder="2024-01-15" />
      <View style={styles.switchRow}>
        <Text>Mark as paid</Text>
        <Switch value={markPaid} onValueChange={setMarkPaid} />
      </View>
      <TextInput label="Notes" value={notes} onChangeText={setNotes} mode="outlined" multiline style={styles.input} />
      <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting}>
        Create Payment
      </Button>
      <Snackbar visible={!!error} onDismiss={() => setError(null)}>{error}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { marginTop: 12, marginBottom: 4 },
  input: { marginBottom: 12 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
});
```

- [ ] **Step 3: Commit**

```bash
git add src/features/payments/payment-list-screen.tsx src/features/payments/payment-form-screen.tsx
git commit -m "feat: add payment CRUD screens"
```

### Task 10: Write Tests

**Files:**
- Create: `src/features/clients/client.test.tsx`
- Create: `src/features/policies/policy.test.tsx`
- Create: `src/features/payments/payment.test.tsx`

- [ ] **Step 1: Create client feature tests**

```typescript
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ClientListScreen from "./client-list-screen";
import ClientFormScreen from "./client-form-screen";

jest.mock("@/lib/supabase", () => ({
  createSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          then: (resolve: any) => resolve({ data: [], error: null }),
        }),
        eq: () => ({
          single: () => ({ then: (resolve: any) => resolve({ data: null, error: null }) }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => ({ then: (resolve: any) => resolve({ data: { id: "1", name: "Test" }, error: null }) }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({ then: (resolve: any) => resolve({ data: null, error: null }) }),
          }),
        }),
      }),
    }),
  }),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: (cb: any) => cb(),
}));

describe("ClientListScreen", () => {
  it("renders empty state when no clients", async () => {
    const { findByText } = render(<ClientListScreen />);
    expect(await findByText(/no clients/i)).toBeTruthy();
  });
});

describe("ClientFormScreen", () => {
  it("shows validation error when name is empty", async () => {
    const { getByText, findByText } = render(<ClientFormScreen />);
    fireEvent.press(getByText(/create/i));
    expect(await findByText(/name is required/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Create policy feature tests**

```typescript
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import PolicyListScreen from "./policy-list-screen";
import PolicyFormScreen from "./policy-form-screen";

jest.mock("@/lib/supabase", () => ({
  createSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          then: (resolve: any) => resolve({ data: [], error: null }),
        }),
        eq: () => ({
          single: () => ({ then: (resolve: any) => resolve({ data: null, error: null }) }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => ({ then: (resolve: any) => resolve({ data: { id: "1" }, error: null }) }),
        }),
      }),
    }),
  }),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: (cb: any) => cb(),
}));

jest.mock("@/features/clients/client.queries", () => ({
  fetchClients: () => Promise.resolve([{ id: "1", name: "Test Client" }]),
}));

jest.mock("@/features/insurance-types/insurance-type.queries", () => ({
  fetchInsuranceTypes: () => Promise.resolve([{ id: "1", name: "Health" }]),
}));

describe("PolicyListScreen", () => {
  it("renders empty state when no policies", async () => {
    const { findByText } = render(<PolicyListScreen />);
    expect(await findByText(/no policies/i)).toBeTruthy();
  });
});

describe("PolicyFormScreen", () => {
  it("shows validation error when required fields missing", async () => {
    const { getByText, findByText } = render(<PolicyFormScreen />);
    fireEvent.press(getByText(/create/i));
    expect(await findByText(/required/i)).toBeTruthy();
  });
});
```

- [ ] **Step 3: Create payment feature tests**

```typescript
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import PaymentListScreen from "./payment-list-screen";
import PaymentFormScreen from "./payment-form-screen";

jest.mock("@/lib/supabase", () => ({
  createSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          then: (resolve: any) => resolve({ data: [], error: null }),
        }),
        eq: () => ({
          then: (resolve: any) => resolve({ data: [], error: null }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => ({ then: (resolve: any) => resolve({ data: { id: "1" }, error: null }) }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => ({ then: (resolve: any) => resolve({ data: null, error: null }) }),
          }),
        }),
      }),
    }),
  }),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: (cb: any) => cb(),
}));

jest.mock("@/features/policies/policy.queries", () => ({
  fetchPolicies: () => Promise.resolve([{ id: "1", clients: { name: "Test" }, premium: 100 }]),
}));

describe("PaymentListScreen", () => {
  it("renders empty state when no payments", async () => {
    const { findByText } = render(<PaymentListScreen />);
    expect(await findByText(/no payments/i)).toBeTruthy();
  });
});

describe("PaymentFormScreen", () => {
  it("shows validation error when amount is empty", async () => {
    const { getByText, findByText } = render(<PaymentFormScreen />);
    fireEvent.press(getByText(/create payment/i));
    expect(await findByText(/required/i)).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run all tests**

```bash
npx jest --no-cache
```

Expected: All tests passing (existing 8 + new ~6 = ~14 total).

- [ ] **Step 5: Commit**

```bash
git add src/features/clients/client.test.tsx src/features/policies/policy.test.tsx src/features/payments/payment.test.tsx
git commit -m "test: add CRUD feature tests for mobile screens"
```

### Task 11: Final Verification

- [ ] **Step 1: Run full test suite**

```bash
npx jest --no-cache
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Run linter**

```bash
npx eslint .
```

- [ ] **Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "chore: final fixes after full verification"
```

- [ ] **Step 5: Push**

```bash
git push origin main
```
