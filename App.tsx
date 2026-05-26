import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>PolicyDesk</Text>
      <Text style={styles.title}>Premium follow-up workspace</Text>
      <Text style={styles.body}>
        Client, policy, and payment tracking will be added after this stable
        base review.
      </Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
