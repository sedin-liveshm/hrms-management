import React from "react";
import { Timer, Briefcase, Clock, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/common";
import type { TimesheetSummary } from "@/types/timesheet";
interface Props {
  summary: TimesheetSummary;
}
export function TimesheetSummaryCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="This Week Hours"
        value={`${summary.totalHours} hrs`}
        icon={Clock}
        trend={{ value: "Target: 40 hrs", direction: "up", label: "logged" }}
      />
      <StatCard
        label="Billable Hours"
        value={`${summary.billableHours} hrs`}
        icon={Timer}
        iconClassName="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
        trend={{
          value: `${Math.round((summary.billableHours / (summary.totalHours || 1)) * 100)}%`,
          direction: "up",
          label: "utilization",
        }}
      />
      <StatCard
        label="Pending Approval"
        value={`${summary.pendingHours} hrs`}
        icon={AlertCircle}
        iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
        trend={{ value: "Awaiting review", direction: "down", label: "by manager" }}
      />
      <StatCard
        label="Projects Worked"
        value={String(summary.uniqueProjects)}
        icon={Briefcase}
        iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
        trend={{ value: "Active allocations", direction: "up", label: "on files" }}
      />
    </div>
  );
}
