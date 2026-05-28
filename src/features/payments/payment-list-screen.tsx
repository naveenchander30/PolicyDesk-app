import { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Card, Text, Chip, Button, FAB, ActivityIndicator, Snackbar, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { fetchPayments, markPaymentAsPaid } from "./payment.queries";
import { Payment } from "./payment.types";

type Nav = NavigationProp<Record<string, object | undefined>>;

const FILTERS = ["all", "pending", "paid"];

export default function PaymentListScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<Nav>();
  const theme = useTheme();

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

  async function onRefresh() {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Chip key={f} selected={filter === f} onPress={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </View>
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="credit-card-outline" size={64} color={theme.colors.outline} />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            {filter !== "all" ? "No payments match this filter" : "No payments yet"}
          </Text>
          {filter === "all" && (
            <Button mode="contained" onPress={() => navigation.navigate("PaymentCreate")} style={styles.emptyBtn}>
              Record Payment
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
          renderItem={({ item }) => (
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>${item.amount}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{item.payment_date}</Text>
                <Chip
                  icon={item.status === "paid" ? "check-circle" : "clock-outline"}
                  style={{ backgroundColor: item.status === "paid" ? "#1b5e20" : "#e65100" }}
                >
                  {item.status}
                </Chip>
              </Card.Content>
              {item.status === "pending" ? (
                <Card.Actions>
                  <Button textColor={theme.colors.primary} onPress={() => handleMarkPaid(item.id)}>Mark Paid</Button>
                </Card.Actions>
              ) : null}
            </Card>
          )}
        />
      )}
      <FAB icon="plus" style={[styles.fab, { backgroundColor: theme.colors.primary }]} color={theme.colors.onPrimary} onPress={() => navigation.navigate("PaymentCreate")} />
      <Snackbar visible={!!error} onDismiss={() => setError(null)} style={{ backgroundColor: theme.colors.surface }}>{error}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { flexDirection: "row", padding: 8, gap: 8 },
  card: { margin: 8 },
  empty: { alignItems: "center", padding: 48 },
  emptyText: { textAlign: "center", marginTop: 16 },
  emptyBtn: { marginTop: 16 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
