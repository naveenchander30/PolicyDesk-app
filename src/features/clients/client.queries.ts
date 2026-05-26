import { createSupabaseClient } from "@/lib/supabase";
import { Client, ClientInput } from "./client.types";

const supabase = createSupabaseClient();

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchClient(id: string): Promise<Client> {
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createClient(input: ClientInput): Promise<Client> {
  const { data, error } = await supabase.from("clients").insert([input]).select().single();
  if (error) throw error;
  return data;
}

export async function updateClient(id: string, input: Partial<ClientInput>): Promise<Client> {
  const { data, error } = await supabase.from("clients").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
