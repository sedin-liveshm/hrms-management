"use client";

import React from "react";
import {
  DollarSign,
  Download,
  Building,
  CreditCard,
  Percent,
  FileText,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  StatCard,
  SectionCard,
  DataTable,
  type Column,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface Payslip {
  id: string;
  month: string;
  grossPay: number;
  deduction: number;
  netPay: number;
  status: "Paid" | "Pending" | "On Hold";
}

interface PayrollRun {
  id: string;
  month: string;
  employees: number;
  total: string;
  status: "Processed" | "Draft";
  date: string;
}

export default function PayrollPage() {
  const { role } = useAuth();

  // Admin Mock Data
  const payrollRuns: PayrollRun[] = [
    { id: "1", month: "May 2026", employees: 248, total: "₹12,40,000", status: "Processed", date: "2026-05-31" },
    { id: "2", month: "April 2026", employees: 245, total: "₹12,15,000", status: "Processed", date: "2026-04-30" },
    { id: "3", month: "March 2026", employees: 240, total: "₹11,95,000", status: "Processed", date: "2026-03-31" },
    { id: "4", month: "June 2026", employees: 248, total: "₹12,60,000", status: "Draft", date: "—" },
  ];

  // Employee Mock Data
  const myPayslips: Payslip[] = [
    { id: "1", month: "May 2026", grossPay: 85000, deduction: 6600, netPay: 78400, status: "Paid" },
    { id: "2", month: "April 2026", grossPay: 85000, deduction: 6600, netPay: 78400, status: "Paid" },
    { id: "3", month: "March 2026", grossPay: 82000, deduction: 6200, netPay: 75800, status: "Paid" },
    { id: "4", month: "February 2026", grossPay: 82000, deduction: 6200, netPay: 75800, status: "Paid" },
    { id: "5", month: "January 2026", grossPay: 82000, deduction: 6200, netPay: 75800, status: "Paid" },
  ];

  const payslipColumns: Column<Payslip>[] = [
    {
      key: "month",
      label: "Statement Month",
      width: "160px",
      renderCell: (row) => <span className="font-semibold text-foreground">{row.month}</span>,
    },
    {
      key: "grossPay",
      label: "Gross Salary",
      renderCell: (row) => <span className="font-mono text-sm font-semibold">₹{row.grossPay.toLocaleString()}</span>,
    },
    {
      key: "deduction",
      label: "Total Deductions",
      renderCell: (row) => <span className="font-mono text-sm font-semibold text-destructive">₹{row.deduction.toLocaleString()}</span>,
    },
    {
      key: "netPay",
      label: "Net Take-Home Pay",
      renderCell: (row) => <span className="font-mono text-sm font-bold text-primary">₹{row.netPay.toLocaleString()}</span>,
    },
    {
      key: "status",
      label: "Payment Status",
      width: "120px",
      renderCell: (row) => (
        <Badge
          className={cn(
            "border-0 text-[10px] font-bold px-2 py-0.5 rounded-md",
            row.status === "Paid"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
          )}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "action",
      label: "",
      width: "60px",
      align: "right",
      renderCell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted cursor-pointer"
          onClick={() => {
            alert(`Generating and downloading PDF payslip statement for ${row.month}...`);
          }}
          title="Download Payslip PDF"
        >
          <Download className="size-4 text-muted-foreground hover:text-foreground" />
        </Button>
      ),
    },
  ];

  const isAdminOrHr = role === "admin" || role === "hr";

  return (
    <PageContainer>
      <PageHeader
        title="Payroll & Payslips"
        subtitle={
          isAdminOrHr
            ? "Manage organization salary runs and payslip distributions"
            : "View your monthly take-home salary, tax summaries, and download payslips"
        }
        action={
          isAdminOrHr ? (
            <Button size="sm" className="gap-1.5 rounded-xl cursor-pointer">
              <DollarSign className="size-4" />
              Run Payroll
            </Button>
          ) : undefined
        }
      />

      {isAdminOrHr ? (
        /* ── ADMIN/HR PAYROLL VIEW ─────────────────────────── */
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="This Month Total"
              value="₹12.6L"
              icon={DollarSign}
              trend={{ value: "+2.1%", direction: "up", label: "vs last month" }}
            />
            <StatCard
              label="Employees Paid"
              value="248"
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
              {payrollRuns.map((run) => (
                <div key={run.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{run.month}</p>
                    <p className="text-xs text-muted-foreground font-semibold">
                      {run.employees} employees · Processed on {run.date}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-foreground">{run.total}</p>
                  <Badge
                    className={cn(
                      "border-0 text-[10px] font-bold px-2 py-0.5 rounded-md",
                      run.status === "Processed" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" :
                      "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                    )}
                  >
                    {run.status}
                  </Badge>
                  {run.status === "Processed" && (
                    <Button variant="ghost" size="icon" aria-label={`Download ${run.month} payroll`} className="h-8 w-8 hover:bg-muted cursor-pointer">
                      <Download className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      ) : (
        /* ── EMPLOYEE PAYROLL VIEW ─────────────────────────── */
        <div className="space-y-6">
          {/* Salary Overview Card */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Monthly Gross Salary"
              value="₹85,000"
              icon={DollarSign}
              trend={{ value: "CTC Base", direction: "up", label: "salary" }}
            />
            <StatCard
              label="Deductions (Provident Fund/Tax)"
              value="₹6,600"
              icon={Percent}
              iconClassName="bg-destructive/10 text-destructive"
              trend={{ value: "PF & Professional Tax", direction: "down", label: "deductions" }}
            />
            <StatCard
              label="Net Take-Home Pay"
              value="₹78,400"
              icon={CreditCard}
              iconClassName="bg-primary/10 text-primary"
              trend={{ value: "Direct Deposit", direction: "up", label: "bank account" }}
            />
            <StatCard
              label="Accumulated Annual Bonus"
              value="₹45,000"
              icon={DollarSign}
              iconClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
              trend={{ value: "Accrued", direction: "up", label: "financial year" }}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Payslips DataTable — 2/3 Width */}
            <div className="lg:col-span-2">
              <DataTable
                columns={payslipColumns}
                data={myPayslips}
                rowKey="id"
                isLoading={false}
                skeletonRows={5}
                emptyTitle="No Payslips Found"
                emptyDescription="No payroll statement has been generated for your profile yet."
              />
            </div>

            {/* Side Column: Bank & Tax Cards */}
            <div className="space-y-6">
              {/* Bank Details Card */}
              <SectionCard title="Direct Deposit Account" description="Your salary payout details">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Building className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Bank Name</p>
                      <p className="text-sm font-semibold text-foreground">HDFC Bank Ltd</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <CreditCard className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Account Number</p>
                      <p className="text-sm font-mono font-semibold text-foreground">•••• •••• 4092</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">IFSC Code & Branch</p>
                      <p className="text-sm font-mono font-semibold text-foreground">HDFC0001092 (Mumbai)</p>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Tax Details Card */}
              <SectionCard title="Tax & PF Details" description="Government registrations">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">PAN Number</p>
                      <p className="text-sm font-mono font-semibold text-foreground">••••••382D</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">UAN (Provident Fund)</p>
                      <p className="text-sm font-mono font-semibold text-foreground">••••••••2819</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Percent className="size-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Tax Regime Preference</p>
                      <p className="text-sm font-semibold text-foreground">New Tax Regime (FY 2026-27)</p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
