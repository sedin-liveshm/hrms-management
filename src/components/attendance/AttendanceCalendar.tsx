"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AttendanceStatus, type AttendanceRecord } from "@/types/attendance";
import { cn } from "@/lib/utils";

interface AttendanceCalendarProps {
  data: AttendanceRecord[];
  isLoading?: boolean;
}

export function AttendanceCalendar({ data, isLoading = false }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Navigate to previous month
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Compute calendar grid days
  const calendarDays = useMemo(() => {
    // Total days in the current month
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Starting day of the week (0 = Sun, 1 = Mon, etc.)
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    const days = [];

    // Pad starting days from previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, dateStr: null, isWeekend: false });
    }

    // Populate active days of current month
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const tempDate = new Date(currentYear, currentMonth, day);
      const dayOfWeek = tempDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      days.push({
        day,
        dateStr,
        isWeekend,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Index attendance data by YYYY-MM-DD for fast O(1) lookups
  const recordsMap = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {};
    data.forEach((rec) => {
      map[rec.date] = rec;
    });
    return map;
  }, [data]);

  // Color mappings for calendar cell status indication
  const cellStyles: Record<AttendanceStatus, { bg: string; text: string; dot: string }> = {
    [AttendanceStatus.PRESENT]: {
      bg: "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
      text: "text-emerald-900 dark:text-emerald-300",
      dot: "bg-emerald-500",
    },
    [AttendanceStatus.LATE]: {
      bg: "bg-amber-50 hover:bg-amber-100/80 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
      text: "text-amber-900 dark:text-amber-300",
      dot: "bg-amber-500",
    },
    [AttendanceStatus.WORK_FROM_HOME]: {
      bg: "bg-blue-50 hover:bg-blue-100/80 border-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
      text: "text-blue-900 dark:text-blue-300",
      dot: "bg-blue-500",
    },
    [AttendanceStatus.HALF_DAY]: {
      bg: "bg-indigo-50 hover:bg-indigo-100/80 border-indigo-100 text-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30",
      text: "text-indigo-900 dark:text-indigo-300",
      dot: "bg-indigo-500",
    },
    [AttendanceStatus.ABSENT]: {
      bg: "bg-rose-50 hover:bg-rose-100/80 border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
      text: "text-rose-900 dark:text-rose-300",
      dot: "bg-rose-500",
    },
    [AttendanceStatus.LEAVE]: {
      bg: "bg-purple-50 hover:bg-purple-100/80 border-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30",
      text: "text-purple-900 dark:text-purple-300",
      dot: "bg-purple-500",
    },
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <TooltipProvider>
      <Card className="border border-border bg-white shadow-sm dark:bg-card">
        {/* Header month switcher */}
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-5 text-primary" />
            <CardTitle className="text-base font-bold text-foreground">
              {monthNames[currentMonth]} {currentYear}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="size-8 rounded-lg hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="size-8 rounded-lg hover:bg-muted"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
              <span
                key={day}
                className={cn(
                  "text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-1",
                  (idx === 0 || idx === 6) && "text-muted-foreground/60"
                )}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Monthly grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell, idx) => {
              const record = cell.dateStr ? recordsMap[cell.dateStr] : null;
              const hasRecord = !!record;
              const style = record ? cellStyles[record.status] : null;
              const isToday = cell.dateStr === new Date().toISOString().split("T")[0];

              // Cell with no day (padding at start)
              if (cell.day === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="aspect-square rounded-xl bg-muted/20 border border-transparent"
                  />
                );
              }

              // Base styles for the cell
              const cellBaseClass = cn(
                "aspect-square flex flex-col items-center justify-between p-1.5 rounded-xl border transition-all duration-200 text-xs font-semibold select-none relative group",
                isToday && "ring-2 ring-primary ring-offset-2 dark:ring-offset-card",
                hasRecord
                  ? style?.bg
                  : cell.isWeekend
                  ? "bg-muted/15 border-transparent text-muted-foreground/50"
                  : "bg-transparent border-border/40 hover:bg-muted/10 text-muted-foreground/80"
              );

              // Inside trigger
              const cellContent = (
                <div className={cellBaseClass}>
                  <span className="self-start text-[10px] tabular-nums">{cell.day}</span>
                  {hasRecord && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className={cn("size-1.5 rounded-full shrink-0", style?.dot)} />
                      <span className="text-[9px] uppercase tracking-wider scale-[0.9] origin-bottom-left truncate max-w-12 text-muted-foreground">
                        {record.status === AttendanceStatus.WORK_FROM_HOME ? "WFH" : record.status}
                      </span>
                    </div>
                  )}
                </div>
              );

              // If there is an attendance record, wrap with Tooltip details
              if (hasRecord) {
                return (
                  <Tooltip key={cell.dateStr}>
                    <TooltipTrigger>
                      <div className="cursor-pointer">{cellContent}</div>
                    </TooltipTrigger>
                    <TooltipContent className="p-3 bg-card border border-border rounded-xl shadow-lg max-w-xs text-foreground font-medium">
                      <div className="flex flex-col gap-1.5 text-xs">
                        <div className="flex items-center justify-between border-b border-border pb-1">
                          <span className="font-bold text-muted-foreground">
                            {new Date(record.date).toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span className="font-bold uppercase tracking-wider text-[9px] text-primary">
                            {record.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <span className="text-muted-foreground">Check In:</span>
                          <span className="text-right font-semibold">{formatTime(record.checkIn)}</span>
                          <span className="text-muted-foreground">Check Out:</span>
                          <span className="text-right font-semibold">{formatTime(record.checkOut)}</span>
                          <span className="text-muted-foreground border-t border-dashed border-border/80 pt-1 mt-0.5">
                            Duration:
                          </span>
                          <span className="text-right font-extrabold text-foreground border-t border-dashed border-border/80 pt-1 mt-0.5">
                            {record.totalHours !== null ? `${record.totalHours} hrs` : "—"}
                          </span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              // Non-record cell
              return (
                <div key={cell.dateStr} className={cellBaseClass}>
                  <span className="self-start text-[10px] tabular-nums">{cell.day}</span>
                  {cell.isWeekend && (
                    <span className="text-[8px] uppercase tracking-wider text-muted-foreground/30 mt-1">
                      Wknd
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Color legends */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border mt-4 pt-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>Present</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" />
              <span>Late</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-500" />
              <span>WFH</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-indigo-500" />
              <span>Half Day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500" />
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-purple-500" />
              <span>Leave</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
