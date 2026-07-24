"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { payrollService } from "@/services/payroll.service";
import type { Payslip } from "@/types/payroll";
import { EmployeePayrollView } from "@/components/payroll/EmployeePayrollView";
import { PageHeader } from "@/components/common";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function PayslipsPage() {
  const { user, role } = useAuth();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployeeData = useCallback(async () => {
    if (!user || !role) return;
    try {
      const slips = await payrollService.getEmployeePayslips(user.uid, role);
      setPayslips(slips);
    } catch (error) {
      toast.error("Failed to fetch payslips.");
      console.error(error);
    }
  }, [user]);

  useEffect(() => {
    setIsLoading(true);
    fetchEmployeeData().finally(() => setIsLoading(false));
  }, [fetchEmployeeData]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Payslips & History" 
        subtitle="View and download your monthly salary statements" 
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEmployeeData}
            disabled={isLoading}
            className="gap-2 rounded-xl"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />
      <EmployeePayrollView payslips={payslips} isLoading={isLoading} />
    </div>
  );
}
