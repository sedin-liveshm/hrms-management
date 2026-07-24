"use client";

import React, { useMemo } from "react";
import { format, addDays } from "date-fns";
import { Copy, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { TimesheetLog } from "@/types/timesheet";
import { cn } from "@/lib/utils";

interface WeeklyGridProps {
  logs: TimesheetLog[];
  currentWeekStart: Date;
  onUpdateLog: (logId: string | null, date: string, project: string, task: string, hours: number, comments: string) => void;
  onDeleteRow: (project: string, task: string) => void;
  onAddNewRow: () => void;
  isSubmitting: boolean;
  submissionStatus?: string;
}

export function WeeklyTimesheetGrid({
  logs,
  currentWeekStart,
  onUpdateLog,
  onDeleteRow,
  onAddNewRow,
  isSubmitting,
  submissionStatus,
}: WeeklyGridProps) {
  const isLocked =
    submissionStatus === "Pending Manager" ||
    submissionStatus === "Pending HR" ||
    submissionStatus === "Approved";

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(currentWeekStart, i);
      return {
        dateObj: d,
        dateStr: format(d, "yyyy-MM-dd"),
        dayName: format(d, "EEE").toUpperCase(),
        dayDate: format(d, "dd MMM"),
      };
    });
  }, [currentWeekStart]);

  const rows = useMemo(() => {
    const rowMap = new Map<string, { project: string; task: string; logsByDate: Record<string, TimesheetLog> }>();
    
    // Only process logs that belong to the current week's days
    const validDateStrs = new Set(weekDays.map(d => d.dateStr));

    logs.forEach((log) => {
      if (!validDateStrs.has(log.date)) return;

      const key = `${log.project}|${log.task}`;
      if (!rowMap.has(key)) {
        rowMap.set(key, { project: log.project, task: log.task, logsByDate: {} });
      }
      rowMap.get(key)!.logsByDate[log.date] = log;
    });
    return Array.from(rowMap.values());
  }, [logs, weekDays]);

  const colTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    weekDays.forEach((day) => {
      totals[day.dateStr] = logs
        .filter((l) => l.date === day.dateStr)
        .reduce((sum, l) => sum + (Number(l.hours) || 0), 0);
    });
    return totals;
  }, [logs, weekDays]);

  const grandTotal = Object.values(colTotals).reduce((sum, h) => sum + h, 0);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-foreground">Weekly Timesheet</h3>
          {submissionStatus && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                isLocked
                  ? "text-amber-600 border-amber-600/30"
                  : "text-emerald-600 border-emerald-600/30"
              )}
            >
              {submissionStatus}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="text-muted-foreground">Total Hours:</span>
          <span className={cn("font-bold text-lg", grandTotal < 40 ? "text-amber-600" : "text-emerald-600")}>
            {grandTotal} / 40
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold border-b border-r border-border w-[250px]">
                Project / Task
              </th>
              {weekDays.map((day) => (
                <th
                  key={day.dateStr}
                  className="px-2 py-3 font-semibold border-b border-r border-border text-center w-[100px]"
                >
                  <div>{day.dayDate}</div>
                  <div className="text-[10px] mt-0.5">{day.dayName}</div>
                </th>
              ))}
              <th className="px-4 py-3 font-semibold border-b border-border text-center w-[80px]">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                  No projects added to this week's timesheet yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                let rowTotal = 0;
                return (
                  <tr
                    key={`${row.project}|${row.task}`}
                    className="border-b border-border hover:bg-muted/20 transition-colors group"
                  >
                    {/* Project + Task label */}
                    <td className="px-4 py-3 border-r border-border align-top">
                      <div
                        className="font-semibold text-foreground truncate max-w-[220px]"
                        title={row.project}
                      >
                        {row.project}
                      </div>
                      <div
                        className="text-xs text-muted-foreground mt-1 truncate max-w-[220px]"
                        title={row.task}
                      >
                        {row.task}
                      </div>
                      {!isLocked && (
                        <button
                          onClick={() => onDeleteRow(row.project, row.task)}
                          className="mt-2 text-destructive/70 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </td>

                    {/* Day cells */}
                    {weekDays.map((day) => {
                      const log = row.logsByDate[day.dateStr];
                      rowTotal += Number(log?.hours || 0);
                      return (
                        <TimesheetCell
                          key={day.dateStr}
                          log={log}
                          dayDateStr={day.dateStr}
                          project={row.project}
                          task={row.task}
                          isLocked={isLocked}
                          isSubmitting={isSubmitting}
                          onUpdateLog={onUpdateLog}
                        />
                      );
                    })}

                    {/* Row total */}
                    <td className="px-4 py-3 text-center font-bold text-foreground bg-muted/10 align-top">
                      {rowTotal}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-muted/50 font-bold text-foreground">
            <tr>
              <td className="px-4 py-3 border-r border-border text-right">Daily Totals:</td>
              {weekDays.map((day) => (
                <td
                  key={day.dateStr}
                  className={cn(
                    "px-2 py-3 border-r border-border text-center",
                    colTotals[day.dateStr] > 24 ? "text-destructive" : ""
                  )}
                >
                  {colTotals[day.dateStr] || 0}
                </td>
              ))}
              <td className="px-4 py-3 text-center bg-primary/10 text-primary">{grandTotal}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {!isLocked && (
        <div className="p-3 border-t border-border flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={onAddNewRow}
            disabled={isSubmitting}
          >
            <PlusCircle className="size-4 mr-1.5" /> Add Row
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground hover:text-foreground"
            disabled={isSubmitting}
          >
            <Copy className="size-4 mr-1.5" /> Copy Last Week
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Isolated cell component — uses local state so typing is instant,
//    and only fires the save callback on blur (when user leaves the field).
function TimesheetCell({
  log,
  dayDateStr,
  project,
  task,
  isLocked,
  isSubmitting,
  onUpdateLog,
}: {
  log?: TimesheetLog;
  dayDateStr: string;
  project: string;
  task: string;
  isLocked: boolean;
  isSubmitting: boolean;
  onUpdateLog: (logId: string | null, date: string, project: string, task: string, hours: number, comments: string) => void;
}) {
  const [localHours, setLocalHours] = React.useState<string | number>(log?.hours ?? "");
  const [localComments, setLocalComments] = React.useState(log?.comments || "");

  // Sync if parent data changes (e.g. week navigation)
  React.useEffect(() => {
    setLocalHours(log?.hours ?? "");
    setLocalComments(log?.comments || "");
  }, [log?.hours, log?.comments, log?.id]);

  const handleBlur = () => {
    let num = parseFloat(String(localHours));
    if (isNaN(num)) num = 0;
    if (num > 24) {
      num = 24;
      setLocalHours(24);
    }
    const prevHours = log?.hours || 0;
    const prevComments = log?.comments || "";
    // Only save if something actually changed
    if (num !== prevHours || localComments !== prevComments) {
      onUpdateLog(log?.id || null, dayDateStr, project, task, num, localComments);
    }
  };

  return (
    <td className="px-2 py-2 border-r border-border align-top text-center bg-background focus-within:bg-primary/5 transition-colors">
      <div className="flex flex-col items-center gap-1 w-full mx-auto" style={{ minWidth: 80 }}>
        {/* Hours input */}
        <Input
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={localHours}
          disabled={isLocked || isSubmitting}
          onChange={(e) => setLocalHours(e.target.value)}
          onBlur={handleBlur}
          className="h-8 w-16 mx-auto text-center p-1 rounded-md border-transparent hover:border-input focus:border-primary shadow-none bg-transparent font-mono text-sm"
          placeholder="0.0"
        />
        {/* Comment input — always visible */}
        <input
          type="text"
          value={localComments}
          disabled={isLocked || isSubmitting}
          placeholder="Comment..."
          onChange={(e) => setLocalComments(e.target.value)}
          onBlur={handleBlur}
          title={localComments || undefined}
          className="w-full text-[10px] h-6 px-1.5 border border-transparent hover:border-input focus:border-primary rounded bg-transparent focus:bg-background outline-none transition-colors placeholder:text-muted-foreground/50 truncate"
        />
      </div>
    </td>
  );
}
