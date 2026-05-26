import { createSupabaseClient } from "@/lib/supabase";
import { InsuranceType } from "./insurance-type.types";

const supabase = createSupabaseClient();

export async function fetchInsuranceTypes(): Promise<InsuranceType[]> {
  const { data, error } = await supabase.from("insurance_types").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}
