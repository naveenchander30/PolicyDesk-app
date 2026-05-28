import { createSupabaseClient } from "@/lib/supabase";
import { Client, ClientInput } from "./client.types";
import { ClientPaymentSummary, PolicyPaymentSummary } from "./client-payment.types";

const supabase = createSupabaseClient();

export async function fetchClientPaymentSummary(clientId: string): Promise<ClientPaymentSummary> {
  const { data: policies, error } = await supabase
    .from("policies")
    .select("id, policy_number, premium_amount, insurance_types(name)")
    .eq("client_id", clientId);

  if (error) throw error;
  if (!policies || policies.length === 0) return { totalRemaining: 0, policies: [] };

  const policyIds = policies.map((p) => p.id);
  const { data: allPayments } = await supabase
    .from("payments")
    .select("policy_id, amount_due, amount_paid")
    .in("policy_id", policyIds);

  const paymentsByPolicy: Record<string, { amount_due: number; amount_paid: number }[]> = {};
  for (const p of allPayments || []) {
    if (!paymentsByPolicy[p.policy_id]) paymentsByPolicy[p.policy_id] = [];
    paymentsByPolicy[p.policy_id].push(p);
  }

  const summaryPolicies: PolicyPaymentSummary[] = policies.map((policy) => {
    const payments = paymentsByPolicy[policy.id] || [];
    const totalDue = payments.reduce((s, p) => s + Number(p.amount_due || 0), 0);
    const totalPaid = payments.reduce((s, p) => s + Number(p.amount_paid || 0), 0);

    return {
      policyNumber: policy.policy_number,
      insuranceTypeName: (policy.insurance_types as { name: string }[])?.[0]?.name || "Unknown",
      premiumAmount: policy.premium_amount ? Number(policy.premium_amount) : null,
      totalDue,
      totalPaid,
      remaining: totalDue - totalPaid,
    };
  });

  return {
    totalRemaining: summaryPolicies.reduce((s, p) => s + p.remaining, 0),
    policies: summaryPolicies,
  };
}

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
