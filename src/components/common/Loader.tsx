
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageLoader() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
       {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Section card skeleton */}
      <SectionCardSkeleton rows={5} />
    </div>
  );
}


// ─── Section Card Skeleton ────────────────────────────────────────────────────
export function SectionCardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-6">
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="flex flex-col gap-4 p-6">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Inline Loader ────────────────────────────────────────────────────────────
// Simple spinner for button loading states or small components
interface InlineLoaderProps {
  className?: string;
}

export function InlineLoader({ className }: InlineLoaderProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("flex items-center justify-center py-8", className)}
    >
      <div className="size-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
