import { useState, useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Searchbar, List, FAB, Text, ActivityIndicator, Snackbar } from "react-native-paper";
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
  const navigation = useNavigation<Nav>();

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [])
  );

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

  const filtered = search
    ? clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()))
    : clients;

  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <Searchbar placeholder="Search clients" value={search} onChangeText={setSearch} style={styles.search} />
      {filtered.length === 0 ? (
        <Text style={styles.empty}>No clients found</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={item.email || item.phone || ""}
              left={(props) => <List.Icon {...props} icon="account" />}
              onPress={() => navigation.navigate("ClientDetail", { id: item.id })}
            />
          )}
        />
      )}
      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate("ClientCreate")} />
      <Snackbar visible={!!error} onDismiss={() => setError(null)}>{error}</Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 16 },
  empty: { textAlign: "center", marginTop: 40 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
