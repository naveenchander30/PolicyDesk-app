import { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Card, Text, Button, List, ActivityIndicator } from "react-native-paper";
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
  sectionTitle: { marginBottom: 8, fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 20 },
});
