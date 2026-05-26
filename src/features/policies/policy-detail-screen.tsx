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
  const navigation = useNavigation<any>();
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
  sectionTitle: { marginTop: 16, marginBottom: 8, fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 20 },
});
