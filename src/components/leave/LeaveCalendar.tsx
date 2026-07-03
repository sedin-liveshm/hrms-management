"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Umbrella, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEAVE_TYPE_LABELS, type LeaveRequest, type LeaveStatus } from "@/types/leave";

interface LeaveCalendarProps {
  leaves: LeaveRequest[];
  onViewLeave: (leave: LeaveRequest) => void;
}

interface HolidayPlaceholder {
  dateStr: string; // MM-DD format
  name: string;
}

// Fixed placeholder holidays
const HOLIDAYS: HolidayPlaceholder[] = [
  { dateStr: "01-01", name: "New Year's Day" },
  { dateStr: "01-26", name: "Republic Day" },
  { dateStr: "05-01", name: "Labour Day" },
  { dateStr: "08-15", name: "Independence Day" },
  { dateStr: "10-02", name: "Gandhi Jayanti" },
  { dateStr: "12-25", name: "Christmas Day" },
];

export function LeaveCalendar({ leaves, onViewLeave }: LeaveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDay = startOfWeek(monthStart, { weekStartsOn: 1 }); // Week starts on Monday
  const endDay = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Get all days within the grid range (typically 35 or 42 days)
  const daysGrid = eachDayOfInterval({ start: startDay, end: endDay });

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Date helper
  const toDate = (ts: any): Date => {
    if (!ts) return new Date();
    if (ts instanceof Date) return ts;
    if (typeof ts.toDate === "function") return ts.toDate();
    if (typeof ts.seconds === "number") return new Date(ts.seconds * 1000);
    return new Date(ts);
  };

  // Check if a day has leaves
  const getLeavesForDay = (day: Date): LeaveRequest[] => {
    return leaves.filter((l) => {
      const start = toDate(l.startDate);
      const end = toDate(l.endDate);
      
      // Zero out hours for precise day comparison
      const checkDay = new Date(day);
      checkDay.setHours(0,0,0,0);
      const s = new Date(start);
      s.setHours(0,0,0,0);
      const e = new Date(end);
      e.setHours(0,0,0,0);

      return checkDay >= s && checkDay <= e;
    });
  };

  // Check if a day is a holiday
  const getHolidayForDay = (day: Date): string | null => {
    const formattedDate = format(day, "MM-dd");
    const h = HOLIDAYS.find((holiday) => holiday.dateStr === formattedDate);
    return h ? h.name : null;
  };

  // Color mappings for leave statuses in calendar
  const statusColorMap: Record<LeaveStatus, { bg: string; text: string; dot: string }> = {
    pending: {
      bg: "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20",
      text: "text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    approved: {
      bg: "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    rejected: {
      bg: "bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20",
      text: "text-rose-700 dark:text-rose-400",
      dot: "bg-rose-500",
    },
    cancelled: {
      bg: "bg-neutral-100 hover:bg-neutral-200 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-400",
      text: "text-neutral-600 dark:text-neutral-400",
      dot: "bg-neutral-400",
    },
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Calendar Header Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-border p-4 gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-5 text-primary" />
          <h2 className="text-sm font-bold text-foreground">
            {format(currentDate, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="xs" onClick={handlePrevMonth} aria-label="Previous Month">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="xs" onClick={handleToday} className="text-xs">
            Today
          </Button>
          <Button variant="outline" size="xs" onClick={handleNextMonth} aria-label="Next Month">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Labels Header */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-center text-xs font-semibold text-muted-foreground py-2.5">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div className="text-rose-500/80">Sat</div>
        <div className="text-rose-500/80">Sun</div>
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-border/60 border-l border-t border-border/10">
        {daysGrid.map((day, idx) => {
          const leavesOnDay = getLeavesForDay(day);
          const holidayName = getHolidayForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const isTodayDay = isToday(day);

          return (
            <div
              key={day.toISOString() + idx}
              className={`min-h-24 p-2 flex flex-col justify-between transition-colors ${
                !isCurrentMonth
                  ? "bg-muted/10 text-muted-foreground/40"
                  : isWeekend
                  ? "bg-rose-500/[0.01]"
                  : "bg-card"
              } ${isTodayDay ? "ring-1 ring-primary ring-inset bg-primary/[0.02]" : ""}`}
            >
              {/* Day Number Row */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold rounded-full size-6 flex items-center justify-center ${
                    isTodayDay
                      ? "bg-primary text-primary-foreground"
                      : !isCurrentMonth
                      ? "text-muted-foreground/30"
                      : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>
                
                {/* Holiday label */}
                {holidayName && (
                  <span className="text-[9px] font-medium bg-red-500/10 text-red-600 px-1.5 py-0.5 rounded-md truncate max-w-16">
                    {holidayName}
                  </span>
                )}
              </div>

              {/* Day events (Leaves list) */}
              <div className="mt-1 space-y-1 overflow-y-auto max-h-16 scrollbar-thin">
                {leavesOnDay.map((l) => {
                  const style = statusColorMap[l.status] || statusColorMap.pending;
                  return (
                    <div
                      key={l.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewLeave(l);
                      }}
                      className={`flex items-center gap-1.5 rounded-lg border px-1.5 py-0.5 text-[9px] font-semibold cursor-pointer truncate shadow-2xs transition ${style.bg} ${style.text}`}
                      title={`${l.employeeName}: ${LEAVE_TYPE_LABELS[l.leaveType]}`}
                    >
                      <span className={`size-1.5 rounded-full shrink-0 ${style.dot}`} />
                      <span className="truncate">
                        {l.employeeName.split(" ")[0]} ({LEAVE_TYPE_LABELS[l.leaveType].split(" ")[0]})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LeaveCalendar;
