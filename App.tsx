import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthGate } from "@/components/auth-gate";
import { policyDeskDarkTheme } from "@/theme";
import { StyleSheet } from "react-native";

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <PaperProvider theme={policyDeskDarkTheme}>
        <AuthGate />
        <StatusBar style="light" />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
