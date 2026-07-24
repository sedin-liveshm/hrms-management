import React from "react";
import { DollarSign, Percent, CreditCard, Download, Building, FileText } from "lucide-react";
import { StatCard, SectionCard, DataTable, type Column } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Payslip } from "@/types/payroll";

interface Props {
  payslips: Payslip[];
  isLoading: boolean;
}

function createPayslipPdf(payslip: Payslip): Blob {
  const formatAmount = (amount: number) => `INR ${amount.toLocaleString("en-IN")}`;
  const escapePdfText = (value: string) => value.replace(/([\\()])/g, "\\$1");
  const lines = [
    { text: "HRMS MANAGEMENT", size: 18, y: 750 },
    { text: "PAYSLIP", size: 14, y: 720 },
    { text: `Statement Month: ${payslip.month}`, size: 11, y: 685 },
    { text: `Employee ID: ${payslip.employeeId}`, size: 11, y: 665 },
    { text: `Payslip ID: ${payslip.id}`, size: 11, y: 645 },
    { text: "EARNINGS AND DEDUCTIONS", size: 12, y: 600 },
    { text: `Gross Salary: ${formatAmount(payslip.grossPay)}`, size: 11, y: 570 },
    { text: `Total Deductions: ${formatAmount(payslip.deduction)}`, size: 11, y: 545 },
    { text: `Net Take-Home Pay: ${formatAmount(payslip.netPay)}`, size: 12, y: 510 },
    { text: `Payment Status: ${payslip.status}`, size: 11, y: 475 },
    { text: `Generated on: ${new Date().toLocaleDateString("en-IN")}`, size: 10, y: 80 },
    { text: "This is a system-generated payslip.", size: 9, y: 60 },
  ];

  const content = lines
    .map(({ text, size, y }) => `BT /F1 ${size} Tf 50 ${y} Td (${escapePdfText(text)}) Tj ET`)
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function downloadPayslip(payslip: Payslip) {
  const url = URL.createObjectURL(createPayslipPdf(payslip));
  const link = document.createElement("a");
  link.href = url;
  link.download = `payslip-${payslip.employeeId}-${payslip.month.replace(/\s+/g, "-")}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function EmployeePayrollView({ payslips, isLoading }: Props) {
  const currentPayslip = payslips.length > 0 ? payslips[0] : null;

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
      renderCell: (row) => (
        <span className="font-mono text-sm font-semibold text-destructive">
          ₹{row.deduction.toLocaleString()}
        </span>
      ),
    },
    {
      key: "netPay",
      label: "Net Take-Home Pay",
      renderCell: (row) => (
        <span className="font-mono text-sm font-bold text-primary">₹{row.netPay.toLocaleString()}</span>
      ),
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
          onClick={() => downloadPayslip(row)}
          title="Download Payslip PDF"
          aria-label={`Download ${row.month} payslip`}
        >
          <Download className="size-4 text-muted-foreground hover:text-foreground" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monthly Gross Salary"
          value={currentPayslip ? `₹${currentPayslip.grossPay.toLocaleString()}` : "₹0"}
          icon={DollarSign}
          trend={{ value: "CTC Base", direction: "up", label: "salary" }}
        />
        <StatCard
          label="Deductions"
          value={currentPayslip ? `₹${currentPayslip.deduction.toLocaleString()}` : "₹0"}
          icon={Percent}
          iconClassName="bg-destructive/10 text-destructive"
          trend={{ value: "PF & Tax", direction: "down", label: "deductions" }}
        />
        <StatCard
          label="Net Take-Home Pay"
          value={currentPayslip ? `₹${currentPayslip.netPay.toLocaleString()}` : "₹0"}
          icon={CreditCard}
          iconClassName="bg-primary/10 text-primary"
          trend={{ value: "Direct Deposit", direction: "up", label: "bank account" }}
        />
        <StatCard
          label="Annual Bonus"
          value="₹45,000" // Hardcoded for demo
          icon={DollarSign}
          iconClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
          trend={{ value: "Accrued", direction: "up", label: "financial year" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DataTable
            columns={payslipColumns}
            data={payslips}
            rowKey="id"
            isLoading={isLoading}
            skeletonRows={3}
            emptyTitle="No Payslips Found"
            emptyDescription="No payroll statement has been generated for your profile yet."
          />
        </div>

        <div className="space-y-6">
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
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">IFSC Code</p>
                  <p className="text-sm font-mono font-semibold text-foreground">HDFC0001092</p>
                </div>
              </div>
            </div>
          </SectionCard>

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
                  <Percent className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Tax Regime Preference</p>
                  <p className="text-sm font-semibold text-foreground">New Tax Regime</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
