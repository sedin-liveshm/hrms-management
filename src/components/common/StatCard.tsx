
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

type TrendDirection = "up" | "down" | "neutral";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: TrendDirection;
    label?: string;
  };
  iconClassName?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  iconClassName,
  className,
}: StatCardProps) {
  const trendColors: Record<TrendDirection, string> = {
    up: "text-primary",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className={cn("shadow-sm transition-shadow hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  trendColors[trend.direction]
                )}
                aria-label={`${trend.direction === "up" ? "Increased" : trend.direction === "down" ? "Decreased" : "No change"} by ${trend.value}${trend.label ? ` ${trend.label}` : ""}`}
              >
                {trend.direction === "up" && (
                  <TrendingUp className="size-3.5" />
                )}
                {trend.direction === "down" && (
                  <TrendingDown className="size-3.5" />
                )}
                <span>{trend.value}</span>
                {trend.label && (
                  <span className="text-muted-foreground">{trend.label}</span>
                )}
              </div>
            )}
          </div>
          
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary",
              iconClassName
            )}
          >
            <Icon className="size-6" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
