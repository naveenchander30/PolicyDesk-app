import { useState, useCallback, useRef, useEffect } from "react";
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { Searchbar, List, FAB, Text, Button, ActivityIndicator, Snackbar, useTheme } from "react-native-paper";
import { Swipeable } from "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { fetchClients } from "./client.queries";
import { Client } from "./client.types";

type Nav = NavigationProp<Record<string, object | undefined>>;

export default function ClientListScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const navigation = useNavigation<Nav>();
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [])
  );

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  async function loadClients() {
    try {
      setLoading(true);
      const data = await fetchClients();
      setClients(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  }

  const filtered = debouncedSearch
    ? clients.filter((c) => c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || c.email?.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : clients;

  if (loading) return <ActivityIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar placeholder="Search clients" value={search} onChangeText={setSearch} style={[styles.search, { backgroundColor: theme.colors.surface }]} />
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="account-search" size={64} color={theme.colors.outline} />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            {debouncedSearch ? "No clients match your search" : "No clients yet"}
          </Text>
          {!debouncedSearch && (
            <Button mode="contained" onPress={() => navigation.navigate("ClientCreate")} style={styles.emptyBtn}>
              Add Client
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
          renderItem={({ item }) => {
            const renderRightActions = () => (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ClientEdit", { id: item.id })}
                  style={[styles.swipeAction, { backgroundColor: theme.colors.primary }]}
                >
                  <Text style={{ color: theme.colors.onPrimary, fontWeight: "600" }}>Edit</Text>
                </TouchableOpacity>
              </View>
            );
            return (
              <Swipeable renderRightActions={renderRightActions}>
                <List.Item
                  title={item.name}
                  titleStyle={{ color: theme.colors.onSurface }}
                  description={item.email || item.phone || ""}
                  descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                  left={(props) => <List.Icon {...props} icon="account" color={theme.colors.primary} />}
                  onPress={() => navigation.navigate("ClientDetail", { id: item.id })}
                  style={{ borderBottomColor: theme.colors.outlineVariant, borderBottomWidth: 0.5 }}
                />
              </Swipeable>
            );
          }}
        />
      )}
      <FAB icon="plus" style={[styles.fab, { backgroundColor: theme.colors.primary }]} color={theme.colors.onPrimary} onPress={() => navigation.navigate("ClientCreate")} />
      <Snackbar visible={!!error} onDismiss={() => setError(null)} style={{ backgroundColor: theme.colors.surface }}>{error}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 16 },
  empty: { alignItems: "center", padding: 48 },
  emptyText: { textAlign: "center", marginTop: 16 },
  emptyBtn: { marginTop: 16 },
  fab: { position: "absolute", right: 16, bottom: 16 },
  swipeAction: { justifyContent: "center", paddingHorizontal: 20 },
});
