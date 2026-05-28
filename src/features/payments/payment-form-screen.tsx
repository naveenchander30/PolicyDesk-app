import { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { TextInput, Button, Text, Switch, Snackbar, Menu, useTheme } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute, NavigationProp, RouteProp } from "@react-navigation/native";
import { createPayment } from "./payment.queries";
import { fetchPolicies } from "@/features/policies/policy.queries";
import { PolicyWithDetails } from "@/features/policies/policy.types";

type Nav = NavigationProp<Record<string, { policyId?: string }>>;
type PayRoute = RouteProp<Record<string, { policyId?: string }>>;

export default function PaymentFormScreen() {
  const [policyId, setPolicyId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [markPaid, setMarkPaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [policies, setPolicies] = useState<PolicyWithDetails[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPolicyMenu, setShowPolicyMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigation = useNavigation<Nav>();
  const route = useRoute<PayRoute>();
  const theme = useTheme();
  const prefillPolicyId = route.params?.policyId;

  useEffect(() => {
    fetchPolicies().then(setPolicies);
    if (prefillPolicyId) setPolicyId(prefillPolicyId);
  }, []);

  async function handleSubmit() {
    if (!policyId || !amount) {
      setError("Policy and Amount are required");
      return;
    }

    setSubmitting(true);
    try {
      await createPayment({
        policy_id: policyId,
        amount: parseFloat(amount),
        payment_date: paymentDate,
        status: markPaid ? "paid" : "pending",
        notes: notes.trim() || undefined,
      });
      navigation.goBack();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="titleMedium" style={[styles.label, { color: theme.colors.onSurface }]}>Policy</Text>
      <Menu visible={showPolicyMenu} onDismiss={() => setShowPolicyMenu(false)} anchor={<Button mode="outlined" onPress={() => setShowPolicyMenu(true)} textColor={theme.colors.primary}>{policies.find((p) => p.id === policyId)?.clients?.name || "Select Policy"}</Button>}>
        {policies.map((p) => (
          <Menu.Item key={p.id} title={`${p.clients?.name || "Unknown"} — $${p.premium}`} onPress={() => { setPolicyId(p.id); setShowPolicyMenu(false); }} />
        ))}
      </Menu>

      <TextInput label="Amount *" value={amount} onChangeText={setAmount} mode="outlined" keyboardType="decimal-pad" style={styles.input} />

      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput label="Date" value={paymentDate} mode="outlined" style={styles.input} editable={false} />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={new Date(paymentDate)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS !== "ios");
            if (date) setPaymentDate(date.toISOString().split("T")[0]);
          }}
        />
      )}

      <View style={styles.switchRow}>
        <Text style={{ color: theme.colors.onSurface }}>Mark as paid</Text>
        <Switch value={markPaid} onValueChange={setMarkPaid} />
      </View>
      <TextInput label="Notes" value={notes} onChangeText={setNotes} mode="outlined" multiline style={styles.input} />
      <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting}>
        Create Payment
      </Button>
      <Snackbar visible={!!error} onDismiss={() => setError(null)} style={{ backgroundColor: theme.colors.surface }}>{error}</Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: "700" },
  input: { marginBottom: 12 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
});
