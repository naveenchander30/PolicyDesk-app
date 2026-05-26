import { createSupabaseClient } from "@/lib/supabase";
import { Policy, PolicyInput, PolicyWithDetails } from "./policy.types";

const supabase = createSupabaseClient();

export async function fetchPolicies(): Promise<PolicyWithDetails[]> {
  const { data, error } = await supabase
    .from("policies")
    .select("*, insurance_types(name), clients(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPolicy(id: string): Promise<PolicyWithDetails> {
  const { data, error } = await supabase
    .from("policies")
    .select("*, insurance_types(name), clients(name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createPolicy(input: PolicyInput): Promise<Policy> {
  const { data, error } = await supabase.from("policies").insert([input]).select().single();
  if (error) throw error;
  return data;
}

export async function updatePolicy(id: string, input: Partial<PolicyInput>): Promise<Policy> {
  const { data, error } = await supabase.from("policies").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
