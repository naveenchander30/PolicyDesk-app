import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

export function createSupabaseClient() {
  const env = getSupabaseEnv();

  return createClient(env.url, env.anonKey);
}
