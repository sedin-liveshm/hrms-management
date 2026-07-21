import { StatCard } from "@/components/common";
import type { LeaveSummary as LeaveSummaryType } from "@/types/leave";
import { FileText, CheckCircle2, Clock, XCircle, Umbrella } from "lucide-react";

interface LeaveSummaryProps {
  summary: LeaveSummaryType | null;
  isLoading?: boolean;
  showRemaining?: boolean;
}

export function LeaveSummary({
  summary,
  isLoading = false,
  showRemaining = true,
}: LeaveSummaryProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].slice(0, showRemaining ? 5 : 4).map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  // Define summary cards configuration
  const cards = [
    {
      label: "Total Requests",
      value: summary.totalLeaves,
      icon: FileText,
      color: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20",
    },
    {
      label: "Approved",
      value: summary.approved,
      icon: CheckCircle2,
      color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20",
    },
    {
      label: "Pending Approvals",
      value: summary.pending,
      icon: Clock,
      color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20",
    },
    {
      label: "Rejected",
      value: summary.rejected,
      icon: XCircle,
      color: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20",
    },
  ];

  const gridCols = showRemaining 
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" 
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid gap-4 ${gridCols}`}>
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          iconClassName={card.color}
        />
      ))}

      {showRemaining && (
        <StatCard
          label="Total Balance Remaining"
          value={`${summary.remainingLeaves} Days`}
          icon={Umbrella}
          iconClassName="bg-primary/10 text-primary dark:bg-primary/20"
          trend={{
            value: "Paid Leaves Only",
            direction: "neutral",
            label: "excluding LOP/WFH",
          }}
        />
      )}
    </div>
  );
}

export default LeaveSummary;
