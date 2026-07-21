"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Clock, Timer, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";
import type { AttendanceRecord } from "@/types/attendance";

interface CheckOutCardProps {
  record: AttendanceRecord;
  onCheckOut: () => Promise<void>;
  isLoading: boolean;
}

export function CheckOutCard({ record, onCheckOut, isLoading }: CheckOutCardProps) {
  const [elapsed, setElapsed] = useState("00h 00m 00s");

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (!record || !record.checkIn || record.checkOut) return;

    const checkInTime = new Date(record.checkIn).getTime();

    const updateElapsed = () => {
      const diff = Date.now() - checkInTime;
      if (diff < 0) {
        setElapsed("00h 00m 00s");
        return;
      }
      const secs = Math.floor(diff / 1000) % 60;
      const mins = Math.floor(diff / (1000 * 60)) % 60;
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      setElapsed(
        `${String(hrs).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`
      );
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [record]);

  const isCheckedOut = !!record.checkOut;

  return (
    <Card className="overflow-hidden border-border bg-white shadow-sm transition-all hover:shadow-md dark:bg-card">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {isCheckedOut ? (
                <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400">
                  Shift Completed
                </Badge>
              ) : (
                <Badge className="bg-primary/10 text-primary border border-primary/20 animate-pulse">
                  Checked In (Active)
                </Badge>
              )}
              <AttendanceStatusBadge status={record.status} />
            </div>
            
            <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              {isCheckedOut ? "Great job! You are all set for the day." : "You are currently checked in."}
            </h2>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="size-4 text-primary" />
                <span>Check In: <strong className="text-foreground">{formatTime(record.checkIn)}</strong></span>
              </div>
              {isCheckedOut && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>Check Out: <strong className="text-foreground">{formatTime(record.checkOut)}</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center md:items-end">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {isCheckedOut ? "Total Hours Worked" : "Active Working Duration"}
              </span>
              <div className="flex items-center gap-2">
                <Timer className="size-5 text-primary" />
                <span className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-3xl">
                  {isCheckedOut ? `${record.totalHours} hrs` : elapsed}
                </span>
              </div>
            </div>

            {!isCheckedOut && (
              <Button
                size="lg"
                disabled={isLoading}
                onClick={onCheckOut}
                className="w-full bg-destructive text-white hover:bg-destructive/90 transition-all hover:translate-y-[-1px] active:translate-y-[0px] shadow-sm sm:w-auto px-6 py-5 h-auto text-base rounded-xl border border-destructive/10"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Checking Out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 size-5" />
                    Check Out
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
