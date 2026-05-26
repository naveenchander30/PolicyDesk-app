export interface Payment {
  id: string;
  policy_id: string;
  amount: number;
  payment_date: string;
  status: "pending" | "paid";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type PaymentInput = Pick<Payment, "policy_id" | "amount"> & Partial<Pick<Payment, "payment_date" | "status" | "notes">>;
