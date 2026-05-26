type EnvSource = Record<string, string | undefined>;

export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export function getSupabaseEnv(source: EnvSource = process.env): SupabaseEnv {
  const url = source.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = source.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url) {
    throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL");
  }

  if (!anonKey) {
    throw new Error("Missing EXPO_PUBLIC_SUPABASE_ANON_KEY");
  }

  return {
    url,
    anonKey
  };
}
