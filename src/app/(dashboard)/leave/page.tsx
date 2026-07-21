"use client";

import { useState } from "react";
import { Plus, RefreshCw, Calendar, List, LayoutDashboard, AlertCircle } from "lucide-react";
import { LEAVE_TYPE_LABELS } from "@/types/leave";
import { format } from "date-fns";
import {
  PageContainer,
  PageHeader,
  ErrorState,
  SectionCard,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLeave } from "@/hooks/useLeave";
import { LeaveSummary } from "@/components/leave/LeaveSummary";
import { LeaveBalanceCard } from "@/components/leave/LeaveBalanceCard";
import { LeaveFilters } from "@/components/leave/LeaveFilters";
import { LeaveTable } from "@/components/leave/LeaveTable";
import { LeaveCalendar } from "@/components/leave/LeaveCalendar";
import { LeaveForm } from "@/components/leave/LeaveForm";
import { LeaveDetailsDrawer } from "@/components/leave/LeaveDetailsDrawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { LeaveRequest } from "@/types/leave";

export default function LeavePage() {
  const {
    leaveHistory,
    summary,
    balances,
    loading,
    error,
    filters,
    applyLeave,
    cancelLeave,
    updateFilters,
    refresh,
  } = useLeave();

  // Helper to convert Timestamps safely
  const toDate = (ts: any): Date => {
    if (!ts) return new Date();
    if (ts instanceof Date) return ts;
    if (typeof ts.toDate === "function") return ts.toDate();
    if (typeof ts.seconds === "number") return new Date(ts.seconds * 1000);
    return new Date(ts);
  };

  // State for modals and drawers
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [leaveToCancel, setLeaveToCancel] = useState<LeaveRequest | null>(null);

  const handleOpenDetails = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setIsDetailsOpen(true);
  };

  const handleCancelClick = (leave: LeaveRequest) => {
    setLeaveToCancel(leave);
  };

  const handleConfirmCancel = async () => {
    if (!leaveToCancel) return;
    try {
      await cancelLeave(leaveToCancel.id);
      setLeaveToCancel(null);
    } catch (e) {
      console.error(e);
    }
  };

  if (error) {
    return (
      <PageContainer>
        <ErrorState
          title="Error loading leave records"
          description={error}
          onRetry={refresh}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Leave Portal"
        subtitle="Manage your personal time off requests and view leave balances."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
              className="size-9 p-0"
              aria-label="Refresh data"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button size="sm" onClick={() => setIsApplyOpen(true)} className="gap-1.5 bg-primary text-primary-foreground">
              <Plus className="size-4" />
              Apply Leave
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard" className="gap-1.5 text-xs">
            <LayoutDashboard className="size-3.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5 text-xs">
            <List className="size-3.5" />
            Leave History
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5 text-xs">
            <Calendar className="size-3.5" />
            Leave Calendar
          </TabsTrigger>
        </TabsList>

        {/* DASHBOARD TAB CONTENT */}
        <TabsContent value="dashboard" className="space-y-6 outline-none">
          <LeaveSummary summary={summary} isLoading={loading} showRemaining={true} />
          
          <SectionCard title="Leave Balances" description="Deduction breakdowns for the current calendar year.">
            <LeaveBalanceCard balances={balances} isLoading={loading} />
          </SectionCard>
          
          {/* Upcoming Holiday/Quick Guide Widget */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SectionCard title="Company Leave Guidelines" description="Important rules on leave policy.">
              <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4">
                <li>Submit sick leave requests within 24 hours of resuming work.</li>
                <li>Earned leaves require at least 5 business days advance notice.</li>
                <li>Half-day leaves can only be applied for the current or future dates.</li>
                <li>Weekends (Saturday & Sunday) are automatically excluded from leave count deductions.</li>
              </ul>
            </SectionCard>

            <SectionCard title="Upcoming Public Holidays" description="Scheduled company holidays.">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
                  <span className="font-medium text-foreground">Republic Day</span>
                  <span className="text-muted-foreground">January 26, 2026</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
                  <span className="font-medium text-foreground">Independence Day</span>
                  <span className="text-muted-foreground">August 15, 2026</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-border/40 pb-2">
                  <span className="font-medium text-foreground">Gandhi Jayanti</span>
                  <span className="text-muted-foreground">October 02, 2026</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Christmas Day</span>
                  <span className="text-muted-foreground">December 25, 2026</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        {/* HISTORY TAB CONTENT */}
        <TabsContent value="history" className="space-y-4 outline-none">
          <LeaveFilters filters={filters} onFilterChange={updateFilters} showTeamFilters={false} />
          
          <SectionCard title="My Leave History" description="Filter and search through your past requests.">
            <LeaveTable
              data={leaveHistory}
              isLoading={loading}
              onViewDetails={handleOpenDetails}
              onCancel={handleCancelClick}
              showEmployeeColumn={false}
            />
          </SectionCard>
        </TabsContent>

        {/* CALENDAR TAB CONTENT */}
        <TabsContent value="calendar" className="outline-none">
          <LeaveCalendar leaves={leaveHistory} onViewLeave={handleOpenDetails} />
        </TabsContent>
      </Tabs>

      {/* Leave Application Drawer */}
      <LeaveForm
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSubmit={applyLeave}
      />

      {/* Details Drawer */}
      <LeaveDetailsDrawer
        leave={selectedLeave}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedLeave(null);
        }}
        onCancel={handleCancelClick}
      />

      {/* Cancellation Confirmation Dialog */}
      <Dialog open={!!leaveToCancel} onOpenChange={(open) => !open && setLeaveToCancel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5" />
              Cancel Leave Request
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to cancel this pending leave request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {leaveToCancel && (
            <div className="rounded-xl border border-border bg-card/60 p-4 text-xs space-y-1.5">
              <p><strong className="font-semibold">Type:</strong> {LEAVE_TYPE_LABELS[leaveToCancel.leaveType]}</p>
              <p>
                <strong className="font-semibold">Dates:</strong> {format(toDate(leaveToCancel.startDate), "dd MMM")} to {format(toDate(leaveToCancel.endDate), "dd MMM yyyy")} ({leaveToCancel.totalDays} day{leaveToCancel.totalDays > 1 ? "s" : ""})
              </p>
              <p><strong className="font-semibold">Reason:</strong> "{leaveToCancel.reason}"</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setLeaveToCancel(null)} className="text-xs">
              Keep Request
            </Button>
            <Button variant="destructive" size="sm" onClick={handleConfirmCancel} className="text-xs">
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
