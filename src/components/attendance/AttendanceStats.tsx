"use client";

import { StatCard } from "@/components/common";
import { CheckCircle2, UserX, Clock, Home, Percent } from "lucide-react";
import type { AttendanceSummary } from "@/types/attendance";

interface AttendanceStatsProps {
  summary: AttendanceSummary | null;
  isLoading?: boolean;
}

export function AttendanceStats({ summary, isLoading = false }: AttendanceStatsProps) {
  // Safe fallbacks for statistics
  const present = summary?.presentCount ?? 0;
  const absent = summary?.absentCount ?? 0;
  const late = summary?.lateCount ?? 0;
  const wfh = summary?.wfhCount ?? 0;
  const halfDay = summary?.halfDayCount ?? 0;
  const percentage = summary?.attendancePercentage ?? 100;

  // Present Days count includes normal Present, Late (is present), WFH (is present), and Half Days (present part-time)
  const totalPresentCount = present + late + wfh + halfDay;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Present Days"
        value={isLoading ? "—" : totalPresentCount}
        icon={CheckCircle2}
        iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
      />
      <StatCard
        label="Late Days"
        value={isLoading ? "—" : late}
        icon={Clock}
        iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
      />
      <StatCard
        label="Work From Home"
        value={isLoading ? "—" : wfh}
        icon={Home}
        iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
      />
      <StatCard
        label="Absent Days"
        value={isLoading ? "—" : absent}
        icon={UserX}
        iconClassName="bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
      />
      <StatCard
        label="Attendance Rate"
        value={isLoading ? "—" : `${percentage}%`}
        icon={Percent}
        iconClassName="bg-primary/10 text-primary"
        trend={{
          value: percentage >= 90 ? "Excellent" : percentage >= 75 ? "Good" : "Needs Attention",
          direction: percentage >= 90 ? "up" : percentage >= 75 ? "neutral" : "down",
          label: ""
        }}
      />
    </div>
  );
}
