import { useEffect, useState, useRef } from "react";
import { View, ScrollView, StyleSheet, Animated, RefreshControl } from "react-native";
import { Card, Text, Button, ActivityIndicator, Snackbar, useTheme, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createSupabaseClient } from "@/lib/supabase";
import { API_BASE_URL } from "@/lib/config";
import { useDashboardStats } from "./use-dashboard-stats";

const supabase = createSupabaseClient();

export default function DashboardScreen() {
  const { totalClients, totalPolicies, pendingPayments, paidThisMonth, loading, refetch } = useDashboardStats();
  const theme = useTheme();
  const [reminderResult, setReminderResult] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    refetch();
    Animated.stagger(100, fadeAnims.map((anim) =>
      Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true })
    )).start();
  }, []);

  async function handleSendReminders() {
    setSending(true);
    setReminderResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/reminders/send`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      setReminderResult(`Sent to ${data.sent}, ${data.failed} failed`);
    } catch {
      setReminderResult("Failed to send reminders");
    } finally {
      setSending(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  if (loading) {
    return <ActivityIndicator />;
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const cards = [
    { label: "Total Clients", value: totalClients, icon: "account-group" as const, color: theme.colors.primary },
    { label: "Active Policies", value: totalPolicies, icon: "file-document" as const, color: theme.colors.secondary },
    { label: "Pending Payments", value: pendingPayments, icon: "clock-outline" as const, color: theme.colors.tertiaryContainer },
    { label: "Paid This Month", value: paidThisMonth, icon: "currency-usd" as const, color: theme.colors.tertiary },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
    >
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>Dashboard</Text>
      <View style={styles.grid}>
        {cards.map((card, i) => (
          <Animated.View key={card.label} style={{ opacity: fadeAnims[i], transform: [{ translateY: fadeAnims[i].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderLeftColor: card.color }]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name={card.icon} size={20} color={card.color} />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{card.label}</Text>
                </View>
                <Text variant="headlineLarge" style={{ color: card.color, fontWeight: "700" }}>{card.value}</Text>
                <View style={styles.trend}>
                  <MaterialCommunityIcons name="trending-up" size={14} color={theme.colors.tertiary} />
                  <Text variant="labelSmall" style={{ color: theme.colors.tertiary }}>Since last month</Text>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        ))}
      </View>

      <View style={styles.quickActions}>
        <Chip icon="account-plus" mode="outlined" onPress={() => {}} style={styles.chip}>Add Client</Chip>
        <Chip icon="currency-usd" mode="outlined" onPress={() => {}} style={styles.chip}>Record Payment</Chip>
        <Chip icon="file-document" mode="outlined" onPress={() => {}} style={styles.chip}>View Policies</Chip>
      </View>

      <Button
        mode="contained"
        onPress={handleSendReminders}
        loading={sending}
        disabled={sending}
        style={styles.reminderBtn}
        buttonColor={theme.colors.tertiary}
        textColor={theme.colors.onTertiary}
      >
        Send Reminders
      </Button>
      <Button mode="outlined" onPress={handleSignOut} style={styles.signOut} textColor={theme.colors.error}>
        Sign Out
      </Button>
      <Snackbar
        visible={!!reminderResult}
        onDismiss={() => setReminderResult(null)}
        style={{ backgroundColor: theme.colors.surface }}
      >
        {reminderResult}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { marginBottom: 16, fontWeight: "800" },
  grid: { gap: 12 },
  card: { borderLeftWidth: 4 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  trend: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  quickActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  chip: { marginBottom: 4 },
  signOut: { marginTop: 16, borderColor: "#F44336" },
  reminderBtn: { marginTop: 16, borderRadius: 8 },
});
