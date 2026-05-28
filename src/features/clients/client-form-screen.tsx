import { useState, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { TextInput, Button, Snackbar, useTheme } from "react-native-paper";
import { useNavigation, useRoute, NavigationProp, RouteProp } from "@react-navigation/native";
import { createClient, updateClient, fetchClient } from "./client.queries";

type Nav = NavigationProp<Record<string, { id?: string }>>;
type FormRoute = RouteProp<Record<string, { id?: string }>>;

export default function ClientFormScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<Nav>();
  const route = useRoute<FormRoute>();
  const theme = useTheme();
  const editId = route.params?.id;
  const isEdit = !!editId;

  useEffect(() => {
    if (editId) {
      fetchClient(editId).then((client) => {
        setName(client.name);
        setEmail(client.email || "");
        setPhone(client.phone || "");
        setNotes(client.notes || "");
      });
    }
  }, [editId]);

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateClient(editId, { name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined, notes: notes.trim() || undefined });
      } else {
        await createClient({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined, notes: notes.trim() || undefined });
      }
      navigation.goBack();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TextInput label="Name *" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
      <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" style={styles.input} />
      <TextInput label="Phone" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" style={styles.input} />
      <TextInput label="Notes" value={notes} onChangeText={setNotes} mode="outlined" multiline numberOfLines={3} style={styles.input} />
      <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting}>
        {isEdit ? "Update" : "Create"}
      </Button>
      <Snackbar visible={!!error} onDismiss={() => setError(null)} style={{ backgroundColor: theme.colors.surface }}>{error}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { marginBottom: 12 },
});
