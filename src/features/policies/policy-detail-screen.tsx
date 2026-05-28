import { useState, useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Card, Text, Button, List, ActivityIndicator, Snackbar, useTheme, Divider } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation, useRoute, NavigationProp, RouteProp } from "@react-navigation/native";
import { fetchPolicy } from "./policy.queries";
import { fetchPaymentsByPolicy, markPaymentAsPaid } from "@/features/payments/payment.queries";
import { PolicyWithDetails } from "./policy.types";
import { Payment } from "@/features/payments/payment.types";

type Nav = NavigationProp<Record<string, object | undefined>>;
type DetRoute = RouteProp<Record<string, { id: string }>>;

export default function PolicyDetailScreen() {
  const [policy, setPolicy] = useState<PolicyWithDetails | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetRoute>();
  const { id } = route.params;
  const theme = useTheme();

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
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Title title={`Policy #${policy.policy_number || policy.id.slice(0, 8)}`} titleStyle={{ color: theme.colors.onSurface }} />
        <Card.Content>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Client: {policy.clients?.name || "Unknown"}</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Insurance Type: {policy.insurance_types?.name || "Unknown"}</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Premium: ${policy.premium}</Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Start: {policy.start_date}</Text>
          {policy.end_date ? <Text style={{ color: theme.colors.onSurfaceVariant }}>End: {policy.end_date}</Text> : null}
          <Text style={{
            color: policy.status === "active" ? theme.colors.primary : policy.status === "expired" ? "#ffb74d" : "#e57373",
            fontWeight: "700",
          }}>
            Status: {policy.status}
          </Text>
          {policy.notes ? <Text style={{ color: theme.colors.onSurfaceVariant }}>Notes: {policy.notes}</Text> : null}
        </Card.Content>
        <Card.Actions>
          <Button textColor={theme.colors.primary} onPress={() => navigation.navigate("PolicyEdit", { id: policy.id })}>Edit</Button>
          <Button textColor={theme.colors.primary} onPress={() => navigation.navigate("PaymentCreate", { policyId: policy.id })}>Add Payment</Button>
        </Card.Actions>
      </Card>
      <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Payments</Text>
      {payments.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>No payments yet</Text>
      ) : (
        payments.map((p) => (
          <List.Item
            key={p.id}
            title={`$${p.amount} — ${p.payment_date}`}
            titleStyle={{ color: theme.colors.onSurface }}
            description={p.status === "paid" ? "Paid" : "Pending"}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            right={() =>
              p.status === "pending" ? (
                <Button textColor={theme.colors.primary} onPress={() => handleMarkPaid(p.id)}>Mark Paid</Button>
              ) : null
            }
            style={{ borderBottomColor: theme.colors.outlineVariant, borderBottomWidth: 0.5 }}
          />
        ))
      )}
      <Snackbar visible={!!error} onDismiss={() => setError(null)} style={{ backgroundColor: theme.colors.surface }}>{error}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 16 },
  sectionTitle: { marginTop: 16, marginBottom: 8, fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 20 },
});
