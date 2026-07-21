"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { dashboardService, type DashboardData } from "@/services/dashboard.service";

export function useDashboard() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getDashboardData(user.role, user.uid);
      setData(response);
    } catch (err: unknown) {
      console.error("fetchDashboardData hook failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        fetchDashboardData();
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refresh: fetchDashboardData,
  };
}
