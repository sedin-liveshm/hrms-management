import { StatCard } from "@/components/common";
import { LEAVE_TYPE_LABELS, type LeaveBalance, type LeaveType } from "@/types/leave";
import { Umbrella, HeartPulse, CheckSquare, Sparkles } from "lucide-react";

interface LeaveBalanceCardProps {
  balances: Record<LeaveType, LeaveBalance> | null;
  isLoading?: boolean;
}

export function LeaveBalanceCard({ balances, isLoading = false }: LeaveBalanceCardProps) {
  if (isLoading || !balances) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  // We display the core leave types in detail: sick, casual, earned, compOff
  const displayTypes: { type: LeaveType; icon: any; color: string }[] = [
    { type: "earned", icon: Umbrella, color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20" },
    { type: "sick", icon: HeartPulse, color: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20" },
    { type: "casual", icon: Sparkles, color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20" },
    { type: "compOff", icon: CheckSquare, color: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {displayTypes.map(({ type, icon, color }) => {
        const bal = balances[type] || { allocated: 0, used: 0, remaining: 0 };
        return (
          <StatCard
            key={type}
            label={LEAVE_TYPE_LABELS[type]}
            value={`${bal.remaining} Days`}
            icon={icon}
            iconClassName={color}
            trend={{
              value: `${bal.used} Used`,
              direction: "neutral",
              label: `of ${bal.allocated} allocated`,
            }}
          />
        );
      })}
    </div>
  );
}

export default LeaveBalanceCard;
