export interface Policy {
  id: string;
  client_id: string;
  insurance_type_id: string;
  policy_number?: string;
  premium_amount: number;
  signed_on: string;
  expires_on?: string;
  status: "active" | "inactive";
  created_at: string;
}

export interface PolicyWithDetails extends Policy {
  insurance_types?: { name: string };
  clients?: { name: string };
}

export type PolicyInput = Pick<Policy, "client_id" | "insurance_type_id" | "premium_amount" | "signed_on"> & Partial<Pick<Policy, "policy_number" | "expires_on" | "status">>;
