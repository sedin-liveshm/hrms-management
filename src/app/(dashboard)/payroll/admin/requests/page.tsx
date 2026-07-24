"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, FileBadge2 } from "lucide-react";
import { payrollService } from "@/services/payroll.service";
import type { BankDetails } from "@/types/payroll";
import { PageHeader, SectionCard, PageLoader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function BankRequestsPage() {
  const [requests, setRequests] = useState<BankDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const data = await payrollService.getPendingBankRequests();
    setRequests(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (uid: string) => {
    try {
      await payrollService.approveBankRequest(uid);
      toast.success("Bank details approved successfully.");
      fetchRequests();
    } catch (error) {
      toast.error("Failed to approve request.");
    }
  };

  const handleReject = async (uid: string) => {
    try {
      await payrollService.rejectBankRequest(uid);
      toast.success("Bank details rejected.");
      fetchRequests();
    } catch (error) {
      toast.error("Failed to reject request.");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Bank Update Requests" 
        subtitle="Review and approve employee salary account changes" 
      />

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center border border-border border-dashed rounded-xl bg-card/50">
          <FileBadge2 className="size-12 text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-lg font-bold text-foreground">No Pending Requests</h2>
          <p className="text-sm text-muted-foreground mt-2">
            All employee bank detail updates have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <SectionCard key={req.uid} title="Bank Details Request" className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Employee ID</p>
                    <p className="text-sm font-semibold">EMP-{req.uid.substring(0,4).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Account Holder</p>
                    <p className="text-sm font-semibold">{req.accountHolder}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Bank & Branch</p>
                    <p className="text-sm font-semibold">{req.bankName}, {req.branch}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Account & IFSC</p>
                    <p className="text-sm font-mono font-semibold">{req.accountNumber} <br/><span className="text-xs text-muted-foreground">{req.ifsc}</span></p>
                  </div>
                  <div className="col-span-2 lg:col-span-4">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Employee Reason</p>
                    <p className="text-sm font-medium">{req.updateReason || "No reason provided."}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-border md:pl-6 md:border-l">
                  <Button 
                    onClick={() => handleReject(req.uid)}
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                  >
                    <XCircle className="size-4" /> Reject
                  </Button>
                  <Button 
                    onClick={() => handleApprove(req.uid)}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                  >
                    <CheckCircle2 className="size-4" /> Approve
                  </Button>
                </div>

              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
