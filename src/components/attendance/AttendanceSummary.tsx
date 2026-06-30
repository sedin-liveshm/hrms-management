"use client";

import { CheckInCard } from "./CheckInCard";
import { CheckOutCard } from "./CheckOutCard";
import { AttendanceStats } from "./AttendanceStats";
import { AttendanceCalendar } from "./AttendanceCalendar";
import { AttendanceTable } from "./AttendanceTable";
import { SectionCard } from "@/components/common";
import type { AttendanceRecord, AttendanceSummary as SummaryType } from "@/types/attendance";

interface AttendanceSummaryProps {
  attendance: AttendanceRecord[];
  summary: SummaryType | null;
  todayRecord: AttendanceRecord | null;
  onCheckIn: () => Promise<void>;
  onCheckOut: () => Promise<void>;
  isLoading?: boolean;
  isMutating?: boolean;
  showActions?: boolean;
  isAdmin?: boolean;
  onEditClick?: (record: AttendanceRecord) => void;
}

export function AttendanceSummary({
  attendance,
  summary,
  todayRecord,
  onCheckIn,
  onCheckOut,
  isLoading = false,
  isMutating = false,
  showActions = true,
  isAdmin = false,
  onEditClick,
}: AttendanceSummaryProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Live Check-In / Check-Out Actions Panel */}
      {showActions && (
        <div className="w-full">
          {todayRecord ? (
            <CheckOutCard record={todayRecord} onCheckOut={onCheckOut} isLoading={isMutating} />
          ) : (
            <CheckInCard onCheckIn={onCheckIn} isLoading={isMutating} />
          )}
        </div>
      )}

      {/* 2. Key Metrics Summary Grid */}
      <AttendanceStats summary={summary} isLoading={isLoading} />

      {/* 3. Detailed Split View (Calendar & Table Logs) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Monthly Calendar View */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <SectionCard title="Attendance Calendar" description="Monthly color-coded attendance grid" noPadding>
            <AttendanceCalendar data={attendance} isLoading={isLoading} />
          </SectionCard>
        </div>

        {/* Right Column: Historical Logs Table */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <SectionCard title="Attendance History" description="Detailed check-in/out logs" noPadding>
            <AttendanceTable
              data={attendance}
              isLoading={isLoading}
              showEmployeeColumn={false} // Hidden for personal log summary
              isAdmin={isAdmin}
              onEditClick={onEditClick}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
