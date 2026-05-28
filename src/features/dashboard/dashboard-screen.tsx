import { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Card, Text, Button, ActivityIndicator, Snackbar, useTheme } from "react-native-paper";
import { createSupabaseClient } from "@/lib/supabase";
import { useDashboardStats } from "./use-dashboard-stats";

const supabase = createSupabaseClient();

export default function DashboardScreen() {
  const { totalClients, totalPolicies, pendingPayments, paidThisMonth, loading, refetch } = useDashboardStats();
  const theme = useTheme();
  const [reminderResult, setReminderResult] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSendReminders() {
    setSending(true);
    setReminderResult(null);
    try {
      const res = await fetch("http://localhost:3000/api/reminders/send", {
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

  useEffect(() => {
    refetch();
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const cards = [
    { label: "Total Clients", value: totalClients, icon: "account-group", color: theme.colors.primary },
    { label: "Active Policies", value: totalPolicies, icon: "file-document", color: theme.colors.secondary },
    { label: "Pending Payments", value: pendingPayments, icon: "clock-outline", color: theme.colors.tertiaryContainer },
    { label: "Paid This Month", value: paidThisMonth, icon: "currency-usd", color: theme.colors.tertiary },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>Dashboard</Text>
      <View style={styles.grid}>
        {cards.map((card) => (
          <Card key={card.label} style={[styles.card, { backgroundColor: theme.colors.surface, borderLeftColor: card.color }]}>
            <Card.Content>
              <Text variant="headlineLarge" style={{ color: card.color, fontWeight: "700" }}>{card.value}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{card.label}</Text>
            </Card.Content>
          </Card>
        ))}
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
  signOut: { marginTop: 16, borderColor: "#F44336" },
  reminderBtn: { marginTop: 16, borderRadius: 8 },
});
