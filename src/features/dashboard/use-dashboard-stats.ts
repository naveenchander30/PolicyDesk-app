import { useState, useCallback } from "react";
import { createSupabaseClient } from "@/lib/supabase";

const supabase = createSupabaseClient();

export interface DashboardStats {
  totalClients: number;
  totalPolicies: number;
  pendingPayments: number;
  overduePayments: number;
  paidThisMonth: number;
  loading: boolean;
  error: Error | null;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalPolicies: 0,
    pendingPayments: 0,
    overduePayments: 0,
    paidThisMonth: 0,
    loading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }));
      const [clientRes, policyRes, pendingRes] = await Promise.all([
        supabase.from("clients").select("*", { count: "exact", head: true }),
        supabase.from("policies").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
      ]);

      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const paidRes = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("status", "paid")
        .gte("payment_date", firstOfMonth);

      setStats({
        totalClients: clientRes.count ?? 0,
        totalPolicies: policyRes.count ?? 0,
        pendingPayments: pendingRes.count ?? 0,
        overduePayments: pendingRes.count ?? 0,
        paidThisMonth: paidRes.count ?? 0,
        loading: false,
        error: null,
      });
    } catch (e) {
      setStats((prev) => ({ ...prev, loading: false, error: e as Error }));
    }
  }, []);

  return { ...stats, refetch: fetchStats };
}
