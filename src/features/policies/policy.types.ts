export interface Policy {
  id: string;
  client_id: string;
  insurance_type_id: string;
  policy_number?: string;
  premium: number;
  start_date: string;
  end_date?: string;
  status: "active" | "expired" | "cancelled";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PolicyWithDetails extends Policy {
  insurance_types?: { name: string };
  clients?: { name: string };
}

export type PolicyInput = Pick<Policy, "client_id" | "insurance_type_id" | "premium" | "start_date"> & Partial<Pick<Policy, "policy_number" | "end_date" | "status" | "notes">>;
