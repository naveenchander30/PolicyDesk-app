import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { AuthGate } from "@/components/auth-gate";

export default function App() {
  return (
    <PaperProvider>
      <AuthGate />
      <StatusBar style="dark" />
    </PaperProvider>
  );
}
