export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ClientInput = Pick<Client, "name"> & Partial<Pick<Client, "email" | "phone" | "notes">>;
