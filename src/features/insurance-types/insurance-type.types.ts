export interface InsuranceType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export type InsuranceTypeInput = Pick<InsuranceType, "name"> & Partial<Pick<InsuranceType, "description">>;
