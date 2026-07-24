import React from "react";
import { CheckCircle, DollarSign, Download } from "lucide-react";
import { StatCard, SectionCard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PayrollRun } from "@/types/payroll";

interface Props {
  payrollRuns: PayrollRun[];
}

export function AdminPayrollView({ payrollRuns }: Props) {
  // Simple aggregations for demo
  const currentRun = payrollRuns.length > 0 ? payrollRuns[0] : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Latest Month Total"
          value={currentRun ? `₹${currentRun.total.toLocaleString()}` : "₹0"}
          icon={DollarSign}
          trend={{ value: "+2.1%", direction: "up", label: "vs last month" }}
        />
        <StatCard
          label="Employees Paid"
          value={currentRun ? String(currentRun.employees) : "0"}
          icon={DollarSign}
          trend={{ value: "100%", direction: "up", label: "processed" }}
        />
        <StatCard
          label="Pending Actions"
          value="0"
          icon={DollarSign}
          iconClassName="bg-primary/10 text-primary"
        />
      </div>

      <SectionCard title="Payroll History" description="Monthly payroll runs" noPadding>
        <div className="divide-y divide-border">
          {payrollRuns.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No payroll runs found.
            </div>
          ) : (
            payrollRuns.map((run) => (
              <div key={run.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{run.month}</p>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {run.employees} employees · Processed on {run.date}
                  </p>
                </div>
                <p className="text-sm font-bold text-foreground">₹{run.total.toLocaleString()}</p>
                <Badge
                  className={cn(
                    "border-0 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center",
                    run.status === "Published"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                  )}
                >
                  {run.status === "Published" && <CheckCircle className="size-3 mr-1" />}
                  {run.status}
                </Badge>
                {run.status === "Published" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Download ${run.month} payroll`}
                    className="h-8 w-8 hover:bg-muted cursor-pointer"
                  >
                    <Download className="size-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}
