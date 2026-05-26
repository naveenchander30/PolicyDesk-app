import { useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Card, Text, ActivityIndicator, useTheme } from "react-native-paper";
import { useDashboardStats } from "./use-dashboard-stats";

export default function DashboardScreen() {
  const { totalClients, totalPolicies, pendingPayments, paidThisMonth, loading, refetch } = useDashboardStats();
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
  title: { marginBottom: 16, fontWeight: "800" },
  grid: { gap: 12 },
  card: { borderLeftWidth: 4 },
});
