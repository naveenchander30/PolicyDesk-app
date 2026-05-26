import { createSupabaseClient } from "@/lib/supabase";
import { Payment, PaymentInput } from "./payment.types";

const supabase = createSupabaseClient();

export async function fetchPayments(): Promise<Payment[]> {
  const { data, error } = await supabase.from("payments").select("*").order("payment_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPaymentsByPolicy(policyId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("policy_id", policyId)
    .order("payment_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPayment(input: PaymentInput): Promise<Payment> {
  const { data, error } = await supabase.from("payments").insert([input]).select().single();
  if (error) throw error;
  return data;
}

export async function markPaymentAsPaid(id: string): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .update({ status: "paid" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
