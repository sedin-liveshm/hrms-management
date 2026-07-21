import { Badge } from "@/components/ui/badge";
import { AttendanceStatus } from "@/types/attendance";
import { cn } from "@/lib/utils";

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
}

export function AttendanceStatusBadge({ status, className }: AttendanceStatusBadgeProps) {
  const statusStyles: Record<AttendanceStatus, string> = {
    [AttendanceStatus.PRESENT]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50",
    [AttendanceStatus.ABSENT]: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200/50",
    [AttendanceStatus.LATE]: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50",
    [AttendanceStatus.HALF_DAY]: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200/50",
    [AttendanceStatus.WORK_FROM_HOME]: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50",
    [AttendanceStatus.LEAVE]: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-200/50",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border capitalize px-2 py-0.5 rounded-full text-xs shadow-none tracking-wide transition-colors",
        statusStyles[status] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {status}
    </Badge>
  );
}
