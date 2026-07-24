"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { PageContainer, PageHeader, DataTable, type Column } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { timesheetService } from "@/services/timesheet.service";
import type { TimesheetSubmission } from "@/types/timesheet";
import { format } from "date-fns";

export default function AllTimesheetsPage() {
  const [submissions, setSubmissions] = useState<TimesheetSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // For mock, we'll just get all pending. In real app, we get ALL submissions with filters.
      const pending = await timesheetService.getAllPendingSubmissions();
      setSubmissions(pending);
    } catch (error) {
      toast.error("Failed to fetch timesheets.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        <Badge className="bg-muted text-muted-foreground border-0">
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="All Timesheets"
        subtitle="Master view of all employee timesheet submissions across the organization"
      />

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={submissions}
          rowKey="id"
          isLoading={isLoading}
          emptyTitle="No Submissions Found"
          emptyDescription="There are currently no timesheets in the system."
        />
      </div>
    </PageContainer>
  );
}
