"use client";

import React from "react";
import { Users, IndianRupee } from "lucide-react";
import { ROLE_SALARIES } from "@/services/payroll.service";
import { PageHeader, SectionCard } from "@/components/common";
import { Badge } from "@/components/ui/badge";

export default function SalaryStructuresPage() {
  const roles = Object.keys(ROLE_SALARIES);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Role-Based Salary Structures" 
        subtitle="Predefined salary packages assigned based on employee role" 
      />

      <div className="grid grid-cols-1 gap-6">
        {roles.map((roleKey) => {
          const structure = ROLE_SALARIES[roleKey];
          const gross = structure.basicPay + structure.hra + structure.specialAllowance + 
                        structure.medicalAllowance + structure.travelAllowance + structure.otherAllowances;
          const ded = structure.pfDeduction + structure.professionalTax + structure.incomeTax;
          const net = gross - ded;

          return (
            <SectionCard key={roleKey} title={`${roleKey.toUpperCase()} Package`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <p className="text-[10px] uppercase font-bold text-primary/80 mb-1">Annual CTC</p>
                  <p className="text-xl font-black text-primary">₹{structure.ctc.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Monthly Gross</p>
                  <p className="text-xl font-bold text-foreground">₹{gross.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total Deductions</p>
                  <p className="text-xl font-bold text-destructive">₹{ded.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Monthly Net</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{net.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold border-b border-border pb-2 mb-3">Earnings Component</h4>
                  <div className="space-y-2">
                    <Row label="Basic Pay" value={structure.basicPay} />
                    <Row label="HRA" value={structure.hra} />
                    <Row label="Special Allowance" value={structure.specialAllowance} />
                    <Row label="Medical Allowance" value={structure.medicalAllowance} />
                    <Row label="Transport Allowance" value={structure.travelAllowance} />
                    <Row label="Other Allowance" value={structure.otherAllowances} />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold border-b border-border pb-2 mb-3">Deductions Component</h4>
                  <div className="space-y-2">
                    <Row label="Provident Fund (PF)" value={structure.pfDeduction} />
                    <Row label="Professional Tax (PT)" value={structure.professionalTax} />
                    <Row label="Income Tax (TDS)" value={structure.incomeTax} />
                  </div>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">₹{value.toLocaleString()}</span>
    </div>
  );
}
