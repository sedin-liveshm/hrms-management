"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { payrollService } from "@/services/payroll.service";
import type { SalaryStructure } from "@/types/payroll";
import { PageHeader, SectionCard, PageLoader } from "@/components/common";

export default function MySalaryPage() {
  const { user, role } = useAuth();
  const [structure, setStructure] = useState<SalaryStructure | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && role) {
      payrollService.getSalaryStructure(user.uid, role).then((data) => {
        setStructure(data);
        setLoading(false);
      });
    }
  }, [user, role]);

  if (loading) return <PageLoader />;
  if (!structure) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-lg font-bold text-foreground">No Salary Structure Found</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Your salary structure has not been configured by HR yet.
        </p>
      </div>
    );
  }

  const totalGross = structure.basicPay + structure.hra + structure.specialAllowance + structure.medicalAllowance + structure.travelAllowance + structure.otherAllowances;
  const totalDeductions = structure.pfDeduction + structure.esiDeduction + structure.professionalTax + structure.incomeTax + structure.otherDeductions;
  const netPay = totalGross - totalDeductions;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Salary Structure" 
        subtitle="Current effective salary package and breakdown" 
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <SectionCard title="Employment Details" className="h-fit">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Employee ID</p>
              <p className="text-sm font-semibold text-foreground">{structure.employeeId}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Designation</p>
              <p className="text-sm font-semibold text-foreground">{structure.designation}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Department</p>
              <p className="text-sm font-semibold text-foreground">{structure.department}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Employment Type</p>
              <p className="text-sm font-semibold text-foreground">{structure.employmentType}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Joining Date</p>
              <p className="text-sm font-semibold text-foreground">{structure.joiningDate}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Effective Date</p>
              <p className="text-sm font-semibold text-primary">{structure.effectiveDate}</p>
            </div>
          </div>
        </SectionCard>

        {/* Summary Header */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-xs">
            <p className="text-xs uppercase font-bold text-primary/80 mb-1">Annual CTC</p>
            <h3 className="text-3xl font-black text-primary">₹{structure.ctc.toLocaleString()}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Monthly Gross</p>
              <p className="text-xl font-bold text-foreground">₹{totalGross.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <p className="text-xs uppercase font-bold text-muted-foreground mb-1">Monthly Net (Est)</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{netPay.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Earnings (Monthly)" noPadding>
          <div className="divide-y divide-border">
            <Row label="Basic Pay" value={structure.basicPay} />
            <Row label="HRA" value={structure.hra} />
            <Row label="Special Allowance" value={structure.specialAllowance} />
            <Row label="Medical Allowance" value={structure.medicalAllowance} />
            <Row label="Travel Allowance" value={structure.travelAllowance} />
            <Row label="Other Allowances" value={structure.otherAllowances} />
            <div className="flex items-center justify-between p-4 bg-muted/30">
              <span className="text-sm font-bold text-foreground">Total Gross Salary</span>
              <span className="text-sm font-black text-foreground">₹{totalGross.toLocaleString()}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Deductions (Monthly)" noPadding>
          <div className="divide-y divide-border">
            <Row label="PF Contribution" value={structure.pfDeduction} />
            <Row label="ESI Contribution" value={structure.esiDeduction} />
            <Row label="Professional Tax" value={structure.professionalTax} />
            <Row label="Income Tax (TDS)" value={structure.incomeTax} />
            <Row label="Loss of Pay (Leave)" value={structure.otherDeductions} />
            
            <div className="flex items-center justify-between p-4 bg-destructive/5 mt-auto">
              <span className="text-sm font-bold text-destructive">Total Deductions</span>
              <span className="text-sm font-black text-destructive">₹{totalDeductions.toLocaleString()}</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">₹{value.toLocaleString()}</span>
    </div>
  );
}
