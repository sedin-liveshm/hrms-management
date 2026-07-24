"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { timesheetService } from "@/services/timesheet.service";
import type { TimesheetLog, TimesheetSummary, TimesheetSubmission } from "@/types/timesheet";
import { TimesheetSummaryCards } from "@/components/timesheet/TimesheetSummaryCards";
import { WeeklyTimesheetGrid } from "@/components/timesheet/WeeklyTimesheetGrid";
import { AddTimesheetRowDialog } from "@/components/timesheet/AddTimesheetRowDialog";
import { startOfWeek, addWeeks, subWeeks, format } from "date-fns";

export default function TimesheetPage() {
  const { user } = useAuth();
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [entries, setEntries] = useState<TimesheetLog[]>([]);
  const [submissions, setSubmissions] = useState<TimesheetSubmission[]>([]);
  const [summary, setSummary] = useState<TimesheetSummary>({
    totalHours: 0,
    billableHours: 0,
    pendingHours: 0,
    uniqueProjects: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingWeek, setIsSubmittingWeek] = useState(false);
  const [isAddRowOpen, setIsAddRowOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const logs = await timesheetService.getEmployeeTimesheets(user.uid);
      const subs = await timesheetService.getEmployeeSubmissions(user.uid);
      const summ = await timesheetService.getTimesheetSummary(user.uid, currentWeekStart);
      setEntries(logs);
      setSubmissions(subs);
      setSummary(summ);
    } catch (error: any) {
      toast.error("Failed to fetch timesheet data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentWeekStart]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateLog = async (logId: string | null, dateStr: string, project: string, task: string, hours: number, comments: string) => {
    if (!user) return;
    try {
      if (logId) {
        await timesheetService.updateDailyTime(logId, { hours, comments });
      } else {
        if (hours > 0 || comments) {
          await timesheetService.logTime({
            uid: user.uid,
            employeeId: user.employeeId || "EMP-N/A",
            employeeName: user.name || "Unknown",
            project,
            task,
            date: dateStr,
            hours,
            comments,
          });
        }
      }
      fetchData(); // In a real app, do optimistic updates instead
    } catch (error: any) {
      toast.error(error.message || "Failed to update time.");
    }
  };

  const handleAddNewRow = (project: string, task: string) => {
    // Just create a 0 hour entry for today to lock in the row, or let the grid just show it.
    // Since our grid computes rows from `entries`, we need at least one entry.
    if (!user) return;
    timesheetService.logTime({
      uid: user.uid,
      employeeId: user.employeeId || "EMP-N/A",
      employeeName: user.name || "Unknown",
      project,
      task,
      date: format(currentWeekStart, "yyyy-MM-dd"), // put it on Monday as 0 hours
      hours: 0,
      comments: "Added row",
    }).then(() => fetchData());
  };

  const handleDeleteRow = async (project: string, task: string) => {
    if (!user) return;
    if (confirm(`Are you sure you want to remove ${project} - ${task} from this week's timesheet?`)) {
      try {
        await timesheetService.deleteProjectRow(user.uid, project, task, currentWeekStart);
        toast.success("Row removed successfully.");
        fetchData();
      } catch (error: any) {
        toast.error(error.message || "Failed to remove row.");
      }
    }
  };

  const handleSubmitWeekly = async () => {
    if (!user) return;
    setIsSubmittingWeek(true);
    try {
      await timesheetService.submitWeeklyTimesheet(user.uid, user.name || "Unknown", currentWeekStart);
      toast.success("Timesheet submitted to Manager for approval!");
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit weekly timesheet.");
    } finally {
      setIsSubmittingWeek(false);
    }
  };

  const weekStartStr = format(currentWeekStart, "yyyy-MM-dd");
  const currentSubmission = submissions.find(s => s.weekStartDate === weekStartStr);

  return (
    <PageContainer>
      <PageHeader
        title="Timesheet"
        subtitle="Manage your daily logs and weekly submissions"
        action={
          <div className="flex items-center gap-3">
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-1.5 rounded-xl cursor-pointer"
              onClick={handleSubmitWeekly}
              disabled={isSubmittingWeek || isLoading || currentSubmission?.status === "Pending Manager" || currentSubmission?.status === "Approved"}
            >
              <CalendarCheck className="size-4" />
              {isSubmittingWeek ? "Submitting..." : "Submit Weekly"}
            </Button>
          </div>
        }
      />

      <div className="mt-2 mb-6">
        <TimesheetSummaryCards summary={summary} />
      </div>

      <div className="flex items-center justify-between mb-4 bg-card p-3 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <div className="font-semibold text-sm">
            {format(currentWeekStart, "dd MMM yyyy")} - {format(addWeeks(currentWeekStart, 1), "dd MMM yyyy")}
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <WeeklyTimesheetGrid 
        logs={entries} 
        currentWeekStart={currentWeekStart}
        onUpdateLog={handleUpdateLog}
        onAddNewRow={() => setIsAddRowOpen(true)}
        onDeleteRow={handleDeleteRow}
        isSubmitting={isSubmittingWeek || isLoading}
        submissionStatus={currentSubmission?.status}
      />

      <AddTimesheetRowDialog 
        isOpen={isAddRowOpen} 
        onClose={() => setIsAddRowOpen(false)} 
        onAdd={handleAddNewRow} 
      />
    </PageContainer>
  );
}
