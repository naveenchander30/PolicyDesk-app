export interface Payment {
  id: string;
  policy_id: string;
  amount_due: number;
  amount_paid?: number;
  paid_on?: string;
  due_date?: string;
  status: "pending" | "paid" | "overdue";
  created_at: string;
}

export type PaymentInput = Pick<Payment, "policy_id" | "amount_due"> & Partial<Pick<Payment, "amount_paid" | "paid_on" | "due_date" | "status">>;
