import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

type AuthMode = "login" | "signup";

type AuthScreenProps = {
  mode: AuthMode;
};

type ValidationErrors = {
  email?: string;
  password?: string;
};

const copy = {
  login: {
    title: "Log in",
    description: "Access your client book and payment dashboard.",
    submit: "Log in"
  },
  signup: {
    title: "Create account",
    description: "Set up access for your PolicyDesk workspace.",
    submit: "Create account"
  }
} satisfies Record<AuthMode, Record<string, string>>;

export function AuthScreen({ mode }: AuthScreenProps) {
  const content = copy[mode];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  function handleSubmit() {
    const nextErrors: ValidationErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!password.trim()) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.panel}>
        <Text style={styles.eyebrow}>PolicyDesk</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {content.title}
        </Text>
        <Text style={styles.body}>{content.description}</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          inputMode="email"
          onChangeText={setEmail}
          style={styles.input}
          value={email}
        />
        {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

        <Text style={styles.label}>Password</Text>
        <TextInput
          accessibilityLabel="Password"
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        {errors.password ? (
          <Text style={styles.error}>{errors.password}</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={handleSubmit}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{content.submit}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f6f7f9",
    padding: 20
  },
  panel: {
    gap: 12,
    borderColor: "#d9dee7",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#ffffff",
    padding: 20
  },
  eyebrow: {
    color: "#0f766e",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  title: {
    color: "#17202a",
    fontSize: 28,
    fontWeight: "800"
  },
  body: {
    color: "#667085",
    fontSize: 15,
    lineHeight: 22
  },
  label: {
    color: "#17202a",
    fontSize: 14,
    fontWeight: "700"
  },
  input: {
    minHeight: 44,
    borderColor: "#d9dee7",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12
  },
  error: {
    color: "#b42318",
    fontSize: 13
  },
  button: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#0f766e",
    paddingHorizontal: 16
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "800"
  }
});
