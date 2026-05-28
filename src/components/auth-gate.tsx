import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/supabase";
import { AuthScreen } from "@/screens/auth-screen";
import AppNavigator from "@/navigation/app-navigator";

const supabase = createSupabaseClient();

export function AuthGate() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const theme = useTheme();

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
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator />
      </View>
    );
  }

  if (session) {
    return <AppNavigator />;
  }

  return <AuthScreen />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
