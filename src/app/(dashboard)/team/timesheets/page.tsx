"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, FileBadge2, MessageSquareWarning } from "lucide-react";
import { PageContainer, PageHeader, DataTable, type Column } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { timesheetService } from "@/services/timesheet.service";
import type { TimesheetSubmission } from "@/types/timesheet";
import { format } from "date-fns";

export default function TeamTimesheetsPage() {
  const [submissions, setSubmissions] = useState<TimesheetSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const pending = await timesheetService.getAllPendingSubmissions();
      // Normally we would filter by managerId here.
      setSubmissions(pending);
    } catch (error) {
      toast.error("Failed to fetch pending timesheets.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (id: string, action: "Approved" | "Rejected" | "Returned") => {
    try {
      let reason;
      if (action !== "Approved") {
        reason = prompt(`Enter reason for ${action.toLowerCase()}:`);
        if (!reason) return; // cancelled
      }
      
      await timesheetService.updateSubmissionStatus(id, action, reason);
      toast.success(`Timesheet ${action.toLowerCase()} successfully!`);
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} timesheet.`);
    }
  };

  const columns: Column<TimesheetSubmission>[] = [
    {
      key: "employeeName",
      label: "Employee",
      width: "200px",
      renderCell: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.employeeName}</div>
          <div className="text-xs text-muted-foreground">{row.employeeId}</div>
        </div>
      ),
    },
    {
      key: "week",
      label: "Week Period",
      width: "200px",
      renderCell: (row) => (
        <span className="text-sm font-medium">
          {format(new Date(row.weekStartDate), "dd MMM")} - {format(new Date(row.weekEndDate), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      key: "totalHours",
      label: "Total Hours",
      width: "120px",
      align: "center",
      renderCell: (row) => (
        <span className="font-mono font-bold text-sm bg-muted px-2 py-1 rounded-md">
          {row.totalHours} hrs
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "140px",
      renderCell: (row) => (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "280px",
      align: "right",
      renderCell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-emerald-600 border-emerald-600/30 hover:bg-emerald-50 cursor-pointer"
            onClick={() => handleAction(row.id, "Approved")}
          >
            <CheckCircle2 className="size-4 mr-1.5" /> Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-amber-600 border-amber-600/30 hover:bg-amber-50 cursor-pointer"
            onClick={() => handleAction(row.id, "Returned")}
          >
            <MessageSquareWarning className="size-4 mr-1.5" /> Return
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer"
            onClick={() => handleAction(row.id, "Rejected")}
          >
            <XCircle className="size-4 mr-1.5" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Timesheet Approvals"
        subtitle="Review and approve your team's weekly timesheet submissions"
      />

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={submissions}
          rowKey="id"
          isLoading={isLoading}
          emptyTitle="No Pending Approvals"
          emptyDescription="Your team has no timesheets waiting for your review."
        />
      </div>
    </PageContainer>
  );
}
