"use client";

import { useState } from "react";
import { RefreshCw, ClipboardCheck, History, Users, AlertCircle } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  SectionCard,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLeave } from "@/hooks/useLeave";
import { useAuth } from "@/hooks/useAuth";
import { LeaveSummary } from "@/components/leave/LeaveSummary";
import { LeaveFilters } from "@/components/leave/LeaveFilters";
import { LeaveTable } from "@/components/leave/LeaveTable";
import { LeaveDetailsDrawer } from "@/components/leave/LeaveDetailsDrawer";
import { LeaveApprovalDialog } from "@/components/leave/LeaveApprovalDialog";
import { LeaveRejectDialog } from "@/components/leave/LeaveRejectDialog";
import { RoleGuard } from "@/components/auth/RoleGuard";
import type { LeaveRequest } from "@/types/leave";

export default function LeaveApprovalPage() {
  const { user, role } = useAuth();
  
  // Custom hook for leaves, using initial filters or let hook load all organization leaves
  const {
    leaveHistory,
    pendingLeaves,
    summary,
    loading,
    updateFilters,
    filters,
    approveLeave,
    rejectLeave,
    refresh,
  } = useLeave();

  // Dialog and drawer states
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<LeaveRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<LeaveRequest | null>(null);

  // Handlers
  const handleOpenDetails = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setIsDetailsOpen(true);
  };

  const handleApproveClick = (leave: LeaveRequest) => {
    setApproveTarget(leave);
  };

  const handleRejectClick = (leave: LeaveRequest) => {
    setRejectTarget(leave);
  };

  const handleConfirmApprove = async (comments: string) => {
    if (!approveTarget) return;
    try {
      await approveLeave(approveTarget.id, comments);
      setApproveTarget(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmReject = async (rejectionReason: string, comments: string) => {
    if (!rejectTarget) return;
    try {
      await rejectLeave(rejectTarget.id, rejectionReason, comments);
      setRejectTarget(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter history requests to show only team members (if manager) or everyone (if HR/Admin)
  // Also filters out currently pending items from the history list to keep them distinct
  const teamHistory = leaveHistory.filter((l) => {
    const isPending = l.status === "pending";
    if (isPending) return false; // Hide pending items from history tab

    if (role === "manager") {
      // Manager should only see their team leaves
      return l.managerId === user?.uid;
    }
    return true; // HR and Admin see all organization history
  });

  // Similarly filter pending leaves for display (already partially filtered in hook, but let's be double sure)
  const teamPending = pendingLeaves.filter((l) => {
    if (role === "manager") {
      return l.managerId === user?.uid;
    }
    return true;
  });

  return (
    <RoleGuard roles={["admin", "hr", "manager"]} fallback={
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-96 gap-3">
          <AlertCircle className="size-12 text-destructive" />
          <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground">You do not have permission to view team approvals.</p>
        </div>
      </PageContainer>
    }>
      <PageContainer>
        <PageHeader
          title="Team Leave Approvals"
          subtitle="Review and process leave applications submitted by your team members."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          }
        />

        {/* Aggregate statistics showing total team statistics */}
        <div className="mb-6">
          <LeaveSummary summary={summary} isLoading={loading} showRemaining={false} />
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="gap-1.5 text-xs">
              <ClipboardCheck className="size-3.5" />
              Pending Reviews ({teamPending.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs">
              <History className="size-3.5" />
              Workflow History ({teamHistory.length})
            </TabsTrigger>
          </TabsList>

          {/* PENDING REVIEWS TAB */}
          <TabsContent value="pending" className="space-y-4 outline-none">
            <SectionCard
              title="Pending Applications"
              description="Review leave requests requiring your decision. Action items are highlighted."
            >
              <LeaveTable
                data={teamPending}
                isLoading={loading}
                onViewDetails={handleOpenDetails}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                showEmployeeColumn={true}
              />
            </SectionCard>
          </TabsContent>

          {/* WORKFLOW HISTORY TAB */}
          <TabsContent value="history" className="space-y-4 outline-none">
            <LeaveFilters filters={filters} onFilterChange={updateFilters} showTeamFilters={role === "hr" || role === "admin" || role === "manager"} />
            
            <SectionCard
              title="Leave History Log"
              description="Historical record of processed leave decisions across your management scope."
            >
              <LeaveTable
                data={teamHistory}
                isLoading={loading}
                onViewDetails={handleOpenDetails}
                showEmployeeColumn={true}
              />
            </SectionCard>
          </TabsContent>
        </Tabs>

        {/* Leave Details Drawer */}
        <LeaveDetailsDrawer
          leave={selectedLeave}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedLeave(null);
          }}
          onApprove={(id) => {
            const req = teamPending.find((l) => l.id === id);
            if (req) handleApproveClick(req);
          }}
          onReject={(id) => {
            const req = teamPending.find((l) => l.id === id);
            if (req) handleRejectClick(req);
          }}
        />

        {/* Confirm Approval Dialog */}
        <LeaveApprovalDialog
          isOpen={!!approveTarget}
          onClose={() => setApproveTarget(null)}
          onConfirm={handleConfirmApprove}
          employeeName={approveTarget?.employeeName || ""}
        />

        {/* Mandatory Reason Reject Dialog */}
        <LeaveRejectDialog
          isOpen={!!rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleConfirmReject}
          employeeName={rejectTarget?.employeeName || ""}
        />
      </PageContainer>
    </RoleGuard>
  );
}
