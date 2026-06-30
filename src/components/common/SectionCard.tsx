import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  noPadding = false,
}: SectionCardProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold text-foreground">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </div>
        {action && (
          <div className="flex shrink-0 items-center">{action}</div>
        )}
      </CardHeader>
      <CardContent className={cn(noPadding && "p-0 pt-0")}>{children}</CardContent>
    </Card>
  );
}
