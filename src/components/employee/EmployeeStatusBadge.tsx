import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EmployeeStatusBadgeProps {
    status: "active" | "inactive" | "on-leave";
    className?: string;
}

export function EmployeeStatusBadge({ status, className }: EmployeeStatusBadgeProps) {
    const labelMap = {
        "active": "Active",
        "inactive": "Inactive",
        "on-leave": "On Leave",
    };

    const styleMap = {
        "active": "bg-primary/10 text-primary hover:bg-primary/20 border-0",
        "inactive": "bg-destructive/10 text-destructive hover:bg-destructive/20 border-0",
        "on-leave": "bg-amber-100 text-amber-700 hover:bg-amber-200 border-0",
    };

    return (
        <Badge
            variant="outline"
            className={cn(
                "rounded-md px-2 py-0.5 text-xs font-medium transition-colors select-none",
                styleMap[status],
                className
            )}
        >
            {labelMap[status] || status}
        </Badge>
    );
}
