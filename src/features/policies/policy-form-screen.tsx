import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { TextInput, Button, Text, Snackbar, Menu, useTheme } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute, NavigationProp, RouteProp } from "@react-navigation/native";
import { createPolicy, updatePolicy, fetchPolicy } from "./policy.queries";
import { fetchClients } from "@/features/clients/client.queries";
import { fetchInsuranceTypes } from "@/features/insurance-types/insurance-type.queries";
import { Client } from "@/features/clients/client.types";
import { InsuranceType } from "@/features/insurance-types/insurance-type.types";

type Nav = NavigationProp<Record<string, { id?: string; clientId?: string }>>;
type PolRoute = RouteProp<Record<string, { id?: string; clientId?: string }>>;

export default function PolicyFormScreen() {
  const [clientId, setClientId] = useState("");
  const [insuranceTypeId, setInsuranceTypeId] = useState("");
  const [premium, setPremium] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"active" | "expired" | "cancelled">("active");
  const [notes, setNotes] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [insuranceTypes, setInsuranceTypes] = useState<InsuranceType[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClientMenu, setShowClientMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const navigation = useNavigation<Nav>();
  const route = useRoute<PolRoute>();
  const theme = useTheme();
  const editId = route.params?.id;
  const prefillClientId = route.params?.clientId;
  const isEdit = !!editId;

  useEffect(() => {
    loadFormData();
  }, []);

  async function loadFormData() {
    const [clientsData, typesData] = await Promise.all([fetchClients(), fetchInsuranceTypes()]);
    setClients(clientsData);
    setInsuranceTypes(typesData);
    if (prefillClientId) setClientId(prefillClientId);
    if (editId) {
      const policy = await fetchPolicy(editId);
      setClientId(policy.client_id);
      setInsuranceTypeId(policy.insurance_type_id);
      setPremium(String(policy.premium));
      setStartDate(policy.start_date);
      setEndDate(policy.end_date || "");
      setStatus(policy.status);
      setNotes(policy.notes || "");
    }
  }

  async function handleSubmit() {
    if (!clientId || !insuranceTypeId || !premium || !startDate) {
      setError("Client, Insurance Type, Premium, and Start Date are required");
      return;
    }

    setSubmitting(true);
    try {
      const input = {
        client_id: clientId,
        insurance_type_id: insuranceTypeId,
        premium: parseFloat(premium),
        start_date: startDate,
        end_date: endDate || undefined,
        status,
        notes: notes.trim() || undefined,
      };
      if (isEdit) {
        await updatePolicy(editId, input);
      } else {
        await createPolicy(input);
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
      <Text variant="titleMedium" style={[styles.label, { color: theme.colors.onSurface }]}>Client</Text>
      <Menu visible={showClientMenu} onDismiss={() => setShowClientMenu(false)} anchor={<Button mode="outlined" onPress={() => setShowClientMenu(true)} textColor={theme.colors.primary}>{clients.find((c) => c.id === clientId)?.name || "Select Client"}</Button>}>
        {clients.map((c) => (
          <Menu.Item key={c.id} title={c.name} onPress={() => { setClientId(c.id); setShowClientMenu(false); }} />
        ))}
      </Menu>

      <Text variant="titleMedium" style={[styles.label, { color: theme.colors.onSurface }]}>Insurance Type</Text>
      <Menu visible={showTypeMenu} onDismiss={() => setShowTypeMenu(false)} anchor={<Button mode="outlined" onPress={() => setShowTypeMenu(true)} textColor={theme.colors.primary}>{insuranceTypes.find((t) => t.id === insuranceTypeId)?.name || "Select Type"}</Button>}>
        {insuranceTypes.map((t) => (
          <Menu.Item key={t.id} title={t.name} onPress={() => { setInsuranceTypeId(t.id); setShowTypeMenu(false); }} />
        ))}
      </Menu>

      <TextInput label="Premium *" value={premium} onChangeText={setPremium} mode="outlined" keyboardType="decimal-pad" style={styles.input} />

      <TouchableOpacity onPress={() => setShowStartPicker(true)}>
        <TextInput label="Start Date *" value={startDate} mode="outlined" style={styles.input} editable={false} />
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startDate ? new Date(startDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => {
            setShowStartPicker(Platform.OS !== "ios");
            if (date) setStartDate(date.toISOString().split("T")[0]);
          }}
        />
      )}

      <TouchableOpacity onPress={() => setShowEndPicker(true)}>
        <TextInput label="End Date" value={endDate} mode="outlined" style={styles.input} editable={false} />
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={endDate ? new Date(endDate) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => {
            setShowEndPicker(Platform.OS !== "ios");
            if (date) setEndDate(date.toISOString().split("T")[0]);
          }}
        />
      )}

      <TextInput label="Notes" value={notes} onChangeText={setNotes} mode="outlined" multiline style={styles.input} />
      <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting}>
        {isEdit ? "Update" : "Create"}
      </Button>
      <Snackbar visible={!!error} onDismiss={() => setError(null)} style={{ backgroundColor: theme.colors.surface }}>{error}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: "700" },
  input: { marginBottom: 12 },
});
