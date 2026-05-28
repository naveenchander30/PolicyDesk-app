import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { createSupabaseClient } from "@/lib/supabase";

const supabase = createSupabaseClient();

type ValidationErrors = {
  email?: string;
  password?: string;
};

export function AuthScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const nextErrors: ValidationErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        Alert.alert("Error", error.message);
      }
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.panel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}>
        <Text style={[styles.eyebrow, { color: theme.colors.primary }]}>PolicyDesk</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.colors.onSurface }]}>
          Log in
        </Text>
        <Text style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>Access your client book and payment dashboard.</Text>

        <Text style={[styles.label, { color: theme.colors.onSurface }]}>Email</Text>
        <TextInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          inputMode="email"
          onChangeText={setEmail}
          style={[styles.input, { borderColor: theme.colors.outlineVariant, color: theme.colors.onSurface, backgroundColor: theme.colors.elevation.level0 }]}
          value={email}
          placeholderTextColor={theme.colors.outline}
        />
        {errors.email ? <Text style={[styles.error, { color: theme.colors.error }]}>{errors.email}</Text> : null}

        <Text style={[styles.label, { color: theme.colors.onSurface }]}>Password</Text>
        <TextInput
          accessibilityLabel="Password"
          onChangeText={setPassword}
          secureTextEntry
          style={[styles.input, { borderColor: theme.colors.outlineVariant, color: theme.colors.onSurface, backgroundColor: theme.colors.elevation.level0 }]}
          value={password}
          placeholderTextColor={theme.colors.outline}
        />
        {errors.password ? (
          <Text style={[styles.error, { color: theme.colors.error }]}>{errors.password}</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={handleSubmit}
          disabled={submitting}
          style={[styles.button, { backgroundColor: theme.colors.primary }, submitting && styles.buttonDisabled]}
        >
          <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>
            {submitting ? "Please wait…" : "Log in"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  panel: {
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 28,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  error: {
    fontSize: 13,
  },
  button: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 15,
  },
});
