import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}


export function AuthCard({ children, className, ...props }: AuthCardProps) {
  return (
    <Card
      className={cn(
        "border-border bg-card rounded-xl shadow-sm transition-all duration-200",
        className
      )}
      {...props}
    >
      <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
        {children}
      </CardContent>
    </Card>
  );
}
