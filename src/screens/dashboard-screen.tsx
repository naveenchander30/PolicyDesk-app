import { StyleSheet, Text, View } from "react-native";

export function DashboardScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>Dashboard</Text>
      <Text accessibilityRole="header" style={styles.title}>
        Premium follow-up workspace
      </Text>
      <Text style={styles.body}>
        Client, policy, and payment tracking will be added after this stable
        base review.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#f6f7f9",
    padding: 24
  },
  eyebrow: {
    color: "#0f766e",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  title: {
    color: "#17202a",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 38
  },
  body: {
    color: "#667085",
    fontSize: 16,
    lineHeight: 24
  }
});
