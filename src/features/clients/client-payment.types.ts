export type PolicyPaymentSummary = {
  policyNumber: string | null;
  insuranceTypeName: string;
  premiumAmount: number | null;
  totalDue: number;
  totalPaid: number;
  remaining: number;
};

export type ClientPaymentSummary = {
  totalRemaining: number;
  policies: PolicyPaymentSummary[];
};
