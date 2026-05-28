import { useState, useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Card, Text, Button, List, ActivityIndicator, Snackbar, useTheme } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation, useRoute, NavigationProp, RouteProp } from "@react-navigation/native";
import { fetchClient, fetchClientPaymentSummary } from "./client.queries";
import { fetchPolicies } from "@/features/policies/policy.queries";
import { Client } from "./client.types";
import { PolicyWithDetails } from "@/features/policies/policy.types";
import { ClientPaymentSummary } from "./client-payment.types";

type Nav = NavigationProp<Record<string, object | undefined>>;
type ClientRoute = RouteProp<Record<string, { id: string }>>;

export default function ClientDetailScreen() {
  const [client, setClient] = useState<Client | null>(null);
  const [policies, setPolicies] = useState<PolicyWithDetails[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<ClientPaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<Nav>();
  const route = useRoute<ClientRoute>();
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
      const [clientData, allPolicies, ps] = await Promise.all([fetchClient(id), fetchPolicies(), fetchClientPaymentSummary(id)]);
      setClient(clientData);
      setPolicies(allPolicies.filter((p) => p.client_id === id));
      setPaymentSummary(ps);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !client) return <ActivityIndicator />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Title
          title={client.name}
          titleStyle={{ color: theme.colors.onSurface }}
          subtitle={client.email || client.phone || "No contact"}
          subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
        />
        <Card.Content>
          {client.phone ? <Text style={{ color: theme.colors.onSurfaceVariant }}>Phone: {client.phone}</Text> : null}
          {client.notes ? <Text style={{ color: theme.colors.onSurfaceVariant }}>Notes: {client.notes}</Text> : null}
        </Card.Content>
        <Card.Actions>
          <Button textColor={theme.colors.primary} onPress={() => navigation.navigate("ClientEdit", { id: client.id })}>Edit</Button>
          <Button textColor={theme.colors.primary} onPress={() => navigation.navigate("PolicyCreate", { clientId: client.id })}>Add Policy</Button>
        </Card.Actions>
      </Card>
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Policies</Text>
      {policies.length === 0 ? (
        <Text style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>No policies for this client</Text>
      ) : (
        policies.map((p) => (
          <List.Item
            key={p.id}
            title={`${p.insurance_types?.name || "Insurance"} — $${p.premium}`}
            titleStyle={{ color: theme.colors.onSurface }}
            description={`Status: ${p.status}`}
            descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
            onPress={() => navigation.navigate("PolicyDetail", { id: p.id })}
            style={{ borderBottomColor: theme.colors.outlineVariant, borderBottomWidth: 0.5 }}
          />
        ))
      )}
      {paymentSummary && paymentSummary.policies.length > 0 && (
        <>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Payment Summary</Text>
          {paymentSummary.policies.map((p, i) => (
            <List.Item
              key={p.policyNumber ?? i}
              title={`${p.insuranceTypeName} — $${p.remaining.toFixed(2)} remaining`}
              titleStyle={{ color: theme.colors.onSurface }}
              description={`Policy: ${p.policyNumber || "N/A"} | Paid: $${p.totalPaid.toFixed(2)} of $${p.totalDue.toFixed(2)}`}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              style={{ borderBottomColor: theme.colors.outlineVariant, borderBottomWidth: 0.5 }}
            />
          ))}
          <Text style={[styles.totalRemaining, { color: theme.colors.primary }]}>
            Total Remaining: ${paymentSummary.totalRemaining.toFixed(2)}
          </Text>
        </>
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
  totalRemaining: { textAlign: "center", marginTop: 16, fontWeight: "700", fontSize: 16 },
});
