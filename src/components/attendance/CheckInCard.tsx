"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CheckInCardProps {
  onCheckIn: () => Promise<void>;
  isLoading: boolean;
}

export function CheckInCard({ onCheckIn, isLoading }: CheckInCardProps) {
  const [time, setTime] = useState<Date | null>(null);

  // Set initial time on mount, and run dynamic ticking
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimeString = (date: Date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDateString = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="overflow-hidden border-border bg-white shadow-sm transition-all hover:shadow-md dark:bg-card">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-50 text-amber-600 border border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400">
                Not Checked In
              </Badge>
              <span className="text-xs text-muted-foreground">Today's Shift: 09:00 AM - 06:00 PM</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Good day! Ready to start?
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4 text-primary" />
                <span>{time ? formatDateString(time) : "Loading date..."}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center md:items-end">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Current Time
              </span>
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-primary animate-pulse" />
                <span className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground sm:text-3xl">
                  {time ? formatTimeString(time) : "00:00:00 AM"}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              disabled={isLoading || !time}
              onClick={onCheckIn}
              className="w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/95 transition-all hover:translate-y-[-1px] active:translate-y-[0px] shadow-sm sm:w-auto px-6 py-5 h-auto text-base rounded-xl"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Checking In...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 size-5" />
                  Check In
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
