import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { AuthGate } from "@/components/auth-gate";
import { policyDeskDarkTheme } from "@/theme";

export default function App() {
  return (
    <PaperProvider theme={policyDeskDarkTheme}>
      <AuthGate />
      <StatusBar style="light" />
    </PaperProvider>
  );
}
