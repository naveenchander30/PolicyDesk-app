import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Session } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/supabase";
import { AuthScreen } from "@/screens/auth-screen";
import AppNavigator from "@/navigation/app-navigator";

const supabase = createSupabaseClient();

export function AuthGate() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <ActivityIndicator />;
  }

  if (session) {
    return <AppNavigator />;
  }

  return <AuthScreen />;
}
