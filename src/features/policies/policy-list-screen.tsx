import { useState, useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Card, Text, Chip, FAB, ActivityIndicator, Snackbar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { fetchPolicies } from "./policy.queries";
import { PolicyWithDetails } from "./policy.types";

const STATUSES = ["all", "active", "expired", "cancelled"];

export default function PolicyListScreen() {
  const [policies, setPolicies] = useState<PolicyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const navigation = useNavigation<any>();

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
