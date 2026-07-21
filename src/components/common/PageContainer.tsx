
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main
      className={cn(
        "page-fade-in flex flex-col gap-6 p-6 md:p-8",
        className
      )}
    >
      {children}
    </main>
  );
}
