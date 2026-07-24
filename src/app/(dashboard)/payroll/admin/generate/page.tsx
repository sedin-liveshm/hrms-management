"use client";

import React, { useState } from "react";
import { Calculator, PlayCircle, Loader2, CheckCircle2 } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { payrollService } from "@/services/payroll.service";

export default function GeneratePayslipsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Jul 2026");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const employeeCount = await payrollService.generatePayslips(selectedMonth);
      setIsGenerating(false);
      setIsGenerated(true);
      toast.success(`Generated payslips for ${employeeCount} employees for ${selectedMonth}.`);
    } catch (error) {
      setIsGenerating(false);
      toast.error(error instanceof Error ? error.message : "Failed to generate payslips.");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader 
        title="Generate Payslips" 
        subtitle="Process the monthly payroll and publish payslips for all employees" 
      />

      <SectionCard title="Processing Simulation">
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/90">Payroll Period</label>
              <select 
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setIsGenerated(false);
                }}
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
              >
                <option value="Jul 2026">July 2026</option>
                <option value="Aug 2026">August 2026</option>
                <option value="Sep 2026">September 2026</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/90">Processing Mode</label>
              <select 
                disabled
                className="flex h-10 w-full rounded-lg border border-input bg-muted/50 text-muted-foreground px-3 py-1 text-sm shadow-xs transition-colors cursor-not-allowed"
              >
                <option>Standard (Role-Based V1)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
            <Calculator className="size-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm text-foreground/90 leading-relaxed">
              <strong>V1 Processing Rules:</strong> The system will automatically map each employee to their assigned static salary structure. Any outstanding Loss of Pay (LOP) based on their leave balances will be deducted from the current month's "Other Deductions".
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            {!isGenerated ? (
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="h-10 px-6 rounded-xl font-bold gap-2 text-base"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <PlayCircle className="size-5" />
                    Run Payroll
                  </>
                )}
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="h-10 px-6 rounded-xl font-bold gap-2 text-base border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              >
                <CheckCircle2 className="size-5" />
                Published Successfully
              </Button>
            )}
          </div>

        </div>
      </SectionCard>
    </div>
  );
}
