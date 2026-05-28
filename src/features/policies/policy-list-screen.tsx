import { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Card, Text, Chip, Button, FAB, ActivityIndicator, Snackbar, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { fetchPolicies } from "./policy.queries";
import { PolicyWithDetails } from "./policy.types";

type Nav = NavigationProp<Record<string, object | undefined>>;

const STATUSES = ["all", "active", "expired", "cancelled"];

export default function PolicyListScreen() {
  const [policies, setPolicies] = useState<PolicyWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<Nav>();
  const theme = useTheme();

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

  async function onRefresh() {
    setRefreshing(true);
    await loadPolicies();
    setRefreshing(false);
  }

  const filtered = filter === "all" ? policies : policies.filter((p) => p.status === filter);

  if (loading) return <ActivityIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filters}>
        {STATUSES.map((s) => (
          <Chip key={s} selected={filter === s} onPress={() => setFilter(s)} style={styles.chip}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Chip>
        ))}
      </View>
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="file-document-outline" size={64} color={theme.colors.outline} />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            {filter !== "all" ? "No policies match this filter" : "No policies yet"}
          </Text>
          {filter === "all" && (
            <Button mode="contained" onPress={() => navigation.navigate("PolicyCreate")} style={styles.emptyBtn}>
              Add Policy
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
          renderItem={({ item }) => (
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} onPress={() => navigation.navigate("PolicyDetail", { id: item.id })}>
              <Card.Content>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{item.clients?.name || "Unknown Client"}</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{item.insurance_types?.name || "Unknown Type"} — ${item.premium}</Text>
                <Text variant="bodySmall" style={{
                  color: item.status === "active" ? "#81c784" : item.status === "expired" ? "#ffb74d" : "#e57373",
                }}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
      )}
      <FAB icon="plus" style={[styles.fab, { backgroundColor: theme.colors.primary }]} color={theme.colors.onPrimary} onPress={() => navigation.navigate("PolicyCreate")} />
      <Snackbar visible={!!error} onDismiss={() => setError(null)} style={{ backgroundColor: theme.colors.surface }}>{error}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { flexDirection: "row", padding: 8, gap: 8 },
  chip: { marginRight: 4 },
  card: { margin: 8 },
  empty: { alignItems: "center", padding: 48 },
  emptyText: { textAlign: "center", marginTop: 16 },
  emptyBtn: { marginTop: 16 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
