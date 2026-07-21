import { Badge } from "@/components/ui/badge";
import type { LeaveStatus } from "@/types/leave";

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
  className?: string;
}

export function LeaveStatusBadge({ status, className }: LeaveStatusBadgeProps) {
  const config = {
    pending: {
      label: "Pending",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400",
    },
    approved: {
      label: "Approved",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400",
    },
    rejected: {
      label: "Rejected",
      className: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700",
    },
  };

  const current = config[status] || {
    label: status,
    className: "bg-neutral-100 text-neutral-500 border-neutral-200",
  };

  return (
    <Badge variant="outline" className={`${current.className} font-semibold capitalize ${className || ""}`}>
      {current.label}
    </Badge>
  );
}

export default LeaveStatusBadge;
