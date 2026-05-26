import { AuthScreen } from "@/screens/auth-screen";
import { DashboardScreen } from "@/screens/dashboard-screen";

type AuthGateProps = {
  isSignedIn?: boolean;
};

export function AuthGate({ isSignedIn = false }: AuthGateProps) {
  if (isSignedIn) {
    return <DashboardScreen />;
  }

  return <AuthScreen mode="login" />;
}
