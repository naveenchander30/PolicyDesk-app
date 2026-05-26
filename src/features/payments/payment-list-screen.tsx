import { useState, useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Card, Text, Chip, Button, FAB, ActivityIndicator, Snackbar } from "react-native-paper";
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
  const navigation = useNavigation<any>();

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
                <Chip
                  icon={item.status === "paid" ? "check-circle" : "clock-outline"}
                  style={item.status === "paid" ? styles.paid : styles.pending}
                >
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
