"use client";

import React, { useEffect, useState } from "react";
import { Landmark, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { payrollService } from "@/services/payroll.service";
import type { BankDetails } from "@/types/payroll";
import { PageHeader, SectionCard, PageLoader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BankDetailsPage() {
  const { user } = useAuth();
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [reason, setReason] = useState("");

  const fetchData = async () => {
    if (!user) return;
    const data = await payrollService.getBankDetails(user.uid);
    setBank(data);
    setLoading(false);
    
    // Pre-fill form
    if (data) {
      setAccountHolder(data.accountHolder);
      setBankName(data.bankName);
      setBranch(data.branch);
      setIfsc(data.ifsc);
      setAccountNumber(data.accountNumber);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!reason) {
      toast.error("Please provide a reason for the update request.");
      return;
    }

    setIsSubmitting(true);
    try {
      await payrollService.requestBankUpdate(user.uid, {
        accountHolder,
        bankName,
        branch,
        ifsc,
        accountNumber,
      }, reason);
      toast.success("Bank update request submitted to HR.");
      setIsUpdateOpen(false);
      await fetchData(); // Refresh data to show pending status
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!bank) return <PageLoader />;

  // Mask account number
  const maskedAccount = bank.accountNumber 
    ? `•••• •••• ${bank.accountNumber.slice(-4)}`
    : "Not Provided";

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader 
        title="Bank Details" 
        subtitle="Your direct deposit salary account information" 
        action={
          <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
            <DialogTrigger
              render={
                <Button size="sm" variant="outline" className="rounded-xl font-semibold cursor-pointer">
                  Request Update
                </Button>
              }
            />
            <DialogContent className="max-w-md rounded-2xl border border-border bg-card text-card-foreground shadow-lg focus-visible:outline-hidden">
              <DialogHeader className="pb-3 border-b border-border">
                <DialogTitle className="text-xl font-bold text-foreground">
                  Update Bank Details
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmitRequest} className="space-y-4 pt-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground/90">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground/90">Branch Name</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground/90">Account Holder Name</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-foreground/90">Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-foreground/90">IFSC Code</label>
                    <input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground/90">Reason for Change *</label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Switched primary bank account"
                    className="flex w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs transition-colors resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUpdateOpen(false)}
                    className="h-9 rounded-xl cursor-pointer"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 rounded-xl cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <SectionCard title="Salary Account" description="Primary account for payroll disbursement">
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Landmark className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{bank.bankName}</p>
              <p className="text-xs text-muted-foreground">{bank.branch}</p>
            </div>
            <Badge
              className={cn(
                "border-0 text-[10px] font-bold px-2 py-0.5 rounded-md",
                bank.status === "Approved"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : bank.status === "Pending"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {bank.status === "Approved" ? "Active" : bank.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 px-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Account Holder Name</p>
              <p className="text-sm font-semibold text-foreground">{bank.accountHolder}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Account Number</p>
              <p className="text-sm font-mono font-semibold text-foreground">{maskedAccount}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">IFSC Code</p>
              <p className="text-sm font-mono font-semibold text-foreground">{bank.ifsc}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Salary Account</p>
              <p className="text-sm font-semibold text-foreground">Yes</p>
            </div>
          </div>
        </div>
      </SectionCard>

      {bank.status === "Pending" && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Update Request Pending</h4>
            <p className="text-xs mt-1 leading-relaxed opacity-90">
              You have a pending request to update your bank details. Changes will reflect here once HR approves them. Salary processing will continue using your currently active account until then.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
