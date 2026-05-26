import { StatusBar } from "expo-status-bar";
import { AuthGate } from "@/components/auth-gate";

export default function App() {
  return (
    <>
      <AuthGate />
      <StatusBar style="dark" />
    </>
  );
}
